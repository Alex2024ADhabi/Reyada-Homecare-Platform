import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { FileText, Upload, Save, CheckCircle, AlertCircle, Plus, Trash2, DollarSign, Clock, Send, } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useRevenueManagement } from "@/hooks/useRevenueManagement";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { OfflineBanner } from "@/components/ui/offline-banner";
// Define the form schema with Zod
const claimFormSchema = z.object({
    patientId: z.string().min(1, "Patient ID is required"),
    episodeId: z.string().min(1, "Episode ID is required"),
    claimType: z.string().min(1, "Claim type is required"),
    billingPeriod: z.object({
        startDate: z.string().min(1, "Start date is required"),
        endDate: z.string().min(1, "End date is required"),
    }),
    serviceLines: z
        .array(z.object({
        serviceCode: z.string().min(1, "Service code is required"),
        serviceDescription: z.string().min(1, "Description is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        unitPrice: z.number().min(0, "Unit price must be positive"),
        dateOfService: z.string().min(1, "Date of service is required"),
        providerId: z.string().min(1, "Provider ID is required"),
    }))
        .min(1, "At least one service line is required"),
    documents: z.array(z.string()).min(1, "At least one document is required"),
    notes: z.string().optional(),
});
const ClaimSubmissionForm = ({ patientId = "P12345", episodeId = "EP789", isOffline: propIsOffline, onComplete, }) => {
    // Using toast from use-toast
    const { isOnline, isSyncing, pendingItems, syncPendingData } = useOfflineSync();
    const { submitClaim, submitBatchClaims, updateClaimStatus, isLoading, error, } = useRevenueManagement();
    const isOffline = propIsOffline !== undefined ? propIsOffline : !isOnline;
    const [activeTab, setActiveTab] = useState("claim-details");
    const [serviceLines, setServiceLines] = useState([]);
    const [submissionSuccess, setSubmissionSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedDocuments, setSelectedDocuments] = useState([
        "claim-form",
        "service-log",
    ]);
    // Mock service codes for demonstration
    const serviceCodes = [
        {
            code: "99213",
            description: "Office/outpatient visit, established patient",
        },
        {
            code: "99214",
            description: "Office/outpatient visit, established patient",
        },
        { code: "97110", description: "Therapeutic exercise" },
        { code: "97112", description: "Neuromuscular reeducation" },
        { code: "97140", description: "Manual therapy" },
        {
            code: "G0151",
            description: "Services performed by a qualified physical therapist",
        },
        {
            code: "G0152",
            description: "Services performed by a qualified occupational therapist",
        },
        {
            code: "G0153",
            description: "Services performed by a qualified speech-language pathologist",
        },
    ];
    // Initialize the form with default values
    const form = useForm({
        resolver: zodResolver(claimFormSchema),
        defaultValues: {
            patientId,
            episodeId,
            claimType: "",
            billingPeriod: {
                startDate: "",
                endDate: "",
            },
            serviceLines: [],
            documents: selectedDocuments,
            notes: "",
        },
    });
    const addServiceLine = () => {
        const newServiceLine = {
            id: `service-${Date.now()}`,
            serviceCode: "",
            serviceDescription: "",
            quantity: 1,
            unitPrice: 0,
            totalAmount: 0,
            dateOfService: "",
            providerId: "",
            modifiers: [],
        };
        setServiceLines([...serviceLines, newServiceLine]);
    };
    const removeServiceLine = (id) => {
        if (serviceLines.length > 1) {
            setServiceLines(serviceLines.filter((line) => line.id !== id));
        }
        else {
            toast({
                title: "Cannot remove",
                description: "At least one service line is required",
                variant: "destructive",
            });
        }
    };
    const updateServiceLine = (id, field, value) => {
        setServiceLines(serviceLines.map((line) => {
            if (line.id === id) {
                const updatedLine = { ...line, [field]: value };
                if (field === "quantity" || field === "unitPrice") {
                    updatedLine.totalAmount =
                        updatedLine.quantity * updatedLine.unitPrice;
                }
                return updatedLine;
            }
            return line;
        }));
    };
    const handleDocumentChange = (document) => {
        if (selectedDocuments.includes(document)) {
            setSelectedDocuments(selectedDocuments.filter((doc) => doc !== document));
        }
        else {
            setSelectedDocuments([...selectedDocuments, document]);
        }
        form.setValue("documents", selectedDocuments);
    };
    const calculateTotalAmount = () => {
        return serviceLines.reduce((total, line) => total + line.totalAmount, 0);
    };
    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            // Validate service lines
            if (serviceLines.length === 0) {
                toast({
                    title: "Validation Error",
                    description: "Please add at least one service line.",
                    variant: "destructive",
                });
                setIsSubmitting(false);
                return;
            }
            // Validate required fields for each service line
            const invalidLines = serviceLines.filter((line) => !line.serviceCode ||
                !line.dateOfService ||
                !line.providerId ||
                line.unitPrice <= 0);
            if (invalidLines.length > 0) {
                toast({
                    title: "Validation Error",
                    description: "Please complete all required fields for each service line.",
                    variant: "destructive",
                });
                setIsSubmitting(false);
                return;
            }
            // Update documents before submission
            data.documents = selectedDocuments;
            // Prepare claim data
            const claimData = {
                ...data,
                serviceLines,
                totalAmount: calculateTotalAmount(),
                submissionDate: new Date().toISOString(),
                submittedBy: localStorage.getItem("user_id") || "unknown",
                facilityDetails: {
                    name: "Reyada Homecare",
                    licenseNumber: "DOH-HC-2023-001",
                    address: "Abu Dhabi, UAE",
                },
                claimMetadata: {
                    submissionVersion: "1.0",
                    platform: "Reyada Homecare Platform",
                    submissionTimestamp: new Date().toISOString(),
                },
            };
            // Submit claim
            const result = await submitClaim(claimData);
            if (result.offlineQueued) {
                toast({
                    title: "Claim Queued",
                    description: "Your claim has been saved and will be submitted when you're back online.",
                });
            }
            else {
                toast({
                    title: "Claim Submitted",
                    description: "Your claim has been successfully submitted.",
                });
            }
            setSubmissionSuccess(true);
            if (onComplete)
                onComplete(true);
        }
        catch (err) {
            console.error("Error submitting claim:", err);
            toast({
                title: "Submission Failed",
                description: error ||
                    err.message ||
                    "There was an error submitting your claim. Please try again.",
                variant: "destructive",
            });
            if (onComplete)
                onComplete(false);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleReset = () => {
        form.reset();
        setServiceLines([]);
        setSubmissionSuccess(false);
        setSelectedDocuments(["claim-form", "service-log"]);
    };
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-AE", {
            style: "currency",
            currency: "AED",
        }).format(amount);
    };
    // Initialize with one service line if empty
    useEffect(() => {
        if (serviceLines.length === 0) {
            addServiceLine();
        }
    }, []);
    return (_jsxs("div", { className: "w-full bg-background", children: [_jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold", children: "Submit Insurance Claim" }), _jsx("p", { className: "text-gray-500", children: "Complete the form below to submit a new insurance claim" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: isOffline ? "destructive" : "outline", className: "text-xs", children: isOffline ? "Offline Mode" : "Online" }), _jsxs(Badge, { variant: "outline", className: "text-xs", children: ["Patient ID: ", patientId] }), _jsxs(Badge, { variant: "outline", className: "text-xs", children: ["Episode: ", episodeId] })] })] }), _jsx(OfflineBanner, { isOnline: isOnline, pendingItems: {
                    clinicalForms: pendingItems.clinicalForms,
                    patientAssessments: pendingItems.patientAssessments,
                    serviceInitiations: pendingItems.serviceInitiations,
                }, isSyncing: isSyncing, onSyncClick: syncPendingData }), error && (_jsxs("div", { className: "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-center", children: [_jsx(AlertCircle, { className: "h-5 w-5 mr-2" }), _jsx("span", { children: error })] })), submissionSuccess ? (_jsxs(Card, { className: "w-full", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "text-xl text-center text-green-600", children: [_jsx(CheckCircle, { className: "h-12 w-12 mx-auto mb-2" }), "Claim Submission Complete"] }), _jsxs(CardDescription, { className: "text-center", children: ["Your claim has been successfully", " ", isOffline ? "saved for later submission" : "submitted"] })] }), _jsx(CardContent, { className: "space-y-4", children: _jsxs("div", { className: "bg-muted p-4 rounded-md", children: [_jsx("p", { className: "font-medium", children: "Claim Details:" }), _jsxs("p", { className: "text-sm", children: ["Patient ID: ", patientId] }), _jsxs("p", { className: "text-sm", children: ["Episode ID: ", episodeId] }), _jsxs("p", { className: "text-sm", children: ["Total Amount: ", formatCurrency(calculateTotalAmount())] }), _jsxs("p", { className: "text-sm", children: ["Service Lines: ", serviceLines.length] }), _jsx("p", { className: "font-medium mt-2", children: "Submission Date:" }), _jsx("p", { className: "text-sm", children: new Date().toLocaleDateString() })] }) }), _jsx(CardFooter, { className: "flex justify-center", children: _jsx(Button, { onClick: handleReset, children: "Submit Another Claim" }) })] })) : (_jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-3", children: [_jsxs(TabsTrigger, { value: "claim-details", children: [_jsx(FileText, { className: "h-4 w-4 mr-2" }), "Claim Details"] }), _jsxs(TabsTrigger, { value: "service-lines", children: [_jsx(DollarSign, { className: "h-4 w-4 mr-2" }), "Service Lines"] }), _jsxs(TabsTrigger, { value: "review-submit", children: [_jsx(Send, { className: "h-4 w-4 mr-2" }), "Review & Submit"] })] }), _jsx(TabsContent, { value: "claim-details", className: "mt-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Claim Information" }), _jsx(CardDescription, { children: "Enter basic claim details and billing period" })] }), _jsx(CardContent, { children: _jsx(Form, { ...form, children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsx(FormField, { control: form.control, name: "claimType", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Claim Type" }), _jsxs(Select, { onValueChange: field.onChange, defaultValue: field.value, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select claim type" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "initial", children: "Initial Claim" }), _jsx(SelectItem, { value: "resubmission", children: "Resubmission" }), _jsx(SelectItem, { value: "adjustment", children: "Adjustment" }), _jsx(SelectItem, { value: "void", children: "Void/Cancel" })] })] }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "billingPeriod.startDate", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Billing Period Start Date" }), _jsx(FormControl, { children: _jsx(Input, { type: "date", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "billingPeriod.endDate", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Billing Period End Date" }), _jsx(FormControl, { children: _jsx(Input, { type: "date", ...field }) }), _jsx(FormMessage, {})] })) })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Patient Information" }), _jsxs("div", { className: "bg-muted p-4 rounded-md space-y-2", children: [_jsxs("p", { className: "text-sm", children: [_jsx("strong", { children: "Patient ID:" }), " ", patientId] }), _jsxs("p", { className: "text-sm", children: [_jsx("strong", { children: "Episode ID:" }), " ", episodeId] }), _jsxs("p", { className: "text-sm", children: [_jsx("strong", { children: "Name:" }), " Mohammed Al Mansoori"] }), _jsxs("p", { className: "text-sm", children: [_jsx("strong", { children: "Emirates ID:" }), " 784-1985-1234567-8"] }), _jsxs("p", { className: "text-sm", children: [_jsx("strong", { children: "Insurance:" }), " Daman - Thiqa"] })] })] }), _jsx(FormField, { control: form.control, name: "notes", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Submission Notes" }), _jsx(FormControl, { children: _jsx(Textarea, { placeholder: "Add any notes about this claim submission...", className: "min-h-[100px]", ...field }) }), _jsx(FormDescription, { children: "Optional notes for internal reference" }), _jsx(FormMessage, {})] })) })] })] }) }) }), _jsx(CardFooter, { children: _jsx(Button, { onClick: () => setActiveTab("service-lines"), children: "Continue to Service Lines" }) })] }) }), _jsx(TabsContent, { value: "service-lines", className: "mt-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: "Service Lines" }), _jsx(CardDescription, { children: "Add services provided during the billing period" })] }), _jsxs(Button, { onClick: addServiceLine, children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Add Service Line"] })] }) }), _jsx(CardContent, { children: serviceLines.length === 0 ? (_jsxs("div", { className: "text-center py-8 text-muted-foreground", children: [_jsx(FileText, { className: "h-12 w-12 mx-auto mb-4 opacity-50" }), _jsx("p", { children: "No service lines added yet" }), _jsx("p", { className: "text-sm", children: "Click \"Add Service Line\" to get started" })] })) : (_jsxs("div", { className: "space-y-4", children: [serviceLines.map((line, index) => (_jsxs(Card, { className: "border-l-4 border-l-primary", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs(CardTitle, { className: "text-base", children: ["Service Line ", index + 1] }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => removeServiceLine(line.id), children: _jsx(Trash2, { className: "h-4 w-4" }) })] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Service Code" }), _jsxs(Select, { value: line.serviceCode, onValueChange: (value) => {
                                                                                    updateServiceLine(line.id, "serviceCode", value);
                                                                                    const selectedService = serviceCodes.find((s) => s.code === value);
                                                                                    if (selectedService) {
                                                                                        updateServiceLine(line.id, "serviceDescription", selectedService.description);
                                                                                    }
                                                                                }, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select service code" }) }), _jsx(SelectContent, { children: serviceCodes.map((service) => (_jsxs(SelectItem, { value: service.code, children: [service.code, " - ", service.description] }, service.code))) })] })] }), _jsxs("div", { children: [_jsx(Label, { children: "Date of Service" }), _jsx(Input, { type: "date", value: line.dateOfService, onChange: (e) => updateServiceLine(line.id, "dateOfService", e.target.value) })] }), _jsxs("div", { children: [_jsx(Label, { children: "Provider ID" }), _jsx(Input, { value: line.providerId, onChange: (e) => updateServiceLine(line.id, "providerId", e.target.value), placeholder: "Enter provider ID" })] }), _jsxs("div", { children: [_jsx(Label, { children: "Quantity" }), _jsx(Input, { type: "number", min: "1", value: line.quantity, onChange: (e) => updateServiceLine(line.id, "quantity", parseInt(e.target.value) || 1) })] }), _jsxs("div", { children: [_jsx(Label, { children: "Unit Price (AED)" }), _jsx(Input, { type: "number", min: "0", step: "0.01", value: line.unitPrice, onChange: (e) => updateServiceLine(line.id, "unitPrice", parseFloat(e.target.value) || 0) })] }), _jsxs("div", { children: [_jsx(Label, { children: "Total Amount" }), _jsx(Input, { value: formatCurrency(line.totalAmount), readOnly: true, className: "bg-muted" })] })] }), _jsxs("div", { className: "mt-4", children: [_jsx(Label, { children: "Service Description" }), _jsx(Textarea, { value: line.serviceDescription, onChange: (e) => updateServiceLine(line.id, "serviceDescription", e.target.value), placeholder: "Enter service description", className: "mt-1" })] })] })] }, line.id))), _jsx(Card, { className: "bg-muted/50", children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-lg font-semibold", children: "Total Claim Amount:" }), _jsx("span", { className: "text-2xl font-bold text-primary", children: formatCurrency(calculateTotalAmount()) })] }) }) })] })) }), _jsxs(CardFooter, { className: "flex justify-between", children: [_jsx(Button, { variant: "outline", onClick: () => setActiveTab("claim-details"), children: "Back to Claim Details" }), _jsx(Button, { onClick: () => setActiveTab("review-submit"), disabled: serviceLines.length === 0, children: "Continue to Review" })] })] }) }), _jsx(TabsContent, { value: "review-submit", className: "mt-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Review & Submit" }), _jsx(CardDescription, { children: "Review your claim details before submission" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Claim Summary" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "bg-muted p-4 rounded-md", children: [_jsx("h4", { className: "font-medium mb-2", children: "Basic Information" }), _jsxs("p", { className: "text-sm", children: ["Claim Type: ", form.getValues("claimType")] }), _jsxs("p", { className: "text-sm", children: ["Patient ID: ", patientId] }), _jsxs("p", { className: "text-sm", children: ["Episode ID: ", episodeId] }), _jsxs("p", { className: "text-sm", children: ["Billing Period:", " ", form.getValues("billingPeriod.startDate"), " to", " ", form.getValues("billingPeriod.endDate")] })] }), _jsxs("div", { className: "bg-muted p-4 rounded-md", children: [_jsx("h4", { className: "font-medium mb-2", children: "Financial Summary" }), _jsxs("p", { className: "text-sm", children: ["Service Lines: ", serviceLines.length] }), _jsxs("p", { className: "text-sm", children: ["Total Amount: ", formatCurrency(calculateTotalAmount())] }), _jsxs("p", { className: "text-sm", children: ["Submission Date: ", new Date().toLocaleDateString()] })] })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Service Lines Summary" }), _jsx("div", { className: "border rounded-md overflow-hidden", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Service Code" }), _jsx(TableHead, { children: "Description" }), _jsx(TableHead, { children: "Date" }), _jsx(TableHead, { children: "Qty" }), _jsx(TableHead, { children: "Unit Price" }), _jsx(TableHead, { children: "Total" })] }) }), _jsxs(TableBody, { children: [serviceLines.map((line) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: line.serviceCode }), _jsx(TableCell, { children: line.serviceDescription }), _jsx(TableCell, { children: new Date(line.dateOfService).toLocaleDateString() }), _jsx(TableCell, { children: line.quantity }), _jsx(TableCell, { children: formatCurrency(line.unitPrice) }), _jsx(TableCell, { className: "font-medium", children: formatCurrency(line.totalAmount) })] }, line.id))), _jsxs(TableRow, { className: "bg-muted/50", children: [_jsx(TableCell, { colSpan: 5, className: "font-semibold", children: "Total Claim Amount:" }), _jsx(TableCell, { className: "font-bold text-lg", children: formatCurrency(calculateTotalAmount()) })] })] })] }) })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Required Documents" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "claim-form", checked: selectedDocuments.includes("claim-form"), onCheckedChange: () => handleDocumentChange("claim-form") }), _jsx("label", { htmlFor: "claim-form", className: "text-sm font-medium", children: "Claim Form" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "service-log", checked: selectedDocuments.includes("service-log"), onCheckedChange: () => handleDocumentChange("service-log") }), _jsx("label", { htmlFor: "service-log", className: "text-sm font-medium", children: "Service Log" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "authorization-letter", checked: selectedDocuments.includes("authorization-letter"), onCheckedChange: () => handleDocumentChange("authorization-letter") }), _jsx("label", { htmlFor: "authorization-letter", className: "text-sm font-medium", children: "Authorization Letter" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "medical-records", checked: selectedDocuments.includes("medical-records"), onCheckedChange: () => handleDocumentChange("medical-records") }), _jsx("label", { htmlFor: "medical-records", className: "text-sm font-medium", children: "Medical Records" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "invoice", checked: selectedDocuments.includes("invoice"), onCheckedChange: () => handleDocumentChange("invoice") }), _jsx("label", { htmlFor: "invoice", className: "text-sm font-medium", children: "Invoice" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "prescription", checked: selectedDocuments.includes("prescription"), onCheckedChange: () => handleDocumentChange("prescription") }), _jsx("label", { htmlFor: "prescription", className: "text-sm font-medium", children: "Prescription" })] })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Submission Checklist" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Checkbox, { checked: serviceLines.length > 0 }), _jsx(Label, { className: "text-sm", children: "At least one service line added" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Checkbox, { checked: serviceLines.every((line) => line.serviceCode &&
                                                                            line.dateOfService &&
                                                                            line.providerId) }), _jsx(Label, { className: "text-sm", children: "All service lines have required fields completed" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Checkbox, { checked: form.getValues("billingPeriod.startDate") &&
                                                                            form.getValues("billingPeriod.endDate") }), _jsx(Label, { className: "text-sm", children: "Billing period specified" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Checkbox, { checked: calculateTotalAmount() > 0 }), _jsx(Label, { className: "text-sm", children: "Total claim amount is greater than zero" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Checkbox, { checked: selectedDocuments.length > 0 }), _jsx(Label, { className: "text-sm", children: "Required documents selected" })] })] })] })] }) }), _jsxs(CardFooter, { className: "flex justify-between", children: [_jsx(Button, { variant: "outline", onClick: () => setActiveTab("service-lines"), children: "Back to Service Lines" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "outline", onClick: handleReset, children: "Reset Form" }), _jsx(Button, { onClick: form.handleSubmit(onSubmit), disabled: isSubmitting ||
                                                        serviceLines.length === 0 ||
                                                        calculateTotalAmount() <= 0, children: isSubmitting ? (_jsxs(_Fragment, { children: [_jsx(Clock, { className: "h-4 w-4 mr-2 animate-spin" }), "Submitting..."] })) : (_jsx(_Fragment, { children: isOnline ? (_jsxs(_Fragment, { children: [_jsx(Upload, { className: "h-4 w-4 mr-2" }), " Submit Claim"] })) : (_jsxs(_Fragment, { children: [_jsx(Save, { className: "h-4 w-4 mr-2" }), " Save for Later"] })) })) })] })] })] }) })] }))] }));
};
export default ClaimSubmissionForm;
