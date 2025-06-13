import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Plus, Eye, Edit, CheckCircle, XCircle, Clock, FileText, TrendingUp, AlertCircle, } from "lucide-react";
import { getIncidentReports, createIncidentReport, approveIncidentReport, addCorrectiveAction, getIncidentAnalytics, getOverdueCorrectiveActions, getIncidentsRequiringNotification, } from "@/api/incident-management.api";
import { getADHICSComplianceOverview, ClinicalIncidentManagementEngine, sampleNGTIncident, } from "@/api/administrative-integration.api";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { toast } from "@/components/ui/use-toast";
export default function IncidentReportingDashboard({ userId = "Dr. Sarah Ahmed", userRole = "supervisor", showADHICSCompliance = true, facilityId = "facility-001", }) {
    const [incidents, setIncidents] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [overdueActions, setOverdueActions] = useState([]);
    const [notificationRequired, setNotificationRequired] = useState([]);
    const [adhicsCompliance, setAdhicsCompliance] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showActionDialog, setShowActionDialog] = useState(false);
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [showClinicalIncidentDialog, setShowClinicalIncidentDialog] = useState(false);
    const [clinicalIncidentEngine] = useState(new ClinicalIncidentManagementEngine());
    const [processedIncidents, setProcessedIncidents] = useState([]);
    const [showSampleIncident, setShowSampleIncident] = useState(false);
    const [filters, setFilters] = useState({
        date_from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
        date_to: new Date().toISOString().split("T")[0],
    });
    const [newIncident, setNewIncident] = useState({
        incident_type: "safety",
        severity: "medium",
        status: "reported",
        reported_by: userId,
        reported_date: new Date().toISOString().split("T")[0],
        incident_date: new Date().toISOString().split("T")[0],
        incident_time: new Date().toTimeString().split(" ")[0].substring(0, 5),
        location: "",
        description: "",
        immediate_actions: "",
        witnesses: [],
        photos: [],
        documents: [],
        investigation: {},
        corrective_actions: [],
        regulatory_notification: { required: false },
        approval: { status: "pending" },
        // DOH Patient Safety Taxonomy (Circular 19/2025)
        doh_taxonomy: {
            level_1: "", // Primary category
            level_2: "", // Subcategory
            level_3: "", // Specific type
            level_4: "", // Contributing factors
            level_5: "", // Root cause analysis
        },
        doh_reportable: false,
        whistleblowing_eligible: false,
        // Enhanced documentation standards (CN_48/2025)
        documentation_compliance: {
            loinc_codes_validated: false,
            required_loinc_codes: [],
            documentation_quality_score: 0,
            coding_standards_met: false,
            quality_metrics: {
                completeness_score: 0,
                accuracy_score: 0,
                timeliness_score: 0,
            },
        },
    });
    const [newAction, setNewAction] = useState({
        description: "",
        assigned_to: "",
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
        status: "pending",
    });
    const [incidentClassification, setIncidentClassification] = useState({
        primary_category: "",
        sub_category: "",
        risk_score: 0,
        severity_matrix: {
            impact: 1,
            probability: 1,
            detectability: 1,
        },
        automated_severity: "medium",
    });
    const [predictiveAnalytics, setPredictiveAnalytics] = useState({
        risk_prediction: 0,
        similar_incidents: [],
        trend_analysis: null,
        prevention_recommendations: [],
    });
    const [rootCauseAnalysis, setRootCauseAnalysis] = useState({
        fishbone_categories: {
            people: [],
            process: [],
            environment: [],
            equipment: [],
            materials: [],
            methods: [],
        },
        five_whys: ["", "", "", "", ""],
        contributing_factors: [],
        root_causes: [],
    });
    const { isOnline, saveFormData } = useOfflineSync();
    // Process sample NGT incident on component mount
    useEffect(() => {
        const processSampleIncident = async () => {
            try {
                const result = await clinicalIncidentEngine.processClinicalIncident(sampleNGTIncident);
                setProcessedIncidents((prev) => [...prev, result]);
            }
            catch (error) {
                console.error("Error processing sample incident:", error);
            }
        };
        processSampleIncident();
    }, []);
    useEffect(() => {
        loadDashboardData();
    }, []);
    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const promises = [
                getIncidentReports(filters),
                getIncidentAnalytics({
                    date_from: filters.date_from,
                    date_to: filters.date_to,
                    location: filters.location,
                }),
                getOverdueCorrectiveActions(),
                getIncidentsRequiringNotification(),
            ];
            if (showADHICSCompliance) {
                promises.push(getADHICSComplianceOverview(facilityId));
            }
            const results = await Promise.all(promises);
            const [incidentsData, analyticsData, overdueData, notificationData, adhicsData,] = results;
            setIncidents(incidentsData);
            setAnalytics(analyticsData);
            setOverdueActions(overdueData);
            setNotificationRequired(notificationData);
            if (showADHICSCompliance && adhicsData) {
                setAdhicsCompliance(adhicsData);
            }
            if (isOnline) {
                toast({
                    title: "Dashboard loaded",
                    description: `Found ${incidentsData.length} incidents`,
                });
            }
        }
        catch (error) {
            console.error("Error loading dashboard data:", error);
            if (isOnline) {
                toast({
                    title: "Error loading dashboard",
                    description: error instanceof Error
                        ? error.message
                        : "Failed to load dashboard data",
                    variant: "destructive",
                });
            }
        }
        finally {
            setLoading(false);
        }
    };
    const handleCreateIncident = async () => {
        try {
            setLoading(true);
            const incidentId = `INC-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, "0")}-${String(incidents.length + 1).padStart(3, "0")}`;
            await createIncidentReport({
                ...newIncident,
                incident_id: incidentId,
            });
            // Save to offline storage if offline
            if (!isOnline) {
                await saveFormData("incident_report", {
                    ...newIncident,
                    incident_id: incidentId,
                    timestamp: new Date().toISOString(),
                });
            }
            setShowCreateDialog(false);
            setNewIncident({
                incident_type: "safety",
                severity: "medium",
                status: "reported",
                reported_by: userId,
                reported_date: new Date().toISOString().split("T")[0],
                incident_date: new Date().toISOString().split("T")[0],
                incident_time: new Date().toTimeString().split(" ")[0].substring(0, 5),
                location: "",
                description: "",
                immediate_actions: "",
                witnesses: [],
                photos: [],
                documents: [],
                investigation: {},
                corrective_actions: [],
                regulatory_notification: { required: false },
                approval: { status: "pending" },
            });
            await loadDashboardData();
            if (isOnline) {
                toast({
                    title: "Incident created",
                    description: `Incident ${incidentId} has been reported successfully`,
                });
            }
        }
        catch (error) {
            console.error("Error creating incident:", error);
            if (isOnline) {
                toast({
                    title: "Error creating incident",
                    description: error instanceof Error
                        ? error.message
                        : "Failed to create incident",
                    variant: "destructive",
                });
            }
            else {
                toast({
                    title: "Incident saved offline",
                    description: "Incident will be submitted when connection is restored",
                });
            }
        }
        finally {
            setLoading(false);
        }
    };
    const handleApproveIncident = async (id) => {
        try {
            setLoading(true);
            await approveIncidentReport(id, userId, "Incident approved after review");
            await loadDashboardData();
            toast({
                title: "Incident approved",
                description: `Incident has been approved successfully`,
            });
        }
        catch (error) {
            console.error("Error approving incident:", error);
            toast({
                title: "Error approving incident",
                description: error instanceof Error ? error.message : "Failed to approve incident",
                variant: "destructive",
            });
        }
        finally {
            setLoading(false);
        }
    };
    const handleAddCorrectiveAction = async () => {
        if (!selectedIncident)
            return;
        try {
            setLoading(true);
            await addCorrectiveAction(selectedIncident._id.toString(), newAction);
            setShowActionDialog(false);
            setNewAction({
                description: "",
                assigned_to: "",
                due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split("T")[0],
                status: "pending",
            });
            await loadDashboardData();
            toast({
                title: "Corrective action added",
                description: `Action has been added to incident ${selectedIncident.incident_id}`,
            });
        }
        catch (error) {
            console.error("Error adding corrective action:", error);
            toast({
                title: "Error adding corrective action",
                description: error instanceof Error
                    ? error.message
                    : "Failed to add corrective action",
                variant: "destructive",
            });
        }
        finally {
            setLoading(false);
        }
    };
    const handleProcessClinicalIncident = async (incident) => {
        try {
            setLoading(true);
            const result = await clinicalIncidentEngine.processClinicalIncident(incident);
            setProcessedIncidents((prev) => [...prev, result]);
            // Save to offline storage if offline
            if (!isOnline) {
                await saveFormData("clinical_incident", {
                    ...result,
                    timestamp: new Date().toISOString(),
                });
            }
            toast({
                title: "Clinical Incident Processed",
                description: `Incident ${incident.referenceNo} has been processed successfully`,
            });
        }
        catch (error) {
            console.error("Error processing clinical incident:", error);
            toast({
                title: "Error processing incident",
                description: error instanceof Error
                    ? error.message
                    : "Failed to process clinical incident",
                variant: "destructive",
            });
        }
        finally {
            setLoading(false);
        }
    };
    const handleShowSampleIncident = () => {
        setShowSampleIncident(true);
    };
    // Search functionality
    const [searchTerm, setSearchTerm] = useState("");
    const filteredIncidents = incidents.filter((incident) => incident.incident_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.reported_by.toLowerCase().includes(searchTerm.toLowerCase()));
    const getSeverityBadge = (severity) => {
        const variants = {
            low: "secondary",
            medium: "default",
            high: "destructive",
            critical: "destructive",
        };
        return (_jsx(Badge, { variant: variants[severity] || "secondary", children: severity.toUpperCase() }));
    };
    const getStatusBadge = (status) => {
        const variants = {
            reported: "outline",
            investigating: "secondary",
            resolved: "default",
            closed: "secondary",
        };
        const icons = {
            reported: _jsx(AlertTriangle, { className: "w-3 h-3" }),
            investigating: _jsx(Clock, { className: "w-3 h-3" }),
            resolved: _jsx(CheckCircle, { className: "w-3 h-3" }),
            closed: _jsx(XCircle, { className: "w-3 h-3" }),
        };
        return (_jsxs(Badge, { variant: variants[status] || "outline", className: "flex items-center gap-1", children: [icons[status], status] }));
    };
    const getApprovalBadge = (status) => {
        const variants = {
            approved: "default",
            pending: "secondary",
            rejected: "destructive",
        };
        const icons = {
            approved: _jsx(CheckCircle, { className: "w-3 h-3" }),
            pending: _jsx(Clock, { className: "w-3 h-3" }),
            rejected: _jsx(XCircle, { className: "w-3 h-3" }),
        };
        return (_jsxs(Badge, { variant: variants[status] || "secondary", className: "flex items-center gap-1", children: [icons[status], status] }));
    };
    return (_jsx("div", { className: "min-h-screen bg-gray-50 p-6", children: _jsxs("div", { className: "max-w-7xl mx-auto space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Incident Reporting Dashboard" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Manage incident reports, investigations, and corrective actions" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [!isOnline && (_jsxs(Badge, { variant: "destructive", className: "flex items-center gap-1", children: [_jsx(AlertCircle, { className: "w-3 h-3" }), "Offline Mode - Limited Functionality"] })), _jsxs(Button, { variant: "outline", onClick: handleShowSampleIncident, disabled: loading, children: [_jsx(FileText, { className: "w-4 h-4 mr-2" }), "View Sample NGT Case"] }), _jsxs(Dialog, { open: showCreateDialog, onOpenChange: setShowCreateDialog, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { disabled: loading, children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), loading ? "Creating..." : "Report Incident"] }) }), _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Report New Incident" }), _jsx(DialogDescription, { children: "Report a new incident for investigation and follow-up" })] }), _jsxs("div", { className: "grid gap-4 py-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "incidentType", children: "Incident Type" }), _jsxs(Select, { value: newIncident.incident_type, onValueChange: (value) => setNewIncident({
                                                                                ...newIncident,
                                                                                incident_type: value,
                                                                            }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "safety", children: "Safety" }), _jsx(SelectItem, { value: "quality", children: "Quality" }), _jsx(SelectItem, { value: "equipment", children: "Equipment" }), _jsx(SelectItem, { value: "medication", children: "Medication" }), _jsx(SelectItem, { value: "patient_fall", children: "Patient Fall" }), _jsx(SelectItem, { value: "infection", children: "Infection" }), _jsx(SelectItem, { value: "clinical_care", children: "Clinical Care" }), _jsx(SelectItem, { value: "documentation", children: "Documentation" }), _jsx(SelectItem, { value: "communication", children: "Communication" }), _jsx(SelectItem, { value: "behavioral", children: "Behavioral" }), _jsx(SelectItem, { value: "other", children: "Other" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "severity", children: "Severity" }), _jsxs(Select, { value: newIncident.severity, onValueChange: (value) => setNewIncident({
                                                                                ...newIncident,
                                                                                severity: value,
                                                                            }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "low", children: "Low" }), _jsx(SelectItem, { value: "medium", children: "Medium" }), _jsx(SelectItem, { value: "high", children: "High" }), _jsx(SelectItem, { value: "critical", children: "Critical" })] })] })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "incidentDate", children: "Incident Date" }), _jsx(Input, { id: "incidentDate", type: "date", value: newIncident.incident_date, onChange: (e) => setNewIncident({
                                                                                ...newIncident,
                                                                                incident_date: e.target.value,
                                                                            }) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "incidentTime", children: "Incident Time" }), _jsx(Input, { id: "incidentTime", type: "time", value: newIncident.incident_time, onChange: (e) => setNewIncident({
                                                                                ...newIncident,
                                                                                incident_time: e.target.value,
                                                                            }) })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "location", children: "Location" }), _jsx(Input, { id: "location", value: newIncident.location, onChange: (e) => setNewIncident({
                                                                        ...newIncident,
                                                                        location: e.target.value,
                                                                    }), placeholder: "Enter incident location" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "description", children: "Description" }), _jsx(Textarea, { id: "description", value: newIncident.description, onChange: (e) => setNewIncident({
                                                                        ...newIncident,
                                                                        description: e.target.value,
                                                                    }), placeholder: "Describe what happened in detail", rows: 3 })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "immediateActions", children: "Immediate Actions Taken" }), _jsx(Textarea, { id: "immediateActions", value: newIncident.immediate_actions, onChange: (e) => setNewIncident({
                                                                        ...newIncident,
                                                                        immediate_actions: e.target.value,
                                                                    }), placeholder: "Describe immediate actions taken", rows: 2 })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setShowCreateDialog(false), children: "Cancel" }), _jsx(Button, { onClick: handleCreateIncident, disabled: loading || (!isOnline && !newIncident.description), children: loading ? "Reporting..." : "Report Incident" })] })] })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs(Card, { className: "border-red-200 bg-red-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-red-800", children: "Critical Incidents" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-red-900", children: analytics?.critical_incidents || 0 }), _jsx("p", { className: "text-xs text-red-600", children: "Require immediate attention" })] })] }), _jsxs(Card, { className: "border-orange-200 bg-orange-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-orange-800", children: "Overdue Actions" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-orange-900", children: overdueActions.length }), _jsx("p", { className: "text-xs text-orange-600", children: "Corrective actions overdue" })] })] }), _jsxs(Card, { className: "border-blue-200 bg-blue-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-blue-800", children: "DoH Notifications" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-blue-900", children: notificationRequired.length }), _jsx("p", { className: "text-xs text-blue-600", children: "Pending notifications" })] })] }), showADHICSCompliance && adhicsCompliance && (_jsxs(Card, { className: "border-purple-200 bg-purple-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-purple-800", children: "ADHICS Compliance" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold text-purple-900", children: [Math.round(adhicsCompliance.overall_adhics_score), "%"] }), _jsxs("p", { className: "text-xs text-purple-600", children: [adhicsCompliance.compliance_level?.toUpperCase(), " Level"] })] })] }))] }), _jsxs(Tabs, { defaultValue: "incidents", className: "space-y-6", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-6", children: [_jsx(TabsTrigger, { value: "incidents", children: "Incidents" }), _jsx(TabsTrigger, { value: "complaints", children: "Complaints" }), _jsx(TabsTrigger, { value: "clinical", children: "Clinical Incidents" }), _jsx(TabsTrigger, { value: "actions", children: "Corrective Actions" }), _jsx(TabsTrigger, { value: "analytics", children: "Analytics" }), _jsx(TabsTrigger, { value: "predictive", children: "Predictive" })] }), _jsxs(TabsContent, { value: "incidents", className: "space-y-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Search Incidents" }) }), _jsx(CardContent, { children: _jsx(Input, { type: "text", placeholder: "Search by incident ID, description, location, or reporter...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "w-full" }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Incident Reports" }), _jsx(CardDescription, { children: searchTerm
                                                        ? `${filteredIncidents.length} of ${incidents.length} incidents found`
                                                        : `${incidents.length} incidents found` })] }), _jsx(CardContent, { children: _jsx("div", { className: "overflow-x-auto", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Incident ID" }), _jsx(TableHead, { children: "Type" }), _jsx(TableHead, { children: "Severity" }), _jsx(TableHead, { children: "Date" }), _jsx(TableHead, { children: "Location" }), _jsx(TableHead, { children: "Reported By" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { children: "Actions" })] }) }), _jsx(TableBody, { children: loading ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 8, className: "text-center py-4", children: "Loading..." }) })) : filteredIncidents.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 8, className: "text-center py-4 text-gray-500", children: searchTerm
                                                                        ? `No incidents found matching "${searchTerm}"`
                                                                        : "No incidents found" }) })) : (filteredIncidents.map((incident) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: incident.incident_id }), _jsx(TableCell, { children: incident.incident_type.replace("_", " ") }), _jsx(TableCell, { children: getSeverityBadge(incident.severity) }), _jsx(TableCell, { children: incident.incident_date }), _jsx(TableCell, { children: incident.location }), _jsx(TableCell, { children: incident.reported_by }), _jsx(TableCell, { children: getStatusBadge(incident.status) }), _jsx(TableCell, { children: _jsxs("div", { className: "flex gap-1", children: [_jsx(Button, { size: "sm", variant: "outline", children: _jsx(Eye, { className: "w-3 h-3" }) }), _jsx(Button, { size: "sm", variant: "outline", children: _jsx(Edit, { className: "w-3 h-3" }) }), incident.approval.status === "pending" &&
                                                                                    userRole === "supervisor" && (_jsx(Button, { size: "sm", onClick: () => handleApproveIncident(incident._id.toString()), disabled: loading, children: "Approve" })), _jsx(Button, { size: "sm", variant: "outline", onClick: () => {
                                                                                        setSelectedIncident(incident);
                                                                                        setShowActionDialog(true);
                                                                                    }, children: "Add Action" })] }) })] }, incident._id?.toString())))) })] }) }) })] })] }), _jsx(TabsContent, { value: "clinical", className: "space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Clinical Incident Management" }), _jsx(CardDescription, { children: "Real-world clinical incident processing" })] }), _jsx(CardContent, { children: processedIncidents.length > 0 ? (_jsx("div", { className: "space-y-4", children: processedIncidents.map((processed, index) => (_jsxs("div", { className: "border rounded-lg p-4 bg-gray-50", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { children: [_jsxs("h3", { className: "text-lg font-semibold", children: ["Incident ", processed.incidentId] }), _jsx(Badge, { variant: "outline", children: processed.processingComplete
                                                                            ? "Complete"
                                                                            : "In Progress" })] }), _jsx("div", { className: "flex gap-2", children: _jsxs(Badge, { variant: processed.complianceStatus?.dohCompliant
                                                                        ? "default"
                                                                        : "destructive", children: ["DOH:", " ", processed.complianceStatus?.dohCompliant
                                                                            ? "Compliant"
                                                                            : "Non-Compliant"] }) })] }), _jsxs("div", { className: "text-sm text-gray-600", children: [_jsxs("p", { children: [_jsx("strong", { children: "Patient:" }), " ", processed.incidentData.patientDetails.patientName] }), _jsxs("p", { children: [_jsx("strong", { children: "Category:" }), " ", processed.incidentData.incidentClassification
                                                                        .category.primaryCategory] }), _jsxs("p", { children: [_jsx("strong", { children: "Summary:" }), " ", processed.incidentData.incidentAnalysis.summary] })] })] }, index))) })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(FileText, { className: "w-12 h-12 mx-auto text-gray-400 mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No Clinical Incidents Processed" }), _jsx("p", { className: "text-gray-600 mb-4", children: "Clinical incidents will be processed and displayed here." }), _jsx(Button, { onClick: () => handleProcessClinicalIncident(sampleNGTIncident), children: "Process Sample NGT Incident" })] })) })] }) }), _jsx(TabsContent, { value: "actions", className: "space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Corrective Actions" }), _jsx(CardDescription, { children: "Track and manage corrective actions for incidents" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [overdueActions.length > 0 && (_jsxs(Alert, { children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "Overdue Actions" }), _jsxs(AlertDescription, { children: [overdueActions.length, " corrective actions are overdue and require immediate attention."] })] })), _jsx("div", { className: "grid gap-4", children: overdueActions.map((action, index) => (_jsx("div", { className: "border rounded-lg p-4 bg-red-50 border-red-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: action.description }), _jsxs("div", { className: "text-sm text-gray-600", children: ["Incident: ", action.incident_id, " | Assigned to:", " ", action.assigned_to] }), _jsxs("div", { className: "text-sm text-red-600", children: ["Due: ", action.due_date, " | Status: ", action.status] })] }), _jsx(Button, { size: "sm", variant: "destructive", children: "Update Status" })] }) }, index))) })] }) })] }) }), _jsx(TabsContent, { value: "complaints", className: "space-y-6", children: _jsx(PatientComplaintManagement, {}) }), _jsx(TabsContent, { value: "analytics", className: "space-y-6", children: analytics && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Total Incidents" }), _jsx(AlertTriangle, { className: "h-4 w-4 text-muted-foreground" })] }), _jsx(CardContent, { children: _jsx("div", { className: "text-2xl font-bold", children: analytics.total_incidents }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Open Incidents" }), _jsx(Clock, { className: "h-4 w-4 text-muted-foreground" })] }), _jsx(CardContent, { children: _jsx("div", { className: "text-2xl font-bold", children: analytics.open_incidents }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Overdue Actions" }), _jsx(AlertCircle, { className: "h-4 w-4 text-muted-foreground" })] }), _jsx(CardContent, { children: _jsx("div", { className: "text-2xl font-bold", children: analytics.overdue_actions }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Regulatory Notifications" }), _jsx(FileText, { className: "h-4 w-4 text-muted-foreground" })] }), _jsx(CardContent, { children: _jsx("div", { className: "text-2xl font-bold", children: analytics.regulatory_notifications }) })] })] })) }), _jsx(TabsContent, { value: "predictive", className: "space-y-6", children: _jsx(PredictiveAnalyticsDashboard, {}) })] }), _jsx(Dialog, { open: showActionDialog, onOpenChange: setShowActionDialog, children: _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Add Corrective Action" }), _jsxs(DialogDescription, { children: ["Add a corrective action for incident", " ", selectedIncident?.incident_id] })] }), _jsxs("div", { className: "grid gap-4 py-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "actionDescription", children: "Description" }), _jsx(Textarea, { id: "actionDescription", value: newAction.description, onChange: (e) => setNewAction({ ...newAction, description: e.target.value }), placeholder: "Describe the corrective action" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "assignedTo", children: "Assigned To" }), _jsx(Input, { id: "assignedTo", value: newAction.assigned_to, onChange: (e) => setNewAction({ ...newAction, assigned_to: e.target.value }), placeholder: "Enter assignee name" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "dueDate", children: "Due Date" }), _jsx(Input, { id: "dueDate", type: "date", value: newAction.due_date, onChange: (e) => setNewAction({ ...newAction, due_date: e.target.value }) })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setShowActionDialog(false), children: "Cancel" }), _jsx(Button, { onClick: handleAddCorrectiveAction, disabled: loading, children: "Add Action" })] })] }) }), _jsx(Dialog, { open: showSampleIncident, onOpenChange: setShowSampleIncident, children: _jsxs(DialogContent, { className: "max-w-4xl max-h-[80vh] overflow-y-auto", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Sample NGT Incident Case (IR2863)" }), _jsx(DialogDescription, { children: "Real-world clinical incident based on actual patient case" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium text-gray-600", children: "Patient:" }), _jsx("div", { children: sampleNGTIncident.patientDetails?.patientName ||
                                                            "Ahmed Al Yaqoubi" })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium text-gray-600", children: "MRN:" }), _jsx("div", { children: sampleNGTIncident.patientDetails?.mrn || "MRN123456" })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium text-gray-600", children: "Age/Gender:" }), _jsx("div", { children: "76 years, Male" })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium text-gray-600", children: "Reference:" }), _jsx("div", { children: sampleNGTIncident.referenceNo })] })] }), _jsxs("div", { className: "p-4 bg-gray-50 rounded", children: [_jsx("h4", { className: "font-medium mb-2", children: "Incident Summary" }), _jsx("p", { className: "text-sm text-gray-700", children: "NGT blockage incident requiring immediate intervention and replacement." })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-2", children: "Key Actions Taken" }), _jsxs("ul", { className: "text-sm space-y-1", children: [_jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "text-green-600 mr-2", children: "\u2713" }), "NGT replacement performed"] }), _jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "text-green-600 mr-2", children: "\u2713" }), "Patient monitoring increased"] }), _jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "text-green-600 mr-2", children: "\u2713" }), "Documentation completed"] })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-2", children: "Outcome" }), _jsx("p", { className: "text-sm text-gray-700", children: "Patient stable, NGT functioning properly, no complications observed." })] })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { onClick: () => setShowSampleIncident(false), children: "Close" }), _jsx(Button, { onClick: () => handleProcessClinicalIncident(sampleNGTIncident), children: "Process This Incident" })] })] }) })] }) }));
}
// Patient Complaint Management Component
function PatientComplaintManagement() {
    const [complaints, setComplaints] = useState([]);
    const [complaintAnalytics, setComplaintAnalytics] = useState(null);
    const [showCreateComplaint, setShowCreateComplaint] = useState(false);
    const [newComplaint, setNewComplaint] = useState({
        complaint_type: "service_quality",
        severity: "medium",
        priority: "routine",
        patient_name: "",
        patient_contact: {
            phone: "",
            email: "",
            preferred_method: "email",
        },
        description: "",
        specific_concerns: [],
        affected_services: [],
    });
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        loadComplaintData();
    }, []);
    const loadComplaintData = async () => {
        try {
            setLoading(true);
            // Mock data - in production, this would call the actual API
            const mockComplaints = [
                {
                    complaint_id: "COMP-2025-001",
                    complaint_type: "service_quality",
                    severity: "medium",
                    status: "investigating",
                    patient_name: "Ahmed Al Mansouri",
                    complaint_date: "2025-01-15",
                    description: "Delayed appointment scheduling",
                    sla_tracking: { acknowledgment_met: true, resolution_met: false },
                },
                {
                    complaint_id: "COMP-2025-002",
                    complaint_type: "staff_behavior",
                    severity: "high",
                    status: "resolved",
                    patient_name: "Fatima Al Zahra",
                    complaint_date: "2025-01-14",
                    description: "Unprofessional behavior from nursing staff",
                    sla_tracking: { acknowledgment_met: true, resolution_met: true },
                    patient_satisfaction_survey: { satisfaction_score: 4 },
                },
            ];
            const mockAnalytics = {
                total_complaints: 2,
                complaints_by_type: { service_quality: 1, staff_behavior: 1 },
                complaints_by_severity: { medium: 1, high: 1 },
                complaints_by_status: { investigating: 1, resolved: 1 },
                average_resolution_time: 24,
                sla_compliance_rate: 75,
                patient_satisfaction_average: 4.0,
                trending_issues: ["service_quality", "staff_behavior"],
            };
            setComplaints(mockComplaints);
            setComplaintAnalytics(mockAnalytics);
        }
        catch (error) {
            console.error("Error loading complaint data:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleCreateComplaint = async () => {
        try {
            setLoading(true);
            const complaintId = `COMP-${new Date().getFullYear()}-${String(complaints.length + 1).padStart(3, "0")}`;
            const complaintData = {
                ...newComplaint,
                complaint_id: complaintId,
                patient_id: `PAT-${Date.now()}`,
                complaint_date: new Date().toISOString().split("T")[0],
                complaint_time: new Date().toTimeString().split(" ")[0].substring(0, 5),
                received_by: "System",
                received_date: new Date().toISOString().split("T")[0],
                status: "received",
                initial_response: {
                    acknowledgment_sent: true,
                    acknowledgment_date: new Date().toISOString().split("T")[0],
                    acknowledgment_method: newComplaint.patient_contact.preferred_method,
                    expected_resolution_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                        .toISOString()
                        .split("T")[0],
                },
                sla_tracking: {
                    acknowledgment_sla: 2,
                    resolution_sla: 48,
                    acknowledgment_met: true,
                    resolution_met: false,
                },
            };
            setComplaints([...complaints, complaintData]);
            setShowCreateComplaint(false);
            setNewComplaint({
                complaint_type: "service_quality",
                severity: "medium",
                priority: "routine",
                patient_name: "",
                patient_contact: {
                    phone: "",
                    email: "",
                    preferred_method: "email",
                },
                description: "",
                specific_concerns: [],
                affected_services: [],
            });
            toast({
                title: "Complaint Created",
                description: `Complaint ${complaintId} has been created and acknowledgment sent to patient`,
            });
        }
        catch (error) {
            console.error("Error creating complaint:", error);
            toast({
                title: "Error",
                description: "Failed to create complaint",
                variant: "destructive",
            });
        }
        finally {
            setLoading(false);
        }
    };
    const getSeverityBadge = (severity) => {
        const variants = {
            low: "secondary",
            medium: "default",
            high: "destructive",
            critical: "destructive",
        };
        return (_jsx(Badge, { variant: variants[severity] || "secondary", children: severity.toUpperCase() }));
    };
    const getStatusBadge = (status) => {
        const variants = {
            received: "outline",
            acknowledged: "secondary",
            investigating: "default",
            resolved: "default",
            closed: "secondary",
        };
        return (_jsx(Badge, { variant: variants[status] || "outline", children: status.replace("_", " ").toUpperCase() }));
    };
    return (_jsxs("div", { className: "space-y-6", children: [complaintAnalytics && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs(Card, { className: "border-blue-200 bg-blue-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-blue-800", children: "Total Complaints" }) }), _jsx(CardContent, { children: _jsx("div", { className: "text-2xl font-bold text-blue-900", children: complaintAnalytics.total_complaints }) })] }), _jsxs(Card, { className: "border-green-200 bg-green-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-green-800", children: "SLA Compliance" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "text-2xl font-bold text-green-900", children: [complaintAnalytics.sla_compliance_rate, "%"] }) })] }), _jsxs(Card, { className: "border-purple-200 bg-purple-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-purple-800", children: "Avg Resolution Time" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "text-2xl font-bold text-purple-900", children: [complaintAnalytics.average_resolution_time, "h"] }) })] }), _jsxs(Card, { className: "border-yellow-200 bg-yellow-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-yellow-800", children: "Patient Satisfaction" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "text-2xl font-bold text-yellow-900", children: [complaintAnalytics.patient_satisfaction_average, "/5"] }) })] })] })), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-xl font-semibold", children: "Patient Complaints" }), _jsxs(Dialog, { open: showCreateComplaint, onOpenChange: setShowCreateComplaint, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "New Complaint"] }) }), _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Create New Patient Complaint" }), _jsx(DialogDescription, { children: "Register a new patient complaint for investigation and resolution" })] }), _jsxs("div", { className: "grid gap-4 py-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "complaintType", children: "Complaint Type" }), _jsxs(Select, { value: newComplaint.complaint_type, onValueChange: (value) => setNewComplaint({
                                                                    ...newComplaint,
                                                                    complaint_type: value,
                                                                }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "service_quality", children: "Service Quality" }), _jsx(SelectItem, { value: "staff_behavior", children: "Staff Behavior" }), _jsx(SelectItem, { value: "billing_issues", children: "Billing Issues" }), _jsx(SelectItem, { value: "appointment_scheduling", children: "Appointment Scheduling" }), _jsx(SelectItem, { value: "communication", children: "Communication" }), _jsx(SelectItem, { value: "facility_issues", children: "Facility Issues" }), _jsx(SelectItem, { value: "treatment_concerns", children: "Treatment Concerns" }), _jsx(SelectItem, { value: "privacy_breach", children: "Privacy Breach" }), _jsx(SelectItem, { value: "accessibility", children: "Accessibility" }), _jsx(SelectItem, { value: "other", children: "Other" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "severity", children: "Severity" }), _jsxs(Select, { value: newComplaint.severity, onValueChange: (value) => setNewComplaint({ ...newComplaint, severity: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "low", children: "Low" }), _jsx(SelectItem, { value: "medium", children: "Medium" }), _jsx(SelectItem, { value: "high", children: "High" }), _jsx(SelectItem, { value: "critical", children: "Critical" })] })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "patientName", children: "Patient Name" }), _jsx(Input, { id: "patientName", value: newComplaint.patient_name, onChange: (e) => setNewComplaint({
                                                            ...newComplaint,
                                                            patient_name: e.target.value,
                                                        }), placeholder: "Enter patient name" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "patientPhone", children: "Patient Phone" }), _jsx(Input, { id: "patientPhone", value: newComplaint.patient_contact.phone, onChange: (e) => setNewComplaint({
                                                                    ...newComplaint,
                                                                    patient_contact: {
                                                                        ...newComplaint.patient_contact,
                                                                        phone: e.target.value,
                                                                    },
                                                                }), placeholder: "Enter phone number" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "patientEmail", children: "Patient Email" }), _jsx(Input, { id: "patientEmail", type: "email", value: newComplaint.patient_contact.email, onChange: (e) => setNewComplaint({
                                                                    ...newComplaint,
                                                                    patient_contact: {
                                                                        ...newComplaint.patient_contact,
                                                                        email: e.target.value,
                                                                    },
                                                                }), placeholder: "Enter email address" })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "description", children: "Complaint Description" }), _jsx(Textarea, { id: "description", value: newComplaint.description, onChange: (e) => setNewComplaint({
                                                            ...newComplaint,
                                                            description: e.target.value,
                                                        }), placeholder: "Describe the complaint in detail", rows: 4 })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setShowCreateComplaint(false), children: "Cancel" }), _jsx(Button, { onClick: handleCreateComplaint, disabled: loading, children: loading ? "Creating..." : "Create Complaint" })] })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Patient Complaints" }), _jsxs(CardDescription, { children: [complaints.length, " complaints found"] })] }), _jsx(CardContent, { children: _jsx("div", { className: "overflow-x-auto", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Complaint ID" }), _jsx(TableHead, { children: "Type" }), _jsx(TableHead, { children: "Severity" }), _jsx(TableHead, { children: "Patient" }), _jsx(TableHead, { children: "Date" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { children: "SLA" }), _jsx(TableHead, { children: "Actions" })] }) }), _jsx(TableBody, { children: loading ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 8, className: "text-center py-4", children: "Loading..." }) })) : complaints.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 8, className: "text-center py-4 text-gray-500", children: "No complaints found" }) })) : (complaints.map((complaint) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: complaint.complaint_id }), _jsx(TableCell, { children: complaint.complaint_type.replace("_", " ") }), _jsx(TableCell, { children: getSeverityBadge(complaint.severity) }), _jsx(TableCell, { children: complaint.patient_name }), _jsx(TableCell, { children: complaint.complaint_date }), _jsx(TableCell, { children: getStatusBadge(complaint.status) }), _jsx(TableCell, { children: _jsxs("div", { className: "flex gap-1", children: [_jsx(Badge, { variant: complaint.sla_tracking?.acknowledgment_met
                                                                    ? "default"
                                                                    : "destructive", className: "text-xs", children: "ACK" }), _jsx(Badge, { variant: complaint.sla_tracking?.resolution_met
                                                                    ? "default"
                                                                    : "destructive", className: "text-xs", children: "RES" })] }) }), _jsx(TableCell, { children: _jsxs("div", { className: "flex gap-1", children: [_jsx(Button, { size: "sm", variant: "outline", children: _jsx(Eye, { className: "w-3 h-3" }) }), _jsx(Button, { size: "sm", variant: "outline", children: _jsx(Edit, { className: "w-3 h-3" }) })] }) })] }, complaint.complaint_id)))) })] }) }) })] })] }));
}
// Predictive Analytics Dashboard Component
function PredictiveAnalyticsDashboard() {
    const [predictiveData, setPredictiveData] = useState(null);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        loadPredictiveData();
    }, []);
    const loadPredictiveData = async () => {
        try {
            setLoading(true);
            // Mock predictive analytics data
            const mockData = {
                risk_predictions: {
                    high_risk_areas: [
                        {
                            area: "Emergency Department",
                            risk_score: 0.85,
                            trend: "increasing",
                        },
                        { area: "ICU", risk_score: 0.72, trend: "stable" },
                        { area: "Surgical Ward", risk_score: 0.68, trend: "decreasing" },
                    ],
                    incident_probability: {
                        next_7_days: 0.23,
                        next_30_days: 0.67,
                        seasonal_patterns: {
                            winter: 0.8,
                            spring: 0.6,
                            summer: 0.5,
                            autumn: 0.7,
                        },
                    },
                },
                trend_analysis: {
                    incident_trends: {
                        medication_errors: { trend: "increasing", change: "+15%" },
                        patient_falls: { trend: "decreasing", change: "-8%" },
                        equipment_failures: { trend: "stable", change: "+2%" },
                    },
                    complaint_trends: {
                        service_quality: { trend: "increasing", change: "+12%" },
                        staff_behavior: { trend: "decreasing", change: "-5%" },
                        communication: { trend: "stable", change: "+1%" },
                    },
                },
                prevention_recommendations: [
                    {
                        category: "Staff Training",
                        priority: "high",
                        recommendation: "Implement monthly medication safety training",
                        expected_impact: "25% reduction in medication errors",
                    },
                    {
                        category: "Process Improvement",
                        priority: "medium",
                        recommendation: "Standardize patient handoff procedures",
                        expected_impact: "15% improvement in communication",
                    },
                    {
                        category: "Technology",
                        priority: "high",
                        recommendation: "Deploy AI-powered fall risk assessment",
                        expected_impact: "30% reduction in patient falls",
                    },
                ],
                similar_incidents: [
                    {
                        incident_id: "INC-2024-089",
                        similarity_score: 0.92,
                        outcome: "resolved",
                        resolution_time: 48,
                        lessons_learned: "Early intervention prevented escalation",
                    },
                    {
                        incident_id: "INC-2024-067",
                        similarity_score: 0.87,
                        outcome: "resolved",
                        resolution_time: 72,
                        lessons_learned: "Root cause analysis revealed system issue",
                    },
                ],
            };
            setPredictiveData(mockData);
        }
        catch (error) {
            console.error("Error loading predictive data:", error);
        }
        finally {
            setLoading(false);
        }
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "Loading predictive analytics..." })] }) }));
    }
    if (!predictiveData) {
        return (_jsx("div", { className: "text-center py-8", children: _jsx("p", { className: "text-gray-600", children: "No predictive data available" }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(TrendingUp, { className: "w-5 h-5 mr-2 text-red-600" }), "Risk Predictions"] }), _jsx(CardDescription, { children: "AI-powered risk assessment and predictions" })] }), _jsx(CardContent, { children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: predictiveData.risk_predictions.high_risk_areas.map((area, index) => (_jsxs("div", { className: "p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h4", { className: "font-medium", children: area.area }), _jsxs(Badge, { variant: area.risk_score > 0.8
                                                    ? "destructive"
                                                    : area.risk_score > 0.6
                                                        ? "default"
                                                        : "secondary", children: [Math.round(area.risk_score * 100), "%"] })] }), _jsxs("div", { className: "text-sm text-gray-600", children: ["Trend:", " ", _jsx("span", { className: area.trend === "increasing"
                                                    ? "text-red-600"
                                                    : area.trend === "decreasing"
                                                        ? "text-green-600"
                                                        : "text-gray-600", children: area.trend })] })] }, index))) }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Incident Trends" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: Object.entries(predictiveData.trend_analysis.incident_trends).map(([key, trend]) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded", children: [_jsx("span", { className: "font-medium", children: key.replace("_", " ") }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: trend.trend === "increasing"
                                                            ? "text-red-600"
                                                            : trend.trend === "decreasing"
                                                                ? "text-green-600"
                                                                : "text-gray-600", children: trend.change }), _jsx(Badge, { variant: "outline", children: trend.trend })] })] }, key))) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Complaint Trends" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: Object.entries(predictiveData.trend_analysis.complaint_trends).map(([key, trend]) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded", children: [_jsx("span", { className: "font-medium", children: key.replace("_", " ") }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: trend.trend === "increasing"
                                                            ? "text-red-600"
                                                            : trend.trend === "decreasing"
                                                                ? "text-green-600"
                                                                : "text-gray-600", children: trend.change }), _jsx(Badge, { variant: "outline", children: trend.trend })] })] }, key))) }) })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Target, { className: "w-5 h-5 mr-2 text-green-600" }), "Prevention Recommendations"] }), _jsx(CardDescription, { children: "AI-generated recommendations to prevent future incidents" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: predictiveData.prevention_recommendations.map((rec, index) => (_jsxs("div", { className: "p-4 border rounded-lg", children: [_jsx("div", { className: "flex items-center justify-between mb-2", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("h4", { className: "font-medium", children: rec.category }), _jsxs(Badge, { variant: rec.priority === "high" ? "destructive" : "default", children: [rec.priority, " priority"] })] }) }), _jsx("p", { className: "text-sm text-gray-700 mb-2", children: rec.recommendation }), _jsxs("p", { className: "text-sm text-green-600 font-medium", children: ["Expected Impact: ", rec.expected_impact] })] }, index))) }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Similar Historical Incidents" }), _jsx(CardDescription, { children: "Learn from similar past incidents and their resolutions" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: predictiveData.similar_incidents.map((incident, index) => (_jsxs("div", { className: "p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "font-medium", children: incident.incident_id }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Badge, { variant: "outline", children: [Math.round(incident.similarity_score * 100), "% similar"] }), _jsx(Badge, { variant: "default", children: incident.outcome })] })] }), _jsxs("div", { className: "text-sm text-gray-600 mb-2", children: ["Resolution Time: ", incident.resolution_time, " hours"] }), _jsxs("div", { className: "text-sm text-blue-600", children: ["Lessons Learned: ", incident.lessons_learned] })] }, index))) }) })] })] }));
}
