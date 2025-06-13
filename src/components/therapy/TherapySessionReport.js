import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
export default function TherapySessionReport({ data, }) {
    const [activeTab, setActiveTab] = useState("summary");
    // Calculate summary statistics
    const totalSessions = data.length;
    const completedSessions = data.filter((session) => session.status === "completed").length;
    const scheduledSessions = data.filter((session) => session.status === "scheduled").length;
    const cancelledSessions = data.filter((session) => session.status === "cancelled").length;
    const noShowSessions = data.filter((session) => session.status === "no-show").length;
    // Calculate completion rate
    const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
    // Calculate average progress rating
    const completedSessionsWithRating = data.filter((session) => session.status === "completed" && session.progress_rating);
    const averageProgressRating = completedSessionsWithRating.length > 0
        ? completedSessionsWithRating.reduce((sum, session) => sum + (session.progress_rating || 0), 0) / completedSessionsWithRating.length
        : 0;
    // Group by therapy type
    const sessionsByType = data.reduce((acc, session) => {
        const type = session.therapy_type;
        if (!acc[type])
            acc[type] = [];
        acc[type].push(session);
        return acc;
    }, {});
    // Group by therapist
    const sessionsByTherapist = data.reduce((acc, session) => {
        const therapist = session.therapist;
        if (!acc[therapist])
            acc[therapist] = [];
        acc[therapist].push(session);
        return acc;
    }, {});
    // Group by patient
    const sessionsByPatient = data.reduce((acc, session) => {
        const patientId = session.patient_id.toString();
        if (!acc[patientId])
            acc[patientId] = [];
        acc[patientId].push(session);
        return acc;
    }, {});
    // Get top patients by number of sessions
    const topPatients = Object.entries(sessionsByPatient)
        .sort((a, b) => b[1].length - a[1].length)
        .slice(0, 5);
    return (_jsx("div", { className: "space-y-6", children: _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [_jsxs(TabsList, { className: "mb-4", children: [_jsx(TabsTrigger, { value: "summary", children: "Summary" }), _jsx(TabsTrigger, { value: "byType", children: "By Therapy Type" }), _jsx(TabsTrigger, { value: "byTherapist", children: "By Therapist" }), _jsx(TabsTrigger, { value: "byPatient", children: "By Patient" })] }), _jsxs(TabsContent, { value: "summary", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { className: "pb-2", children: [_jsx(CardTitle, { className: "text-lg", children: "Total Sessions" }), _jsx(CardDescription, { children: "All therapy sessions" })] }), _jsx(CardContent, { children: _jsx("div", { className: "text-3xl font-bold", children: totalSessions }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "pb-2", children: [_jsx(CardTitle, { className: "text-lg", children: "Completed" }), _jsx(CardDescription, { children: "Sessions completed" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-3xl font-bold text-green-600", children: completedSessions }), _jsxs("div", { className: "text-sm text-gray-500", children: [completionRate.toFixed(1), "% completion rate"] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "pb-2", children: [_jsx(CardTitle, { className: "text-lg", children: "Scheduled" }), _jsx(CardDescription, { children: "Upcoming sessions" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-3xl font-bold text-blue-600", children: scheduledSessions }), _jsxs("div", { className: "text-sm text-gray-500", children: [totalSessions > 0
                                                            ? ((scheduledSessions / totalSessions) * 100).toFixed(1)
                                                            : 0, "% of total"] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "pb-2", children: [_jsx(CardTitle, { className: "text-lg", children: "Average Progress" }), _jsx(CardDescription, { children: "Patient improvement rating" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-3xl font-bold", children: [averageProgressRating.toFixed(1), "/10"] }), _jsxs("div", { className: "text-sm text-gray-500", children: ["Based on ", completedSessionsWithRating.length, " sessions"] })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Session Status Overview" }), _jsx(CardDescription, { children: "Distribution of therapy session statuses" })] }), _jsx(CardContent, { children: _jsx("div", { className: "relative h-60", children: _jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: _jsxs("div", { className: "w-full max-w-md", children: [_jsxs("div", { className: "flex justify-between mb-2", children: [_jsx("span", { children: "Completed" }), _jsxs("span", { children: [completedSessions, " (", totalSessions > 0
                                                                        ? ((completedSessions / totalSessions) * 100).toFixed(1)
                                                                        : 0, "%)"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-4", children: _jsx("div", { className: "bg-green-600 h-4 rounded-full", style: {
                                                                width: `${totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0}%`,
                                                            } }) }), _jsxs("div", { className: "flex justify-between mb-2 mt-4", children: [_jsx("span", { children: "Scheduled" }), _jsxs("span", { children: [scheduledSessions, " (", totalSessions > 0
                                                                        ? ((scheduledSessions / totalSessions) * 100).toFixed(1)
                                                                        : 0, "%)"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-4", children: _jsx("div", { className: "bg-blue-600 h-4 rounded-full", style: {
                                                                width: `${totalSessions > 0 ? (scheduledSessions / totalSessions) * 100 : 0}%`,
                                                            } }) }), _jsxs("div", { className: "flex justify-between mb-2 mt-4", children: [_jsx("span", { children: "Cancelled" }), _jsxs("span", { children: [cancelledSessions, " (", totalSessions > 0
                                                                        ? ((cancelledSessions / totalSessions) * 100).toFixed(1)
                                                                        : 0, "%)"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-4", children: _jsx("div", { className: "bg-red-600 h-4 rounded-full", style: {
                                                                width: `${totalSessions > 0 ? (cancelledSessions / totalSessions) * 100 : 0}%`,
                                                            } }) }), _jsxs("div", { className: "flex justify-between mb-2 mt-4", children: [_jsx("span", { children: "No Show" }), _jsxs("span", { children: [noShowSessions, " (", totalSessions > 0
                                                                        ? ((noShowSessions / totalSessions) * 100).toFixed(1)
                                                                        : 0, "%)"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-4", children: _jsx("div", { className: "bg-yellow-600 h-4 rounded-full", style: {
                                                                width: `${totalSessions > 0 ? (noShowSessions / totalSessions) * 100 : 0}%`,
                                                            } }) })] }) }) }) })] })] }), _jsx(TabsContent, { value: "byType", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Sessions by Therapy Type" }), _jsx(CardDescription, { children: "Distribution of sessions across therapy types" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-6", children: Object.entries(sessionsByType).map(([type, sessions]) => {
                                        const typeLabel = type === "PT"
                                            ? "Physical Therapy"
                                            : type === "OT"
                                                ? "Occupational Therapy"
                                                : type === "ST"
                                                    ? "Speech Therapy"
                                                    : type === "RT"
                                                        ? "Respiratory Therapy"
                                                        : type;
                                        const completedCount = sessions.filter((s) => s.status === "completed").length;
                                        const avgRating = sessions
                                            .filter((s) => s.status === "completed" && s.progress_rating)
                                            .reduce((sum, s) => sum + (s.progress_rating || 0), 0) /
                                            (sessions.filter((s) => s.status === "completed" && s.progress_rating).length || 1);
                                        return (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("h3", { className: "font-medium", children: typeLabel }), _jsxs("span", { children: [sessions.length, " sessions"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-3", children: _jsx("div", { className: "bg-primary h-3 rounded-full", style: {
                                                            width: `${(sessions.length / totalSessions) * 100}%`,
                                                        } }) }), _jsxs("div", { className: "text-sm text-gray-500", children: ["Completed: ", completedCount, " | Avg. Progress:", " ", avgRating.toFixed(1), "/10"] })] }, type));
                                    }) }) })] }) }), _jsx(TabsContent, { value: "byTherapist", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Sessions by Therapist" }), _jsx(CardDescription, { children: "Distribution of sessions by therapist" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-6", children: Object.entries(sessionsByTherapist).map(([therapist, sessions]) => {
                                        const completedCount = sessions.filter((s) => s.status === "completed").length;
                                        const avgRating = sessions
                                            .filter((s) => s.status === "completed" && s.progress_rating)
                                            .reduce((sum, s) => sum + (s.progress_rating || 0), 0) /
                                            (sessions.filter((s) => s.status === "completed" && s.progress_rating).length || 1);
                                        const therapyTypes = [
                                            ...new Set(sessions.map((s) => s.therapy_type)),
                                        ];
                                        return (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("h3", { className: "font-medium", children: therapist }), _jsxs("span", { children: [sessions.length, " sessions"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-3", children: _jsx("div", { className: "bg-primary h-3 rounded-full", style: {
                                                            width: `${(sessions.length / totalSessions) * 100}%`,
                                                        } }) }), _jsxs("div", { className: "text-sm text-gray-500", children: ["Completed: ", completedCount, " | Avg. Progress:", " ", avgRating.toFixed(1), "/10 | Types:", " ", therapyTypes
                                                            .map((t) => t === "PT"
                                                            ? "Physical"
                                                            : t === "OT"
                                                                ? "Occupational"
                                                                : t === "ST"
                                                                    ? "Speech"
                                                                    : t === "RT"
                                                                        ? "Respiratory"
                                                                        : t)
                                                            .join(", ")] })] }, therapist));
                                    }) }) })] }) }), _jsx(TabsContent, { value: "byPatient", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Top Patients by Session Count" }), _jsx(CardDescription, { children: "Patients with the most therapy sessions" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-6", children: topPatients.map(([patientId, sessions]) => {
                                        const completedCount = sessions.filter((s) => s.status === "completed").length;
                                        const avgRating = sessions
                                            .filter((s) => s.status === "completed" && s.progress_rating)
                                            .reduce((sum, s) => sum + (s.progress_rating || 0), 0) /
                                            (sessions.filter((s) => s.status === "completed" && s.progress_rating).length || 1);
                                        const therapyTypes = [
                                            ...new Set(sessions.map((s) => s.therapy_type)),
                                        ];
                                        return (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsxs("h3", { className: "font-medium", children: ["Patient ID: ", patientId] }), _jsxs("span", { children: [sessions.length, " sessions"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-3", children: _jsx("div", { className: "bg-primary h-3 rounded-full", style: {
                                                            width: `${(sessions.length / totalSessions) * 100}%`,
                                                        } }) }), _jsxs("div", { className: "text-sm text-gray-500", children: ["Completed: ", completedCount, " | Avg. Progress:", " ", avgRating.toFixed(1), "/10 | Types:", " ", therapyTypes
                                                            .map((t) => t === "PT"
                                                            ? "Physical"
                                                            : t === "OT"
                                                                ? "Occupational"
                                                                : t === "ST"
                                                                    ? "Speech"
                                                                    : t === "RT"
                                                                        ? "Respiratory"
                                                                        : t)
                                                            .join(", ")] })] }, patientId));
                                    }) }) })] }) })] }) }));
}
