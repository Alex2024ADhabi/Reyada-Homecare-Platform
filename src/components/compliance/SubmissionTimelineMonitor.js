import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, AlertTriangle, CheckCircle, XCircle, Bell, Timer, Send, RefreshCw, Zap, } from "lucide-react";
import { cn } from "@/lib/utils";
const SubmissionTimelineMonitor = ({ className = "", }) => {
    const [submissions, setSubmissions] = useState([]);
    const [reminderSettings, setReminderSettings] = useState({
        enabled: true,
        intervals: [24, 12, 6, 2, 1],
        dailyDeadlineAlert: true,
        gracePeriodAlert: true,
        escalationEnabled: true,
    });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("timeline");
    const [currentTime, setCurrentTime] = useState(new Date());
    const [refreshing, setRefreshing] = useState(false);
    useEffect(() => {
        loadSubmissions();
        const timer = setInterval(() => {
            setCurrentTime(new Date());
            updateSubmissionStatuses();
        }, 60000); // Update every minute
        return () => clearInterval(timer);
    }, []);
    const loadSubmissions = async () => {
        try {
            setLoading(true);
            // Mock data - replace with actual API call
            const mockSubmissions = [
                {
                    id: "sub-001",
                    claimId: "CLM-2024-001",
                    patientName: "Ahmed Al Mansouri",
                    claimType: "MSC",
                    submissionDate: "2024-03-20",
                    deadlineDate: "2024-03-21",
                    deadlineTime: "08:00",
                    status: "pending",
                    gracePeriodEnd: "2024-03-21T10:00:00Z",
                    hoursRemaining: 6,
                    priority: "high",
                    remindersSent: 2,
                    lastReminderSent: "2024-03-20T14:00:00Z",
                    notes: [
                        "MSC claim requires submission by 8:00 AM",
                        "Grace period until 10:00 AM",
                    ],
                },
                {
                    id: "sub-002",
                    claimId: "CLM-2024-002",
                    patientName: "Fatima Al Zahra",
                    claimType: "Wheelchair",
                    submissionDate: "2024-03-19",
                    deadlineDate: "2024-03-20",
                    deadlineTime: "17:00",
                    status: "submitted",
                    hoursRemaining: 0,
                    priority: "medium",
                    remindersSent: 1,
                    submittedBy: "Dr. Sarah Ahmed",
                    submissionTime: "2024-03-20T15:30:00Z",
                    notes: ["Wheelchair pre-approval submitted successfully"],
                },
                {
                    id: "sub-003",
                    claimId: "CLM-2024-003",
                    patientName: "Mohammed Hassan",
                    claimType: "Regular",
                    submissionDate: "2024-03-18",
                    deadlineDate: "2024-03-19",
                    deadlineTime: "23:59",
                    status: "overdue",
                    hoursRemaining: -18,
                    priority: "critical",
                    remindersSent: 4,
                    lastReminderSent: "2024-03-19T22:00:00Z",
                    notes: ["Claim is overdue", "Escalation required"],
                },
                {
                    id: "sub-004",
                    claimId: "CLM-2024-004",
                    patientName: "Aisha Abdullah",
                    claimType: "MSC",
                    submissionDate: "2024-03-21",
                    deadlineDate: "2024-03-22",
                    deadlineTime: "08:00",
                    status: "grace_period",
                    gracePeriodEnd: "2024-03-22T10:00:00Z",
                    hoursRemaining: 1,
                    priority: "critical",
                    remindersSent: 3,
                    lastReminderSent: "2024-03-22T07:00:00Z",
                    notes: ["Currently in grace period", "Must submit within 2 hours"],
                },
                {
                    id: "sub-005",
                    claimId: "CLM-2024-005",
                    patientName: "Omar Al Rashid",
                    claimType: "Emergency",
                    submissionDate: "2024-03-22",
                    deadlineDate: "2024-03-23",
                    deadlineTime: "12:00",
                    status: "pending",
                    hoursRemaining: 28,
                    priority: "medium",
                    remindersSent: 0,
                    notes: ["Emergency claim - extended deadline"],
                },
            ];
            setSubmissions(mockSubmissions);
        }
        catch (error) {
            console.error("Error loading submissions:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const updateSubmissionStatuses = () => {
        setSubmissions((prev) => prev.map((submission) => {
            const now = new Date();
            const deadline = new Date(`${submission.deadlineDate}T${submission.deadlineTime}:00`);
            const gracePeriodEnd = submission.gracePeriodEnd
                ? new Date(submission.gracePeriodEnd)
                : null;
            const hoursRemaining = Math.round((deadline.getTime() - now.getTime()) / (1000 * 60 * 60));
            let status = submission.status;
            let priority = submission.priority;
            if (submission.status !== "submitted") {
                if (now > deadline) {
                    if (gracePeriodEnd && now <= gracePeriodEnd) {
                        status = "grace_period";
                        priority = "critical";
                    }
                    else if (gracePeriodEnd && now > gracePeriodEnd) {
                        status = "expired";
                        priority = "critical";
                    }
                    else {
                        status = "overdue";
                        priority = "critical";
                    }
                }
                else {
                    status = "pending";
                    if (hoursRemaining <= 2)
                        priority = "critical";
                    else if (hoursRemaining <= 6)
                        priority = "high";
                    else if (hoursRemaining <= 24)
                        priority = "medium";
                    else
                        priority = "low";
                }
            }
            return {
                ...submission,
                hoursRemaining,
                status,
                priority,
            };
        }));
    };
    const refreshData = async () => {
        setRefreshing(true);
        await loadSubmissions();
        setRefreshing(false);
    };
    const getStatusColor = (status) => {
        switch (status) {
            case "submitted":
                return "bg-green-100 text-green-800";
            case "pending":
                return "bg-blue-100 text-blue-800";
            case "grace_period":
                return "bg-orange-100 text-orange-800";
            case "overdue":
                return "bg-red-100 text-red-800";
            case "expired":
                return "bg-gray-100 text-gray-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };
    const getPriorityColor = (priority) => {
        switch (priority) {
            case "critical":
                return "text-red-600";
            case "high":
                return "text-orange-600";
            case "medium":
                return "text-yellow-600";
            case "low":
                return "text-green-600";
            default:
                return "text-gray-600";
        }
    };
    const formatTimeRemaining = (hours) => {
        if (hours < 0) {
            return `${Math.abs(hours)}h overdue`;
        }
        if (hours < 24) {
            return `${hours}h remaining`;
        }
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        return `${days}d ${remainingHours}h remaining`;
    };
    const sendReminder = async (submissionId) => {
        // Mock reminder sending
        setSubmissions((prev) => prev.map((sub) => sub.id === submissionId
            ? {
                ...sub,
                remindersSent: sub.remindersSent + 1,
                lastReminderSent: new Date().toISOString(),
            }
            : sub));
    };
    const markAsSubmitted = async (submissionId) => {
        setSubmissions((prev) => prev.map((sub) => sub.id === submissionId
            ? {
                ...sub,
                status: "submitted",
                submittedBy: "Current User",
                submissionTime: new Date().toISOString(),
            }
            : sub));
    };
    const criticalSubmissions = submissions.filter((sub) => sub.priority === "critical" && sub.status !== "submitted");
    const overdueSubmissions = submissions.filter((sub) => sub.status === "overdue" || sub.status === "expired");
    const gracePeriodSubmissions = submissions.filter((sub) => sub.status === "grace_period");
    const pendingSubmissions = submissions.filter((sub) => sub.status === "pending");
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center h-96 bg-white", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "Loading submission timeline..." })] }) }));
    }
    return (_jsxs("div", { className: cn("space-y-6 bg-gray-50 min-h-screen p-6", className), children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-2xl font-bold text-gray-900 flex items-center", children: [_jsx(Clock, { className: "h-6 w-6 mr-3 text-blue-600" }), "Submission Timeline Monitor"] }), _jsx("p", { className: "text-gray-600 mt-1", children: "Track submission deadlines, 8:00 AM alerts, and grace periods" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("div", { className: "text-sm text-gray-600", children: ["Last updated: ", currentTime.toLocaleTimeString()] }), _jsxs(Button, { onClick: refreshData, disabled: refreshing, className: "bg-blue-600 hover:bg-blue-700", children: [_jsx(RefreshCw, { className: cn("h-4 w-4 mr-2", refreshing && "animate-spin") }), "Refresh"] })] })] }), criticalSubmissions.length > 0 && (_jsxs(Alert, { variant: "compliance-critical", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "Critical Submission Deadlines" }), _jsxs(AlertDescription, { children: [criticalSubmissions.length, " submission(s) require immediate attention.", gracePeriodSubmissions.length > 0 &&
                                ` ${gracePeriodSubmissions.length} in grace period.`] })] })), currentTime.getHours() === 8 && currentTime.getMinutes() < 30 && (_jsxs(Alert, { variant: "doh-requirement", children: [_jsx(Bell, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "Daily 8:00 AM Deadline Alert" }), _jsx(AlertDescription, { children: "MSC claims must be submitted by 8:00 AM daily. Check pending MSC submissions." })] })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Pending" }), _jsx("p", { className: "text-2xl font-bold text-blue-600", children: pendingSubmissions.length })] }), _jsx(Timer, { className: "h-8 w-8 text-blue-500" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Grace Period" }), _jsx("p", { className: "text-2xl font-bold text-orange-600", children: gracePeriodSubmissions.length })] }), _jsx(Zap, { className: "h-8 w-8 text-orange-500" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Overdue" }), _jsx("p", { className: "text-2xl font-bold text-red-600", children: overdueSubmissions.length })] }), _jsx(XCircle, { className: "h-8 w-8 text-red-500" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Submitted Today" }), _jsx("p", { className: "text-2xl font-bold text-green-600", children: submissions.filter((sub) => sub.status === "submitted" &&
                                                    sub.submissionTime &&
                                                    new Date(sub.submissionTime).toDateString() ===
                                                        new Date().toDateString()).length })] }), _jsx(CheckCircle, { className: "h-8 w-8 text-green-500" })] }) }) })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsx(TabsTrigger, { value: "timeline", children: "Timeline" }), _jsx(TabsTrigger, { value: "critical", children: "Critical" }), _jsx(TabsTrigger, { value: "reminders", children: "Reminders" }), _jsx(TabsTrigger, { value: "analytics", children: "Analytics" })] }), _jsx(TabsContent, { value: "timeline", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Submission Timeline" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: submissions
                                            .sort((a, b) => a.hoursRemaining - b.hoursRemaining)
                                            .map((submission) => (_jsx(Card, { className: cn("transition-all hover:shadow-md", submission.priority === "critical" &&
                                                "border-l-4 border-l-red-500", submission.status === "grace_period" &&
                                                "border-l-4 border-l-orange-500"), children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [_jsx("h3", { className: "font-semibold", children: submission.patientName }), _jsx(Badge, { className: getStatusColor(submission.status), children: submission.status.replace("_", " ") }), _jsx(Badge, { variant: "outline", children: submission.claimType }), _jsx("span", { className: cn("text-sm font-medium", getPriorityColor(submission.priority)), children: submission.priority.toUpperCase() })] }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Claim ID:" }), _jsx("p", { className: "font-medium", children: submission.claimId })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Deadline:" }), _jsxs("p", { className: "font-medium", children: [new Date(submission.deadlineDate).toLocaleDateString(), " ", submission.deadlineTime] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Time Remaining:" }), _jsx("p", { className: cn("font-medium", submission.hoursRemaining < 0
                                                                                        ? "text-red-600"
                                                                                        : submission.hoursRemaining <= 2
                                                                                            ? "text-orange-600"
                                                                                            : "text-green-600"), children: formatTimeRemaining(submission.hoursRemaining) })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Reminders Sent:" }), _jsx("p", { className: "font-medium", children: submission.remindersSent })] })] }), submission.gracePeriodEnd &&
                                                                    submission.status === "grace_period" && (_jsx("div", { className: "mb-3 p-2 bg-orange-50 rounded", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Zap, { className: "h-4 w-4 text-orange-600" }), _jsxs("span", { className: "text-sm text-orange-800", children: ["Grace period ends:", " ", new Date(submission.gracePeriodEnd).toLocaleString()] })] }) })), submission.notes.length > 0 && (_jsxs("div", { className: "mt-3", children: [_jsx("h4", { className: "font-medium text-gray-800 mb-1", children: "Notes:" }), _jsx("ul", { className: "text-sm text-gray-600 space-y-1", children: submission.notes.map((note, index) => (_jsxs("li", { children: ["\u2022 ", note] }, index))) })] }))] }), _jsx("div", { className: "flex flex-col space-y-2", children: submission.status === "pending" ||
                                                                submission.status === "grace_period" ? (_jsxs(_Fragment, { children: [_jsxs(Button, { size: "sm", onClick: () => markAsSubmitted(submission.id), className: "bg-green-600 hover:bg-green-700", children: [_jsx(Send, { className: "h-3 w-3 mr-1" }), "Mark Submitted"] }), _jsxs(Button, { size: "sm", variant: "outline", onClick: () => sendReminder(submission.id), children: [_jsx(Bell, { className: "h-3 w-3 mr-1" }), "Send Reminder"] })] })) : submission.status === "submitted" ? (_jsxs("div", { className: "text-center", children: [_jsx(CheckCircle, { className: "h-6 w-6 text-green-600 mx-auto mb-1" }), _jsxs("p", { className: "text-xs text-gray-600", children: ["Submitted by ", submission.submittedBy] }), _jsx("p", { className: "text-xs text-gray-500", children: submission.submissionTime &&
                                                                            new Date(submission.submissionTime).toLocaleString() })] })) : (_jsx(Button, { size: "sm", variant: "outline", children: "View Details" })) })] }) }) }, submission.id))) }) })] }) }), _jsx(TabsContent, { value: "critical", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Critical Submissions" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: criticalSubmissions.length === 0 ? (_jsxs("div", { className: "text-center py-8 text-gray-500", children: [_jsx(CheckCircle, { className: "h-12 w-12 mx-auto mb-4 text-green-500" }), _jsx("p", { children: "No critical submissions at this time" })] })) : (criticalSubmissions.map((submission) => (_jsx(Card, { className: "border-l-4 border-l-red-500", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h3", { className: "font-semibold text-red-800", children: [submission.patientName, " - ", submission.claimId] }), _jsxs("p", { className: "text-sm text-gray-600", children: [submission.claimType, " |", " ", formatTimeRemaining(submission.hoursRemaining)] }), _jsx(Badge, { className: getStatusColor(submission.status), children: submission.status.replace("_", " ") })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsx(Button, { size: "sm", onClick: () => markAsSubmitted(submission.id), className: "bg-green-600 hover:bg-green-700", children: "Submit Now" }), _jsx(Button, { size: "sm", variant: "outline", onClick: () => sendReminder(submission.id), children: "Send Alert" })] })] }) }) }, submission.id)))) }) })] }) }), _jsx(TabsContent, { value: "reminders", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Reminder System" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-6", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Reminder Settings" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { children: "Automated Reminders" }), _jsx(Badge, { className: reminderSettings.enabled
                                                                                    ? "bg-green-100 text-green-800"
                                                                                    : "bg-red-100 text-red-800", children: reminderSettings.enabled ? "Enabled" : "Disabled" })] }), _jsxs("div", { children: [_jsx("span", { className: "text-sm text-gray-600", children: "Reminder Intervals:" }), _jsx("div", { className: "flex flex-wrap gap-2 mt-1", children: reminderSettings.intervals.map((interval) => (_jsxs(Badge, { variant: "outline", children: [interval, "h before"] }, interval))) })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { children: "Daily 8:00 AM Alert" }), _jsx(Badge, { className: reminderSettings.dailyDeadlineAlert
                                                                                    ? "bg-green-100 text-green-800"
                                                                                    : "bg-red-100 text-red-800", children: reminderSettings.dailyDeadlineAlert
                                                                                    ? "Active"
                                                                                    : "Inactive" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { children: "Grace Period Alerts" }), _jsx(Badge, { className: reminderSettings.gracePeriodAlert
                                                                                    ? "bg-green-100 text-green-800"
                                                                                    : "bg-red-100 text-red-800", children: reminderSettings.gracePeriodAlert
                                                                                    ? "Active"
                                                                                    : "Inactive" })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Recent Reminders" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: submissions
                                                                    .filter((sub) => sub.lastReminderSent)
                                                                    .sort((a, b) => new Date(b.lastReminderSent).getTime() -
                                                                    new Date(a.lastReminderSent).getTime())
                                                                    .slice(0, 5)
                                                                    .map((submission) => (_jsxs("div", { className: "flex items-center justify-between p-2 bg-gray-50 rounded", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium text-sm", children: submission.patientName }), _jsx("p", { className: "text-xs text-gray-600", children: submission.lastReminderSent &&
                                                                                        new Date(submission.lastReminderSent).toLocaleString() })] }), _jsxs(Badge, { variant: "outline", children: [submission.remindersSent, " sent"] })] }, submission.id))) }) })] })] }) }) })] }) }), _jsx(TabsContent, { value: "analytics", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Submission Performance" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { children: "On-Time Submissions" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Progress, { value: 85, className: "w-20 h-2" }), _jsx("span", { className: "text-sm font-medium", children: "85%" })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { children: "Grace Period Usage" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Progress, { value: 12, className: "w-20 h-2" }), _jsx("span", { className: "text-sm font-medium", children: "12%" })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { children: "Overdue Rate" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Progress, { value: 3, className: "w-20 h-2" }), _jsx("span", { className: "text-sm font-medium", children: "3%" })] })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Claim Type Distribution" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: ["MSC", "Regular", "Emergency", "Wheelchair"].map((type) => {
                                                    const count = submissions.filter((sub) => sub.claimType === type).length;
                                                    const percentage = Math.round((count / submissions.length) * 100);
                                                    return (_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { children: type }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Progress, { value: percentage, className: "w-20 h-2" }), _jsx("span", { className: "text-sm font-medium", children: count })] })] }, type));
                                                }) }) })] })] }) })] })] }));
};
export default SubmissionTimelineMonitor;
