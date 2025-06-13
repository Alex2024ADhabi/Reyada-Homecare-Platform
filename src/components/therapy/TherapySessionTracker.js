import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Plus, RefreshCw, Search, Filter, Edit, Trash2, } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { getAllTherapySessions, deleteTherapySession, } from "@/api/therapy.api";
import TherapySessionForm from "./TherapySessionForm";
import TherapySessionReport from "./TherapySessionReport";
import TherapySessionCalendar from "./TherapySessionCalendar";
export default function TherapySessionTracker() {
    const [therapySessions, setTherapySessions] = useState([]);
    const [filteredSessions, setFilteredSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [therapyTypeFilter, setTherapyTypeFilter] = useState("all-types");
    const [statusFilter, setStatusFilter] = useState("all-statuses");
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingSession, setEditingSession] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [activeTab, setActiveTab] = useState("list");
    // Get unique values for filters
    const therapyTypes = [
        ...new Set(therapySessions.map((session) => session.therapy_type)),
    ];
    const statuses = [
        ...new Set(therapySessions.map((session) => session.status)),
    ];
    useEffect(() => {
        fetchTherapySessions();
    }, []);
    useEffect(() => {
        applyFilters();
    }, [searchTerm, therapyTypeFilter, statusFilter, therapySessions]);
    async function fetchTherapySessions() {
        setIsLoading(true);
        try {
            const data = await getAllTherapySessions();
            setTherapySessions(data);
            setFilteredSessions(data);
        }
        catch (error) {
            console.error("Error fetching therapy sessions:", error);
            toast({
                title: "Error",
                description: "Failed to load therapy sessions. Please try again.",
                variant: "destructive",
            });
        }
        finally {
            setIsLoading(false);
        }
    }
    function applyFilters() {
        let filtered = [...therapySessions];
        if (searchTerm) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            filtered = filtered.filter((session) => session.patient_id
                .toString()
                .toLowerCase()
                .includes(lowerSearchTerm) ||
                session.therapist.toLowerCase().includes(lowerSearchTerm) ||
                session.session_notes?.toLowerCase().includes(lowerSearchTerm));
        }
        if (therapyTypeFilter && therapyTypeFilter !== "all-types") {
            filtered = filtered.filter((session) => session.therapy_type === therapyTypeFilter);
        }
        if (statusFilter && statusFilter !== "all-statuses") {
            filtered = filtered.filter((session) => session.status === statusFilter);
        }
        setFilteredSessions(filtered);
    }
    function resetFilters() {
        setSearchTerm("");
        setTherapyTypeFilter("all-types");
        setStatusFilter("all-statuses");
    }
    async function handleDelete(id) {
        try {
            await deleteTherapySession(id);
            toast({
                title: "Session deleted",
                description: "The therapy session has been deleted successfully.",
            });
            fetchTherapySessions();
            setShowDeleteConfirm(null);
        }
        catch (error) {
            console.error("Error deleting session:", error);
            toast({
                title: "Error",
                description: "Failed to delete the session. Please try again.",
                variant: "destructive",
            });
        }
    }
    function handleFormSuccess() {
        setShowAddForm(false);
        setEditingSession(null);
        fetchTherapySessions();
    }
    function handleEditClick(session) {
        setEditingSession(session);
    }
    function handleCancelEdit() {
        setEditingSession(null);
    }
    function getStatusBadgeVariant(status) {
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
    }
    return (_jsxs("div", { className: "container mx-auto p-4", children: [_jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center mb-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold", children: "Therapy Session Tracker" }), _jsx("p", { className: "text-gray-500", children: "Manage therapy sessions and patient outcomes" })] }), _jsxs("div", { className: "flex space-x-2 mt-4 md:mt-0", children: [_jsxs(Button, { onClick: () => fetchTherapySessions(), variant: "outline", size: "sm", children: [_jsx(RefreshCw, { className: "h-4 w-4 mr-2" }), "Refresh"] }), _jsxs(Dialog, { open: showAddForm, onOpenChange: setShowAddForm, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Schedule Session"] }) }), _jsx(DialogContent, { className: "max-w-4xl", children: _jsx(TherapySessionForm, { onSuccess: handleFormSuccess, onCancel: () => setShowAddForm(false) }) })] })] })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full", children: [_jsxs(TabsList, { className: "mb-4", children: [_jsx(TabsTrigger, { value: "list", children: "Session List" }), _jsx(TabsTrigger, { value: "calendar", children: "Calendar View" }), _jsx(TabsTrigger, { value: "reports", children: "Reports & Analytics" })] }), _jsxs(TabsContent, { value: "list", className: "space-y-4", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Filters" }), _jsx(CardDescription, { children: "Filter therapy sessions by various criteria" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-2 top-2.5 h-4 w-4 text-gray-400" }), _jsx(Input, { placeholder: "Search patient ID or therapist", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "pl-8" })] }), _jsxs(Select, { value: therapyTypeFilter, onValueChange: setTherapyTypeFilter, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Filter by therapy type" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all-types", children: "All Types" }), therapyTypes.map((type) => (_jsx(SelectItem, { value: type, children: type === "PT"
                                                                            ? "Physical Therapy"
                                                                            : type === "OT"
                                                                                ? "Occupational Therapy"
                                                                                : type === "ST"
                                                                                    ? "Speech Therapy"
                                                                                    : type === "RT"
                                                                                        ? "Respiratory Therapy"
                                                                                        : type }, type)))] })] }), _jsxs(Select, { value: statusFilter, onValueChange: setStatusFilter, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Filter by status" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all-statuses", children: "All Statuses" }), statuses.map((status) => (_jsx(SelectItem, { value: status, children: status?.charAt(0).toUpperCase() + status?.slice(1) }, status)))] })] })] }), _jsx("div", { className: "flex justify-end mt-4", children: _jsxs(Button, { variant: "outline", size: "sm", onClick: resetFilters, children: [_jsx(Filter, { className: "h-4 w-4 mr-2" }), "Reset Filters"] }) })] })] }), isLoading ? (_jsx("div", { className: "flex justify-center items-center h-64", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto" }), _jsx("p", { className: "mt-4 text-gray-500", children: "Loading therapy sessions..." })] }) })) : filteredSessions.length === 0 ? (_jsx("div", { className: "flex justify-center items-center h-64", children: _jsxs("div", { className: "text-center", children: [_jsx(AlertCircle, { className: "h-12 w-12 text-gray-400 mx-auto" }), _jsx("h3", { className: "mt-4 text-lg font-medium", children: "No therapy sessions found" }), _jsx("p", { className: "mt-2 text-gray-500", children: searchTerm ||
                                                (therapyTypeFilter && therapyTypeFilter !== "all-types") ||
                                                (statusFilter && statusFilter !== "all-statuses")
                                                ? "Try adjusting your filters"
                                                : "Schedule a therapy session to get started" })] }) })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: filteredSessions.map((session) => (_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs("div", { className: "flex justify-between", children: [_jsxs("div", { children: [_jsxs(CardTitle, { children: ["Patient ID: ", session.patient_id] }), _jsx(CardDescription, { children: session.therapist })] }), _jsxs("div", { className: "flex space-x-1", children: [_jsx(Button, { variant: "ghost", size: "icon", onClick: () => handleEditClick(session), children: _jsx(Edit, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "icon", onClick: () => setShowDeleteConfirm(session._id?.toString() || ""), children: _jsx(Trash2, { className: "h-4 w-4 text-red-500" }) })] })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium", children: "Therapy Type:" }), _jsx("span", { className: "text-sm", children: session.therapy_type === "PT"
                                                                    ? "Physical Therapy"
                                                                    : session.therapy_type === "OT"
                                                                        ? "Occupational Therapy"
                                                                        : session.therapy_type === "ST"
                                                                            ? "Speech Therapy"
                                                                            : session.therapy_type === "RT"
                                                                                ? "Respiratory Therapy"
                                                                                : session.therapy_type })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium", children: "Date & Time:" }), _jsxs("span", { className: "text-sm", children: [session.session_date, " at ", session.session_time] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium", children: "Duration:" }), _jsxs("span", { className: "text-sm", children: [session.duration_minutes, " minutes"] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium", children: "Status:" }), _jsx(Badge, { variant: getStatusBadgeVariant(session.status), children: session.status?.charAt(0).toUpperCase() +
                                                                    session.status?.slice(1) })] }), session.progress_rating && (_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium", children: "Progress Rating:" }), _jsxs("div", { className: "flex items-center", children: [_jsxs("span", { className: "text-sm mr-2", children: [session.progress_rating, "/10"] }), _jsx("div", { className: "w-24 bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-green-600 h-2 rounded-full", style: {
                                                                                width: `${(session.progress_rating / 10) * 100}%`,
                                                                            } }) })] })] })), session.goals_addressed && (_jsxs("div", { children: [_jsx("span", { className: "text-sm font-medium", children: "Goals:" }), _jsx("p", { className: "text-sm mt-1", children: session.goals_addressed })] })), session.next_session_scheduled && (_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium", children: "Next Session:" }), _jsx("span", { className: "text-sm", children: session.next_session_scheduled })] }))] }) })] }, session._id?.toString()))) }))] }), _jsx(TabsContent, { value: "calendar", children: _jsx(TherapySessionCalendar, { sessions: therapySessions, onEditSession: handleEditClick }) }), _jsx(TabsContent, { value: "reports", children: _jsx(TherapySessionReport, { data: therapySessions }) })] }), editingSession && (_jsx(Dialog, { open: !!editingSession, onOpenChange: (open) => !open && setEditingSession(null), children: _jsx(DialogContent, { className: "max-w-4xl", children: _jsx(TherapySessionForm, { initialData: editingSession, onSuccess: handleFormSuccess, onCancel: handleCancelEdit }) }) })), showDeleteConfirm && (_jsx(Dialog, { open: !!showDeleteConfirm, onOpenChange: (open) => !open && setShowDeleteConfirm(null), children: _jsx(DialogContent, { children: _jsxs("div", { className: "p-4", children: [_jsx("h2", { className: "text-xl font-bold mb-4", children: "Confirm Deletion" }), _jsx("p", { className: "mb-6", children: "Are you sure you want to delete this therapy session? This action cannot be undone." }), _jsxs("div", { className: "flex justify-end space-x-4", children: [_jsx(Button, { variant: "outline", onClick: () => setShowDeleteConfirm(null), children: "Cancel" }), _jsx(Button, { variant: "destructive", onClick: () => handleDelete(showDeleteConfirm), children: "Delete" })] })] }) }) }))] }));
}
