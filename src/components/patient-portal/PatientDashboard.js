import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, MessageSquare, FileText, Heart, TrendingUp, TrendingDown, Minus, Clock, AlertCircle, Bell, } from "lucide-react";
import { useSatisfactionSurveys } from "@/hooks/useSatisfactionSurveys";
import SatisfactionSurveyComponent from "./SatisfactionSurvey";
import { format, isToday, isTomorrow } from "date-fns";
import { useMalaffiSync } from "@/hooks/useMalaffiSync";
import { usePatientData } from "@/hooks/usePatientData";
export const PatientDashboard = ({ patient, dashboardData, className = "", }) => {
    const { pendingSurveys } = useSatisfactionSurveys(patient.id);
    const { syncStatus, lastSync, triggerSync } = useMalaffiSync(patient.id);
    const { patientData, isLoading: patientDataLoading, refreshData, } = usePatientData(patient.id);
    const getAppointmentDateLabel = (date) => {
        const appointmentDate = new Date(date);
        if (isToday(appointmentDate))
            return "Today";
        if (isTomorrow(appointmentDate))
            return "Tomorrow";
        return format(appointmentDate, "MMM dd");
    };
    const getStatusColor = (status) => {
        switch (status) {
            case "active":
            case "confirmed":
            case "scheduled":
                return "bg-green-100 text-green-800";
            case "in-progress":
                return "bg-blue-100 text-blue-800";
            case "completed":
                return "bg-gray-100 text-gray-800";
            case "cancelled":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };
    const getTrendIcon = (trend) => {
        switch (trend) {
            case "improving":
                return _jsx(TrendingUp, { className: "h-4 w-4 text-green-600" });
            case "declining":
                return _jsx(TrendingDown, { className: "h-4 w-4 text-red-600" });
            default:
                return _jsx(Minus, { className: "h-4 w-4 text-gray-600" });
        }
    };
    return (_jsxs("div", { className: `space-y-6 ${className}`, children: [_jsx("div", { className: "bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h2", { className: "text-2xl font-bold mb-2", children: ["Welcome back, ", patient.firstName, "!"] }), _jsx("p", { className: "text-blue-100", children: "Here's an overview of your health journey and upcoming activities." })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [_jsx("div", { className: `w-2 h-2 rounded-full ${syncStatus === "synced"
                                                ? "bg-green-400"
                                                : syncStatus === "syncing"
                                                    ? "bg-yellow-400 animate-pulse"
                                                    : "bg-red-400"}` }), _jsx("span", { className: "text-sm text-blue-100", children: syncStatus === "synced"
                                                ? "Data Synced"
                                                : syncStatus === "syncing"
                                                    ? "Syncing..."
                                                    : "Sync Pending" })] }), lastSync && (_jsxs("p", { className: "text-xs text-blue-200", children: ["Last sync: ", format(new Date(lastSync), "MMM dd, HH:mm")] }))] })] }) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Upcoming Appointments" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: dashboardData?.upcomingAppointments?.length || 0 })] }), _jsx(Calendar, { className: "h-8 w-8 text-blue-600" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Active Care Plans" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: dashboardData?.activeCarePlans?.length || 0 })] }), _jsx(FileText, { className: "h-8 w-8 text-green-600" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Unread Messages" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: dashboardData?.notifications?.unread || 0 })] }), _jsx(MessageSquare, { className: "h-8 w-8 text-purple-600" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Health Metrics" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: dashboardData?.healthMetrics?.recent?.length || 0 }), _jsxs("div", { className: "flex items-center mt-1", children: [_jsx("div", { className: `w-1 h-1 rounded-full mr-1 ${patientData?.malaffiSync?.status === "active"
                                                            ? "bg-green-500"
                                                            : "bg-gray-400"}` }), _jsx("span", { className: "text-xs text-gray-500", children: patientData?.malaffiSync?.status === "active"
                                                            ? "EMR Connected"
                                                            : "EMR Offline" })] })] }), _jsx(Heart, { className: "h-8 w-8 text-red-600" })] }) }) })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Calendar, { className: "h-5 w-5 mr-2" }), "Upcoming Appointments"] }) }), _jsx(CardContent, { children: dashboardData?.upcomingAppointments?.length ? (_jsxs("div", { className: "space-y-4", children: [dashboardData.upcomingAppointments
                                            .slice(0, 3)
                                            .map((appointment) => (_jsx("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded-lg", children: _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("h4", { className: "font-medium text-gray-900", children: appointment.title }), _jsx(Badge, { className: getStatusColor(appointment.status), children: appointment.status })] }), _jsxs("p", { className: "text-sm text-gray-600 mt-1", children: [appointment.providerName, " \u2022", " ", appointment.location.type] }), _jsxs("div", { className: "flex items-center text-sm text-gray-500 mt-1", children: [_jsx(Clock, { className: "h-4 w-4 mr-1" }), getAppointmentDateLabel(appointment.scheduledDate), " ", "at", " ", format(new Date(appointment.scheduledDate), "HH:mm")] })] }) }, appointment.id))), _jsx(Button, { variant: "outline", className: "w-full", children: "View All Appointments" })] })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(Calendar, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }), _jsx("p", { className: "text-gray-500", children: "No upcoming appointments" }), _jsx(Button, { className: "mt-4", children: "Schedule Appointment" })] })) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(FileText, { className: "h-5 w-5 mr-2" }), "Active Care Plans"] }) }), _jsx(CardContent, { children: dashboardData?.activeCarePlans?.length ? (_jsxs("div", { className: "space-y-4", children: [dashboardData.activeCarePlans.slice(0, 2).map((carePlan) => {
                                            const overallProgress = carePlan.goals.reduce((acc, goal) => acc + goal.progress, 0) / carePlan.goals.length;
                                            return (_jsxs("div", { className: "p-4 bg-gray-50 rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h4", { className: "font-medium text-gray-900", children: carePlan.title }), _jsx(Badge, { className: getStatusColor(carePlan.status), children: carePlan.status })] }), _jsx("p", { className: "text-sm text-gray-600 mb-3", children: carePlan.description }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-gray-600", children: "Overall Progress" }), _jsxs("span", { className: "font-medium", children: [Math.round(overallProgress), "%"] })] }), _jsx(Progress, { value: overallProgress, className: "h-2" })] }), _jsxs("div", { className: "flex justify-between items-center mt-3 text-sm text-gray-500", children: [_jsxs("span", { children: [carePlan.goals.length, " goals"] }), _jsxs("span", { children: [carePlan.interventions.length, " interventions"] })] })] }, carePlan.id));
                                        }), _jsx(Button, { variant: "outline", className: "w-full", children: "View All Care Plans" })] })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(FileText, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }), _jsx("p", { className: "text-gray-500", children: "No active care plans" })] })) })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Heart, { className: "h-5 w-5 mr-2" }), "Health Trends"] }) }), _jsx(CardContent, { children: dashboardData?.healthMetrics?.trends?.length ? (_jsxs("div", { className: "space-y-4", children: [dashboardData.healthMetrics.trends.map((trend, index) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded-lg", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [getTrendIcon(trend.trend), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-gray-900 capitalize", children: trend.type.replace("-", " ") }), _jsx("p", { className: "text-sm text-gray-600", children: trend.trend === "improving"
                                                                        ? "Improving"
                                                                        : trend.trend === "declining"
                                                                            ? "Needs attention"
                                                                            : "Stable" })] })] }), _jsx("div", { className: "text-right", children: _jsxs("p", { className: `text-sm font-medium ${trend.trend === "improving"
                                                            ? "text-green-600"
                                                            : trend.trend === "declining"
                                                                ? "text-red-600"
                                                                : "text-gray-600"}`, children: [trend.change > 0 ? "+" : "", trend.change, "%"] }) })] }, index))), _jsx(Button, { variant: "outline", className: "w-full", children: "View Detailed Metrics" })] })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(Heart, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }), _jsx("p", { className: "text-gray-500", children: "No health data available" }), _jsx(Button, { className: "mt-4", children: "Start Tracking" })] })) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Bell, { className: "h-5 w-5 mr-2" }), "Recent Notifications"] }) }), _jsx(CardContent, { children: dashboardData?.notifications?.recent?.length ? (_jsxs("div", { className: "space-y-3", children: [dashboardData.notifications.recent
                                            .slice(0, 4)
                                            .map((notification) => (_jsx("div", { className: `p-3 rounded-lg border-l-4 ${notification.read
                                                ? "bg-gray-50 border-gray-300"
                                                : "bg-blue-50 border-blue-500"}`, children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: `text-sm font-medium ${notification.read
                                                                    ? "text-gray-700"
                                                                    : "text-gray-900"}`, children: notification.title }), _jsx("p", { className: `text-sm mt-1 ${notification.read
                                                                    ? "text-gray-500"
                                                                    : "text-gray-600"}`, children: notification.message }), _jsx("p", { className: "text-xs text-gray-400 mt-1", children: format(new Date(notification.createdAt), "MMM dd, HH:mm") })] }), !notification.read && (_jsx("div", { className: "w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1" }))] }) }, notification.id))), _jsx(Button, { variant: "outline", className: "w-full", children: "View All Notifications" })] })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(Bell, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }), _jsx("p", { className: "text-gray-500", children: "No recent notifications" })] })) })] })] }), (pendingSurveys.length > 0 ||
                dashboardData?.pendingSurveys?.length > 0) && (_jsxs("div", { className: "space-y-4", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-900 flex items-center", children: [_jsx(AlertCircle, { className: "h-5 w-5 mr-2" }), "Pending Surveys"] }), pendingSurveys.map((survey) => (_jsx(SatisfactionSurveyComponent, { survey: survey, onComplete: () => {
                            // Refresh dashboard data if needed
                        }, onDismiss: () => {
                            // Handle survey dismissal
                        } }, survey.id))), dashboardData?.pendingSurveys?.map((survey) => (_jsx("div", { className: "p-4 bg-yellow-50 border border-yellow-200 rounded-lg", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900", children: survey.title }), _jsxs("p", { className: "text-sm text-gray-600", children: [survey.questions.length, " questions \u2022 Expires", " ", format(new Date(survey.expiresAt), "MMM dd")] })] }), _jsx(Button, { size: "sm", children: "Complete Survey" })] }) }, survey.id)))] }))] }));
};
export default PatientDashboard;
