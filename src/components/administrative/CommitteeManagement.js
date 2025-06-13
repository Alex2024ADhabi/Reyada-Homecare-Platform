import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Users, Plus, Calendar, FileText, CheckCircle, Clock, Search, Edit, Trash2, Eye, } from "lucide-react";
import { communicationAPI } from "@/api/communication.api";
const CommitteeManagement = () => {
    const [activeTab, setActiveTab] = useState("committees");
    const [committees, setCommittees] = useState([]);
    const [meetings, setMeetings] = useState([]);
    const [selectedCommittee, setSelectedCommittee] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showCommitteeDialog, setShowCommitteeDialog] = useState(false);
    const [showMeetingDialog, setShowMeetingDialog] = useState(false);
    // Committee Form State
    const [committeeForm, setCommitteeForm] = useState({
        committee_name: "",
        committee_type: "quality_management",
        description: "",
        purpose: "",
        scope: "",
        authority_level: "advisory",
        reporting_to: "",
        meeting_frequency: "monthly",
        members: [],
        responsibilities: [],
        meeting_schedule: {
            day_of_month: 15,
            time: "14:00",
            duration_minutes: 120,
            location: "Conference Room A",
            virtual_option: true,
        },
    });
    // Meeting Form State
    const [meetingForm, setMeetingForm] = useState({
        committee_id: "",
        meeting_title: "",
        meeting_type: "regular",
        meeting_date: "",
        meeting_time: "14:00",
        duration_minutes: 120,
        location: "Conference Room A",
        meeting_format: "hybrid",
        agenda_items: [],
    });
    useEffect(() => {
        loadCommittees();
        loadMeetings();
    }, []);
    const loadCommittees = async () => {
        try {
            setIsLoading(true);
            const committeeData = await communicationAPI.committee.getCommittees();
            setCommittees(committeeData);
        }
        catch (error) {
            console.error("Error loading committees:", error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const loadMeetings = async () => {
        try {
            const meetingData = await communicationAPI.committee.getMeetings();
            setMeetings(meetingData);
        }
        catch (error) {
            console.error("Error loading meetings:", error);
        }
    };
    const createCommittee = async () => {
        try {
            await communicationAPI.committee.createCommittee({
                ...committeeForm,
                created_by: "Dr. Sarah Ahmed",
            });
            setShowCommitteeDialog(false);
            resetCommitteeForm();
            loadCommittees();
        }
        catch (error) {
            console.error("Error creating committee:", error);
        }
    };
    const scheduleMeeting = async () => {
        try {
            await communicationAPI.committee.scheduleMeeting({
                ...meetingForm,
                chairperson: {
                    member_id: "EMP001",
                    name: "Dr. Sarah Ahmed",
                    role: "Head Nurse",
                },
                secretary: {
                    member_id: "EMP006",
                    name: "Layla Al Zahra",
                    role: "Quality Manager",
                },
                attendees: [],
                decisions_made: [],
                action_items: [],
                meeting_notes: "",
                next_meeting: {
                    scheduled_date: "",
                    scheduled_time: "",
                    location: "",
                },
                minutes_approved: false,
                created_by: "Dr. Sarah Ahmed",
            });
            setShowMeetingDialog(false);
            resetMeetingForm();
            loadMeetings();
        }
        catch (error) {
            console.error("Error scheduling meeting:", error);
        }
    };
    const resetCommitteeForm = () => {
        setCommitteeForm({
            committee_name: "",
            committee_type: "quality_management",
            description: "",
            purpose: "",
            scope: "",
            authority_level: "advisory",
            reporting_to: "",
            meeting_frequency: "monthly",
            members: [],
            responsibilities: [],
            meeting_schedule: {
                day_of_month: 15,
                time: "14:00",
                duration_minutes: 120,
                location: "Conference Room A",
                virtual_option: true,
            },
        });
    };
    const resetMeetingForm = () => {
        setMeetingForm({
            committee_id: "",
            meeting_title: "",
            meeting_type: "regular",
            meeting_date: "",
            meeting_time: "14:00",
            duration_minutes: 120,
            location: "Conference Room A",
            meeting_format: "hybrid",
            agenda_items: [],
        });
    };
    const addResponsibility = () => {
        setCommitteeForm({
            ...committeeForm,
            responsibilities: [...committeeForm.responsibilities, ""],
        });
    };
    const removeResponsibility = (index) => {
        const newResponsibilities = committeeForm.responsibilities.filter((_, i) => i !== index);
        setCommitteeForm({
            ...committeeForm,
            responsibilities: newResponsibilities,
        });
    };
    const updateResponsibility = (index, value) => {
        const newResponsibilities = [...committeeForm.responsibilities];
        newResponsibilities[index] = value;
        setCommitteeForm({
            ...committeeForm,
            responsibilities: newResponsibilities,
        });
    };
    const addAgendaItem = () => {
        setMeetingForm({
            ...meetingForm,
            agenda_items: [
                ...meetingForm.agenda_items,
                {
                    item_number: meetingForm.agenda_items.length + 1,
                    title: "",
                    description: "",
                    presenter: "",
                    time_allocated: 30,
                    item_type: "discussion",
                    supporting_documents: [],
                },
            ],
        });
    };
    const removeAgendaItem = (index) => {
        const newItems = meetingForm.agenda_items.filter((_, i) => i !== index);
        setMeetingForm({ ...meetingForm, agenda_items: newItems });
    };
    const updateAgendaItem = (index, field, value) => {
        const newItems = [...meetingForm.agenda_items];
        newItems[index] = { ...newItems[index], [field]: value };
        setMeetingForm({ ...meetingForm, agenda_items: newItems });
    };
    const filteredCommittees = committees.filter((committee) => committee.committee_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
        committee.committee_type.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredMeetings = meetings.filter((meeting) => meeting.meeting_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meeting.committee_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };
    const getStatusColor = (status) => {
        switch (status) {
            case "active":
                return "bg-green-100 text-green-800";
            case "inactive":
                return "bg-gray-100 text-gray-800";
            case "scheduled":
                return "bg-blue-100 text-blue-800";
            case "completed":
                return "bg-green-100 text-green-800";
            case "cancelled":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };
    if (isLoading) {
        return (_jsx("div", { className: "flex items-center justify-center h-96 bg-white", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "Loading committee management..." })] }) }));
    }
    return (_jsxs("div", { className: "p-6 bg-gray-50 min-h-screen", children: [_jsx("div", { className: "mb-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-2xl font-bold text-gray-900 flex items-center", children: [_jsx(Users, { className: "h-6 w-6 mr-3 text-blue-600" }), "Committee Management"] }), _jsx("p", { className: "text-gray-600 mt-1", children: "Manage committees, schedule meetings, and track action items" })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsx(Dialog, { open: showCommitteeDialog, onOpenChange: setShowCommitteeDialog, children: _jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { className: "bg-blue-600 hover:bg-blue-700", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "New Committee"] }) }) }), _jsx(Dialog, { open: showMeetingDialog, onOpenChange: setShowMeetingDialog, children: _jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", children: [_jsx(Calendar, { className: "h-4 w-4 mr-2" }), "Schedule Meeting"] }) }) })] })] }) }), _jsx("div", { className: "mb-6", children: _jsxs("div", { className: "relative max-w-md", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" }), _jsx(Input, { placeholder: "Search committees and meetings...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "pl-10" })] }) }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "space-y-6", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsx(TabsTrigger, { value: "committees", children: "Committees" }), _jsx(TabsTrigger, { value: "meetings", children: "Meetings" }), _jsx(TabsTrigger, { value: "actions", children: "Action Items" }), _jsx(TabsTrigger, { value: "analytics", children: "Analytics" })] }), _jsx(TabsContent, { value: "committees", children: _jsx("div", { className: "grid gap-6", children: filteredCommittees.map((committee) => (_jsxs(Card, { className: "hover:shadow-md transition-shadow", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: "text-lg", children: committee.committee_name }), _jsxs("p", { className: "text-sm text-gray-600 mt-1", children: [committee.committee_type.replace("_", " "), " \u2022", " ", committee.meeting_frequency] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Badge, { className: getStatusColor(committee.status), children: committee.status }), _jsxs(Badge, { variant: "outline", children: [committee.members.length, " members"] })] })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium text-gray-700", children: "Purpose" }), _jsx("p", { className: "text-sm text-gray-900 mt-1", children: committee.purpose })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-sm font-medium text-gray-700", children: "Key Responsibilities" }), _jsxs("div", { className: "mt-1", children: [committee.responsibilities
                                                                    .slice(0, 3)
                                                                    .map((resp, index) => (_jsxs("p", { className: "text-sm text-gray-900", children: ["\u2022 ", resp] }, index))), committee.responsibilities.length > 3 && (_jsxs("p", { className: "text-sm text-gray-500", children: ["+", committee.responsibilities.length - 3, " more"] }))] })] }), _jsxs("div", { className: "flex items-center justify-between pt-2", children: [_jsxs("div", { className: "flex items-center space-x-4 text-sm text-gray-500", children: [_jsxs("span", { className: "flex items-center", children: [_jsx(Calendar, { className: "h-4 w-4 mr-1" }), "Next: ", committee.meeting_schedule.day_of_month, "th at", " ", committee.meeting_schedule.time] }), _jsxs("span", { className: "flex items-center", children: [_jsx(Users, { className: "h-4 w-4 mr-1" }), committee.created_by] })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsx(Button, { variant: "ghost", size: "sm", children: _jsx(Eye, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", children: _jsx(Edit, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => {
                                                                        setMeetingForm({
                                                                            ...meetingForm,
                                                                            committee_id: committee.committee_id,
                                                                        });
                                                                        setShowMeetingDialog(true);
                                                                    }, children: _jsx(Calendar, { className: "h-4 w-4" }) })] })] })] }) })] }, committee.committee_id))) }) }), _jsx(TabsContent, { value: "meetings", children: _jsx("div", { className: "space-y-4", children: filteredMeetings.map((meeting) => (_jsx(Card, { className: "hover:shadow-md transition-shadow", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: meeting.meeting_title }), _jsx(Badge, { className: getStatusColor(meeting.meeting_status), children: meeting.meeting_status }), _jsx(Badge, { variant: "outline", children: meeting.meeting_format })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm text-gray-600", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Committee:" }), " ", meeting.committee_name] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Date:" }), " ", formatDate(meeting.meeting_date), " at", " ", meeting.meeting_time] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Duration:" }), " ", meeting.duration_minutes, " minutes"] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Location:" }), " ", meeting.location] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Chairperson:" }), " ", meeting.chairperson.name] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Attendees:" }), " ", meeting.attendees.length, " participants"] })] })] }), _jsxs("div", { className: "flex flex-col items-end space-y-2", children: [_jsxs("div", { className: "flex space-x-4 text-sm", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-lg font-semibold text-blue-600", children: meeting.agenda_items.length }), _jsx("div", { className: "text-xs text-gray-500", children: "Agenda Items" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-lg font-semibold text-green-600", children: meeting.decisions_made.length }), _jsx("div", { className: "text-xs text-gray-500", children: "Decisions" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-lg font-semibold text-orange-600", children: meeting.action_items.length }), _jsx("div", { className: "text-xs text-gray-500", children: "Actions" })] })] }), _jsxs("div", { className: "flex space-x-1", children: [_jsx(Button, { variant: "ghost", size: "sm", children: _jsx(Eye, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", children: _jsx(FileText, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", children: _jsx(Edit, { className: "h-4 w-4" }) })] })] })] }) }) }, meeting.meeting_id))) }) }), _jsx(TabsContent, { value: "actions", children: _jsx("div", { className: "grid gap-4", children: meetings
                                .flatMap((meeting) => meeting.action_items)
                                .map((action, index) => (_jsx(Card, { className: "hover:shadow-md transition-shadow", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "font-medium text-gray-900", children: action.description }), _jsxs("div", { className: "flex items-center space-x-4 text-sm text-gray-600 mt-1", children: [_jsxs("span", { children: ["Assigned to: ", action.assigned_to] }), _jsxs("span", { children: ["Due: ", formatDate(action.due_date)] }), _jsx(Badge, { variant: action.priority === "high"
                                                                    ? "destructive"
                                                                    : action.priority === "medium"
                                                                        ? "default"
                                                                        : "secondary", children: action.priority })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Badge, { className: getStatusColor(action.status), children: action.status }), _jsx(Button, { variant: "ghost", size: "sm", children: _jsx(Edit, { className: "h-4 w-4" }) })] })] }) }) }, index))) }) }), _jsx(TabsContent, { value: "analytics", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6", children: [_jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Active Committees" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: committees.filter((c) => c.status === "active").length })] }), _jsx(Users, { className: "h-8 w-8 text-blue-600" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Meetings This Month" }), _jsx("p", { className: "text-2xl font-bold text-green-600", children: meetings.length })] }), _jsx(Calendar, { className: "h-8 w-8 text-green-600" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Pending Actions" }), _jsx("p", { className: "text-2xl font-bold text-orange-600", children: meetings
                                                                .flatMap((m) => m.action_items)
                                                                .filter((a) => a.status === "pending").length })] }), _jsx(Clock, { className: "h-8 w-8 text-orange-600" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Completion Rate" }), _jsx("p", { className: "text-2xl font-bold text-purple-600", children: "87.5%" })] }), _jsx(CheckCircle, { className: "h-8 w-8 text-purple-600" })] }) }) })] }) })] }), _jsx(Dialog, { open: showCommitteeDialog, onOpenChange: setShowCommitteeDialog, children: _jsxs(DialogContent, { className: "max-w-4xl max-h-[90vh] overflow-y-auto", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Create New Committee" }) }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "committee_name", children: "Committee Name" }), _jsx(Input, { id: "committee_name", value: committeeForm.committee_name, onChange: (e) => setCommitteeForm({
                                                        ...committeeForm,
                                                        committee_name: e.target.value,
                                                    }), placeholder: "Enter committee name" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "committee_type", children: "Committee Type" }), _jsxs(Select, { value: committeeForm.committee_type, onValueChange: (value) => setCommitteeForm({
                                                        ...committeeForm,
                                                        committee_type: value,
                                                    }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "quality_management", children: "Quality Management" }), _jsx(SelectItem, { value: "infection_control", children: "Infection Control" }), _jsx(SelectItem, { value: "patient_safety", children: "Patient Safety" }), _jsx(SelectItem, { value: "ethics", children: "Ethics" }), _jsx(SelectItem, { value: "governance", children: "Governance" })] })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "description", children: "Description" }), _jsx(Textarea, { id: "description", value: committeeForm.description, onChange: (e) => setCommitteeForm({
                                                ...committeeForm,
                                                description: e.target.value,
                                            }), placeholder: "Enter committee description", rows: 3 })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "purpose", children: "Purpose" }), _jsx(Textarea, { id: "purpose", value: committeeForm.purpose, onChange: (e) => setCommitteeForm({
                                                ...committeeForm,
                                                purpose: e.target.value,
                                            }), placeholder: "Enter committee purpose", rows: 3 })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx(Label, { children: "Responsibilities" }), _jsxs(Button, { type: "button", variant: "outline", size: "sm", onClick: addResponsibility, children: [_jsx(Plus, { className: "h-4 w-4 mr-1" }), "Add Responsibility"] })] }), _jsx("div", { className: "space-y-2", children: committeeForm.responsibilities.map((responsibility, index) => (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Input, { placeholder: "Enter responsibility", value: responsibility, onChange: (e) => updateResponsibility(index, e.target.value) }), _jsx(Button, { type: "button", variant: "ghost", size: "sm", onClick: () => removeResponsibility(index), children: _jsx(Trash2, { className: "h-4 w-4" }) })] }, index))) })] }), _jsxs("div", { className: "flex justify-end space-x-2", children: [_jsx(Button, { variant: "outline", onClick: () => setShowCommitteeDialog(false), children: "Cancel" }), _jsx(Button, { onClick: createCommittee, className: "bg-blue-600 hover:bg-blue-700", children: "Create Committee" })] })] })] }) }), _jsx(Dialog, { open: showMeetingDialog, onOpenChange: setShowMeetingDialog, children: _jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Schedule Meeting" }) }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "committee_select", children: "Select Committee" }), _jsxs(Select, { value: meetingForm.committee_id, onValueChange: (value) => setMeetingForm({ ...meetingForm, committee_id: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Choose a committee" }) }), _jsx(SelectContent, { children: committees.map((committee) => (_jsx(SelectItem, { value: committee.committee_id, children: committee.committee_name }, committee.committee_id))) })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "meeting_title", children: "Meeting Title" }), _jsx(Input, { id: "meeting_title", value: meetingForm.meeting_title, onChange: (e) => setMeetingForm({
                                                ...meetingForm,
                                                meeting_title: e.target.value,
                                            }), placeholder: "Enter meeting title" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "meeting_date", children: "Meeting Date" }), _jsx(Input, { id: "meeting_date", type: "date", value: meetingForm.meeting_date, onChange: (e) => setMeetingForm({
                                                        ...meetingForm,
                                                        meeting_date: e.target.value,
                                                    }) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "meeting_time", children: "Meeting Time" }), _jsx(Input, { id: "meeting_time", type: "time", value: meetingForm.meeting_time, onChange: (e) => setMeetingForm({
                                                        ...meetingForm,
                                                        meeting_time: e.target.value,
                                                    }) })] })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx(Label, { children: "Agenda Items" }), _jsxs(Button, { type: "button", variant: "outline", size: "sm", onClick: addAgendaItem, children: [_jsx(Plus, { className: "h-4 w-4 mr-1" }), "Add Item"] })] }), _jsx("div", { className: "space-y-2", children: meetingForm.agenda_items.map((item, index) => (_jsxs("div", { className: "flex items-center space-x-2 p-2 border rounded", children: [_jsx(Input, { placeholder: "Agenda item title", value: item.title, onChange: (e) => updateAgendaItem(index, "title", e.target.value) }), _jsx(Input, { placeholder: "Presenter", value: item.presenter, onChange: (e) => updateAgendaItem(index, "presenter", e.target.value) }), _jsx(Input, { type: "number", placeholder: "Minutes", value: item.time_allocated, onChange: (e) => updateAgendaItem(index, "time_allocated", parseInt(e.target.value)), className: "w-20" }), _jsx(Button, { type: "button", variant: "ghost", size: "sm", onClick: () => removeAgendaItem(index), children: _jsx(Trash2, { className: "h-4 w-4" }) })] }, index))) })] }), _jsxs("div", { className: "flex justify-end space-x-2", children: [_jsx(Button, { variant: "outline", onClick: () => setShowMeetingDialog(false), children: "Cancel" }), _jsxs(Button, { onClick: scheduleMeeting, className: "bg-blue-600 hover:bg-blue-700", children: [_jsx(Calendar, { className: "h-4 w-4 mr-2" }), "Schedule Meeting"] })] })] })] }) })] }));
};
export default CommitteeManagement;
