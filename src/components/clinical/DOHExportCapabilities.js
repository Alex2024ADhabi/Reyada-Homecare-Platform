import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileText, FileSpreadsheet, Database, Shield, Clock, CheckCircle, AlertTriangle, FileDown, Archive, Zap, } from "lucide-react";
import { dohAuditAPI } from "@/api/doh-audit.api";
const DOHExportCapabilities = ({ facilityId = "FAC001", patientId, episodeId, }) => {
    const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
    const [exportProgress, setExportProgress] = useState(null);
    const [exportResult, setExportResult] = useState(null);
    const [exportConfig, setExportConfig] = useState({
        dataType: "patient-records",
        format: "pdf",
        dateRange: {
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
            endDate: new Date().toISOString().split("T")[0],
        },
        includeAttachments: true,
        encryptionRequired: true,
        filters: {
            patientIds: patientId ? [patientId] : [],
            facilityIds: [facilityId],
            documentTypes: [],
            complianceLevel: ["full", "partial"],
        },
    });
    const exportOptions = [
        {
            id: "patient-records",
            name: "Patient Records",
            description: "Complete patient medical records with demographics, clinical history, and care plans",
            icon: FileText,
            formats: ["pdf", "excel", "json"],
            estimatedSize: "2-5 MB per patient",
            processingTime: "2-3 minutes",
        },
        {
            id: "clinical-documentation",
            name: "Clinical Documentation",
            description: "All clinical forms, assessments, and documentation with electronic signatures",
            icon: FileSpreadsheet,
            formats: ["pdf", "excel", "csv", "xml"],
            estimatedSize: "1-3 MB per episode",
            processingTime: "1-2 minutes",
        },
        {
            id: "audit-trails",
            name: "Audit Trails",
            description: "Complete audit logs, access records, and compliance tracking data",
            icon: Database,
            formats: ["csv", "json", "excel"],
            estimatedSize: "500 KB - 2 MB",
            processingTime: "30 seconds - 1 minute",
        },
        {
            id: "quality-metrics",
            name: "Quality Metrics",
            description: "Quality indicators, performance metrics, and outcome measurements",
            icon: Archive,
            formats: ["excel", "csv", "pdf"],
            estimatedSize: "100-500 KB",
            processingTime: "30 seconds",
        },
    ];
    const formatOptions = [
        {
            id: "pdf",
            name: "PDF",
            description: "Portable Document Format - Best for reports and documentation",
            icon: FileText,
        },
        {
            id: "excel",
            name: "Excel",
            description: "Microsoft Excel format - Best for data analysis",
            icon: FileSpreadsheet,
        },
        {
            id: "csv",
            name: "CSV",
            description: "Comma-separated values - Best for data import/export",
            icon: Database,
        },
        {
            id: "json",
            name: "JSON",
            description: "JavaScript Object Notation - Best for system integration",
            icon: Database,
        },
        {
            id: "xml",
            name: "XML",
            description: "Extensible Markup Language - Best for structured data exchange",
            icon: Database,
        },
    ];
    const handleExport = async () => {
        try {
            setExportProgress(0);
            // Simulate export progress
            const progressInterval = setInterval(() => {
                setExportProgress((prev) => {
                    if (prev === null)
                        return 10;
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 100;
                    }
                    return prev + 10;
                });
            }, 300);
            // Call DOH export API
            const exportRequest = await dohAuditAPI.exportComplianceData({
                dataType: exportConfig.dataType,
                format: exportConfig.format,
                dateRange: exportConfig.dateRange,
                filters: exportConfig.filters,
                includeAttachments: exportConfig.includeAttachments,
            });
            // Simulate processing time
            setTimeout(() => {
                setExportResult({
                    success: true,
                    requestId: exportRequest.requestId || `export_${Date.now()}`,
                    downloadUrl: `/api/exports/download/${exportRequest.requestId}`,
                    fileSize: "2.4 MB",
                    recordCount: 156,
                    generatedAt: new Date().toISOString(),
                    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    checksum: "sha256:a1b2c3d4e5f6...",
                    encryptionStatus: exportConfig.encryptionRequired
                        ? "AES-256 Encrypted"
                        : "Not Encrypted",
                });
                setExportProgress(null);
            }, 3000);
        }
        catch (error) {
            console.error("Export failed:", error);
            setExportResult({
                success: false,
                error: "Export failed. Please try again.",
            });
            setExportProgress(null);
        }
    };
    const handleDownload = (downloadUrl) => {
        // In a real implementation, this would handle secure download
        window.open(downloadUrl, "_blank");
    };
    const selectedExportOption = exportOptions.find((opt) => opt.id === exportConfig.dataType);
    const selectedFormat = formatOptions.find((fmt) => fmt.id === exportConfig.format);
    return (_jsxs("div", { className: "bg-white space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h2", { className: "text-2xl font-bold text-gray-900 flex items-center", children: [_jsx(Download, { className: "w-6 h-6 mr-2 text-blue-600" }), "DOH Export Capabilities"] }), _jsx("p", { className: "text-gray-600 mt-1", children: "Export patient data, clinical documentation, and compliance reports in DOH-compliant formats" })] }), _jsxs(Dialog, { open: isExportDialogOpen, onOpenChange: setIsExportDialogOpen, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { className: "flex items-center", children: [_jsx(FileDown, { className: "w-4 h-4 mr-2" }), "Start Export"] }) }), _jsxs(DialogContent, { className: "max-w-4xl max-h-[90vh] overflow-y-auto", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "DOH Compliant Data Export" }), _jsx(DialogDescription, { children: "Export patient data and clinical documentation in compliance with DOH regulations" })] }), _jsxs(Tabs, { defaultValue: "data-selection", className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsx(TabsTrigger, { value: "data-selection", children: "Data Selection" }), _jsx(TabsTrigger, { value: "format-options", children: "Format Options" }), _jsx(TabsTrigger, { value: "security-settings", children: "Security" }), _jsx(TabsTrigger, { value: "export-process", children: "Export" })] }), _jsx(TabsContent, { value: "data-selection", className: "space-y-4", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-base font-medium", children: "Select Data Type" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mt-2", children: exportOptions.map((option) => {
                                                                        const Icon = option.icon;
                                                                        return (_jsx(Card, { className: `cursor-pointer transition-all ${exportConfig.dataType === option.id
                                                                                ? "ring-2 ring-blue-500 bg-blue-50"
                                                                                : "hover:bg-gray-50"}`, onClick: () => setExportConfig((prev) => ({
                                                                                ...prev,
                                                                                dataType: option.id,
                                                                            })), children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(Icon, { className: "w-5 h-5 text-blue-600 mt-1" }), _jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "font-medium", children: option.name }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: option.description }), _jsxs("div", { className: "flex items-center space-x-4 mt-2 text-xs text-gray-500", children: [_jsxs("span", { children: ["Size: ", option.estimatedSize] }), _jsxs("span", { children: ["Time: ", option.processingTime] })] })] })] }) }) }, option.id));
                                                                    }) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "start-date", children: "Start Date" }), _jsx(Input, { id: "start-date", type: "date", value: exportConfig.dateRange.startDate, onChange: (e) => setExportConfig((prev) => ({
                                                                                ...prev,
                                                                                dateRange: {
                                                                                    ...prev.dateRange,
                                                                                    startDate: e.target.value,
                                                                                },
                                                                            })) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "end-date", children: "End Date" }), _jsx(Input, { id: "end-date", type: "date", value: exportConfig.dateRange.endDate, onChange: (e) => setExportConfig((prev) => ({
                                                                                ...prev,
                                                                                dateRange: {
                                                                                    ...prev.dateRange,
                                                                                    endDate: e.target.value,
                                                                                },
                                                                            })) })] })] })] }) }), _jsx(TabsContent, { value: "format-options", className: "space-y-4", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-base font-medium", children: "Export Format" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3 mt-2", children: formatOptions
                                                                        .filter((fmt) => selectedExportOption?.formats.includes(fmt.id))
                                                                        .map((format) => {
                                                                        const Icon = format.icon;
                                                                        return (_jsx(Card, { className: `cursor-pointer transition-all ${exportConfig.format === format.id
                                                                                ? "ring-2 ring-blue-500 bg-blue-50"
                                                                                : "hover:bg-gray-50"}`, onClick: () => setExportConfig((prev) => ({
                                                                                ...prev,
                                                                                format: format.id,
                                                                            })), children: _jsx(CardContent, { className: "p-3", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Icon, { className: "w-4 h-4 text-blue-600" }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-sm", children: format.name }), _jsx("p", { className: "text-xs text-gray-600", children: format.description })] })] }) }) }, format.id));
                                                                    }) })] }), _jsxs("div", { className: "space-y-3", children: [_jsx(Label, { className: "text-base font-medium", children: "Additional Options" }), _jsx("div", { className: "space-y-2", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "include-attachments", checked: exportConfig.includeAttachments, onCheckedChange: (checked) => setExportConfig((prev) => ({
                                                                                    ...prev,
                                                                                    includeAttachments: checked,
                                                                                })) }), _jsx(Label, { htmlFor: "include-attachments", className: "text-sm", children: "Include file attachments and images" })] }) })] })] }) }), _jsx(TabsContent, { value: "security-settings", className: "space-y-4", children: _jsxs("div", { className: "space-y-4", children: [_jsxs(Alert, { className: "bg-blue-50 border-blue-200", children: [_jsx(Shield, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "Security & Compliance" }), _jsx(AlertDescription, { children: "All exports are automatically encrypted and comply with DOH data protection requirements." })] }), _jsx("div", { className: "space-y-3", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "encryption-required", checked: exportConfig.encryptionRequired, onCheckedChange: (checked) => setExportConfig((prev) => ({
                                                                            ...prev,
                                                                            encryptionRequired: checked,
                                                                        })) }), _jsx(Label, { htmlFor: "encryption-required", className: "text-sm", children: "Enable AES-256 encryption (Recommended)" })] }) }), _jsxs("div", { className: "p-4 bg-gray-50 rounded-lg", children: [_jsx("h4", { className: "font-medium text-sm mb-2", children: "Export Security Features" }), _jsxs("ul", { className: "text-sm text-gray-600 space-y-1", children: [_jsxs("li", { className: "flex items-center", children: [_jsx(CheckCircle, { className: "w-3 h-3 mr-2 text-green-500" }), " ", "End-to-end encryption"] }), _jsxs("li", { className: "flex items-center", children: [_jsx(CheckCircle, { className: "w-3 h-3 mr-2 text-green-500" }), " ", "Audit trail logging"] }), _jsxs("li", { className: "flex items-center", children: [_jsx(CheckCircle, { className: "w-3 h-3 mr-2 text-green-500" }), " ", "Access control validation"] }), _jsxs("li", { className: "flex items-center", children: [_jsx(CheckCircle, { className: "w-3 h-3 mr-2 text-green-500" }), " ", "File integrity verification"] }), _jsxs("li", { className: "flex items-center", children: [_jsx(CheckCircle, { className: "w-3 h-3 mr-2 text-green-500" }), " ", "Automatic expiry (7 days)"] })] })] })] }) }), _jsx(TabsContent, { value: "export-process", className: "space-y-4", children: _jsxs("div", { className: "space-y-4", children: [!exportResult && exportProgress === null && (_jsxs("div", { className: "text-center py-8", children: [_jsxs("div", { className: "mb-4", children: [_jsx("h3", { className: "text-lg font-medium", children: "Ready to Export" }), _jsxs("p", { className: "text-sm text-gray-600 mt-1", children: [selectedExportOption?.name, " in ", selectedFormat?.name, " ", "format"] })] }), _jsxs("div", { className: "space-y-2 text-sm text-gray-600", children: [_jsxs("p", { children: ["Date Range: ", exportConfig.dateRange.startDate, " to", " ", exportConfig.dateRange.endDate] }), _jsxs("p", { children: ["Estimated Processing Time:", " ", selectedExportOption?.processingTime] }), _jsxs("p", { children: ["Security:", " ", exportConfig.encryptionRequired
                                                                                    ? "AES-256 Encrypted"
                                                                                    : "Standard"] })] }), _jsxs(Button, { onClick: handleExport, className: "mt-4", children: [_jsx(Zap, { className: "w-4 h-4 mr-2" }), "Start Export Process"] })] })), exportProgress !== null && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("h3", { className: "text-lg font-medium", children: "Processing Export..." }), _jsx("p", { className: "text-sm text-gray-600", children: "Please wait while we prepare your data" })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Progress" }), _jsxs("span", { children: [exportProgress, "%"] })] }), _jsx(Progress, { value: exportProgress, className: "h-2" })] }), _jsxs("div", { className: "flex items-center justify-center text-sm text-gray-600", children: [_jsx(Clock, { className: "w-4 h-4 mr-2" }), "Processing data and applying security measures..."] })] })), exportResult && (_jsx("div", { className: "space-y-4", children: exportResult.success ? (_jsxs("div", { className: "text-center", children: [_jsx(CheckCircle, { className: "w-12 h-12 text-green-500 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-green-900", children: "Export Completed Successfully" }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Your data has been exported and is ready for download" }), _jsx("div", { className: "mt-4 p-4 bg-green-50 rounded-lg text-left", children: _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "File Size:" }), " ", exportResult.fileSize] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Records:" }), " ", exportResult.recordCount] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Generated:" }), " ", new Date(exportResult.generatedAt).toLocaleString()] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Expires:" }), " ", new Date(exportResult.expiryDate).toLocaleDateString()] }), _jsxs("div", { className: "col-span-2", children: [_jsx("span", { className: "font-medium", children: "Security:" }), " ", exportResult.encryptionStatus] }), _jsxs("div", { className: "col-span-2", children: [_jsx("span", { className: "font-medium", children: "Checksum:" }), _jsx("code", { className: "text-xs bg-gray-100 px-1 rounded ml-1", children: exportResult.checksum })] })] }) }), _jsxs(Button, { onClick: () => handleDownload(exportResult.downloadUrl), className: "mt-4", children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Download Export File"] })] })) : (_jsxs("div", { className: "text-center", children: [_jsx(AlertTriangle, { className: "w-12 h-12 text-red-500 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-red-900", children: "Export Failed" }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: exportResult.error }), _jsx(Button, { onClick: () => setExportResult(null), className: "mt-4", children: "Try Again" })] })) }))] }) })] }), _jsx(DialogFooter, { children: _jsx(Button, { variant: "outline", onClick: () => setIsExportDialogOpen(false), children: "Close" }) })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Total Exports" }), _jsx("p", { className: "text-2xl font-bold", children: "1,247" })] }), _jsx(FileDown, { className: "w-8 h-8 text-blue-500" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "This Month" }), _jsx("p", { className: "text-2xl font-bold", children: "89" })] }), _jsx(Archive, { className: "w-8 h-8 text-green-500" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Data Volume" }), _jsx("p", { className: "text-2xl font-bold", children: "2.4 TB" })] }), _jsx(Database, { className: "w-8 h-8 text-purple-500" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Compliance Rate" }), _jsx("p", { className: "text-2xl font-bold", children: "100%" })] }), _jsx(Shield, { className: "w-8 h-8 text-orange-500" })] }) }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Recent Exports" }), _jsx(CardDescription, { children: "Latest data exports and their status" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: [
                                {
                                    id: "EXP001",
                                    type: "Patient Records",
                                    format: "PDF",
                                    date: "2024-01-15 14:30",
                                    size: "2.4 MB",
                                    status: "completed",
                                    records: 156,
                                },
                                {
                                    id: "EXP002",
                                    type: "Clinical Documentation",
                                    format: "Excel",
                                    date: "2024-01-15 12:15",
                                    size: "1.8 MB",
                                    status: "completed",
                                    records: 89,
                                },
                                {
                                    id: "EXP003",
                                    type: "Audit Trails",
                                    format: "CSV",
                                    date: "2024-01-15 09:45",
                                    size: "756 KB",
                                    status: "completed",
                                    records: 1247,
                                },
                            ].map((export_item) => (_jsxs("div", { className: "flex items-center justify-between p-3 border rounded-lg", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(FileText, { className: "w-5 h-5 text-blue-500" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-sm", children: export_item.type }), _jsxs("p", { className: "text-xs text-gray-600", children: [export_item.format, " \u2022 ", export_item.records, " records \u2022", " ", export_item.size] })] })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-xs text-gray-600", children: export_item.date }), _jsx(Badge, { variant: "outline", className: "text-xs bg-green-50 text-green-700", children: export_item.status })] }), _jsx(Button, { size: "sm", variant: "outline", children: _jsx(Download, { className: "w-3 h-3" }) })] })] }, export_item.id))) }) })] })] }));
};
export default DOHExportCapabilities;
