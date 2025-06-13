import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { AlertTriangle, CheckCircle, ExternalLink, FileText, } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
export default function TawteenComplianceTracker({ facilityId = "facility-001", region = "Abu Dhabi", networkType = "Basic", }) {
    const [targets, setTargets] = useState([]);
    const [currentReport, setCurrentReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showTAMMDialog, setShowTAMMDialog] = useState(false);
    const [showReportDialog, setShowReportDialog] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");
    const [complianceAlerts, setComplianceAlerts] = useState([]);
    // CN_13_2025 Tawteen Targets based on region and network type
    const getTawteenTargets = () => {
        const baseTargets = [];
        if (region === "Al Ain" && networkType === "Thiqa") {
            // Enhanced targets for Al Ain Thiqa network
            baseTargets.push({
                facilityType: "All Licensed Health Facilities",
                licensedWorkforceRange: "1-50",
                minimumNationals: 1,
                currentNationals: 0,
                compliancePercentage: 0,
                status: "non-compliant",
                region,
                networkType,
            }, {
                facilityType: "All Licensed Health Facilities",
                licensedWorkforceRange: "51-100",
                minimumNationals: 2,
                currentNationals: 1,
                compliancePercentage: 50,
                status: "at-risk",
                region,
                networkType,
            }, {
                facilityType: "All Licensed Health Facilities",
                licensedWorkforceRange: "101-150",
                minimumNationals: 3,
                currentNationals: 3,
                compliancePercentage: 100,
                status: "compliant",
                region,
                networkType,
            }, {
                facilityType: "All Licensed Health Facilities",
                licensedWorkforceRange: "151+",
                minimumNationals: 2, // 2 per 100 or part thereof
                currentNationals: 4,
                compliancePercentage: 100,
                status: "compliant",
                region,
                networkType,
            });
        }
        else {
            // Standard targets for Abu Dhabi, Al Dhafra, and Al Ain non-Thiqa
            baseTargets.push({
                facilityType: "IVF Centers / Pharmacies",
                licensedWorkforceRange: "10+",
                minimumNationals: 1,
                currentNationals: 1,
                compliancePercentage: 100,
                status: "compliant",
                region,
                networkType,
            }, {
                facilityType: "School Clinics",
                licensedWorkforceRange: "5+",
                minimumNationals: 1,
                currentNationals: 0,
                compliancePercentage: 0,
                status: "non-compliant",
                region,
                networkType,
            }, {
                facilityType: "All Licensed Health Facilities",
                licensedWorkforceRange: "20-100",
                minimumNationals: 1,
                currentNationals: 2,
                compliancePercentage: 200,
                status: "compliant",
                region,
                networkType,
            }, {
                facilityType: "All Licensed Health Facilities",
                licensedWorkforceRange: "101-200",
                minimumNationals: 2,
                currentNationals: 1,
                compliancePercentage: 50,
                status: "at-risk",
                region,
                networkType,
            }, {
                facilityType: "All Licensed Health Facilities",
                licensedWorkforceRange: "201+",
                minimumNationals: 1, // 1 per 100 or part thereof
                currentNationals: 3,
                compliancePercentage: 100,
                status: "compliant",
                region,
                networkType,
            });
        }
        return baseTargets;
    };
    const generateMockReport = () => {
        return {
            facilityId,
            reportingPeriod: "2025-Q1",
            totalLicensedStaff: 150,
            totalNationalStaff: 12,
            administrativeStaff: {
                total: 25,
                nationals: 5,
                percentage: 20,
            },
            healthcareStaff: {
                total: 125,
                nationals: 7,
                percentage: 5.6,
            },
            tamm_integration: {
                connected: true,
                lastSync: new Date().toISOString(),
                dataAccuracy: 98.5,
            },
            complianceStatus: "Phase 1",
            penalties: {
                financial: 0,
                networkExclusion: false,
            },
        };
    };
    useEffect(() => {
        setTargets(getTawteenTargets());
        setCurrentReport(generateMockReport());
    }, [region, networkType]);
    const handleTAMMSync = async () => {
        setLoading(true);
        try {
            // Simulate TAMM platform integration
            await new Promise((resolve) => setTimeout(resolve, 2000));
            const updatedReport = {
                ...currentReport,
                tamm_integration: {
                    connected: true,
                    lastSync: new Date().toISOString(),
                    dataAccuracy: 99.2,
                },
            };
            setCurrentReport(updatedReport);
            setShowTAMMDialog(false);
            toast({
                title: "TAMM Integration Successful",
                description: "Workforce data synchronized with TAMM platform",
            });
        }
        catch (error) {
            toast({
                title: "TAMM Integration Failed",
                description: "Failed to sync with TAMM platform. Please try again.",
                variant: "destructive",
            });
        }
        finally {
            setLoading(false);
        }
    };
    const getStatusBadge = (status) => {
        const variants = {
            compliant: "default",
            "at-risk": "secondary",
            "non-compliant": "destructive",
        };
        return (_jsxs(Badge, { variant: variants[status] || "secondary", children: [status === "compliant" && _jsx(CheckCircle, { className: "w-3 h-3 mr-1" }), status === "at-risk" && _jsx(AlertTriangle, { className: "w-3 h-3 mr-1" }), status === "non-compliant" && (_jsx(AlertTriangle, { className: "w-3 h-3 mr-1" })), status.toUpperCase()] }));
    };
    const overallComplianceRate = targets.length > 0
        ? (targets.filter((t) => t.status === "compliant").length /
            targets.length) *
            100
        : 0;
    return (_jsx("div", { className: "min-h-screen bg-gray-50 p-6", children: _jsxs("div", { className: "max-w-7xl mx-auto space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Tawteen Initiative Compliance Tracker" }), _jsx("p", { className: "text-gray-600 mt-1", children: "CN_13_2025 - Healthcare Workforce Sustainability & Emiratization Tracking" })] }), _jsx("div", { className: "flex items-center gap-2", children: _jsxs(Badge, { variant: "outline", className: "bg-blue-50 text-blue-700", children: [region, " Region - ", networkType, " Network"] }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs(Card, { className: "border-green-200 bg-green-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-green-800", children: "Overall Compliance" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold text-green-900", children: [Math.round(overallComplianceRate), "%"] }), _jsxs("p", { className: "text-xs text-green-600", children: [targets.filter((t) => t.status === "compliant").length, " of", " ", targets.length, " targets met"] })] })] }), _jsxs(Card, { className: "border-blue-200 bg-blue-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-blue-800", children: "Total Nationals" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-blue-900", children: currentReport?.totalNationalStaff || 0 }), _jsxs("p", { className: "text-xs text-blue-600", children: ["of ", currentReport?.totalLicensedStaff || 0, " licensed staff"] })] })] }), _jsxs(Card, { className: "border-purple-200 bg-purple-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-purple-800", children: "TAMM Integration" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-purple-900", children: currentReport?.tamm_integration.connected ? "✓" : "✗" }), _jsxs("p", { className: "text-xs text-purple-600", children: [currentReport?.tamm_integration.dataAccuracy || 0, "% accuracy"] })] })] }), _jsxs(Card, { className: "border-orange-200 bg-orange-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-orange-800", children: "Compliance Phase" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-orange-900", children: currentReport?.complianceStatus || "N/A" }), _jsx("p", { className: "text-xs text-orange-600", children: "2025 Implementation" })] })] })] }), targets.some((t) => t.status === "non-compliant") && (_jsxs(Alert, { className: "bg-red-50 border-red-200", children: [_jsx(AlertTriangle, { className: "h-4 w-4 text-red-600" }), _jsx(AlertTitle, { className: "text-red-800", children: "Critical Tawteen Compliance Issues - CN_13_2025" }), _jsxs(AlertDescription, { className: "text-red-700", children: [targets.filter((t) => t.status === "non-compliant").length, " ", "facility types are non-compliant with Tawteen targets. Immediate action required to avoid:", _jsxs("ul", { className: "list-disc list-inside mt-2", children: [_jsx("li", { children: "Financial penalties up to AED 50,000 per violation" }), _jsx("li", { children: "Network exclusion from Thiqa and Basic networks" }), _jsx("li", { children: "License suspension for repeated violations" }), _jsx("li", { children: "Mandatory workforce restructuring requirements" })] })] })] })), !currentReport?.tamm_integration.connected && (_jsxs(Alert, { className: "bg-yellow-50 border-yellow-200", children: [_jsx(AlertTriangle, { className: "h-4 w-4 text-yellow-600" }), _jsx(AlertTitle, { className: "text-yellow-800", children: "TAMM Platform Integration Required" }), _jsx(AlertDescription, { className: "text-yellow-700", children: "Connection to TAMM platform is mandatory for automated workforce reporting and compliance validation. Click \"TAMM Integration\" to connect." })] })), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "space-y-6", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "targets", children: "Targets" }), _jsx(TabsTrigger, { value: "workforce", children: "Workforce" }), _jsx(TabsTrigger, { value: "reporting", children: "Reporting" })] }), _jsx(TabsContent, { value: "overview", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Compliance Summary" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { children: "Overall Compliance Rate" }), _jsxs("span", { className: "text-2xl font-bold text-green-600", children: [Math.round(overallComplianceRate), "%"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-3", children: _jsx("div", { className: "bg-green-500 h-3 rounded-full", style: { width: `${overallComplianceRate}%` } }) }), _jsxs("div", { className: "grid grid-cols-3 gap-4 mt-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-lg font-semibold text-green-600", children: targets.filter((t) => t.status === "compliant")
                                                                                .length }), _jsx("div", { className: "text-sm text-gray-600", children: "Compliant" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-lg font-semibold text-yellow-600", children: targets.filter((t) => t.status === "at-risk").length }), _jsx("div", { className: "text-sm text-gray-600", children: "At Risk" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-lg font-semibold text-red-600", children: targets.filter((t) => t.status === "non-compliant")
                                                                                .length }), _jsx("div", { className: "text-sm text-gray-600", children: "Non-Compliant" })] })] })] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Regional Requirements" }), _jsxs(CardDescription, { children: [region, " region specific Tawteen requirements"] })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [region === "Al Ain" && networkType === "Thiqa" ? (_jsx(_Fragment, { children: _jsxs("div", { className: "p-3 bg-blue-50 rounded border", children: [_jsx("div", { className: "font-medium text-blue-900", children: "Enhanced Al Ain Thiqa Requirements" }), _jsx("div", { className: "text-sm text-blue-700 mt-1", children: "\u2022 Graduated targets based on workforce size \u2022 1 national per 50 staff (1-50 range) \u2022 2 nationals per 100 staff (51-100 range) \u2022 Enhanced monitoring and reporting" })] }) })) : (_jsx(_Fragment, { children: _jsxs("div", { className: "p-3 bg-gray-50 rounded border", children: [_jsx("div", { className: "font-medium text-gray-900", children: "Standard Requirements" }), _jsx("div", { className: "text-sm text-gray-700 mt-1", children: "\u2022 IVF Centers/Pharmacies: 1 national per 10+ staff \u2022 School Clinics: 1 national per 5+ staff \u2022 General Facilities: Graduated based on size" })] }) })), _jsxs("div", { className: "p-3 bg-green-50 rounded border", children: [_jsx("div", { className: "font-medium text-green-900", children: "Network Benefits" }), _jsxs("div", { className: "text-sm text-green-700 mt-1", children: ["\u2022 ", networkType, " network participation \u2022 Priority in government contracts \u2022 Enhanced reimbursement rates"] })] })] }) })] })] }) }), _jsx(TabsContent, { value: "targets", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Tawteen Targets by Facility Type" }), _jsxs(CardDescription, { children: ["CN_13_2025 requirements based on ", region, " region and", " ", networkType, " network classification"] })] }), _jsx(CardContent, { children: _jsx("div", { className: "overflow-x-auto", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Facility Type" }), _jsx(TableHead, { children: "Workforce Range" }), _jsx(TableHead, { children: "Minimum Nationals" }), _jsx(TableHead, { children: "Current Nationals" }), _jsx(TableHead, { children: "Compliance %" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { children: "Actions" })] }) }), _jsx(TableBody, { children: targets.map((target, index) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: target.facilityType }), _jsx(TableCell, { children: target.licensedWorkforceRange }), _jsx(TableCell, { children: target.minimumNationals }), _jsx(TableCell, { children: target.currentNationals }), _jsx(TableCell, { children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-16 bg-gray-200 rounded-full h-2 mr-2", children: _jsx("div", { className: `h-2 rounded-full ${target.compliancePercentage >= 100
                                                                                        ? "bg-green-500"
                                                                                        : target.compliancePercentage >= 50
                                                                                            ? "bg-yellow-500"
                                                                                            : "bg-red-500"}`, style: {
                                                                                        width: `${Math.min(target.compliancePercentage, 100)}%`,
                                                                                    } }) }), _jsxs("span", { className: "text-sm", children: [target.compliancePercentage, "%"] })] }) }), _jsx(TableCell, { children: getStatusBadge(target.status) }), _jsx(TableCell, { children: target.status === "non-compliant" && (_jsx(Button, { size: "sm", variant: "outline", children: "Action Plan" })) })] }, index))) })] }) }) })] }) }), _jsx(TabsContent, { value: "workforce", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Workforce Breakdown" }) }), _jsx(CardContent, { children: currentReport && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "p-4 bg-blue-50 rounded", children: [_jsx("div", { className: "text-sm text-blue-600", children: "Total Licensed Staff" }), _jsx("div", { className: "text-2xl font-bold text-blue-900", children: currentReport.totalLicensedStaff })] }), _jsxs("div", { className: "p-4 bg-green-50 rounded", children: [_jsx("div", { className: "text-sm text-green-600", children: "UAE Nationals" }), _jsx("div", { className: "text-2xl font-bold text-green-900", children: currentReport.totalNationalStaff }), _jsxs("div", { className: "text-sm text-green-600", children: [((currentReport.totalNationalStaff /
                                                                                    currentReport.totalLicensedStaff) *
                                                                                    100).toFixed(1), "%"] })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between items-center p-3 border rounded", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: "Healthcare Staff" }), _jsxs("div", { className: "text-sm text-gray-600", children: [currentReport.healthcareStaff.nationals, " of", " ", currentReport.healthcareStaff.total, " nationals"] })] }), _jsx("div", { className: "text-right", children: _jsxs("div", { className: "font-semibold", children: [currentReport.healthcareStaff.percentage.toFixed(1), "%"] }) })] }), _jsxs("div", { className: "flex justify-between items-center p-3 border rounded", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: "Administrative Staff" }), _jsxs("div", { className: "text-sm text-gray-600", children: [currentReport.administrativeStaff.nationals, " of", " ", currentReport.administrativeStaff.total, " ", "nationals"] })] }), _jsx("div", { className: "text-right", children: _jsxs("div", { className: "font-semibold", children: [currentReport.administrativeStaff.percentage.toFixed(1), "%"] }) })] })] })] })) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Hiring Recommendations" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [targets
                                                            .filter((t) => t.status === "non-compliant")
                                                            .map((target, index) => (_jsxs("div", { className: "p-3 bg-red-50 border border-red-200 rounded", children: [_jsx("div", { className: "font-medium text-red-900", children: target.facilityType }), _jsxs("div", { className: "text-sm text-red-700 mt-1", children: ["Need to hire", " ", target.minimumNationals - target.currentNationals, " ", "more UAE nationals"] }), _jsx("div", { className: "text-xs text-red-600 mt-1", children: "Priority: High - Risk of penalties" })] }, index))), targets
                                                            .filter((t) => t.status === "at-risk")
                                                            .map((target, index) => (_jsxs("div", { className: "p-3 bg-yellow-50 border border-yellow-200 rounded", children: [_jsx("div", { className: "font-medium text-yellow-900", children: target.facilityType }), _jsxs("div", { className: "text-sm text-yellow-700 mt-1", children: ["Consider hiring", " ", target.minimumNationals - target.currentNationals, " ", "more UAE nationals"] }), _jsx("div", { className: "text-xs text-yellow-600 mt-1", children: "Priority: Medium - Preventive measure" })] }, index)))] }) })] })] }) }), _jsx(TabsContent, { value: "reporting", children: _jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "TAMM Platform Integration Status" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsx("div", { className: "p-4 border rounded", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Connection Status" }), _jsx(Badge, { variant: currentReport?.tamm_integration.connected
                                                                            ? "default"
                                                                            : "destructive", children: currentReport?.tamm_integration.connected
                                                                            ? "Connected"
                                                                            : "Disconnected" })] }) }), _jsx("div", { className: "p-4 border rounded", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Data Accuracy" }), _jsxs("span", { className: "font-semibold", children: [currentReport?.tamm_integration.dataAccuracy, "%"] })] }) }), _jsx("div", { className: "p-4 border rounded", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Last Sync" }), _jsx("span", { className: "text-sm", children: currentReport?.tamm_integration.lastSync
                                                                            ? new Date(currentReport.tamm_integration.lastSync).toLocaleDateString()
                                                                            : "Never" })] }) })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Compliance Reporting Schedule" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between items-center p-3 border rounded", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: "Monthly Workforce Report" }), _jsx("div", { className: "text-sm text-gray-600", children: "Due: End of each month" })] }), _jsx(Badge, { variant: "outline", children: "Automated" })] }), _jsxs("div", { className: "flex justify-between items-center p-3 border rounded", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: "Quarterly Compliance Review" }), _jsx("div", { className: "text-sm text-gray-600", children: "Due: 15th of following month" })] }), _jsx(Badge, { variant: "outline", children: "Manual" })] }), _jsxs("div", { className: "flex justify-between items-center p-3 border rounded", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: "Annual Tawteen Assessment" }), _jsx("div", { className: "text-sm text-gray-600", children: "Due: January 31st" })] }), _jsx(Badge, { variant: "outline", children: "Required" })] })] }) })] })] }) })] }), _jsxs("div", { className: "flex justify-end space-x-4", children: [_jsxs(Dialog, { open: showTAMMDialog, onOpenChange: setShowTAMMDialog, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", children: [_jsx(ExternalLink, { className: "w-4 h-4 mr-2" }), "TAMM Integration"] }) }), _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "TAMM Platform Integration" }), _jsx(DialogDescription, { children: "Sync workforce data with the TAMM platform for official reporting" })] }), _jsx("div", { className: "space-y-4", children: _jsxs("div", { className: "p-4 bg-blue-50 rounded border", children: [_jsx("h4", { className: "font-medium text-blue-900 mb-2", children: "Integration Status" }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Connection:" }), _jsx(Badge, { variant: currentReport?.tamm_integration.connected
                                                                            ? "default"
                                                                            : "destructive", children: currentReport?.tamm_integration.connected
                                                                            ? "Connected"
                                                                            : "Disconnected" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Last Sync:" }), _jsx("span", { children: new Date(currentReport?.tamm_integration.lastSync || "").toLocaleString() })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Data Accuracy:" }), _jsxs("span", { children: [currentReport?.tamm_integration.dataAccuracy, "%"] })] })] })] }) }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setShowTAMMDialog(false), children: "Cancel" }), _jsx(Button, { onClick: handleTAMMSync, disabled: loading, children: loading ? "Syncing..." : "Sync with TAMM" })] })] })] }), _jsxs(Dialog, { open: showReportDialog, onOpenChange: setShowReportDialog, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { children: [_jsx(FileText, { className: "w-4 h-4 mr-2" }), "Generate Report"] }) }), _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Tawteen Compliance Report" }), _jsxs(DialogDescription, { children: ["Comprehensive workforce compliance report for", " ", currentReport?.reportingPeriod] })] }), currentReport && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "p-3 bg-gray-50 rounded", children: [_jsx("div", { className: "text-sm text-gray-600", children: "Healthcare Staff" }), _jsxs("div", { className: "text-lg font-semibold", children: [currentReport.healthcareStaff.nationals, "/", currentReport.healthcareStaff.total] }), _jsxs("div", { className: "text-sm text-gray-500", children: [currentReport.healthcareStaff.percentage.toFixed(1), "% Nationals"] })] }), _jsxs("div", { className: "p-3 bg-gray-50 rounded", children: [_jsx("div", { className: "text-sm text-gray-600", children: "Administrative Staff" }), _jsxs("div", { className: "text-lg font-semibold", children: [currentReport.administrativeStaff.nationals, "/", currentReport.administrativeStaff.total] }), _jsxs("div", { className: "text-sm text-gray-500", children: [currentReport.administrativeStaff.percentage.toFixed(1), "% Nationals"] })] })] }), currentReport.penalties.financial > 0 && (_jsxs(Alert, { className: "bg-red-50 border-red-200", children: [_jsx(AlertTriangle, { className: "h-4 w-4 text-red-600" }), _jsx(AlertTitle, { className: "text-red-800", children: "Penalties Applied" }), _jsxs(AlertDescription, { className: "text-red-700", children: ["Financial penalty: AED", " ", currentReport.penalties.financial.toLocaleString(), currentReport.penalties.networkExclusion &&
                                                                    " | Network exclusion pending"] })] }))] })), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setShowReportDialog(false), children: "Close" }), _jsxs(Button, { children: [_jsx(FileText, { className: "w-4 h-4 mr-2" }), "Export Report"] })] })] })] })] })] }) }));
}
