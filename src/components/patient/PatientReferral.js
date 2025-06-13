import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { CalendarIcon, CheckCircle, Filter, MoreVertical, Plus, Search, UserPlus, } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import ReferralService from "@/services/referral.service";
// Using the ReferralData interface from the service
const PatientReferral = () => {
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState("");
    const [isNewReferralDialogOpen, setIsNewReferralDialogOpen] = useState(false);
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
    const [selectedReferral, setSelectedReferral] = useState(null);
    const [activeTab, setActiveTab] = useState("all");
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [referrals, setReferrals] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    // Form state for new referral
    const [newReferral, setNewReferral] = useState({
        referralDate: new Date(),
        referralSource: "daman",
        referralSourceContact: "",
        patientName: "",
        patientContact: "",
        preliminaryNeeds: "",
        insuranceInfo: "",
        geographicLocation: "",
        acknowledgmentStatus: "Pending",
        initialContactCompleted: false,
        documentationPrepared: false,
        referralStatus: "New",
    });
    // Form state for staff assignment
    const [staffAssignment, setStaffAssignment] = useState({
        nurseSupervisor: "",
        chargeNurse: "",
        caseCoordinator: "",
        assessmentDate: new Date(),
        initialContactCompleted: false,
        documentationPrepared: false,
    });
    // Fetch referrals on component mount
    useEffect(() => {
        fetchReferrals();
    }, []);
    // Fetch all referrals from the API
    const fetchReferrals = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await ReferralService.getAllReferrals();
            setReferrals(data);
        }
        catch (err) {
            console.error("Error fetching referrals:", err);
            setError("Failed to load referrals. Please try again later.");
            // Use mock data as fallback during development
            setReferrals([
                {
                    id: "REF001",
                    referralDate: new Date(2023, 5, 15),
                    referralSource: "Daman",
                    referralSourceContact: "Dr. Ahmed Al Zaabi, +971 50 123 4567",
                    patientName: "Fatima Al Hashemi",
                    patientContact: "+971 55 765 4321",
                    preliminaryNeeds: "Post-surgical wound care and mobility assistance",
                    insuranceInfo: "Daman Enhanced, Policy #DHA-12345",
                    geographicLocation: "Abu Dhabi, Khalidiya",
                    acknowledgmentStatus: "Acknowledged",
                    acknowledgmentDate: new Date(2023, 5, 15),
                    acknowledgedBy: "Nurse Sarah",
                    assignedNurseSupervisor: "Mariam Al Ali",
                    assignedChargeNurse: "Fatima Hassan",
                    initialContactCompleted: true,
                    documentationPrepared: true,
                    referralStatus: "In Progress",
                    statusNotes: "Initial assessment scheduled",
                },
                {
                    id: "REF002",
                    referralDate: new Date(2023, 5, 18),
                    referralSource: "SEHA",
                    referralSourceContact: "Dr. Mohammed Al Mansoori, +971 50 987 6543",
                    patientName: "Ahmed Al Suwaidi",
                    patientContact: "+971 54 321 7654",
                    preliminaryNeeds: "Diabetes management and education",
                    insuranceInfo: "Thiqa, Policy #THQ-56789",
                    geographicLocation: "Abu Dhabi, Al Reem Island",
                    acknowledgmentStatus: "Pending",
                    initialContactCompleted: false,
                    documentationPrepared: false,
                    referralStatus: "New",
                },
                {
                    id: "REF003",
                    referralDate: new Date(2023, 5, 10),
                    referralSource: "DOH",
                    referralSourceContact: "Dr. Aisha Al Zaabi, +971 56 543 2109",
                    patientName: "Khalid Al Mazrouei",
                    patientContact: "+971 52 876 5432",
                    preliminaryNeeds: "Respiratory therapy and oxygen management",
                    insuranceInfo: "Daman Basic, Policy #DHA-67890",
                    geographicLocation: "Abu Dhabi, Al Bateen",
                    acknowledgmentStatus: "Processed",
                    acknowledgmentDate: new Date(2023, 5, 10),
                    acknowledgedBy: "Nurse Ahmed",
                    assignedNurseSupervisor: "Noura Al Shamsi",
                    assignedChargeNurse: "Hamad Al Dhaheri",
                    assignedCaseCoordinator: "Latifa Al Nuaimi",
                    assessmentScheduledDate: new Date(2023, 5, 12),
                    initialContactCompleted: true,
                    documentationPrepared: true,
                    referralStatus: "Accepted",
                    statusNotes: "Care plan initiated",
                },
                {
                    id: "REF004",
                    referralDate: new Date(2023, 5, 17),
                    referralSource: "ZHO",
                    referralSourceContact: "Dr. Saeed Al Neyadi, +971 50 345 6789",
                    patientName: "Maryam Al Dhaheri",
                    patientContact: "+971 55 432 1098",
                    preliminaryNeeds: "Pediatric home care for chronic condition",
                    insuranceInfo: "Daman Premium, Policy #DHA-24680",
                    geographicLocation: "Abu Dhabi, Yas Island",
                    acknowledgmentStatus: "Acknowledged",
                    acknowledgmentDate: new Date(2023, 5, 17),
                    acknowledgedBy: "Nurse Fatima",
                    assignedNurseSupervisor: "Hessa Al Falasi",
                    initialContactCompleted: true,
                    documentationPrepared: false,
                    referralStatus: "In Progress",
                    statusNotes: "Awaiting insurance approval",
                },
            ]);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleReferralSelect = (referral) => {
        setSelectedReferral(referral);
    };
    const handleAssignStaff = (referral) => {
        setSelectedReferral(referral);
        // Reset staff assignment form
        setStaffAssignment({
            nurseSupervisor: referral.assignedNurseSupervisor || "",
            chargeNurse: referral.assignedChargeNurse || "",
            caseCoordinator: referral.assignedCaseCoordinator || "",
            assessmentDate: referral.assessmentScheduledDate
                ? new Date(referral.assessmentScheduledDate)
                : new Date(),
            initialContactCompleted: referral.initialContactCompleted || false,
            documentationPrepared: referral.documentationPrepared || false,
        });
        setIsAssignDialogOpen(true);
    };
    // Handle form input changes for new referral
    const handleNewReferralChange = (field, value) => {
        setNewReferral((prev) => ({
            ...prev,
            [field]: value,
        }));
    };
    // Handle form input changes for staff assignment
    const handleStaffAssignmentChange = (field, value) => {
        setStaffAssignment((prev) => ({
            ...prev,
            [field]: value,
        }));
    };
    // Submit new referral
    const handleSubmitReferral = async () => {
        try {
            setIsLoading(true);
            const response = await ReferralService.createReferral(newReferral);
            setReferrals((prev) => [response, ...prev]);
            setIsNewReferralDialogOpen(false);
            toast({
                title: "Success",
                description: "Referral created successfully",
                variant: "default",
            });
            // Reset form
            setNewReferral({
                referralDate: new Date(),
                referralSource: "daman",
                referralSourceContact: "",
                patientName: "",
                patientContact: "",
                preliminaryNeeds: "",
                insuranceInfo: "",
                geographicLocation: "",
                acknowledgmentStatus: "Pending",
                initialContactCompleted: false,
                documentationPrepared: false,
                referralStatus: "New",
            });
        }
        catch (err) {
            console.error("Error creating referral:", err);
            toast({
                title: "Error",
                description: "Failed to create referral. Please try again.",
                variant: "destructive",
            });
        }
        finally {
            setIsLoading(false);
        }
    };
    // Submit staff assignment
    const handleSubmitStaffAssignment = async () => {
        if (!selectedReferral?.id)
            return;
        try {
            setIsLoading(true);
            // Prepare assignment data
            const assignmentData = {
                nurseSupervisor: staffAssignment.nurseSupervisor,
                chargeNurse: staffAssignment.chargeNurse,
                caseCoordinator: staffAssignment.caseCoordinator,
                assessmentDate: staffAssignment.assessmentDate,
            };
            // Assign staff
            const updatedReferral = await ReferralService.assignStaff(selectedReferral.id, assignmentData);
            // Update contact status if changed
            if (staffAssignment.initialContactCompleted !==
                selectedReferral.initialContactCompleted) {
                await ReferralService.markInitialContact(selectedReferral.id, staffAssignment.initialContactCompleted);
            }
            // Update documentation status if changed
            if (staffAssignment.documentationPrepared !==
                selectedReferral.documentationPrepared) {
                await ReferralService.markDocumentationPrepared(selectedReferral.id, staffAssignment.documentationPrepared);
            }
            // Update referrals list
            setReferrals((prev) => prev.map((ref) => ref.id === selectedReferral.id
                ? {
                    ...ref,
                    assignedNurseSupervisor: staffAssignment.nurseSupervisor,
                    assignedChargeNurse: staffAssignment.chargeNurse,
                    assignedCaseCoordinator: staffAssignment.caseCoordinator,
                    assessmentScheduledDate: staffAssignment.assessmentDate,
                    initialContactCompleted: staffAssignment.initialContactCompleted,
                    documentationPrepared: staffAssignment.documentationPrepared,
                }
                : ref));
            setIsAssignDialogOpen(false);
            toast({
                title: "Success",
                description: "Staff assigned successfully",
                variant: "default",
            });
        }
        catch (err) {
            console.error("Error assigning staff:", err);
            toast({
                title: "Error",
                description: "Failed to assign staff. Please try again.",
                variant: "destructive",
            });
        }
        finally {
            setIsLoading(false);
        }
    };
    // Update referral status
    const handleUpdateStatus = async (id, status, notes) => {
        try {
            setIsLoading(true);
            const updatedReferral = await ReferralService.updateStatus(id, status, notes);
            // Update referrals list
            setReferrals((prev) => prev.map((ref) => ref.id === id
                ? {
                    ...ref,
                    referralStatus: status,
                    statusNotes: notes || ref.statusNotes,
                }
                : ref));
            toast({
                title: "Success",
                description: `Referral status updated to ${status}`,
                variant: "default",
            });
        }
        catch (err) {
            console.error("Error updating status:", err);
            toast({
                title: "Error",
                description: "Failed to update status. Please try again.",
                variant: "destructive",
            });
        }
        finally {
            setIsLoading(false);
        }
    };
    // Acknowledge referral
    const handleAcknowledgeReferral = async (id, acknowledgedBy) => {
        try {
            setIsLoading(true);
            const updatedReferral = await ReferralService.acknowledgeReferral(id, acknowledgedBy);
            // Update referrals list
            setReferrals((prev) => prev.map((ref) => ref.id === id
                ? {
                    ...ref,
                    acknowledgmentStatus: "Acknowledged",
                    acknowledgedBy,
                    acknowledgmentDate: new Date(),
                }
                : ref));
            toast({
                title: "Success",
                description: "Referral acknowledged successfully",
                variant: "default",
            });
        }
        catch (err) {
            console.error("Error acknowledging referral:", err);
            toast({
                title: "Error",
                description: "Failed to acknowledge referral. Please try again.",
                variant: "destructive",
            });
        }
        finally {
            setIsLoading(false);
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case "New":
                return "bg-blue-100 text-blue-800";
            case "In Progress":
                return "bg-yellow-100 text-yellow-800";
            case "Accepted":
                return "bg-green-100 text-green-800";
            case "Declined":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };
    const getAcknowledgmentStatusColor = (status) => {
        switch (status) {
            case "Pending":
                return "bg-yellow-100 text-yellow-800";
            case "Acknowledged":
                return "bg-blue-100 text-blue-800";
            case "Processed":
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };
    // Filter referrals based on search query and active tab
    const filteredReferrals = referrals.filter((referral) => {
        const matchesSearch = referral.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            referral.referralSource.toLowerCase().includes(searchQuery.toLowerCase());
        if (activeTab === "all")
            return matchesSearch;
        if (activeTab === "new")
            return matchesSearch && referral.referralStatus === "New";
        if (activeTab === "in-progress")
            return matchesSearch && referral.referralStatus === "In Progress";
        if (activeTab === "accepted")
            return matchesSearch && referral.referralStatus === "Accepted";
        if (activeTab === "declined")
            return matchesSearch && referral.referralStatus === "Declined";
        return matchesSearch;
    });
    return (_jsxs("div", { className: "bg-white p-6 rounded-lg shadow-sm", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsx("h1", { className: "text-2xl font-bold", children: "Patient Referral Management" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "outline", onClick: fetchReferrals, disabled: isLoading, children: isLoading ? "Loading..." : "Refresh" }), _jsxs(Button, { onClick: () => setIsNewReferralDialogOpen(true), children: [_jsx(Plus, { className: "mr-2 h-4 w-4" }), " New Referral"] })] })] }), error && (_jsx("div", { className: "bg-red-50 text-red-800 p-4 mb-6 rounded-md", children: error })), _jsx(Card, { className: "mb-6", children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex flex-col md:flex-row gap-4 items-start md:items-center justify-between", children: [_jsxs("div", { className: "relative w-full md:w-96", children: [_jsx(Search, { className: "absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" }), _jsx(Input, { placeholder: "Search by patient name or referral source", className: "pl-10", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value) })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Filter, { className: "mr-2 h-4 w-4" }), " Filter"] }), _jsxs(Select, { defaultValue: "all", onValueChange: (value) => setActiveTab(value), children: [_jsx(SelectTrigger, { className: "w-[180px]", children: _jsx(SelectValue, { placeholder: "Filter by status" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Referrals" }), _jsx(SelectItem, { value: "new", children: "New" }), _jsx(SelectItem, { value: "in-progress", children: "In Progress" }), _jsx(SelectItem, { value: "accepted", children: "Accepted" }), _jsx(SelectItem, { value: "declined", children: "Declined" })] })] })] })] }) }) }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Referral List" }), _jsx(CardDescription, { children: "Manage patient referrals from various healthcare providers" })] }), _jsx(CardContent, { children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Patient" }), _jsx(TableHead, { children: "Referral Source" }), _jsx(TableHead, { children: "Date" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { children: "Acknowledgment" }), _jsx(TableHead, { children: "Assignment" }), _jsx(TableHead, { className: "text-right", children: "Actions" })] }) }), _jsx(TableBody, { children: filteredReferrals.length > 0 ? (filteredReferrals.map((referral) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: referral.patientName }), _jsx("div", { className: "text-sm text-muted-foreground", children: referral.patientContact })] }) }), _jsx(TableCell, { children: _jsxs("div", { children: [_jsx("div", { children: referral.referralSource }), _jsx("div", { className: "text-sm text-muted-foreground", children: referral.referralSourceContact.split(",")[0] })] }) }), _jsx(TableCell, { children: referral.referralDate.toLocaleDateString() }), _jsx(TableCell, { children: _jsx(Badge, { variant: "outline", className: getStatusColor(referral.referralStatus), children: referral.referralStatus }) }), _jsx(TableCell, { children: _jsx(Badge, { variant: "outline", className: getAcknowledgmentStatusColor(referral.acknowledgmentStatus), children: referral.acknowledgmentStatus }) }), _jsx(TableCell, { children: referral.assignedNurseSupervisor ? (_jsxs("div", { className: "text-sm", children: [_jsx("div", { className: "font-medium", children: referral.assignedNurseSupervisor }), _jsx("div", { className: "text-xs text-muted-foreground", children: "Nurse Supervisor" })] })) : (_jsxs(Button, { variant: "outline", size: "sm", onClick: () => handleAssignStaff(referral), children: [_jsx(UserPlus, { className: "h-3 w-3 mr-1" }), " Assign"] })) }), _jsx(TableCell, { className: "text-right", children: _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { variant: "ghost", size: "icon", children: _jsx(MoreVertical, { className: "h-4 w-4" }) }) }), _jsxs(DropdownMenuContent, { align: "end", children: [_jsx(DropdownMenuItem, { onClick: () => handleReferralSelect(referral), children: "View Details" }), _jsx(DropdownMenuItem, { onClick: () => handleAssignStaff(referral), children: "Assign Staff" }), _jsx(DropdownMenuItem, { onClick: () => {
                                                                        if (referral.referralStatus === "New") {
                                                                            handleUpdateStatus(referral.id, "In Progress");
                                                                        }
                                                                        else if (referral.referralStatus === "In Progress") {
                                                                            handleUpdateStatus(referral.id, "Accepted");
                                                                        }
                                                                    }, children: referral.referralStatus === "New"
                                                                        ? "Mark In Progress"
                                                                        : referral.referralStatus === "In Progress"
                                                                            ? "Mark Accepted"
                                                                            : "Update Status" }), referral.acknowledgmentStatus === "Pending" && (_jsx(DropdownMenuItem, { onClick: () => handleAcknowledgeReferral(referral.id, "Current User"), children: "Acknowledge Referral" }))] })] }) })] }, referral.id)))) : (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 7, className: "text-center py-4", children: "No referrals found matching your search criteria." }) })) })] }) })] }), _jsx(Dialog, { open: isNewReferralDialogOpen, onOpenChange: setIsNewReferralDialogOpen, children: _jsxs(DialogContent, { className: "sm:max-w-[600px]", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "New Patient Referral" }), _jsx(DialogDescription, { children: "Enter the details of the new patient referral" })] }), _jsxs("div", { className: "grid gap-6 py-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "referralSource", children: "Referral Source" }), _jsxs(Select, { value: newReferral.referralSource, onValueChange: (value) => handleNewReferralChange("referralSource", value), children: [_jsx(SelectTrigger, { id: "referralSource", children: _jsx(SelectValue, { placeholder: "Select source" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "daman", children: "Daman" }), _jsx(SelectItem, { value: "seha", children: "SEHA" }), _jsx(SelectItem, { value: "doh", children: "DOH" }), _jsx(SelectItem, { value: "zho", children: "ZHO" }), _jsx(SelectItem, { value: "hhd", children: "HHD" }), _jsx(SelectItem, { value: "salma", children: "Salma Hospital" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "referralDate", children: "Referral Date" }), _jsxs(Popover, { children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", className: "w-full justify-start text-left font-normal", children: [_jsx(CalendarIcon, { className: "mr-2 h-4 w-4" }), selectedDate ? (format(selectedDate, "PPP")) : (_jsx("span", { children: "Pick a date" }))] }) }), _jsx(PopoverContent, { className: "w-auto p-0", children: _jsx(Calendar, { mode: "single", selected: selectedDate, onSelect: setSelectedDate, initialFocus: true }) })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "referralSourceContact", children: "Referral Source Contact" }), _jsx(Input, { id: "referralSourceContact", placeholder: "Name, Phone Number, Email", value: newReferral.referralSourceContact || "", onChange: (e) => handleNewReferralChange("referralSourceContact", e.target.value) })] }), _jsx(Separator, {}), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "patientName", children: "Patient Name" }), _jsx(Input, { id: "patientName", placeholder: "Full Name", value: newReferral.patientName || "", onChange: (e) => handleNewReferralChange("patientName", e.target.value) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "patientContact", children: "Patient Contact" }), _jsx(Input, { id: "patientContact", placeholder: "Phone Number", value: newReferral.patientContact || "", onChange: (e) => handleNewReferralChange("patientContact", e.target.value) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "preliminaryNeeds", children: "Preliminary Needs" }), _jsx(Textarea, { id: "preliminaryNeeds", placeholder: "Brief description of patient's medical needs", className: "min-h-[80px]", value: newReferral.preliminaryNeeds || "", onChange: (e) => handleNewReferralChange("preliminaryNeeds", e.target.value) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "insuranceInfo", children: "Insurance Information" }), _jsx(Input, { id: "insuranceInfo", placeholder: "Provider, Policy Number", value: newReferral.insuranceInfo || "", onChange: (e) => handleNewReferralChange("insuranceInfo", e.target.value) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "geographicLocation", children: "Geographic Location" }), _jsx(Input, { id: "geographicLocation", placeholder: "City, Area/District", value: newReferral.geographicLocation || "", onChange: (e) => handleNewReferralChange("geographicLocation", e.target.value) })] })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setIsNewReferralDialogOpen(false), children: "Cancel" }), _jsx(Button, { onClick: handleSubmitReferral, disabled: isLoading, children: isLoading ? "Submitting..." : "Submit Referral" })] })] }) }), _jsx(Dialog, { open: isAssignDialogOpen, onOpenChange: setIsAssignDialogOpen, children: _jsxs(DialogContent, { className: "sm:max-w-[500px]", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Assign Staff to Referral" }), _jsx(DialogDescription, { children: selectedReferral && (_jsxs("span", { children: ["Assign staff to referral for", " ", _jsx("strong", { children: selectedReferral.patientName })] })) })] }), _jsxs("div", { className: "grid gap-4 py-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "nurseSupervisor", children: "Nurse Supervisor" }), _jsxs(Select, { value: staffAssignment.nurseSupervisor, onValueChange: (value) => handleStaffAssignmentChange("nurseSupervisor", value), children: [_jsx(SelectTrigger, { id: "nurseSupervisor", children: _jsx(SelectValue, { placeholder: "Select nurse supervisor" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "mariam", children: "Mariam Al Ali" }), _jsx(SelectItem, { value: "noura", children: "Noura Al Shamsi" }), _jsx(SelectItem, { value: "hessa", children: "Hessa Al Falasi" }), _jsx(SelectItem, { value: "aisha", children: "Aisha Al Zaabi" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "chargeNurse", children: "Charge Nurse" }), _jsxs(Select, { value: staffAssignment.chargeNurse, onValueChange: (value) => handleStaffAssignmentChange("chargeNurse", value), children: [_jsx(SelectTrigger, { id: "chargeNurse", children: _jsx(SelectValue, { placeholder: "Select charge nurse" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "fatima", children: "Fatima Hassan" }), _jsx(SelectItem, { value: "hamad", children: "Hamad Al Dhaheri" }), _jsx(SelectItem, { value: "sara", children: "Sara Al Marzouqi" }), _jsx(SelectItem, { value: "ahmed", children: "Ahmed Al Suwaidi" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "caseCoordinator", children: "Case Coordinator" }), _jsxs(Select, { value: staffAssignment.caseCoordinator, onValueChange: (value) => handleStaffAssignmentChange("caseCoordinator", value), children: [_jsx(SelectTrigger, { id: "caseCoordinator", children: _jsx(SelectValue, { placeholder: "Select case coordinator" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "latifa", children: "Latifa Al Nuaimi" }), _jsx(SelectItem, { value: "khalid", children: "Khalid Al Mazrouei" }), _jsx(SelectItem, { value: "mona", children: "Mona Al Hashemi" }), _jsx(SelectItem, { value: "saeed", children: "Saeed Al Neyadi" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "assessmentDate", children: "Assessment Date" }), _jsxs(Popover, { children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", className: "w-full justify-start text-left font-normal", children: [_jsx(CalendarIcon, { className: "mr-2 h-4 w-4" }), selectedDate ? (format(selectedDate, "PPP")) : (_jsx("span", { children: "Schedule assessment" }))] }) }), _jsx(PopoverContent, { className: "w-auto p-0", children: _jsx(Calendar, { mode: "single", selected: selectedDate, onSelect: setSelectedDate, initialFocus: true }) })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "initialContact", checked: staffAssignment.initialContactCompleted, onCheckedChange: (checked) => handleStaffAssignmentChange("initialContactCompleted", checked === true) }), _jsx(Label, { htmlFor: "initialContact", children: "Initial contact with patient/family completed" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "documentation", checked: staffAssignment.documentationPrepared, onCheckedChange: (checked) => handleStaffAssignmentChange("documentationPrepared", checked === true) }), _jsx(Label, { htmlFor: "documentation", children: "Initial documentation prepared" })] })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setIsAssignDialogOpen(false), children: "Cancel" }), _jsxs(Button, { onClick: handleSubmitStaffAssignment, disabled: isLoading, children: [_jsx(CheckCircle, { className: "mr-2 h-4 w-4" }), " ", isLoading ? "Saving..." : "Confirm Assignment"] })] })] }) })] }));
};
export default PatientReferral;
