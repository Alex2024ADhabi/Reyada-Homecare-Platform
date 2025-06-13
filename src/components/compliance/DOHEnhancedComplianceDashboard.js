import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { CheckCircle, AlertTriangle, XCircle, Shield, FileText, BarChart3, Target, RefreshCw, Download, Calendar, Award, Network, AlertOctagon, } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { dohEnhancedComplianceService } from "@/services/doh-enhanced-compliance.service";
import { dohComplianceValidatorService } from "@/services/doh-compliance-validator.service";
export default function DOHEnhancedComplianceDashboard({ facilityId = "RHHCS-001", showHeader = true, }) {
    const [complianceData, setComplianceData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");
    const [selectedFinding, setSelectedFinding] = useState(null);
    useEffect(() => {
        loadComplianceData();
    }, [facilityId]);
    const loadComplianceData = async () => {
        try {
            setLoading(true);
            const result = await dohEnhancedComplianceService.performEnhancedComplianceAssessment(facilityId);
            setComplianceData(result);
        }
        catch (error) {
            console.error("Error loading enhanced compliance data:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const generateReport = async () => {
        try {
            setLoading(true);
            const report = await dohEnhancedComplianceService.generateComplianceReport(facilityId);
            // Download report
            const blob = new Blob([report.executiveSummary], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `DOH_Enhanced_Compliance_Report_${new Date().toISOString().split("T")[0]}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
        catch (error) {
            console.error("Error generating report:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const getStatusBadge = (status) => {
        const variants = {
            compliant: "bg-green-100 text-green-800",
            non_compliant: "bg-red-100 text-red-800",
            needs_improvement: "bg-yellow-100 text-yellow-800",
        };
        return (_jsx(Badge, { className: variants[status], children: status.replace("_", " ").toUpperCase() }));
    };
    const getSeverityIcon = (severity) => {
        switch (severity) {
            case "critical":
                return _jsx(XCircle, { className: "w-4 h-4 text-red-500" });
            case "high":
                return _jsx(AlertTriangle, { className: "w-4 h-4 text-orange-500" });
            case "medium":
                return _jsx(AlertTriangle, { className: "w-4 h-4 text-yellow-500" });
            case "low":
                return _jsx(CheckCircle, { className: "w-4 h-4 text-blue-500" });
            default:
                return _jsx(CheckCircle, { className: "w-4 h-4 text-gray-500" });
        }
    };
    const getSeverityColor = (severity) => {
        switch (severity) {
            case "critical":
                return "text-red-600 bg-red-100 border-red-200";
            case "high":
                return "text-orange-600 bg-orange-100 border-orange-200";
            case "medium":
                return "text-yellow-600 bg-yellow-100 border-yellow-200";
            case "low":
                return "text-blue-600 bg-blue-100 border-blue-200";
            default:
                return "text-gray-600 bg-gray-100 border-gray-200";
        }
    };
    if (loading && !complianceData) {
        return (_jsxs("div", { className: "flex items-center justify-center py-8 bg-white", children: [_jsx(RefreshCw, { className: "w-6 h-6 animate-spin mr-2" }), _jsx("span", { children: "Loading enhanced compliance data..." })] }));
    }
    return (_jsx("div", { className: "min-h-screen bg-gray-50 p-6", children: _jsxs("div", { className: "max-w-7xl mx-auto space-y-6", children: [showHeader && (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "DOH Enhanced Compliance Dashboard" }), _jsxs("p", { className: "text-gray-600 mt-1", children: ["Comprehensive DOH CN_48/2025 compliance monitoring -", " ", facilityId] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [complianceData && (_jsx(Badge, { className: complianceData.overallCompliance
                                        ? "text-green-600 bg-green-100"
                                        : "text-red-600 bg-red-100", children: complianceData.overallCompliance
                                        ? "COMPLIANT"
                                        : "NON-COMPLIANT" })), _jsxs(Badge, { variant: "outline", className: "flex items-center gap-1", children: [_jsx(Shield, { className: "w-3 h-3" }), "CN_48/2025"] }), _jsxs(Button, { onClick: loadComplianceData, variant: "outline", size: "sm", disabled: loading, children: [_jsx(RefreshCw, { className: `w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}` }), "Refresh"] }), _jsxs(Button, { onClick: generateReport, variant: "outline", size: "sm", disabled: loading, children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Export Report"] })] })] })), complianceData && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs(Card, { className: "border-blue-200 bg-blue-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium text-blue-800 flex items-center gap-2", children: [_jsx(Target, { className: "w-4 h-4" }), "Overall Compliance"] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold text-blue-900", children: [complianceData.complianceScore, "%"] }), _jsx(Progress, { value: complianceData.complianceScore, className: "h-2 mt-2" }), _jsxs("p", { className: "text-xs text-blue-600 mt-1", children: [complianceData.regulatoryVersion, " Standards"] })] })] }), _jsxs(Card, { className: "border-green-200 bg-green-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium text-green-800 flex items-center gap-2", children: [_jsx(Award, { className: "w-4 h-4" }), "Audit Readiness"] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold text-green-900", children: [complianceData.auditReadiness, "%"] }), _jsx(Progress, { value: complianceData.auditReadiness, className: "h-2 mt-2" }), _jsx("p", { className: "text-xs text-green-600 mt-1", children: "Ready for DOH audit" })] })] }), _jsxs(Card, { className: "border-red-200 bg-red-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium text-red-800 flex items-center gap-2", children: [_jsx(AlertTriangle, { className: "w-4 h-4" }), "Critical Findings"] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-red-900", children: complianceData.criticalFindings.length }), _jsx("p", { className: "text-xs text-red-600", children: "Require immediate attention" })] })] }), _jsxs(Card, { className: "border-purple-200 bg-purple-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium text-purple-800 flex items-center gap-2", children: [_jsx(Calendar, { className: "w-4 h-4" }), "Next Assessment"] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-sm font-bold text-purple-900", children: new Date(complianceData.nextAssessmentDue).toLocaleDateString() }), _jsx("p", { className: "text-xs text-purple-600 mt-1", children: "Scheduled assessment" })] })] })] }), complianceData.overallCompliance ? (_jsxs(Alert, { className: "border-green-200 bg-green-50", children: [_jsx(CheckCircle, { className: "h-4 w-4 text-green-600" }), _jsx(AlertTitle, { className: "text-green-800", children: "DOH Compliance Achieved" }), _jsx(AlertDescription, { className: "text-green-700", children: "All critical DOH requirements have been met. The facility is compliant with CN_48/2025 standards and ready for regulatory audit." })] })) : (_jsxs(Alert, { className: "border-red-200 bg-red-50", children: [_jsx(AlertTriangle, { className: "h-4 w-4 text-red-600" }), _jsx(AlertTitle, { className: "text-red-800", children: "Compliance Issues Identified" }), _jsxs(AlertDescription, { className: "text-red-700", children: [complianceData.criticalFindings.length, " critical findings require immediate attention to achieve DOH compliance."] })] })), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "space-y-6", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-7", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "domains", children: "Domains" }), _jsx(TabsTrigger, { value: "findings", children: "Findings" }), _jsx(TabsTrigger, { value: "testing", children: "Phase 2 Testing" }), _jsx(TabsTrigger, { value: "integration", children: "Integration Testing" }), _jsx(TabsTrigger, { value: "recommendations", children: "Recommendations" }), _jsx(TabsTrigger, { value: "timeline", children: "Timeline" })] }), _jsx(TabsContent, { value: "overview", className: "space-y-6", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Domain Compliance Scores" }), _jsx(CardDescription, { children: "Performance across all DOH compliance domains" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: Object.entries(complianceData.domains).map(([domain, data]) => (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium capitalize", children: domain
                                                                                    .replace(/([A-Z])/g, " $1")
                                                                                    .toLowerCase() }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "text-sm font-medium", children: [data.score, "%"] }), getStatusBadge(data.status)] })] }), _jsx(Progress, { value: data.score, className: "h-2" })] }, domain))) }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Recent Assessment Summary" }), _jsx(CardDescription, { children: "Key metrics from the latest compliance assessment" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center p-3 bg-gray-50 rounded-lg", children: [_jsx("span", { className: "text-sm font-medium", children: "Assessment Date" }), _jsx("span", { className: "text-sm", children: new Date(complianceData.assessmentTimestamp).toLocaleDateString() })] }), _jsxs("div", { className: "flex justify-between items-center p-3 bg-gray-50 rounded-lg", children: [_jsx("span", { className: "text-sm font-medium", children: "Regulatory Version" }), _jsx("span", { className: "text-sm", children: complianceData.regulatoryVersion })] }), _jsxs("div", { className: "flex justify-between items-center p-3 bg-gray-50 rounded-lg", children: [_jsx("span", { className: "text-sm font-medium", children: "Total Recommendations" }), _jsx("span", { className: "text-sm", children: complianceData.recommendations.length })] }), _jsxs("div", { className: "flex justify-between items-center p-3 bg-gray-50 rounded-lg", children: [_jsx("span", { className: "text-sm font-medium", children: "Compliance Status" }), getStatusBadge(complianceData.overallCompliance
                                                                            ? "compliant"
                                                                            : "non_compliant")] })] }) })] })] }) }), _jsx(TabsContent, { value: "domains", className: "space-y-6", children: _jsx("div", { className: "grid grid-cols-1 gap-6", children: Object.entries(complianceData.domains).map(([domainName, domainData]) => (_jsxs(Card, { className: "border-l-4 border-l-blue-400", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: "capitalize", children: domainName
                                                                            .replace(/([A-Z])/g, " $1")
                                                                            .toLowerCase() }), _jsxs(CardDescription, { children: ["Last assessed:", " ", new Date(domainData.lastAssessed).toLocaleDateString()] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "text-lg font-bold", children: [domainData.score, "%"] }), getStatusBadge(domainData.status)] })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsx(Progress, { value: domainData.score, className: "h-3" }), domainData.findings.length > 0 && (_jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-2", children: "Domain Findings:" }), _jsx("div", { className: "space-y-2", children: domainData.findings.map((finding) => (_jsxs("div", { className: "flex items-start gap-2 p-2 bg-gray-50 rounded", children: [getSeverityIcon(finding.severity), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-medium", children: finding.description }), _jsx("p", { className: "text-xs text-gray-600", children: finding.regulation })] }), _jsx(Badge, { className: getSeverityColor(finding.severity), children: finding.severity })] }, finding.id))) })] }))] }) })] }, domainName))) }) }), _jsx(TabsContent, { value: "findings", className: "space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Critical Compliance Findings" }), _jsx(CardDescription, { children: "Issues requiring immediate attention for DOH compliance" })] }), _jsx(CardContent, { children: complianceData.criticalFindings.length === 0 ? (_jsxs("div", { className: "text-center py-8", children: [_jsx(CheckCircle, { className: "w-12 h-12 mx-auto text-green-500 mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No Critical Findings" }), _jsx("p", { className: "text-gray-600", children: "All critical compliance requirements are being met." })] })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Finding ID" }), _jsx(TableHead, { children: "Category" }), _jsx(TableHead, { children: "Description" }), _jsx(TableHead, { children: "Severity" }), _jsx(TableHead, { children: "Timeline" }), _jsx(TableHead, { children: "Responsible" }), _jsx(TableHead, { children: "Status" })] }) }), _jsx(TableBody, { children: complianceData.criticalFindings.map((finding) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: finding.id }), _jsx(TableCell, { children: finding.category }), _jsx(TableCell, { children: _jsxs("div", { className: "max-w-xs", children: [_jsx("p", { className: "text-sm", children: finding.description }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: finding.regulation })] }) }), _jsx(TableCell, { children: _jsx(Badge, { className: getSeverityColor(finding.severity), children: finding.severity }) }), _jsx(TableCell, { children: finding.timeline }), _jsx(TableCell, { children: finding.responsible }), _jsx(TableCell, { children: _jsx(Badge, { variant: "outline", children: finding.status.replace("_", " ") }) })] }, finding.id))) })] }) })) })] }) }), _jsxs(TabsContent, { value: "testing", className: "space-y-6", children: [_jsx(Phase2TestingResults, { facilityId: facilityId }), _jsx(DigitalFormsValidationResults, { facilityId: facilityId }), _jsx(JAWDAKPIAutomationTestingResults, { facilityId: facilityId })] }), _jsx(TabsContent, { value: "integration", className: "space-y-6", children: _jsx(MalaffiEMRIntegrationTestingResults, { facilityId: facilityId }) }), _jsx(TabsContent, { value: "recommendations", className: "space-y-6", children: _jsx("div", { className: "space-y-4", children: complianceData.recommendations.map((recommendation, index) => (_jsx(Card, { className: "border-l-4 border-l-blue-400", children: _jsxs(CardContent, { className: "pt-4", children: [_jsxs("div", { className: "flex justify-between items-start mb-2", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "font-semibold text-lg", children: recommendation.title }), _jsx("p", { className: "text-sm text-gray-600 mb-3", children: recommendation.description }), _jsxs("div", { className: "flex items-center gap-4 text-sm", children: [_jsxs("span", { children: ["Category: ", recommendation.category] }), _jsxs("span", { children: ["Timeline: ", recommendation.timeline] }), _jsxs("span", { children: ["Effort: ", recommendation.estimatedEffort] })] })] }), _jsx(Badge, { className: getSeverityColor(recommendation.priority), children: recommendation.priority })] }), _jsxs("div", { className: "mt-4", children: [_jsx("h5", { className: "font-medium mb-2", children: "Expected Benefits:" }), _jsx("ul", { className: "list-disc list-inside text-sm text-gray-600 space-y-1", children: recommendation.benefits.map((benefit, idx) => (_jsx("li", { children: benefit }, idx))) })] })] }) }, index))) }) }), _jsx(TabsContent, { value: "timeline", className: "space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Compliance Timeline" }), _jsx(CardDescription, { children: "Key dates and milestones for DOH compliance" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center gap-4 p-4 border rounded-lg", children: [_jsx(Calendar, { className: "w-5 h-5 text-blue-500" }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium", children: "Last Assessment" }), _jsx("p", { className: "text-sm text-gray-600", children: new Date(complianceData.assessmentTimestamp).toLocaleDateString() })] })] }), _jsxs("div", { className: "flex items-center gap-4 p-4 border rounded-lg", children: [_jsx(Calendar, { className: "w-5 h-5 text-green-500" }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium", children: "Next Assessment Due" }), _jsx("p", { className: "text-sm text-gray-600", children: new Date(complianceData.nextAssessmentDue).toLocaleDateString() })] })] }), _jsxs("div", { className: "flex items-center gap-4 p-4 border rounded-lg", children: [_jsx(Shield, { className: "w-5 h-5 text-purple-500" }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium", children: "Regulatory Version" }), _jsx("p", { className: "text-sm text-gray-600", children: complianceData.regulatoryVersion })] })] })] }) })] }) })] })] }))] }) }));
}
// Digital Forms Validation Results Component
function DigitalFormsValidationResults({ facilityId }) {
    const [validationResults, setValidationResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const runDigitalFormsValidation = async () => {
        try {
            setLoading(true);
            // Mock forms data for comprehensive testing
            const mockFormsData = {
                appendix4Data: {
                    patient_demographics: {
                        name: "Test Patient",
                        date_of_birth: "1960-01-01",
                        emirates_id: "784-1234-1234567-1",
                        address: "Dubai, UAE",
                        phone: "+971-50-1234567",
                    },
                    referring_physician: {
                        name: "Dr. Ahmed Al-Rashid",
                        license_number: "DOH-MD-123456",
                        contact_information: "ahmed.rashid@hospital.ae",
                        specialty: "Internal Medicine",
                    },
                    face_to_face_encounter: {
                        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                        location: "Patient Home",
                        clinical_findings: "Patient shows signs of mobility limitations and requires assistance",
                        homebound_justification: "Patient unable to leave home without significant effort due to chronic conditions and mobility limitations requiring assistive devices",
                    },
                    homebound_justification: "Patient has multiple chronic conditions including heart failure and diabetes that significantly limit mobility and ability to leave home safely without considerable effort and assistance.",
                    treatment_plan: {
                        goals: [
                            "Improve mobility",
                            "Medication management",
                            "Prevent complications",
                        ],
                        interventions: [
                            "Physical therapy",
                            "Nursing care",
                            "Medication monitoring",
                        ],
                        frequency: "3 times per week",
                        duration: "90 days",
                    },
                    periodic_assessment_schedule: {
                        frequency: "30_days",
                    },
                    clinical_condition: "Chronic heart failure with reduced ejection fraction",
                    functional_status: "Limited mobility, requires assistance with ADLs",
                    medication_list: ["Lisinopril", "Metformin", "Furosemide"],
                    physician_orders: ["Home nursing care", "Physical therapy"],
                    emergency_contact: {
                        name: "Family Member",
                        phone: "+971-50-7654321",
                    },
                    insurance_information: {
                        provider: "Daman",
                        policy_number: "DM123456789",
                    },
                    treatment_plan_attachment: {
                        file_name: "treatment_plan.pdf",
                        file_size: 2048000,
                        digitally_signed: true,
                    },
                    physician_signature: {
                        digital_signature: true,
                        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                        license_verified: true,
                        license_number: "DOH-MD-123456",
                        integrity_verified: true,
                        hash_validation: true,
                    },
                    periodic_assessment_automation: {
                        automated_scheduling: true,
                        thirty_day_trigger: true,
                        thirty_day_notification_sent: true,
                        sixty_day_trigger: true,
                        sixty_day_notification_sent: true,
                        ninety_day_trigger: true,
                        ninety_day_notification_sent: true,
                        escalation_protocols: true,
                        overdue_notifications: true,
                    },
                },
                appendix7Data: {
                    section_a: {
                        service_type: "routine_care",
                        care_type: "nursing_care",
                        care_type_justification: "Patient requires skilled nursing care for medication management and monitoring of chronic conditions",
                        professional_requirements: [
                            "Registered Nurse",
                            "Physical Therapist",
                        ],
                        daily_hours: 6,
                        equipment_needs: true,
                        equipment_list: ["Blood pressure monitor", "Glucose meter"],
                    },
                    section_b: {
                        automated_tracking: true,
                        service_delivery_log: true,
                        monthly_summary: {
                            automated_generation: true,
                        },
                        service_hours: {
                            total_hours: 180,
                            breakdown_by_service: {
                                nursing: 120,
                                therapy: 60,
                            },
                        },
                        quality_metrics: {
                            patient_satisfaction: 95,
                            clinical_outcomes: 88,
                        },
                        billing_integration: true,
                        billing_codes_validated: true,
                    },
                    section_c: {
                        discharge_criteria: [
                            "Goals achieved",
                            "Patient stable",
                            "Family educated",
                        ],
                        goal_achievement: {
                            assessment_completed: true,
                            outcomes_documented: true,
                        },
                        transition_planning: {
                            next_level_of_care: "Outpatient follow-up",
                            provider_coordination: true,
                        },
                        patient_education: {
                            education_provided: true,
                            understanding_verified: true,
                        },
                        follow_up: {
                            appointments_scheduled: true,
                            contact_information_provided: true,
                        },
                    },
                    level_of_care_upgrade: {
                        criteria_monitoring: true,
                        automated_assessment: true,
                        clinical_justification: "Patient's condition has improved significantly with current interventions, allowing for potential step-down in care intensity while maintaining quality outcomes.",
                        physician_approval: true,
                        physician_signature: true,
                        timeline_tracking: true,
                        implementation_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                        cost_analysis: true,
                        budget_approval: true,
                    },
                },
                appendix8Data: {
                    IM_series: {
                        questions_completed: true,
                        medication_assessment: true,
                        administration_monitoring: true,
                        side_effects_tracking: true,
                    },
                    IN_series: {
                        questions_completed: true,
                        nutritional_status: true,
                        hydration_assessment: true,
                        feeding_tolerance: true,
                    },
                    IR_series: {
                        questions_completed: true,
                        respiratory_status: true,
                        oxygen_requirements: true,
                        airway_management: true,
                    },
                    IS_series: {
                        questions_completed: true,
                        skin_integrity: true,
                        wound_assessment: true,
                        healing_progress: true,
                    },
                    IB_series: {
                        questions_completed: true,
                        bowel_function: true,
                        bladder_function: true,
                        continence_management: true,
                    },
                    IP_series: {
                        questions_completed: true,
                        pain_assessment: true,
                        symptom_management: true,
                        comfort_measures: true,
                    },
                    IO_series: {
                        questions_completed: true,
                        vital_signs_monitoring: true,
                        neurological_assessment: true,
                        behavioral_observations: true,
                    },
                    IT_series: {
                        questions_completed: true,
                        transition_readiness: true,
                        education_completion: true,
                        support_system_assessment: true,
                    },
                    automated_progress_tracking: {
                        data_collection_automated: true,
                        real_time_updates: true,
                        trend_analysis: true,
                        improvement_indicators: true,
                        alert_system: true,
                        deterioration_detection: true,
                        goal_tracking: true,
                        milestone_monitoring: true,
                        predictive_analytics: true,
                        risk_stratification: true,
                    },
                    outcome_measurement: {
                        standardized_measures: true,
                        measurement_tools: [
                            "Barthel Index",
                            "Mini-Mental State Exam",
                            "Pain Scale",
                        ],
                        baseline_measurements: true,
                        baseline_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
                        periodic_assessment: true,
                        assessment_frequency: "monthly",
                        data_integration: true,
                        ehr_integration: true,
                        quality_reporting: true,
                        regulatory_reporting: true,
                    },
                    assessment_renewal: {
                        automated_scheduling: true,
                        renewal_calendar: true,
                        pre_renewal_notifications: true,
                        notification_timeline: "14 days prior",
                        criteria_validation: true,
                        eligibility_check: true,
                        documentation_update: true,
                        automated_form_generation: true,
                        stakeholder_communication: true,
                        multi_party_coordination: true,
                    },
                },
            };
            const results = dohComplianceValidatorService.executeDigitalFormsValidationSuite(mockFormsData);
            setValidationResults(results);
        }
        catch (error) {
            console.error("Error running digital forms validation:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const getFormStatusColor = (score) => {
        if (score >= 95)
            return "text-green-600 bg-green-100 border-green-200";
        if (score >= 85)
            return "text-blue-600 bg-blue-100 border-blue-200";
        if (score >= 70)
            return "text-yellow-600 bg-yellow-100 border-yellow-200";
        return "text-red-600 bg-red-100 border-red-200";
    };
    const getFormStatusIcon = (score) => {
        if (score >= 95)
            return _jsx(CheckCircle, { className: "w-4 h-4 text-green-500" });
        if (score >= 85)
            return _jsx(CheckCircle, { className: "w-4 h-4 text-blue-500" });
        if (score >= 70)
            return _jsx(AlertTriangle, { className: "w-4 h-4 text-yellow-500" });
        return _jsx(XCircle, { className: "w-4 h-4 text-red-500" });
    };
    return (_jsx("div", { className: "space-y-6", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: "Subtask 2.1.2: Digital Forms Validation" }), _jsx(CardDescription, { children: "Comprehensive testing for DOH Referral/Periodic Assessment Form (Appendix 4), Healthcare Assessment Form (Appendix 7), and Patient Monitoring Form (Appendix 8)" })] }), _jsxs(Button, { onClick: runDigitalFormsValidation, disabled: loading, className: "flex items-center gap-2", children: [loading ? (_jsx(RefreshCw, { className: "w-4 h-4 animate-spin" })) : (_jsx(FileText, { className: "w-4 h-4" })), loading ? "Validating Forms..." : "Run Digital Forms Validation"] })] }) }), validationResults && (_jsxs(CardContent, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6", children: [_jsx(Card, { className: "border-blue-200 bg-blue-50", children: _jsxs(CardContent, { className: "pt-4", children: [_jsxs("div", { className: "text-2xl font-bold text-blue-900", children: [validationResults.overallDigitalFormsScore, "%"] }), _jsx("p", { className: "text-sm text-blue-600", children: "Overall Score" })] }) }), _jsx(Card, { className: "border-green-200 bg-green-50", children: _jsxs(CardContent, { className: "pt-4", children: [_jsx("div", { className: "text-2xl font-bold text-green-900", children: validationResults.validationSummary.compliantForms }), _jsx("p", { className: "text-sm text-green-600", children: "Compliant Forms" })] }) }), _jsx(Card, { className: "border-red-200 bg-red-50", children: _jsxs(CardContent, { className: "pt-4", children: [_jsx("div", { className: "text-2xl font-bold text-red-900", children: validationResults.validationSummary.formsNeedingAttention }), _jsx("p", { className: "text-sm text-red-600", children: "Forms Needing Attention" })] }) }), _jsx(Card, { className: "border-purple-200 bg-purple-50", children: _jsxs(CardContent, { className: "pt-4", children: [_jsx("div", { className: "text-sm font-bold text-purple-900 capitalize", children: validationResults.validationSummary.overallComplianceLevel.replace("_", " ") }), _jsx("p", { className: "text-sm text-purple-600", children: "Compliance Level" })] }) })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { className: "border-l-4 border-l-blue-400", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: "text-lg", children: "Subtask 2.1.2.1: DOH Referral/Periodic Assessment Form (Appendix 4)" }), _jsx(CardDescription, { children: "Mandatory field completion, treatment plan attachment, physician e-signature, periodic assessment automation (30-90 days)" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [getFormStatusIcon(validationResults.digitalFormsResults.appendix4Results
                                                                .overallComplianceScore), _jsxs(Badge, { className: getFormStatusColor(validationResults.digitalFormsResults.appendix4Results
                                                                    .overallComplianceScore), children: [validationResults.digitalFormsResults.appendix4Results
                                                                        .overallComplianceScore, "%"] })] })] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: Object.entries(validationResults.digitalFormsResults.appendix4Results
                                                        .testResults).map(([testName, testResult]) => (_jsxs("div", { className: "p-3 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h4", { className: "font-medium text-sm capitalize", children: testName
                                                                            .replace(/([A-Z])/g, " $1")
                                                                            .replace("Test", "")
                                                                            .trim() }), getFormStatusIcon(testResult.score)] }), _jsxs("div", { className: "text-lg font-bold", children: [testResult.score, "%"] }), _jsx(Progress, { value: testResult.score, className: "h-2 mt-1" })] }, testName))) }), _jsxs("div", { className: "mt-4 p-4 bg-gray-50 rounded-lg", children: [_jsx("h4", { className: "font-medium mb-2", children: "Form Completion Summary" }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Total Fields:" }), _jsx("span", { className: "ml-2", children: validationResults.digitalFormsResults
                                                                                .appendix4Results.formValidationSummary
                                                                                .totalFields })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Completed:" }), _jsx("span", { className: "ml-2", children: validationResults.digitalFormsResults
                                                                                .appendix4Results.formValidationSummary
                                                                                .completedFields })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Missing:" }), _jsx("span", { className: "ml-2", children: validationResults.digitalFormsResults
                                                                                .appendix4Results.formValidationSummary
                                                                                .missingFields.length })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Status:" }), _jsx(Badge, { className: getFormStatusColor(validationResults.digitalFormsResults
                                                                                .appendix4Results.overallComplianceScore), children: validationResults.digitalFormsResults
                                                                                .appendix4Results.formValidationSummary
                                                                                .complianceLevel })] })] })] })] })] }), _jsxs(Card, { className: "border-l-4 border-l-green-400", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: "text-lg", children: "Subtask 2.1.2.2: DOH Healthcare Assessment Form (Appendix 7)" }), _jsx(CardDescription, { children: "Section A: Service and care type determination, Section B: Monthly service summary automation, Section C: Homecare discharge planning, Level of care upgrade tracking" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [getFormStatusIcon(validationResults.digitalFormsResults.appendix7Results
                                                                .overallComplianceScore), _jsxs(Badge, { className: getFormStatusColor(validationResults.digitalFormsResults.appendix7Results
                                                                    .overallComplianceScore), children: [validationResults.digitalFormsResults.appendix7Results
                                                                        .overallComplianceScore, "%"] })] })] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: Object.entries(validationResults.digitalFormsResults.appendix7Results
                                                        .testResults).map(([testName, testResult]) => (_jsxs("div", { className: "p-3 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h4", { className: "font-medium text-sm capitalize", children: testName
                                                                            .replace(/([A-Z])/g, " $1")
                                                                            .replace("Test", "")
                                                                            .trim() }), getFormStatusIcon(testResult.score)] }), _jsxs("div", { className: "text-lg font-bold", children: [testResult.score, "%"] }), _jsx(Progress, { value: testResult.score, className: "h-2 mt-1" })] }, testName))) }), _jsxs("div", { className: "mt-4 p-4 bg-gray-50 rounded-lg", children: [_jsx("h4", { className: "font-medium mb-2", children: "Section Completion Summary" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: Object.entries(validationResults.digitalFormsResults.appendix7Results
                                                                .sectionCompletionSummary).map(([sectionName, sectionData]) => {
                                                                if (sectionName === "overallCompletion")
                                                                    return null;
                                                                return (_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-sm font-medium capitalize mb-1", children: sectionName.replace(/([A-Z])/g, " $1") }), _jsxs("div", { className: "text-lg font-bold", children: [typeof sectionData === "object"
                                                                                    ? sectionData.completionPercentage
                                                                                    : sectionData, "%"] }), _jsx("div", { className: "text-xs text-gray-600", children: typeof sectionData === "object" &&
                                                                                sectionData.completed
                                                                                ? "Complete"
                                                                                : "In Progress" })] }, sectionName));
                                                            }) })] })] })] }), _jsxs(Card, { className: "border-l-4 border-l-purple-400", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: "text-lg", children: "Subtask 2.1.2.3: DOH Patient Monitoring Form (Appendix 8)" }), _jsx(CardDescription, { children: "Domain-specific clinical questions (IM, IN, IR, IS, IB, IP, IO, IT series), automated progress tracking, outcome measurement integration, assessment period renewal automation" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [getFormStatusIcon(validationResults.digitalFormsResults.appendix8Results
                                                                .overallComplianceScore), _jsxs(Badge, { className: getFormStatusColor(validationResults.digitalFormsResults.appendix8Results
                                                                    .overallComplianceScore), children: [validationResults.digitalFormsResults.appendix8Results
                                                                        .overallComplianceScore, "%"] })] })] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: Object.entries(validationResults.digitalFormsResults.appendix8Results
                                                        .testResults).map(([testName, testResult]) => (_jsxs("div", { className: "p-3 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h4", { className: "font-medium text-sm capitalize", children: testName
                                                                            .replace(/([A-Z])/g, " $1")
                                                                            .replace("Test", "")
                                                                            .trim() }), getFormStatusIcon(testResult.score)] }), _jsxs("div", { className: "text-lg font-bold", children: [testResult.score, "%"] }), _jsx(Progress, { value: testResult.score, className: "h-2 mt-1" })] }, testName))) }), _jsxs("div", { className: "mt-4 p-4 bg-gray-50 rounded-lg", children: [_jsx("h4", { className: "font-medium mb-2", children: "Domain Questions Summary" }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Total Domains:" }), _jsx("span", { className: "ml-2", children: validationResults.digitalFormsResults
                                                                                .appendix8Results.domainQuestionsSummary
                                                                                .totalDomains })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Completed:" }), _jsx("span", { className: "ml-2", children: validationResults.digitalFormsResults
                                                                                .appendix8Results.domainQuestionsSummary
                                                                                .completedDomains })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Completion:" }), _jsxs("span", { className: "ml-2", children: [validationResults.digitalFormsResults
                                                                                    .appendix8Results.domainQuestionsSummary
                                                                                    .overallCompletion, "%"] })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Status:" }), _jsx(Badge, { className: getFormStatusColor(validationResults.digitalFormsResults
                                                                                .appendix8Results.overallComplianceScore), children: validationResults.digitalFormsResults
                                                                                .appendix8Results.domainQuestionsSummary
                                                                                .overallCompletion >= 90
                                                                                ? "Complete"
                                                                                : "In Progress" })] })] }), _jsxs("div", { className: "mt-4", children: [_jsx("h5", { className: "font-medium mb-2", children: "Domain Series Status" }), _jsx("div", { className: "grid grid-cols-4 md:grid-cols-8 gap-2", children: Object.entries(validationResults.digitalFormsResults.appendix8Results
                                                                        .domainQuestionsSummary.domainCompletionStatus).map(([domain, completed]) => (_jsxs("div", { className: `p-2 rounded text-center text-xs ${completed
                                                                            ? "bg-green-100 text-green-800"
                                                                            : "bg-red-100 text-red-800"}`, children: [_jsx("div", { className: "font-medium", children: domain }), _jsx("div", { children: completed ? "✓" : "✗" })] }, domain))) })] })] })] })] })] }), (validationResults.criticalIssues.length > 0 ||
                            validationResults.recommendations.length > 0) && (_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6", children: [validationResults.criticalIssues.length > 0 && (_jsxs(Card, { className: "border-red-200", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "text-red-800 flex items-center gap-2", children: [_jsx(AlertTriangle, { className: "w-5 h-5" }), "Critical Issues (", validationResults.criticalIssues.length, ")"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-2", children: validationResults.criticalIssues.map((issue, index) => (_jsxs("div", { className: "flex items-start gap-2 p-2 bg-red-50 rounded", children: [_jsx(XCircle, { className: "w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" }), _jsx("span", { className: "text-sm text-red-700", children: issue })] }, index))) }) })] })), validationResults.recommendations.length > 0 && (_jsxs(Card, { className: "border-blue-200", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "text-blue-800 flex items-center gap-2", children: [_jsx(Target, { className: "w-5 h-5" }), "Recommendations (", validationResults.recommendations.length, ")"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-2", children: validationResults.recommendations.map((recommendation, index) => (_jsxs("div", { className: "flex items-start gap-2 p-2 bg-blue-50 rounded", children: [_jsx(CheckCircle, { className: "w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" }), _jsx("span", { className: "text-sm text-blue-700", children: recommendation })] }, index))) }) })] }))] }))] })), !validationResults && (_jsx(CardContent, { children: _jsxs("div", { className: "text-center py-8", children: [_jsx(FileText, { className: "w-12 h-12 mx-auto text-gray-400 mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "Digital Forms Validation Ready" }), _jsx("p", { className: "text-gray-600 mb-4", children: "Click \"Run Digital Forms Validation\" to execute comprehensive testing for all DOH digital forms." }), _jsxs("div", { className: "text-sm text-gray-500", children: [_jsx("p", { children: "\u2022 Subtask 2.1.2.1: DOH Referral/Periodic Assessment Form (Appendix 4)" }), _jsx("p", { children: "\u2022 Subtask 2.1.2.2: DOH Healthcare Assessment Form (Appendix 7)" }), _jsx("p", { children: "\u2022 Subtask 2.1.2.3: DOH Patient Monitoring Form (Appendix 8)" })] })] }) }))] }) }));
}
// JAWDA KPI Automation Testing Results Component
function JAWDAKPIAutomationTestingResults({ facilityId, }) {
    const [jawdaTestingResults, setJawdaTestingResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const runJAWDAKPITests = async () => {
        try {
            setLoading(true);
            // Mock facility data for comprehensive JAWDA KPI testing
            const mockFacilityData = {
                facilityId: facilityId,
                // Emergency Department Visits Data
                edVisits: [
                    {
                        patientId: "P001",
                        visitDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                        visitType: "emergency_department",
                        resultedInHospitalization: false,
                        reason: "Chest pain evaluation",
                    },
                    {
                        patientId: "P002",
                        visitDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                        visitType: "emergency_department",
                        resultedInHospitalization: true,
                        reason: "Acute respiratory distress",
                    },
                ],
                // Hospitalization Data
                hospitalizations: [
                    {
                        patientId: "P003",
                        admissionDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                        plannedStatus: false,
                        acuteCare: true,
                        reason: "Unplanned admission for infection",
                    },
                ],
                // Ambulation Assessment Data
                ambulationAssessments: [
                    {
                        patientId: "P001",
                        baselineDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                        baselineScore: 60,
                        assessmentTool: "Barthel Index",
                        followUpAssessments: [
                            {
                                date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                                score: 75,
                            },
                            {
                                date: new Date().toISOString(),
                                score: 85,
                            },
                        ],
                    },
                    {
                        patientId: "P002",
                        baselineDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
                        baselineScore: 45,
                        assessmentTool: "Barthel Index",
                        followUpAssessments: [
                            {
                                date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                                score: 55,
                            },
                        ],
                    },
                ],
                // Pressure Injury Data
                pressureInjuries: [
                    {
                        patientId: "P004",
                        identificationDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
                        stage: "Stage 2",
                        location: "Sacrum",
                        acquiredDuringCare: true,
                    },
                ],
                // Fall Incident Data
                fallIncidents: [
                    {
                        patientId: "P005",
                        incidentDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
                        location: "Bathroom",
                        injuryOccurred: true,
                        injurySeverity: "Minor",
                    },
                ],
                // Discharge Data
                discharges: [
                    {
                        patientId: "P001",
                        dischargeDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                        destination: "Home",
                        dischargeReason: "Goals achieved",
                    },
                    {
                        patientId: "P002",
                        dischargeDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                        destination: "Skilled Nursing Facility",
                        dischargeReason: "Requires higher level of care",
                    },
                ],
                // Patient Data for Individual Tracking
                patients: [
                    {
                        patientId: "P001",
                        admissionDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                        dischargeDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                        patientDays: 27,
                        incidents: [
                            {
                                incidentId: "INC001",
                                incidentDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                                incidentType: "medication_error",
                                patientId: "P001",
                                description: "Wrong medication dosage administered",
                                severity: "moderate",
                                outcome: "No harm to patient",
                                preventability: "preventable",
                                reportedBy: "Nurse Smith",
                                category: "Medication/IV Fluids",
                                subcategory: "Wrong dose",
                                dohTaxonomyLevel1: "Medication/IV Fluids",
                                automatedClassification: true,
                                safetyImpact: {
                                    harmLevel: "no_harm",
                                    riskScore: 3,
                                    mitigationRequired: true,
                                },
                            },
                        ],
                        visits: [
                            {
                                visitId: "V001",
                                visitType: "routine_nursing",
                                qualityRelated: false,
                                classificationReason: "Scheduled routine care",
                            },
                            {
                                visitId: "V002",
                                visitType: "emergency_response",
                                qualityRelated: true,
                                classificationReason: "Response to medication error incident",
                                qualityIndicators: ["medication_safety", "patient_monitoring"],
                                preventabilityAssessment: "preventable",
                                clinicalReview: {
                                    reviewDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                                    reviewer: "Dr. Johnson",
                                    approved: true,
                                },
                            },
                        ],
                    },
                ],
                // Patient Days Calculation
                patientDays: {
                    totalDays: 1250,
                    calculationMethod: "automated",
                    lastUpdated: new Date().toISOString(),
                },
                // KPI Calculations
                kpiCalculations: {
                    edVisitsRate: 0.8, // per 1000 patient days
                    unplannedHospitalizationRate: 0.8,
                    ambulationImprovementRate: 75.0, // percentage
                    pressureInjuryRate: 0.8,
                    fallInjuryRate: 0.8,
                    dischargeToCommunityRate: 0.8,
                    unplannedHospitalizations: { count: 1 },
                    pressureInjuriesStage2Plus: { count: 1 },
                    fallsWithInjury: { count: 1 },
                    communityDischarges: { count: 1 },
                },
                // Benchmarks
                benchmarks: {
                    edVisitsTarget: 3.0,
                    unplannedHospitalizationTarget: 2.5,
                    ambulationImprovementTarget: 80.0,
                    pressureInjuryTarget: 1.2,
                    fallInjuryTarget: 1.0,
                    dischargeToCommunityTarget: 85.0,
                    source: "JAWDA National Benchmarks",
                    lastUpdated: new Date().toISOString(),
                    version: "2025.1",
                    autoUpdate: true,
                },
                // Automation and Tracking Systems
                automatedReporting: {
                    edVisits: { enabled: true, frequency: "real_time" },
                    unplannedHospitalizations: { enabled: true, frequency: "real_time" },
                    ambulation: { enabled: true, frequency: "daily" },
                    pressureInjury: { enabled: true, frequency: "real_time" },
                    falls: { enabled: true, frequency: "real_time" },
                    dischargeToCommunity: { enabled: true, frequency: "daily" },
                    benchmarkComparison: {
                        enabled: true,
                        frequency: "weekly",
                        recipients: ["quality@facility.com", "admin@facility.com"],
                    },
                },
                realTimeCalculation: {
                    edVisits: true,
                    unplannedHospitalizations: true,
                    ambulation: true,
                    pressureInjury: true,
                    falls: true,
                    dischargeToCommunity: true,
                },
                dataValidation: {
                    edVisits: { automated: true },
                    unplannedHospitalizations: { automated: true },
                    ambulation: { automated: true },
                    pressureInjury: { automated: true },
                    falls: { automated: true },
                    dischargeToCommunity: { automated: true },
                },
                alertSystem: {
                    edVisits: { enabled: true },
                    unplannedHospitalizations: { enabled: true },
                    ambulation: { enabled: true },
                    pressureInjury: { enabled: true },
                    falls: { enabled: true },
                    dischargeToCommunity: { enabled: true },
                },
                trendAnalysis: {
                    enabled: true,
                    historicalComparison: true,
                    forecastingEnabled: true,
                    edVisits: { enabled: true },
                    unplannedHospitalizations: { enabled: true, historicalData: [] },
                    ambulation: { enabled: true },
                    pressureInjury: { enabled: true },
                    falls: { enabled: true },
                    dischargeToCommunity: { enabled: true },
                },
                // Incident Logging System
                incidentLogging: {
                    realTimeCapture: true,
                    automatedTimestamps: true,
                    immediateNotification: true,
                    automatedClassification: true,
                    workflowIntegration: true,
                },
                // Classification Systems
                classificationRules: {
                    qualityRelated: {
                        automatedRules: true,
                        confidenceThreshold: 95,
                    },
                },
                classificationMetrics: {
                    accuracy: 96,
                    falsePositiveRate: 3,
                    falseNegativeRate: 4,
                },
                automatedReview: { enabled: true },
                continuousLearning: { enabled: true },
                // Patient Days Tracking
                patientDaysTracking: {
                    realTimeUpdates: true,
                    midnightRecalculation: true,
                    auditTrail: true,
                },
                dataQuality: {
                    patientDays: {
                        accuracy: 99.5,
                        completeness: 100,
                    },
                },
                // Performance Systems
                performanceComparison: {
                    automated: true,
                    edVisitsRate: { status: "exceeds_target", variance: -2.2 },
                    unplannedHospitalizationRate: {
                        status: "exceeds_target",
                        variance: -1.7,
                    },
                    ambulationImprovementRate: { status: "below_target", variance: -5.0 },
                    pressureInjuryRate: { status: "exceeds_target", variance: -0.4 },
                    fallInjuryRate: { status: "exceeds_target", variance: -0.2 },
                    dischargeToCommunityRate: { status: "below_target", variance: -35.0 },
                },
                performanceAlerts: {
                    enabled: true,
                    thresholds: true,
                    escalationRules: true,
                },
                // Prevention Protocols
                preventionProtocols: {
                    pressureInjury: {
                        implemented: true,
                        complianceTracking: true,
                    },
                    falls: {
                        implemented: true,
                        effectivenessTracking: true,
                    },
                },
                fallRiskAssessments: [
                    {
                        patientId: "P005",
                        riskScore: 8,
                        preventionPlan: "Bed alarm, frequent rounding",
                    },
                ],
                dischargePlanning: {
                    automated: true,
                    communityResourceTracking: true,
                },
                automatedTracking: {
                    ambulation: {
                        enabled: true,
                        assessmentScheduling: true,
                    },
                },
            };
            const results = dohComplianceValidatorService.executeJAWDAKPIAutomationTesting(mockFacilityData);
            setJawdaTestingResults(results);
        }
        catch (error) {
            console.error("Error running JAWDA KPI automation tests:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const getKPIStatusColor = (score) => {
        if (score >= 95)
            return "text-green-600 bg-green-100 border-green-200";
        if (score >= 85)
            return "text-blue-600 bg-blue-100 border-blue-200";
        if (score >= 70)
            return "text-yellow-600 bg-yellow-100 border-yellow-200";
        return "text-red-600 bg-red-100 border-red-200";
    };
    const getKPIStatusIcon = (score) => {
        if (score >= 95)
            return _jsx(CheckCircle, { className: "w-4 h-4 text-green-500" });
        if (score >= 85)
            return _jsx(CheckCircle, { className: "w-4 h-4 text-blue-500" });
        if (score >= 70)
            return _jsx(AlertTriangle, { className: "w-4 h-4 text-yellow-500" });
        return _jsx(XCircle, { className: "w-4 h-4 text-red-500" });
    };
    return (_jsx("div", { className: "space-y-6", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: "Subtask 2.1.3: JAWDA KPI Automation Testing" }), _jsx(CardDescription, { children: "Comprehensive testing for real-time KPI calculations and patient-level incident tracking" })] }), _jsxs(Button, { onClick: runJAWDAKPITests, disabled: loading, className: "flex items-center gap-2", children: [loading ? (_jsx(RefreshCw, { className: "w-4 h-4 animate-spin" })) : (_jsx(BarChart3, { className: "w-4 h-4" })), loading ? "Running JAWDA Tests..." : "Run JAWDA KPI Tests"] })] }) }), jawdaTestingResults && (_jsxs(CardContent, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6", children: [_jsx(Card, { className: "border-blue-200 bg-blue-50", children: _jsxs(CardContent, { className: "pt-4", children: [_jsxs("div", { className: "text-2xl font-bold text-blue-900", children: [jawdaTestingResults.overallJAWDAScore, "%"] }), _jsx("p", { className: "text-sm text-blue-600", children: "Overall JAWDA Score" })] }) }), _jsx(Card, { className: "border-green-200 bg-green-50", children: _jsxs(CardContent, { className: "pt-4", children: [_jsx("div", { className: "text-2xl font-bold text-green-900", children: jawdaTestingResults.jawdaTestingSummary.passedKPITests }), _jsx("p", { className: "text-sm text-green-600", children: "Tests Passed" })] }) }), _jsx(Card, { className: "border-red-200 bg-red-50", children: _jsxs(CardContent, { className: "pt-4", children: [_jsx("div", { className: "text-2xl font-bold text-red-900", children: jawdaTestingResults.jawdaTestingSummary.failedKPITests }), _jsx("p", { className: "text-sm text-red-600", children: "Tests Failed" })] }) }), _jsx(Card, { className: "border-purple-200 bg-purple-50", children: _jsxs(CardContent, { className: "pt-4", children: [_jsxs("div", { className: "text-2xl font-bold text-purple-900", children: [jawdaTestingResults.jawdaTestingSummary.automationLevel, "%"] }), _jsx("p", { className: "text-sm text-purple-600", children: "Automation Level" })] }) })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { className: "border-l-4 border-l-blue-400", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: "text-lg", children: "Subtask 2.1.3.1: Real-time KPI Calculations" }), _jsx(CardDescription, { children: "Emergency Department visits, unplanned hospitalization rate, ambulation improvement, pressure injury rate, fall injury rate, and discharge to community rate" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [getKPIStatusIcon(jawdaTestingResults.jawdaKPIResults
                                                                .realTimeKPICalculations.overallKPIScore), _jsxs(Badge, { className: getKPIStatusColor(jawdaTestingResults.jawdaKPIResults
                                                                    .realTimeKPICalculations.overallKPIScore), children: [jawdaTestingResults.jawdaKPIResults
                                                                        .realTimeKPICalculations.overallKPIScore, "%"] })] })] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: Object.entries(jawdaTestingResults.jawdaKPIResults
                                                        .realTimeKPICalculations.testResults).map(([kpiName, kpiResult]) => (_jsxs("div", { className: "p-3 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h4", { className: "font-medium text-sm capitalize", children: kpiName
                                                                            .replace(/([A-Z])/g, " $1")
                                                                            .replace("Test", "")
                                                                            .trim() }), getKPIStatusIcon(kpiResult.score)] }), _jsxs("div", { className: "text-lg font-bold", children: [kpiResult.score, "%"] }), _jsx(Progress, { value: kpiResult.score, className: "h-2 mt-1" }), _jsxs("div", { className: "text-xs text-gray-600 mt-1", children: ["Automation: ", kpiResult.automationScore, "%"] })] }, kpiName))) }), _jsxs("div", { className: "mt-4 p-4 bg-gray-50 rounded-lg", children: [_jsx("h4", { className: "font-medium mb-2", children: "KPI Calculation Summary" }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Total KPIs:" }), _jsx("span", { className: "ml-2", children: jawdaTestingResults.jawdaKPIResults
                                                                                .realTimeKPICalculations.kpiCalculationSummary
                                                                                .totalKPIs })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Passing:" }), _jsx("span", { className: "ml-2", children: jawdaTestingResults.jawdaKPIResults
                                                                                .realTimeKPICalculations.kpiCalculationSummary
                                                                                .passingKPIs })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Failing:" }), _jsx("span", { className: "ml-2", children: jawdaTestingResults.jawdaKPIResults
                                                                                .realTimeKPICalculations.kpiCalculationSummary
                                                                                .failingKPIs })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Automation:" }), _jsxs("span", { className: "ml-2", children: [jawdaTestingResults.jawdaKPIResults
                                                                                    .realTimeKPICalculations.kpiCalculationSummary
                                                                                    .automationLevel, "%"] })] })] })] })] })] }), _jsxs(Card, { className: "border-l-4 border-l-green-400", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: "text-lg", children: "Subtask 2.1.3.2: Patient-level Incident Tracking" }), _jsx(CardDescription, { children: "Individual patient incident logging, quality-related vs unrelated visit classification, patient days calculation accuracy, and benchmark comparison automation" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [getKPIStatusIcon(jawdaTestingResults.jawdaKPIResults
                                                                .patientLevelIncidentTracking.overallTrackingScore), _jsxs(Badge, { className: getKPIStatusColor(jawdaTestingResults.jawdaKPIResults
                                                                    .patientLevelIncidentTracking.overallTrackingScore), children: [jawdaTestingResults.jawdaKPIResults
                                                                        .patientLevelIncidentTracking.overallTrackingScore, "%"] })] })] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: Object.entries(jawdaTestingResults.jawdaKPIResults
                                                        .patientLevelIncidentTracking.testResults).map(([testName, testResult]) => (_jsxs("div", { className: "p-3 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h4", { className: "font-medium text-sm capitalize", children: testName
                                                                            .replace(/([A-Z])/g, " $1")
                                                                            .replace("Test", "")
                                                                            .trim() }), getKPIStatusIcon(testResult.score)] }), _jsxs("div", { className: "text-lg font-bold", children: [testResult.score, "%"] }), _jsx(Progress, { value: testResult.score, className: "h-2 mt-1" }), _jsxs("div", { className: "text-xs text-gray-600 mt-1", children: ["Automation: ", testResult.automationScore, "%"] })] }, testName))) }), _jsxs("div", { className: "mt-4 p-4 bg-gray-50 rounded-lg", children: [_jsx("h4", { className: "font-medium mb-2", children: "Patient Tracking Summary" }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Total Patients:" }), _jsx("span", { className: "ml-2", children: jawdaTestingResults.jawdaKPIResults
                                                                                .patientLevelIncidentTracking
                                                                                .patientTrackingSummary.totalPatients })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "With Incidents:" }), _jsx("span", { className: "ml-2", children: jawdaTestingResults.jawdaKPIResults
                                                                                .patientLevelIncidentTracking
                                                                                .patientTrackingSummary.patientsWithIncidents })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Tracking Accuracy:" }), _jsxs("span", { className: "ml-2", children: [jawdaTestingResults.jawdaKPIResults
                                                                                    .patientLevelIncidentTracking
                                                                                    .patientTrackingSummary.trackingAccuracy, "%"] })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Automation Level:" }), _jsxs("span", { className: "ml-2", children: [jawdaTestingResults.jawdaKPIResults
                                                                                    .patientLevelIncidentTracking
                                                                                    .patientTrackingSummary.automationLevel, "%"] })] })] })] })] })] })] }), (jawdaTestingResults.criticalIssues.length > 0 ||
                            jawdaTestingResults.recommendations.length > 0) && (_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6", children: [jawdaTestingResults.criticalIssues.length > 0 && (_jsxs(Card, { className: "border-red-200", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "text-red-800 flex items-center gap-2", children: [_jsx(AlertTriangle, { className: "w-5 h-5" }), "Critical Issues (", jawdaTestingResults.criticalIssues.length, ")"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-2", children: jawdaTestingResults.criticalIssues.map((issue, index) => (_jsxs("div", { className: "flex items-start gap-2 p-2 bg-red-50 rounded", children: [_jsx(XCircle, { className: "w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" }), _jsx("span", { className: "text-sm text-red-700", children: issue })] }, index))) }) })] })), jawdaTestingResults.recommendations.length > 0 && (_jsxs(Card, { className: "border-blue-200", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "text-blue-800 flex items-center gap-2", children: [_jsx(Target, { className: "w-5 h-5" }), "Recommendations (", jawdaTestingResults.recommendations.length, ")"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-2", children: jawdaTestingResults.recommendations.map((recommendation, index) => (_jsxs("div", { className: "flex items-start gap-2 p-2 bg-blue-50 rounded", children: [_jsx(CheckCircle, { className: "w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" }), _jsx("span", { className: "text-sm text-blue-700", children: recommendation })] }, index))) }) })] }))] }))] })), !jawdaTestingResults && (_jsx(CardContent, { children: _jsxs("div", { className: "text-center py-8", children: [_jsx(BarChart3, { className: "w-12 h-12 mx-auto text-gray-400 mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "JAWDA KPI Automation Testing Ready" }), _jsx("p", { className: "text-gray-600 mb-4", children: "Click \"Run JAWDA KPI Tests\" to execute comprehensive testing for real-time KPI calculations and patient-level incident tracking." }), _jsxs("div", { className: "text-sm text-gray-500", children: [_jsx("p", { children: "\u2022 Subtask 2.1.3.1: Real-time KPI calculations (ED visits, hospitalizations, ambulation, pressure injuries, falls, discharge rates)" }), _jsx("p", { children: "\u2022 Subtask 2.1.3.2: Patient-level incident tracking (individual logging, visit classification, patient days calculation, benchmark comparison)" })] })] }) }))] }) }));
}
// Malaffi EMR Integration Testing Results Component
function MalaffiEMRIntegrationTestingResults({ facilityId, }) {
    const [malaffiTestingResults, setMalaffiTestingResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const runMalaffiIntegrationTests = async () => {
        try {
            setLoading(true);
            // Mock Malaffi integration data for comprehensive testing
            const mockMalaffiIntegrationData = {
                facilityId: facilityId,
                // Malaffi Connection Configuration
                malaffiConnection: {
                    endpoint: "https://api.malaffi.ae/v2",
                    authenticated: true,
                    patientDataAccess: true,
                    clinicalDataAccess: true,
                    automated: true,
                    connectionHealth: {
                        status: "healthy",
                        latency: 120,
                        uptime: 99.8,
                        lastHealthCheck: new Date().toISOString(),
                    },
                },
                // Patient Data Integration
                patientData: {
                    demographics: {
                        synchronized: true,
                        lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                        recordCount: 1250,
                        syncAccuracy: 99.2,
                    },
                    medicalHistory: {
                        synchronized: true,
                        lastSync: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
                        recordCount: 3400,
                        syncAccuracy: 98.8,
                    },
                    currentMedications: {
                        synchronized: true,
                        lastSync: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                        recordCount: 890,
                        syncAccuracy: 99.5,
                    },
                },
                // Document Synchronization
                documentSync: {
                    pushEnabled: true,
                    pullEnabled: true,
                    automated: true,
                    batchProcessing: true,
                    realTimeSync: true,
                    compressionEnabled: true,
                    encryptionEnabled: true,
                },
                // Clinical Documents
                clinicalDocuments: {
                    carePlans: {
                        total: 450,
                        synchronized: 445,
                        pending: 5,
                        failed: 0,
                        lastSync: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
                    },
                    assessments: {
                        total: 1200,
                        synchronized: 1195,
                        pending: 3,
                        failed: 2,
                        lastSync: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
                    },
                    progressNotes: {
                        total: 2800,
                        synchronized: 2790,
                        pending: 8,
                        failed: 2,
                        lastSync: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
                    },
                },
                // Document Integration Settings
                documentIntegration: {
                    carePlans: true,
                    assessments: true,
                    medications: true,
                    labResults: true,
                    automated: true,
                    validationEnabled: true,
                    auditTrail: true,
                },
                // Sync Operations Tracking
                syncOperations: {
                    total: 15420,
                    successful: 15380,
                    failed: 40,
                    pending: 12,
                    averageTime: 2.3,
                    lastOperation: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
                },
                // Sync Performance Metrics
                syncPerformance: {
                    averageTime: 2.3,
                    peakTime: 8.7,
                    minTime: 0.8,
                    throughput: 450,
                    errorRate: 0.26,
                    retrySuccessRate: 95.2,
                },
                // Real-time Sync Monitoring
                syncMonitoring: {
                    realTime: true,
                    automated: true,
                    dashboardEnabled: true,
                    alertsEnabled: true,
                    performanceTracking: true,
                    healthChecks: true,
                    statusNotifications: true,
                },
                // Failure Recovery Systems
                failureRecovery: {
                    implemented: true,
                    automated: true,
                    retryMechanism: true,
                    queueManagement: true,
                    dataIntegrityChecks: true,
                    rollbackCapability: true,
                    manualOverride: true,
                },
                // Error Handling Configuration
                errorHandling: {
                    networkFailure: true,
                    partialSync: true,
                    dataConflicts: true,
                    manualOverride: true,
                    automated: true,
                    overrideAutomation: true,
                    escalationRules: true,
                    notificationSystem: true,
                },
                // Data Quality and Validation
                dataQuality: {
                    validationRules: true,
                    integrityChecks: true,
                    duplicateDetection: true,
                    formatValidation: true,
                    businessRuleValidation: true,
                    auditLogging: true,
                },
                // Security and Compliance
                security: {
                    encryption: {
                        inTransit: true,
                        atRest: true,
                        keyManagement: true,
                    },
                    authentication: {
                        oauth2: true,
                        tokenRefresh: true,
                        sessionManagement: true,
                    },
                    authorization: {
                        roleBasedAccess: true,
                        dataLevelSecurity: true,
                        auditTrail: true,
                    },
                },
                // Performance Optimization
                performanceOptimization: {
                    caching: true,
                    compression: true,
                    batchProcessing: true,
                    parallelProcessing: true,
                    loadBalancing: true,
                    connectionPooling: true,
                },
            };
            const results = dohComplianceValidatorService.executeMalaffiEMRIntegrationTesting(mockMalaffiIntegrationData);
            setMalaffiTestingResults(results);
        }
        catch (error) {
            console.error("Error running Malaffi EMR integration tests:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const getIntegrationStatusColor = (score) => {
        if (score >= 95)
            return "text-green-600 bg-green-100 border-green-200";
        if (score >= 85)
            return "text-blue-600 bg-blue-100 border-blue-200";
        if (score >= 70)
            return "text-yellow-600 bg-yellow-100 border-yellow-200";
        return "text-red-600 bg-red-100 border-red-200";
    };
    const getIntegrationStatusIcon = (score) => {
        if (score >= 95)
            return _jsx(CheckCircle, { className: "w-4 h-4 text-green-500" });
        if (score >= 85)
            return _jsx(CheckCircle, { className: "w-4 h-4 text-blue-500" });
        if (score >= 70)
            return _jsx(AlertTriangle, { className: "w-4 h-4 text-yellow-500" });
        return _jsx(XCircle, { className: "w-4 h-4 text-red-500" });
    };
    return (_jsx("div", { className: "space-y-6", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: "Subtask 2.2.1: Malaffi EMR Integration Testing" }), _jsx(CardDescription, { children: "Comprehensive testing for bi-directional data synchronization, clinical document integration, and error handling with Malaffi EMR" })] }), _jsxs(Button, { onClick: runMalaffiIntegrationTests, disabled: loading, className: "flex items-center gap-2", children: [loading ? (_jsx(RefreshCw, { className: "w-4 h-4 animate-spin" })) : (_jsx(Network, { className: "w-4 h-4" })), loading
                                        ? "Running Integration Tests..."
                                        : "Run Malaffi Integration Tests"] })] }) }), malaffiTestingResults && (_jsxs(CardContent, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6", children: [_jsx(Card, { className: "border-blue-200 bg-blue-50", children: _jsxs(CardContent, { className: "pt-4", children: [_jsxs("div", { className: "text-2xl font-bold text-blue-900", children: [malaffiTestingResults.overallMalaffiIntegrationScore, "%"] }), _jsx("p", { className: "text-sm text-blue-600", children: "Overall Integration Score" })] }) }), _jsx(Card, { className: "border-green-200 bg-green-50", children: _jsxs(CardContent, { className: "pt-4", children: [_jsx("div", { className: "text-2xl font-bold text-green-900", children: malaffiTestingResults.malaffiTestingSummary.passedTests }), _jsx("p", { className: "text-sm text-green-600", children: "Tests Passed" })] }) }), _jsx(Card, { className: "border-red-200 bg-red-50", children: _jsxs(CardContent, { className: "pt-4", children: [_jsx("div", { className: "text-2xl font-bold text-red-900", children: malaffiTestingResults.malaffiTestingSummary.failedTests }), _jsx("p", { className: "text-sm text-red-600", children: "Tests Failed" })] }) }), _jsx(Card, { className: "border-purple-200 bg-purple-50", children: _jsxs(CardContent, { className: "pt-4", children: [_jsxs("div", { className: "text-2xl font-bold text-purple-900", children: [malaffiTestingResults.malaffiTestingSummary
                                                        .syncReliability, "%"] }), _jsx("p", { className: "text-sm text-purple-600", children: "Sync Reliability" })] }) })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { className: "border-l-4 border-l-blue-400", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: "text-lg", children: "Subtask 2.2.1.1: Bi-directional Data Synchronization" }), _jsx(CardDescription, { children: "Patient data pull from Malaffi, clinical document push to Malaffi, real-time sync monitoring, and sync failure recovery" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [getIntegrationStatusIcon(malaffiTestingResults.malaffiIntegrationResults
                                                                .biDirectionalDataSync.overallSyncScore), _jsxs(Badge, { className: getIntegrationStatusColor(malaffiTestingResults.malaffiIntegrationResults
                                                                    .biDirectionalDataSync.overallSyncScore), children: [malaffiTestingResults.malaffiIntegrationResults
                                                                        .biDirectionalDataSync.overallSyncScore, "%"] })] })] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: Object.entries(malaffiTestingResults.malaffiIntegrationResults
                                                        .biDirectionalDataSync.testResults).map(([testName, testResult]) => (_jsxs("div", { className: "p-3 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h4", { className: "font-medium text-sm capitalize", children: testName
                                                                            .replace(/([A-Z])/g, " $1")
                                                                            .replace("Test", "")
                                                                            .trim() }), getIntegrationStatusIcon(testResult.score)] }), _jsxs("div", { className: "text-lg font-bold", children: [testResult.score, "%"] }), _jsx(Progress, { value: testResult.score, className: "h-2 mt-1" }), _jsxs("div", { className: "text-xs text-gray-600 mt-1", children: ["Automation: ", testResult.automationScore, "%"] })] }, testName))) }), _jsxs("div", { className: "mt-4 p-4 bg-gray-50 rounded-lg", children: [_jsx("h4", { className: "font-medium mb-2", children: "Sync Performance Summary" }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-5 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Total Operations:" }), _jsx("span", { className: "ml-2", children: malaffiTestingResults.malaffiIntegrationResults
                                                                                .biDirectionalDataSync.syncPerformanceSummary
                                                                                .totalSyncOperations })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Successful:" }), _jsx("span", { className: "ml-2", children: malaffiTestingResults.malaffiIntegrationResults
                                                                                .biDirectionalDataSync.syncPerformanceSummary
                                                                                .successfulSyncs })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Failed:" }), _jsx("span", { className: "ml-2", children: malaffiTestingResults.malaffiIntegrationResults
                                                                                .biDirectionalDataSync.syncPerformanceSummary
                                                                                .failedSyncs })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Avg Time:" }), _jsxs("span", { className: "ml-2", children: [malaffiTestingResults.malaffiIntegrationResults
                                                                                    .biDirectionalDataSync.syncPerformanceSummary
                                                                                    .averageSyncTime, "s"] })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Real-time:" }), _jsx(Badge, { className: malaffiTestingResults.malaffiIntegrationResults
                                                                                .biDirectionalDataSync.syncPerformanceSummary
                                                                                .realTimeMonitoring
                                                                                ? "text-green-600 bg-green-100"
                                                                                : "text-red-600 bg-red-100", children: malaffiTestingResults.malaffiIntegrationResults
                                                                                .biDirectionalDataSync.syncPerformanceSummary
                                                                                .realTimeMonitoring
                                                                                ? "Active"
                                                                                : "Inactive" })] })] })] })] })] }), _jsxs(Card, { className: "border-l-4 border-l-green-400", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: "text-lg", children: "Subtask 2.2.1.2: Clinical Document Integration" }), _jsx(CardDescription, { children: "Care plan synchronization, assessment result sharing, medication list updates, and laboratory result integration" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [getIntegrationStatusIcon(malaffiTestingResults.malaffiIntegrationResults
                                                                .clinicalDocumentIntegration.overallDocumentScore), _jsxs(Badge, { className: getIntegrationStatusColor(malaffiTestingResults.malaffiIntegrationResults
                                                                    .clinicalDocumentIntegration.overallDocumentScore), children: [malaffiTestingResults.malaffiIntegrationResults
                                                                        .clinicalDocumentIntegration.overallDocumentScore, "%"] })] })] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: Object.entries(malaffiTestingResults.malaffiIntegrationResults
                                                        .clinicalDocumentIntegration.testResults).map(([testName, testResult]) => (_jsxs("div", { className: "p-3 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h4", { className: "font-medium text-sm capitalize", children: testName
                                                                            .replace(/([A-Z])/g, " $1")
                                                                            .replace("Test", "")
                                                                            .trim() }), getIntegrationStatusIcon(testResult.score)] }), _jsxs("div", { className: "text-lg font-bold", children: [testResult.score, "%"] }), _jsx(Progress, { value: testResult.score, className: "h-2 mt-1" }), _jsxs("div", { className: "text-xs text-gray-600 mt-1", children: ["Automation: ", testResult.automationScore, "%"] })] }, testName))) }), _jsxs("div", { className: "mt-4 p-4 bg-gray-50 rounded-lg", children: [_jsx("h4", { className: "font-medium mb-2", children: "Document Integration Summary" }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Total Document Types:" }), _jsx("span", { className: "ml-2", children: malaffiTestingResults.malaffiIntegrationResults
                                                                                .clinicalDocumentIntegration
                                                                                .documentIntegrationSummary.totalDocumentTypes })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Integrated:" }), _jsx("span", { className: "ml-2", children: malaffiTestingResults.malaffiIntegrationResults
                                                                                .clinicalDocumentIntegration
                                                                                .documentIntegrationSummary.integratedDocuments })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Pending:" }), _jsx("span", { className: "ml-2", children: malaffiTestingResults.malaffiIntegrationResults
                                                                                .clinicalDocumentIntegration
                                                                                .documentIntegrationSummary.pendingIntegration })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Accuracy:" }), _jsxs("span", { className: "ml-2", children: [malaffiTestingResults.malaffiIntegrationResults
                                                                                    .clinicalDocumentIntegration
                                                                                    .documentIntegrationSummary.integrationAccuracy, "%"] })] })] })] })] })] }), _jsxs(Card, { className: "border-l-4 border-l-purple-400", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: "text-lg", children: "Subtask 2.2.1.3: Error Handling and Recovery" }), _jsx(CardDescription, { children: "Network failure recovery, partial sync completion, data conflict resolution, and manual sync override functionality" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [getIntegrationStatusIcon(malaffiTestingResults.malaffiIntegrationResults
                                                                .errorHandlingRecovery.overallRecoveryScore), _jsxs(Badge, { className: getIntegrationStatusColor(malaffiTestingResults.malaffiIntegrationResults
                                                                    .errorHandlingRecovery.overallRecoveryScore), children: [malaffiTestingResults.malaffiIntegrationResults
                                                                        .errorHandlingRecovery.overallRecoveryScore, "%"] })] })] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: Object.entries(malaffiTestingResults.malaffiIntegrationResults
                                                        .errorHandlingRecovery.testResults).map(([testName, testResult]) => (_jsxs("div", { className: "p-3 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h4", { className: "font-medium text-sm capitalize", children: testName
                                                                            .replace(/([A-Z])/g, " $1")
                                                                            .replace("Test", "")
                                                                            .trim() }), getIntegrationStatusIcon(testResult.score)] }), _jsxs("div", { className: "text-lg font-bold", children: [testResult.score, "%"] }), _jsx(Progress, { value: testResult.score, className: "h-2 mt-1" }), _jsxs("div", { className: "text-xs text-gray-600 mt-1", children: ["Automation: ", testResult.automationScore, "%"] })] }, testName))) }), _jsxs("div", { className: "mt-4 p-4 bg-gray-50 rounded-lg", children: [_jsx("h4", { className: "font-medium mb-2", children: "Error Handling Summary" }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Total Error Scenarios:" }), _jsx("span", { className: "ml-2", children: malaffiTestingResults.malaffiIntegrationResults
                                                                                .errorHandlingRecovery.errorHandlingSummary
                                                                                .totalErrorScenarios })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Handled:" }), _jsx("span", { className: "ml-2", children: malaffiTestingResults.malaffiIntegrationResults
                                                                                .errorHandlingRecovery.errorHandlingSummary
                                                                                .handledErrors })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Unhandled:" }), _jsx("span", { className: "ml-2", children: malaffiTestingResults.malaffiIntegrationResults
                                                                                .errorHandlingRecovery.errorHandlingSummary
                                                                                .unhandledErrors })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Recovery Rate:" }), _jsxs("span", { className: "ml-2", children: [malaffiTestingResults.malaffiIntegrationResults
                                                                                    .errorHandlingRecovery.errorHandlingSummary
                                                                                    .recoverySuccessRate, "%"] })] })] })] })] })] })] }), (malaffiTestingResults.criticalIssues.length > 0 ||
                            malaffiTestingResults.recommendations.length > 0) && (_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6", children: [malaffiTestingResults.criticalIssues.length > 0 && (_jsxs(Card, { className: "border-red-200", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "text-red-800 flex items-center gap-2", children: [_jsx(AlertOctagon, { className: "w-5 h-5" }), "Critical Issues (", malaffiTestingResults.criticalIssues.length, ")"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-2", children: malaffiTestingResults.criticalIssues.map((issue, index) => (_jsxs("div", { className: "flex items-start gap-2 p-2 bg-red-50 rounded", children: [_jsx(XCircle, { className: "w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" }), _jsx("span", { className: "text-sm text-red-700", children: issue })] }, index))) }) })] })), malaffiTestingResults.recommendations.length > 0 && (_jsxs(Card, { className: "border-blue-200", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "text-blue-800 flex items-center gap-2", children: [_jsx(Target, { className: "w-5 h-5" }), "Recommendations (", malaffiTestingResults.recommendations.length, ")"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-2", children: malaffiTestingResults.recommendations.map((recommendation, index) => (_jsxs("div", { className: "flex items-start gap-2 p-2 bg-blue-50 rounded", children: [_jsx(CheckCircle, { className: "w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" }), _jsx("span", { className: "text-sm text-blue-700", children: recommendation })] }, index))) }) })] }))] }))] })), !malaffiTestingResults && (_jsx(CardContent, { children: _jsxs("div", { className: "text-center py-8", children: [_jsx(Network, { className: "w-12 h-12 mx-auto text-gray-400 mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "Malaffi EMR Integration Testing Ready" }), _jsx("p", { className: "text-gray-600 mb-4", children: "Click \"Run Malaffi Integration Tests\" to execute comprehensive testing for EMR integration capabilities." }), _jsxs("div", { className: "text-sm text-gray-500", children: [_jsx("p", { children: "\u2022 Subtask 2.2.1.1: Bi-directional data synchronization (patient data pull, clinical document push, real-time monitoring, failure recovery)" }), _jsx("p", { children: "\u2022 Subtask 2.2.1.2: Clinical document integration (care plans, assessments, medications, lab results)" }), _jsx("p", { children: "\u2022 Subtask 2.2.1.3: Error handling and recovery (network failures, partial sync, data conflicts, manual override)" })] })] }) }))] }) }));
}
// Phase 2 Testing Results Component
function Phase2TestingResults({ facilityId }) {
    const [testingResults, setTestingResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedTest, setSelectedTest] = useState(null);
    const runPhase2Tests = async () => {
        try {
            setLoading(true);
            // Mock patient data for comprehensive testing
            const mockPatientData = {
                patientId: "TEST-001",
                demographics: { name: "Test Patient", age: 65 },
                medicalHistory: { conditions: ["diabetes", "hypertension"] },
                functionalStatus: {
                    mobility: "limited",
                    adl: { bathing: "assistance", dressing: "independent" },
                },
                cognitiveStatus: { orientation: "oriented", memory: "intact" },
                socialSupport: { caregiver: true, family: "available" },
                environmentalFactors: { homeAccess: "adequate", safety: "assessed" },
                medical_conditions: [
                    { severity: "moderate", prevents_leaving_home: true },
                ],
                functional_limitations: {
                    mobility: { severity: "severe" },
                    adl: { bathing: "dependent", dressing: "assistance" },
                },
                safetyRisks: [
                    { riskType: "fall", severity: "high", mitigationRequired: true },
                ],
                physician_orders: ["home_confinement"],
                medical_contraindications: ["leaving_home"],
                clinical_justification: "Patient requires continuous monitoring due to unstable medical condition",
                absences: { medical: 1, religious: 0, family: 0 },
                absences_last_month: 1,
                faceToFaceEncounter: {
                    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                    reason: "Comprehensive assessment for homecare eligibility",
                    homeboundJustification: "Patient unable to leave home without significant effort due to mobility limitations",
                },
                serviceStartDate: new Date().toISOString(),
                postCareEncounter: {
                    scheduled: true,
                    scheduledDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
                    automatedTracking: true,
                },
                physicianCertification: {
                    digitalSignature: true,
                    automatedWorkflow: true,
                    timestampValidated: true,
                    licenseVerified: true,
                },
                clinicalCondition: {
                    primaryDiagnosis: "Chronic heart failure with reduced ejection fraction",
                    secondaryConditions: ["diabetes mellitus type 2", "hypertension"],
                    functionalStatus: { mobility: "severely limited" },
                    prognosis: "Stable with appropriate management and monitoring",
                },
                functionalLimitations: {
                    adl: {
                        bathing: "dependent",
                        dressing: "assistance",
                        toileting: "assistance",
                    },
                    iadl: {
                        cooking: "unable",
                        shopping: "unable",
                        medication: "assistance",
                    },
                    mobility: { severity: "severe", impactOnDailyLiving: true },
                    cognitive: { impactOnDailyLiving: false },
                },
                safetyRisks: {
                    fallRisk: { severity: "high", mitigationRequired: true },
                    medicationSafety: { riskType: "polypharmacy" },
                    environmental: ["stairs", "loose rugs"],
                    emergencyResponse: { planInPlace: true },
                },
                skilledCareRequirements: {
                    nursing: { complexity: "advanced", frequency: "daily" },
                    therapy: ["physical therapy", "occupational therapy"],
                    equipment: ["hospital bed", "oxygen concentrator"],
                    professionalRequired: "registered nurse",
                },
                medicalStability: {
                    vitalSigns: { stable: true },
                    medications: { stable: false },
                    conditionProgression: { status: "stable" },
                    hospitalizationRisk: { level: "moderate" },
                },
            };
            const results = dohComplianceValidatorService.executePhase2ComprehensiveTesting(mockPatientData);
            setTestingResults(results);
        }
        catch (error) {
            console.error("Error running Phase 2 tests:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const getTestStatusColor = (score) => {
        if (score >= 95)
            return "text-green-600 bg-green-100 border-green-200";
        if (score >= 85)
            return "text-blue-600 bg-blue-100 border-blue-200";
        if (score >= 70)
            return "text-yellow-600 bg-yellow-100 border-yellow-200";
        return "text-red-600 bg-red-100 border-red-200";
    };
    const getTestStatusIcon = (score) => {
        if (score >= 95)
            return _jsx(CheckCircle, { className: "w-4 h-4 text-green-500" });
        if (score >= 85)
            return _jsx(CheckCircle, { className: "w-4 h-4 text-blue-500" });
        if (score >= 70)
            return _jsx(AlertTriangle, { className: "w-4 h-4 text-yellow-500" });
        return _jsx(XCircle, { className: "w-4 h-4 text-red-500" });
    };
    return (_jsx("div", { className: "space-y-6", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: "Phase 2: Comprehensive Functional Testing" }), _jsx(CardDescription, { children: "DOH Compliance Testing for New Standards - Subtasks 2.1.1.1 through 2.1.1.3" })] }), _jsxs(Button, { onClick: runPhase2Tests, disabled: loading, className: "flex items-center gap-2", children: [loading ? (_jsx(RefreshCw, { className: "w-4 h-4 animate-spin" })) : (_jsx(Target, { className: "w-4 h-4" })), loading ? "Running Tests..." : "Run Phase 2 Tests"] })] }) }), testingResults && (_jsxs(CardContent, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6", children: [_jsx(Card, { className: "border-blue-200 bg-blue-50", children: _jsxs(CardContent, { className: "pt-4", children: [_jsxs("div", { className: "text-2xl font-bold text-blue-900", children: [testingResults.overallPhase2Score, "%"] }), _jsx("p", { className: "text-sm text-blue-600", children: "Overall Score" })] }) }), _jsx(Card, { className: "border-green-200 bg-green-50", children: _jsxs(CardContent, { className: "pt-4", children: [_jsx("div", { className: "text-2xl font-bold text-green-900", children: testingResults.testingSummary.passedTests }), _jsx("p", { className: "text-sm text-green-600", children: "Tests Passed" })] }) }), _jsx(Card, { className: "border-red-200 bg-red-50", children: _jsxs(CardContent, { className: "pt-4", children: [_jsx("div", { className: "text-2xl font-bold text-red-900", children: testingResults.testingSummary.failedTests }), _jsx("p", { className: "text-sm text-red-600", children: "Tests Failed" })] }) }), _jsx(Card, { className: "border-purple-200 bg-purple-50", children: _jsxs(CardContent, { className: "pt-4", children: [_jsx("div", { className: "text-sm font-bold text-purple-900 capitalize", children: testingResults.testingSummary.complianceLevel.replace("_", " ") }), _jsx("p", { className: "text-sm text-purple-600", children: "Compliance Level" })] }) })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { className: "border-l-4 border-l-blue-400", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: "text-lg", children: "Subtask 2.1.1.1: Homebound Assessment Compliance" }), _jsx(CardDescription, { children: "Digital verification, illness/injury automation, contraindication documentation, absence tracking" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [getTestStatusIcon(testingResults.phase2Results
                                                                .homeboundAssessmentCompliance.overallComplianceScore), _jsxs(Badge, { className: getTestStatusColor(testingResults.phase2Results
                                                                    .homeboundAssessmentCompliance
                                                                    .overallComplianceScore), children: [testingResults.phase2Results
                                                                        .homeboundAssessmentCompliance
                                                                        .overallComplianceScore, "%"] })] })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: Object.entries(testingResults.phase2Results.homeboundAssessmentCompliance
                                                    .testResults).map(([testName, testResult]) => (_jsxs("div", { className: "p-3 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h4", { className: "font-medium text-sm capitalize", children: testName
                                                                        .replace(/([A-Z])/g, " $1")
                                                                        .replace("Test", "")
                                                                        .trim() }), getTestStatusIcon(testResult.score)] }), _jsxs("div", { className: "text-lg font-bold", children: [testResult.score, "%"] }), _jsx(Progress, { value: testResult.score, className: "h-2 mt-1" })] }, testName))) }) })] }), _jsxs(Card, { className: "border-l-4 border-l-green-400", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: "text-lg", children: "Subtask 2.1.1.2: Face-to-Face Encounter Requirements" }), _jsx(CardDescription, { children: "30-day prior documentation, 60-day post-care tracking, physician certification, clinical documentation" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [getTestStatusIcon(testingResults.phase2Results
                                                                .faceToFaceEncounterRequirements
                                                                .overallComplianceScore), _jsxs(Badge, { className: getTestStatusColor(testingResults.phase2Results
                                                                    .faceToFaceEncounterRequirements
                                                                    .overallComplianceScore), children: [testingResults.phase2Results
                                                                        .faceToFaceEncounterRequirements
                                                                        .overallComplianceScore, "%"] })] })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: Object.entries(testingResults.phase2Results
                                                    .faceToFaceEncounterRequirements.testResults).map(([testName, testResult]) => (_jsxs("div", { className: "p-3 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h4", { className: "font-medium text-sm capitalize", children: testName
                                                                        .replace(/([A-Z])/g, " $1")
                                                                        .replace("Test", "")
                                                                        .trim() }), getTestStatusIcon(testResult.score)] }), _jsxs("div", { className: "text-lg font-bold", children: [testResult.score, "%"] }), _jsx(Progress, { value: testResult.score, className: "h-2 mt-1" })] }, testName))) }) })] }), _jsxs(Card, { className: "border-l-4 border-l-purple-400", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: "text-lg", children: "Subtask 2.1.1.3: Medical Necessity Documentation" }), _jsx(CardDescription, { children: "Functional limitations, safety risks, skilled care requirements, medical stability assessment" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [getTestStatusIcon(testingResults.phase2Results
                                                                .medicalNecessityDocumentation.overallComplianceScore), _jsxs(Badge, { className: getTestStatusColor(testingResults.phase2Results
                                                                    .medicalNecessityDocumentation
                                                                    .overallComplianceScore), children: [testingResults.phase2Results
                                                                        .medicalNecessityDocumentation
                                                                        .overallComplianceScore, "%"] })] })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: Object.entries(testingResults.phase2Results.medicalNecessityDocumentation
                                                    .testResults).map(([testName, testResult]) => (_jsxs("div", { className: "p-3 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h4", { className: "font-medium text-sm capitalize", children: testName
                                                                        .replace(/([A-Z])/g, " $1")
                                                                        .replace("Test", "")
                                                                        .trim() }), getTestStatusIcon(testResult.score)] }), _jsxs("div", { className: "text-lg font-bold", children: [testResult.score, "%"] }), _jsx(Progress, { value: testResult.score, className: "h-2 mt-1" })] }, testName))) }) })] })] }), (testingResults.criticalIssues.length > 0 ||
                            testingResults.recommendations.length > 0) && (_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6", children: [testingResults.criticalIssues.length > 0 && (_jsxs(Card, { className: "border-red-200", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "text-red-800 flex items-center gap-2", children: [_jsx(AlertTriangle, { className: "w-5 h-5" }), "Critical Issues (", testingResults.criticalIssues.length, ")"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-2", children: testingResults.criticalIssues.map((issue, index) => (_jsxs("div", { className: "flex items-start gap-2 p-2 bg-red-50 rounded", children: [_jsx(XCircle, { className: "w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" }), _jsx("span", { className: "text-sm text-red-700", children: issue })] }, index))) }) })] })), testingResults.recommendations.length > 0 && (_jsxs(Card, { className: "border-blue-200", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "text-blue-800 flex items-center gap-2", children: [_jsx(Target, { className: "w-5 h-5" }), "Recommendations (", testingResults.recommendations.length, ")"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-2", children: testingResults.recommendations.map((recommendation, index) => (_jsxs("div", { className: "flex items-start gap-2 p-2 bg-blue-50 rounded", children: [_jsx(CheckCircle, { className: "w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" }), _jsx("span", { className: "text-sm text-blue-700", children: recommendation })] }, index))) }) })] }))] }))] })), !testingResults && (_jsx(CardContent, { children: _jsxs("div", { className: "text-center py-8", children: [_jsx(Target, { className: "w-12 h-12 mx-auto text-gray-400 mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "Phase 2 Testing Ready" }), _jsx("p", { className: "text-gray-600 mb-4", children: "Click \"Run Phase 2 Tests\" to execute comprehensive functional testing for new DOH standards." }), _jsxs("div", { className: "text-sm text-gray-500", children: [_jsx("p", { children: "\u2022 Subtask 2.1.1.1: Homebound assessment compliance" }), _jsx("p", { children: "\u2022 Subtask 2.1.1.2: Face-to-face encounter requirements" }), _jsx("p", { children: "\u2022 Subtask 2.1.1.3: Medical necessity documentation" })] })] }) }))] }) }));
}
