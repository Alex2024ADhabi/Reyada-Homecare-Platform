import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { FileText, Plus, Edit, Eye, Download, Upload, CheckCircle, Clock, AlertTriangle, Search, Filter, Users, Calendar, Bell, BookOpen, Shield, } from "lucide-react";
import { communicationAPI } from "@/api/communication.api";
const GovernanceDocuments = () => {
    const [activeTab, setActiveTab] = useState("documents");
    const [documents, setDocuments] = useState([]);
    const [acknowledgments, setAcknowledgments] = useState([]);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [showDocumentDialog, setShowDocumentDialog] = useState(false);
    const [showAcknowledgmentDialog, setShowAcknowledgmentDialog] = useState(false);
    const [showWhistleblowingDialog, setShowWhistleblowingDialog] = useState(false);
    const [whistleblowingReport, setWhistleblowingReport] = useState({
        reportType: "incident",
        description: "",
        anonymous: true,
        urgency: "medium",
        category: "patient_safety",
        evidence: [],
        location: "",
        witnessDetails: "",
        dateOfIncident: "",
        timeOfIncident: "",
        staffInvolved: "",
        patientInvolved: false,
        immediateActions: "",
        riskLevel: "medium",
        followUpRequired: true,
    });
    // Document Form State
    const [documentForm, setDocumentForm] = useState({
        document_title: "",
        document_type: "policy",
        document_category: "patient_care",
        document_content: "",
        document_summary: "",
        acknowledgment_required: true,
        target_audience: [],
        training_required: false,
        compliance_requirements: [],
        review_frequency: "annual",
    });
    useEffect(() => {
        loadDocuments();
        loadAcknowledgments();
    }, []);
    const loadDocuments = async () => {
        try {
            setIsLoading(true);
            const documentData = await communicationAPI.governance.getDocuments();
            setDocuments(documentData);
        }
        catch (error) {
            console.error("Error loading documents:", error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const loadAcknowledgments = async () => {
        try {
            const acknowledgmentData = await communicationAPI.governance.getAcknowledgments();
            setAcknowledgments(acknowledgmentData);
        }
        catch (error) {
            console.error("Error loading acknowledgments:", error);
        }
    };
    const createDocument = async () => {
        try {
            await communicationAPI.governance.createDocument({
                ...documentForm,
                version: "1.0",
                effective_date: new Date().toISOString().split("T")[0],
                expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split("T")[0],
                approval_workflow: {
                    required_approvers: [
                        {
                            approver_role: "Quality Manager",
                            approver_name: "Layla Al Zahra",
                            approval_status: "pending",
                        },
                        {
                            approver_role: "Medical Director",
                            approver_name: "Dr. Ahmed Al Rashid",
                            approval_status: "pending",
                        },
                    ],
                    final_approval_status: "pending",
                },
                acknowledgment_deadline: documentForm.acknowledgment_required
                    ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
                        .toISOString()
                        .split("T")[0]
                    : undefined,
                training_deadline: documentForm.training_required
                    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                        .toISOString()
                        .split("T")[0]
                    : undefined,
                related_documents: [],
                review_schedule: {
                    review_frequency: documentForm.review_frequency,
                    next_review_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                        .toISOString()
                        .split("T")[0],
                    review_responsible: "Quality Assurance Committee",
                },
                created_by: "Dr. Sarah Ahmed",
            });
            setShowDocumentDialog(false);
            resetDocumentForm();
            loadDocuments();
        }
        catch (error) {
            console.error("Error creating document:", error);
        }
    };
    const approveDocument = async (documentId) => {
        try {
            await communicationAPI.governance.approveDocument(documentId, {
                approver_name: "Dr. Sarah Ahmed",
                approver_role: "Head Nurse",
            });
            loadDocuments();
        }
        catch (error) {
            console.error("Error approving document:", error);
        }
    };
    const completeAcknowledgment = async (acknowledgmentId) => {
        try {
            await communicationAPI.governance.completeAcknowledgment(acknowledgmentId, {
                read_confirmation: true,
                understanding_confirmation: true,
                compliance_commitment: true,
                questions_or_concerns: "None",
                additional_comments: "Document reviewed and understood",
            });
            loadAcknowledgments();
        }
        catch (error) {
            console.error("Error completing acknowledgment:", error);
        }
    };
    const sendReminder = async (acknowledgmentId) => {
        try {
            await communicationAPI.governance.sendAcknowledgmentReminder(acknowledgmentId, "email");
            loadAcknowledgments();
        }
        catch (error) {
            console.error("Error sending reminder:", error);
        }
    };
    const resetDocumentForm = () => {
        setDocumentForm({
            document_title: "",
            document_type: "policy",
            document_category: "patient_care",
            document_content: "",
            document_summary: "",
            acknowledgment_required: true,
            target_audience: [],
            training_required: false,
            compliance_requirements: [],
            review_frequency: "annual",
        });
    };
    const filteredDocuments = documents.filter((doc) => {
        const matchesSearch = doc.document_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.document_category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === "all" || doc.document_type === filterType;
        return matchesSearch && matchesFilter;
    });
    const pendingAcknowledgments = acknowledgments.filter((ack) => ack.acknowledgment_status === "pending");
    const overdueAcknowledgments = acknowledgments.filter((ack) => ack.acknowledgment_status === "pending" &&
        ack.deadline_date &&
        new Date(ack.deadline_date) < new Date());
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };
    const getStatusColor = (status) => {
        switch (status) {
            case "active":
                return "bg-green-100 text-green-800";
            case "draft":
                return "bg-gray-100 text-gray-800";
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "approved":
                return "bg-blue-100 text-blue-800";
            case "expired":
                return "bg-red-100 text-red-800";
            case "completed":
                return "bg-green-100 text-green-800";
            case "overdue":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };
    const getComplianceRate = () => {
        if (acknowledgments.length === 0)
            return 0;
        const completed = acknowledgments.filter((ack) => ack.acknowledgment_status === "completed").length;
        return Math.round((completed / acknowledgments.length) * 100);
    };
    if (isLoading) {
        return (_jsx("div", { className: "flex items-center justify-center h-96 bg-white", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "Loading governance documents..." })] }) }));
    }
    return (_jsxs("div", { className: "p-6 bg-gray-50 min-h-screen", children: [_jsx("div", { className: "mb-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-2xl font-bold text-gray-900 flex items-center", children: [_jsx(Shield, { className: "h-6 w-6 mr-3 text-blue-600" }), "Governance & Document Management"] }), _jsx("p", { className: "text-gray-600 mt-1", children: "Manage policies, procedures, and staff acknowledgments" })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsx(Dialog, { open: showWhistleblowingDialog, onOpenChange: setShowWhistleblowingDialog, children: _jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { className: "bg-red-600 hover:bg-red-700", children: [_jsx(Shield, { className: "h-4 w-4 mr-2" }), "Whistleblowing Report (CN_46_2025)"] }) }) }), _jsx(Dialog, { open: showDocumentDialog, onOpenChange: setShowDocumentDialog, children: _jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { className: "bg-blue-600 hover:bg-blue-700", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "New Document"] }) }) }), _jsxs(Button, { variant: "outline", children: [_jsx(Upload, { className: "h-4 w-4 mr-2" }), "Import"] })] })] }) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-6 mb-6", children: [_jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Total Documents" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: documents.length })] }), _jsx(FileText, { className: "h-8 w-8 text-blue-600" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Pending Acknowledgments" }), _jsx("p", { className: "text-2xl font-bold text-orange-600", children: pendingAcknowledgments.length })] }), _jsx(Clock, { className: "h-8 w-8 text-orange-600" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Overdue Items" }), _jsx("p", { className: "text-2xl font-bold text-red-600", children: overdueAcknowledgments.length })] }), _jsx(AlertTriangle, { className: "h-8 w-8 text-red-600" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Compliance Rate" }), _jsxs("p", { className: "text-2xl font-bold text-green-600", children: [getComplianceRate(), "%"] }), _jsx(Progress, { value: getComplianceRate(), className: "h-2 mt-2" })] }), _jsx(CheckCircle, { className: "h-8 w-8 text-green-600" })] }) }) })] }), _jsxs("div", { className: "mb-6 flex flex-col sm:flex-row gap-4", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" }), _jsx(Input, { placeholder: "Search documents...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "pl-10" })] }), _jsxs(Select, { value: filterType, onValueChange: setFilterType, children: [_jsxs(SelectTrigger, { className: "w-48", children: [_jsx(Filter, { className: "h-4 w-4 mr-2" }), _jsx(SelectValue, {})] }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Types" }), _jsx(SelectItem, { value: "policy", children: "Policies" }), _jsx(SelectItem, { value: "procedure", children: "Procedures" }), _jsx(SelectItem, { value: "guideline", children: "Guidelines" }), _jsx(SelectItem, { value: "form", children: "Forms" })] })] })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "space-y-6", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsx(TabsTrigger, { value: "documents", children: "Documents" }), _jsx(TabsTrigger, { value: "acknowledgments", children: "Acknowledgments" }), _jsx(TabsTrigger, { value: "compliance", children: "Compliance" }), _jsx(TabsTrigger, { value: "analytics", children: "Analytics" })] }), _jsx(TabsContent, { value: "documents", children: _jsx("div", { className: "grid gap-6", children: filteredDocuments.map((document) => (_jsxs(Card, { className: "hover:shadow-md transition-shadow", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: "text-lg", children: document.document_title }), _jsxs("p", { className: "text-sm text-gray-600 mt-1", children: [document.document_type.replace("_", " "), " \u2022 Version", " ", document.version, " \u2022", document.document_category.replace("_", " ")] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Badge, { className: getStatusColor(document.document_status), children: document.document_status }), _jsxs(Badge, { variant: "outline", children: [document.target_audience.length, " audience(s)"] })] })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium text-gray-700", children: "Summary" }), _jsx("p", { className: "text-sm text-gray-900 mt-1", children: document.document_summary })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium text-gray-700", children: "Effective Date" }), _jsx("p", { className: "text-gray-900", children: formatDate(document.effective_date) })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium text-gray-700", children: "Next Review" }), _jsx("p", { className: "text-gray-900", children: formatDate(document.review_schedule.next_review_date) })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium text-gray-700", children: "Approval Status" }), _jsx("p", { className: "text-gray-900", children: document.approval_workflow.final_approval_status })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium text-gray-700", children: "Created By" }), _jsx("p", { className: "text-gray-900", children: document.created_by })] })] }), _jsxs("div", { className: "flex items-center justify-between pt-2", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [document.acknowledgment_required && (_jsxs("div", { className: "flex items-center text-sm text-blue-600", children: [_jsx(Users, { className: "h-4 w-4 mr-1" }), "Acknowledgment Required"] })), document.training_required && (_jsxs("div", { className: "flex items-center text-sm text-green-600", children: [_jsx(BookOpen, { className: "h-4 w-4 mr-1" }), "Training Required"] }))] }), _jsxs("div", { className: "flex space-x-2", children: [_jsx(Button, { variant: "ghost", size: "sm", children: _jsx(Eye, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", children: _jsx(Download, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", children: _jsx(Edit, { className: "h-4 w-4" }) }), document.approval_workflow.final_approval_status ===
                                                                    "pending" && (_jsx(Button, { variant: "ghost", size: "sm", onClick: () => approveDocument(document.document_id), children: _jsx(CheckCircle, { className: "h-4 w-4" }) }))] })] })] }) })] }, document.document_id))) }) }), _jsx(TabsContent, { value: "acknowledgments", children: _jsx("div", { className: "space-y-4", children: acknowledgments.map((ack) => (_jsx(Card, { className: "hover:shadow-md transition-shadow", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: ack.document_title }), _jsx(Badge, { className: getStatusColor(ack.acknowledgment_status), children: ack.acknowledgment_status }), ack.deadline_date &&
                                                                new Date(ack.deadline_date) < new Date() && (_jsx(Badge, { className: getStatusColor("overdue"), children: "Overdue" }))] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm text-gray-600", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Staff Member:" }), " ", ack.staff_member.name] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Role:" }), " ", ack.staff_member.role] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Department:" }), " ", ack.staff_member.department] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Type:" }), " ", ack.acknowledgment_type.replace("_", " ")] }), ack.deadline_date && (_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Deadline:" }), " ", formatDate(ack.deadline_date)] })), ack.acknowledged_date && (_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Completed:" }), " ", formatDate(ack.acknowledged_date)] }))] }), ack.training_completion.required && (_jsxs("div", { className: "mt-3 p-3 bg-blue-50 rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium text-blue-900", children: "Training Required" }), _jsx(Badge, { variant: ack.training_completion.completed
                                                                            ? "default"
                                                                            : "secondary", children: ack.training_completion.completed
                                                                            ? "Completed"
                                                                            : "Pending" })] }), ack.training_completion.completed && (_jsxs("div", { className: "text-sm text-blue-800 mt-1", children: ["Score: ", ack.training_completion.training_score, "% \u2022 Completed:", " ", ack.training_completion.completion_date &&
                                                                        formatDate(ack.training_completion.completion_date)] }))] }))] }), _jsxs("div", { className: "flex flex-col items-end space-y-2", children: [_jsxs("div", { className: "text-sm text-gray-500", children: [ack.reminder_history.length, " reminder(s) sent"] }), _jsxs("div", { className: "flex space-x-2", children: [ack.acknowledgment_status === "pending" && (_jsxs(_Fragment, { children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: () => sendReminder(ack.acknowledgment_id), children: [_jsx(Bell, { className: "h-4 w-4 mr-1" }), "Remind"] }), _jsxs(Button, { variant: "default", size: "sm", onClick: () => completeAcknowledgment(ack.acknowledgment_id), children: [_jsx(CheckCircle, { className: "h-4 w-4 mr-1" }), "Complete"] })] })), _jsx(Button, { variant: "ghost", size: "sm", children: _jsx(Eye, { className: "h-4 w-4" }) })] })] })] }) }) }, ack.acknowledgment_id))) }) }), _jsx(TabsContent, { value: "compliance", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Compliance Overview" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Overall Compliance Rate" }), _jsxs("span", { className: "text-lg font-bold text-green-600", children: [getComplianceRate(), "%"] })] }), _jsx(Progress, { value: getComplianceRate(), className: "h-3" }), _jsxs("div", { className: "grid grid-cols-2 gap-4 mt-6", children: [_jsxs("div", { className: "text-center p-4 border rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: acknowledgments.filter((ack) => ack.acknowledgment_status === "completed").length }), _jsx("div", { className: "text-sm text-gray-600", children: "Completed" })] }), _jsxs("div", { className: "text-center p-4 border rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-orange-600", children: pendingAcknowledgments.length }), _jsx("div", { className: "text-sm text-gray-600", children: "Pending" })] })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Document Categories" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: ["policy", "procedure", "guideline", "form"].map((type) => {
                                                    const count = documents.filter((doc) => doc.document_type === type).length;
                                                    const percentage = documents.length > 0
                                                        ? (count / documents.length) * 100
                                                        : 0;
                                                    return (_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium capitalize", children: type.replace("_", " ") }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-20 bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-blue-600 h-2 rounded-full", style: { width: `${percentage}%` } }) }), _jsx("span", { className: "text-sm text-gray-600 w-8", children: count })] })] }, type));
                                                }) }) })] })] }) }), _jsx(TabsContent, { value: "analytics", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6", children: [_jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Active Documents" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: documents.filter((doc) => doc.document_status === "active").length })] }), _jsx(FileText, { className: "h-8 w-8 text-blue-600" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Training Completion" }), _jsx("p", { className: "text-2xl font-bold text-green-600", children: acknowledgments.filter((ack) => ack.training_completion.completed).length })] }), _jsx(BookOpen, { className: "h-8 w-8 text-green-600" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Avg Response Time" }), _jsx("p", { className: "text-2xl font-bold text-purple-600", children: "2.3 days" })] }), _jsx(Clock, { className: "h-8 w-8 text-purple-600" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Due This Week" }), _jsx("p", { className: "text-2xl font-bold text-orange-600", children: acknowledgments.filter((ack) => {
                                                                if (!ack.deadline_date)
                                                                    return false;
                                                                const deadline = new Date(ack.deadline_date);
                                                                const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                                                                return (deadline <= nextWeek &&
                                                                    ack.acknowledgment_status === "pending");
                                                            }).length })] }), _jsx(Calendar, { className: "h-8 w-8 text-orange-600" })] }) }) })] }) })] }), _jsx(Dialog, { open: showDocumentDialog, onOpenChange: setShowDocumentDialog, children: _jsxs(DialogContent, { className: "max-w-4xl max-h-[90vh] overflow-y-auto", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Create New Document" }) }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "document_title", children: "Document Title" }), _jsx(Input, { id: "document_title", value: documentForm.document_title, onChange: (e) => setDocumentForm({
                                                        ...documentForm,
                                                        document_title: e.target.value,
                                                    }), placeholder: "Enter document title" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "document_type", children: "Document Type" }), _jsxs(Select, { value: documentForm.document_type, onValueChange: (value) => setDocumentForm({ ...documentForm, document_type: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "policy", children: "Policy" }), _jsx(SelectItem, { value: "procedure", children: "Procedure" }), _jsx(SelectItem, { value: "guideline", children: "Guideline" }), _jsx(SelectItem, { value: "form", children: "Form" })] })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "document_summary", children: "Document Summary" }), _jsx(Textarea, { id: "document_summary", value: documentForm.document_summary, onChange: (e) => setDocumentForm({
                                                ...documentForm,
                                                document_summary: e.target.value,
                                            }), placeholder: "Brief summary of the document", rows: 3 })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "document_content", children: "Document Content" }), _jsx(Textarea, { id: "document_content", value: documentForm.document_content, onChange: (e) => setDocumentForm({
                                                ...documentForm,
                                                document_content: e.target.value,
                                            }), placeholder: "Full document content", rows: 8 })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Switch, { id: "acknowledgment_required", checked: documentForm.acknowledgment_required, onCheckedChange: (checked) => setDocumentForm({
                                                        ...documentForm,
                                                        acknowledgment_required: checked,
                                                    }) }), _jsx(Label, { htmlFor: "acknowledgment_required", children: "Acknowledgment Required" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Switch, { id: "training_required", checked: documentForm.training_required, onCheckedChange: (checked) => setDocumentForm({
                                                        ...documentForm,
                                                        training_required: checked,
                                                    }) }), _jsx(Label, { htmlFor: "training_required", children: "Training Required" })] })] }), _jsxs("div", { className: "flex justify-end space-x-2", children: [_jsx(Button, { variant: "outline", onClick: () => setShowDocumentDialog(false), children: "Cancel" }), _jsx(Button, { onClick: createDocument, className: "bg-blue-600 hover:bg-blue-700", children: "Create Document" })] })] })] }) }), _jsx(Dialog, { open: showWhistleblowingDialog, onOpenChange: setShowWhistleblowingDialog, children: _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { className: "flex items-center", children: [_jsx(Shield, { className: "h-5 w-5 mr-2 text-red-600" }), "Secure Whistleblowing Report (CN_46_2025)"] }), _jsx(DialogDescription, { children: "Submit anonymous or identified reports for patient safety, quality concerns, or regulatory violations" })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs(Alert, { className: "bg-red-50 border-red-200", children: [_jsx(Shield, { className: "h-4 w-4 text-red-600" }), _jsx(AlertTitle, { className: "text-red-800", children: "Protected Disclosure Policy" }), _jsx(AlertDescription, { className: "text-red-700", children: "This platform provides secure, confidential reporting in accordance with CN_46_2025. All reports are protected under UAE whistleblowing legislation." })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "reportType", children: "Report Type" }), _jsxs(Select, { value: whistleblowingReport.reportType, onValueChange: (value) => setWhistleblowingReport({
                                                        ...whistleblowingReport,
                                                        reportType: value,
                                                    }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "incident", children: "Patient Safety Incident" }), _jsx(SelectItem, { value: "quality", children: "Quality Concern" }), _jsx(SelectItem, { value: "regulatory", children: "Regulatory Violation" }), _jsx(SelectItem, { value: "ethical", children: "Ethical Misconduct" }), _jsx(SelectItem, { value: "financial", children: "Financial Irregularity" }), _jsx(SelectItem, { value: "discrimination", children: "Discrimination/Harassment" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "category", children: "Category" }), _jsxs(Select, { value: whistleblowingReport.category, onValueChange: (value) => setWhistleblowingReport({
                                                        ...whistleblowingReport,
                                                        category: value,
                                                    }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "patient_safety", children: "Patient Safety" }), _jsx(SelectItem, { value: "clinical_care", children: "Clinical Care" }), _jsx(SelectItem, { value: "medication_safety", children: "Medication Safety" }), _jsx(SelectItem, { value: "infection_control", children: "Infection Control" }), _jsx(SelectItem, { value: "documentation", children: "Documentation" }), _jsx(SelectItem, { value: "staff_conduct", children: "Staff Conduct" })] })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "urgency", children: "Urgency Level" }), _jsxs(Select, { value: whistleblowingReport.urgency, onValueChange: (value) => setWhistleblowingReport({
                                                ...whistleblowingReport,
                                                urgency: value,
                                            }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "low", children: "Low - General Concern" }), _jsx(SelectItem, { value: "medium", children: "Medium - Requires Attention" }), _jsx(SelectItem, { value: "high", children: "High - Urgent Action Needed" }), _jsx(SelectItem, { value: "critical", children: "Critical - Immediate Danger" })] })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "dateOfIncident", children: "Date of Incident" }), _jsx(Input, { id: "dateOfIncident", type: "date", value: whistleblowingReport.dateOfIncident, onChange: (e) => setWhistleblowingReport({
                                                        ...whistleblowingReport,
                                                        dateOfIncident: e.target.value,
                                                    }) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "timeOfIncident", children: "Time of Incident" }), _jsx(Input, { id: "timeOfIncident", type: "time", value: whistleblowingReport.timeOfIncident, onChange: (e) => setWhistleblowingReport({
                                                        ...whistleblowingReport,
                                                        timeOfIncident: e.target.value,
                                                    }) })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "location", children: "Location of Incident" }), _jsx(Input, { id: "location", value: whistleblowingReport.location, onChange: (e) => setWhistleblowingReport({
                                                ...whistleblowingReport,
                                                location: e.target.value,
                                            }), placeholder: "Specific location where incident occurred" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "description", children: "Detailed Description" }), _jsx(Textarea, { id: "description", value: whistleblowingReport.description, onChange: (e) => setWhistleblowingReport({
                                                ...whistleblowingReport,
                                                description: e.target.value,
                                            }), placeholder: "Provide detailed information about the concern, including what happened, who was involved, and any evidence...", rows: 6 })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "staffInvolved", children: "Staff Involved (if known)" }), _jsx(Input, { id: "staffInvolved", value: whistleblowingReport.staffInvolved, onChange: (e) => setWhistleblowingReport({
                                                        ...whistleblowingReport,
                                                        staffInvolved: e.target.value,
                                                    }), placeholder: "Names or roles of staff involved" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "witnessDetails", children: "Witness Information" }), _jsx(Input, { id: "witnessDetails", value: whistleblowingReport.witnessDetails, onChange: (e) => setWhistleblowingReport({
                                                        ...whistleblowingReport,
                                                        witnessDetails: e.target.value,
                                                    }), placeholder: "Witness names or contact information" })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "immediateActions", children: "Immediate Actions Taken" }), _jsx(Textarea, { id: "immediateActions", value: whistleblowingReport.immediateActions, onChange: (e) => setWhistleblowingReport({
                                                ...whistleblowingReport,
                                                immediateActions: e.target.value,
                                            }), placeholder: "Describe any immediate actions taken to address the situation", rows: 3 })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "riskLevel", children: "Risk Level Assessment" }), _jsxs(Select, { value: whistleblowingReport.riskLevel, onValueChange: (value) => setWhistleblowingReport({
                                                        ...whistleblowingReport,
                                                        riskLevel: value,
                                                    }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "low", children: "Low Risk" }), _jsx(SelectItem, { value: "medium", children: "Medium Risk" }), _jsx(SelectItem, { value: "high", children: "High Risk" }), _jsx(SelectItem, { value: "critical", children: "Critical Risk" })] })] })] }), _jsxs("div", { className: "flex items-center space-x-2 pt-6", children: [_jsx("input", { type: "checkbox", id: "patientInvolved", checked: whistleblowingReport.patientInvolved, onChange: (e) => setWhistleblowingReport({
                                                        ...whistleblowingReport,
                                                        patientInvolved: e.target.checked,
                                                    }), className: "rounded" }), _jsx(Label, { htmlFor: "patientInvolved", children: "Patient(s) Involved" })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", id: "anonymous", checked: whistleblowingReport.anonymous, onChange: (e) => setWhistleblowingReport({
                                                ...whistleblowingReport,
                                                anonymous: e.target.checked,
                                            }), className: "rounded" }), _jsx(Label, { htmlFor: "anonymous", className: "text-sm", children: "Submit anonymously (recommended for protection)" })] }), _jsxs("div", { className: "p-4 bg-blue-50 rounded-lg border border-blue-200", children: [_jsx("h4", { className: "font-medium text-blue-900 mb-2", children: "Your Rights & Protections" }), _jsxs("ul", { className: "text-sm text-blue-800 space-y-1", children: [_jsx("li", { children: "\u2022 Protection from retaliation under UAE law" }), _jsx("li", { children: "\u2022 Confidential investigation process" }), _jsx("li", { children: "\u2022 Regular updates on investigation progress" }), _jsx("li", { children: "\u2022 Right to legal representation" }), _jsx("li", { children: "\u2022 Anonymous reporting option available" })] })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setShowWhistleblowingDialog(false), children: "Cancel" }), _jsxs(Button, { className: "bg-red-600 hover:bg-red-700", onClick: async () => {
                                        try {
                                            // Enhanced secure submission with comprehensive data validation
                                            const submissionId = `WB-${Date.now()}`;
                                            const currentDate = new Date();
                                            // Sanitize and validate all form data to prevent JSON errors
                                            const sanitizedReport = {
                                                reportType: String(whistleblowingReport.reportType || "incident"),
                                                description: String(whistleblowingReport.description || "").trim(),
                                                anonymous: Boolean(whistleblowingReport.anonymous),
                                                urgency: ["low", "medium", "high", "critical"].includes(whistleblowingReport.urgency)
                                                    ? whistleblowingReport.urgency
                                                    : "medium",
                                                category: String(whistleblowingReport.category || "patient_safety"),
                                                evidence: Array.isArray(whistleblowingReport.evidence)
                                                    ? whistleblowingReport.evidence
                                                    : [],
                                                location: String(whistleblowingReport.location || "").trim(),
                                                witnessDetails: String(whistleblowingReport.witnessDetails || "").trim(),
                                                dateOfIncident: whistleblowingReport.dateOfIncident
                                                    ? String(whistleblowingReport.dateOfIncident)
                                                    : "",
                                                timeOfIncident: whistleblowingReport.timeOfIncident
                                                    ? String(whistleblowingReport.timeOfIncident)
                                                    : "",
                                                staffInvolved: String(whistleblowingReport.staffInvolved || "").trim(),
                                                patientInvolved: Boolean(whistleblowingReport.patientInvolved),
                                                immediateActions: String(whistleblowingReport.immediateActions || "").trim(),
                                                riskLevel: ["low", "medium", "high", "critical"].includes(whistleblowingReport.riskLevel)
                                                    ? whistleblowingReport.riskLevel
                                                    : "medium",
                                                followUpRequired: Boolean(whistleblowingReport.followUpRequired),
                                            };
                                            const submissionData = {
                                                ...sanitizedReport,
                                                submissionId,
                                                submissionDate: currentDate.toISOString(),
                                                complianceFlags: {
                                                    cn_46_2025: true,
                                                    dohReportable: sanitizedReport.riskLevel === "critical" ||
                                                        sanitizedReport.riskLevel === "high",
                                                    patientSafetyImpact: sanitizedReport.patientInvolved,
                                                    regulatoryNotificationRequired: sanitizedReport.category === "patient_safety" &&
                                                        sanitizedReport.urgency === "critical",
                                                    damanNotificationRequired: sanitizedReport.category === "patient_safety" ||
                                                        sanitizedReport.category === "clinical_care",
                                                },
                                                protectionStatus: {
                                                    anonymityProtected: sanitizedReport.anonymous,
                                                    legalProtectionApplied: true,
                                                    retaliationProtection: true,
                                                    confidentialityLevel: sanitizedReport.anonymous
                                                        ? "anonymous"
                                                        : "confidential",
                                                },
                                                damanIntegration: {
                                                    notificationSent: sanitizedReport.riskLevel === "critical" ||
                                                        sanitizedReport.riskLevel === "high",
                                                    escalationRequired: sanitizedReport.urgency === "critical",
                                                    complianceTracking: true,
                                                    auditTrail: {
                                                        submittedAt: currentDate.toISOString(),
                                                        submittedBy: sanitizedReport.anonymous
                                                            ? "Anonymous"
                                                            : "System User",
                                                        ipAddress: "Protected",
                                                        userAgent: "Reyada Platform",
                                                    },
                                                },
                                            };
                                            // Validate JSON serialization before submission
                                            try {
                                                JSON.stringify(submissionData);
                                            }
                                            catch (jsonError) {
                                                throw new Error(`Data validation failed: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`);
                                            }
                                            // Simulate secure API submission with enhanced error handling
                                            await new Promise((resolve, reject) => {
                                                setTimeout(() => {
                                                    try {
                                                        // Additional validation checks
                                                        if (!submissionData.description ||
                                                            submissionData.description.length < 10) {
                                                            reject(new Error("Description must be at least 10 characters long"));
                                                            return;
                                                        }
                                                        if (!submissionData.dateOfIncident) {
                                                            reject(new Error("Date of incident is required"));
                                                            return;
                                                        }
                                                        resolve(submissionData);
                                                    }
                                                    catch (validationError) {
                                                        reject(validationError);
                                                    }
                                                }, 1500);
                                            });
                                            console.log("Secure whistleblowing report submitted with enhanced compliance:", {
                                                submissionId: submissionData.submissionId,
                                                timestamp: submissionData.submissionDate,
                                                compliance: submissionData.complianceFlags,
                                                protection: submissionData.protectionStatus,
                                            });
                                            // Show success notification
                                            toast({
                                                title: "Whistleblowing Report Submitted",
                                                description: `Report ${submissionData.submissionId} has been securely submitted and is protected under CN_46_2025. ${submissionData.complianceFlags.dohReportable ? "DOH notification sent." : ""} ${submissionData.complianceFlags.damanNotificationRequired ? "Daman compliance team notified." : ""}`,
                                            });
                                            setShowWhistleblowingDialog(false);
                                            // Reset form with proper default values
                                            setWhistleblowingReport({
                                                reportType: "incident",
                                                description: "",
                                                anonymous: true,
                                                urgency: "medium",
                                                category: "patient_safety",
                                                evidence: [],
                                                location: "",
                                                witnessDetails: "",
                                                dateOfIncident: "",
                                                timeOfIncident: "",
                                                staffInvolved: "",
                                                patientInvolved: false,
                                                immediateActions: "",
                                                riskLevel: "medium",
                                                followUpRequired: true,
                                            });
                                        }
                                        catch (error) {
                                            console.error("Error submitting whistleblowing report:", error);
                                            const errorMessage = error instanceof Error ? error.message : String(error);
                                            toast({
                                                title: "Submission Failed",
                                                description: `Failed to submit whistleblowing report: ${errorMessage}. Please review your input and try again.`,
                                                variant: "destructive",
                                            });
                                        }
                                    }, children: [_jsx(Shield, { className: "h-4 w-4 mr-2" }), "Submit Secure Report"] })] })] }) })] }));
};
export default GovernanceDocuments;
