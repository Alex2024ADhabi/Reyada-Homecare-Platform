import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Calendar, MessageSquare, FileText, Settings, Bell, Heart, BookOpen, Shield, LogOut, Menu, X, } from "lucide-react";
import { PatientDashboard } from "@/components/patient-portal/PatientDashboard";
import { CarePlanViewer } from "@/components/patient-portal/CarePlanViewer";
import { AppointmentScheduler } from "@/components/patient-portal/AppointmentScheduler";
import { SecureMessaging } from "@/components/patient-portal/SecureMessaging";
import { HealthTrackingTools } from "@/components/patient-portal/HealthTrackingTools";
import { HealthEducationModules } from "@/components/patient-portal/HealthEducationModules";
import { NotificationSettings } from "@/components/patient-portal/NotificationSettings";
import { FamilyAccessControls } from "@/components/patient-portal/FamilyAccessControls";
import { usePatientAuth } from "@/hooks/usePatientAuth";
import { usePatientData } from "@/hooks/usePatientData";
export const PatientPortal = ({ className = "", }) => {
    const navigate = useNavigate();
    const { patient, isAuthenticated, logout, isLoading: authLoading, } = usePatientAuth();
    const { dashboardData, isLoading: dataLoading, error, } = usePatientData(patient?.id);
    const [activeTab, setActiveTab] = useState("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate("/patient/login");
        }
    }, [isAuthenticated, authLoading, navigate]);
    const handleLogout = async () => {
        try {
            await logout();
            navigate("/patient/login");
        }
        catch (error) {
            console.error("Logout failed:", error);
        }
    };
    const navigationItems = [
        { id: "dashboard", label: "Dashboard", icon: User },
        { id: "care-plans", label: "Care Plans", icon: FileText },
        { id: "appointments", label: "Appointments", icon: Calendar },
        {
            id: "messages",
            label: "Messages",
            icon: MessageSquare,
            badge: dashboardData?.notifications.unread || 0,
        },
        { id: "health-tracking", label: "Health Tracking", icon: Heart },
        { id: "education", label: "Education", icon: BookOpen },
        { id: "settings", label: "Settings", icon: Settings },
    ];
    if (authLoading) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "Loading your portal..." })] }) }));
    }
    if (!isAuthenticated || !patient) {
        return null;
    }
    return (_jsxs("div", { className: `min-h-screen bg-gray-50 ${className}`, children: [_jsx("header", { className: "bg-white shadow-sm border-b", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "flex justify-between items-center h-16", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("button", { onClick: () => setSidebarOpen(!sidebarOpen), className: "lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100", children: sidebarOpen ? (_jsx(X, { className: "h-6 w-6" })) : (_jsx(Menu, { className: "h-6 w-6" })) }), _jsxs("div", { className: "flex items-center ml-4 lg:ml-0", children: [_jsx(Shield, { className: "h-8 w-8 text-blue-600" }), _jsx("h1", { className: "ml-2 text-xl font-semibold text-gray-900", children: "Patient Portal" })] })] }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "relative", children: [_jsx(Bell, { className: "h-6 w-6 text-gray-400 hover:text-gray-500 cursor-pointer" }), dashboardData?.notifications.unread > 0 && (_jsx(Badge, { className: "absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs", children: dashboardData.notifications.unread }))] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("div", { className: "text-right", children: [_jsxs("p", { className: "text-sm font-medium text-gray-900", children: [patient.firstName, " ", patient.lastName] }), _jsxs("p", { className: "text-xs text-gray-500", children: ["Patient ID: ", patient.id.slice(-8)] })] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: handleLogout, className: "text-gray-500 hover:text-gray-700", children: _jsx(LogOut, { className: "h-4 w-4" }) })] })] })] }) }) }), _jsxs("div", { className: "flex", children: [_jsx("aside", { className: `
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white shadow-lg border-r transition-transform duration-300 ease-in-out
          lg:shadow-none
        `, children: _jsx("div", { className: "h-full flex flex-col pt-16 lg:pt-0", children: _jsx("nav", { className: "flex-1 px-4 py-6 space-y-2", children: navigationItems.map((item) => {
                                    const Icon = item.icon;
                                    return (_jsxs("button", { onClick: () => {
                                            setActiveTab(item.id);
                                            setSidebarOpen(false);
                                        }, className: `
                      w-full flex items-center px-3 py-2 text-sm font-medium rounded-md
                      transition-colors duration-200
                      ${activeTab === item.id
                                            ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}
                    `, children: [_jsx(Icon, { className: "h-5 w-5 mr-3" }), item.label, item.badge && item.badge > 0 && (_jsx(Badge, { className: "ml-auto h-5 w-5 flex items-center justify-center text-xs", children: item.badge }))] }, item.id));
                                }) }) }) }), sidebarOpen && (_jsx("div", { className: "lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50", onClick: () => setSidebarOpen(false) })), _jsx("main", { className: "flex-1 lg:ml-0", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [error && (_jsx(Alert, { className: "mb-6 border-red-200 bg-red-50", children: _jsx(AlertDescription, { className: "text-red-800", children: error }) })), dataLoading ? (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "Loading..." })] }) })) : (_jsxs("div", { className: "space-y-6", children: [activeTab === "dashboard" && (_jsx(PatientDashboard, { patient: patient, dashboardData: dashboardData })), activeTab === "care-plans" && (_jsx(CarePlanViewer, { patientId: patient.id, carePlans: dashboardData?.activeCarePlans || [] })), activeTab === "appointments" && (_jsx(AppointmentScheduler, { patientId: patient.id, upcomingAppointments: dashboardData?.upcomingAppointments || [] })), activeTab === "messages" && (_jsx(SecureMessaging, { patientId: patient.id, recentMessages: dashboardData?.recentMessages || [] })), activeTab === "health-tracking" && (_jsx(HealthTrackingTools, { patientId: patient.id, healthMetrics: dashboardData?.healthMetrics })), activeTab === "education" && (_jsx(HealthEducationModules, { patientId: patient.id, recommendations: dashboardData?.educationalRecommendations || [] })), activeTab === "settings" && (_jsxs("div", { className: "space-y-6", children: [_jsx(NotificationSettings, { patientId: patient.id }), _jsx(FamilyAccessControls, { patientId: patient.id })] }))] }))] }) })] })] }));
};
export default PatientPortal;
