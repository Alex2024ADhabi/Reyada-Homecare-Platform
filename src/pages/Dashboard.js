import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Search, User, Settings, Home, Users, FileText, Calendar, BarChart3, AlertCircle, } from "lucide-react";
import { SystemStatus } from "@/components/ui/system-status";
import { NotificationCenter, useNotifications, } from "@/components/ui/notification-center";
import { useToastContext } from "@/components/ui/toast-provider";
import { useErrorHandler } from "@/services/error-handler.service";
import PatientManagement from "@/components/patient/PatientManagement";
import ClinicalDocumentation from "@/components/clinical/ClinicalDocumentation";
import AttendanceTracker from "@/components/administrative/AttendanceTracker";
import TimesheetManagement from "@/components/administrative/TimesheetManagement";
import DailyPlanningDashboard from "@/components/administrative/DailyPlanningDashboard";
import IncidentReportingDashboard from "@/components/administrative/IncidentReportingDashboard";
import ReportingDashboard from "@/components/administrative/ReportingDashboard";
import QualityAssuranceDashboard from "@/components/administrative/QualityAssuranceDashboard";
import CommunicationDashboard from "@/components/administrative/CommunicationDashboard";
import CommitteeManagement from "@/components/administrative/CommitteeManagement";
import EmailWorkflowManager from "@/components/administrative/EmailWorkflowManager";
import PlatformPatientChat from "@/components/administrative/PlatformPatientChat";
import GovernanceDocuments from "@/components/administrative/GovernanceDocuments";
const Dashboard = () => {
    const { toast } = useToastContext();
    const { handleSuccess } = useErrorHandler();
    const [activeTab, setActiveTab] = React.useState("overview");
    const [searchQuery, setSearchQuery] = React.useState("");
    const { notifications, addNotification, markAsRead, markAllAsRead, deleteNotification, clearAll, getUnreadCount, } = useNotifications();
    // Initialize with some sample notifications
    React.useEffect(() => {
        addNotification({
            title: "New Patient Registration",
            message: "Ahmed Al Mansouri has been registered for homecare services",
            type: "info",
            category: "Patient Management",
            priority: "medium",
        });
        addNotification({
            title: "Compliance Alert",
            message: "3 clinical forms require immediate attention",
            type: "warning",
            category: "Compliance",
            priority: "high",
        });
        addNotification({
            title: "System Update",
            message: "Platform maintenance scheduled for tonight at 2:00 AM",
            type: "info",
            category: "System",
            priority: "low",
        });
    }, []);
    // Mock data for dashboard
    const recentPatients = [
        {
            id: 1,
            name: "Ahmed Al Mansouri",
            emiratesId: "784-1985-1234567-1",
            insurance: "Daman Enhanced",
            status: "Active",
            lastVisit: "2023-06-15",
        },
        {
            id: 2,
            name: "Fatima Al Shamsi",
            emiratesId: "784-1990-7654321-2",
            insurance: "Thiqa",
            status: "Pending",
            lastVisit: "2023-06-12",
        },
        {
            id: 3,
            name: "Mohammed Al Hashimi",
            emiratesId: "784-1975-9876543-3",
            insurance: "Daman Basic",
            status: "Active",
            lastVisit: "2023-06-10",
        },
        {
            id: 4,
            name: "Aisha Al Zaabi",
            emiratesId: "784-1982-5432167-4",
            insurance: "MSC",
            status: "Completed",
            lastVisit: "2023-06-08",
        },
    ];
    const statistics = {
        totalPatients: 248,
        activeEpisodes: 156,
        pendingVisits: 42,
        complianceRate: 94,
        authorizationRate: 92,
        // Administrative statistics
        activeStaff: 45,
        pendingIncidents: 3,
        overdueActions: 7,
        qualityScore: 96,
        attendanceRate: 98,
    };
    return (_jsxs("div", { className: "flex h-screen bg-background", children: [_jsxs("div", { className: "hidden md:flex w-64 flex-col bg-card border-r p-4", children: [_jsx("div", { className: "flex items-center mb-8", children: _jsx("h1", { className: "text-2xl font-bold text-primary", children: "Reyada Homecare" }) }), _jsxs("nav", { className: "space-y-2", children: [_jsxs(Button, { variant: "ghost", className: "w-full justify-start", children: [_jsx(Home, { className: "mr-2 h-4 w-4" }), "Dashboard"] }), _jsxs(Button, { variant: "ghost", className: "w-full justify-start", children: [_jsx(Users, { className: "mr-2 h-4 w-4" }), "Patients"] }), _jsxs(Button, { variant: "ghost", className: "w-full justify-start", children: [_jsx(FileText, { className: "mr-2 h-4 w-4" }), "Clinical Forms"] }), _jsxs(Button, { variant: "ghost", className: "w-full justify-start", children: [_jsx(Calendar, { className: "mr-2 h-4 w-4" }), "Scheduling"] }), _jsxs(Button, { variant: "ghost", className: "w-full justify-start", children: [_jsx(BarChart3, { className: "mr-2 h-4 w-4" }), "Reports"] }), _jsxs(Button, { variant: "ghost", className: "w-full justify-start", children: [_jsx(AlertCircle, { className: "mr-2 h-4 w-4" }), "Compliance"] })] }), _jsxs("div", { className: "mt-auto pt-4", children: [_jsxs(Button, { variant: "ghost", className: "w-full justify-start", children: [_jsx(Settings, { className: "mr-2 h-4 w-4" }), "Settings"] }), _jsxs("div", { className: "flex items-center mt-4 p-2 rounded-md bg-muted", children: [_jsxs(Avatar, { className: "h-8 w-8 mr-2", children: [_jsx(AvatarImage, { src: "https://api.dicebear.com/7.x/avataaars/svg?seed=doctor" }), _jsx(AvatarFallback, { children: "DR" })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium", children: "Dr. Sarah Ahmed" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Clinical Supervisor" })] })] })] })] }), _jsxs("div", { className: "flex-1 flex flex-col overflow-hidden", children: [_jsx("header", { className: "border-b bg-card", children: _jsxs("div", { className: "flex h-16 items-center px-4 justify-between", children: [_jsxs("div", { className: "flex items-center md:hidden", children: [_jsx(Button, { variant: "ghost", size: "icon", children: _jsx(Home, { className: "h-5 w-5" }) }), _jsx("h1", { className: "text-xl font-bold text-primary ml-2", children: "Reyada" })] }), _jsx("div", { className: "flex items-center w-full max-w-sm mx-4", children: _jsxs("div", { className: "relative w-full", children: [_jsx(Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }), _jsx(Input, { type: "search", placeholder: "Search patients, forms...", className: "w-full pl-8", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value) })] }) }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx(SystemStatus, {}), _jsx(NotificationCenter, { notifications: notifications, onMarkAsRead: markAsRead, onMarkAllAsRead: markAllAsRead, onDelete: deleteNotification, onClearAll: clearAll, onAction: (notification) => {
                                                handleSuccess("Action Triggered", `Opened: ${notification.title}`);
                                            } }), _jsx(Button, { variant: "ghost", size: "icon", children: _jsx(User, { className: "h-5 w-5" }) })] })] }) }), _jsx("main", { className: "flex-1 overflow-y-auto p-4 md:p-6", children: _jsxs("div", { className: "flex flex-col space-y-6", children: [_jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Dashboard" }), _jsx("p", { className: "text-muted-foreground", children: "Welcome back, Dr. Sarah. Here's an overview of your homecare operations." })] }), _jsxs("div", { className: "flex gap-2 mt-4 md:mt-0", children: [_jsx(Button, { variant: "outline", children: "Export" }), _jsx(Button, { children: "New Patient" })] })] }), _jsxs("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Total Patients" }), _jsx(Users, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: statistics.totalPatients }), _jsx("p", { className: "text-xs text-muted-foreground", children: "+12 this month" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Active Episodes" }), _jsx(FileText, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: statistics.activeEpisodes }), _jsx("p", { className: "text-xs text-muted-foreground", children: "+8 this week" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Pending Visits" }), _jsx(Calendar, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: statistics.pendingVisits }), _jsx("p", { className: "text-xs text-muted-foreground", children: "For next 48 hours" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Compliance Rate" }), _jsx(AlertCircle, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold", children: [statistics.complianceRate, "%"] }), _jsx(Progress, { value: statistics.complianceRate, className: "h-1 mt-2" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Authorization Rate" }), _jsx(BarChart3, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold", children: [statistics.authorizationRate, "%"] }), _jsx(Progress, { value: statistics.authorizationRate, className: "h-1 mt-2" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Quality Score" }), _jsx(AlertCircle, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold", children: [statistics.qualityScore, "%"] }), _jsx(Progress, { value: statistics.qualityScore, className: "h-1 mt-2" })] })] })] }), _jsxs(Tabs, { defaultValue: "overview", value: activeTab, onValueChange: setActiveTab, className: "w-full", children: [_jsxs(TabsList, { className: "grid grid-cols-3 md:w-auto md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-15", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "patients", children: "Patients" }), _jsx(TabsTrigger, { value: "clinical", children: "Clinical" }), _jsx(TabsTrigger, { value: "attendance", children: "Attendance" }), _jsx(TabsTrigger, { value: "timesheets", children: "Timesheets" }), _jsx(TabsTrigger, { value: "planning", children: "Planning" }), _jsx(TabsTrigger, { value: "incidents", children: "Incidents" }), _jsx(TabsTrigger, { value: "reports", children: "Reports" }), _jsx(TabsTrigger, { value: "quality", children: "Quality" }), _jsx(TabsTrigger, { value: "compliance", children: "Compliance" }), _jsx(TabsTrigger, { value: "communication", children: "Communication" }), _jsx(TabsTrigger, { value: "chat", children: "Chat" }), _jsx(TabsTrigger, { value: "email", children: "Email" }), _jsx(TabsTrigger, { value: "committees", children: "Committees" }), _jsx(TabsTrigger, { value: "governance", children: "Governance" })] }), _jsxs(TabsContent, { value: "overview", className: "space-y-4 mt-4", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Recent Patients" }), _jsx(CardDescription, { children: "Your recently accessed patients" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: recentPatients.map((patient) => (_jsxs("div", { className: "flex items-center justify-between border-b pb-2", children: [_jsxs("div", { className: "flex items-center", children: [_jsxs(Avatar, { className: "h-9 w-9 mr-2", children: [_jsx(AvatarImage, { src: `https://api.dicebear.com/7.x/avataaars/svg?seed=${patient.name}` }), _jsx(AvatarFallback, { children: patient.name.substring(0, 2).toUpperCase() })] }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: patient.name }), _jsx("p", { className: "text-xs text-muted-foreground", children: patient.emiratesId })] })] }), _jsxs("div", { className: "flex items-center", children: [_jsx(Badge, { variant: patient.status === "Active"
                                                                                        ? "default"
                                                                                        : patient.status === "Pending"
                                                                                            ? "secondary"
                                                                                            : "outline", children: patient.status }), _jsx(Button, { variant: "ghost", size: "sm", className: "ml-2", children: "View" })] })] }, patient.id))) }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "DOH Compliance Summary" }), _jsx(CardDescription, { children: "Regulatory compliance status" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "CN_13_2025 Emiratization" }), _jsx("span", { className: "text-sm font-medium", children: "92%" })] }), _jsx(Progress, { value: 92, className: "h-1" })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "CN_19_2025 Patient Safety" }), _jsx("span", { className: "text-sm font-medium", children: "96%" })] }), _jsx(Progress, { value: 96, className: "h-1" })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "CN_48_2025 Documentation" }), _jsx("span", { className: "text-sm font-medium", children: "89%" })] }), _jsx(Progress, { value: 89, className: "h-1" })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "JAWDA KPI Reporting" }), _jsx("span", { className: "text-sm font-medium", children: "100%" })] }), _jsx(Progress, { value: 100, className: "h-1" })] })] }) })] })] }), _jsx(TabsContent, { value: "patients", className: "mt-4", children: _jsx(PatientManagement, {}) }), _jsx(TabsContent, { value: "clinical", className: "mt-4", children: _jsx(ClinicalDocumentation, {}) }), _jsx(TabsContent, { value: "attendance", className: "mt-4", children: _jsx(AttendanceTracker, {}) }), _jsx(TabsContent, { value: "timesheets", className: "mt-4", children: _jsx(TimesheetManagement, {}) }), _jsx(TabsContent, { value: "planning", className: "mt-4", children: _jsx(DailyPlanningDashboard, {}) }), _jsx(TabsContent, { value: "incidents", className: "mt-4", children: _jsx(IncidentReportingDashboard, {}) }), _jsx(TabsContent, { value: "reports", className: "mt-4", children: _jsx(ReportingDashboard, {}) }), _jsx(TabsContent, { value: "quality", className: "mt-4", children: _jsx(QualityAssuranceDashboard, {}) }), _jsx(TabsContent, { value: "compliance", className: "mt-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "DOH Compliance Center" }), _jsx(CardDescription, { children: "Monitor and manage regulatory compliance" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "p-8 text-center", children: [_jsx("h3", { className: "text-lg font-medium", children: "Compliance Module" }), _jsx("p", { className: "text-muted-foreground mt-2", children: "Detailed compliance monitoring and reporting tools will be displayed here." })] }) })] }) }), _jsx(TabsContent, { value: "communication", className: "mt-4", children: _jsx(CommunicationDashboard, {}) }), _jsx(TabsContent, { value: "chat", className: "mt-4", children: _jsx(PlatformPatientChat, {}) }), _jsx(TabsContent, { value: "email", className: "mt-4", children: _jsx(EmailWorkflowManager, {}) }), _jsx(TabsContent, { value: "committees", className: "mt-4", children: _jsx(CommitteeManagement, {}) }), _jsx(TabsContent, { value: "governance", className: "mt-4", children: _jsx(GovernanceDocuments, {}) })] })] }) })] })] }));
};
export default Dashboard;
