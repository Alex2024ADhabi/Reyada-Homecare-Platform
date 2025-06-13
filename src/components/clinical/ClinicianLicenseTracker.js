import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { FileText, Search, Plus, Edit, Trash2, CheckCircle, AlertCircle, Clock, RefreshCw, Download, Bell, AlertTriangle, CheckSquare, XSquare, } from "lucide-react";
import { useOfflineSync } from "@/hooks/useOfflineSync";
const ClinicianLicenseTracker = ({ isOffline = false, }) => {
    const { isOnline } = useOfflineSync();
    const [activeTab, setActiveTab] = useState("active");
    const [licenses, setLicenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLicense, setSelectedLicense] = useState(null);
    const [showNewLicenseDialog, setShowNewLicenseDialog] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    // Form states for new license
    const [newLicense, setNewLicense] = useState({
        clinician_name: "",
        employee_id: "",
        role: "",
        department: "",
        license_number: "",
        license_type: "",
        issuing_authority: "",
        issue_date: "",
        expiry_date: "",
    });
    // Mock data for licenses
    const mockLicenses = [
        {
            id: "1",
            clinician_name: "Dr. Sarah Ahmed",
            employee_id: "EMP001",
            role: "Physician",
            department: "Internal Medicine",
            license_number: "DOH-MD-12345",
            license_type: "Medical Doctor",
            issuing_authority: "DOH Abu Dhabi",
            issue_date: "2023-01-15",
            expiry_date: "2024-01-14",
            license_status: "Active",
            renewal_notification_date: "2023-12-15",
            renewal_initiated: false,
            renewal_completed: false,
            renewal_completion_date: null,
            continuing_education_completed: true,
            continuing_education_hours: 50,
            compliance_status: "Compliant",
            currently_active_for_claims: true,
            last_used_for_claim: "2023-10-15",
            total_claims_associated: 45,
            created_at: "2023-01-10",
            updated_at: "2023-10-15",
        },
        {
            id: "2",
            clinician_name: "Fatima Al Hashemi",
            employee_id: "EMP002",
            role: "Nurse",
            department: "Home Care",
            license_number: "DOH-RN-67890",
            license_type: "Registered Nurse",
            issuing_authority: "DOH Abu Dhabi",
            issue_date: "2023-03-20",
            expiry_date: "2023-11-30",
            license_status: "Expired",
            renewal_notification_date: "2023-10-30",
            renewal_initiated: true,
            renewal_completed: false,
            renewal_completion_date: null,
            continuing_education_completed: false,
            continuing_education_hours: 20,
            compliance_status: "Non-Compliant",
            currently_active_for_claims: false,
            last_used_for_claim: "2023-11-25",
            total_claims_associated: 78,
            created_at: "2023-03-15",
            updated_at: "2023-11-26",
        },
        {
            id: "3",
            clinician_name: "Mohammed Al Zaabi",
            employee_id: "EMP003",
            role: "Physical Therapist",
            department: "Rehabilitation",
            license_number: "DOH-PT-54321",
            license_type: "Physical Therapist",
            issuing_authority: "DOH Abu Dhabi",
            issue_date: "2023-05-10",
            expiry_date: "2024-05-09",
            license_status: "Active",
            renewal_notification_date: null,
            renewal_initiated: false,
            renewal_completed: false,
            renewal_completion_date: null,
            continuing_education_completed: true,
            continuing_education_hours: 40,
            compliance_status: "Compliant",
            currently_active_for_claims: true,
            last_used_for_claim: "2023-10-20",
            total_claims_associated: 32,
            created_at: "2023-05-05",
            updated_at: "2023-10-20",
        },
        {
            id: "4",
            clinician_name: "Aisha Al Dhaheri",
            employee_id: "EMP004",
            role: "Occupational Therapist",
            department: "Rehabilitation",
            license_number: "DOH-OT-98765",
            license_type: "Occupational Therapist",
            issuing_authority: "DOH Abu Dhabi",
            issue_date: "2023-02-15",
            expiry_date: "2023-12-15",
            license_status: "Pending Renewal",
            renewal_notification_date: "2023-11-15",
            renewal_initiated: true,
            renewal_completed: false,
            renewal_completion_date: null,
            continuing_education_completed: true,
            continuing_education_hours: 35,
            compliance_status: "Under Review",
            currently_active_for_claims: true,
            last_used_for_claim: "2023-11-10",
            total_claims_associated: 28,
            created_at: "2023-02-10",
            updated_at: "2023-11-15",
        },
    ];
    // Load licenses on component mount
    useEffect(() => {
        const fetchLicenses = async () => {
            try {
                // In a real implementation, this would be an API call
                // For now, we'll use mock data
                setLicenses(mockLicenses);
            }
            catch (error) {
                console.error("Error fetching clinician licenses:", error);
            }
            finally {
                setLoading(false);
            }
        };
        fetchLicenses();
    }, []);
    // Handle input change for new license form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewLicense({
            ...newLicense,
            [name]: value,
        });
    };
    // Create new license
    const handleCreateLicense = () => {
        const newLicenseData = {
            id: `${Date.now()}`,
            ...newLicense,
            license_status: "Active",
            renewal_notification_date: null,
            renewal_initiated: false,
            renewal_completed: false,
            renewal_completion_date: null,
            continuing_education_completed: false,
            continuing_education_hours: 0,
            compliance_status: "Compliant",
            currently_active_for_claims: true,
            last_used_for_claim: null,
            total_claims_associated: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        setLicenses([...licenses, newLicenseData]);
        setShowNewLicenseDialog(false);
        setNewLicense({
            clinician_name: "",
            employee_id: "",
            role: "",
            department: "",
            license_number: "",
            license_type: "",
            issuing_authority: "",
            issue_date: "",
            expiry_date: "",
        });
    };
    // Delete license
    const handleDeleteLicense = (id) => {
        if (!confirm("Are you sure you want to delete this license?"))
            return;
        setLicenses(licenses.filter((license) => license.id !== id));
        if (selectedLicense?.id === id) {
            setSelectedLicense(null);
        }
    };
    // Initiate license renewal
    const handleInitiateRenewal = (id) => {
        setLicenses(licenses.map((license) => license.id === id
            ? {
                ...license,
                renewal_initiated: true,
                renewal_notification_date: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }
            : license));
        if (selectedLicense?.id === id) {
            setSelectedLicense({
                ...selectedLicense,
                renewal_initiated: true,
                renewal_notification_date: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            });
        }
    };
    // Complete license renewal
    const handleCompleteRenewal = (id) => {
        const today = new Date();
        const nextYear = new Date(today);
        nextYear.setFullYear(today.getFullYear() + 1);
        setLicenses(licenses.map((license) => license.id === id
            ? {
                ...license,
                renewal_initiated: true,
                renewal_completed: true,
                renewal_completion_date: today.toISOString(),
                license_status: "Active",
                issue_date: today.toISOString().split("T")[0],
                expiry_date: nextYear.toISOString().split("T")[0],
                updated_at: today.toISOString(),
            }
            : license));
        if (selectedLicense?.id === id) {
            setSelectedLicense({
                ...selectedLicense,
                renewal_initiated: true,
                renewal_completed: true,
                renewal_completion_date: today.toISOString(),
                license_status: "Active",
                issue_date: today.toISOString().split("T")[0],
                expiry_date: nextYear.toISOString().split("T")[0],
                updated_at: today.toISOString(),
            });
        }
    };
    // Filter licenses based on active tab and search query
    const filteredLicenses = licenses.filter((license) => {
        const matchesSearch = license.clinician_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
            license.license_number
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            license.role.toLowerCase().includes(searchQuery.toLowerCase());
        if (activeTab === "active") {
            return license.license_status === "Active" && matchesSearch;
        }
        else if (activeTab === "pending") {
            return license.license_status === "Pending Renewal" && matchesSearch;
        }
        else if (activeTab === "expired") {
            return license.license_status === "Expired" && matchesSearch;
        }
        else {
            return matchesSearch;
        }
    });
    // Calculate days until expiration
    const getDaysUntilExpiration = (expiryDate) => {
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };
    // Get badge variant based on license status
    const getLicenseStatusBadgeVariant = (status) => {
        switch (status) {
            case "Active":
                return "default";
            case "Pending Renewal":
                return "warning";
            case "Expired":
                return "destructive";
            case "Suspended":
                return "destructive";
            default:
                return "secondary";
        }
    };
    // Get badge variant based on compliance status
    const getComplianceStatusBadgeVariant = (status) => {
        switch (status) {
            case "Compliant":
                return "default";
            case "Non-Compliant":
                return "destructive";
            case "Under Review":
                return "warning";
            default:
                return "secondary";
        }
    };
    return (_jsxs("div", { className: "w-full h-full bg-background p-4 md:p-6", children: [_jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold", children: "Clinician License Tracker" }), _jsx("p", { className: "text-muted-foreground", children: "Manage and monitor clinician licenses and compliance status" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: isOffline ? "destructive" : "secondary", className: "text-xs", children: isOffline ? "Offline Mode" : "Online" }), _jsxs(Button, { onClick: () => setShowNewLicenseDialog(true), children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), " Add New License"] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-6 mb-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Total Licenses" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: licenses.length }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Across all departments" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Active Licenses" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: licenses.filter((l) => l.license_status === "Active").length }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Valid and compliant" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Pending Renewal" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: licenses.filter((l) => l.license_status === "Pending Renewal")
                                            .length }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Renewal in progress" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Expired Licenses" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-destructive", children: licenses.filter((l) => l.license_status === "Expired").length }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Requires immediate attention" })] })] })] }), _jsxs("div", { className: "flex flex-col md:flex-row gap-4 mb-6", children: [_jsxs("div", { className: "relative w-full md:w-96", children: [_jsx(Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }), _jsx(Input, { placeholder: "Search licenses...", className: "pl-8", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value) })] }), _jsx(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full md:w-auto", children: _jsxs(TabsList, { children: [_jsxs(TabsTrigger, { value: "active", children: [_jsx(CheckCircle, { className: "h-4 w-4 mr-2" }), " Active"] }), _jsxs(TabsTrigger, { value: "pending", children: [_jsx(Clock, { className: "h-4 w-4 mr-2" }), " Pending"] }), _jsxs(TabsTrigger, { value: "expired", children: [_jsx(AlertCircle, { className: "h-4 w-4 mr-2" }), " Expired"] }), _jsxs(TabsTrigger, { value: "all", children: [_jsx(FileText, { className: "h-4 w-4 mr-2" }), " All"] })] }) })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs(Card, { className: "lg:col-span-2", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "License Registry" }), _jsx(CardDescription, { children: "View and manage all clinician licenses" })] }), _jsx(CardContent, { children: loading ? (_jsx("div", { className: "flex items-center justify-center h-[400px]", children: _jsx(RefreshCw, { className: "h-8 w-8 animate-spin text-muted-foreground" }) })) : filteredLicenses.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center justify-center h-[400px] text-center", children: [_jsx(FileText, { className: "h-16 w-16 text-muted-foreground mb-4" }), _jsx("h3", { className: "text-lg font-medium mb-2", children: "No Licenses Found" }), _jsx("p", { className: "text-sm text-muted-foreground max-w-md", children: searchQuery
                                                ? "No licenses match your search criteria."
                                                : "No licenses found in this category." }), _jsxs(Button, { onClick: () => setShowNewLicenseDialog(true), className: "mt-4", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), " Add New License"] })] })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Clinician" }), _jsx(TableHead, { children: "Role" }), _jsx(TableHead, { children: "License Number" }), _jsx(TableHead, { children: "Expiry Date" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { children: "Actions" })] }) }), _jsx(TableBody, { children: filteredLicenses.map((license) => {
                                                    const daysUntilExpiry = getDaysUntilExpiration(license.expiry_date);
                                                    return (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: license.clinician_name }), _jsx(TableCell, { children: license.role }), _jsx(TableCell, { children: license.license_number }), _jsx(TableCell, { children: _jsxs("div", { className: "flex flex-col", children: [_jsx("span", { children: new Date(license.expiry_date).toLocaleDateString() }), daysUntilExpiry > 0 && daysUntilExpiry <= 30 && (_jsxs("span", { className: "text-xs text-amber-500", children: [daysUntilExpiry, " days remaining"] })), daysUntilExpiry <= 0 && (_jsx("span", { className: "text-xs text-destructive", children: "Expired" }))] }) }), _jsx(TableCell, { children: _jsx(Badge, { variant: getLicenseStatusBadgeVariant(license.license_status), children: license.license_status }) }), _jsx(TableCell, { children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => setSelectedLicense(license), children: _jsx(Edit, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleDeleteLicense(license.id), children: _jsx(Trash2, { className: "h-4 w-4" }) })] }) })] }, license.id));
                                                }) })] }) })) }), _jsxs(CardFooter, { className: "flex justify-between border-t pt-4", children: [_jsxs("div", { className: "text-sm text-muted-foreground", children: ["Showing ", filteredLicenses.length, " of ", licenses.length, " licenses"] }), _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), " Export"] })] })] }), _jsx(Card, { children: selectedLicense ? (_jsxs(_Fragment, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: selectedLicense.clinician_name }), _jsxs(CardDescription, { children: [selectedLicense.role, " \u2022 ", selectedLicense.department] })] }), _jsx(Badge, { variant: getLicenseStatusBadgeVariant(selectedLicense.license_status), children: selectedLicense.license_status })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium mb-2", children: "License Details" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "License Number:" }), _jsx("span", { className: "font-medium", children: selectedLicense.license_number })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "License Type:" }), _jsx("span", { children: selectedLicense.license_type })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Issuing Authority:" }), _jsx("span", { children: selectedLicense.issuing_authority })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Issue Date:" }), _jsx("span", { children: new Date(selectedLicense.issue_date).toLocaleDateString() })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Expiry Date:" }), _jsx("span", { className: getDaysUntilExpiration(selectedLicense.expiry_date) <= 0
                                                                            ? "text-destructive font-medium"
                                                                            : "", children: new Date(selectedLicense.expiry_date).toLocaleDateString() })] })] })] }), _jsx(Separator, {}), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium mb-2", children: "Compliance Status" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Status:" }), _jsx(Badge, { variant: getComplianceStatusBadgeVariant(selectedLicense.compliance_status), children: selectedLicense.compliance_status })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "CE Completed:" }), _jsx("span", { children: selectedLicense.continuing_education_completed ? (_jsx(CheckSquare, { className: "h-4 w-4 text-green-500" })) : (_jsx(XSquare, { className: "h-4 w-4 text-red-500" })) })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "CE Hours:" }), _jsx("span", { children: selectedLicense.continuing_education_hours })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Active for Claims:" }), _jsx("span", { children: selectedLicense.currently_active_for_claims ? (_jsx(CheckSquare, { className: "h-4 w-4 text-green-500" })) : (_jsx(XSquare, { className: "h-4 w-4 text-red-500" })) })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Claims Associated:" }), _jsx("span", { children: selectedLicense.total_claims_associated })] })] })] }), _jsx(Separator, {}), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium mb-2", children: "Renewal Status" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Renewal Initiated:" }), _jsx("span", { children: selectedLicense.renewal_initiated ? (_jsx(CheckSquare, { className: "h-4 w-4 text-green-500" })) : (_jsx(XSquare, { className: "h-4 w-4 text-red-500" })) })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Renewal Completed:" }), _jsx("span", { children: selectedLicense.renewal_completed ? (_jsx(CheckSquare, { className: "h-4 w-4 text-green-500" })) : (_jsx(XSquare, { className: "h-4 w-4 text-red-500" })) })] }), selectedLicense.renewal_notification_date && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Notification Date:" }), _jsx("span", { children: new Date(selectedLicense.renewal_notification_date).toLocaleDateString() })] })), selectedLicense.renewal_completion_date && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Completion Date:" }), _jsx("span", { children: new Date(selectedLicense.renewal_completion_date).toLocaleDateString() })] }))] })] })] }) }), _jsxs(CardFooter, { className: "flex flex-col gap-2 border-t pt-4", children: [selectedLicense.license_status === "Active" &&
                                            getDaysUntilExpiration(selectedLicense.expiry_date) <= 30 && (_jsxs(Button, { className: "w-full", onClick: () => handleInitiateRenewal(selectedLicense.id), disabled: selectedLicense.renewal_initiated, children: [_jsx(Bell, { className: "h-4 w-4 mr-2" }), selectedLicense.renewal_initiated
                                                    ? "Renewal In Progress"
                                                    : "Initiate Renewal"] })), (selectedLicense.license_status === "Expired" ||
                                            selectedLicense.license_status === "Pending Renewal") && (_jsxs(Button, { className: "w-full", onClick: () => handleCompleteRenewal(selectedLicense.id), disabled: selectedLicense.renewal_completed, children: [_jsx(CheckCircle, { className: "h-4 w-4 mr-2" }), selectedLicense.renewal_completed
                                                    ? "Renewal Completed"
                                                    : "Complete Renewal"] })), selectedLicense.license_status === "Expired" &&
                                            !selectedLicense.renewal_initiated && (_jsxs(Button, { className: "w-full", variant: "destructive", onClick: () => handleInitiateRenewal(selectedLicense.id), children: [_jsx(AlertTriangle, { className: "h-4 w-4 mr-2" }), "Urgent: Initiate Renewal"] }))] })] })) : (_jsxs("div", { className: "flex flex-col items-center justify-center h-[500px] text-center p-4", children: [_jsx(FileText, { className: "h-16 w-16 text-muted-foreground mb-4" }), _jsx("h3", { className: "text-lg font-medium mb-2", children: "No License Selected" }), _jsx("p", { className: "text-sm text-muted-foreground max-w-md", children: "Select a license from the list to view details and manage renewals." })] })) })] }), _jsx(Dialog, { open: showNewLicenseDialog, onOpenChange: setShowNewLicenseDialog, children: _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Add New License" }), _jsx(DialogDescription, { children: "Enter the details for the new clinician license" })] }), _jsxs("div", { className: "space-y-4 py-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "clinician_name", children: "Clinician Name" }), _jsx(Input, { id: "clinician_name", name: "clinician_name", value: newLicense.clinician_name, onChange: handleInputChange })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "employee_id", children: "Employee ID" }), _jsx(Input, { id: "employee_id", name: "employee_id", value: newLicense.employee_id, onChange: handleInputChange })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "role", children: "Role" }), _jsx(Input, { id: "role", name: "role", value: newLicense.role, onChange: handleInputChange })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "department", children: "Department" }), _jsx(Input, { id: "department", name: "department", value: newLicense.department, onChange: handleInputChange })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "license_number", children: "License Number" }), _jsx(Input, { id: "license_number", name: "license_number", value: newLicense.license_number, onChange: handleInputChange })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "license_type", children: "License Type" }), _jsx(Input, { id: "license_type", name: "license_type", value: newLicense.license_type, onChange: handleInputChange })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "issuing_authority", children: "Issuing Authority" }), _jsx(Input, { id: "issuing_authority", name: "issuing_authority", value: newLicense.issuing_authority, onChange: handleInputChange })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "issue_date", children: "Issue Date" }), _jsx(Input, { id: "issue_date", name: "issue_date", type: "date", value: newLicense.issue_date, onChange: handleInputChange })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "expiry_date", children: "Expiry Date" }), _jsx(Input, { id: "expiry_date", name: "expiry_date", type: "date", value: newLicense.expiry_date, onChange: handleInputChange })] })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setShowNewLicenseDialog(false), children: "Cancel" }), _jsx(Button, { onClick: handleCreateLicense, children: "Add License" })] })] }) })] }));
};
export default ClinicianLicenseTracker;
