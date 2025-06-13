import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, FileText, AlertCircle, ChevronRight, Plus, User, } from "lucide-react";
const PatientEpisode = ({ episodeId = "EP12345", patientId = "PT67890", episodeData = {
    id: "EP12345",
    startDate: "2023-06-15",
    endDate: "2023-09-15",
    status: "active",
    careType: "Post-Hospital Transitional Care",
    primaryDiagnosis: "Congestive Heart Failure",
    complianceScore: 85,
    events: [
        {
            id: "EV001",
            date: "2023-06-15",
            title: "Initial Assessment",
            description: "Complete 9-domain DOH assessment",
            type: "assessment",
            status: "completed",
        },
        {
            id: "EV002",
            date: "2023-06-18",
            title: "Nursing Visit",
            description: "Vital signs monitoring and medication review",
            type: "visit",
            status: "completed",
        },
        {
            id: "EV003",
            date: "2023-06-22",
            title: "Physiotherapy Session",
            description: "Mobility exercises and gait training",
            type: "visit",
            status: "completed",
        },
        {
            id: "EV004",
            date: "2023-06-25",
            title: "Wound Care Documentation",
            description: "Wound measurement and treatment plan",
            type: "document",
            status: "pending",
        },
        {
            id: "EV005",
            date: "2023-06-28",
            title: "DOH Compliance Check",
            description: "Verification of documentation standards",
            type: "compliance",
            status: "scheduled",
        },
    ],
    clinicalForms: [
        {
            id: "CF001",
            name: "DOH Healthcare Assessment",
            lastUpdated: "2023-06-15",
            status: "completed",
            compliance: 100,
        },
        {
            id: "CF002",
            name: "Nursing Progress Note",
            lastUpdated: "2023-06-18",
            status: "completed",
            compliance: 95,
        },
        {
            id: "CF003",
            name: "Physiotherapy Assessment",
            lastUpdated: "2023-06-22",
            status: "completed",
            compliance: 90,
        },
        {
            id: "CF004",
            name: "Wound Assessment",
            lastUpdated: "2023-06-25",
            status: "draft",
            compliance: 60,
        },
        {
            id: "CF005",
            name: "Medication Administration Record",
            lastUpdated: "",
            status: "pending",
            compliance: 0,
        },
    ],
}, }) => {
    const [activeTab, setActiveTab] = useState("overview");
    const getStatusColor = (status) => {
        switch (status) {
            case "completed":
                return "bg-green-100 text-green-800";
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "overdue":
                return "bg-red-100 text-red-800";
            case "scheduled":
                return "bg-blue-100 text-blue-800";
            case "active":
                return "bg-green-100 text-green-800";
            case "draft":
                return "bg-gray-100 text-gray-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };
    const getEventIcon = (type) => {
        switch (type) {
            case "assessment":
                return _jsx(FileText, { className: "h-4 w-4" });
            case "visit":
                return _jsx(User, { className: "h-4 w-4" });
            case "document":
                return _jsx(FileText, { className: "h-4 w-4" });
            case "compliance":
                return _jsx(AlertCircle, { className: "h-4 w-4" });
            default:
                return _jsx(FileText, { className: "h-4 w-4" });
        }
    };
    return (_jsxs("div", { className: "bg-white p-6 rounded-lg shadow-sm w-full", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold", children: "Episode of Care" }), _jsxs("div", { className: "flex items-center gap-2 mt-1", children: [_jsx(Badge, { variant: "outline", children: episodeData.id }), _jsx(Badge, { className: getStatusColor(episodeData.status), children: episodeData.status.charAt(0).toUpperCase() +
                                            episodeData.status.slice(1) })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "outline", children: "Edit Episode" }), _jsx(Button, { children: "Create Document" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-muted-foreground", children: "Care Type" }) }), _jsx(CardContent, { children: _jsx("p", { className: "text-lg font-medium", children: episodeData.careType }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-muted-foreground", children: "Primary Diagnosis" }) }), _jsx(CardContent, { children: _jsx("p", { className: "text-lg font-medium", children: episodeData.primaryDiagnosis }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-muted-foreground", children: "DOH Compliance" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Progress, { value: episodeData.complianceScore, className: "h-2" }), _jsxs("span", { className: "text-lg font-medium", children: [episodeData.complianceScore, "%"] })] }) })] })] }), _jsxs("div", { className: "flex items-center gap-4 mb-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Calendar, { className: "h-4 w-4 text-muted-foreground" }), _jsxs("span", { className: "text-sm text-muted-foreground", children: ["Start Date: ", episodeData.startDate] })] }), episodeData.endDate && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Calendar, { className: "h-4 w-4 text-muted-foreground" }), _jsxs("span", { className: "text-sm text-muted-foreground", children: ["End Date: ", episodeData.endDate] })] }))] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full", children: [_jsxs(TabsList, { className: "grid grid-cols-3 mb-6", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "timeline", children: "Timeline" }), _jsx(TabsTrigger, { value: "documents", children: "Clinical Documents" })] }), _jsxs(TabsContent, { value: "overview", className: "space-y-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Episode Summary" }), _jsx(CardDescription, { children: "Key information about this episode of care" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-2", children: "Care Plan Goals" }), _jsxs("ul", { className: "list-disc pl-5 space-y-1", children: [_jsx("li", { children: "Improve mobility and independence in activities of daily living" }), _jsx("li", { children: "Stabilize vital signs and manage heart failure symptoms" }), _jsx("li", { children: "Prevent hospital readmission within 30 days of discharge" }), _jsx("li", { children: "Educate patient and caregiver on medication management" })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-2", children: "Recent Vital Signs" }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "p-3 bg-gray-50 rounded-md", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Blood Pressure" }), _jsx("p", { className: "font-medium", children: "130/85 mmHg" })] }), _jsxs("div", { className: "p-3 bg-gray-50 rounded-md", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Heart Rate" }), _jsx("p", { className: "font-medium", children: "78 bpm" })] }), _jsxs("div", { className: "p-3 bg-gray-50 rounded-md", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Oxygen Saturation" }), _jsx("p", { className: "font-medium", children: "96%" })] }), _jsxs("div", { className: "p-3 bg-gray-50 rounded-md", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Temperature" }), _jsx("p", { className: "font-medium", children: "36.7\u00B0C" })] })] })] })] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Upcoming Visits" }), _jsx(CardDescription, { children: "Scheduled care team visits" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded-md", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Calendar, { className: "h-5 w-5 text-primary" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Nursing Visit" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "June 30, 2023 - 10:00 AM" })] })] }), _jsx(Badge, { children: "Scheduled" })] }), _jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded-md", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Calendar, { className: "h-5 w-5 text-primary" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Physiotherapy Session" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "July 2, 2023 - 2:00 PM" })] })] }), _jsx(Badge, { children: "Scheduled" })] })] }) }), _jsx(CardFooter, { children: _jsxs(Button, { variant: "outline", className: "w-full", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), " Schedule New Visit"] }) })] })] }), _jsx(TabsContent, { value: "timeline", className: "space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Care Journey Timeline" }), _jsx(CardDescription, { children: "Chronological view of patient care activities" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-6", children: episodeData.events.map((event, index) => (_jsxs("div", { className: "relative pl-6 pb-6", children: [index < episodeData.events.length - 1 && (_jsx("div", { className: "absolute left-2 top-2 bottom-0 w-0.5 bg-gray-200" })), _jsx("div", { className: "absolute left-0 top-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center", children: getEventIcon(event.type) }), _jsxs("div", { className: "bg-gray-50 p-4 rounded-md", children: [_jsxs("div", { className: "flex justify-between items-start mb-2", children: [_jsx("h4", { className: "font-medium", children: event.title }), _jsx(Badge, { className: getStatusColor(event.status), children: event.status.charAt(0).toUpperCase() +
                                                                        event.status.slice(1) })] }), _jsx("p", { className: "text-sm text-muted-foreground mb-2", children: event.description }), _jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [_jsx(Calendar, { className: "h-3 w-3" }), _jsx("span", { children: event.date })] })] })] }, event.id))) }) }), _jsx(CardFooter, { children: _jsxs(Button, { variant: "outline", className: "w-full", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), " Add Timeline Event"] }) })] }) }), _jsx(TabsContent, { value: "documents", className: "space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Clinical Documentation" }), _jsx(CardDescription, { children: "Forms and clinical notes for this episode" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: episodeData.clinicalForms.map((form) => (_jsxs("div", { className: "flex items-center justify-between p-4 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(FileText, { className: "h-5 w-5 text-primary" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: form.name }), _jsx("p", { className: "text-sm text-muted-foreground", children: form.lastUpdated
                                                                        ? `Last updated: ${form.lastUpdated}`
                                                                        : "Not started" })] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Badge, { className: getStatusColor(form.status), children: form.status.charAt(0).toUpperCase() +
                                                                form.status.slice(1) }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsxs("span", { className: "text-sm", children: [form.compliance, "%"] }), _jsx(ChevronRight, { className: "h-4 w-4" })] })] })] }, form.id))) }) }), _jsx(CardFooter, { children: _jsxs(Button, { variant: "outline", className: "w-full", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), " Create New Document"] }) })] }) })] })] }));
};
export default PatientEpisode;
