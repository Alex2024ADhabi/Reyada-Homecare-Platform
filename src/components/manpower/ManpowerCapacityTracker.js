import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Plus, RefreshCw, Search, Filter, Edit, Trash2, } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { getAllManpowerCapacity, deleteManpowerCapacity, } from "@/api/manpower.api";
import ManpowerCapacityForm from "./ManpowerCapacityForm";
import ManpowerCapacityReport from "./ManpowerCapacityReport";
export default function ManpowerCapacityTracker() {
    const [manpowerData, setManpowerData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all-roles");
    const [zoneFilter, setZoneFilter] = useState("all-zones");
    const [availabilityFilter, setAvailabilityFilter] = useState("all-statuses");
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [activeTab, setActiveTab] = useState("list");
    // Get unique values for filters
    const roles = [...new Set(manpowerData.map((item) => item.role))];
    const zones = [...new Set(manpowerData.map((item) => item.geographic_zones))];
    const statuses = [
        ...new Set(manpowerData.map((item) => item.availability_status)),
    ];
    useEffect(() => {
        fetchManpowerData();
    }, []);
    useEffect(() => {
        applyFilters();
    }, [searchTerm, roleFilter, zoneFilter, availabilityFilter, manpowerData]);
    async function fetchManpowerData() {
        setIsLoading(true);
        try {
            const data = await getAllManpowerCapacity();
            setManpowerData(data);
            setFilteredData(data);
        }
        catch (error) {
            console.error("Error fetching manpower data:", error);
            toast({
                title: "Error",
                description: "Failed to load manpower capacity data. Please try again.",
                variant: "destructive",
            });
        }
        finally {
            setIsLoading(false);
        }
    }
    function applyFilters() {
        let filtered = [...manpowerData];
        if (searchTerm) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            filtered = filtered.filter((item) => item.staff_member.toLowerCase().includes(lowerSearchTerm) ||
                item.specializations.toLowerCase().includes(lowerSearchTerm) ||
                item.equipment_certifications.toLowerCase().includes(lowerSearchTerm));
        }
        if (roleFilter && roleFilter !== "all-roles") {
            filtered = filtered.filter((item) => item.role === roleFilter);
        }
        if (zoneFilter && zoneFilter !== "all-zones") {
            filtered = filtered.filter((item) => item.geographic_zones === zoneFilter);
        }
        if (availabilityFilter && availabilityFilter !== "all-statuses") {
            filtered = filtered.filter((item) => item.availability_status === availabilityFilter);
        }
        setFilteredData(filtered);
    }
    function resetFilters() {
        setSearchTerm("");
        setRoleFilter("all-roles");
        setZoneFilter("all-zones");
        setAvailabilityFilter("all-statuses");
    }
    async function handleDelete(id) {
        try {
            await deleteManpowerCapacity(id);
            toast({
                title: "Record deleted",
                description: "The staff record has been deleted successfully.",
            });
            fetchManpowerData();
            setShowDeleteConfirm(null);
        }
        catch (error) {
            console.error("Error deleting record:", error);
            toast({
                title: "Error",
                description: "Failed to delete the record. Please try again.",
                variant: "destructive",
            });
        }
    }
    function handleFormSuccess() {
        setShowAddForm(false);
        setEditingRecord(null);
        fetchManpowerData();
    }
    function handleEditClick(record) {
        setEditingRecord(record);
    }
    function handleCancelEdit() {
        setEditingRecord(null);
    }
    return (_jsxs("div", { className: "container mx-auto p-4", children: [_jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center mb-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold", children: "Manpower Capacity Tracker" }), _jsx("p", { className: "text-gray-500", children: "Manage staff allocation and capacity planning" })] }), _jsxs("div", { className: "flex space-x-2 mt-4 md:mt-0", children: [_jsxs(Button, { onClick: () => fetchManpowerData(), variant: "outline", size: "sm", children: [_jsx(RefreshCw, { className: "h-4 w-4 mr-2" }), "Refresh"] }), _jsxs(Dialog, { open: showAddForm, onOpenChange: setShowAddForm, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Add Staff Member"] }) }), _jsx(DialogContent, { className: "max-w-4xl", children: _jsx(ManpowerCapacityForm, { onSuccess: handleFormSuccess, onCancel: () => setShowAddForm(false) }) })] })] })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full", children: [_jsxs(TabsList, { className: "mb-4", children: [_jsx(TabsTrigger, { value: "list", children: "Staff List" }), _jsx(TabsTrigger, { value: "reports", children: "Reports & Analytics" })] }), _jsxs(TabsContent, { value: "list", className: "space-y-4", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Filters" }), _jsx(CardDescription, { children: "Filter staff by various criteria" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-2 top-2.5 h-4 w-4 text-gray-400" }), _jsx(Input, { placeholder: "Search staff or specializations", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "pl-8" })] }), _jsxs(Select, { value: roleFilter, onValueChange: setRoleFilter, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Filter by role" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all-roles", children: "All Roles" }), roles.map((role) => (_jsx(SelectItem, { value: role, children: role }, role)))] })] }), _jsxs(Select, { value: zoneFilter, onValueChange: setZoneFilter, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Filter by zone" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all-zones", children: "All Zones" }), zones.map((zone) => (_jsx(SelectItem, { value: zone, children: zone }, zone)))] })] }), _jsxs(Select, { value: availabilityFilter, onValueChange: setAvailabilityFilter, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Filter by availability" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all-statuses", children: "All Statuses" }), statuses.map((status) => (_jsx(SelectItem, { value: status, children: status }, status)))] })] })] }), _jsx("div", { className: "flex justify-end mt-4", children: _jsxs(Button, { variant: "outline", size: "sm", onClick: resetFilters, children: [_jsx(Filter, { className: "h-4 w-4 mr-2" }), "Reset Filters"] }) })] })] }), isLoading ? (_jsx("div", { className: "flex justify-center items-center h-64", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto" }), _jsx("p", { className: "mt-4 text-gray-500", children: "Loading staff data..." })] }) })) : filteredData.length === 0 ? (_jsx("div", { className: "flex justify-center items-center h-64", children: _jsxs("div", { className: "text-center", children: [_jsx(AlertCircle, { className: "h-12 w-12 text-gray-400 mx-auto" }), _jsx("h3", { className: "mt-4 text-lg font-medium", children: "No staff records found" }), _jsx("p", { className: "mt-2 text-gray-500", children: searchTerm ||
                                                (roleFilter && roleFilter !== "all-roles") ||
                                                (zoneFilter && zoneFilter !== "all-zones") ||
                                                (availabilityFilter && availabilityFilter !== "all-statuses")
                                                ? "Try adjusting your filters"
                                                : "Add staff members to get started" })] }) })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: filteredData.map((staff) => (_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs("div", { className: "flex justify-between", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: staff.staff_member }), _jsx(CardDescription, { children: staff.role })] }), _jsxs("div", { className: "flex space-x-1", children: [_jsx(Button, { variant: "ghost", size: "icon", onClick: () => handleEditClick(staff), children: _jsx(Edit, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "icon", onClick: () => setShowDeleteConfirm(staff._id?.toString() || ""), children: _jsx(Trash2, { className: "h-4 w-4 text-red-500" }) })] })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium", children: "Certification:" }), _jsx("span", { className: "text-sm", children: staff.certification_level })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium", children: "Zone:" }), _jsx("span", { className: "text-sm", children: staff.geographic_zones })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium", children: "Date:" }), _jsx("span", { className: "text-sm", children: staff.date })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium", children: "Shift:" }), _jsx("span", { className: "text-sm", children: staff.shift })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium", children: "Status:" }), _jsx(Badge, { variant: staff.availability_status === "Available"
                                                                    ? "default"
                                                                    : staff.availability_status === "Unavailable"
                                                                        ? "destructive"
                                                                        : "secondary", children: staff.availability_status })] }), _jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Patient Capacity:" }), _jsxs("span", { children: [staff.current_daily_patients, " /", " ", staff.max_daily_patients] })] }), _jsx(Progress, { value: (staff.current_daily_patients /
                                                                    staff.max_daily_patients) *
                                                                    100, className: "h-2" })] }), _jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Hours Committed:" }), _jsxs("span", { children: [staff.committed_hours_per_day, " /", " ", staff.available_hours_per_day] })] }), _jsx(Progress, { value: (staff.committed_hours_per_day /
                                                                    staff.available_hours_per_day) *
                                                                    100, className: "h-2" })] }), _jsxs("div", { children: [_jsx("span", { className: "text-sm font-medium", children: "Specializations:" }), _jsx("p", { className: "text-sm mt-1", children: staff.specializations })] })] }) })] }, staff._id?.toString()))) }))] }), _jsx(TabsContent, { value: "reports", children: _jsx(ManpowerCapacityReport, { data: manpowerData }) })] }), editingRecord && (_jsx(Dialog, { open: !!editingRecord, onOpenChange: (open) => !open && setEditingRecord(null), children: _jsx(DialogContent, { className: "max-w-4xl", children: _jsx(ManpowerCapacityForm, { initialData: editingRecord, onSuccess: handleFormSuccess, onCancel: handleCancelEdit }) }) })), showDeleteConfirm && (_jsx(Dialog, { open: !!showDeleteConfirm, onOpenChange: (open) => !open && setShowDeleteConfirm(null), children: _jsx(DialogContent, { children: _jsxs("div", { className: "p-4", children: [_jsx("h2", { className: "text-xl font-bold mb-4", children: "Confirm Deletion" }), _jsx("p", { className: "mb-6", children: "Are you sure you want to delete this staff record? This action cannot be undone." }), _jsxs("div", { className: "flex justify-end space-x-4", children: [_jsx(Button, { variant: "outline", onClick: () => setShowDeleteConfirm(null), children: "Cancel" }), _jsx(Button, { variant: "destructive", onClick: () => handleDelete(showDeleteConfirm), children: "Delete" })] })] }) }) }))] }));
}
