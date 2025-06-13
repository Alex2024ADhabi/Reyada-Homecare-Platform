import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, } from "lucide-react";
export default function TherapySessionCalendar({ sessions, onEditSession, }) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedSession, setSelectedSession] = useState(null);
    const daysInMonth = useMemo(() => {
        const start = startOfMonth(currentMonth);
        const end = endOfMonth(currentMonth);
        return eachDayOfInterval({ start, end });
    }, [currentMonth]);
    const sessionsByDate = useMemo(() => {
        const grouped = {};
        sessions.forEach((session) => {
            const dateKey = session.session_date;
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(session);
        });
        return grouped;
    }, [sessions]);
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const handleSessionClick = (session) => {
        setSelectedSession(session);
    };
    const handleEditClick = () => {
        if (selectedSession && onEditSession) {
            onEditSession(selectedSession);
            setSelectedSession(null);
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case "completed":
                return "bg-green-100 border-green-500 text-green-800";
            case "scheduled":
                return "bg-blue-100 border-blue-500 text-blue-800";
            case "cancelled":
                return "bg-red-100 border-red-500 text-red-800";
            case "no-show":
                return "bg-yellow-100 border-yellow-500 text-yellow-800";
            default:
                return "bg-gray-100 border-gray-500 text-gray-800";
        }
    };
    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case "completed":
                return "default";
            case "scheduled":
                return "default";
            case "cancelled":
                return "destructive";
            case "no-show":
                return "secondary";
            default:
                return "secondary";
        }
    };
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: "Therapy Sessions Calendar" }), _jsx(CardDescription, { children: "View and manage scheduled therapy sessions" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Button, { variant: "outline", size: "icon", onClick: prevMonth, children: _jsx(ChevronLeft, { className: "h-4 w-4" }) }), _jsx("div", { className: "font-medium", children: format(currentMonth, "MMMM yyyy") }), _jsx(Button, { variant: "outline", size: "icon", onClick: nextMonth, children: _jsx(ChevronRight, { className: "h-4 w-4" }) })] })] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "grid grid-cols-7 gap-1 text-center font-medium mb-2", children: [_jsx("div", { children: "Sun" }), _jsx("div", { children: "Mon" }), _jsx("div", { children: "Tue" }), _jsx("div", { children: "Wed" }), _jsx("div", { children: "Thu" }), _jsx("div", { children: "Fri" }), _jsx("div", { children: "Sat" })] }), _jsx("div", { className: "grid grid-cols-7 gap-1", children: daysInMonth.map((day) => {
                                    const dateStr = format(day, "yyyy-MM-dd");
                                    const daySessions = sessionsByDate[dateStr] || [];
                                    const hasCompletedSessions = daySessions.some((s) => s.status === "completed");
                                    const hasScheduledSessions = daySessions.some((s) => s.status === "scheduled");
                                    const hasCancelledSessions = daySessions.some((s) => s.status === "cancelled");
                                    const hasNoShowSessions = daySessions.some((s) => s.status === "no-show");
                                    return (_jsxs("div", { className: `min-h-24 p-1 border rounded-md ${daySessions.length > 0 ? "border-gray-300" : "border-gray-100"}`, children: [_jsx("div", { className: "font-medium text-sm mb-1", children: format(day, "d") }), _jsxs("div", { className: "space-y-1 max-h-20 overflow-y-auto", children: [daySessions.map((session) => (_jsxs("div", { className: `text-xs p-1 rounded border cursor-pointer ${getStatusColor(session.status)}`, onClick: () => handleSessionClick(session), children: [_jsxs("div", { className: "font-medium truncate", children: [session.therapy_type, " - ", session.session_time] }), _jsx("div", { className: "truncate", children: session.therapist })] }, session._id?.toString()))), daySessions.length > 3 && (_jsxs("div", { className: "text-xs text-center text-gray-500", children: ["+", daySessions.length - 3, " more"] }))] }), (hasCompletedSessions ||
                                                hasScheduledSessions ||
                                                hasCancelledSessions ||
                                                hasNoShowSessions) && (_jsxs("div", { className: "flex flex-wrap gap-1 mt-1", children: [hasCompletedSessions && (_jsx("div", { className: "w-2 h-2 rounded-full bg-green-500" })), hasScheduledSessions && (_jsx("div", { className: "w-2 h-2 rounded-full bg-blue-500" })), hasCancelledSessions && (_jsx("div", { className: "w-2 h-2 rounded-full bg-red-500" })), hasNoShowSessions && (_jsx("div", { className: "w-2 h-2 rounded-full bg-yellow-500" }))] }))] }, dateStr));
                                }) })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Calendar Legend" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-3 h-3 rounded-full bg-blue-500" }), _jsx("span", { children: "Scheduled" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-3 h-3 rounded-full bg-green-500" }), _jsx("span", { children: "Completed" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-3 h-3 rounded-full bg-red-500" }), _jsx("span", { children: "Cancelled" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-3 h-3 rounded-full bg-yellow-500" }), _jsx("span", { children: "No Show" })] })] }) })] }), selectedSession && (_jsx(Dialog, { open: !!selectedSession, onOpenChange: (open) => !open && setSelectedSession(null), children: _jsx(DialogContent, { children: _jsxs("div", { className: "p-4", children: [_jsx("h2", { className: "text-xl font-bold mb-4", children: "Session Details" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: "Patient ID" }), _jsx("p", { children: selectedSession.patient_id })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: "Therapist" }), _jsx("p", { children: selectedSession.therapist })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: "Therapy Type" }), _jsx("p", { children: selectedSession.therapy_type === "PT"
                                                            ? "Physical Therapy"
                                                            : selectedSession.therapy_type === "OT"
                                                                ? "Occupational Therapy"
                                                                : selectedSession.therapy_type === "ST"
                                                                    ? "Speech Therapy"
                                                                    : selectedSession.therapy_type === "RT"
                                                                        ? "Respiratory Therapy"
                                                                        : selectedSession.therapy_type })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: "Status" }), _jsx(Badge, { variant: getStatusBadgeVariant(selectedSession.status), children: selectedSession.status?.charAt(0).toUpperCase() +
                                                            selectedSession.status?.slice(1) })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: "Date & Time" }), _jsxs("p", { children: [selectedSession.session_date, " at", " ", selectedSession.session_time] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: "Duration" }), _jsxs("p", { children: [selectedSession.duration_minutes, " minutes"] })] })] }), selectedSession.progress_rating && (_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: "Progress Rating" }), _jsxs("div", { className: "flex items-center mt-1", children: [_jsxs("span", { className: "mr-2", children: [selectedSession.progress_rating, "/10"] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-green-600 h-2 rounded-full", style: {
                                                                width: `${(selectedSession.progress_rating / 10) * 100}%`,
                                                            } }) })] })] })), selectedSession.goals_addressed && (_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: "Goals Addressed" }), _jsx("p", { className: "mt-1", children: selectedSession.goals_addressed })] })), selectedSession.session_notes && (_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: "Session Notes" }), _jsx("p", { className: "mt-1", children: selectedSession.session_notes })] })), selectedSession.home_exercises_assigned && (_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: "Home Exercises" }), _jsx("p", { className: "mt-1", children: selectedSession.home_exercises_assigned })] })), selectedSession.next_session_scheduled && (_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: "Next Session" }), _jsx("p", { className: "mt-1", children: selectedSession.next_session_scheduled })] })), _jsxs("div", { className: "flex justify-end space-x-4 pt-4", children: [_jsx(Button, { variant: "outline", onClick: () => setSelectedSession(null), children: "Close" }), onEditSession && (_jsx(Button, { onClick: handleEditClick, children: "Edit Session" }))] })] })] }) }) }))] }));
}
