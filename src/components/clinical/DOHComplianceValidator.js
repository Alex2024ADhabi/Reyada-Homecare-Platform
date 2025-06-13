import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, AlertTriangle, Clock, Shield, FileText, Users, Settings, } from "lucide-react";
const DOHComplianceValidator = () => {
    const [overallScore, setOverallScore] = useState(0);
    const [activeTab, setActiveTab] = useState("overview");
    const [realTimeAlerts, setRealTimeAlerts] = useState([]);
    const [lastUpdate, setLastUpdate] = useState(new Date());
    // 12 Comprehensive Compliance Rules
    const complianceRules = [
        {
            id: "HR-001",
            category: "HR",
            title: "Staff Licensing Verification",
            description: "All clinical staff must have valid DOH licenses",
            status: "compliant",
            severity: "critical",
            lastChecked: "2024-01-15T10:00:00Z",
            evidence: [
                "License verification system active",
                "All staff licenses current",
            ],
            recommendations: ["Implement automated renewal reminders"],
        },
        {
            id: "HR-002",
            category: "HR",
            title: "Continuing Education Compliance",
            description: "Staff must complete required CE hours annually",
            status: "partially-compliant",
            severity: "high",
            lastChecked: "2024-01-15T10:00:00Z",
            evidence: ["85% staff compliant with CE requirements"],
            recommendations: ["Schedule CE sessions for remaining 15% of staff"],
        },
        {
            id: "QM-001",
            category: "Quality Management",
            title: "Quality Metrics Tracking",
            description: "Systematic tracking of quality indicators",
            status: "compliant",
            severity: "high",
            lastChecked: "2024-01-15T10:00:00Z",
            evidence: ["Quality dashboard operational", "Monthly reports generated"],
            recommendations: ["Expand metrics to include patient satisfaction"],
        },
        {
            id: "QM-002",
            category: "Quality Management",
            title: "Incident Reporting System",
            description: "Comprehensive incident reporting and follow-up",
            status: "compliant",
            severity: "critical",
            lastChecked: "2024-01-15T10:00:00Z",
            evidence: ["24/7 reporting system active", "All incidents tracked"],
            recommendations: [
                "Implement predictive analytics for incident prevention",
            ],
        },
        {
            id: "CP-001",
            category: "Clinical Practices",
            title: "Evidence-Based Care Protocols",
            description: "All care follows evidence-based protocols",
            status: "compliant",
            severity: "high",
            lastChecked: "2024-01-15T10:00:00Z",
            evidence: ["Protocols updated quarterly", "95% adherence rate"],
            recommendations: ["Develop specialty-specific protocols"],
        },
        {
            id: "CP-002",
            category: "Clinical Practices",
            title: "Patient Assessment Documentation",
            description: "Complete 9-domain assessments for all patients",
            status: "partially-compliant",
            severity: "high",
            lastChecked: "2024-01-15T10:00:00Z",
            evidence: ["90% of assessments complete"],
            recommendations: ["Implement mandatory assessment completion alerts"],
        },
        {
            id: "IC-001",
            category: "Infection Control",
            title: "Hand Hygiene Compliance",
            description: "Staff hand hygiene compliance monitoring",
            status: "compliant",
            severity: "critical",
            lastChecked: "2024-01-15T10:00:00Z",
            evidence: ["95% compliance rate", "Regular audits conducted"],
            recommendations: ["Install additional hand sanitizer stations"],
        },
        {
            id: "IC-002",
            category: "Infection Control",
            title: "PPE Usage Protocols",
            description: "Proper PPE usage and disposal procedures",
            status: "compliant",
            severity: "high",
            lastChecked: "2024-01-15T10:00:00Z",
            evidence: ["PPE training completed", "Adequate supply maintained"],
            recommendations: ["Quarterly PPE competency assessments"],
        },
        {
            id: "FS-001",
            category: "Facility Safety",
            title: "Emergency Preparedness",
            description: "Emergency response plans and drills",
            status: "compliant",
            severity: "critical",
            lastChecked: "2024-01-15T10:00:00Z",
            evidence: ["Emergency plans updated", "Quarterly drills conducted"],
            recommendations: ["Expand disaster recovery procedures"],
        },
        {
            id: "EM-001",
            category: "Equipment Management",
            title: "Medical Equipment Calibration",
            description: "Regular calibration and maintenance of medical equipment",
            status: "compliant",
            severity: "high",
            lastChecked: "2024-01-15T10:00:00Z",
            evidence: ["All equipment calibrated", "Maintenance logs current"],
            recommendations: ["Implement predictive maintenance system"],
        },
        {
            id: "IM-001",
            category: "Information Management",
            title: "Data Security and Privacy",
            description: "Patient data protection and privacy compliance",
            status: "compliant",
            severity: "critical",
            lastChecked: "2024-01-15T10:00:00Z",
            evidence: ["Encryption implemented", "Access controls active"],
            recommendations: ["Regular security penetration testing"],
        },
        {
            id: "GP-001",
            category: "Governance & Policies",
            title: "Policy Management System",
            description: "Current policies and procedures management",
            status: "partially-compliant",
            severity: "medium",
            lastChecked: "2024-01-15T10:00:00Z",
            evidence: ["80% of policies updated within last year"],
            recommendations: ["Accelerate policy review cycle"],
        },
    ];
    // 8-Category Audit Checklist
    const auditCategories = [
        {
            id: "hr",
            name: "Human Resources",
            icon: _jsx(Users, { className: "h-5 w-5" }),
            score: 85,
            maxScore: 100,
            rules: complianceRules.filter((rule) => rule.category === "HR"),
            status: "partially-compliant",
        },
        {
            id: "quality",
            name: "Quality Management",
            icon: _jsx(Shield, { className: "h-5 w-5" }),
            score: 95,
            maxScore: 100,
            rules: complianceRules.filter((rule) => rule.category === "Quality Management"),
            status: "compliant",
        },
        {
            id: "clinical",
            name: "Clinical Practices",
            icon: _jsx(FileText, { className: "h-5 w-5" }),
            score: 90,
            maxScore: 100,
            rules: complianceRules.filter((rule) => rule.category === "Clinical Practices"),
            status: "partially-compliant",
        },
        {
            id: "infection",
            name: "Infection Control",
            icon: _jsx(Shield, { className: "h-5 w-5" }),
            score: 98,
            maxScore: 100,
            rules: complianceRules.filter((rule) => rule.category === "Infection Control"),
            status: "compliant",
        },
        {
            id: "facility",
            name: "Facility Safety",
            icon: _jsx(Settings, { className: "h-5 w-5" }),
            score: 92,
            maxScore: 100,
            rules: complianceRules.filter((rule) => rule.category === "Facility Safety"),
            status: "compliant",
        },
        {
            id: "equipment",
            name: "Equipment Management",
            icon: _jsx(Settings, { className: "h-5 w-5" }),
            score: 88,
            maxScore: 100,
            rules: complianceRules.filter((rule) => rule.category === "Equipment Management"),
            status: "compliant",
        },
        {
            id: "information",
            name: "Information Management",
            icon: _jsx(FileText, { className: "h-5 w-5" }),
            score: 96,
            maxScore: 100,
            rules: complianceRules.filter((rule) => rule.category === "Information Management"),
            status: "compliant",
        },
        {
            id: "governance",
            name: "Governance & Policies",
            icon: _jsx(Users, { className: "h-5 w-5" }),
            score: 80,
            maxScore: 100,
            rules: complianceRules.filter((rule) => rule.category === "Governance & Policies"),
            status: "partially-compliant",
        },
    ];
    // DOH 5-Level Patient Safety Taxonomy
    const patientSafetyIncidents = [
        {
            id: "PSI-001",
            level: 1,
            description: "Near miss - medication error caught before administration",
            category: "Medication Safety",
            reportedDate: "2024-01-14T14:30:00Z",
            status: "resolved",
            severity: "low",
        },
        {
            id: "PSI-002",
            level: 2,
            description: "Minor patient fall with no injury",
            category: "Patient Safety",
            reportedDate: "2024-01-13T09:15:00Z",
            status: "investigating",
            severity: "moderate",
        },
        {
            id: "PSI-003",
            level: 3,
            description: "Equipment malfunction requiring intervention",
            category: "Equipment Safety",
            reportedDate: "2024-01-12T16:45:00Z",
            status: "resolved",
            severity: "high",
        },
    ];
    // Calculate overall compliance score
    useEffect(() => {
        const totalScore = auditCategories.reduce((sum, category) => sum + category.score, 0);
        const maxTotalScore = auditCategories.reduce((sum, category) => sum + category.maxScore, 0);
        setOverallScore(Math.round((totalScore / maxTotalScore) * 100));
    }, []);
    // Real-time monitoring simulation
    useEffect(() => {
        const interval = setInterval(() => {
            const alerts = [];
            // Check for critical non-compliance
            const criticalIssues = complianceRules.filter((rule) => rule.severity === "critical" && rule.status !== "compliant");
            if (criticalIssues.length > 0) {
                alerts.push(`${criticalIssues.length} critical compliance issues require immediate attention`);
            }
            // Check for overdue assessments
            const overdueRules = complianceRules.filter((rule) => {
                const lastChecked = new Date(rule.lastChecked);
                const daysSinceCheck = (Date.now() - lastChecked.getTime()) / (1000 * 60 * 60 * 24);
                return daysSinceCheck > 30;
            });
            if (overdueRules.length > 0) {
                alerts.push(`${overdueRules.length} compliance checks are overdue`);
            }
            setRealTimeAlerts(alerts);
            setLastUpdate(new Date());
        }, 30000); // Update every 30 seconds
        return () => clearInterval(interval);
    }, []);
    const getStatusIcon = (status) => {
        switch (status) {
            case "compliant":
                return _jsx(CheckCircle, { className: "h-4 w-4 text-green-500" });
            case "non-compliant":
                return _jsx(XCircle, { className: "h-4 w-4 text-red-500" });
            case "partially-compliant":
                return _jsx(AlertTriangle, { className: "h-4 w-4 text-yellow-500" });
            default:
                return _jsx(Clock, { className: "h-4 w-4 text-gray-500" });
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case "compliant":
                return "bg-green-100 text-green-800";
            case "non-compliant":
                return "bg-red-100 text-red-800";
            case "partially-compliant":
                return "bg-yellow-100 text-yellow-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };
    const getSafetyLevelColor = (level) => {
        const colors = {
            1: "bg-blue-100 text-blue-800",
            2: "bg-green-100 text-green-800",
            3: "bg-yellow-100 text-yellow-800",
            4: "bg-orange-100 text-orange-800",
            5: "bg-red-100 text-red-800",
        };
        return colors[level] || "bg-gray-100 text-gray-800";
    };
    return (_jsx("div", { className: "min-h-screen bg-gray-50 p-6", children: _jsxs("div", { className: "max-w-7xl mx-auto space-y-6", children: [_jsx("div", { className: "bg-white rounded-lg shadow-sm p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "DOH Compliance System" }), _jsx("p", { className: "text-gray-600 mt-2", children: "Comprehensive compliance monitoring and validation" })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "text-3xl font-bold text-blue-600", children: [overallScore, "%"] }), _jsx("div", { className: "text-sm text-gray-500", children: "Overall Compliance" }), _jsxs("div", { className: "text-xs text-gray-400 mt-1", children: ["Last updated: ", lastUpdate.toLocaleTimeString()] })] })] }) }), realTimeAlerts.length > 0 && (_jsx("div", { className: "space-y-2", children: realTimeAlerts.map((alert, index) => (_jsxs(Alert, { className: "border-orange-200 bg-orange-50", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsx(AlertDescription, { className: "text-orange-800", children: alert })] }, index))) })), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "space-y-6", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "audit", children: "8-Category Audit" }), _jsx(TabsTrigger, { value: "safety", children: "Patient Safety" }), _jsx(TabsTrigger, { value: "rules", children: "Compliance Rules" })] }), _jsx(TabsContent, { value: "overview", className: "space-y-6", children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: auditCategories.map((category) => (_jsxs(Card, { className: "bg-white", children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [category.icon, _jsx(CardTitle, { className: "text-sm font-medium", children: category.name })] }), getStatusIcon(category.status)] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("span", { className: "text-2xl font-bold", children: [category.score, "%"] }), _jsx(Badge, { className: getStatusColor(category.status), children: category.status.replace("-", " ") })] }), _jsx(Progress, { value: category.score, className: "h-2" }), _jsxs("div", { className: "text-xs text-gray-500", children: [category.rules.length, " rules evaluated"] })] }) })] }, category.id))) }) }), _jsx(TabsContent, { value: "audit", className: "space-y-6", children: _jsx("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: auditCategories.map((category) => (_jsxs(Card, { className: "bg-white", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [category.icon, _jsx(CardTitle, { children: category.name })] }), _jsxs(Badge, { className: getStatusColor(category.status), children: [category.score, "% Compliant"] })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsx(Progress, { value: category.score, className: "h-3" }), _jsx("div", { className: "space-y-2", children: category.rules.map((rule) => (_jsxs("div", { className: "flex items-center justify-between p-2 bg-gray-50 rounded", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [getStatusIcon(rule.status), _jsx("span", { className: "text-sm font-medium", children: rule.title })] }), _jsx(Badge, { variant: "outline", className: "text-xs", children: rule.severity })] }, rule.id))) })] }) })] }, category.id))) }) }), _jsx(TabsContent, { value: "safety", className: "space-y-6", children: _jsxs(Card, { className: "bg-white", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "DOH 5-Level Patient Safety Taxonomy" }), _jsx("p", { className: "text-sm text-gray-600", children: "Classification system for patient safety incidents and near misses" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "grid grid-cols-5 gap-4 mb-6", children: [1, 2, 3, 4, 5].map((level) => {
                                                        const levelNames = {
                                                            1: "Near Miss",
                                                            2: "No Harm",
                                                            3: "Minimal Harm",
                                                            4: "Moderate Harm",
                                                            5: "Severe Harm",
                                                        };
                                                        const count = patientSafetyIncidents.filter((i) => i.level === level).length;
                                                        return (_jsxs("div", { className: "text-center", children: [_jsx("div", { className: `w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${getSafetyLevelColor(level)}`, children: _jsx("span", { className: "font-bold", children: level }) }), _jsx("div", { className: "text-xs font-medium", children: levelNames[level] }), _jsx("div", { className: "text-lg font-bold", children: count })] }, level));
                                                    }) }), _jsx("div", { className: "space-y-3", children: patientSafetyIncidents.map((incident) => (_jsxs("div", { className: "border rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs(Badge, { className: getSafetyLevelColor(incident.level), children: ["Level ", incident.level] }), _jsx("span", { className: "font-medium", children: incident.category })] }), _jsx(Badge, { variant: "outline", children: incident.status })] }), _jsx("p", { className: "text-sm text-gray-600 mb-2", children: incident.description }), _jsxs("div", { className: "text-xs text-gray-500", children: ["Reported:", " ", new Date(incident.reportedDate).toLocaleDateString()] })] }, incident.id))) })] }) })] }) }), _jsx(TabsContent, { value: "rules", className: "space-y-6", children: _jsxs(Card, { className: "bg-white", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "12 Comprehensive Compliance Rules" }), _jsx("p", { className: "text-sm text-gray-600", children: "Automated validation rules ensuring DOH compliance standards" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: complianceRules.map((rule) => (_jsxs("div", { className: "border rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [getStatusIcon(rule.status), _jsx("span", { className: "font-medium", children: rule.title }), _jsx(Badge, { variant: "outline", children: rule.id })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Badge, { className: getStatusColor(rule.status), children: rule.status.replace("-", " ") }), _jsx(Badge, { variant: "outline", className: `${rule.severity === "critical"
                                                                            ? "border-red-500 text-red-700"
                                                                            : rule.severity === "high"
                                                                                ? "border-orange-500 text-orange-700"
                                                                                : rule.severity === "medium"
                                                                                    ? "border-yellow-500 text-yellow-700"
                                                                                    : "border-gray-500 text-gray-700"}`, children: rule.severity })] })] }), _jsx("p", { className: "text-sm text-gray-600 mb-3", children: rule.description }), rule.evidence && rule.evidence.length > 0 && (_jsxs("div", { className: "mb-3", children: [_jsx("h4", { className: "text-xs font-medium text-gray-700 mb-1", children: "Evidence:" }), _jsx("ul", { className: "text-xs text-gray-600 space-y-1", children: rule.evidence.map((item, index) => (_jsxs("li", { className: "flex items-center space-x-1", children: [_jsx(CheckCircle, { className: "h-3 w-3 text-green-500" }), _jsx("span", { children: item })] }, index))) })] })), rule.recommendations &&
                                                        rule.recommendations.length > 0 && (_jsxs("div", { children: [_jsx("h4", { className: "text-xs font-medium text-gray-700 mb-1", children: "Recommendations:" }), _jsx("ul", { className: "text-xs text-gray-600 space-y-1", children: rule.recommendations.map((item, index) => (_jsxs("li", { className: "flex items-center space-x-1", children: [_jsx(AlertTriangle, { className: "h-3 w-3 text-yellow-500" }), _jsx("span", { children: item })] }, index))) })] })), _jsxs("div", { className: "text-xs text-gray-500 mt-3", children: ["Last checked:", " ", new Date(rule.lastChecked).toLocaleString()] })] }, rule.id))) }) })] }) })] }), _jsxs("div", { className: "flex justify-center space-x-4", children: [_jsx(Button, { onClick: () => window.location.reload(), className: "bg-blue-600 hover:bg-blue-700", children: "Refresh Compliance Check" }), _jsx(Button, { variant: "outline", onClick: () => alert("Generating compliance report..."), children: "Generate Report" }), _jsx(Button, { variant: "outline", onClick: () => alert("Exporting data..."), children: "Export Data" })] })] }) }));
};
export default DOHComplianceValidator;
