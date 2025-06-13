import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Calendar, Clock, Users, CheckCircle, XCircle, Plus, Edit, Eye, Activity, } from "lucide-react";
import { getDailyPlans, createDailyPlan, approveDailyPlan, getDailyUpdates, createDailyUpdate, getTodaysActivePlans, getPlansRequiringAttention, } from "@/api/daily-planning.api";
import { useOfflineSync } from "@/hooks/useOfflineSync";
export default function DailyPlanningDashboard({ teamLead = "Dr. Sarah Ahmed", department = "Nursing", }) {
    const [plans, setPlans] = useState([]);
    const [updates, setUpdates] = useState([]);
    const [todaysPlans, setTodaysPlans] = useState([]);
    const [attentionItems, setAttentionItems] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showUpdateDialog, setShowUpdateDialog] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [newPlan, setNewPlan] = useState({
        date: selectedDate,
        shift: "Morning",
        team_lead: teamLead,
        department,
        total_patients: 0,
        high_priority_patients: 0,
        medium_priority_patients: 0,
        low_priority_patients: 0,
        staff_assigned: [],
        resource_allocation: {
            vehicles: 0,
            medical_equipment: [],
            medications: "",
            emergency_supplies: "",
        },
        risk_assessment: {
            weather_conditions: "Clear",
            traffic_conditions: "Normal",
            patient_acuity_level: "Medium",
            staff_availability: "Full",
            equipment_status: "All functional",
        },
        objectives: [],
        contingency_plans: [],
        status: "draft",
        created_by: teamLead,
    });
    const [newUpdate, setNewUpdate] = useState({
        update_type: "progress",
        patients_completed: 0,
        patients_remaining: 0,
        issues_encountered: [],
        resource_updates: [],
        staff_updates: [],
        performance_metrics: {
            efficiency_rate: 0,
            quality_score: 0,
            patient_satisfaction: 0,
            safety_incidents: 0,
        },
        next_actions: [],
        escalation_required: false,
        status: "draft",
    });
    const { isOnline } = useOfflineSync();
    useEffect(() => {
        loadDashboardData();
    }, [selectedDate]);
    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [plansData, todaysData, attentionData] = await Promise.all([
                getDailyPlans({
                    date_from: selectedDate,
                    date_to: selectedDate,
                    department,
                }),
                getTodaysActivePlans(),
                getPlansRequiringAttention(),
            ]);
            setPlans(plansData);
            setTodaysPlans(todaysData);
            setAttentionItems(attentionData);
        }
        catch (error) {
            console.error("Error loading dashboard data:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const loadUpdates = async (planId) => {
        try {
            const updatesData = await getDailyUpdates(planId);
            setUpdates(updatesData);
        }
        catch (error) {
            console.error("Error loading updates:", error);
        }
    };
    const handleCreatePlan = async () => {
        try {
            setLoading(true);
            await createDailyPlan(newPlan);
            setShowCreateDialog(false);
            setNewPlan({
                date: selectedDate,
                shift: "Morning",
                team_lead: teamLead,
                department,
                total_patients: 0,
                high_priority_patients: 0,
                medium_priority_patients: 0,
                low_priority_patients: 0,
                staff_assigned: [],
                resource_allocation: {
                    vehicles: 0,
                    medical_equipment: [],
                    medications: "",
                    emergency_supplies: "",
                },
                risk_assessment: {
                    weather_conditions: "Clear",
                    traffic_conditions: "Normal",
                    patient_acuity_level: "Medium",
                    staff_availability: "Full",
                    equipment_status: "All functional",
                },
                objectives: [],
                contingency_plans: [],
                status: "draft",
                created_by: teamLead,
            });
            await loadDashboardData();
        }
        catch (error) {
            console.error("Error creating plan:", error);
            alert(error instanceof Error ? error.message : "Failed to create plan");
        }
        finally {
            setLoading(false);
        }
    };
    const handleApprovePlan = async (id) => {
        try {
            setLoading(true);
            await approveDailyPlan(id, teamLead);
            await loadDashboardData();
        }
        catch (error) {
            console.error("Error approving plan:", error);
            alert(error instanceof Error ? error.message : "Failed to approve plan");
        }
        finally {
            setLoading(false);
        }
    };
    const handleCreateUpdate = async () => {
        if (!selectedPlan)
            return;
        try {
            setLoading(true);
            await createDailyUpdate({
                ...newUpdate,
                plan_id: selectedPlan.plan_id,
                date: selectedDate,
                update_time: new Date().toTimeString().split(" ")[0].substring(0, 5),
                updated_by: teamLead,
            });
            setShowUpdateDialog(false);
            setNewUpdate({
                update_type: "progress",
                patients_completed: 0,
                patients_remaining: 0,
                issues_encountered: [],
                resource_updates: [],
                staff_updates: [],
                performance_metrics: {
                    efficiency_rate: 0,
                    quality_score: 0,
                    patient_satisfaction: 0,
                    safety_incidents: 0,
                },
                next_actions: [],
                escalation_required: false,
                status: "draft",
            });
            await loadUpdates(selectedPlan.plan_id);
        }
        catch (error) {
            console.error("Error creating update:", error);
            alert(error instanceof Error ? error.message : "Failed to create update");
        }
        finally {
            setLoading(false);
        }
    };
    const getStatusBadge = (status) => {
        const variants = {
            active: "default",
            draft: "outline",
            completed: "secondary",
            cancelled: "destructive",
        };
        const icons = {
            active: _jsx(CheckCircle, { className: "w-3 h-3" }),
            draft: _jsx(Clock, { className: "w-3 h-3" }),
            completed: _jsx(CheckCircle, { className: "w-3 h-3" }),
            cancelled: _jsx(XCircle, { className: "w-3 h-3" }),
        };
        return (_jsxs(Badge, { variant: variants[status] || "outline", className: "flex items-center gap-1", children: [icons[status], status] }));
    };
    const getPriorityBadge = (level) => {
        const variants = {
            Critical: "destructive",
            High: "default",
            Medium: "secondary",
            Low: "secondary",
        };
        return _jsx(Badge, { variant: variants[level] || "secondary", children: level });
    };
    return (_jsx("div", { className: "min-h-screen bg-gray-50 p-6", children: _jsxs("div", { className: "max-w-7xl mx-auto space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Daily Planning Dashboard" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Plan and monitor daily operations and staff assignments" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Input, { type: "date", value: selectedDate, onChange: (e) => setSelectedDate(e.target.value), className: "w-auto" }), _jsxs(Dialog, { open: showCreateDialog, onOpenChange: setShowCreateDialog, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "New Plan"] }) }), _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Create Daily Plan" }), _jsx(DialogDescription, { children: "Create a new daily operational plan for your team" })] }), _jsxs("div", { className: "grid gap-4 py-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "shift", children: "Shift" }), _jsxs(Select, { value: newPlan.shift, onValueChange: (value) => setNewPlan({ ...newPlan, shift: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "Morning", children: "Morning" }), _jsx(SelectItem, { value: "Afternoon", children: "Afternoon" }), _jsx(SelectItem, { value: "Night", children: "Night" }), _jsx(SelectItem, { value: "Full Day", children: "Full Day" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "totalPatients", children: "Total Patients" }), _jsx(Input, { id: "totalPatients", type: "number", value: newPlan.total_patients, onChange: (e) => setNewPlan({
                                                                                ...newPlan,
                                                                                total_patients: parseInt(e.target.value) || 0,
                                                                            }) })] })] }), _jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "highPriority", children: "High Priority" }), _jsx(Input, { id: "highPriority", type: "number", value: newPlan.high_priority_patients, onChange: (e) => setNewPlan({
                                                                                ...newPlan,
                                                                                high_priority_patients: parseInt(e.target.value) || 0,
                                                                            }) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "mediumPriority", children: "Medium Priority" }), _jsx(Input, { id: "mediumPriority", type: "number", value: newPlan.medium_priority_patients, onChange: (e) => setNewPlan({
                                                                                ...newPlan,
                                                                                medium_priority_patients: parseInt(e.target.value) || 0,
                                                                            }) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "lowPriority", children: "Low Priority" }), _jsx(Input, { id: "lowPriority", type: "number", value: newPlan.low_priority_patients, onChange: (e) => setNewPlan({
                                                                                ...newPlan,
                                                                                low_priority_patients: parseInt(e.target.value) || 0,
                                                                            }) })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "objectives", children: "Objectives" }), _jsx(Textarea, { id: "objectives", placeholder: "Enter objectives (one per line)", value: newPlan.objectives?.join("\n") || "", onChange: (e) => setNewPlan({
                                                                        ...newPlan,
                                                                        objectives: e.target.value
                                                                            .split("\n")
                                                                            .filter(Boolean),
                                                                    }) })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setShowCreateDialog(false), children: "Cancel" }), _jsx(Button, { onClick: handleCreatePlan, disabled: loading, children: "Create Plan" })] })] })] })] })] }), attentionItems && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200", children: [_jsx("h3", { className: "text-lg font-semibold text-blue-900 mb-3", children: "\uD83C\uDFE5 Framework Matrix - Clinical Operations Status" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs(Card, { className: "border-blue-200 bg-blue-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-blue-800", children: "Framework Alerts" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-blue-900", children: attentionItems.framework_matrix_alerts?.length || 0 }), _jsx("p", { className: "text-xs text-blue-600", children: "Clinical workflow issues" })] })] }), _jsxs(Card, { className: "border-green-200 bg-green-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-green-800", children: "Operations Status" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-green-900", children: attentionItems.clinical_operations_status?.length || 0 }), _jsx("p", { className: "text-xs text-green-600", children: "Function monitoring" })] })] }), _jsxs(Card, { className: "border-purple-200 bg-purple-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-purple-800", children: "Patient Referrals" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-purple-900", children: attentionItems.framework_matrix_alerts?.filter((alert) => alert.function === "Patient Referrals").length || 0 }), _jsx("p", { className: "text-xs text-purple-600", children: "Referral processing" })] })] }), _jsxs(Card, { className: "border-teal-200 bg-teal-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-teal-800", children: "Assessment Status" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-teal-900", children: attentionItems.framework_matrix_alerts?.filter((alert) => alert.function === "Patient Assessment").length || 0 }), _jsx("p", { className: "text-xs text-teal-600", children: "Assessment workflow" })] })] })] })] }), _jsxs("div", { className: "bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-lg border border-gray-200", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-3", children: "\uD83D\uDCCB Administrative Operations Monitoring" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs(Card, { className: "border-orange-200 bg-orange-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-orange-800", children: "Overdue Updates" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-orange-900", children: attentionItems.overdue_updates?.length || 0 }), _jsx("p", { className: "text-xs text-orange-600", children: "Plans need status updates" })] })] }), _jsxs(Card, { className: "border-red-200 bg-red-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-red-800", children: "Critical Issues" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-red-900", children: attentionItems.critical_issues?.length || 0 }), _jsx("p", { className: "text-xs text-red-600", children: "Unresolved critical issues" })] })] }), _jsxs(Card, { className: "border-blue-200 bg-blue-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-blue-800", children: "Pending Approvals" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-blue-900", children: attentionItems.pending_approvals?.length || 0 }), _jsx("p", { className: "text-xs text-blue-600", children: "Plans awaiting approval" })] })] }), _jsxs(Card, { className: "border-purple-200 bg-purple-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-purple-800", children: "End-of-Day Alerts" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-purple-900", children: attentionItems.end_of_day_alerts?.length || 0 }), _jsx("p", { className: "text-xs text-purple-600", children: "Automated preparation alerts" })] })] }), _jsxs(Card, { className: "border-yellow-200 bg-yellow-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-yellow-800", children: "Predictive Issues" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-yellow-900", children: attentionItems.predictive_issues?.length || 0 }), _jsx("p", { className: "text-xs text-yellow-600", children: "AI-detected potential issues" })] })] }), _jsxs(Card, { className: "border-indigo-200 bg-indigo-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-indigo-800", children: "Compliance Violations" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-indigo-900", children: attentionItems.compliance_violations?.length || 0 }), _jsx("p", { className: "text-xs text-indigo-600", children: "DOH/JAWDA compliance issues" })] })] }), _jsxs(Card, { className: "border-green-200 bg-green-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-green-800", children: "Resource Conflicts" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-green-900", children: attentionItems.resource_conflicts?.length || 0 }), _jsx("p", { className: "text-xs text-green-600", children: "Advanced optimization alerts" })] })] }), _jsxs(Card, { className: "border-gray-200 bg-gray-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-gray-800", children: "Late Submissions" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-gray-900", children: attentionItems.late_submissions?.length || 0 }), _jsx("p", { className: "text-xs text-gray-600", children: "After 8:00 AM deadline" })] })] })] })] })] })), _jsxs(Tabs, { defaultValue: "plans", className: "space-y-6", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-6", children: [_jsx(TabsTrigger, { value: "plans", children: "Daily Plans" }), _jsx(TabsTrigger, { value: "active", children: "Active Plans" }), _jsx(TabsTrigger, { value: "framework", children: "Framework Matrix" }), _jsx(TabsTrigger, { value: "updates", children: "Updates" }), _jsx(TabsTrigger, { value: "analytics", children: "Analytics" }), _jsx(TabsTrigger, { value: "compliance", children: "DOH Compliance" })] }), _jsx(TabsContent, { value: "plans", className: "space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Daily Plans" }), _jsxs(CardDescription, { children: [plans.length, " plans for ", selectedDate] })] }), _jsx(CardContent, { children: _jsx("div", { className: "overflow-x-auto", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Plan ID" }), _jsx(TableHead, { children: "Shift" }), _jsx(TableHead, { children: "Team Lead" }), _jsx(TableHead, { children: "Patients" }), _jsx(TableHead, { children: "Staff" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { children: "Actions" })] }) }), _jsx(TableBody, { children: loading ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 7, className: "text-center py-4", children: "Loading..." }) })) : plans.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 7, className: "text-center py-4 text-gray-500", children: "No plans found for this date" }) })) : (plans.map((plan) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: plan.plan_id }), _jsx(TableCell, { children: plan.shift }), _jsx(TableCell, { children: plan.team_lead }), _jsx(TableCell, { children: _jsxs("div", { children: [_jsxs("div", { className: "font-medium", children: [plan.total_patients, " total"] }), _jsxs("div", { className: "text-xs text-gray-500", children: [plan.high_priority_patients, " high,", " ", plan.medium_priority_patients, " medium,", " ", plan.low_priority_patients, " low"] })] }) }), _jsx(TableCell, { children: _jsxs("div", { className: "text-sm", children: [plan.staff_assigned.length, " assigned"] }) }), _jsx(TableCell, { children: getStatusBadge(plan.status) }), _jsx(TableCell, { children: _jsxs("div", { className: "flex gap-1", children: [_jsx(Button, { size: "sm", variant: "outline", children: _jsx(Eye, { className: "w-3 h-3" }) }), _jsx(Button, { size: "sm", variant: "outline", children: _jsx(Edit, { className: "w-3 h-3" }) }), plan.status === "draft" && (_jsx(Button, { size: "sm", onClick: () => handleApprovePlan(plan._id.toString()), disabled: loading, children: "Approve" })), _jsx(Button, { size: "sm", variant: "outline", onClick: () => {
                                                                                    setSelectedPlan(plan);
                                                                                    setShowUpdateDialog(true);
                                                                                    loadUpdates(plan.plan_id);
                                                                                }, children: "Update" })] }) })] }, plan._id?.toString())))) })] }) }) })] }) }), _jsx(TabsContent, { value: "framework", className: "space-y-6", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "\uD83C\uDFE5 Framework Matrix Alerts" }), _jsx(CardDescription, { children: "Clinical operations workflow monitoring" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: attentionItems?.framework_matrix_alerts?.length === 0 ? (_jsx("div", { className: "text-center py-8 text-gray-500", children: "\u2705 All Framework Matrix functions operating normally" })) : (attentionItems?.framework_matrix_alerts?.map((alert, index) => (_jsxs("div", { className: `border rounded-lg p-4 ${alert.severity === "high"
                                                            ? "border-red-200 bg-red-50"
                                                            : "border-yellow-200 bg-yellow-50"}`, children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "font-medium text-sm", children: [alert.function, " - ", alert.process] }), _jsx(Badge, { variant: alert.severity === "high"
                                                                            ? "destructive"
                                                                            : "secondary", children: alert.severity })] }), _jsx("div", { className: "text-sm text-gray-600 mb-2", children: alert.framework_requirement }), _jsxs("div", { className: "text-sm font-medium", children: ["Action: ", alert.action_required] }), _jsxs("div", { className: "text-xs text-gray-500 mt-1", children: ["Responsible: ", alert.responsible_person] })] }, index)))) }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "\uD83D\uDCCA Clinical Operations Status" }), _jsx(CardDescription, { children: "Framework Matrix function performance" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: attentionItems?.clinical_operations_status?.map((status, index) => (_jsxs("div", { className: "border rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("div", { className: "font-medium", children: status.function }), _jsx(Badge, { variant: status.compliance_status === "compliant"
                                                                            ? "secondary"
                                                                            : "destructive", children: status.compliance_status })] }), _jsx("div", { className: "grid grid-cols-2 gap-4 text-sm", children: Object.entries(status.metrics).map(([key, value]) => (_jsxs("div", { children: [_jsxs("span", { className: "text-gray-600", children: [key
                                                                                    .replace(/_/g, " ")
                                                                                    .replace(/\b\w/g, (l) => l.toUpperCase()), ":"] }), _jsx("span", { className: "ml-1 font-medium", children: value })] }, key))) }), _jsx("div", { className: "text-xs text-gray-500 mt-2", children: status.framework_requirement })] }, index))) }) })] })] }) }), _jsx(TabsContent, { value: "active", className: "space-y-6", children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: todaysPlans.map((plan) => (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { className: "text-lg", children: plan.plan_id }), getStatusBadge(plan.status)] }), _jsxs(CardDescription, { children: [plan.shift, " Shift - ", plan.team_lead] })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm text-gray-600", children: "Total Patients" }), _jsx("div", { className: "text-2xl font-bold", children: plan.total_patients })] }), _jsxs("div", { children: [_jsx("div", { className: "text-sm text-gray-600", children: "Staff Assigned" }), _jsx("div", { className: "text-2xl font-bold", children: plan.staff_assigned.length })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "High Priority:" }), _jsx("span", { children: plan.high_priority_patients })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Medium Priority:" }), _jsx("span", { children: plan.medium_priority_patients })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Low Priority:" }), _jsx("span", { children: plan.low_priority_patients })] })] }), _jsx("div", { className: "pt-2", children: _jsx(Button, { size: "sm", className: "w-full", onClick: () => {
                                                            setSelectedPlan(plan);
                                                            setShowUpdateDialog(true);
                                                            loadUpdates(plan.plan_id);
                                                        }, children: "Add Update" }) })] })] }, plan._id?.toString()))) }) }), _jsx(TabsContent, { value: "updates", className: "space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Recent Updates" }), _jsx(CardDescription, { children: "Latest updates from active plans" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: updates.length === 0 ? (_jsx("div", { className: "text-center py-8 text-gray-500", children: "No updates available. Select a plan to view its updates." })) : (updates.map((update) => (_jsxs("div", { className: "border rounded-lg p-4 space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "font-medium", children: update.plan_id }), _jsxs("div", { className: "text-sm text-gray-500", children: [update.update_time, " by ", update.updated_by] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Completed:" }), " ", update.patients_completed] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Remaining:" }), " ", update.patients_remaining] })] }), update.issues_encountered.length > 0 && (_jsxs("div", { className: "space-y-1", children: [_jsx("div", { className: "text-sm font-medium text-red-600", children: "Issues:" }), update.issues_encountered.map((issue, index) => (_jsxs("div", { className: "text-sm text-red-600", children: ["\u2022 ", issue.description, " (", issue.severity, ")"] }, index)))] }))] }, update._id?.toString())))) }) })] }) }), _jsx(TabsContent, { value: "compliance", className: "space-y-6", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "\uD83C\uDFDB\uFE0F DOH Compliance Violations" }), _jsx(CardDescription, { children: "Regulatory compliance monitoring" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: attentionItems?.compliance_violations?.length === 0 ? (_jsx("div", { className: "text-center py-8 text-green-600", children: "\u2705 No compliance violations detected" })) : (attentionItems?.compliance_violations?.map((violation, index) => (_jsxs("div", { className: "border border-red-200 bg-red-50 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("div", { className: "font-medium text-red-800", children: violation.type }), _jsx(Badge, { variant: "destructive", children: violation.severity })] }), _jsx("div", { className: "text-sm text-red-700 mb-2", children: violation.description }), _jsxs("div", { className: "text-sm", children: [_jsx("span", { className: "font-medium", children: "Regulation:" }), " ", violation.regulation] }), _jsxs("div", { className: "text-sm", children: [_jsx("span", { className: "font-medium", children: "Action Required:" }), " ", violation.action_required] }), violation.deadline && (_jsxs("div", { className: "text-xs text-red-600 mt-1", children: ["Deadline: ", violation.deadline] }))] }, index)))) }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "\u23F0 Late Submissions (8:00 AM Rule)" }), _jsx(CardDescription, { children: "Daily planning submission compliance" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: attentionItems?.late_submissions?.length === 0 ? (_jsx("div", { className: "text-center py-8 text-green-600", children: "\u2705 All submissions on time" })) : (attentionItems?.late_submissions?.map((submission, index) => (_jsxs("div", { className: "border border-orange-200 bg-orange-50 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("div", { className: "font-medium text-orange-800", children: submission.plan_id }), _jsxs(Badge, { variant: "secondary", children: [submission.delay_minutes, " min late"] })] }), _jsxs("div", { className: "text-sm text-orange-700", children: ["Team Lead: ", submission.team_lead] }), _jsxs("div", { className: "text-sm text-orange-700", children: ["Department: ", submission.department] }), _jsxs("div", { className: "text-sm text-orange-700", children: ["Submitted: ", submission.submission_time] }), _jsx("div", { className: "text-xs text-orange-600 mt-2", children: submission.compliance_impact })] }, index)))) }) })] })] }) }), _jsx(TabsContent, { value: "analytics", className: "space-y-6", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Total Plans" }), _jsx(Calendar, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: plans.length }), _jsx("p", { className: "text-xs text-muted-foreground", children: "For selected date" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Active Plans" }), _jsx(Activity, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: todaysPlans.length }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Currently active" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Total Patients" }), _jsx(Users, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: plans.reduce((sum, plan) => sum + plan.total_patients, 0) }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Across all plans" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Staff Assigned" }), _jsx(Users, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: plans.reduce((sum, plan) => sum + plan.staff_assigned.length, 0) }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Total assignments" })] })] })] }) })] }), _jsx(Dialog, { open: showUpdateDialog, onOpenChange: setShowUpdateDialog, children: _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Add Plan Update" }), _jsxs(DialogDescription, { children: ["Add a progress update for ", selectedPlan?.plan_id] })] }), _jsxs("div", { className: "grid gap-4 py-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "updateType", children: "Update Type" }), _jsxs(Select, { value: newUpdate.update_type, onValueChange: (value) => setNewUpdate({ ...newUpdate, update_type: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "progress", children: "Progress" }), _jsx(SelectItem, { value: "issue", children: "Issue" }), _jsx(SelectItem, { value: "completion", children: "Completion" }), _jsx(SelectItem, { value: "emergency", children: "Emergency" }), _jsx(SelectItem, { value: "resource_change", children: "Resource Change" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "escalation", children: "Escalation Required" }), _jsxs(Select, { value: newUpdate.escalation_required ? "true" : "false", onValueChange: (value) => setNewUpdate({
                                                            ...newUpdate,
                                                            escalation_required: value === "true",
                                                        }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "false", children: "No" }), _jsx(SelectItem, { value: "true", children: "Yes" })] })] })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "completed", children: "Patients Completed" }), _jsx(Input, { id: "completed", type: "number", value: newUpdate.patients_completed, onChange: (e) => setNewUpdate({
                                                            ...newUpdate,
                                                            patients_completed: parseInt(e.target.value) || 0,
                                                        }) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "remaining", children: "Patients Remaining" }), _jsx(Input, { id: "remaining", type: "number", value: newUpdate.patients_remaining, onChange: (e) => setNewUpdate({
                                                            ...newUpdate,
                                                            patients_remaining: parseInt(e.target.value) || 0,
                                                        }) })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "nextActions", children: "Next Actions" }), _jsx(Textarea, { id: "nextActions", placeholder: "Enter next actions (one per line)", value: newUpdate.next_actions?.join("\n") || "", onChange: (e) => setNewUpdate({
                                                    ...newUpdate,
                                                    next_actions: e.target.value.split("\n").filter(Boolean),
                                                }) })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setShowUpdateDialog(false), children: "Cancel" }), _jsx(Button, { onClick: handleCreateUpdate, disabled: loading, children: "Add Update" })] })] }) })] }) }));
}
