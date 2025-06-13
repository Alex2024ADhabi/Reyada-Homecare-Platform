import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Calendar, FileText, Users, Activity, BarChart3, Target, RefreshCw, Download, Search, } from "lucide-react";
import { useOfflineSync } from "@/hooks/useOfflineSync";
const MonthlyServiceDeliveryTracker = ({ isOffline = false, }) => {
    const { isOnline } = useOfflineSync();
    const [activeTab, setActiveTab] = useState("calendar-view");
    const [serviceRecords, setServiceRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRecord, setSelectedRecord] = useState(null);
    // Dashboard statistics
    const [monthlyStats, setMonthlyStats] = useState({
        totalPatients: 0,
        totalServicesProvided: 0,
        totalServicesAuthorized: 0,
        averageUtilizationRate: 0,
        documentationComplianceRate: 0,
        activeServiceProvisions: 0,
        completedServiceDays: 0,
        pendingDocumentation: 0,
    });
    // Mock data for service delivery tracking
    const mockServiceRecords = [
        {
            id: "1",
            patient_id: 12345,
            patient_name: "Mohammed Al Mansoori",
            service_month: 2,
            service_year: 2024,
            claim_number: "CL-2024-0001",
            primary_clinician: "Sarah Ahmed",
            authorized_services: "Home Nursing, Physiotherapy",
            authorized_quantity: 30,
            daily_services: {
                service_day_01: "Home Nursing",
                service_day_02: "Physiotherapy",
                service_day_03: "Home Nursing",
                service_day_04: "No Service",
                service_day_05: "Home Nursing",
                service_day_06: "Physiotherapy",
                service_day_07: "Home Nursing",
                service_day_08: "Physiotherapy",
                service_day_09: "Home Nursing",
                service_day_10: "No Service",
            },
            daily_documentation: {
                doc_day_01: "Complete",
                doc_day_02: "Complete",
                doc_day_03: "Complete",
                doc_day_04: "N/A",
                doc_day_05: "Pending",
                doc_day_06: "Complete",
                doc_day_07: "Complete",
                doc_day_08: "Complete",
                doc_day_09: "Pending",
                doc_day_10: "N/A",
            },
            total_services_provided: 8,
            total_authorized_services: 10,
            service_utilization_rate: 80.0,
            documentation_compliance_rate: 87.5,
            service_provision_status: "Active",
            last_service_date: "2024-02-09",
            next_scheduled_service: "2024-02-11",
            created_at: "2024-02-01T08:00:00Z",
            updated_at: "2024-02-09T16:30:00Z",
        },
        {
            id: "2",
            patient_id: 12346,
            patient_name: "Fatima Al Zaabi",
            service_month: 2,
            service_year: 2024,
            claim_number: "CL-2024-0002",
            primary_clinician: "Ali Hassan",
            authorized_services: "Physical Therapy",
            authorized_quantity: 12,
            daily_services: {
                service_day_01: "Physical Therapy",
                service_day_02: "No Service",
                service_day_03: "Physical Therapy",
                service_day_04: "Physical Therapy",
                service_day_05: "No Service",
                service_day_06: "Physical Therapy",
                service_day_07: "No Service",
                service_day_08: "Physical Therapy",
                service_day_09: "Physical Therapy",
                service_day_10: "No Service",
            },
            daily_documentation: {
                doc_day_01: "Complete",
                doc_day_02: "N/A",
                doc_day_03: "Complete",
                doc_day_04: "Incomplete",
                doc_day_05: "N/A",
                doc_day_06: "Complete",
                doc_day_07: "N/A",
                doc_day_08: "Complete",
                doc_day_09: "Complete",
                doc_day_10: "N/A",
            },
            total_services_provided: 6,
            total_authorized_services: 6,
            service_utilization_rate: 100.0,
            documentation_compliance_rate: 83.3,
            service_provision_status: "Active",
            last_service_date: "2024-02-09",
            next_scheduled_service: "2024-02-11",
            created_at: "2024-02-01T09:15:00Z",
            updated_at: "2024-02-09T17:45:00Z",
        },
    ];
    // Load service records on component mount
    useEffect(() => {
        const fetchServiceRecords = async () => {
            try {
                // In a real implementation, this would be an API call
                setServiceRecords(mockServiceRecords);
                // Calculate monthly statistics
                const stats = {
                    totalPatients: mockServiceRecords.length,
                    totalServicesProvided: mockServiceRecords.reduce((sum, record) => sum + record.total_services_provided, 0),
                    totalServicesAuthorized: mockServiceRecords.reduce((sum, record) => sum + record.total_authorized_services, 0),
                    averageUtilizationRate: mockServiceRecords.reduce((sum, record) => sum + record.service_utilization_rate, 0) / mockServiceRecords.length,
                    documentationComplianceRate: mockServiceRecords.reduce((sum, record) => sum + record.documentation_compliance_rate, 0) / mockServiceRecords.length,
                    activeServiceProvisions: mockServiceRecords.filter((record) => record.service_provision_status === "Active").length,
                    completedServiceDays: mockServiceRecords.reduce((sum, record) => {
                        return (sum +
                            Object.values(record.daily_services).filter((service) => service !== "No Service").length);
                    }, 0),
                    pendingDocumentation: mockServiceRecords.reduce((sum, record) => {
                        return (sum +
                            Object.values(record.daily_documentation).filter((doc) => doc === "Pending" || doc === "Incomplete").length);
                    }, 0),
                };
                setMonthlyStats(stats);
            }
            catch (error) {
                console.error("Error fetching service records:", error);
            }
            finally {
                setLoading(false);
            }
        };
        fetchServiceRecords();
    }, [selectedMonth, selectedYear]);
    // Filter service records based on search query
    const filteredRecords = serviceRecords.filter((record) => {
        const matchesSearch = record.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            record.claim_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            record.primary_clinician
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
        return matchesSearch;
    });
    // Generate calendar days for the selected month
    const generateCalendarDays = () => {
        const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
        return Array.from({ length: daysInMonth }, (_, i) => i + 1);
    };
    // Get service status for a specific day
    const getServiceStatus = (record, day) => {
        const serviceKey = `service_day_${day.toString().padStart(2, "0")}`;
        const docKey = `doc_day_${day.toString().padStart(2, "0")}`;
        const service = record.daily_services[serviceKey];
        const documentation = record.daily_documentation[docKey];
        if (!service || service === "No Service") {
            return {
                status: "no-service",
                service: "No Service",
                documentation: "N/A",
            };
        }
        if (documentation === "Complete") {
            return { status: "complete", service, documentation };
        }
        else if (documentation === "Pending" || documentation === "Incomplete") {
            return { status: "pending", service, documentation };
        }
        return {
            status: "unknown",
            service,
            documentation: documentation || "Unknown",
        };
    };
    // Get status badge variant
    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case "complete":
                return "success";
            case "pending":
                return "warning";
            case "no-service":
                return "secondary";
            default:
                return "destructive";
        }
    };
    return (_jsxs("div", { className: "w-full h-full bg-background p-4 md:p-6", children: [_jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold", children: "Monthly Service Delivery Tracker" }), _jsx("p", { className: "text-muted-foreground", children: "Track daily service delivery and documentation compliance across monthly calendar" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: isOffline ? "destructive" : "secondary", className: "text-xs", children: isOffline ? "Offline Mode" : "Online" }), _jsxs(Select, { value: selectedMonth.toString(), onValueChange: (value) => setSelectedMonth(parseInt(value)), children: [_jsx(SelectTrigger, { className: "w-32", children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: Array.from({ length: 12 }, (_, i) => (_jsx(SelectItem, { value: (i + 1).toString(), children: new Date(0, i).toLocaleString("default", { month: "long" }) }, i + 1))) })] }), _jsxs(Select, { value: selectedYear.toString(), onValueChange: (value) => setSelectedYear(parseInt(value)), children: [_jsx(SelectTrigger, { className: "w-24", children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: Array.from({ length: 5 }, (_, i) => (_jsx(SelectItem, { value: (2022 + i).toString(), children: 2022 + i }, 2022 + i))) })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-6 mb-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium flex items-center", children: [_jsx(Users, { className: "h-4 w-4 mr-2" }), "Total Patients"] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: monthlyStats.totalPatients }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Active service recipients" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium flex items-center", children: [_jsx(Activity, { className: "h-4 w-4 mr-2" }), "Services Provided"] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: monthlyStats.totalServicesProvided }), _jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: ["of ", monthlyStats.totalServicesAuthorized, " authorized"] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium flex items-center", children: [_jsx(Target, { className: "h-4 w-4 mr-2" }), "Utilization Rate"] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold text-blue-600", children: [monthlyStats.averageUtilizationRate.toFixed(1), "%"] }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Average across all patients" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium flex items-center", children: [_jsx(FileText, { className: "h-4 w-4 mr-2" }), "Documentation Rate"] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold text-green-600", children: [monthlyStats.documentationComplianceRate.toFixed(1), "%"] }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Compliance rate" })] })] })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-3", children: [_jsxs(TabsTrigger, { value: "calendar-view", children: [_jsx(Calendar, { className: "h-4 w-4 mr-2" }), "Calendar View"] }), _jsxs(TabsTrigger, { value: "patient-summary", children: [_jsx(Users, { className: "h-4 w-4 mr-2" }), "Patient Summary"] }), _jsxs(TabsTrigger, { value: "analytics", children: [_jsx(BarChart3, { className: "h-4 w-4 mr-2" }), "Analytics"] })] }), _jsx(TabsContent, { value: "calendar-view", className: "mt-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsxs(CardTitle, { children: ["Service Delivery Calendar -", " ", new Date(0, selectedMonth - 1).toLocaleString("default", {
                                                                month: "long",
                                                            }), " ", selectedYear] }), _jsx(CardDescription, { children: "Daily service tracking and documentation status" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "Export"] }), _jsxs(Button, { size: "sm", children: [_jsx(RefreshCw, { className: "h-4 w-4 mr-2" }), "Refresh"] })] })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-6", children: filteredRecords.map((record) => (_jsxs(Card, { className: "border-l-4 border-l-blue-500", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: "text-base", children: record.patient_name }), _jsxs(CardDescription, { children: [record.claim_number, " \u2022 ", record.primary_clinician] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "text-sm font-medium", children: [record.total_services_provided, "/", record.total_authorized_services, " services"] }), _jsxs("div", { className: "text-xs text-muted-foreground", children: [record.service_utilization_rate.toFixed(1), "% utilization"] })] })] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "grid grid-cols-7 gap-2 mb-4", children: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (_jsx("div", { className: "text-center text-xs font-medium text-muted-foreground p-2", children: day }, day))) }), _jsx("div", { className: "grid grid-cols-7 gap-2", children: generateCalendarDays().map((day) => {
                                                                const serviceStatus = getServiceStatus(record, day);
                                                                return (_jsxs("div", { className: "aspect-square border rounded-md p-1 text-xs flex flex-col items-center justify-center hover:bg-muted/50 cursor-pointer", onClick: () => setSelectedRecord(record), children: [_jsx("div", { className: "font-medium", children: day }), _jsx(Badge, { variant: getStatusBadgeVariant(serviceStatus.status), className: "text-[10px] px-1 py-0 mt-1", children: serviceStatus.status === "no-service"
                                                                                ? "—"
                                                                                : serviceStatus.status === "complete"
                                                                                    ? "✓"
                                                                                    : serviceStatus.status === "pending"
                                                                                        ? "!"
                                                                                        : "?" })] }, day));
                                                            }) })] })] }, record.id))) }) })] }) }), _jsx(TabsContent, { value: "patient-summary", className: "mt-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: "Patient Service Summary" }), _jsx(CardDescription, { children: "Detailed service delivery and documentation tracking" })] }), _jsxs("div", { className: "relative w-96", children: [_jsx(Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }), _jsx(Input, { placeholder: "Search patients...", className: "pl-8", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value) })] })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "border rounded-md overflow-hidden", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Patient" }), _jsx(TableHead, { children: "Clinician" }), _jsx(TableHead, { children: "Services" }), _jsx(TableHead, { children: "Utilization" }), _jsx(TableHead, { children: "Documentation" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { children: "Last Service" })] }) }), _jsx(TableBody, { children: loading ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 7, className: "text-center py-8", children: _jsx(RefreshCw, { className: "h-8 w-8 animate-spin mx-auto text-muted-foreground" }) }) })) : filteredRecords.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 7, className: "text-center py-8 text-muted-foreground", children: "No service records found" }) })) : (filteredRecords.map((record) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: _jsxs("div", { children: [_jsx("div", { children: record.patient_name }), _jsx("div", { className: "text-xs text-muted-foreground", children: record.claim_number })] }) }), _jsx(TableCell, { children: record.primary_clinician }), _jsxs(TableCell, { children: [_jsxs("div", { className: "text-sm", children: [record.total_services_provided, "/", record.total_authorized_services] }), _jsx("div", { className: "text-xs text-muted-foreground", children: record.authorized_services })] }), _jsx(TableCell, { children: _jsxs(Badge, { variant: record.service_utilization_rate >= 90
                                                                        ? "success"
                                                                        : record.service_utilization_rate >= 70
                                                                            ? "warning"
                                                                            : "destructive", children: [record.service_utilization_rate.toFixed(1), "%"] }) }), _jsx(TableCell, { children: _jsxs(Badge, { variant: record.documentation_compliance_rate >= 95
                                                                        ? "success"
                                                                        : record.documentation_compliance_rate >= 80
                                                                            ? "warning"
                                                                            : "destructive", children: [record.documentation_compliance_rate.toFixed(1), "%"] }) }), _jsx(TableCell, { children: _jsx(Badge, { variant: record.service_provision_status === "Active"
                                                                        ? "success"
                                                                        : "secondary", children: record.service_provision_status }) }), _jsxs(TableCell, { children: [_jsx("div", { className: "text-sm", children: new Date(record.last_service_date).toLocaleDateString() }), _jsxs("div", { className: "text-xs text-muted-foreground", children: ["Next:", " ", new Date(record.next_scheduled_service).toLocaleDateString()] })] })] }, record.id)))) })] }) }) })] }) }), _jsx(TabsContent, { value: "analytics", className: "mt-4", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Service Delivery Performance" }), _jsx(CardDescription, { children: "Key metrics for service delivery efficiency" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium", children: "Total Service Days:" }), _jsx("span", { className: "text-lg font-bold", children: monthlyStats.completedServiceDays })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium", children: "Average Utilization:" }), _jsxs("span", { className: "text-lg font-bold text-blue-600", children: [monthlyStats.averageUtilizationRate.toFixed(1), "%"] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium", children: "Documentation Compliance:" }), _jsxs("span", { className: "text-lg font-bold text-green-600", children: [monthlyStats.documentationComplianceRate.toFixed(1), "%"] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium", children: "Pending Documentation:" }), _jsx("span", { className: "text-lg font-bold text-amber-600", children: monthlyStats.pendingDocumentation })] })] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Service Provision Status" }), _jsx(CardDescription, { children: "Current status of service delivery activities" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium", children: "Active Provisions:" }), _jsx("span", { className: "text-lg font-bold text-green-600", children: monthlyStats.activeServiceProvisions })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium", children: "Services This Month:" }), _jsx("span", { className: "text-lg font-bold", children: monthlyStats.totalServicesProvided })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium", children: "Authorized Services:" }), _jsx("span", { className: "text-lg font-bold", children: monthlyStats.totalServicesAuthorized })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium", children: "Overall Efficiency:" }), _jsxs("span", { className: "text-lg font-bold", children: [monthlyStats.totalServicesAuthorized > 0
                                                                        ? Math.round((monthlyStats.totalServicesProvided /
                                                                            monthlyStats.totalServicesAuthorized) *
                                                                            100)
                                                                        : 0, "%"] })] })] }) })] })] }) })] })] }));
};
export default MonthlyServiceDeliveryTracker;
