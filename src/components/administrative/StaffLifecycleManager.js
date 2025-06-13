import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Users, UserPlus, UserCheck, Calendar, Clock, Award, AlertTriangle, CheckCircle, XCircle, FileText, Star, Target, Brain, Zap, RefreshCw, Edit, Eye, Plus, Search, } from "lucide-react";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { Settings, Shield } from "lucide-react";
export default function StaffLifecycleManager({ userId = "HR001", userRole = "hr_manager", }) {
    const [staffMembers, setStaffMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showTerminationDialog, setShowTerminationDialog] = useState(false);
    const [showBackgroundCheckDialog, setShowBackgroundCheckDialog] = useState(false);
    const [showMobileSetupDialog, setShowMobileSetupDialog] = useState(false);
    const [showStaffPortalDialog, setShowStaffPortalDialog] = useState(false);
    const [selectedStaffForPortal, setSelectedStaffForPortal] = useState(null);
    const [dohIntegrationStatus, setDohIntegrationStatus] = useState({
        connected: true,
        lastSync: new Date().toISOString(),
        pendingVerifications: 2,
        autoRenewalEnabled: true,
    });
    const [filters, setFilters] = useState({
        department: "",
        status: "",
        license_status: "",
        search: "",
    });
    const { isOnline, saveFormData } = useOfflineSync();
    // Mock data for demonstration
    useEffect(() => {
        loadStaffData();
    }, []);
    const loadStaffData = async () => {
        setLoading(true);
        try {
            // Mock staff data
            const mockStaff = [
                {
                    _id: "STAFF001",
                    employee_id: "EMP001",
                    personal_info: {
                        first_name: "Sarah",
                        last_name: "Johnson",
                        emirates_id: "784-1990-1234567-8",
                        nationality: "American",
                        date_of_birth: "1990-05-15",
                        gender: "female",
                        phone: "+971-50-123-4567",
                        email: "sarah.johnson@reyada.ae",
                    },
                    employment_info: {
                        position: "Registered Nurse",
                        department: "Clinical Services",
                        employment_type: "full-time",
                        start_date: "2022-01-15",
                        salary: 12000,
                        status: "active",
                    },
                    doh_license: {
                        license_number: "DOH-RN-2022-001234",
                        license_type: "Registered Nurse",
                        issue_date: "2022-01-01",
                        expiry_date: "2025-01-01",
                        status: "active",
                    },
                    qualifications: {
                        degree: "Bachelor of Science in Nursing",
                        institution: "University of California",
                        graduation_year: 2015,
                        certifications: [
                            {
                                name: "Advanced Cardiac Life Support",
                                issuing_body: "American Heart Association",
                                issue_date: "2023-01-15",
                                expiry_date: "2025-01-15",
                                certificate_number: "ACLS-2023-001",
                            },
                        ],
                    },
                    competencies: {
                        "Clinical Assessment": {
                            level: 85,
                            last_assessed: "2024-01-15",
                            target_level: 90,
                        },
                        "Patient Communication": {
                            level: 92,
                            last_assessed: "2024-01-15",
                            target_level: 95,
                        },
                        "Wound Care": {
                            level: 78,
                            last_assessed: "2024-01-15",
                            target_level: 85,
                        },
                    },
                    performance_metrics: {
                        overall_rating: 4.2,
                        last_evaluation_date: "2024-01-15",
                        goals: [
                            {
                                description: "Complete Advanced Wound Care Certification",
                                target_date: "2024-06-30",
                                status: "in_progress",
                                achievement_score: 65,
                            },
                        ],
                    },
                    training_records: [
                        {
                            course_name: "Infection Control in Home Care",
                            provider: "DOH Training Institute",
                            completion_date: "2024-01-20",
                            hours: 8,
                            certificate_number: "IC-2024-001",
                            expiry_date: "2026-01-20",
                        },
                    ],
                    wellness_metrics: {
                        satisfaction_score: 8.5,
                        stress_level: "medium",
                        work_life_balance: 7.8,
                        last_survey_date: "2024-01-01",
                    },
                    background_check: {
                        status: "completed",
                        completed_date: "2022-01-10",
                        verification_level: "enhanced",
                        expiry_date: "2025-01-10",
                        notes: "All checks passed successfully",
                    },
                    mobile_access: {
                        device_registered: true,
                        last_login: "2024-01-15T09:30:00Z",
                        app_version: "2.1.0",
                        biometric_enabled: true,
                    },
                    self_service_portal: {
                        account_active: true,
                        last_access: "2024-01-15T08:45:00Z",
                        pending_requests: 1,
                        completed_trainings: 12,
                    },
                    created_at: "2022-01-15T08:00:00Z",
                    updated_at: "2024-01-15T10:30:00Z",
                },
                {
                    _id: "STAFF002",
                    employee_id: "EMP002",
                    personal_info: {
                        first_name: "Ahmed",
                        last_name: "Al Mansouri",
                        emirates_id: "784-1985-7654321-2",
                        nationality: "Emirati",
                        date_of_birth: "1985-08-22",
                        gender: "male",
                        phone: "+971-50-987-6543",
                        email: "ahmed.almansouri@reyada.ae",
                    },
                    employment_info: {
                        position: "Physical Therapist",
                        department: "Rehabilitation Services",
                        employment_type: "full-time",
                        start_date: "2021-03-01",
                        salary: 14000,
                        status: "active",
                    },
                    doh_license: {
                        license_number: "DOH-PT-2021-005678",
                        license_type: "Physical Therapist",
                        issue_date: "2021-02-15",
                        expiry_date: "2024-02-15",
                        status: "expired",
                    },
                    qualifications: {
                        degree: "Doctor of Physical Therapy",
                        institution: "UAE University",
                        graduation_year: 2010,
                        certifications: [
                            {
                                name: "Orthopedic Manual Therapy",
                                issuing_body: "International Federation of Orthopaedic Manipulative Physical Therapists",
                                issue_date: "2022-06-01",
                                expiry_date: "2025-06-01",
                                certificate_number: "IFOMPT-2022-078",
                            },
                        ],
                    },
                    competencies: {
                        "Manual Therapy": {
                            level: 95,
                            last_assessed: "2024-01-10",
                            target_level: 95,
                        },
                        "Exercise Prescription": {
                            level: 88,
                            last_assessed: "2024-01-10",
                            target_level: 90,
                        },
                        "Patient Education": {
                            level: 82,
                            last_assessed: "2024-01-10",
                            target_level: 85,
                        },
                    },
                    performance_metrics: {
                        overall_rating: 4.6,
                        last_evaluation_date: "2024-01-10",
                        goals: [
                            {
                                description: "Renew DOH License",
                                target_date: "2024-03-01",
                                status: "pending",
                            },
                        ],
                    },
                    training_records: [
                        {
                            course_name: "Geriatric Rehabilitation",
                            provider: "Emirates Health Academy",
                            completion_date: "2023-11-15",
                            hours: 16,
                            certificate_number: "GR-2023-045",
                        },
                    ],
                    wellness_metrics: {
                        satisfaction_score: 9.2,
                        stress_level: "low",
                        work_life_balance: 8.8,
                        last_survey_date: "2024-01-01",
                    },
                    background_check: {
                        status: "completed",
                        completed_date: "2021-02-25",
                        verification_level: "enhanced",
                        expiry_date: "2024-02-25",
                        notes: "Renewal required soon",
                    },
                    mobile_access: {
                        device_registered: true,
                        last_login: "2024-01-10T14:15:00Z",
                        app_version: "2.0.8",
                        biometric_enabled: false,
                    },
                    self_service_portal: {
                        account_active: true,
                        last_access: "2024-01-10T13:20:00Z",
                        pending_requests: 0,
                        completed_trainings: 18,
                    },
                    created_at: "2021-03-01T09:00:00Z",
                    updated_at: "2024-01-10T14:20:00Z",
                },
            ];
            setStaffMembers(mockStaff);
        }
        catch (error) {
            console.error("Error loading staff data:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const getStatusBadge = (status) => {
        const variants = {
            active: "default",
            inactive: "secondary",
            terminated: "destructive",
            on_leave: "outline",
        };
        return (_jsx(Badge, { variant: variants[status] || "outline", children: status.replace("_", " ").toUpperCase() }));
    };
    const getLicenseStatusBadge = (status) => {
        const variants = {
            active: "default",
            expired: "destructive",
            suspended: "secondary",
        };
        const icons = {
            active: _jsx(CheckCircle, { className: "w-3 h-3" }),
            expired: _jsx(XCircle, { className: "w-3 h-3" }),
            suspended: _jsx(AlertTriangle, { className: "w-3 h-3" }),
        };
        return (_jsxs(Badge, { variant: variants[status] || "outline", className: "flex items-center gap-1", children: [icons[status], status.toUpperCase()] }));
    };
    const getCompetencyColor = (level, target) => {
        if (level >= target)
            return "text-green-600";
        if (level >= target * 0.8)
            return "text-yellow-600";
        return "text-red-600";
    };
    const filteredStaff = staffMembers.filter((staff) => {
        if (filters.department &&
            staff.employment_info.department !== filters.department)
            return false;
        if (filters.status && staff.employment_info.status !== filters.status)
            return false;
        if (filters.license_status &&
            staff.doh_license.status !== filters.license_status)
            return false;
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            const fullName = `${staff.personal_info.first_name} ${staff.personal_info.last_name}`.toLowerCase();
            if (!fullName.includes(searchLower) &&
                !staff.employee_id.toLowerCase().includes(searchLower)) {
                return false;
            }
        }
        return true;
    });
    const calculateOverallStats = () => {
        const total = staffMembers.length;
        const active = staffMembers.filter((s) => s.employment_info.status === "active").length;
        const expiredLicenses = staffMembers.filter((s) => s.doh_license.status === "expired").length;
        const avgPerformance = staffMembers.reduce((sum, s) => sum + s.performance_metrics.overall_rating, 0) / total;
        const avgSatisfaction = staffMembers.reduce((sum, s) => sum + s.wellness_metrics.satisfaction_score, 0) / total;
        return {
            total,
            active,
            expiredLicenses,
            avgPerformance: Math.round(avgPerformance * 10) / 10,
            avgSatisfaction: Math.round(avgSatisfaction * 10) / 10,
        };
    };
    const stats = calculateOverallStats();
    return (_jsx("div", { className: "min-h-screen bg-gray-50 p-6", children: _jsxs("div", { className: "max-w-7xl mx-auto space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Staff Lifecycle Management" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Complete staff management from recruitment to termination" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [!isOnline && (_jsxs(Badge, { variant: "secondary", className: "flex items-center gap-1", children: [_jsx(AlertTriangle, { className: "w-3 h-3" }), "Offline Mode"] })), _jsxs(Button, { onClick: loadStaffData, variant: "outline", size: "sm", children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "Refresh"] }), _jsxs(Button, { onClick: () => setShowAddDialog(true), children: [_jsx(UserPlus, { className: "w-4 h-4 mr-2" }), "Add Staff Member"] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4", children: [_jsxs(Card, { className: "border-blue-200 bg-blue-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium text-blue-800 flex items-center gap-2", children: [_jsx(Users, { className: "w-4 h-4" }), "Total Staff"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "text-2xl font-bold text-blue-900", children: stats.total }) })] }), _jsxs(Card, { className: "border-green-200 bg-green-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium text-green-800 flex items-center gap-2", children: [_jsx(UserCheck, { className: "w-4 h-4" }), "Active Staff"] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-green-900", children: stats.active }), _jsxs("p", { className: "text-xs text-green-600", children: [Math.round((stats.active / stats.total) * 100), "% of total"] })] })] }), _jsxs(Card, { className: "border-red-200 bg-red-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium text-red-800 flex items-center gap-2", children: [_jsx(AlertTriangle, { className: "w-4 h-4" }), "Expired Licenses"] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-red-900", children: stats.expiredLicenses }), _jsx("p", { className: "text-xs text-red-600", children: "Require immediate attention" })] })] }), _jsxs(Card, { className: "border-purple-200 bg-purple-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium text-purple-800 flex items-center gap-2", children: [_jsx(Star, { className: "w-4 h-4" }), "Avg Performance"] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold text-purple-900", children: [stats.avgPerformance, "/5"] }), _jsx(Progress, { value: (stats.avgPerformance / 5) * 100, className: "h-1 mt-2" })] })] }), _jsxs(Card, { className: "border-orange-200 bg-orange-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium text-orange-800 flex items-center gap-2", children: [_jsx(Target, { className: "w-4 h-4" }), "Satisfaction"] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold text-orange-900", children: [stats.avgSatisfaction, "/10"] }), _jsx(Progress, { value: (stats.avgSatisfaction / 10) * 100, className: "h-1 mt-2" })] })] })] }), _jsxs(Card, { className: "border-blue-200 bg-blue-50", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "text-blue-800 flex items-center", children: [_jsx(Shield, { className: "w-5 h-5 mr-2" }), "DOH Licensing System Integration"] }), _jsx(CardDescription, { children: "Real-time license verification and automated renewal tracking" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "text-center p-4 bg-white rounded border", children: [_jsx("div", { className: "text-2xl font-bold text-green-700", children: _jsx(CheckCircle, { className: "w-8 h-8 mx-auto mb-2" }) }), _jsx("div", { className: "text-sm text-gray-600", children: "System Status" }), _jsx("div", { className: "text-xs text-green-600 mt-1", children: dohIntegrationStatus.connected
                                                    ? "Connected"
                                                    : "Disconnected" })] }), _jsxs("div", { className: "text-center p-4 bg-white rounded border", children: [_jsx("div", { className: "text-2xl font-bold text-blue-700", children: dohIntegrationStatus.pendingVerifications }), _jsx("div", { className: "text-sm text-gray-600", children: "Pending Verifications" }), _jsx("div", { className: "text-xs text-gray-500 mt-1", children: "Require attention" })] }), _jsxs("div", { className: "text-center p-4 bg-white rounded border", children: [_jsx("div", { className: "text-2xl font-bold text-purple-700", children: new Date(dohIntegrationStatus.lastSync).toLocaleDateString() }), _jsx("div", { className: "text-sm text-gray-600", children: "Last Sync" }), _jsx("div", { className: "text-xs text-gray-500 mt-1", children: "Automatic sync enabled" })] }), _jsxs("div", { className: "text-center p-4 bg-white rounded border", children: [_jsx("div", { className: "text-lg font-bold", children: _jsx(Badge, { variant: dohIntegrationStatus.autoRenewalEnabled
                                                        ? "default"
                                                        : "secondary", children: dohIntegrationStatus.autoRenewalEnabled
                                                        ? "Enabled"
                                                        : "Disabled" }) }), _jsx("div", { className: "text-sm text-gray-600 mt-1", children: "Auto Renewal" })] })] }) })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "space-y-6", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-8", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "licenses", children: "DOH Licenses" }), _jsx(TabsTrigger, { value: "competencies", children: "Competencies" }), _jsx(TabsTrigger, { value: "performance", children: "Performance" }), _jsx(TabsTrigger, { value: "training", children: "Training" }), _jsx(TabsTrigger, { value: "wellness", children: "Wellness" }), _jsx(TabsTrigger, { value: "background", children: "Background Checks" }), _jsx(TabsTrigger, { value: "mobile", children: "Mobile & Portal" })] }), _jsxs(TabsContent, { value: "overview", className: "space-y-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Filter Staff" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-2 top-2.5 h-4 w-4 text-gray-400" }), _jsx(Input, { placeholder: "Search by name or ID", value: filters.search, onChange: (e) => setFilters({ ...filters, search: e.target.value }), className: "pl-8" })] }), _jsxs(Select, { value: filters.department, onValueChange: (value) => setFilters({ ...filters, department: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "All Departments" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "", children: "All Departments" }), _jsx(SelectItem, { value: "Clinical Services", children: "Clinical Services" }), _jsx(SelectItem, { value: "Rehabilitation Services", children: "Rehabilitation Services" }), _jsx(SelectItem, { value: "Administration", children: "Administration" })] })] }), _jsxs(Select, { value: filters.status, onValueChange: (value) => setFilters({ ...filters, status: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "All Status" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "", children: "All Status" }), _jsx(SelectItem, { value: "active", children: "Active" }), _jsx(SelectItem, { value: "inactive", children: "Inactive" }), _jsx(SelectItem, { value: "on_leave", children: "On Leave" }), _jsx(SelectItem, { value: "terminated", children: "Terminated" })] })] }), _jsxs(Select, { value: filters.license_status, onValueChange: (value) => setFilters({ ...filters, license_status: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "License Status" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "", children: "All Licenses" }), _jsx(SelectItem, { value: "active", children: "Active" }), _jsx(SelectItem, { value: "expired", children: "Expired" }), _jsx(SelectItem, { value: "suspended", children: "Suspended" })] })] })] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Staff Members" }), _jsxs(CardDescription, { children: [filteredStaff.length, " staff members found"] })] }), _jsx(CardContent, { children: _jsx("div", { className: "overflow-x-auto", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Employee" }), _jsx(TableHead, { children: "Position" }), _jsx(TableHead, { children: "Department" }), _jsx(TableHead, { children: "Employment Status" }), _jsx(TableHead, { children: "DOH License" }), _jsx(TableHead, { children: "Performance" }), _jsx(TableHead, { children: "Actions" })] }) }), _jsx(TableBody, { children: loading ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 7, className: "text-center py-8", children: _jsxs("div", { className: "flex items-center justify-center space-x-2", children: [_jsx(RefreshCw, { className: "w-4 h-4 animate-spin" }), _jsx("span", { children: "Loading staff data..." })] }) }) })) : filteredStaff.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 7, className: "text-center py-8 text-gray-500", children: "No staff members found" }) })) : (filteredStaff.map((staff) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: _jsxs("div", { children: [_jsxs("div", { className: "font-medium", children: [staff.personal_info.first_name, " ", staff.personal_info.last_name] }), _jsx("div", { className: "text-sm text-gray-500", children: staff.employee_id })] }) }), _jsx(TableCell, { children: staff.employment_info.position }), _jsx(TableCell, { children: staff.employment_info.department }), _jsx(TableCell, { children: getStatusBadge(staff.employment_info.status) }), _jsx(TableCell, { children: _jsxs("div", { className: "space-y-1", children: [getLicenseStatusBadge(staff.doh_license.status), _jsxs("div", { className: "text-xs text-gray-500", children: ["Expires: ", staff.doh_license.expiry_date] })] }) }), _jsx(TableCell, { children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("div", { className: "text-sm font-medium", children: [staff.performance_metrics.overall_rating, "/5"] }), _jsx("div", { className: "flex", children: [...Array(5)].map((_, i) => (_jsx(Star, { className: `w-3 h-3 ${i <
                                                                                            Math.floor(staff.performance_metrics
                                                                                                .overall_rating)
                                                                                            ? "text-yellow-400 fill-current"
                                                                                            : "text-gray-300"}` }, i))) })] }) }), _jsx(TableCell, { children: _jsxs("div", { className: "flex space-x-1", children: [_jsxs(Button, { size: "sm", variant: "outline", onClick: () => setSelectedStaff(staff), children: [_jsx(Eye, { className: "w-3 h-3 mr-1" }), "View"] }), _jsxs(Button, { size: "sm", variant: "outline", children: [_jsx(Edit, { className: "w-3 h-3 mr-1" }), "Edit"] })] }) })] }, staff._id)))) })] }) }) })] })] }), _jsx(TabsContent, { value: "licenses", className: "space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(FileText, { className: "w-5 h-5" }), "DOH License Verification & Tracking"] }), _jsx(CardDescription, { children: "Monitor license status and expiration dates" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: filteredStaff.map((staff) => (_jsxs("div", { className: "border rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { children: [_jsxs("h4", { className: "font-medium", children: [staff.personal_info.first_name, " ", staff.personal_info.last_name] }), _jsx("p", { className: "text-sm text-gray-500", children: staff.employment_info.position })] }), getLicenseStatusBadge(staff.doh_license.status)] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "License Number:" }), _jsx("p", { children: staff.doh_license.license_number })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "License Type:" }), _jsx("p", { children: staff.doh_license.license_type })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Expiry Date:" }), _jsx("p", { className: staff.doh_license.status === "expired"
                                                                            ? "text-red-600 font-medium"
                                                                            : "", children: staff.doh_license.expiry_date })] })] }), staff.doh_license.status === "expired" && (_jsxs(Alert, { className: "mt-3 bg-red-50 border-red-200", children: [_jsx(AlertTriangle, { className: "h-4 w-4 text-red-600" }), _jsx(AlertTitle, { className: "text-red-800", children: "License Expired" }), _jsx(AlertDescription, { className: "text-red-700", children: "This staff member's DOH license has expired and requires immediate renewal." })] }))] }, staff._id))) }) })] }) }), _jsx(TabsContent, { value: "competencies", className: "space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Brain, { className: "w-5 h-5" }), "Competency Assessment & Skill Gap Analysis"] }), _jsx(CardDescription, { children: "Track skill levels and identify training needs" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-6", children: filteredStaff.map((staff) => (_jsxs("div", { className: "border rounded-lg p-4", children: [_jsxs("div", { className: "mb-4", children: [_jsxs("h4", { className: "font-medium", children: [staff.personal_info.first_name, " ", staff.personal_info.last_name] }), _jsx("p", { className: "text-sm text-gray-500", children: staff.employment_info.position })] }), _jsx("div", { className: "space-y-3", children: Object.entries(staff.competencies).map(([skill, data]) => (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium", children: skill }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("span", { className: `text-sm ${getCompetencyColor(data.level, data.target_level)}`, children: [data.level, "%"] }), _jsxs("span", { className: "text-xs text-gray-500", children: ["Target: ", data.target_level, "%"] })] })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsx(Progress, { value: data.level, className: "flex-1 h-2" }), _jsx("div", { className: "w-1 bg-gray-300 rounded", style: {
                                                                                marginLeft: `${data.target_level}%`,
                                                                            } })] }), _jsxs("div", { className: "text-xs text-gray-500", children: ["Last assessed: ", data.last_assessed] })] }, skill))) })] }, staff._id))) }) })] }) }), _jsx(TabsContent, { value: "performance", className: "space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Award, { className: "w-5 h-5" }), "Performance Evaluation & Rating Systems"] }), _jsx(CardDescription, { children: "Track performance metrics and goal achievement" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-6", children: filteredStaff.map((staff) => (_jsxs("div", { className: "border rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { children: [_jsxs("h4", { className: "font-medium", children: [staff.personal_info.first_name, " ", staff.personal_info.last_name] }), _jsx("p", { className: "text-sm text-gray-500", children: staff.employment_info.position })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "text-2xl font-bold", children: [staff.performance_metrics.overall_rating, "/5"] }), _jsx("div", { className: "flex", children: [...Array(5)].map((_, i) => (_jsx(Star, { className: `w-4 h-4 ${i <
                                                                                Math.floor(staff.performance_metrics.overall_rating)
                                                                                ? "text-yellow-400 fill-current"
                                                                                : "text-gray-300"}` }, i))) })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "text-sm", children: [_jsx("span", { className: "font-medium", children: "Last Evaluation:" }), _jsx("span", { className: "ml-2", children: staff.performance_metrics.last_evaluation_date })] }), _jsxs("div", { children: [_jsx("h5", { className: "font-medium mb-2", children: "Current Goals:" }), _jsx("div", { className: "space-y-2", children: staff.performance_metrics.goals.map((goal, index) => (_jsxs("div", { className: "bg-gray-50 p-3 rounded", children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("span", { className: "text-sm font-medium", children: goal.description }), _jsx(Badge, { variant: goal.status === "completed"
                                                                                                ? "default"
                                                                                                : goal.status === "in_progress"
                                                                                                    ? "secondary"
                                                                                                    : "outline", children: goal.status.replace("_", " ") })] }), _jsxs("div", { className: "text-xs text-gray-500", children: ["Target Date: ", goal.target_date] }), goal.achievement_score && (_jsxs("div", { className: "mt-2", children: [_jsx(Progress, { value: goal.achievement_score, className: "h-1" }), _jsxs("div", { className: "text-xs text-gray-500 mt-1", children: ["Progress: ", goal.achievement_score, "%"] })] }))] }, index))) })] })] })] }, staff._id))) }) })] }) }), _jsx(TabsContent, { value: "training", className: "space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Zap, { className: "w-5 h-5" }), "Training Program Management & Certification Tracking"] }), _jsx(CardDescription, { children: "Monitor training completion and certification status" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-6", children: filteredStaff.map((staff) => (_jsxs("div", { className: "border rounded-lg p-4", children: [_jsxs("div", { className: "mb-4", children: [_jsxs("h4", { className: "font-medium", children: [staff.personal_info.first_name, " ", staff.personal_info.last_name] }), _jsx("p", { className: "text-sm text-gray-500", children: staff.employment_info.position })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h5", { className: "font-medium mb-2", children: "Recent Training:" }), _jsx("div", { className: "space-y-2", children: staff.training_records.map((training, index) => (_jsx("div", { className: "bg-gray-50 p-3 rounded", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium text-sm", children: training.course_name }), _jsxs("div", { className: "text-xs text-gray-500", children: [training.provider, " \u2022 ", training.hours, " ", "hours"] })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "text-sm", children: training.completion_date }), training.expiry_date && (_jsxs("div", { className: "text-xs text-gray-500", children: ["Expires: ", training.expiry_date] }))] })] }) }, index))) })] }), _jsxs("div", { children: [_jsx("h5", { className: "font-medium mb-2", children: "Certifications:" }), _jsx("div", { className: "space-y-2", children: staff.qualifications.certifications.map((cert, index) => (_jsx("div", { className: "bg-blue-50 p-3 rounded border border-blue-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium text-sm", children: cert.name }), _jsxs("div", { className: "text-xs text-gray-500", children: [cert.issuing_body, " \u2022", " ", cert.certificate_number] })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "text-sm", children: cert.issue_date }), cert.expiry_date && (_jsxs("div", { className: "text-xs text-gray-500", children: ["Expires: ", cert.expiry_date] }))] })] }) }, index))) })] })] })] }, staff._id))) }) })] }) }), _jsxs(TabsContent, { value: "wellness", className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs(Card, { className: "border-green-200 bg-green-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium text-green-800 flex items-center gap-2", children: [_jsx(Target, { className: "w-4 h-4" }), "High Satisfaction"] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-green-900", children: staffMembers.filter((s) => s.wellness_metrics.satisfaction_score >= 8).length }), _jsx("p", { className: "text-xs text-green-600", children: "Score \u2265 8/10" })] })] }), _jsxs(Card, { className: "border-yellow-200 bg-yellow-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium text-yellow-800 flex items-center gap-2", children: [_jsx(AlertTriangle, { className: "w-4 h-4" }), "At Risk"] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-yellow-900", children: staffMembers.filter((s) => s.wellness_metrics.satisfaction_score < 6 ||
                                                                s.wellness_metrics.stress_level === "high").length }), _jsx("p", { className: "text-xs text-yellow-600", children: "Need attention" })] })] }), _jsxs(Card, { className: "border-blue-200 bg-blue-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium text-blue-800 flex items-center gap-2", children: [_jsx(Clock, { className: "w-4 h-4" }), "Work-Life Balance"] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold text-blue-900", children: [Math.round((staffMembers.reduce((sum, s) => sum + s.wellness_metrics.work_life_balance, 0) /
                                                                    staffMembers.length) *
                                                                    10) / 10, "/10"] }), _jsx("p", { className: "text-xs text-blue-600", children: "Average score" })] })] }), _jsxs(Card, { className: "border-red-200 bg-red-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium text-red-800 flex items-center gap-2", children: [_jsx(AlertTriangle, { className: "w-4 h-4" }), "High Stress"] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-red-900", children: staffMembers.filter((s) => s.wellness_metrics.stress_level === "high").length }), _jsx("p", { className: "text-xs text-red-600", children: "Require support" })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Target, { className: "w-5 h-5" }), "Staff Wellness & Satisfaction Monitoring"] }), _jsx(CardDescription, { children: "Track employee wellbeing and job satisfaction with actionable insights" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-6", children: filteredStaff.map((staff) => (_jsxs("div", { className: "border rounded-lg p-4", children: [_jsxs("div", { className: "mb-4", children: [_jsxs("h4", { className: "font-medium", children: [staff.personal_info.first_name, " ", staff.personal_info.last_name] }), _jsx("p", { className: "text-sm text-gray-500", children: staff.employment_info.position })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "text-center p-4 bg-green-50 rounded border border-green-200", children: [_jsxs("div", { className: "text-2xl font-bold text-green-700", children: [staff.wellness_metrics.satisfaction_score, "/10"] }), _jsx("div", { className: "text-sm text-green-600", children: "Job Satisfaction" }), _jsx(Progress, { value: (staff.wellness_metrics.satisfaction_score / 10) *
                                                                                100, className: "h-2 mt-2" }), staff.wellness_metrics.satisfaction_score < 6 && (_jsx("div", { className: "mt-2 text-xs text-red-600 font-medium", children: "\u26A0 Requires attention" }))] }), _jsxs("div", { className: "text-center p-4 bg-blue-50 rounded border border-blue-200", children: [_jsxs("div", { className: "text-2xl font-bold text-blue-700", children: [staff.wellness_metrics.work_life_balance, "/10"] }), _jsx("div", { className: "text-sm text-blue-600", children: "Work-Life Balance" }), _jsx(Progress, { value: (staff.wellness_metrics.work_life_balance / 10) *
                                                                                100, className: "h-2 mt-2" }), staff.wellness_metrics.work_life_balance < 6 && (_jsx("div", { className: "mt-2 text-xs text-red-600 font-medium", children: "\u26A0 Needs improvement" }))] }), _jsxs("div", { className: "text-center p-4 bg-orange-50 rounded border border-orange-200", children: [_jsx(Badge, { variant: staff.wellness_metrics.stress_level === "low"
                                                                                ? "default"
                                                                                : staff.wellness_metrics.stress_level ===
                                                                                    "medium"
                                                                                    ? "secondary"
                                                                                    : "destructive", className: "mb-2", children: staff.wellness_metrics.stress_level.toUpperCase() }), _jsx("div", { className: "text-sm text-orange-600", children: "Stress Level" }), staff.wellness_metrics.stress_level === "high" && (_jsx("div", { className: "mt-2 text-xs text-red-600 font-medium", children: "\uD83D\uDEA8 Immediate support needed" }))] })] }), _jsxs("div", { className: "mt-4 text-sm text-gray-500", children: ["Last survey: ", staff.wellness_metrics.last_survey_date] }), _jsxs("div", { className: "mt-4 p-3 bg-gray-50 rounded border", children: [_jsx("h6", { className: "font-medium text-sm mb-2", children: "Wellness Action Items:" }), _jsxs("div", { className: "space-y-1 text-xs", children: [staff.wellness_metrics.satisfaction_score < 7 && (_jsxs("div", { className: "flex items-center gap-2 text-orange-600", children: [_jsx(AlertTriangle, { className: "w-3 h-3" }), "Schedule one-on-one meeting to discuss job satisfaction"] })), staff.wellness_metrics.work_life_balance < 7 && (_jsxs("div", { className: "flex items-center gap-2 text-blue-600", children: [_jsx(Clock, { className: "w-3 h-3" }), "Review workload and schedule flexibility options"] })), staff.wellness_metrics.stress_level === "high" && (_jsxs("div", { className: "flex items-center gap-2 text-red-600", children: [_jsx(AlertTriangle, { className: "w-3 h-3" }), "Provide stress management resources and support"] })), staff.wellness_metrics.satisfaction_score >= 8 &&
                                                                            staff.wellness_metrics.work_life_balance >= 8 &&
                                                                            staff.wellness_metrics.stress_level === "low" && (_jsxs("div", { className: "flex items-center gap-2 text-green-600", children: [_jsx(CheckCircle, { className: "w-3 h-3" }), "Employee wellness is excellent - consider for mentoring role"] }))] })] }), _jsxs("div", { className: "mt-4 flex items-center justify-between", children: [_jsxs("div", { className: "text-sm text-gray-500", children: ["Last survey: ", staff.wellness_metrics.last_survey_date] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { size: "sm", variant: "outline", children: [_jsx(FileText, { className: "w-3 h-3 mr-1" }), "Send Survey"] }), _jsxs(Button, { size: "sm", variant: "outline", children: [_jsx(Calendar, { className: "w-3 h-3 mr-1" }), "Schedule Check-in"] })] })] })] }, staff._id))) }) })] })] }), _jsxs(TabsContent, { value: "background", className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold", children: "Automated Background Check & Verification Workflows" }), _jsx("p", { className: "text-sm text-gray-600", children: "Comprehensive background verification and compliance tracking" })] }), _jsxs(Button, { onClick: () => setShowBackgroundCheckDialog(true), children: [_jsx(UserCheck, { className: "w-4 h-4 mr-2" }), "Initiate Background Check"] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs(Card, { className: "border-green-200 bg-green-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-green-800", children: "Completed Checks" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-green-900", children: staffMembers.filter((s) => s.background_check?.status === "completed").length }), _jsx("p", { className: "text-xs text-green-600", children: "All verifications passed" })] })] }), _jsxs(Card, { className: "border-yellow-200 bg-yellow-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-yellow-800", children: "In Progress" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-yellow-900", children: staffMembers.filter((s) => s.background_check?.status === "in_progress").length }), _jsx("p", { className: "text-xs text-yellow-600", children: "Awaiting results" })] })] }), _jsxs(Card, { className: "border-orange-200 bg-orange-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-orange-800", children: "Pending" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-orange-900", children: staffMembers.filter((s) => s.background_check?.status === "pending").length }), _jsx("p", { className: "text-xs text-orange-600", children: "Need to be initiated" })] })] }), _jsxs(Card, { className: "border-red-200 bg-red-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-red-800", children: "Expiring Soon" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-red-900", children: "1" }), _jsx("p", { className: "text-xs text-red-600", children: "Require renewal" })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Background Check Status" }), _jsx(CardDescription, { children: "Comprehensive verification workflow tracking" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: filteredStaff.map((staff) => (_jsxs("div", { className: "border rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { children: [_jsxs("h4", { className: "font-medium", children: [staff.personal_info.first_name, " ", staff.personal_info.last_name] }), _jsx("p", { className: "text-sm text-gray-500", children: staff.employment_info.position })] }), _jsx(Badge, { variant: staff.background_check?.status === "completed"
                                                                        ? "default"
                                                                        : staff.background_check?.status === "in_progress"
                                                                            ? "secondary"
                                                                            : staff.background_check?.status === "failed"
                                                                                ? "destructive"
                                                                                : "outline", children: staff.background_check?.status || "Not Started" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Verification Level:" }), _jsx("p", { children: staff.background_check?.verification_level ||
                                                                                "N/A" })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Completed Date:" }), _jsx("p", { children: staff.background_check?.completed_date || "N/A" })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Expiry Date:" }), _jsx("p", { className: staff.background_check?.expiry_date &&
                                                                                new Date(staff.background_check.expiry_date) <
                                                                                    new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                                                                                ? "text-red-600 font-medium"
                                                                                : "", children: staff.background_check?.expiry_date || "N/A" })] })] }), staff.background_check?.notes && (_jsxs("div", { className: "mt-3 p-2 bg-gray-50 rounded text-sm", children: [_jsx("span", { className: "font-medium", children: "Notes:" }), " ", staff.background_check.notes] })), _jsxs("div", { className: "mt-3 flex gap-2", children: [_jsxs(Button, { size: "sm", variant: "outline", onClick: () => {
                                                                        setSelectedStaffForPortal(staff);
                                                                        setShowStaffPortalDialog(true);
                                                                    }, children: [_jsx(Settings, { className: "w-3 h-3 mr-1" }), "Configure Access"] }), _jsxs(Button, { size: "sm", variant: "outline", children: [_jsx(RefreshCw, { className: "w-3 h-3 mr-1" }), "Reset Password"] }), staff.self_service_portal?.pending_requests &&
                                                                    staff.self_service_portal.pending_requests > 0 && (_jsxs(Button, { size: "sm", variant: "outline", children: [_jsx(Eye, { className: "w-3 h-3 mr-1" }), "View Requests (", staff.self_service_portal.pending_requests, ")"] }))] })] }, staff._id))) }) })] })] }), _jsxs(TabsContent, { value: "mobile", className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold", children: "Mobile Time Tracking & Staff Portal" }), _jsx("p", { className: "text-sm text-gray-600", children: "Mobile app functionality and self-service portal management" })] }), _jsxs(Button, { onClick: () => setShowMobileSetupDialog(true), children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Setup Mobile Access"] }), _jsxs(Button, { onClick: () => setShowStaffPortalDialog(true), variant: "outline", children: [_jsx(Settings, { className: "w-4 h-4 mr-2" }), "Staff Portal Settings"] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs(Card, { className: "border-blue-200 bg-blue-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-blue-800", children: "Mobile Users" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-blue-900", children: staffMembers.filter((s) => s.mobile_access?.device_registered).length }), _jsx("p", { className: "text-xs text-blue-600", children: "Devices registered" })] })] }), _jsxs(Card, { className: "border-green-200 bg-green-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-green-800", children: "Active Portals" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-green-900", children: staffMembers.filter((s) => s.self_service_portal?.account_active).length }), _jsx("p", { className: "text-xs text-green-600", children: "Self-service accounts" })] })] }), _jsxs(Card, { className: "border-purple-200 bg-purple-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-purple-800", children: "Biometric Enabled" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-purple-900", children: staffMembers.filter((s) => s.mobile_access?.biometric_enabled).length }), _jsx("p", { className: "text-xs text-purple-600", children: "Enhanced security" })] })] }), _jsxs(Card, { className: "border-orange-200 bg-orange-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-orange-800", children: "Pending Requests" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-orange-900", children: staffMembers.reduce((sum, s) => sum + (s.self_service_portal?.pending_requests || 0), 0) }), _jsx("p", { className: "text-xs text-orange-600", children: "Require attention" })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Mobile & Portal Access Status" }), _jsx(CardDescription, { children: "Staff mobile app and self-service portal management" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: filteredStaff.map((staff) => (_jsxs("div", { className: "border rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { children: [_jsxs("h4", { className: "font-medium", children: [staff.personal_info.first_name, " ", staff.personal_info.last_name] }), _jsx("p", { className: "text-sm text-gray-500", children: staff.employment_info.position })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Badge, { variant: staff.mobile_access?.device_registered
                                                                                ? "default"
                                                                                : "secondary", children: staff.mobile_access?.device_registered
                                                                                ? "Mobile Active"
                                                                                : "No Mobile" }), _jsx(Badge, { variant: staff.self_service_portal?.account_active
                                                                                ? "default"
                                                                                : "secondary", children: staff.self_service_portal?.account_active
                                                                                ? "Portal Active"
                                                                                : "No Portal" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-3", children: [_jsx("h5", { className: "font-medium text-sm", children: "Mobile Access" }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Device Registered:" }), _jsx("span", { className: staff.mobile_access?.device_registered
                                                                                                ? "text-green-600"
                                                                                                : "text-gray-500", children: staff.mobile_access?.device_registered
                                                                                                ? "Yes"
                                                                                                : "No" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Last Login:" }), _jsx("span", { children: staff.mobile_access?.last_login
                                                                                                ? new Date(staff.mobile_access.last_login).toLocaleDateString()
                                                                                                : "Never" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "App Version:" }), _jsx("span", { children: staff.mobile_access?.app_version || "N/A" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Biometric:" }), _jsx("span", { className: staff.mobile_access?.biometric_enabled
                                                                                                ? "text-green-600"
                                                                                                : "text-gray-500", children: staff.mobile_access?.biometric_enabled
                                                                                                ? "Enabled"
                                                                                                : "Disabled" })] })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("h5", { className: "font-medium text-sm", children: "Self-Service Portal" }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Account Status:" }), _jsx("span", { className: staff.self_service_portal?.account_active
                                                                                                ? "text-green-600"
                                                                                                : "text-gray-500", children: staff.self_service_portal?.account_active
                                                                                                ? "Active"
                                                                                                : "Inactive" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Last Access:" }), _jsx("span", { children: staff.self_service_portal?.last_access
                                                                                                ? new Date(staff.self_service_portal.last_access).toLocaleDateString()
                                                                                                : "Never" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Pending Requests:" }), _jsx("span", { className: staff.self_service_portal?.pending_requests
                                                                                                ? "text-orange-600"
                                                                                                : "text-gray-500", children: staff.self_service_portal?.pending_requests ||
                                                                                                0 })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Completed Trainings:" }), _jsx("span", { className: "text-blue-600", children: staff.self_service_portal
                                                                                                ?.completed_trainings || 0 })] })] })] })] }), _jsxs("div", { className: "mt-4 flex gap-2", children: [_jsxs(Button, { size: "sm", variant: "outline", children: [_jsx(Settings, { className: "w-3 h-3 mr-1" }), "Configure Access"] }), _jsxs(Button, { size: "sm", variant: "outline", children: [_jsx(RefreshCw, { className: "w-3 h-3 mr-1" }), "Reset Password"] }), staff.self_service_portal?.pending_requests &&
                                                                    staff.self_service_portal.pending_requests > 0 && (_jsxs(Button, { size: "sm", variant: "outline", children: [_jsx(Eye, { className: "w-3 h-3 mr-1" }), "View Requests (", staff.self_service_portal.pending_requests, ")"] }))] })] }, staff._id))) }) })] })] })] }), selectedStaff && (_jsx(Dialog, { open: !!selectedStaff, onOpenChange: () => setSelectedStaff(null), children: _jsxs(DialogContent, { className: "max-w-4xl max-h-[80vh] overflow-y-auto", children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { children: [selectedStaff.personal_info.first_name, " ", selectedStaff.personal_info.last_name] }), _jsxs(DialogDescription, { children: [selectedStaff.employment_info.position, " -", " ", selectedStaff.employee_id] })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-3", children: "Personal Information" }), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Emirates ID:" }), _jsx("p", { children: selectedStaff.personal_info.emirates_id })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Nationality:" }), _jsx("p", { children: selectedStaff.personal_info.nationality })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Date of Birth:" }), _jsx("p", { children: selectedStaff.personal_info.date_of_birth })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Gender:" }), _jsx("p", { children: selectedStaff.personal_info.gender })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Phone:" }), _jsx("p", { children: selectedStaff.personal_info.phone })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Email:" }), _jsx("p", { children: selectedStaff.personal_info.email })] })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-3", children: "Employment Information" }), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Start Date:" }), _jsx("p", { children: selectedStaff.employment_info.start_date })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Employment Type:" }), _jsx("p", { children: selectedStaff.employment_info.employment_type })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Salary:" }), _jsxs("p", { children: ["AED", " ", selectedStaff.employment_info.salary.toLocaleString()] })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Status:" }), _jsx("div", { children: getStatusBadge(selectedStaff.employment_info.status) })] })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-3", children: "Qualifications" }), _jsxs("div", { className: "text-sm", children: [_jsxs("div", { className: "mb-2", children: [_jsx("span", { className: "font-medium", children: "Degree:" }), _jsx("p", { children: selectedStaff.qualifications.degree })] }), _jsxs("div", { className: "mb-2", children: [_jsx("span", { className: "font-medium", children: "Institution:" }), _jsx("p", { children: selectedStaff.qualifications.institution })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Graduation Year:" }), _jsx("p", { children: selectedStaff.qualifications.graduation_year })] })] })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setSelectedStaff(null), children: "Close" }), _jsx(Button, { children: "Edit Staff Member" })] })] }) })), _jsx(Dialog, { open: showStaffPortalDialog, onOpenChange: setShowStaffPortalDialog, children: _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { className: "flex items-center gap-2", children: [_jsx(Settings, { className: "w-5 h-5" }), "Staff Portal Configuration"] }), _jsx(DialogDescription, { children: selectedStaffForPortal
                                            ? `Configure portal access for ${selectedStaffForPortal.personal_info.first_name} ${selectedStaffForPortal.personal_info.last_name}`
                                            : "Configure staff portal settings and permissions" })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-3", children: "Available Portal Features" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between p-3 border rounded", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(CheckCircle, { className: "w-4 h-4 text-green-600" }), _jsx("span", { className: "text-sm", children: "Personal Information Management" })] }), _jsx(Badge, { variant: "default", children: "Active" })] }), _jsxs("div", { className: "flex items-center justify-between p-3 border rounded", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(CheckCircle, { className: "w-4 h-4 text-green-600" }), _jsx("span", { className: "text-sm", children: "Timesheet Submission" })] }), _jsx(Badge, { variant: "default", children: "Active" })] }), _jsxs("div", { className: "flex items-center justify-between p-3 border rounded", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(CheckCircle, { className: "w-4 h-4 text-green-600" }), _jsx("span", { className: "text-sm", children: "Leave Request Management" })] }), _jsx(Badge, { variant: "default", children: "Active" })] }), _jsxs("div", { className: "flex items-center justify-between p-3 border rounded", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(CheckCircle, { className: "w-4 h-4 text-green-600" }), _jsx("span", { className: "text-sm", children: "Training Course Access" })] }), _jsx(Badge, { variant: "default", children: "Active" })] }), _jsxs("div", { className: "flex items-center justify-between p-3 border rounded", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(CheckCircle, { className: "w-4 h-4 text-green-600" }), _jsx("span", { className: "text-sm", children: "Performance Dashboard" })] }), _jsx(Badge, { variant: "default", children: "Active" })] }), _jsxs("div", { className: "flex items-center justify-between p-3 border rounded", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(CheckCircle, { className: "w-4 h-4 text-green-600" }), _jsx("span", { className: "text-sm", children: "Document Repository Access" })] }), _jsx(Badge, { variant: "default", children: "Active" })] })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-3", children: "Security & Access Settings" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Shield, { className: "w-4 h-4 text-green-600" }), _jsx("span", { className: "text-sm", children: "Two-Factor Authentication" })] }), _jsx(Badge, { variant: "default", children: "Enabled" })] }), _jsxs("div", { className: "flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "w-4 h-4 text-blue-600" }), _jsx("span", { className: "text-sm", children: "Session Timeout" })] }), _jsx(Badge, { variant: "outline", children: "30 minutes" })] }), _jsxs("div", { className: "flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Eye, { className: "w-4 h-4 text-purple-600" }), _jsx("span", { className: "text-sm", children: "Audit Logging" })] }), _jsx(Badge, { variant: "default", children: "Enabled" })] })] })] }), selectedStaffForPortal && (_jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-3", children: "Usage Statistics" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "text-center p-3 bg-gray-50 rounded", children: [_jsx("div", { className: "text-lg font-bold text-blue-600", children: selectedStaffForPortal.self_service_portal
                                                                    ?.completed_trainings || 0 }), _jsx("div", { className: "text-xs text-gray-600", children: "Completed Trainings" })] }), _jsxs("div", { className: "text-center p-3 bg-gray-50 rounded", children: [_jsx("div", { className: "text-lg font-bold text-orange-600", children: selectedStaffForPortal.self_service_portal
                                                                    ?.pending_requests || 0 }), _jsx("div", { className: "text-xs text-gray-600", children: "Pending Requests" })] })] })] }))] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => {
                                            setShowStaffPortalDialog(false);
                                            setSelectedStaffForPortal(null);
                                        }, children: "Close" }), _jsx(Button, { children: "Save Configuration" })] })] }) })] }) }));
}
