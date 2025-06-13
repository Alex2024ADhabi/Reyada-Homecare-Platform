import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { FileText, Plus, Edit, Trash2, CheckCircle, MessageSquare, ClipboardCheck, UserCheck, FileCheck, Save, Upload, Download, RefreshCw, Calendar, BarChart2, CheckSquare, AlertTriangle, BookOpen, } from "lucide-react";
import { ICDCPTCodingAPI } from "@/api/icd-cpt-coding.api";
const ICDCPTCodingTracker = ({ patientId = "P12345", episodeId = "EP789", isOffline = false, }) => {
    const [activeTab, setActiveTab] = useState("records");
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRecord, setSelectedRecord] = useState(null);
    // Dialog states
    const [showNewRecordDialog, setShowNewRecordDialog] = useState(false);
    const [showPhysicianQueryDialog, setShowPhysicianQueryDialog] = useState(false);
    const [showQualityAuditDialog, setShowQualityAuditDialog] = useState(false);
    const [showPeerReviewDialog, setShowPeerReviewDialog] = useState(false);
    const [showAuthCheckDialog, setShowAuthCheckDialog] = useState(false);
    const [showCodeVerificationDialog, setShowCodeVerificationDialog] = useState(false);
    const [showMedicalRecordReviewDialog, setShowMedicalRecordReviewDialog] = useState(false);
    const [showGapAnalysisDialog, setShowGapAnalysisDialog] = useState(false);
    // Form states
    const [newIcdCode, setNewIcdCode] = useState("");
    const [newIcdDescription, setNewIcdDescription] = useState("");
    const [newCptCode, setNewCptCode] = useState("");
    const [newCptDescription, setNewCptDescription] = useState("");
    const [queryContent, setQueryContent] = useState("");
    const [queryFrom, setQueryFrom] = useState("Insurance Coding Officer");
    const [auditFindings, setAuditFindings] = useState("");
    const [auditActions, setAuditActions] = useState("");
    const [auditStatus, setAuditStatus] = useState("Pass");
    const [reviewerName, setReviewerName] = useState("");
    const [reviewComments, setReviewComments] = useState("");
    const [reviewApproval, setReviewApproval] = useState("Approved");
    const [discrepancies, setDiscrepancies] = useState("");
    const [resolutionRequired, setResolutionRequired] = useState(false);
    // New form states for enhanced functionality
    const [codeVerifier, setCodeVerifier] = useState("");
    const [codeVerificationComments, setCodeVerificationComments] = useState("");
    const [codeVerificationStatus, setCodeVerificationStatus] = useState("Verified");
    const [medicalRecordReviewer, setMedicalRecordReviewer] = useState("");
    const [medicalRecordFindings, setMedicalRecordFindings] = useState("");
    const [medicalRecordRecommendations, setMedicalRecordRecommendations] = useState("");
    const [gapAnalysisData, setGapAnalysisData] = useState(null);
    // Mock patient data
    const patient = {
        name: "Mohammed Al Mansoori",
        emiratesId: "784-1985-1234567-8",
        age: 67,
        gender: "Male",
        insurance: "Daman - Thiqa",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mohammed",
    };
    // Mock ICD-10 codes for dropdown
    const icdCodeOptions = [
        { code: "I10", description: "Essential (primary) hypertension" },
        {
            code: "E11.9",
            description: "Type 2 diabetes mellitus without complications",
        },
        {
            code: "J44.9",
            description: "Chronic obstructive pulmonary disease, unspecified",
        },
        { code: "M17.0", description: "Bilateral primary osteoarthritis of knee" },
        {
            code: "I25.10",
            description: "Atherosclerotic heart disease of native coronary artery without angina pectoris",
        },
    ];
    // Mock CPT codes for dropdown
    const cptCodeOptions = [
        { code: "99347", description: "Home visit, established patient (15 min)" },
        { code: "99348", description: "Home visit, established patient (25 min)" },
        { code: "99349", description: "Home visit, established patient (40 min)" },
        { code: "99350", description: "Home visit, established patient (60 min)" },
        { code: "97110", description: "Therapeutic exercises" },
        { code: "97112", description: "Neuromuscular reeducation" },
        { code: "97116", description: "Gait training" },
    ];
    // Fetch records from API
    useEffect(() => {
        const fetchRecords = async () => {
            try {
                // Use the API service to fetch records
                const fetchedRecords = await ICDCPTCodingAPI.getRecordsByPatientId(patientId);
                // Map the records to match the component's expected structure
                const mappedRecords = fetchedRecords.map((record) => ({
                    ...record,
                    _id: record.id, // Ensure compatibility with existing code that uses _id
                }));
                setRecords(mappedRecords);
            }
            catch (error) {
                console.error("Error fetching ICD & CPT records:", error);
                // If API fails, use mock data for demo purposes
                const mockRecords = [
                    {
                        id: "1",
                        _id: "1",
                        patient_id: patientId,
                        mrn: "MRN12345",
                        service_date: "2023-10-15",
                        authorization_number: "AUTH-98765",
                        icd_codes_assigned: ["I10", "E11.9"],
                        icd_descriptions: [
                            "Essential (primary) hypertension",
                            "Type 2 diabetes mellitus without complications",
                        ],
                        cpt_codes_assigned: ["99347", "97110"],
                        cpt_descriptions: [
                            "Home visit, established patient (15 min)",
                            "Therapeutic exercises",
                        ],
                        physician_query_required: true,
                        physician_query_sent: true,
                        physician_response_received: false,
                        qa_audit_completed: false,
                        peer_review_completed: false,
                        authorization_code_alignment_checked: false,
                        coding_status: "In Progress",
                        created_at: "2023-10-14T08:00:00Z",
                        updated_at: "2023-10-15T10:30:00Z",
                    },
                    {
                        id: "2",
                        _id: "2",
                        patient_id: patientId,
                        mrn: "MRN12345",
                        service_date: "2023-10-10",
                        authorization_number: "AUTH-98765",
                        icd_codes_assigned: ["J44.9"],
                        icd_descriptions: [
                            "Chronic obstructive pulmonary disease, unspecified",
                        ],
                        cpt_codes_assigned: ["99348", "97112"],
                        cpt_descriptions: [
                            "Home visit, established patient (25 min)",
                            "Neuromuscular reeducation",
                        ],
                        physician_query_required: false,
                        physician_query_sent: false,
                        physician_response_received: false,
                        qa_audit_completed: true,
                        peer_review_completed: true,
                        authorization_code_alignment_checked: true,
                        coding_status: "Completed",
                        created_at: "2023-10-09T08:00:00Z",
                        updated_at: "2023-10-11T14:45:00Z",
                    },
                ];
                setRecords(mockRecords);
            }
            finally {
                setLoading(false);
            }
        };
        fetchRecords();
    }, [patientId, isOffline]);
    // Create new record
    const handleCreateRecord = async () => {
        try {
            const newRecord = {
                patient_id: patientId,
                mrn: "MRN12345",
                service_date: new Date().toISOString().split("T")[0],
                authorization_number: "AUTH-98765",
                icd_codes_assigned: [],
                icd_descriptions: [],
                cpt_codes_assigned: [],
                cpt_descriptions: [],
                physician_query_required: false,
                physician_query_sent: false,
                physician_response_received: false,
                qa_audit_completed: false,
                peer_review_completed: false,
                authorization_code_alignment_checked: false,
                coding_status: "In Progress",
            };
            // Use the API service to create a new record
            const createdRecord = await ICDCPTCodingAPI.createRecord(newRecord);
            // Add _id for compatibility with existing code
            const recordWithId = {
                ...createdRecord,
                _id: createdRecord.id,
            };
            setRecords([...records, recordWithId]);
            setSelectedRecord(recordWithId);
            setShowNewRecordDialog(false);
        }
        catch (error) {
            console.error("Error creating ICD & CPT record:", error);
            alert("Failed to create record. Please try again.");
        }
    };
    // Add ICD code to selected record
    const handleAddIcdCode = async () => {
        if (!selectedRecord || !newIcdCode || !newIcdDescription)
            return;
        try {
            const updates = {
                icd_codes_assigned: [...selectedRecord.icd_codes_assigned, newIcdCode],
                icd_descriptions: [
                    ...selectedRecord.icd_descriptions,
                    newIcdDescription,
                ],
            };
            // Use the API service to update the record
            const updatedRecord = await ICDCPTCodingAPI.updateRecord(selectedRecord.id, updates);
            // Add _id for compatibility with existing code
            const recordWithId = {
                ...updatedRecord,
                _id: updatedRecord.id,
            };
            setRecords(records.map((record) => record.id === selectedRecord.id ? recordWithId : record));
            setSelectedRecord(recordWithId);
            setNewIcdCode("");
            setNewIcdDescription("");
        }
        catch (error) {
            console.error("Error adding ICD code:", error);
            alert("Failed to add ICD code. Please try again.");
        }
    };
    // Add CPT code to selected record
    const handleAddCptCode = async () => {
        if (!selectedRecord || !newCptCode || !newCptDescription)
            return;
        try {
            const updates = {
                cpt_codes_assigned: [...selectedRecord.cpt_codes_assigned, newCptCode],
                cpt_descriptions: [
                    ...selectedRecord.cpt_descriptions,
                    newCptDescription,
                ],
            };
            // Use the API service to update the record
            const updatedRecord = await ICDCPTCodingAPI.updateRecord(selectedRecord.id, updates);
            // Add _id for compatibility with existing code
            const recordWithId = {
                ...updatedRecord,
                _id: updatedRecord.id,
            };
            setRecords(records.map((record) => record.id === selectedRecord.id ? recordWithId : record));
            setSelectedRecord(recordWithId);
            setNewCptCode("");
            setNewCptDescription("");
        }
        catch (error) {
            console.error("Error adding CPT code:", error);
            alert("Failed to add CPT code. Please try again.");
        }
    };
    // Submit physician query
    const handleSubmitPhysicianQuery = async () => {
        if (!selectedRecord || !queryContent || !queryFrom)
            return;
        try {
            // Use the API service to submit a physician query
            const updatedRecord = await ICDCPTCodingAPI.submitPhysicianQuery(selectedRecord.id, { queryContent, queryFrom });
            // Add _id for compatibility with existing code
            const recordWithId = {
                ...updatedRecord,
                _id: updatedRecord.id,
            };
            setRecords(records.map((record) => record.id === selectedRecord.id ? recordWithId : record));
            setSelectedRecord(recordWithId);
            setShowPhysicianQueryDialog(false);
            setQueryContent("");
            setQueryFrom("Insurance Coding Officer");
            alert("Physician query submitted successfully");
        }
        catch (error) {
            console.error("Error submitting physician query:", error);
            alert("Failed to submit physician query. Please try again.");
        }
    };
    // Submit quality audit
    const handleSubmitQualityAudit = async () => {
        if (!selectedRecord || !auditFindings || !auditStatus)
            return;
        try {
            // Use the API service to submit a quality audit
            const updatedRecord = await ICDCPTCodingAPI.submitQualityAudit(selectedRecord.id, {
                findings: auditFindings,
                actionsRequired: auditActions,
                status: auditStatus,
            });
            // Add _id for compatibility with existing code
            const recordWithId = {
                ...updatedRecord,
                _id: updatedRecord.id,
            };
            setRecords(records.map((record) => record.id === selectedRecord.id ? recordWithId : record));
            setSelectedRecord(recordWithId);
            setShowQualityAuditDialog(false);
            setAuditFindings("");
            setAuditActions("");
            setAuditStatus("Pass");
            alert("Quality audit submitted successfully");
        }
        catch (error) {
            console.error("Error submitting quality audit:", error);
            alert("Failed to submit quality audit. Please try again.");
        }
    };
    // Submit peer review
    const handleSubmitPeerReview = async () => {
        if (!selectedRecord || !reviewerName || !reviewComments || !reviewApproval)
            return;
        try {
            // Use the API service to submit a peer review
            const updatedRecord = await ICDCPTCodingAPI.submitPeerReview(selectedRecord.id, {
                reviewer: reviewerName,
                comments: reviewComments,
                approval: reviewApproval,
            });
            // Add _id for compatibility with existing code
            const recordWithId = {
                ...updatedRecord,
                _id: updatedRecord.id,
            };
            setRecords(records.map((record) => record.id === selectedRecord.id ? recordWithId : record));
            setSelectedRecord(recordWithId);
            setShowPeerReviewDialog(false);
            setReviewerName("");
            setReviewComments("");
            setReviewApproval("Approved");
            alert("Peer review submitted successfully");
        }
        catch (error) {
            console.error("Error submitting peer review:", error);
            alert("Failed to submit peer review. Please try again.");
        }
    };
    // Submit authorization check
    const handleSubmitAuthCheck = async () => {
        if (!selectedRecord || !discrepancies)
            return;
        try {
            // Use the API service to submit an authorization check
            const updatedRecord = await ICDCPTCodingAPI.submitAuthorizationCheck(selectedRecord.id, {
                discrepancies,
                resolutionRequired,
            });
            // Add _id for compatibility with existing code
            const recordWithId = {
                ...updatedRecord,
                _id: updatedRecord.id,
            };
            setRecords(records.map((record) => record.id === selectedRecord.id ? recordWithId : record));
            setSelectedRecord(recordWithId);
            setShowAuthCheckDialog(false);
            setDiscrepancies("");
            setResolutionRequired(false);
            alert("Authorization check submitted successfully");
        }
        catch (error) {
            console.error("Error submitting authorization check:", error);
            alert("Failed to submit authorization check. Please try again.");
        }
    };
    // Delete record
    const handleDeleteRecord = async (recordId) => {
        if (!confirm("Are you sure you want to delete this record?"))
            return;
        try {
            // Use the API service to delete a record
            await ICDCPTCodingAPI.deleteRecord(recordId);
            setRecords(records.filter((record) => record.id !== recordId));
            if (selectedRecord?.id === recordId) {
                setSelectedRecord(null);
            }
            alert("Record deleted successfully");
        }
        catch (error) {
            console.error("Error deleting record:", error);
            alert("Failed to delete record. Please try again.");
        }
    };
    // Resolve discrepancy
    const handleResolveDiscrepancy = async (recordId) => {
        try {
            // Use the API service to resolve a discrepancy
            const updatedRecord = await ICDCPTCodingAPI.resolveDiscrepancy(recordId);
            // Add _id for compatibility with existing code
            const recordWithId = {
                ...updatedRecord,
                _id: updatedRecord.id,
            };
            setRecords(records.map((record) => record.id === recordId ? recordWithId : record));
            if (selectedRecord?.id === recordId) {
                setSelectedRecord(recordWithId);
            }
            alert("Discrepancy resolved successfully");
        }
        catch (error) {
            console.error("Error resolving discrepancy:", error);
            alert("Failed to resolve discrepancy. Please try again.");
        }
    };
    // New handlers for enhanced functionality
    // Handle code verification
    const handleSubmitCodeVerification = async () => {
        if (!selectedRecord || !codeVerifier || !codeVerificationComments)
            return;
        try {
            // In a real implementation, this would call the API
            // For now, we'll update the state directly
            const updatedRecord = {
                ...selectedRecord,
                code_verification_completed: true,
                code_verifier: codeVerifier,
                code_verification_comments: codeVerificationComments,
                code_verification_status: codeVerificationStatus,
                code_verification_date: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
            setRecords(records.map((record) => record.id === selectedRecord.id ? updatedRecord : record));
            setSelectedRecord(updatedRecord);
            setShowCodeVerificationDialog(false);
            setCodeVerifier("");
            setCodeVerificationComments("");
            setCodeVerificationStatus("Verified");
            alert("Code verification submitted successfully");
        }
        catch (error) {
            console.error("Error submitting code verification:", error);
            alert("Failed to submit code verification. Please try again.");
        }
    };
    // Handle medical record review
    const handleSubmitMedicalRecordReview = async () => {
        if (!selectedRecord || !medicalRecordReviewer || !medicalRecordFindings)
            return;
        try {
            // In a real implementation, this would call the API
            // For now, we'll update the state directly
            const updatedRecord = {
                ...selectedRecord,
                medical_record_review_completed: true,
                medical_record_reviewer: medicalRecordReviewer,
                medical_record_findings: medicalRecordFindings,
                medical_record_recommendations: medicalRecordRecommendations,
                medical_record_review_date: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
            setRecords(records.map((record) => record.id === selectedRecord.id ? updatedRecord : record));
            setSelectedRecord(updatedRecord);
            setShowMedicalRecordReviewDialog(false);
            setMedicalRecordReviewer("");
            setMedicalRecordFindings("");
            setMedicalRecordRecommendations("");
            alert("Medical record review submitted successfully");
        }
        catch (error) {
            console.error("Error submitting medical record review:", error);
            alert("Failed to submit medical record review. Please try again.");
        }
    };
    // Handle gap analysis
    const handlePerformGapAnalysis = async () => {
        try {
            // In a real implementation, this would call the API
            // For now, we'll use mock data
            const gapAnalysis = {
                totalRecords: records.length,
                completedRecords: records.filter((r) => r.coding_status === "Completed")
                    .length,
                pendingPhysicianQueries: records.filter((r) => r.physician_query_sent && !r.physician_response_received).length,
                pendingQualityAudits: records.filter((r) => !r.qa_audit_completed)
                    .length,
                pendingPeerReviews: records.filter((r) => !r.peer_review_completed)
                    .length,
                pendingAuthorizationChecks: records.filter((r) => !r.authorization_code_alignment_checked).length,
                complianceRate: records.length > 0
                    ? (records.filter((r) => r.qa_audit_completed &&
                        r.peer_review_completed &&
                        r.authorization_code_alignment_checked).length /
                        records.length) *
                        100
                    : 0,
                commonIssues: [
                    "Missing specificity in ICD-10 codes",
                    "CPT code and documentation mismatch",
                    "Authorization code misalignment",
                ],
                recommendations: [
                    "Schedule additional coder training on ICD-10 specificity",
                    "Implement pre-submission documentation review",
                    "Enhance authorization verification process",
                ],
            };
            setGapAnalysisData(gapAnalysis);
            setShowGapAnalysisDialog(true);
        }
        catch (error) {
            console.error("Error performing gap analysis:", error);
            alert("Failed to perform gap analysis. Please try again.");
        }
    };
    return (_jsxs("div", { className: "w-full h-full bg-background p-4 md:p-6", children: [_jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs(Avatar, { className: "h-16 w-16 border-2 border-primary", children: [_jsx(AvatarImage, { src: patient.avatar, alt: patient.name }), _jsx(AvatarFallback, { children: patient.name.substring(0, 2) })] }), _jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold", children: patient.name }), _jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground", children: [_jsxs("span", { children: ["Emirates ID: ", patient.emiratesId] }), _jsx("span", { className: "hidden sm:inline", children: "\u2022" }), _jsxs("span", { children: [patient.age, " years \u2022 ", patient.gender] }), _jsx("span", { className: "hidden sm:inline", children: "\u2022" }), _jsx(Badge, { variant: "outline", children: patient.insurance })] })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: isOffline ? "destructive" : "secondary", className: "text-xs", children: isOffline ? "Offline Mode" : "Online" }), _jsxs(Badge, { variant: "outline", className: "text-xs", children: ["Episode: ", episodeId] })] })] }), _jsx(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "mb-6", children: _jsxs(TabsList, { className: "grid w-full md:w-[800px] grid-cols-4", children: [_jsxs(TabsTrigger, { value: "records", children: [_jsx(FileText, { className: "h-4 w-4 mr-2" }), "ICD & CPT Records"] }), _jsxs(TabsTrigger, { value: "queries", children: [_jsx(MessageSquare, { className: "h-4 w-4 mr-2" }), "Physician Queries"] }), _jsxs(TabsTrigger, { value: "audits", children: [_jsx(ClipboardCheck, { className: "h-4 w-4 mr-2" }), "Quality Audits"] }), _jsxs(TabsTrigger, { value: "analytics", children: [_jsx(BarChart2, { className: "h-4 w-4 mr-2" }), "Analytics"] })] }) }), activeTab === "records" && (_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between pb-2", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: "ICD & CPT Records" }), _jsx(CardDescription, { children: "Manage coding records" })] }), _jsxs(Button, { onClick: () => setShowNewRecordDialog(true), size: "sm", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), " New Record"] })] }), _jsx(CardContent, { children: loading ? (_jsx("div", { className: "flex items-center justify-center h-[400px]", children: _jsx(RefreshCw, { className: "h-8 w-8 animate-spin text-muted-foreground" }) })) : records.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center justify-center h-[400px] text-center", children: [_jsx(FileText, { className: "h-16 w-16 text-muted-foreground mb-4" }), _jsx("h3", { className: "text-lg font-medium mb-2", children: "No Records Found" }), _jsx("p", { className: "text-sm text-muted-foreground max-w-md", children: "No ICD & CPT coding records found for this patient. Create a new record to get started." }), _jsxs(Button, { onClick: () => setShowNewRecordDialog(true), className: "mt-4", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), " Create New Record"] })] })) : (_jsx(ScrollArea, { className: "h-[400px]", children: _jsx("div", { className: "space-y-2", children: records.map((record) => (_jsxs("div", { className: `flex items-center justify-between p-3 rounded-md cursor-pointer ${selectedRecord?.id === record.id
                                                ? "bg-primary/10 border border-primary/30"
                                                : "hover:bg-accent"}`, onClick: () => setSelectedRecord({ ...record, _id: record.id }), children: [_jsxs("div", { children: [_jsxs("div", { className: "font-medium flex items-center", children: [_jsx(Calendar, { className: "h-4 w-4 mr-2 text-muted-foreground" }), new Date(record.service_date).toLocaleDateString()] }), _jsxs("div", { className: "text-sm text-muted-foreground", children: [record.icd_codes_assigned.length, " ICD,", " ", record.cpt_codes_assigned.length, " CPT codes"] })] }), _jsx(Badge, { variant: record.coding_status === "Completed"
                                                        ? "default"
                                                        : record.coding_status === "In Progress"
                                                            ? "secondary"
                                                            : "outline", children: record.coding_status })] }, record.id))) }) })) })] }), _jsx(Card, { className: "lg:col-span-2", children: selectedRecord ? (_jsxs(_Fragment, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: "Record Details" }), _jsxs(CardDescription, { children: ["Service Date:", " ", new Date(selectedRecord.service_date).toLocaleDateString()] })] }), _jsx("div", { className: "flex gap-2", children: _jsxs(Button, { variant: "outline", size: "sm", onClick: () => handleDeleteRecord(selectedRecord._id), children: [_jsx(Trash2, { className: "h-4 w-4 mr-2" }), " Delete"] }) })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium mb-2", children: "ICD-10 Codes" }), _jsxs("div", { className: "space-y-4", children: [selectedRecord.icd_codes_assigned.length > 0 ? (_jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Code" }), _jsx(TableHead, { children: "Description" })] }) }), _jsx(TableBody, { children: selectedRecord.icd_codes_assigned.map((code, index) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: code }), _jsx(TableCell, { children: selectedRecord.icd_descriptions[index] })] }, `icd-${index}`))) })] })) : (_jsx("div", { className: "text-sm text-muted-foreground", children: "No ICD-10 codes assigned yet." })), _jsxs("div", { className: "flex items-end gap-2", children: [_jsxs("div", { className: "space-y-2 flex-1", children: [_jsx(Label, { htmlFor: "icd-code", children: "Add ICD-10 Code" }), _jsxs(Select, { value: newIcdCode, onValueChange: (value) => {
                                                                                    setNewIcdCode(value);
                                                                                    const selectedOption = icdCodeOptions.find((option) => option.code === value);
                                                                                    if (selectedOption) {
                                                                                        setNewIcdDescription(selectedOption.description);
                                                                                    }
                                                                                }, children: [_jsx(SelectTrigger, { id: "icd-code", children: _jsx(SelectValue, { placeholder: "Select ICD-10 code" }) }), _jsx(SelectContent, { children: icdCodeOptions.map((option) => (_jsxs(SelectItem, { value: option.code, children: [option.code, " - ", option.description] }, option.code))) })] })] }), _jsxs(Button, { onClick: handleAddIcdCode, children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), " Add"] })] })] })] }), _jsx(Separator, {}), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium mb-2", children: "CPT Codes" }), _jsxs("div", { className: "space-y-4", children: [selectedRecord.cpt_codes_assigned.length > 0 ? (_jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Code" }), _jsx(TableHead, { children: "Description" })] }) }), _jsx(TableBody, { children: selectedRecord.cpt_codes_assigned.map((code, index) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: code }), _jsx(TableCell, { children: selectedRecord.cpt_descriptions[index] })] }, `cpt-${index}`))) })] })) : (_jsx("div", { className: "text-sm text-muted-foreground", children: "No CPT codes assigned yet." })), _jsxs("div", { className: "flex items-end gap-2", children: [_jsxs("div", { className: "space-y-2 flex-1", children: [_jsx(Label, { htmlFor: "cpt-code", children: "Add CPT Code" }), _jsxs(Select, { value: newCptCode, onValueChange: (value) => {
                                                                                    setNewCptCode(value);
                                                                                    const selectedOption = cptCodeOptions.find((option) => option.code === value);
                                                                                    if (selectedOption) {
                                                                                        setNewCptDescription(selectedOption.description);
                                                                                    }
                                                                                }, children: [_jsx(SelectTrigger, { id: "cpt-code", children: _jsx(SelectValue, { placeholder: "Select CPT code" }) }), _jsx(SelectContent, { children: cptCodeOptions.map((option) => (_jsxs(SelectItem, { value: option.code, children: [option.code, " - ", option.description] }, option.code))) })] })] }), _jsxs(Button, { onClick: handleAddCptCode, children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), " Add"] })] })] })] }), _jsx(Separator, {}), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium mb-2", children: "Status" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm", children: "Physician Query:" }), _jsx(Badge, { variant: selectedRecord.physician_query_sent
                                                                                    ? selectedRecord.physician_response_received
                                                                                        ? "default"
                                                                                        : "secondary"
                                                                                    : "outline", children: selectedRecord.physician_query_sent
                                                                                    ? selectedRecord.physician_response_received
                                                                                        ? "Completed"
                                                                                        : "Pending Response"
                                                                                    : "Not Required" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm", children: "Quality Audit:" }), _jsx(Badge, { variant: selectedRecord.qa_audit_completed
                                                                                    ? "default"
                                                                                    : "outline", children: selectedRecord.qa_audit_completed
                                                                                    ? "Completed"
                                                                                    : "Pending" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm", children: "Peer Review:" }), _jsx(Badge, { variant: selectedRecord.peer_review_completed
                                                                                    ? "default"
                                                                                    : "outline", children: selectedRecord.peer_review_completed
                                                                                    ? "Completed"
                                                                                    : "Pending" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm", children: "Authorization Check:" }), _jsx(Badge, { variant: selectedRecord.authorization_code_alignment_checked
                                                                                    ? "default"
                                                                                    : "outline", children: selectedRecord.authorization_code_alignment_checked
                                                                                    ? "Completed"
                                                                                    : "Pending" })] })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium mb-2", children: "Actions" }), _jsxs("div", { className: "space-y-2", children: [_jsxs(Button, { variant: "outline", className: "w-full justify-start", onClick: () => setShowMedicalRecordReviewDialog(true), children: [_jsx(BookOpen, { className: "h-4 w-4 mr-2" }), "Medical Record Review"] }), _jsxs(Button, { variant: "outline", className: "w-full justify-start", onClick: () => setShowCodeVerificationDialog(true), children: [_jsx(CheckSquare, { className: "h-4 w-4 mr-2" }), "Verify Code Assignment"] }), _jsxs(Button, { variant: "outline", className: "w-full justify-start", onClick: () => setShowPhysicianQueryDialog(true), children: [_jsx(MessageSquare, { className: "h-4 w-4 mr-2" }), "Submit Physician Query"] }), _jsxs(Button, { variant: "outline", className: "w-full justify-start", onClick: () => setShowQualityAuditDialog(true), children: [_jsx(ClipboardCheck, { className: "h-4 w-4 mr-2" }), "Submit Quality Audit"] }), _jsxs(Button, { variant: "outline", className: "w-full justify-start", onClick: () => setShowPeerReviewDialog(true), children: [_jsx(UserCheck, { className: "h-4 w-4 mr-2" }), "Submit Peer Review"] }), _jsxs(Button, { variant: "outline", className: "w-full justify-start", onClick: () => setShowAuthCheckDialog(true), children: [_jsx(FileCheck, { className: "h-4 w-4 mr-2" }), "Check Authorization Alignment"] })] })] })] })] }) }), _jsxs(CardFooter, { className: "flex justify-between border-t pt-4", children: [_jsxs("div", { className: "text-sm text-muted-foreground", children: ["Last updated:", " ", new Date(selectedRecord.updated_at).toLocaleString()] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "outline", onClick: () => {
                                                        const updatedRecord = {
                                                            ...selectedRecord,
                                                            coding_status: "In Progress",
                                                            updated_at: new Date().toISOString(),
                                                        };
                                                        setRecords(records.map((record) => record._id === selectedRecord._id
                                                            ? updatedRecord
                                                            : record));
                                                        setSelectedRecord(updatedRecord);
                                                    }, children: [_jsx(Save, { className: "h-4 w-4 mr-2" }), " Save Draft"] }), _jsxs(Button, { onClick: () => {
                                                        const updatedRecord = {
                                                            ...selectedRecord,
                                                            coding_status: "Completed",
                                                            updated_at: new Date().toISOString(),
                                                        };
                                                        setRecords(records.map((record) => record._id === selectedRecord._id
                                                            ? updatedRecord
                                                            : record));
                                                        setSelectedRecord(updatedRecord);
                                                    }, children: [_jsx(Upload, { className: "h-4 w-4 mr-2" }), " Complete Coding"] })] })] })] })) : (_jsxs("div", { className: "flex flex-col items-center justify-center h-[500px] text-center", children: [_jsx(FileText, { className: "h-16 w-16 text-muted-foreground mb-4" }), _jsx("h3", { className: "text-lg font-medium mb-2", children: "Select a Record to View Details" }), _jsx("p", { className: "text-sm text-muted-foreground max-w-md", children: "Select an existing record from the list or create a new one to start coding." }), _jsxs(Button, { onClick: () => setShowNewRecordDialog(true), className: "mt-4", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), " Create New Record"] })] })) })] })), activeTab === "queries" && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Physician Queries" }), _jsx(CardDescription, { children: "Track and manage physician queries for documentation clarification" })] }), _jsx(CardContent, { children: loading ? (_jsx("div", { className: "flex items-center justify-center h-[400px]", children: _jsx(RefreshCw, { className: "h-8 w-8 animate-spin text-muted-foreground" }) })) : (_jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Date" }), _jsx(TableHead, { children: "Record ID" }), _jsx(TableHead, { children: "Query Status" }), _jsx(TableHead, { children: "Response Status" }), _jsx(TableHead, { children: "Actions" })] }) }), _jsxs(TableBody, { children: [records
                                            .filter((record) => record.physician_query_sent)
                                            .map((record) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: new Date(record.service_date).toLocaleDateString() }), _jsx(TableCell, { children: record._id }), _jsx(TableCell, { children: _jsx(Badge, { variant: "secondary", children: "Sent" }) }), _jsx(TableCell, { children: _jsx(Badge, { variant: record.physician_response_received
                                                            ? "default"
                                                            : "outline", children: record.physician_response_received
                                                            ? "Received"
                                                            : "Pending" }) }), _jsx(TableCell, { children: _jsx(Button, { variant: "ghost", size: "sm", onClick: () => {
                                                            setSelectedRecord(record);
                                                            setActiveTab("records");
                                                        }, children: _jsx(Edit, { className: "h-4 w-4" }) }) })] }, record._id))), records.filter((record) => record.physician_query_sent)
                                            .length === 0 && (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 5, className: "text-center h-24 text-muted-foreground", children: "No physician queries found" }) }))] })] })) })] })), activeTab === "audits" && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Quality Audits" }), _jsx(CardDescription, { children: "Track quality audits and peer reviews for coding accuracy" })] }), _jsx(CardContent, { children: loading ? (_jsx("div", { className: "flex items-center justify-center h-[400px]", children: _jsx(RefreshCw, { className: "h-8 w-8 animate-spin text-muted-foreground" }) })) : (_jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Date" }), _jsx(TableHead, { children: "Record ID" }), _jsx(TableHead, { children: "Quality Audit" }), _jsx(TableHead, { children: "Peer Review" }), _jsx(TableHead, { children: "Actions" })] }) }), _jsxs(TableBody, { children: [records
                                            .filter((record) => record.qa_audit_completed ||
                                            record.peer_review_completed)
                                            .map((record) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: new Date(record.service_date).toLocaleDateString() }), _jsx(TableCell, { children: record._id }), _jsx(TableCell, { children: _jsx(Badge, { variant: record.qa_audit_completed ? "default" : "outline", children: record.qa_audit_completed
                                                            ? "Completed"
                                                            : "Pending" }) }), _jsx(TableCell, { children: _jsx(Badge, { variant: record.peer_review_completed
                                                            ? "default"
                                                            : "outline", children: record.peer_review_completed
                                                            ? "Completed"
                                                            : "Pending" }) }), _jsx(TableCell, { children: _jsx(Button, { variant: "ghost", size: "sm", onClick: () => {
                                                            setSelectedRecord(record);
                                                            setActiveTab("records");
                                                        }, children: _jsx(Edit, { className: "h-4 w-4" }) }) })] }, record._id))), records.filter((record) => record.qa_audit_completed || record.peer_review_completed).length === 0 && (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 5, className: "text-center h-24 text-muted-foreground", children: "No quality audits or peer reviews found" }) }))] })] })) })] })), activeTab === "analytics" && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Total Records" }), _jsx(FileText, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: records.length }), _jsx("p", { className: "text-xs text-muted-foreground", children: "+2 from last week" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Completion Rate" }), _jsx(CheckCircle, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold", children: [records.length > 0
                                                        ? Math.round((records.filter((r) => r.coding_status === "Completed")
                                                            .length /
                                                            records.length) *
                                                            100)
                                                        : 0, "%"] }), _jsx("p", { className: "text-xs text-muted-foreground", children: "+5% from last month" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Avg. Accuracy" }), _jsx(BarChart2, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: "95.5%" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "+1.2% from last month" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Pending Queries" }), _jsx(MessageSquare, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: records.filter((r) => r.physician_query_sent &&
                                                    !r.physician_response_received).length }), _jsx("p", { className: "text-xs text-muted-foreground", children: "-2 from yesterday" })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Gap Analysis" }), _jsx(CardDescription, { children: "Identify improvement opportunities in coding processes" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm", children: "Compliance Rate" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Progress, { value: 98.2, className: "w-20" }), _jsx("span", { className: "text-sm font-medium", children: "98.2%" })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm", children: "Documentation Quality" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Progress, { value: 94.5, className: "w-20" }), _jsx("span", { className: "text-sm font-medium", children: "94.5%" })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm", children: "Code Accuracy" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Progress, { value: 95.5, className: "w-20" }), _jsx("span", { className: "text-sm font-medium", children: "95.5%" })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm", children: "Query Response Time" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Progress, { value: 87.3, className: "w-20" }), _jsx("span", { className: "text-sm font-medium", children: "87.3%" })] })] })] }), _jsxs(Button, { onClick: handlePerformGapAnalysis, className: "w-full mt-4", variant: "outline", children: [_jsx(BarChart2, { className: "h-4 w-4 mr-2" }), "Generate Detailed Gap Analysis"] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Common Issues & Recommendations" }), _jsx(CardDescription, { children: "Top issues identified and improvement suggestions" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "border-l-4 border-yellow-500 pl-4", children: [_jsx("h4", { className: "font-medium text-sm", children: "Missing ICD-10 Specificity" }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "15% of codes lack required specificity level" })] }), _jsxs("div", { className: "border-l-4 border-orange-500 pl-4", children: [_jsx("h4", { className: "font-medium text-sm", children: "CPT Documentation Mismatch" }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "8% of CPT codes don't align with documentation" })] }), _jsxs("div", { className: "border-l-4 border-red-500 pl-4", children: [_jsx("h4", { className: "font-medium text-sm", children: "Authorization Alignment" }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "5% of codes need authorization verification" })] }), _jsxs("div", { className: "mt-4 p-3 bg-blue-50 rounded-md", children: [_jsx("h4", { className: "font-medium text-sm text-blue-900", children: "Recommendations" }), _jsxs("ul", { className: "text-xs text-blue-800 mt-1 space-y-1", children: [_jsx("li", { children: "\u2022 Schedule ICD-10 specificity training" }), _jsx("li", { children: "\u2022 Implement pre-submission review process" }), _jsx("li", { children: "\u2022 Enhance authorization verification workflow" })] })] })] }) })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Performance Trends" }), _jsx(CardDescription, { children: "Monthly trends in coding accuracy and efficiency" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "font-medium text-sm", children: "Accuracy Trend" }), _jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "flex justify-between text-xs", children: [_jsx("span", { children: "Jan" }), _jsx("span", { children: "94.2%" })] }), _jsx(Progress, { value: 94.2, className: "h-2" }), _jsxs("div", { className: "flex justify-between text-xs", children: [_jsx("span", { children: "Feb" }), _jsx("span", { children: "95.1%" })] }), _jsx(Progress, { value: 95.1, className: "h-2" }), _jsxs("div", { className: "flex justify-between text-xs", children: [_jsx("span", { children: "Mar" }), _jsx("span", { children: "95.5%" })] }), _jsx(Progress, { value: 95.5, className: "h-2" }), _jsxs("div", { className: "flex justify-between text-xs", children: [_jsx("span", { children: "Apr" }), _jsx("span", { children: "96.0%" })] }), _jsx(Progress, { value: 96.0, className: "h-2" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "font-medium text-sm", children: "Completion Time (Hours)" }), _jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "flex justify-between text-xs", children: [_jsx("span", { children: "Jan" }), _jsx("span", { children: "3.2" })] }), _jsx(Progress, { value: 64, className: "h-2" }), _jsxs("div", { className: "flex justify-between text-xs", children: [_jsx("span", { children: "Feb" }), _jsx("span", { children: "2.8" })] }), _jsx(Progress, { value: 56, className: "h-2" }), _jsxs("div", { className: "flex justify-between text-xs", children: [_jsx("span", { children: "Mar" }), _jsx("span", { children: "2.5" })] }), _jsx(Progress, { value: 50, className: "h-2" }), _jsxs("div", { className: "flex justify-between text-xs", children: [_jsx("span", { children: "Apr" }), _jsx("span", { children: "2.3" })] }), _jsx(Progress, { value: 46, className: "h-2" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "font-medium text-sm", children: "Compliance Rate" }), _jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "flex justify-between text-xs", children: [_jsx("span", { children: "Jan" }), _jsx("span", { children: "96.5%" })] }), _jsx(Progress, { value: 96.5, className: "h-2" }), _jsxs("div", { className: "flex justify-between text-xs", children: [_jsx("span", { children: "Feb" }), _jsx("span", { children: "97.2%" })] }), _jsx(Progress, { value: 97.2, className: "h-2" }), _jsxs("div", { className: "flex justify-between text-xs", children: [_jsx("span", { children: "Mar" }), _jsx("span", { children: "98.2%" })] }), _jsx(Progress, { value: 98.2, className: "h-2" }), _jsxs("div", { className: "flex justify-between text-xs", children: [_jsx("span", { children: "Apr" }), _jsx("span", { children: "98.5%" })] }), _jsx(Progress, { value: 98.5, className: "h-2" })] })] })] }) })] })] })), _jsx(Dialog, { open: showNewRecordDialog, onOpenChange: setShowNewRecordDialog, children: _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Create New ICD & CPT Record" }), _jsx(DialogDescription, { children: "Create a new coding record for this patient" })] }), _jsxs("div", { className: "space-y-4 py-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "mrn", children: "Medical Record Number" }), _jsx(Input, { id: "mrn", defaultValue: "MRN12345" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "service-date", children: "Service Date" }), _jsx(Input, { id: "service-date", type: "date", defaultValue: new Date().toISOString().split("T")[0] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "auth-number", children: "Authorization Number" }), _jsx(Input, { id: "auth-number", defaultValue: "AUTH-98765" })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setShowNewRecordDialog(false), children: "Cancel" }), _jsx(Button, { onClick: handleCreateRecord, children: "Create Record" })] })] }) }), _jsx(Dialog, { open: showPhysicianQueryDialog, onOpenChange: setShowPhysicianQueryDialog, children: _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Submit Physician Query" }), _jsx(DialogDescription, { children: "Request clarification from physician for documentation or coding" })] }), _jsxs("div", { className: "space-y-4 py-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "query-from", children: "Query From" }), _jsxs(Select, { value: queryFrom, onValueChange: setQueryFrom, children: [_jsx(SelectTrigger, { id: "query-from", children: _jsx(SelectValue, { placeholder: "Select role" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "Insurance Coding Officer", children: "Insurance Coding Officer" }), _jsx(SelectItem, { value: "Medical Records Officer", children: "Medical Records Officer" }), _jsx(SelectItem, { value: "Quality Assurance Officer", children: "Quality Assurance Officer" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "query-content", children: "Query Content" }), _jsx(Textarea, { id: "query-content", placeholder: "Enter your query for the physician...", className: "h-32", value: queryContent, onChange: (e) => setQueryContent(e.target.value) })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setShowPhysicianQueryDialog(false), children: "Cancel" }), _jsx(Button, { onClick: handleSubmitPhysicianQuery, children: "Submit Query" })] })] }) }), _jsx(Dialog, { open: showQualityAuditDialog, onOpenChange: setShowQualityAuditDialog, children: _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Submit Quality Audit" }), _jsx(DialogDescription, { children: "Document quality audit findings for this coding record" })] }), _jsxs("div", { className: "space-y-4 py-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "audit-status", children: "Audit Status" }), _jsxs(Select, { value: auditStatus, onValueChange: setAuditStatus, children: [_jsx(SelectTrigger, { id: "audit-status", children: _jsx(SelectValue, { placeholder: "Select status" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "Pass", children: "Pass" }), _jsx(SelectItem, { value: "Fail", children: "Fail" }), _jsx(SelectItem, { value: "Needs Improvement", children: "Needs Improvement" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "audit-findings", children: "Audit Findings" }), _jsx(Textarea, { id: "audit-findings", placeholder: "Enter audit findings...", className: "h-24", value: auditFindings, onChange: (e) => setAuditFindings(e.target.value) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "audit-actions", children: "Actions Required" }), _jsx(Textarea, { id: "audit-actions", placeholder: "Enter actions required (if any)...", className: "h-24", value: auditActions, onChange: (e) => setAuditActions(e.target.value) })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setShowQualityAuditDialog(false), children: "Cancel" }), _jsx(Button, { onClick: handleSubmitQualityAudit, children: "Submit Audit" })] })] }) }), _jsx(Dialog, { open: showPeerReviewDialog, onOpenChange: setShowPeerReviewDialog, children: _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Submit Peer Review" }), _jsx(DialogDescription, { children: "Document peer review findings for this coding record" })] }), _jsxs("div", { className: "space-y-4 py-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "reviewer-name", children: "Reviewer Name" }), _jsx(Input, { id: "reviewer-name", placeholder: "Enter reviewer name", value: reviewerName, onChange: (e) => setReviewerName(e.target.value) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "review-comments", children: "Review Comments" }), _jsx(Textarea, { id: "review-comments", placeholder: "Enter review comments...", className: "h-24", value: reviewComments, onChange: (e) => setReviewComments(e.target.value) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "review-approval", children: "Review Outcome" }), _jsxs(Select, { value: reviewApproval, onValueChange: setReviewApproval, children: [_jsx(SelectTrigger, { id: "review-approval", children: _jsx(SelectValue, { placeholder: "Select outcome" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "Approved", children: "Approved" }), _jsx(SelectItem, { value: "Rejected", children: "Rejected" }), _jsx(SelectItem, { value: "Needs Revision", children: "Needs Revision" })] })] })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setShowPeerReviewDialog(false), children: "Cancel" }), _jsx(Button, { onClick: handleSubmitPeerReview, children: "Submit Review" })] })] }) }), _jsx(Dialog, { open: showAuthCheckDialog, onOpenChange: setShowAuthCheckDialog, children: _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Check Authorization Alignment" }), _jsx(DialogDescription, { children: "Verify that assigned codes align with authorized services" })] }), _jsxs("div", { className: "space-y-4 py-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "discrepancies", children: "Discrepancies Found" }), _jsx(Textarea, { id: "discrepancies", placeholder: "Describe any discrepancies between codes and authorized services...", className: "h-24", value: discrepancies, onChange: (e) => setDiscrepancies(e.target.value) })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "resolution-required", checked: resolutionRequired, onCheckedChange: (checked) => setResolutionRequired(checked === true) }), _jsx(Label, { htmlFor: "resolution-required", children: "Resolution required before claim submission" })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setShowAuthCheckDialog(false), children: "Cancel" }), _jsx(Button, { onClick: handleSubmitAuthCheck, children: "Submit Check" })] })] }) }), _jsx(Dialog, { open: showCodeVerificationDialog, onOpenChange: setShowCodeVerificationDialog, children: _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Code Assignment Verification" }), _jsx(DialogDescription, { children: "Verify the accuracy and appropriateness of assigned ICD and CPT codes" })] }), _jsxs("div", { className: "space-y-4 py-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "code-verifier", children: "Verifier Name" }), _jsx(Input, { id: "code-verifier", placeholder: "Enter verifier name", value: codeVerifier, onChange: (e) => setCodeVerifier(e.target.value) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "verification-comments", children: "Verification Comments" }), _jsx(Textarea, { id: "verification-comments", placeholder: "Enter verification findings and comments...", className: "h-24", value: codeVerificationComments, onChange: (e) => setCodeVerificationComments(e.target.value) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "verification-status", children: "Verification Status" }), _jsxs(Select, { value: codeVerificationStatus, onValueChange: setCodeVerificationStatus, children: [_jsx(SelectTrigger, { id: "verification-status", children: _jsx(SelectValue, { placeholder: "Select status" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "Verified", children: "Verified" }), _jsx(SelectItem, { value: "Needs Revision", children: "Needs Revision" }), _jsx(SelectItem, { value: "Rejected", children: "Rejected" })] })] })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setShowCodeVerificationDialog(false), children: "Cancel" }), _jsx(Button, { onClick: handleSubmitCodeVerification, children: "Submit Verification" })] })] }) }), _jsx(Dialog, { open: showMedicalRecordReviewDialog, onOpenChange: setShowMedicalRecordReviewDialog, children: _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Enhanced Medical Record Review" }), _jsx(DialogDescription, { children: "Comprehensive review of medical records and clinical documentation" })] }), _jsxs("div", { className: "space-y-4 py-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "medical-reviewer", children: "Reviewer Name" }), _jsx(Input, { id: "medical-reviewer", placeholder: "Enter reviewer name", value: medicalRecordReviewer, onChange: (e) => setMedicalRecordReviewer(e.target.value) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "medical-findings", children: "Review Findings" }), _jsx(Textarea, { id: "medical-findings", placeholder: "Document findings from medical record review...", className: "h-24", value: medicalRecordFindings, onChange: (e) => setMedicalRecordFindings(e.target.value) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "medical-recommendations", children: "Recommendations" }), _jsx(Textarea, { id: "medical-recommendations", placeholder: "Enter recommendations for improvement...", className: "h-24", value: medicalRecordRecommendations, onChange: (e) => setMedicalRecordRecommendations(e.target.value) })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setShowMedicalRecordReviewDialog(false), children: "Cancel" }), _jsx(Button, { onClick: handleSubmitMedicalRecordReview, children: "Submit Review" })] })] }) }), _jsx(Dialog, { open: showGapAnalysisDialog, onOpenChange: setShowGapAnalysisDialog, children: _jsxs(DialogContent, { className: "max-w-4xl", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Gap Analysis Report" }), _jsx(DialogDescription, { children: "Comprehensive analysis of coding processes and improvement opportunities" })] }), _jsx("div", { className: "space-y-6 py-4 max-h-[600px] overflow-y-auto", children: gapAnalysisData && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "text-center p-4 bg-blue-50 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: gapAnalysisData.totalRecords }), _jsx("div", { className: "text-sm text-blue-800", children: "Total Records" })] }), _jsxs("div", { className: "text-center p-4 bg-green-50 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: gapAnalysisData.completedRecords }), _jsx("div", { className: "text-sm text-green-800", children: "Completed" })] }), _jsxs("div", { className: "text-center p-4 bg-yellow-50 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-yellow-600", children: gapAnalysisData.pendingPhysicianQueries }), _jsx("div", { className: "text-sm text-yellow-800", children: "Pending Queries" })] }), _jsxs("div", { className: "text-center p-4 bg-purple-50 rounded-lg", children: [_jsxs("div", { className: "text-2xl font-bold text-purple-600", children: [gapAnalysisData.complianceRate.toFixed(1), "%"] }), _jsx("div", { className: "text-sm text-purple-800", children: "Compliance Rate" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium mb-3", children: "Process Status" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm", children: "Quality Audits Pending" }), _jsx(Badge, { variant: "outline", children: gapAnalysisData.pendingQualityAudits })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm", children: "Peer Reviews Pending" }), _jsx(Badge, { variant: "outline", children: gapAnalysisData.pendingPeerReviews })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm", children: "Authorization Checks Pending" }), _jsx(Badge, { variant: "outline", children: gapAnalysisData.pendingAuthorizationChecks })] })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium mb-3", children: "Common Issues" }), _jsx("div", { className: "space-y-2", children: gapAnalysisData.commonIssues.map((issue, index) => (_jsxs("div", { className: "flex items-start gap-2", children: [_jsx(AlertTriangle, { className: "h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" }), _jsx("span", { className: "text-sm", children: issue })] }, index))) })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium mb-3", children: "Recommendations" }), _jsx("div", { className: "space-y-2", children: gapAnalysisData.recommendations.map((recommendation, index) => (_jsxs("div", { className: "flex items-start gap-2", children: [_jsx(CheckCircle, { className: "h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" }), _jsx("span", { className: "text-sm", children: recommendation })] }, index))) })] })] })) }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setShowGapAnalysisDialog(false), children: "Close" }), _jsxs(Button, { onClick: () => window.print(), children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "Export Report"] })] })] }) })] }));
};
export default ICDCPTCodingTracker;
