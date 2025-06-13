import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, } from "@/components/ui/dialog";
import { ArrowLeft, Calendar, FileText, AlertCircle, CheckCircle, Users, Home, Hospital, Activity, Target, TrendingUp, Save, } from "lucide-react";
const PatientLifecycleManager = ({ patientId, patientName, onBack, }) => {
    const [currentStatus, setCurrentStatus] = useState("active_care");
    const [isDischargeDialogOpen, setIsDischargeDialogOpen] = useState(false);
    const [dischargeReadiness, setDischargeReadiness] = useState({
        medicalStability: false,
        functionalStatus: "stable",
        caregiverSupport: false,
        homeEnvironment: false,
        equipmentAvailable: false,
        followUpArranged: false,
    });
    // Mock lifecycle events
    const lifecycleEvents = [
        {
            id: "1",
            type: "referral",
            date: "2024-01-15",
            description: "Referral received from Al Ain Hospital for post-surgical care",
            performedBy: "Dr. Ahmed Al Mansouri",
            status: "completed",
        },
        {
            id: "2",
            type: "assessment",
            date: "2024-01-18",
            description: "Initial assessment completed - 9-domain DOH assessment",
            performedBy: "Nurse Sarah Johnson",
            status: "completed",
        },
        {
            id: "3",
            type: "admission",
            date: "2024-01-20",
            description: "Patient admitted to homecare services",
            performedBy: "Care Coordinator",
            status: "completed",
        },
        {
            id: "4",
            type: "care_plan",
            date: "2024-01-22",
            description: "Care plan developed and approved by physician",
            performedBy: "Dr. Khalid Al Mazrouei",
            status: "completed",
        },
        {
            id: "5",
            type: "service_start",
            date: "2024-01-25",
            description: "Homecare services initiated",
            performedBy: "Primary Nurse Team",
            status: "completed",
        },
        {
            id: "6",
            type: "discharge_planning",
            date: "2024-02-15",
            description: "Discharge planning initiated",
            performedBy: "Discharge Coordinator",
            status: "in_progress",
        },
    ];
    const getStatusIcon = (type) => {
        switch (type) {
            case "referral":
                return _jsx(FileText, { className: "h-4 w-4" });
            case "assessment":
                return _jsx(Activity, { className: "h-4 w-4" });
            case "admission":
                return _jsx(Home, { className: "h-4 w-4" });
            case "care_plan":
                return _jsx(Target, { className: "h-4 w-4" });
            case "service_start":
                return _jsx(CheckCircle, { className: "h-4 w-4" });
            case "discharge_planning":
                return _jsx(Calendar, { className: "h-4 w-4" });
            case "discharge":
                return _jsx(Hospital, { className: "h-4 w-4" });
            default:
                return _jsx(Activity, { className: "h-4 w-4" });
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case "completed":
                return "text-green-600";
            case "in_progress":
                return "text-blue-600";
            case "pending":
                return "text-yellow-600";
            default:
                return "text-gray-600";
        }
    };
    const calculateDischargeReadiness = () => {
        const criteria = Object.values(dischargeReadiness);
        const completedCriteria = criteria.filter((criterion) => typeof criterion === "boolean" ? criterion : true).length;
        return Math.round((completedCriteria / criteria.length) * 100);
    };
    const handleStatusChange = (newStatus) => {
        setCurrentStatus(newStatus);
        // In a real implementation, this would update the patient's status in the database
    };
    const handleDischargeAssessment = () => {
        // In a real implementation, this would save the discharge assessment
        setIsDischargeDialogOpen(false);
        alert("Discharge assessment saved successfully");
    };
    return (_jsxs("div", { className: "bg-white p-6 rounded-lg shadow-sm w-full", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: onBack, children: [_jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }), "Back"] }), _jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold", children: "Patient Lifecycle Management" }), _jsxs("p", { className: "text-muted-foreground", children: [patientName, " - ID: ", patientId] })] })] }), _jsx("div", { className: "flex items-center gap-2", children: _jsxs(Badge, { variant: "outline", className: "text-sm", children: ["Current Status:", " ", currentStatus.replace("_", " ").charAt(0).toUpperCase() +
                                    currentStatus.replace("_", " ").slice(1)] }) })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsx("div", { className: "lg:col-span-2", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Activity, { className: "h-5 w-5" }), "Patient Journey Timeline"] }), _jsx(CardDescription, { children: "Complete lifecycle from referral to discharge" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-6", children: lifecycleEvents.map((event, index) => (_jsxs("div", { className: "relative", children: [index < lifecycleEvents.length - 1 && (_jsx("div", { className: "absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200" })), _jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: `p-2 rounded-full bg-gray-100 ${getStatusColor(event.status)}`, children: getStatusIcon(event.type) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h4", { className: "font-medium text-gray-900", children: event.type
                                                                                .replace("_", " ")
                                                                                .charAt(0)
                                                                                .toUpperCase() +
                                                                                event.type.replace("_", " ").slice(1) }), _jsx(Badge, { variant: "outline", className: `text-xs ${getStatusColor(event.status)}`, children: event.status.replace("_", " ") })] }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: event.description }), _jsxs("div", { className: "flex items-center gap-4 mt-2 text-xs text-gray-500", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Calendar, { className: "h-3 w-3" }), new Date(event.date).toLocaleDateString()] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Users, { className: "h-3 w-3" }), event.performedBy] })] })] })] })] }, event.id))) }) }), _jsx(CardFooter, { children: _jsx(Button, { variant: "outline", className: "w-full", children: "Add Lifecycle Event" }) })] }) }), _jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-base", children: "Status Management" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "lifecycle-status", children: "Lifecycle Status" }), _jsxs(Select, { value: currentStatus, onValueChange: handleStatusChange, children: [_jsx(SelectTrigger, { id: "lifecycle-status", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "referral", children: "Referral" }), _jsx(SelectItem, { value: "assessment", children: "Assessment" }), _jsx(SelectItem, { value: "admission", children: "Admission" }), _jsx(SelectItem, { value: "active_care", children: "Active Care" }), _jsx(SelectItem, { value: "discharge_planning", children: "Discharge Planning" }), _jsx(SelectItem, { value: "discharged", children: "Discharged" }), _jsx(SelectItem, { value: "readmission", children: "Readmission" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Quick Actions" }), _jsxs("div", { className: "grid grid-cols-1 gap-2", children: [_jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(FileText, { className: "h-4 w-4 mr-2" }), "Update Care Plan"] }), _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Activity, { className: "h-4 w-4 mr-2" }), "Schedule Assessment"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => setIsDischargeDialogOpen(true), children: [_jsx(Home, { className: "h-4 w-4 mr-2" }), "Discharge Planning"] })] })] })] })] }), currentStatus === "discharge_planning" && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [_jsx(TrendingUp, { className: "h-4 w-4" }), "Discharge Readiness"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Overall Readiness" }), _jsxs("span", { className: "text-sm font-medium", children: [calculateDischargeReadiness(), "%"] })] }), _jsx(Progress, { value: calculateDischargeReadiness(), className: "h-2" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm", children: "Medical Stability" }), dischargeReadiness.medicalStability ? (_jsx(CheckCircle, { className: "h-4 w-4 text-green-500" })) : (_jsx(AlertCircle, { className: "h-4 w-4 text-amber-500" }))] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm", children: "Caregiver Support" }), dischargeReadiness.caregiverSupport ? (_jsx(CheckCircle, { className: "h-4 w-4 text-green-500" })) : (_jsx(AlertCircle, { className: "h-4 w-4 text-amber-500" }))] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm", children: "Home Environment" }), dischargeReadiness.homeEnvironment ? (_jsx(CheckCircle, { className: "h-4 w-4 text-green-500" })) : (_jsx(AlertCircle, { className: "h-4 w-4 text-amber-500" }))] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm", children: "Equipment Available" }), dischargeReadiness.equipmentAvailable ? (_jsx(CheckCircle, { className: "h-4 w-4 text-green-500" })) : (_jsx(AlertCircle, { className: "h-4 w-4 text-amber-500" }))] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm", children: "Follow-up Arranged" }), dischargeReadiness.followUpArranged ? (_jsx(CheckCircle, { className: "h-4 w-4 text-green-500" })) : (_jsx(AlertCircle, { className: "h-4 w-4 text-amber-500" }))] })] })] }) })] })), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-base", children: "Key Metrics" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Days in Care" }), _jsx("span", { className: "font-medium", children: "28" })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Total Visits" }), _jsx("span", { className: "font-medium", children: "15" })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Care Team Size" }), _jsx("span", { className: "font-medium", children: "4" })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Goal Achievement" }), _jsx("span", { className: "font-medium", children: "75%" })] })] }) })] })] })] }), _jsx(Dialog, { open: isDischargeDialogOpen, onOpenChange: setIsDischargeDialogOpen, children: _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Discharge Planning Assessment" }) }), _jsxs("div", { className: "space-y-6 py-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium", children: "Discharge Readiness Criteria" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "medical-stability", checked: dischargeReadiness.medicalStability, onCheckedChange: (checked) => setDischargeReadiness((prev) => ({
                                                                ...prev,
                                                                medicalStability: checked === true,
                                                            })) }), _jsx(Label, { htmlFor: "medical-stability", children: "Medical Stability Achieved" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "functional-status", children: "Functional Status" }), _jsxs(Select, { value: dischargeReadiness.functionalStatus, onValueChange: (value) => setDischargeReadiness((prev) => ({
                                                                ...prev,
                                                                functionalStatus: value,
                                                            })), children: [_jsx(SelectTrigger, { id: "functional-status", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "improved", children: "Improved" }), _jsx(SelectItem, { value: "stable", children: "Stable" }), _jsx(SelectItem, { value: "declined", children: "Declined" })] })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "caregiver-support", checked: dischargeReadiness.caregiverSupport, onCheckedChange: (checked) => setDischargeReadiness((prev) => ({
                                                                ...prev,
                                                                caregiverSupport: checked === true,
                                                            })) }), _jsx(Label, { htmlFor: "caregiver-support", children: "Adequate Caregiver Support" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "home-environment", checked: dischargeReadiness.homeEnvironment, onCheckedChange: (checked) => setDischargeReadiness((prev) => ({
                                                                ...prev,
                                                                homeEnvironment: checked === true,
                                                            })) }), _jsx(Label, { htmlFor: "home-environment", children: "Safe Home Environment" })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-medium", children: "Support Systems" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "equipment-available", checked: dischargeReadiness.equipmentAvailable, onCheckedChange: (checked) => setDischargeReadiness((prev) => ({
                                                                ...prev,
                                                                equipmentAvailable: checked === true,
                                                            })) }), _jsx(Label, { htmlFor: "equipment-available", children: "Required Equipment Available" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "follow-up-arranged", checked: dischargeReadiness.followUpArranged, onCheckedChange: (checked) => setDischargeReadiness((prev) => ({
                                                                ...prev,
                                                                followUpArranged: checked === true,
                                                            })) }), _jsx(Label, { htmlFor: "follow-up-arranged", children: "Follow-up Care Arranged" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "discharge-date", children: "Planned Discharge Date" }), _jsx(Input, { id: "discharge-date", type: "date" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "discharge-destination", children: "Discharge Destination" }), _jsxs(Select, { children: [_jsx(SelectTrigger, { id: "discharge-destination", children: _jsx(SelectValue, { placeholder: "Select destination" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "home", children: "Home" }), _jsx(SelectItem, { value: "hospital", children: "Hospital" }), _jsx(SelectItem, { value: "ltc_facility", children: "Long-term Care Facility" }), _jsx(SelectItem, { value: "other", children: "Other" })] })] })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "discharge-notes", children: "Discharge Planning Notes" }), _jsx(Textarea, { id: "discharge-notes", placeholder: "Enter discharge planning notes, barriers, and recommendations", rows: 4 })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setIsDischargeDialogOpen(false), children: "Cancel" }), _jsxs(Button, { onClick: handleDischargeAssessment, children: [_jsx(Save, { className: "h-4 w-4 mr-2" }), "Save Assessment"] })] })] }) })] }));
};
export default PatientLifecycleManager;
