import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, CheckCircle, XCircle, AlertTriangle, Calendar, Clock, User, Wheelchair, Eye, Upload, Download, RefreshCw, Search, Filter, } from "lucide-react";
import { cn } from "@/lib/utils";
const DocumentComplianceChecker = ({ className = "", }) => {
    const [patientDocuments, setPatientDocuments] = useState([]);
    const [wheelchairApprovals, setWheelchairApprovals] = useState([]);
    const [faceToFaceAssessments, setFaceToFaceAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [refreshing, setRefreshing] = useState(false);
    useEffect(() => {
        loadDocumentData();
    }, []);
    const loadDocumentData = async () => {
        try {
            setLoading(true);
            // Mock patient documents data
            const mockPatientDocuments = [
                {
                    id: "pd-001",
                    patientId: "pat-001",
                    patientName: "Ahmed Al Mansouri",
                    episodeId: "ep-001",
                    documents: [
                        {
                            id: "doc-001",
                            name: "Initial Assessment",
                            type: "assessment",
                            status: "valid",
                            uploadDate: "2024-03-01",
                            expiryDate: "2024-06-01",
                            lastReviewDate: "2024-03-01",
                            reviewedBy: "Dr. Sarah Ahmed",
                            fileSize: 2048,
                            fileType: "PDF",
                            version: 1,
                            isRequired: true,
                            complianceNotes: [
                                "Complete assessment with all required sections",
                            ],
                        },
                        {
                            id: "doc-002",
                            name: "Treatment Plan",
                            type: "treatment_plan",
                            status: "valid",
                            uploadDate: "2024-03-02",
                            lastReviewDate: "2024-03-02",
                            reviewedBy: "Dr. Sarah Ahmed",
                            fileSize: 1536,
                            fileType: "PDF",
                            version: 2,
                            isRequired: true,
                            complianceNotes: ["Updated treatment plan with goals"],
                        },
                        {
                            id: "doc-003",
                            name: "Face-to-Face Assessment",
                            type: "face_to_face",
                            status: "expired",
                            uploadDate: "2024-01-15",
                            expiryDate: "2024-03-15",
                            lastReviewDate: "2024-01-15",
                            reviewedBy: "Dr. Sarah Ahmed",
                            fileSize: 1024,
                            fileType: "PDF",
                            version: 1,
                            isRequired: true,
                            complianceNotes: ["Assessment expired - requires renewal"],
                        },
                    ],
                    overallCompliance: 75,
                    lastUpdated: "2024-03-15",
                    criticalIssues: ["Face-to-face assessment expired"],
                    upcomingExpirations: [],
                },
                {
                    id: "pd-002",
                    patientId: "pat-002",
                    patientName: "Fatima Al Zahra",
                    episodeId: "ep-002",
                    documents: [
                        {
                            id: "doc-004",
                            name: "Wheelchair Pre-Approval",
                            type: "wheelchair_preapproval",
                            status: "valid",
                            uploadDate: "2024-03-10",
                            expiryDate: "2024-09-10",
                            lastReviewDate: "2024-03-12",
                            reviewedBy: "Dr. Mohammed Hassan",
                            fileSize: 3072,
                            fileType: "PDF",
                            version: 1,
                            isRequired: true,
                            complianceNotes: [
                                "Approved for manual wheelchair",
                                "6-month validity",
                            ],
                        },
                        {
                            id: "doc-005",
                            name: "Progress Notes",
                            type: "progress_note",
                            status: "missing",
                            isRequired: true,
                            version: 0,
                            complianceNotes: ["Monthly progress notes required"],
                        },
                    ],
                    overallCompliance: 60,
                    lastUpdated: "2024-03-12",
                    criticalIssues: ["Progress notes missing"],
                    upcomingExpirations: [],
                },
            ];
            // Mock wheelchair approvals data
            const mockWheelchairApprovals = [
                {
                    id: "wa-001",
                    patientName: "Fatima Al Zahra",
                    requestDate: "2024-03-08",
                    approvalStatus: "approved",
                    expiryDate: "2024-09-08",
                    wheelchairType: "Manual Wheelchair - Standard",
                    justification: "Patient requires mobility assistance due to lower limb weakness",
                    supportingDocuments: [
                        {
                            id: "doc-006",
                            name: "Medical Assessment",
                            type: "assessment",
                            status: "valid",
                            uploadDate: "2024-03-08",
                            fileSize: 2048,
                            fileType: "PDF",
                            version: 1,
                            isRequired: true,
                            complianceNotes: ["Complete medical justification"],
                        },
                    ],
                    reviewNotes: [
                        "Approved for 6 months",
                        "Standard manual wheelchair suitable",
                    ],
                },
                {
                    id: "wa-002",
                    patientName: "Omar Al Rashid",
                    requestDate: "2024-03-15",
                    approvalStatus: "pending",
                    wheelchairType: "Electric Wheelchair - Advanced",
                    justification: "Patient requires powered mobility due to severe mobility limitations",
                    supportingDocuments: [
                        {
                            id: "doc-007",
                            name: "Specialist Report",
                            type: "assessment",
                            status: "pending_review",
                            uploadDate: "2024-03-15",
                            fileSize: 1536,
                            fileType: "PDF",
                            version: 1,
                            isRequired: true,
                            complianceNotes: ["Awaiting specialist review"],
                        },
                    ],
                    reviewNotes: ["Under review - requires additional documentation"],
                },
            ];
            // Mock face-to-face assessments data
            const mockFaceToFaceAssessments = [
                {
                    id: "fta-001",
                    patientName: "Ahmed Al Mansouri",
                    assessmentDate: "2024-01-15",
                    assessorName: "Dr. Sarah Ahmed",
                    assessmentType: "initial",
                    status: "overdue",
                    nextDueDate: "2024-03-15",
                    findings: "Patient shows good progress with current treatment plan",
                    recommendations: [
                        "Continue current therapy",
                        "Schedule follow-up in 2 months",
                    ],
                    documents: [
                        {
                            id: "doc-008",
                            name: "Assessment Report",
                            type: "face_to_face",
                            status: "expired",
                            uploadDate: "2024-01-15",
                            expiryDate: "2024-03-15",
                            fileSize: 1024,
                            fileType: "PDF",
                            version: 1,
                            isRequired: true,
                            complianceNotes: ["Assessment expired - renewal required"],
                        },
                    ],
                },
                {
                    id: "fta-002",
                    patientName: "Fatima Al Zahra",
                    assessmentDate: "2024-03-10",
                    assessorName: "Dr. Mohammed Hassan",
                    assessmentType: "follow_up",
                    status: "completed",
                    nextDueDate: "2024-05-10",
                    findings: "Patient adapting well to wheelchair use",
                    recommendations: [
                        "Continue mobility training",
                        "Monitor for any complications",
                    ],
                    documents: [
                        {
                            id: "doc-009",
                            name: "Follow-up Assessment",
                            type: "face_to_face",
                            status: "valid",
                            uploadDate: "2024-03-10",
                            expiryDate: "2024-05-10",
                            fileSize: 1280,
                            fileType: "PDF",
                            version: 1,
                            isRequired: true,
                            complianceNotes: ["Complete follow-up assessment"],
                        },
                    ],
                },
            ];
            setPatientDocuments(mockPatientDocuments);
            setWheelchairApprovals(mockWheelchairApprovals);
            setFaceToFaceAssessments(mockFaceToFaceAssessments);
        }
        catch (error) {
            console.error("Error loading document data:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const refreshData = async () => {
        setRefreshing(true);
        await loadDocumentData();
        setRefreshing(false);
    };
    const getStatusColor = (status) => {
        switch (status) {
            case "valid":
            case "approved":
            case "completed":
                return "bg-green-100 text-green-800";
            case "expired":
            case "overdue":
            case "rejected":
                return "bg-red-100 text-red-800";
            case "missing":
                return "bg-gray-100 text-gray-800";
            case "pending":
            case "pending_review":
            case "scheduled":
                return "bg-yellow-100 text-yellow-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };
    const getComplianceColor = (score) => {
        if (score >= 90)
            return "text-green-600";
        if (score >= 75)
            return "text-yellow-600";
        return "text-red-600";
    };
    const formatFileSize = (bytes) => {
        if (bytes < 1024)
            return `${bytes} B`;
        if (bytes < 1024 * 1024)
            return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };
    const criticalIssues = patientDocuments.reduce((acc, pd) => acc + pd.criticalIssues.length, 0);
    const expiredDocuments = patientDocuments.reduce((acc, pd) => acc + pd.documents.filter((doc) => doc.status === "expired").length, 0);
    const missingDocuments = patientDocuments.reduce((acc, pd) => acc + pd.documents.filter((doc) => doc.status === "missing").length, 0);
    const pendingApprovals = wheelchairApprovals.filter((wa) => wa.approvalStatus === "pending").length;
    const overdueAssessments = faceToFaceAssessments.filter((fta) => fta.status === "overdue").length;
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center h-96 bg-white", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "Loading document compliance data..." })] }) }));
    }
    return (_jsxs("div", { className: cn("space-y-6 bg-gray-50 min-h-screen p-6", className), children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-2xl font-bold text-gray-900 flex items-center", children: [_jsx(FileText, { className: "h-6 w-6 mr-3 text-blue-600" }), "Document Compliance Checker"] }), _jsx("p", { className: "text-gray-600 mt-1", children: "Validate documents, wheelchair pre-approvals, and face-to-face assessments" })] }), _jsxs(Button, { onClick: refreshData, disabled: refreshing, className: "bg-blue-600 hover:bg-blue-700", children: [_jsx(RefreshCw, { className: cn("h-4 w-4 mr-2", refreshing && "animate-spin") }), "Refresh"] })] }), criticalIssues > 0 && (_jsxs(Alert, { variant: "compliance-critical", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "Critical Document Issues" }), _jsxs(AlertDescription, { children: [criticalIssues, " critical document issue(s) require immediate attention.", expiredDocuments > 0 &&
                                ` ${expiredDocuments} expired document(s).`, missingDocuments > 0 &&
                                ` ${missingDocuments} missing document(s).`] })] })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-5 gap-4", children: [_jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Total Patients" }), _jsx("p", { className: "text-2xl font-bold", children: patientDocuments.length })] }), _jsx(User, { className: "h-8 w-8 text-blue-500" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Critical Issues" }), _jsx("p", { className: "text-2xl font-bold text-red-600", children: criticalIssues })] }), _jsx(AlertTriangle, { className: "h-8 w-8 text-red-500" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Expired Docs" }), _jsx("p", { className: "text-2xl font-bold text-orange-600", children: expiredDocuments })] }), _jsx(Clock, { className: "h-8 w-8 text-orange-500" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Pending Approvals" }), _jsx("p", { className: "text-2xl font-bold text-yellow-600", children: pendingApprovals })] }), _jsx(Wheelchair, { className: "h-8 w-8 text-yellow-500" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Overdue Assessments" }), _jsx("p", { className: "text-2xl font-bold text-red-600", children: overdueAssessments })] }), _jsx(Eye, { className: "h-8 w-8 text-red-500" })] }) }) })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "wheelchair", children: "Wheelchair Approvals" }), _jsx(TabsTrigger, { value: "assessments", children: "Face-to-Face" }), _jsx(TabsTrigger, { value: "documents", children: "All Documents" })] }), _jsx(TabsContent, { value: "overview", children: _jsx("div", { className: "space-y-6", children: patientDocuments.map((patient) => (_jsx(Card, { className: cn("transition-all hover:shadow-md", patient.criticalIssues.length > 0 &&
                                    "border-l-4 border-l-red-500"), children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold", children: patient.patientName }), _jsxs("p", { className: "text-sm text-gray-600", children: ["Episode: ", patient.episodeId, " | Last Updated:", " ", new Date(patient.lastUpdated).toLocaleDateString()] })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Compliance Score" }), _jsxs("p", { className: cn("text-2xl font-bold", getComplianceColor(patient.overallCompliance)), children: [patient.overallCompliance, "%"] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Total Documents" }), _jsx("p", { className: "font-semibold", children: patient.documents.length })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Valid Documents" }), _jsx("p", { className: "font-semibold text-green-600", children: patient.documents.filter((doc) => doc.status === "valid").length })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Issues" }), _jsx("p", { className: "font-semibold text-red-600", children: patient.documents.filter((doc) => doc.status !== "valid").length })] })] }), patient.criticalIssues.length > 0 && (_jsxs("div", { className: "mb-4 p-3 bg-red-50 rounded", children: [_jsx("h4", { className: "font-medium text-red-800 mb-2", children: "Critical Issues:" }), _jsx("ul", { className: "text-sm text-red-700 space-y-1", children: patient.criticalIssues.map((issue, index) => (_jsxs("li", { children: ["\u2022 ", issue] }, index))) })] })), _jsxs("div", { className: "space-y-3", children: [_jsx("h4", { className: "font-medium", children: "Documents:" }), patient.documents.map((document) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-1", children: [_jsx("h5", { className: "font-medium", children: document.name }), _jsx(Badge, { className: getStatusColor(document.status), children: document.status.replace("_", " ") }), document.isRequired && (_jsx(Badge, { variant: "outline", children: "Required" }))] }), _jsxs("div", { className: "text-sm text-gray-600", children: [document.uploadDate && (_jsxs("span", { children: ["Uploaded:", " ", new Date(document.uploadDate).toLocaleDateString(), " ", "|", " "] })), document.expiryDate && (_jsxs("span", { children: ["Expires:", " ", new Date(document.expiryDate).toLocaleDateString(), " ", "|", " "] })), document.fileSize && (_jsxs("span", { children: ["Size: ", formatFileSize(document.fileSize), " |", " "] })), "Version: ", document.version] })] }), _jsx("div", { className: "flex space-x-2", children: document.status === "missing" ? (_jsxs(Button, { size: "sm", className: "bg-blue-600 hover:bg-blue-700", children: [_jsx(Upload, { className: "h-3 w-3 mr-1" }), "Upload"] })) : (_jsxs(Button, { size: "sm", variant: "outline", children: [_jsx(Download, { className: "h-3 w-3 mr-1" }), "View"] })) })] }, document.id)))] })] }) }, patient.id))) }) }), _jsx(TabsContent, { value: "wheelchair", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Wheelchair Pre-Approval Management" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs(Alert, { variant: "doh-requirement", children: [_jsx(Wheelchair, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "Wheelchair Pre-Approval Requirements" }), _jsx(AlertDescription, { children: "All wheelchair requests require medical justification, supporting documentation, and DOH approval before provision." })] }), wheelchairApprovals.map((approval) => (_jsx(Card, { className: cn("transition-all hover:shadow-md", approval.approvalStatus === "pending" &&
                                                    "border-l-4 border-l-yellow-500", approval.approvalStatus === "rejected" &&
                                                    "border-l-4 border-l-red-500"), children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [_jsx("h3", { className: "font-semibold", children: approval.patientName }), _jsx(Badge, { className: getStatusColor(approval.approvalStatus), children: approval.approvalStatus.replace("_", " ") })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Request Date:" }), _jsx("p", { className: "font-medium", children: new Date(approval.requestDate).toLocaleDateString() })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Wheelchair Type:" }), _jsx("p", { className: "font-medium", children: approval.wheelchairType })] }), approval.expiryDate && (_jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Expires:" }), _jsx("p", { className: "font-medium", children: new Date(approval.expiryDate).toLocaleDateString() })] }))] }), _jsxs("div", { className: "mb-3", children: [_jsx("span", { className: "text-gray-600", children: "Justification:" }), _jsx("p", { className: "text-sm mt-1", children: approval.justification })] }), approval.supportingDocuments.length > 0 && (_jsxs("div", { className: "mb-3", children: [_jsx("span", { className: "text-gray-600", children: "Supporting Documents:" }), _jsx("div", { className: "mt-1 space-y-1", children: approval.supportingDocuments.map((doc) => (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(FileText, { className: "h-4 w-4 text-gray-500" }), _jsx("span", { className: "text-sm", children: doc.name }), _jsx(Badge, { className: getStatusColor(doc.status), children: doc.status.replace("_", " ") })] }, doc.id))) })] })), approval.reviewNotes.length > 0 && (_jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Review Notes:" }), _jsx("ul", { className: "text-sm mt-1 space-y-1", children: approval.reviewNotes.map((note, index) => (_jsxs("li", { children: ["\u2022 ", note] }, index))) })] }))] }), _jsxs("div", { className: "flex flex-col space-y-2", children: [approval.approvalStatus === "pending" && (_jsxs(_Fragment, { children: [_jsxs(Button, { size: "sm", className: "bg-green-600 hover:bg-green-700", children: [_jsx(CheckCircle, { className: "h-3 w-3 mr-1" }), "Approve"] }), _jsxs(Button, { size: "sm", variant: "outline", children: [_jsx(XCircle, { className: "h-3 w-3 mr-1" }), "Reject"] })] })), _jsx(Button, { size: "sm", variant: "outline", children: "View Details" })] })] }) }) }, approval.id)))] }) })] }) }), _jsx(TabsContent, { value: "assessments", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Face-to-Face Assessment Tracking" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs(Alert, { variant: "doh-requirement", children: [_jsx(Eye, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "Face-to-Face Assessment Requirements" }), _jsx(AlertDescription, { children: "Regular face-to-face assessments are mandatory for all homecare patients. Assessments must be conducted within specified timeframes." })] }), faceToFaceAssessments.map((assessment) => (_jsx(Card, { className: cn("transition-all hover:shadow-md", assessment.status === "overdue" &&
                                                    "border-l-4 border-l-red-500", assessment.status === "scheduled" &&
                                                    "border-l-4 border-l-blue-500"), children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [_jsx("h3", { className: "font-semibold", children: assessment.patientName }), _jsx(Badge, { className: getStatusColor(assessment.status), children: assessment.status.replace("_", " ") }), _jsx(Badge, { variant: "outline", children: assessment.assessmentType })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-3", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Assessment Date:" }), _jsx("p", { className: "font-medium", children: new Date(assessment.assessmentDate).toLocaleDateString() })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Assessor:" }), _jsx("p", { className: "font-medium", children: assessment.assessorName })] }), assessment.nextDueDate && (_jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Next Due:" }), _jsx("p", { className: cn("font-medium", new Date(assessment.nextDueDate) <
                                                                                            new Date()
                                                                                            ? "text-red-600"
                                                                                            : "text-green-600"), children: new Date(assessment.nextDueDate).toLocaleDateString() })] })), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Documents:" }), _jsx("p", { className: "font-medium", children: assessment.documents.length })] })] }), _jsxs("div", { className: "mb-3", children: [_jsx("span", { className: "text-gray-600", children: "Findings:" }), _jsx("p", { className: "text-sm mt-1", children: assessment.findings })] }), assessment.recommendations.length > 0 && (_jsxs("div", { className: "mb-3", children: [_jsx("span", { className: "text-gray-600", children: "Recommendations:" }), _jsx("ul", { className: "text-sm mt-1 space-y-1", children: assessment.recommendations.map((rec, index) => (_jsxs("li", { children: ["\u2022 ", rec] }, index))) })] })), assessment.documents.length > 0 && (_jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Assessment Documents:" }), _jsx("div", { className: "mt-1 space-y-1", children: assessment.documents.map((doc) => (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(FileText, { className: "h-4 w-4 text-gray-500" }), _jsx("span", { className: "text-sm", children: doc.name }), _jsx(Badge, { className: getStatusColor(doc.status), children: doc.status.replace("_", " ") }), doc.expiryDate && (_jsxs("span", { className: "text-xs text-gray-500", children: ["Expires:", " ", new Date(doc.expiryDate).toLocaleDateString()] }))] }, doc.id))) })] }))] }), _jsxs("div", { className: "flex flex-col space-y-2", children: [assessment.status === "overdue" && (_jsxs(Button, { size: "sm", className: "bg-red-600 hover:bg-red-700", children: [_jsx(Calendar, { className: "h-3 w-3 mr-1" }), "Schedule"] })), _jsx(Button, { size: "sm", variant: "outline", children: "View Assessment" })] })] }) }) }, assessment.id)))] }) })] }) }), _jsx(TabsContent, { value: "documents", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "All Documents Overview" }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Search, { className: "h-4 w-4 text-gray-500" }), _jsx("input", { type: "text", placeholder: "Search documents...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "px-3 py-1 border rounded-md text-sm" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Filter, { className: "h-4 w-4 text-gray-500" }), _jsxs("select", { value: filterStatus, onChange: (e) => setFilterStatus(e.target.value), className: "px-3 py-1 border rounded-md text-sm", children: [_jsx("option", { value: "all", children: "All Status" }), _jsx("option", { value: "valid", children: "Valid" }), _jsx("option", { value: "expired", children: "Expired" }), _jsx("option", { value: "missing", children: "Missing" }), _jsx("option", { value: "pending_review", children: "Pending Review" })] })] })] })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: patientDocuments.map((patient) => patient.documents
                                            .filter((doc) => {
                                            const matchesSearch = searchTerm === "" ||
                                                doc.name
                                                    .toLowerCase()
                                                    .includes(searchTerm.toLowerCase()) ||
                                                patient.patientName
                                                    .toLowerCase()
                                                    .includes(searchTerm.toLowerCase());
                                            const matchesStatus = filterStatus === "all" || doc.status === filterStatus;
                                            return matchesSearch && matchesStatus;
                                        })
                                            .map((document) => (_jsx(Card, { className: cn("transition-all hover:shadow-md", document.status === "expired" &&
                                                "border-l-4 border-l-red-500", document.status === "missing" &&
                                                "border-l-4 border-l-gray-500"), children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [_jsx("h3", { className: "font-semibold", children: document.name }), _jsx(Badge, { className: getStatusColor(document.status), children: document.status.replace("_", " ") }), document.isRequired && (_jsx(Badge, { variant: "outline", children: "Required" }))] }), _jsxs("p", { className: "text-sm text-gray-600 mb-2", children: ["Patient: ", patient.patientName, " | Episode:", " ", patient.episodeId] }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-sm", children: [document.uploadDate && (_jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Uploaded:" }), _jsx("p", { className: "font-medium", children: new Date(document.uploadDate).toLocaleDateString() })] })), document.expiryDate && (_jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Expires:" }), _jsx("p", { className: cn("font-medium", new Date(document.expiryDate) <
                                                                                        new Date()
                                                                                        ? "text-red-600"
                                                                                        : "text-green-600"), children: new Date(document.expiryDate).toLocaleDateString() })] })), document.fileSize && (_jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Size:" }), _jsx("p", { className: "font-medium", children: formatFileSize(document.fileSize) })] })), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Version:" }), _jsx("p", { className: "font-medium", children: document.version })] })] }), document.complianceNotes.length > 0 && (_jsxs("div", { className: "mt-3", children: [_jsx("span", { className: "text-gray-600", children: "Notes:" }), _jsx("ul", { className: "text-sm mt-1 space-y-1", children: document.complianceNotes.map((note, index) => (_jsxs("li", { children: ["\u2022 ", note] }, index))) })] }))] }), _jsxs("div", { className: "flex flex-col space-y-2", children: [document.status === "missing" ? (_jsxs(Button, { size: "sm", className: "bg-blue-600 hover:bg-blue-700", children: [_jsx(Upload, { className: "h-3 w-3 mr-1" }), "Upload"] })) : (_jsxs(Button, { size: "sm", variant: "outline", children: [_jsx(Download, { className: "h-3 w-3 mr-1" }), "View"] })), document.status === "expired" && (_jsx(Button, { size: "sm", className: "bg-orange-600 hover:bg-orange-700", children: "Renew" }))] })] }) }) }, `${patient.id}-${document.id}`)))) }) })] }) })] })] }));
};
export default DocumentComplianceChecker;
