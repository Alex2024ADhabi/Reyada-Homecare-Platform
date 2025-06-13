import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { FileText, Upload, Save, CheckCircle, AlertCircle, FileUp, Clipboard, ClipboardCheck, User, CreditCard, Activity, FileSpreadsheet, FileCheck, FileBarChart, FileSymlink, Send, Clock, CheckSquare, BarChart, FileSearch, FileQuestion, FileX, FileCheck2, History, DollarSign, Receipt, Percent, CalendarClock, ClipboardList, Banknote, UserCheck, CalendarDays, BadgeCheck, BadgeAlert, ClipboardEdit, FileWarning, FilePlus2, UserCog, ShieldCheck, ShieldAlert, Bell, Loader2, } from "lucide-react";
// Mock revenue metrics data
const mockRevenueMetrics = {
    totalClaims: 156,
    totalAmount: 1250000,
    paidAmount: 980000,
    pendingAmount: 180000,
    deniedAmount: 90000,
    adjustmentAmount: 35000,
    collectionRate: 78.4,
    averageDaysToPayment: 32.5,
};
// Mock payment records
const mockPaymentRecords = [
    {
        id: "pay-001",
        claimId: "claim-001",
        claimNumber: "DAMAN-CL-2023-12345",
        paymentDate: "2023-12-25",
        paymentAmount: 11250,
        paymentMethod: "Bank Transfer",
        paymentReference: "PAY-2023-98765",
        expectedAmount: 11250,
        variance: 0,
        status: "reconciled",
    },
    {
        id: "pay-002",
        claimId: "claim-002",
        claimNumber: "DAMAN-CL-2024-00123",
        paymentDate: "2024-01-25",
        paymentAmount: 9720,
        paymentMethod: "Bank Transfer",
        paymentReference: "PAY-2024-12345",
        expectedAmount: 10800,
        variance: -1080,
        varianceReason: "Service code adjustment",
        status: "reconciled",
    },
];
// Mock denial records
const mockDenialRecords = [
    {
        id: "den-001",
        claimId: "claim-004",
        claimNumber: "DAMAN-CL-2024-00789",
        denialDate: "2024-02-28",
        denialReason: "Missing documentation",
        denialCode: "MD-001",
        appealStatus: "in_progress",
        appealDeadline: "2024-03-28",
        supportingDocuments: ["medical-report", "authorization-letter"],
        status: "active",
        notes: "Appeal in progress, additional documentation submitted",
    },
    {
        id: "den-002",
        claimId: "claim-005",
        claimNumber: "DAMAN-CL-2024-00890",
        denialDate: "2024-03-05",
        denialReason: "Service not covered",
        denialCode: "SNC-002",
        appealStatus: "submitted",
        appealDeadline: "2024-04-05",
        appealSubmissionDate: "2024-03-15",
        supportingDocuments: ["medical-necessity", "prior-authorization"],
        status: "active",
        notes: "Appeal submitted with medical necessity documentation",
    },
];
export const ClaimsSubmissionForm = ({ patientId = "P12345", episodeId = "EP789", authorizationId = "AUTH-12345", isOffline = false, onComplete, }) => {
    const form = useForm({
        defaultValues: {
            claimType: "initial",
            billingPeriod: "current-month",
            claimNotes: "",
            includeAllServices: true,
        },
    });
    const [submissionProgress, setSubmissionProgress] = useState(0);
    const [activeTab, setActiveTab] = useState("claim-assembly");
    const [revenueMetrics, setRevenueMetrics] = useState(mockRevenueMetrics);
    const [paymentRecords, setPaymentRecords] = useState(mockPaymentRecords);
    const [denialRecords, setDenialRecords] = useState(mockDenialRecords);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionSuccess, setSubmissionSuccess] = useState(false);
    // Monthly service tracking state
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [monthlyServices, setMonthlyServices] = useState([]);
    // Clinician licenses state
    const [clinicianLicenses, setClinicianLicenses] = useState([]);
    const [selectedLicense, setSelectedLicense] = useState(null);
    const [showLicenseForm, setShowLicenseForm] = useState(false);
    const [licenseFormMode, setLicenseFormMode] = useState("add");
    // Claims audit state
    const [auditResults, setAuditResults] = useState({ passed: 0, failed: 0, total: 0 });
    const [auditInProgress, setAuditInProgress] = useState(false);
    // Mock patient details
    const [patientDetails] = useState({
        name: "Mohammed Al Mansoori",
        emiratesId: "784-1985-1234567-8",
        dateOfBirth: "1985-06-15",
        gender: "Male",
        nationality: "UAE",
        insuranceDetails: {
            provider: "Daman - Thiqa",
            policyNumber: "THQ-12345678",
            expiryDate: "2024-12-31",
        },
    });
    // Mock authorization details
    const [authorizationDetails] = useState({
        id: authorizationId,
        referenceNumber: "DAMAN-PA-2024-12345",
        approvalDate: "2024-01-15",
        effectiveDate: "2024-01-20",
        expirationDate: "2024-04-20",
        approvedServices: ["nursing", "physiotherapy"],
        approvedFrequency: {
            nursing: "Daily",
            physiotherapy: "3 times per week",
        },
        approvedDuration: 90,
        status: "approved",
    });
    // Mock service lines
    const [serviceLines, setServiceLines] = useState([
        {
            id: "sl-001",
            serviceCode: "HN001",
            serviceDescription: "Home Nursing Visit - Standard",
            quantity: 30,
            unitPrice: 250,
            totalAmount: 7500,
            dateOfService: "2024-01-20 to 2024-02-19",
            providerId: "N12345",
            providerName: "Nurse Sarah Ahmed",
            authorizationReference: authorizationId,
        },
        {
            id: "sl-002",
            serviceCode: "PT001",
            serviceDescription: "Physical Therapy Session - Standard",
            quantity: 12,
            unitPrice: 300,
            totalAmount: 3600,
            dateOfService: "2024-01-22 to 2024-02-17",
            providerId: "PT6789",
            providerName: "Therapist Ali Hassan",
            authorizationReference: authorizationId,
        },
    ]);
    // Mock claim history
    const [claimHistory, setClaimHistory] = useState([
        {
            id: "claim-001",
            claimNumber: "DAMAN-CL-2023-12345",
            submissionDate: "2023-12-15",
            status: "paid",
            amount: 11250,
            paidAmount: 11250,
            comments: "Claim processed and payment issued",
            reviewer: "Daman Claims Department",
            reviewDate: "2023-12-22",
            paymentDate: "2023-12-25",
            paymentReference: "PAY-2023-98765",
        },
        {
            id: "claim-002",
            claimNumber: "DAMAN-CL-2024-00123",
            submissionDate: "2024-01-15",
            status: "partial",
            amount: 10800,
            paidAmount: 9720,
            comments: "Partial payment due to service code adjustment",
            reviewer: "Daman Claims Department",
            reviewDate: "2024-01-22",
            paymentDate: "2024-01-25",
            paymentReference: "PAY-2024-12345",
        },
        {
            id: "claim-003",
            claimNumber: "DAMAN-CL-2024-00456",
            submissionDate: "2024-02-15",
            status: "in-review",
            amount: 11100,
            comments: "Under financial review",
            reviewer: "Daman Claims Department",
            reviewDate: "N/A",
        },
    ]);
    // Required documents for Claims Submission
    const requiredDocuments = [
        {
            id: "claim-form",
            name: "Daman Claim Submission Form",
            required: true,
            uploaded: false,
            icon: _jsx(FileText, { className: "h-4 w-4" }),
            description: "Official Daman form for claim submission",
        },
        {
            id: "service-log",
            name: "Service Log/Visit Notes",
            required: true,
            uploaded: false,
            icon: _jsx(ClipboardList, { className: "h-4 w-4" }),
            description: "Detailed log of all services provided during billing period",
        },
        {
            id: "authorization-letter",
            name: "Authorization Approval Letter",
            required: true,
            uploaded: false,
            icon: _jsx(FileCheck, { className: "h-4 w-4" }),
            description: "Copy of the approved authorization letter from Daman",
        },
        {
            id: "invoice",
            name: "Detailed Invoice",
            required: true,
            uploaded: false,
            icon: _jsx(Receipt, { className: "h-4 w-4" }),
            description: "Itemized invoice for all services being claimed",
        },
        {
            id: "attendance-sheet",
            name: "Staff Attendance Sheet",
            required: true,
            uploaded: false,
            icon: _jsx(CalendarClock, { className: "h-4 w-4" }),
            description: "Staff attendance record with timestamps for each visit",
        },
        {
            id: "clinical-notes",
            name: "Clinical Progress Notes",
            required: true,
            uploaded: false,
            icon: _jsx(FileSymlink, { className: "h-4 w-4" }),
            description: "Clinical documentation for the billing period",
        },
        {
            id: "mar",
            name: "Medication Administration Record",
            required: true,
            uploaded: false,
            icon: _jsx(Clipboard, { className: "h-4 w-4" }),
            description: "Documentation of medication administration during billing period",
        },
        {
            id: "vital-signs",
            name: "Vital Signs Monitoring Sheet",
            required: true,
            uploaded: false,
            icon: _jsx(Activity, { className: "h-4 w-4" }),
            description: "Record of patient's vital signs measurements",
        },
        {
            id: "thiqa-card",
            name: "Patient Thiqa Card copy",
            required: true,
            uploaded: false,
            icon: _jsx(CreditCard, { className: "h-4 w-4" }),
            description: "Copy of patient's Thiqa insurance card",
        },
        {
            id: "emirates-id",
            name: "Patient Emirates ID copy",
            required: true,
            uploaded: false,
            icon: _jsx(CreditCard, { className: "h-4 w-4" }),
            description: "Copy of patient's Emirates ID",
        },
        {
            id: "provider-licenses",
            name: "Provider Licenses",
            required: true,
            uploaded: false,
            icon: _jsx(FileCheck, { className: "h-4 w-4" }),
            description: "Copies of professional licenses for all providers",
        },
        {
            id: "previous-claim",
            name: "Previous Claim Documentation",
            required: false,
            uploaded: false,
            icon: _jsx(History, { className: "h-4 w-4" }),
            description: "Documentation from previous claims (if applicable)",
        },
    ];
    const [documents, setDocuments] = useState(requiredDocuments);
    // Calculate submission progress
    const calculateProgress = () => {
        const requiredDocs = documents.filter((doc) => doc.required);
        const uploadedRequiredDocs = requiredDocs.filter((doc) => doc.uploaded);
        const progress = Math.round((uploadedRequiredDocs.length / requiredDocs.length) * 100);
        setSubmissionProgress(progress);
        return progress;
    };
    // Handle document upload
    const handleDocumentUpload = (documentId) => {
        // Create a file input element
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png";
        // Handle file selection
        fileInput.onchange = (e) => {
            const target = e.target;
            if (target.files && target.files.length > 0) {
                const file = target.files[0];
                // Check file size (5MB limit)
                if (file.size > 5 * 1024 * 1024) {
                    alert("File size exceeds 5MB limit. Please select a smaller file.");
                    return;
                }
                // Update document status
                const updatedDocuments = documents.map((doc) => {
                    if (doc.id === documentId) {
                        return {
                            ...doc,
                            uploaded: true,
                            file: file,
                            uploadDate: new Date().toISOString(),
                            uploadedBy: "Current User", // In a real app, get from auth context
                            fileSize: file.size,
                            fileType: file.type,
                        };
                    }
                    return doc;
                });
                setDocuments(updatedDocuments);
                calculateProgress();
                // In a real implementation, upload to server
                if (!isOffline) {
                    // Simulate uploading to server
                    const formData = new FormData();
                    formData.append("file", file);
                    formData.append("documentId", documentId);
                    formData.append("patientId", patientId);
                    formData.append("episodeId", episodeId);
                    // Example of how the actual API call would look:
                    // try {
                    //   await ApiService.post(
                    //     `${SERVICE_ENDPOINTS.clinical}/documents/upload`,
                    //     formData,
                    //     { headers: { 'Content-Type': 'multipart/form-data' } }
                    //   );
                    // } catch (error) {
                    //   console.error('Error uploading document:', error);
                    //   alert('Error uploading document. Please try again.');
                    // }
                }
            }
        };
        // Trigger file selection dialog
        fileInput.click();
    };
    // Add a new service line
    const handleAddServiceLine = () => {
        const newServiceLine = {
            id: `sl-${Date.now()}`,
            serviceCode: "",
            serviceDescription: "",
            quantity: 0,
            unitPrice: 0,
            totalAmount: 0,
            dateOfService: "",
            providerId: "",
            providerName: "",
            authorizationReference: authorizationId,
        };
        setServiceLines([...serviceLines, newServiceLine]);
    };
    // Update a service line
    const handleUpdateServiceLine = (id, field, value) => {
        const updatedServiceLines = serviceLines.map((line) => {
            if (line.id === id) {
                const updatedLine = { ...line, [field]: value };
                // Recalculate total if quantity or unit price changes
                if (field === "quantity" || field === "unitPrice") {
                    updatedLine.totalAmount =
                        updatedLine.quantity * updatedLine.unitPrice;
                }
                return updatedLine;
            }
            return line;
        });
        setServiceLines(updatedServiceLines);
    };
    // Remove a service line
    const handleRemoveServiceLine = (id) => {
        setServiceLines(serviceLines.filter((line) => line.id !== id));
    };
    // Calculate total claim amount
    const calculateTotalClaimAmount = () => {
        return serviceLines.reduce((total, line) => total + line.totalAmount, 0);
    };
    // Handle form submission
    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Check if all required documents are uploaded
            const missingDocs = documents.filter((doc) => doc.required && !doc.uploaded);
            if (missingDocs.length > 0) {
                alert(`Please upload all required documents. Missing: ${missingDocs
                    .map((d) => d.name)
                    .join(", ")}`);
                setIsSubmitting(false);
                return;
            }
            // Validate service lines
            if (serviceLines.length === 0) {
                alert("Please add at least one service line to the claim.");
                setIsSubmitting(false);
                return;
            }
            const invalidServiceLines = serviceLines.filter((line) => !line.serviceCode ||
                !line.serviceDescription ||
                line.quantity <= 0 ||
                line.unitPrice <= 0 ||
                !line.dateOfService ||
                !line.providerId ||
                !line.providerName);
            if (invalidServiceLines.length > 0) {
                alert("Please complete all service line details. Each service line must have a code, description, quantity, price, date, and provider information.");
                setIsSubmitting(false);
                return;
            }
            // Validate provider licenses
            const invalidProviders = validateClaimLicenses();
            if (invalidProviders.length > 0) {
                const confirmSubmit = window.confirm(`Warning: The following providers have license issues:\n\n${invalidProviders.join("\n")}\n\nContinuing may result in claim rejection. Do you want to proceed anyway?`);
                if (!confirmSubmit) {
                    setIsSubmitting(false);
                    return;
                }
            }
            // Validate monthly service documentation
            const serviceDates = serviceLines
                .map((line) => {
                // Extract date range from format like "2024-01-20 to 2024-02-19"
                const dateRange = line.dateOfService.split(" to ");
                if (dateRange.length === 2) {
                    const startDate = new Date(dateRange[0]);
                    const endDate = new Date(dateRange[1]);
                    return { startDate, endDate, line };
                }
                return null;
            })
                .filter(Boolean);
            // Check if all services in the date range have documentation
            const missingDocumentation = [];
            serviceDates.forEach((dateInfo) => {
                if (!dateInfo)
                    return;
                const { startDate, endDate, line } = dateInfo;
                let currentDate = new Date(startDate);
                while (currentDate <= endDate) {
                    const day = currentDate.getDate();
                    const month = currentDate.getMonth();
                    const year = currentDate.getFullYear();
                    // Find service record for this day
                    const serviceRecord = monthlyServices.find((s) => s.day === day &&
                        s.serviceProvided &&
                        s.providerId === line.providerId);
                    if (!serviceRecord || !serviceRecord.documentationComplete) {
                        missingDocumentation.push(`${currentDate.toLocaleDateString()} - ${line.providerName}`);
                    }
                    // Move to next day
                    currentDate.setDate(currentDate.getDate() + 1);
                }
            });
            if (missingDocumentation.length > 0) {
                // Only show first 5 missing dates to avoid overwhelming the user
                const displayMissing = missingDocumentation.slice(0, 5);
                const remainingCount = missingDocumentation.length - 5;
                const confirmSubmit = window.confirm(`Warning: Missing documentation for the following dates:\n\n${displayMissing.join("\n")}${remainingCount > 0 ? `\n...and ${remainingCount} more dates` : ""}\n\nContinuing may result in claim rejection. Do you want to proceed anyway?`);
                if (!confirmSubmit) {
                    setIsSubmitting(false);
                    return;
                }
            }
            // Prepare submission data
            const submissionData = {
                patientId,
                episodeId,
                authorizationId,
                documents: documents.filter((d) => d.uploaded).map((d) => d.id),
                submissionDate: new Date().toISOString(),
                claimType: form.getValues("claimType"),
                billingPeriod: form.getValues("billingPeriod"),
                claimNotes: form.getValues("claimNotes") || "",
                serviceLines,
                totalAmount: calculateTotalClaimAmount(),
                submittedBy: localStorage.getItem("user_id") || "unknown",
                facilityDetails: {
                    name: "Reyada Homecare",
                    licenseNumber: "DOH-HC-2023-001",
                    address: "Abu Dhabi, UAE",
                },
                patientDetails: patientDetails,
                authorizationDetails: authorizationDetails,
                documentMetadata: documents
                    .filter((d) => d.uploaded)
                    .map((d) => ({
                    id: d.id,
                    name: d.name,
                    uploadDate: d.uploadDate,
                    uploadedBy: d.uploadedBy,
                    fileType: d.fileType,
                    verificationStatus: "verified",
                })),
                submissionMetadata: {
                    submissionVersion: "1.0",
                    platform: "Reyada Homecare Platform",
                    deviceId: localStorage.getItem("device_id") || "unknown",
                    submissionTimestamp: new Date().toISOString(),
                    dohComplianceVersion: "DOH-2023-R4",
                    damanPortalVersion: "Daman-Claims-v2",
                },
            };
            if (isOffline) {
                // Store submission for later sync
                try {
                    // Generate offline reference number
                    const claimNumber = `OFFLINE-${Math.random()
                        .toString(36)
                        .substring(2, 10)
                        .toUpperCase()}`;
                    // Add to offline queue
                    // In a real implementation, this would use the actual offline service
                    // await offlineService.addToQueue({
                    //   url: `${SERVICE_ENDPOINTS.claims}/submit`,
                    //   method: "post",
                    //   data: {
                    //     ...submissionData,
                    //     status: "pending",
                    //     claimNumber,
                    //   },
                    //   headers: { "Content-Type": "application/json" },
                    //   timestamp: new Date().toISOString(),
                    // });
                    // Mock offline queue for demonstration
                    console.log("Storing claim in offline queue:", {
                        ...submissionData,
                        status: "pending",
                        claimNumber,
                    });
                    // Add to local claim history
                    const newClaim = {
                        id: `offline-${Date.now()}`,
                        claimNumber,
                        submissionDate: new Date().toLocaleDateString(),
                        status: "pending",
                        amount: calculateTotalClaimAmount(),
                        comments: "Pending online synchronization",
                    };
                    setClaimHistory((prev) => [newClaim, ...prev]);
                    setSubmissionSuccess(true);
                    if (onComplete)
                        onComplete(true);
                    // Show success message
                    alert("Claim saved for later sync when online connection is restored.\n\n" +
                        "Claim Number: " +
                        claimNumber +
                        "\n" +
                        "Please note this claim number for tracking purposes.");
                }
                catch (offlineError) {
                    console.error("Error saving offline claim:", offlineError);
                    alert("Error saving claim for offline sync. Please try again.");
                    setIsSubmitting(false);
                }
            }
            else {
                // Submit to Daman portal via API
                try {
                    // In a real implementation, this would call the actual API
                    // const response = await ApiService.post(
                    //   `${SERVICE_ENDPOINTS.claims}/submit`,
                    //   submissionData
                    // );
                    // Mock API response for demonstration
                    const response = {
                        id: `claim-${Date.now()}`,
                        claimNumber: `DAMAN-CL-${new Date().getFullYear()}-${Math.floor(Math.random() * 100000)}`,
                        status: "in-review",
                        message: "Claim received and under initial review",
                        reviewer: "Daman Claims Department",
                        submissionDate: new Date().toISOString(),
                        estimatedProcessingCompletion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
                        amount: calculateTotalClaimAmount(),
                    };
                    // Add to claim history
                    const newClaim = {
                        id: response.id,
                        claimNumber: response.claimNumber,
                        submissionDate: new Date().toLocaleDateString(),
                        status: "in-review",
                        amount: response.amount,
                        comments: response.message || "Claim received and under initial review",
                        reviewer: response.reviewer || "Daman Claims Department",
                    };
                    setClaimHistory((prev) => [newClaim, ...prev]);
                    setSubmissionSuccess(true);
                    if (onComplete)
                        onComplete(true);
                    // Show success message with more details
                    alert("Claim successfully submitted to Daman.\n\n" +
                        "Claim Number: " +
                        response.claimNumber +
                        "\n" +
                        "Status: In Review\n" +
                        "Estimated Processing Completion: " +
                        new Date(response.estimatedProcessingCompletion).toLocaleDateString() +
                        "\n\n" +
                        "Total Claim Amount: AED " +
                        response.amount.toFixed(2));
                }
                catch (apiError) {
                    console.error("Error submitting claim:", apiError);
                    alert(`Error submitting claim: ${apiError.message || "Unknown error"}`);
                    setIsSubmitting(false);
                }
            }
        }
        catch (error) {
            console.error("Error submitting claim:", error);
            alert(`Error: ${error.message || "An unexpected error occurred. Please try again."}`);
            if (onComplete)
                onComplete(false);
            setIsSubmitting(false);
        }
    };
    // Reset the form
    const handleReset = () => {
        // Reset document status
        setDocuments(requiredDocuments);
        setSubmissionProgress(0);
        setSubmissionSuccess(false);
        // Reset form values
        form.reset({
            claimType: "initial",
            billingPeriod: "current-month",
            claimNotes: "",
            includeAllServices: true,
        });
        // Reset service lines to default
        setServiceLines([
            {
                id: "sl-001",
                serviceCode: "HN001",
                serviceDescription: "Home Nursing Visit - Standard",
                quantity: 30,
                unitPrice: 250,
                totalAmount: 7500,
                dateOfService: "2024-01-20 to 2024-02-19",
                providerId: "N12345",
                providerName: "Nurse Sarah Ahmed",
                authorizationReference: authorizationId,
            },
            {
                id: "sl-002",
                serviceCode: "PT001",
                serviceDescription: "Physical Therapy Session - Standard",
                quantity: 12,
                unitPrice: 300,
                totalAmount: 3600,
                dateOfService: "2024-01-22 to 2024-02-17",
                providerId: "PT6789",
                providerName: "Therapist Ali Hassan",
                authorizationReference: authorizationId,
            },
        ]);
        // Release any object URLs to prevent memory leaks
        documents.forEach((doc) => {
            if (doc.file && doc.uploaded) {
                URL.revokeObjectURL(URL.createObjectURL(doc.file));
            }
        });
    };
    // Function to get status badge variant based on claim status
    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case "paid":
                return "success";
            case "rejected":
                return "destructive";
            case "partial":
                return "warning";
            case "returned":
                return "warning";
            case "in-review":
                return "secondary";
            case "pending":
                return "outline";
            default:
                return "outline";
        }
    };
    // Function to get status icon based on claim status
    const getStatusIcon = (status) => {
        switch (status) {
            case "paid":
                return _jsx(Banknote, { className: "h-4 w-4 text-green-500" });
            case "rejected":
                return _jsx(FileX, { className: "h-4 w-4 text-red-500" });
            case "partial":
                return _jsx(Percent, { className: "h-4 w-4 text-amber-500" });
            case "returned":
                return _jsx(FileQuestion, { className: "h-4 w-4 text-amber-500" });
            case "in-review":
                return _jsx(FileSearch, { className: "h-4 w-4 text-blue-500" });
            case "pending":
                return _jsx(Clock, { className: "h-4 w-4 text-gray-500" });
            default:
                return _jsx(FileText, { className: "h-4 w-4" });
        }
    };
    // Load revenue metrics
    const loadRevenueMetrics = async () => {
        try {
            if (!isOffline) {
                // In a real implementation, this would call the actual API
                // const metrics = await ApiService.getRevenueAnalytics();
                // setRevenueMetrics(metrics);
                // For now, we'll use the mock data
                setRevenueMetrics(mockRevenueMetrics);
            }
        }
        catch (error) {
            console.error("Error loading revenue metrics:", error);
        }
    };
    // Load payment records
    const loadPaymentRecords = async () => {
        try {
            if (!isOffline) {
                // In a real implementation, this would call the actual API
                // const payments = await ApiService.getPaymentHistory();
                // setPaymentRecords(payments);
                // For now, we'll use the mock data
                setPaymentRecords(mockPaymentRecords);
            }
        }
        catch (error) {
            console.error("Error loading payment records:", error);
        }
    };
    // Load denial records
    const loadDenialRecords = async () => {
        try {
            if (!isOffline) {
                // In a real implementation, this would call the actual API
                // const denials = await ApiService.getDenialHistory();
                // setDenialRecords(denials);
                // For now, we'll use the mock data
                setDenialRecords(mockDenialRecords);
            }
        }
        catch (error) {
            console.error("Error loading denial records:", error);
        }
    };
    // Helper functions for monthly service tracking
    const getDaysInMonth = (month, year) => {
        return new Date(year, month + 1, 0).getDate();
    };
    const isToday = (day, month, year) => {
        const today = new Date();
        return (day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear());
    };
    // Helper function to check if a license is expiring soon (within 30 days)
    const isLicenseExpiringSoon = (expiryDate) => {
        if (!expiryDate)
            return false;
        const expiry = new Date(expiryDate);
        const today = new Date();
        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 && diffDays <= 30;
    };
    // Helper function to check if a license is valid for claims
    const isLicenseValidForClaims = (license) => {
        if (license.licenseStatus !== "Active" &&
            license.licenseStatus !== "Pending Renewal") {
            return false;
        }
        const expiry = new Date(license.expiryDate);
        const today = new Date();
        return expiry > today;
    };
    // Helper function to get license status color
    const getLicenseStatusColor = (status) => {
        switch (status) {
            case "Active":
                return "success";
            case "Expired":
                return "destructive";
            case "Suspended":
                return "destructive";
            case "Pending Renewal":
                return "warning";
            default:
                return "outline";
        }
    };
    // Helper function to validate claim against licenses
    const validateClaimLicenses = () => {
        // Check if all providers in service lines have valid licenses
        const invalidProviders = [];
        serviceLines.forEach((line) => {
            const providerLicense = clinicianLicenses.find((license) => license.clinicianName === line.providerName ||
                license.employeeId === line.providerId);
            if (!providerLicense) {
                invalidProviders.push(`${line.providerName} (No license record found)`);
            }
            else if (!isLicenseValidForClaims(providerLicense)) {
                invalidProviders.push(`${line.providerName} (${providerLicense.licenseStatus} license)`);
            }
        });
        return invalidProviders;
    };
    // Generate mock monthly service data
    const generateMockMonthlyData = (month, year) => {
        const daysInMonth = getDaysInMonth(month, year);
        const mockData = [];
        // Generate data for each day
        for (let day = 1; day <= daysInMonth; day++) {
            // Include all days for comprehensive tracking
            const date = new Date(year, month, day);
            const dayOfWeek = date.getDay(); // 0 is Sunday, 6 is Saturday
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            // For past days, mark as service provided and documentation complete
            const today = new Date();
            const isPastDay = date < new Date(today.setHours(0, 0, 0, 0));
            if (isPastDay) {
                // For weekends, less likely to have service
                const hasService = isWeekend
                    ? Math.random() > 0.7
                    : Math.random() > 0.2;
                if (hasService) {
                    // Randomly assign service types with realistic distribution
                    const rand = Math.random();
                    const serviceType = rand > 0.6
                        ? "nursing"
                        : rand > 0.3
                            ? "physiotherapy"
                            : rand > 0.15
                                ? "occupational"
                                : "speech";
                    // Match provider to service type
                    let providerId, providerName;
                    switch (serviceType) {
                        case "nursing":
                            providerId = "N12345";
                            providerName = "Sarah Ahmed";
                            break;
                        case "physiotherapy":
                            providerId = "PT6789";
                            providerName = "Ali Hassan";
                            break;
                        case "occupational":
                            providerId = "OT4567";
                            providerName = "Fatima Al Zaabi";
                            break;
                        case "speech":
                            providerId = "ST8901";
                            providerName = "Khalid Rahman";
                            break;
                        default:
                            providerId = "N12345";
                            providerName = "Sarah Ahmed";
                    }
                    // Documentation is less likely to be complete for recent services
                    const daysSinceService = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
                    const docCompleteProb = Math.min(0.95, 0.7 + daysSinceService * 0.05); // Higher probability the older the service
                    const documentationComplete = Math.random() < docCompleteProb;
                    mockData.push({
                        day,
                        serviceProvided: true,
                        serviceType,
                        providerId,
                        providerName,
                        documentationComplete,
                        documentationId: documentationComplete
                            ? `DOC-${day}-${month + 1}-${year}`
                            : undefined,
                        notes: documentationComplete
                            ? undefined
                            : "Documentation pending completion",
                    });
                }
                else {
                    // No service provided but still track the day
                    mockData.push({
                        day,
                        serviceProvided: false,
                        documentationComplete: false,
                        notes: isWeekend
                            ? "Weekend - No scheduled service"
                            : "No service provided",
                    });
                }
            }
        }
        setMonthlyServices(mockData);
    };
    // Generate mock clinician licenses
    const generateMockLicenses = () => {
        const mockLicenses = [
            {
                id: "license-1",
                clinicianName: "Sarah Ahmed",
                employeeId: "EMP-001",
                role: "Nurse",
                department: "Nursing",
                licenseNumber: "DOH-N-2023-12345",
                licenseType: "DOH",
                issuingAuthority: "Department of Health Abu Dhabi",
                issueDate: "2023-01-15",
                expiryDate: "2025-01-14",
                licenseStatus: "Active",
                renewalInitiated: false,
                renewalCompleted: false,
                continuingEducationCompleted: true,
                continuingEducationHours: 30,
                complianceStatus: "Compliant",
                currentlyActiveForClaims: true,
                lastUsedForClaim: "2024-02-15",
                totalClaimsAssociated: 45,
            },
            {
                id: "license-2",
                clinicianName: "Ali Hassan",
                employeeId: "EMP-002",
                role: "PT",
                department: "Therapy",
                licenseNumber: "DOH-PT-2022-67890",
                licenseType: "DOH",
                issuingAuthority: "Department of Health Abu Dhabi",
                issueDate: "2022-03-10",
                expiryDate: "2024-03-09",
                licenseStatus: "Pending Renewal",
                renewalNotificationDate: "2024-02-08",
                renewalInitiated: true,
                renewalCompleted: false,
                continuingEducationCompleted: true,
                continuingEducationHours: 40,
                complianceStatus: "Compliant",
                currentlyActiveForClaims: true,
                lastUsedForClaim: "2024-02-17",
                totalClaimsAssociated: 32,
            },
            {
                id: "license-3",
                clinicianName: "Dr. Mohammed Al Mansoori",
                employeeId: "EMP-003",
                role: "Physician",
                department: "Medical",
                licenseNumber: "DOH-MD-2021-54321",
                licenseType: "DOH",
                issuingAuthority: "Department of Health Abu Dhabi",
                issueDate: "2021-05-20",
                expiryDate: "2024-05-19",
                licenseStatus: "Active",
                renewalInitiated: false,
                renewalCompleted: false,
                continuingEducationCompleted: false,
                complianceStatus: "Non-Compliant",
                currentlyActiveForClaims: true,
                lastUsedForClaim: "2024-01-30",
                totalClaimsAssociated: 18,
            },
            {
                id: "license-4",
                clinicianName: "Fatima Al Zaabi",
                employeeId: "EMP-004",
                role: "OT",
                department: "Therapy",
                licenseNumber: "DOH-OT-2022-13579",
                licenseType: "DOH",
                issuingAuthority: "Department of Health Abu Dhabi",
                issueDate: "2022-09-15",
                expiryDate: "2023-09-14",
                licenseStatus: "Expired",
                renewalInitiated: false,
                renewalCompleted: false,
                continuingEducationCompleted: true,
                continuingEducationHours: 25,
                complianceStatus: "Non-Compliant",
                currentlyActiveForClaims: false,
                lastUsedForClaim: "2023-09-10",
                totalClaimsAssociated: 27,
            },
            {
                id: "license-5",
                clinicianName: "Khalid Rahman",
                employeeId: "EMP-005",
                role: "ST",
                department: "Therapy",
                licenseNumber: "DOH-ST-2023-24680",
                licenseType: "DOH",
                issuingAuthority: "Department of Health Abu Dhabi",
                issueDate: "2023-04-01",
                expiryDate: "2024-03-31",
                licenseStatus: "Pending Renewal",
                renewalNotificationDate: "2024-02-29",
                renewalInitiated: true,
                renewalCompleted: false,
                continuingEducationCompleted: true,
                continuingEducationHours: 35,
                complianceStatus: "Compliant",
                currentlyActiveForClaims: true,
                lastUsedForClaim: "2024-02-20",
                totalClaimsAssociated: 19,
            },
            {
                id: "license-6",
                clinicianName: "Aisha Al Hashimi",
                employeeId: "EMP-006",
                role: "Nurse",
                department: "Nursing",
                licenseNumber: "DOH-N-2022-98765",
                licenseType: "DOH",
                issuingAuthority: "Department of Health Abu Dhabi",
                issueDate: "2022-07-15",
                expiryDate: "2024-07-14",
                licenseStatus: "Active",
                renewalInitiated: false,
                renewalCompleted: false,
                continuingEducationCompleted: true,
                continuingEducationHours: 28,
                complianceStatus: "Compliant",
                currentlyActiveForClaims: true,
                lastUsedForClaim: "2024-02-22",
                totalClaimsAssociated: 37,
            },
            {
                id: "license-7",
                clinicianName: "Dr. Layla Al Suwaidi",
                employeeId: "EMP-007",
                role: "Physician",
                department: "Medical",
                licenseNumber: "DOH-MD-2021-11223",
                licenseType: "DOH",
                issuingAuthority: "Department of Health Abu Dhabi",
                issueDate: "2021-11-10",
                expiryDate: "2023-11-09",
                licenseStatus: "Expired",
                renewalInitiated: true,
                renewalCompleted: false,
                continuingEducationCompleted: false,
                complianceStatus: "Non-Compliant",
                currentlyActiveForClaims: false,
                lastUsedForClaim: "2023-11-05",
                totalClaimsAssociated: 22,
            },
        ];
        setClinicianLicenses(mockLicenses);
    };
    // State for claims processing
    const [claimsProcessingData, setClaimsProcessingData] = useState({
        dailyClaimsGenerated: 0,
        pendingValidation: 0,
        readyForSubmission: 0,
        validationIssues: [],
    });
    // Initialize data when component mounts
    useEffect(() => {
        // Generate mock data for the current month
        generateMockMonthlyData(currentMonth, currentYear);
        // Generate mock clinician licenses
        generateMockLicenses();
        // Initialize claims processing data
        setClaimsProcessingData({
            dailyClaimsGenerated: Math.floor(Math.random() * 5) + 3,
            pendingValidation: Math.floor(Math.random() * 3) + 1,
            readyForSubmission: Math.floor(Math.random() * 4) + 2,
            validationIssues: [
                {
                    type: "license",
                    count: 2,
                    description: "Provider license expired or missing",
                },
                {
                    type: "documentation",
                    count: 3,
                    description: "Incomplete service documentation",
                },
                {
                    type: "authorization",
                    count: 1,
                    description: "Service not covered by authorization",
                },
            ],
        });
    }, []);
    // Load data when tab changes
    useEffect(() => {
        if (activeTab === "payment-reconciliation") {
            loadPaymentRecords();
        }
        else if (activeTab === "denial-management") {
            loadDenialRecords();
        }
        else if (activeTab === "revenue-analytics") {
            loadRevenueMetrics();
        }
    }, [activeTab]);
    // Record payment
    const recordPayment = async (claimId, claimNumber) => {
        try {
            setIsSubmitting(true);
            // Get payment details from form
            const paymentAmount = parseFloat(prompt("Enter payment amount:", "0") || "0");
            const paymentReference = prompt("Enter payment reference:", "") || "";
            const paymentMethod = prompt("Enter payment method:", "Bank Transfer") || "Bank Transfer";
            const paymentDate = prompt("Enter payment date (YYYY-MM-DD):", new Date().toISOString().split("T")[0]) || new Date().toISOString().split("T")[0];
            if (paymentAmount <= 0) {
                alert("Payment amount must be greater than zero.");
                setIsSubmitting(false);
                return;
            }
            if (!paymentReference) {
                alert("Payment reference is required.");
                setIsSubmitting(false);
                return;
            }
            // Find the claim to get expected amount
            const claim = claimHistory.find((c) => c.claimNumber === claimNumber);
            if (!claim) {
                alert("Claim not found.");
                setIsSubmitting(false);
                return;
            }
            const expectedAmount = claim.amount;
            const variance = paymentAmount - expectedAmount;
            // Create payment record
            const paymentRecord = {
                id: `pay-${Date.now()}`,
                claimId,
                claimNumber,
                paymentDate,
                paymentAmount,
                paymentMethod,
                paymentReference,
                expectedAmount,
                variance,
                status: variance === 0 ? "reconciled" : "unreconciled",
            };
            if (variance !== 0) {
                const varianceReason = prompt("Enter reason for payment variance:", "");
                paymentRecord.varianceReason = varianceReason || undefined;
            }
            // In a real implementation, this would call the actual API
            // await ApiService.recordPayment(paymentRecord);
            // Update local state
            setPaymentRecords([paymentRecord, ...paymentRecords]);
            // Update claim status
            const updatedClaimHistory = claimHistory.map((c) => {
                if (c.claimNumber === claimNumber) {
                    return {
                        ...c,
                        status: paymentAmount >= expectedAmount ? "paid" : "partial",
                        paidAmount: paymentAmount,
                        paymentDate,
                        paymentReference,
                    };
                }
                return c;
            });
            setClaimHistory(updatedClaimHistory);
            alert(`Payment of AED ${paymentAmount.toFixed(2)} recorded successfully for claim ${claimNumber}.`);
            setIsSubmitting(false);
        }
        catch (error) {
            console.error("Error recording payment:", error);
            alert(`Error recording payment: ${error.message || "Unknown error"}`);
            setIsSubmitting(false);
        }
    };
    // Record denial
    const recordDenial = async (claimId, claimNumber) => {
        try {
            setIsSubmitting(true);
            // Get denial details from form
            const denialReason = prompt("Enter denial reason:", "") || "";
            const denialCode = prompt("Enter denial code:", "") || "";
            const appealDeadline = prompt("Enter appeal deadline (YYYY-MM-DD):", "") || undefined;
            if (!denialReason) {
                alert("Denial reason is required.");
                setIsSubmitting(false);
                return;
            }
            if (!denialCode) {
                alert("Denial code is required.");
                setIsSubmitting(false);
                return;
            }
            // Create denial record
            const denialRecord = {
                id: `den-${Date.now()}`,
                claimId,
                claimNumber,
                denialDate: new Date().toISOString().split("T")[0],
                denialReason,
                denialCode,
                appealStatus: "not_started",
                appealDeadline,
                supportingDocuments: [],
                status: "active",
            };
            // In a real implementation, this would call the actual API
            // await ApiService.recordDenial(denialRecord);
            // Update local state
            setDenialRecords([denialRecord, ...denialRecords]);
            // Update claim status
            const updatedClaimHistory = claimHistory.map((c) => {
                if (c.claimNumber === claimNumber) {
                    return {
                        ...c,
                        status: "rejected",
                        comments: denialReason,
                    };
                }
                return c;
            });
            setClaimHistory(updatedClaimHistory);
            alert(`Denial recorded successfully for claim ${claimNumber}.`);
            setIsSubmitting(false);
        }
        catch (error) {
            console.error("Error recording denial:", error);
            alert(`Error recording denial: ${error.message || "Unknown error"}`);
            setIsSubmitting(false);
        }
    };
    // Submit appeal
    const submitAppeal = async (denialId) => {
        try {
            setIsSubmitting(true);
            // Find the denial record
            const denialRecord = denialRecords.find((d) => d.id === denialId);
            if (!denialRecord) {
                alert("Denial record not found.");
                setIsSubmitting(false);
                return;
            }
            // Get appeal details from form
            const appealNotes = prompt("Enter appeal notes:", "") || "";
            const supportingDocs = prompt("Enter supporting documents (comma-separated):", "") || "";
            if (!appealNotes) {
                alert("Appeal notes are required.");
                setIsSubmitting(false);
                return;
            }
            // Update denial record
            const updatedDenialRecord = {
                ...denialRecord,
                appealStatus: "submitted",
                appealSubmissionDate: new Date().toISOString().split("T")[0],
                supportingDocuments: supportingDocs.split(",").map((doc) => doc.trim()),
                notes: appealNotes,
            };
            // In a real implementation, this would call the actual API
            // await ApiService.submitAppeal({
            //   denialId,
            //   appealNotes,
            //   supportingDocuments: updatedDenialRecord.supportingDocuments,
            //   submissionDate: updatedDenialRecord.appealSubmissionDate
            // });
            // Update local state
            const updatedDenialRecords = denialRecords.map((d) => {
                if (d.id === denialId) {
                    return updatedDenialRecord;
                }
                return d;
            });
            setDenialRecords(updatedDenialRecords);
            alert(`Appeal submitted successfully for denial ${denialId}.`);
            setIsSubmitting(false);
        }
        catch (error) {
            console.error("Error submitting appeal:", error);
            alert(`Error submitting appeal: ${error.message || "Unknown error"}`);
            setIsSubmitting(false);
        }
    };
    // Track claim status
    const trackClaim = async (claimNumber) => {
        try {
            setIsSubmitting(true);
            // Check if this is an offline claim
            if (claimNumber.startsWith("OFFLINE-")) {
                // Find the claim in local history
                const claim = claimHistory.find((c) => c.claimNumber === claimNumber);
                if (claim) {
                    // Update UI to show tracking information
                    setActiveTab("claim-tracking");
                    setIsSubmitting(false);
                }
                else {
                    alert(`Claim with number ${claimNumber} not found.`);
                    setIsSubmitting(false);
                }
                return;
            }
            // For online claims, get real-time status from API
            try {
                // In a real implementation, this would call the actual API
                // const statusResponse = await ApiService.get(
                //   `${SERVICE_ENDPOINTS.claims}/status/${claimNumber}`
                // );
                // Mock API response for demonstration
                const statusResponse = {
                    id: `claim-${Date.now()}`,
                    claimNumber,
                    status: Math.random() > 0.5 ? "in-review" : "returned",
                    comments: Math.random() > 0.5
                        ? "Under financial review by claims department"
                        : "Returned for missing service logs. Please resubmit with complete documentation.",
                    reviewer: "Daman Claims Department",
                    reviewDate: new Date().toISOString(),
                    submissionDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
                    amount: 11100,
                    processingTimeline: [
                        {
                            timestamp: new Date(Date.now() - 86400000).toISOString(),
                            action: "Claim Received",
                            comment: "Claim request received and queued for review",
                        },
                        {
                            timestamp: new Date(Date.now() - 43200000).toISOString(),
                            action: "Initial Verification",
                            comment: "Document verification completed",
                        },
                        {
                            timestamp: new Date().toISOString(),
                            action: "Financial Review",
                            comment: "Under review by financial team",
                        },
                    ],
                    estimatedCompletionDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
                    trackingDetails: {
                        claimId: `CL-${Math.floor(Math.random() * 100000)}`,
                        receivedBy: "Daman Claims Processing Center",
                        processingStage: "Financial Review",
                        assignedReviewer: "Claims Processing Team",
                        priorityLevel: "Standard",
                        estimatedDecisionDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
                        lastUpdated: new Date().toISOString(),
                        documentVerificationStatus: "Complete",
                        financialReviewStatus: "In Progress",
                        paymentStatus: "Pending",
                        appealEligible: false,
                        trackingUrl: `https://provider.damanhealth.ae/claims/tracking/${claimNumber}`,
                    },
                };
                // Find the claim in history
                const existingClaimIndex = claimHistory.findIndex((c) => c.claimNumber === claimNumber);
                if (existingClaimIndex >= 0) {
                    // Update the claim with latest status
                    const updatedHistory = [...claimHistory];
                    updatedHistory[existingClaimIndex] = {
                        ...updatedHistory[existingClaimIndex],
                        status: statusResponse.status,
                        comments: statusResponse.comments ||
                            updatedHistory[existingClaimIndex].comments,
                        reviewer: statusResponse.reviewer ||
                            updatedHistory[existingClaimIndex].reviewer,
                        reviewDate: statusResponse.reviewDate ||
                            updatedHistory[existingClaimIndex].reviewDate,
                    };
                    setClaimHistory(updatedHistory);
                    setActiveTab("claim-tracking");
                    // Display detailed tracking information
                    if (statusResponse.trackingDetails) {
                        const trackingInfo = statusResponse.trackingDetails;
                        console.log("Detailed tracking information:", trackingInfo);
                        // In a real implementation, this would update a tracking details panel in the UI
                        // For now, we'll just show an alert with key tracking information
                        setTimeout(() => {
                            alert(`Tracking Information for ${claimNumber}:\n\n` +
                                `Processing Stage: ${trackingInfo.processingStage}\n` +
                                `Assigned Reviewer: ${trackingInfo.assignedReviewer}\n` +
                                `Priority Level: ${trackingInfo.priorityLevel}\n` +
                                `Estimated Decision Date: ${new Date(trackingInfo.estimatedDecisionDate).toLocaleDateString()}\n` +
                                `Document Verification: ${trackingInfo.documentVerificationStatus}\n` +
                                `Financial Review: ${trackingInfo.financialReviewStatus}\n` +
                                `Payment Status: ${trackingInfo.paymentStatus}\n\n` +
                                `For real-time updates, you can visit: ${trackingInfo.trackingUrl}`);
                        }, 500);
                    }
                }
                else {
                    // If not found in history, add it
                    const newClaim = {
                        id: statusResponse.id,
                        claimNumber,
                        submissionDate: statusResponse.submissionDate || new Date().toLocaleDateString(),
                        status: statusResponse.status,
                        amount: statusResponse.amount,
                        comments: statusResponse.comments || "Status retrieved from Daman portal",
                        reviewer: statusResponse.reviewer || "Not assigned",
                        reviewDate: statusResponse.reviewDate,
                    };
                    setClaimHistory((prev) => [newClaim, ...prev]);
                    setActiveTab("claim-tracking");
                }
            }
            catch (apiError) {
                console.error(`Error fetching status for ${claimNumber}:`, apiError);
                alert(`Error tracking claim: ${apiError.message || "Unknown error"}`);
            }
            setIsSubmitting(false);
        }
        catch (error) {
            console.error("Error tracking claim:", error);
            alert(`Error tracking claim ${claimNumber}: ${error.message || "Please try again."}`);
            setIsSubmitting(false);
        }
    };
    return (_jsx("div", { className: "w-full bg-background", children: submissionSuccess ? (_jsxs(Card, { className: "w-full", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "text-xl text-center text-green-600", children: [_jsx(CheckCircle, { className: "h-12 w-12 mx-auto mb-2" }), "Claim Submission Complete"] }), _jsxs(CardDescription, { className: "text-center", children: ["Your claim has been successfully", " ", isOffline ? "saved for later submission" : "submitted to Daman"] })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "bg-muted p-4 rounded-md", children: [_jsx("p", { className: "font-medium", children: "Claim Reference:" }), _jsxs("p", { className: "text-sm", children: [isOffline ? "OFFLINE-" : "", "REF-", Math.random().toString(36).substring(2, 10).toUpperCase()] }), _jsx("p", { className: "font-medium mt-2", children: "Submission Date:" }), _jsx("p", { className: "text-sm", children: new Date().toLocaleDateString() }), _jsx("p", { className: "font-medium mt-2", children: "Total Claim Amount:" }), _jsxs("p", { className: "text-sm", children: ["AED ", calculateTotalClaimAmount().toFixed(2)] })] }), _jsx("div", { className: "text-center", children: _jsx("p", { className: "text-sm text-muted-foreground", children: isOffline
                                    ? "This claim will be processed when your device reconnects to the internet."
                                    : "You will receive a notification when Daman processes this claim." }) })] }), _jsx(CardFooter, { className: "flex justify-center", children: _jsx(Button, { onClick: handleReset, children: "Submit Another Claim" }) })] })) : (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col md:flex-row gap-4 md:items-center md:justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold", children: "Claims Submission" }), _jsx("p", { className: "text-muted-foreground", children: "Prepare and submit claims to Daman insurance" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: isOffline ? "destructive" : "outline", className: "text-xs", children: isOffline ? "Offline Mode" : "Online" }), _jsxs(Badge, { variant: "outline", className: "text-xs", children: ["Patient ID: ", patientId] }), _jsxs(Badge, { variant: "outline", className: "text-xs", children: ["Episode: ", episodeId] }), _jsxs(Badge, { variant: "outline", className: "text-xs", children: ["Auth: ", authorizationId] })] })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-9", children: [_jsxs(TabsTrigger, { value: "claim-assembly", children: [_jsx(FileText, { className: "h-4 w-4 mr-2" }), "Claim Assembly"] }), _jsxs(TabsTrigger, { value: "claim-tracking", children: [_jsx(FileSearch, { className: "h-4 w-4 mr-2" }), "Claim Tracking"] }), _jsxs(TabsTrigger, { value: "claim-history", children: [_jsx(History, { className: "h-4 w-4 mr-2" }), "Claim History"] }), _jsxs(TabsTrigger, { value: "daily-claims", children: [_jsx(FileBarChart, { className: "h-4 w-4 mr-2" }), "Daily Claims"] }), _jsxs(TabsTrigger, { value: "monthly-service-tracking", children: [_jsx(CalendarDays, { className: "h-4 w-4 mr-2" }), "Monthly Services"] }), _jsxs(TabsTrigger, { value: "clinician-licenses", children: [_jsx(BadgeCheck, { className: "h-4 w-4 mr-2" }), "Clinician Licenses"] }), _jsxs(TabsTrigger, { value: "payment-reconciliation", children: [_jsx(DollarSign, { className: "h-4 w-4 mr-2" }), "Payment Reconciliation"] }), _jsxs(TabsTrigger, { value: "denial-management", children: [_jsx(FileX, { className: "h-4 w-4 mr-2" }), "Denial Management"] }), _jsxs(TabsTrigger, { value: "claims-audit", children: [_jsx(ClipboardCheck, { className: "h-4 w-4 mr-2" }), "Claims Audit"] })] }), _jsx(TabsContent, { value: "claim-assembly", className: "mt-4", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs(Card, { className: "lg:col-span-3 mb-6", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Claim Details" }), _jsx(CardDescription, { children: "Provide details for the claim submission" })] }), _jsx(CardContent, { children: _jsx(Form, { ...form, children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsx(FormField, { control: form.control, name: "claimType", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Claim Type" }), _jsxs(Select, { onValueChange: field.onChange, defaultValue: field.value, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select claim type" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "initial", children: "Initial Claim" }), _jsx(SelectItem, { value: "follow-up", children: "Follow-up Claim" }), _jsx(SelectItem, { value: "adjustment", children: "Adjustment Claim" }), _jsx(SelectItem, { value: "final", children: "Final Claim" })] })] }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "billingPeriod", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Billing Period" }), _jsxs(Select, { onValueChange: field.onChange, defaultValue: field.value, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select billing period" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "current-month", children: "Current Month (Jan 20 - Feb 19, 2024)" }), _jsx(SelectItem, { value: "previous-month", children: "Previous Month (Dec 20 - Jan 19, 2024)" }), _jsx(SelectItem, { value: "custom", children: "Custom Date Range" })] })] }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "includeAllServices", render: ({ field }) => (_jsxs(FormItem, { className: "flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4", children: [_jsx(FormControl, { children: _jsx(Checkbox, { checked: field.value, onCheckedChange: field.onChange }) }), _jsxs("div", { className: "space-y-1 leading-none", children: [_jsx(FormLabel, { children: "Include all authorized services" }), _jsx(FormDescription, { children: "Automatically include all services from the authorization" })] })] })) })] }), _jsx("div", { children: _jsx(FormField, { control: form.control, name: "claimNotes", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Claim Notes" }), _jsx(FormControl, { children: _jsx(Textarea, { placeholder: "Add any notes or special instructions for this claim", className: "min-h-[150px]", ...field }) }), _jsx(FormDescription, { children: "Include any special circumstances, explanations, or additional information relevant to this claim" }), _jsx(FormMessage, {})] })) }) })] }) }) })] }), _jsxs(Card, { className: "lg:col-span-3 mb-6", children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx(CardTitle, { children: "Service Lines" }), _jsx(Button, { variant: "outline", size: "sm", onClick: handleAddServiceLine, children: "Add Service Line" })] }), _jsx(CardDescription, { children: "Add all services provided during the billing period" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [serviceLines.length === 0 ? (_jsx("div", { className: "text-center py-8 text-muted-foreground", children: "No service lines added. Click \"Add Service Line\" to begin." })) : (serviceLines.map((line) => (_jsxs("div", { className: "border rounded-md p-4 space-y-4", children: [_jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("h4", { className: "font-medium", children: ["Service Line:", " ", line.serviceDescription || "New Service"] }), _jsxs(Button, { variant: "ghost", size: "sm", onClick: () => handleRemoveServiceLine(line.id), children: [_jsx(FileX, { className: "h-4 w-4" }), "Remove"] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: `service-code-${line.id}`, children: "Service Code" }), _jsx(Input, { id: `service-code-${line.id}`, value: line.serviceCode, onChange: (e) => handleUpdateServiceLine(line.id, "serviceCode", e.target.value), placeholder: "e.g. HN001" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: `service-desc-${line.id}`, children: "Service Description" }), _jsx(Input, { id: `service-desc-${line.id}`, value: line.serviceDescription, onChange: (e) => handleUpdateServiceLine(line.id, "serviceDescription", e.target.value), placeholder: "e.g. Home Nursing Visit" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: `date-of-service-${line.id}`, children: "Date of Service" }), _jsx(Input, { id: `date-of-service-${line.id}`, value: line.dateOfService, onChange: (e) => handleUpdateServiceLine(line.id, "dateOfService", e.target.value), placeholder: "e.g. Jan 20 - Feb 19, 2024" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: `quantity-${line.id}`, children: "Quantity" }), _jsx(Input, { id: `quantity-${line.id}`, type: "number", value: line.quantity, onChange: (e) => handleUpdateServiceLine(line.id, "quantity", parseInt(e.target.value) || 0), min: "0" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: `unit-price-${line.id}`, children: "Unit Price (AED)" }), _jsx(Input, { id: `unit-price-${line.id}`, type: "number", value: line.unitPrice, onChange: (e) => handleUpdateServiceLine(line.id, "unitPrice", parseFloat(e.target.value) || 0), min: "0", step: "0.01" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: `total-amount-${line.id}`, children: "Total Amount (AED)" }), _jsx(Input, { id: `total-amount-${line.id}`, value: line.totalAmount.toFixed(2), readOnly: true, className: "bg-muted" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: `provider-id-${line.id}`, children: "Provider ID" }), _jsx(Input, { id: `provider-id-${line.id}`, value: line.providerId, onChange: (e) => handleUpdateServiceLine(line.id, "providerId", e.target.value), placeholder: "e.g. N12345" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: `provider-name-${line.id}`, children: "Provider Name" }), _jsx(Input, { id: `provider-name-${line.id}`, value: line.providerName, onChange: (e) => handleUpdateServiceLine(line.id, "providerName", e.target.value), placeholder: "e.g. Nurse Sarah Ahmed" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: `auth-ref-${line.id}`, children: "Authorization Reference" }), _jsx(Input, { id: `auth-ref-${line.id}`, value: line.authorizationReference || "", onChange: (e) => handleUpdateServiceLine(line.id, "authorizationReference", e.target.value), placeholder: "e.g. AUTH-12345" })] })] })] }, line.id)))), serviceLines.length > 0 && (_jsx("div", { className: "bg-muted p-4 rounded-md mt-4", children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "font-medium", children: "Total Claim Amount:" }), _jsxs("span", { className: "font-bold text-lg", children: ["AED ", calculateTotalClaimAmount().toFixed(2)] })] }) }))] }) })] }), _jsxs(Card, { className: "lg:col-span-2", children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx(CardTitle, { children: "Document Assembly" }), _jsxs(Badge, { variant: "outline", children: [submissionProgress, "% Complete"] })] }), _jsx(CardDescription, { children: "Upload all required documents for claim submission" })] }), _jsx(CardContent, { children: _jsx(ScrollArea, { className: "h-[500px] pr-4", children: _jsx("div", { className: "space-y-6", children: documents.map((doc) => (_jsxs("div", { className: "border rounded-md p-4", children: [_jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "bg-muted p-2 rounded-md", children: doc.icon }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: doc.name }), _jsx("p", { className: "text-xs text-muted-foreground", children: doc.description })] })] }), _jsx(Badge, { variant: doc.required ? "default" : "outline", className: "text-xs", children: doc.required ? "Required" : "Optional" })] }), _jsxs("div", { className: "mt-4 flex flex-col space-y-2", children: [doc.uploaded ? (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center text-green-600 text-sm", children: [_jsx(CheckCircle, { className: "h-4 w-4 mr-1" }), "Document uploaded"] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => {
                                                                                                // In a real implementation, this would preview the document
                                                                                                if (doc.file) {
                                                                                                    const url = URL.createObjectURL(doc.file);
                                                                                                    window.open(url, "_blank");
                                                                                                }
                                                                                                else {
                                                                                                    alert("Preview not available for this document");
                                                                                                }
                                                                                            }, children: "Preview" }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => handleDocumentUpload(doc.id), children: "Replace" })] })] })) : (_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "text-sm text-muted-foreground", children: doc.required
                                                                                        ? "Required document"
                                                                                        : "Optional document" }), _jsxs(Button, { variant: "default", size: "sm", onClick: () => handleDocumentUpload(doc.id), children: [_jsx(Upload, { className: "h-4 w-4 mr-1" }), "Upload"] })] })), doc.uploaded && doc.file && (_jsxs("div", { className: "bg-muted rounded p-2 text-xs", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "font-medium", children: doc.file.name }), _jsxs("span", { children: [(doc.fileSize / 1024).toFixed(1), " KB"] })] }), _jsxs("div", { className: "flex justify-between text-muted-foreground mt-1", children: [_jsxs("span", { children: ["Uploaded:", " ", new Date(doc.uploadDate).toLocaleString()] }), _jsxs("span", { children: ["Type: ", doc.fileType] })] })] }))] })] }, doc.id))) }) }) }), _jsxs(CardFooter, { className: "flex justify-between border-t pt-4", children: [_jsx(Button, { variant: "outline", onClick: handleReset, children: "Reset" }), _jsx(Button, { onClick: handleSubmit, disabled: isSubmitting || submissionProgress < 100, children: isSubmitting
                                                            ? "Submitting..."
                                                            : isOffline
                                                                ? "Save for Later"
                                                                : "Submit Claim" })] })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-base", children: "Submission Progress" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "h-2 w-full bg-muted rounded-full overflow-hidden", children: _jsx("div", { className: "h-full bg-primary", style: { width: `${submissionProgress}%` } }) }), _jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [_jsxs("span", { children: [submissionProgress, "% Complete"] }), _jsxs("span", { children: [100 - submissionProgress, "% Remaining"] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(FileText, { className: "h-4 w-4 text-muted-foreground" }), _jsx("span", { className: "text-sm", children: "Required Documents" })] }), _jsxs(Badge, { variant: "outline", className: "text-xs", children: [documents.filter((d) => d.required && d.uploaded).length, "/", documents.filter((d) => d.required).length] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(FileText, { className: "h-4 w-4 text-muted-foreground" }), _jsx("span", { className: "text-sm", children: "Optional Documents" })] }), _jsxs(Badge, { variant: "outline", className: "text-xs", children: [documents.filter((d) => !d.required && d.uploaded).length, "/", documents.filter((d) => !d.required).length] })] })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-base", children: "Authorization Details" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "font-medium", children: "Reference:" }), _jsx("span", { children: authorizationDetails.referenceNumber })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "font-medium", children: "Approval Date:" }), _jsx("span", { children: authorizationDetails.approvalDate })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "font-medium", children: "Effective Date:" }), _jsx("span", { children: authorizationDetails.effectiveDate })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "font-medium", children: "Expiration Date:" }), _jsx("span", { children: authorizationDetails.expirationDate })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "font-medium", children: "Duration:" }), _jsxs("span", { children: [authorizationDetails.approvedDuration, " days"] })] }), _jsx(Separator, { className: "my-2" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium mb-1", children: "Approved Services:" }), _jsx("ul", { className: "list-disc pl-5 space-y-1", children: Object.entries(authorizationDetails.approvedFrequency).map(([service, frequency]) => (_jsxs("li", { children: [service.charAt(0).toUpperCase() +
                                                                                        service.slice(1), ": ", frequency] }, service))) })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-base", children: "Submission Guidelines" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-2 text-sm", children: [_jsx("p", { children: "\u2022 Accepted formats: PDF, DOC, DOCX, JPG, PNG" }), _jsx("p", { children: "\u2022 Maximum file size: 5MB per document" }), _jsx("p", { children: "\u2022 Claims must be submitted within 30 days of service" }), _jsx("p", { children: "\u2022 All service lines must match authorization" }), _jsx("p", { children: "\u2022 Service logs must be signed by both provider and patient" }), _jsx("p", { children: "\u2022 Ensure all documents are clear and legible" }), _jsx("p", { children: "\u2022 Documents must comply with DOH standards" }), _jsx("p", { className: "text-xs text-muted-foreground mt-2", children: "For assistance, contact the Insurance Coding Department at ext. 4567" })] }) })] })] })] }) }), _jsx(TabsContent, { value: "claim-tracking", className: "mt-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Claim Tracking" }), _jsx(CardDescription, { children: "Track the status of your claim submissions" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "tracking-reference", children: "Claim Number" }), _jsxs("div", { className: "flex gap-2 mt-1", children: [_jsx(Input, { id: "tracking-reference", placeholder: "Enter claim number", defaultValue: "DAMAN-CL-2024-00456" }), _jsx(Button, { onClick: () => trackClaim("DAMAN-CL-2024-00456"), children: "Track" })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "tracking-status", children: "Current Status" }), _jsxs("div", { className: "flex items-center gap-2 mt-3", children: [_jsx(FileSearch, { className: "h-5 w-5 text-blue-500" }), _jsx("span", { className: "font-medium", children: "In Review" }), _jsx(Badge, { variant: "secondary", className: "ml-2", children: "Updated 2 hours ago" })] })] })] }), _jsx(Separator, {}), _jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-2", children: "Claim Timeline" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex gap-3", children: [_jsxs("div", { className: "flex flex-col items-center", children: [_jsx("div", { className: "h-6 w-6 rounded-full bg-green-100 flex items-center justify-center", children: _jsx(CheckCircle, { className: "h-4 w-4 text-green-600" }) }), _jsx("div", { className: "w-0.5 h-full bg-muted" })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("p", { className: "font-medium", children: "Claim Received" }), _jsx(Badge, { variant: "outline", className: "text-xs", children: "15 Feb 2024, 09:15" })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Claim request received by Daman" }), _jsxs("div", { className: "mt-2 bg-green-50 p-2 rounded-md text-xs", children: [_jsx("p", { className: "font-medium text-green-700", children: "Processing Details:" }), _jsx("p", { className: "text-green-600", children: "Claim validated and assigned tracking ID: CL-12345. All required documents received." })] })] })] }), _jsxs("div", { className: "flex gap-3", children: [_jsxs("div", { className: "flex flex-col items-center", children: [_jsx("div", { className: "h-6 w-6 rounded-full bg-green-100 flex items-center justify-center", children: _jsx(CheckCircle, { className: "h-4 w-4 text-green-600" }) }), _jsx("div", { className: "w-0.5 h-full bg-muted" })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("p", { className: "font-medium", children: "Initial Verification" }), _jsx(Badge, { variant: "outline", className: "text-xs", children: "15 Feb 2024, 11:30" })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Document verification completed" }), _jsxs("div", { className: "mt-2 bg-green-50 p-2 rounded-md text-xs", children: [_jsx("p", { className: "font-medium text-green-700", children: "Verification Results:" }), _jsx("p", { className: "text-green-600", children: "All required documents verified. Service logs match authorization. Claim passed to financial review team." })] })] })] }), _jsxs("div", { className: "flex gap-3", children: [_jsxs("div", { className: "flex flex-col items-center", children: [_jsx("div", { className: "h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center", children: _jsx(FileSearch, { className: "h-4 w-4 text-blue-600" }) }), _jsx("div", { className: "w-0.5 h-full bg-muted" })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("p", { className: "font-medium", children: "Financial Review" }), _jsx(Badge, { variant: "outline", className: "text-xs", children: "16 Feb 2024, 09:45" })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Under review by Financial Department" }), _jsxs("div", { className: "mt-2 bg-blue-50 p-2 rounded-md text-xs", children: [_jsx("p", { className: "font-medium text-blue-700", children: "Review Notes:" }), _jsx("p", { className: "text-blue-600", children: "Financial assessment in progress. Verifying service rates and quantities against contract terms. Expected completion by EOD." })] })] })] }), _jsxs("div", { className: "flex gap-3", children: [_jsx("div", { className: "flex flex-col items-center", children: _jsx("div", { className: "h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center", children: _jsx(Clock, { className: "h-4 w-4 text-gray-600" }) }) }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("p", { className: "font-medium text-muted-foreground", children: "Payment Processing" }), _jsx(Badge, { variant: "outline", className: "text-xs", children: "Pending" })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Expected by 22 Feb 2024" }), _jsxs("div", { className: "mt-2 bg-gray-50 p-2 rounded-md text-xs", children: [_jsx("p", { className: "font-medium text-gray-700", children: "Next Steps:" }), _jsx("p", { className: "text-gray-600", children: "Financial review \u2192 Payment approval \u2192 Payment processing. Estimated completion within 5-7 business days." })] })] })] })] })] }), _jsx(Separator, {}), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-2", children: "Processing Details" }), _jsxs("div", { className: "bg-white border rounded-md p-4 space-y-3", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Tracking ID:" }), _jsx("span", { className: "text-sm", children: "CL-12345" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Priority Level:" }), _jsx("span", { className: "text-sm", children: "Standard" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Assigned Reviewer:" }), _jsx("span", { className: "text-sm", children: "Claims Processing Team" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Processing Stage:" }), _jsx("span", { className: "text-sm", children: "Financial Review" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Est. Completion:" }), _jsx("span", { className: "text-sm", children: "22 Feb 2024" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Last Updated:" }), _jsx("span", { className: "text-sm", children: "16 Feb 2024, 09:45" })] })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-2", children: "Financial Information" }), _jsx("div", { className: "bg-white border border-gray-200 p-4 rounded-md", children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Total Claim Amount:" }), _jsx("span", { className: "text-sm", children: "AED 11,100.00" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Service Lines:" }), _jsx("span", { className: "text-sm", children: "2" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Expected Payment:" }), _jsx("span", { className: "text-sm", children: "AED 11,100.00" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Payment Status:" }), _jsx("span", { className: "text-sm", children: "Pending" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Expected Payment Date:" }), _jsx("span", { className: "text-sm", children: "22-25 Feb 2024" })] })] }) })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-2", children: "Escalation Options" }), _jsxs("div", { className: "bg-gray-50 border rounded-md p-4", children: [_jsx("p", { className: "text-sm mb-3", children: "If you need to escalate this claim due to urgency or delays:" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Claims Department:" }), _jsx("span", { className: "text-sm", children: "+971-2-614-9555" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Email:" }), _jsx("span", { className: "text-sm", children: "claims.support@damanhealth.ae" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Reference:" }), _jsx("span", { className: "text-sm", children: "DAMAN-CL-2024-00456" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Escalation Criteria:" }), _jsx("span", { className: "text-sm", children: "Payment delay, incorrect processing" })] })] })] })] })] }) }), _jsxs(CardFooter, { className: "flex justify-between border-t pt-4", children: [_jsxs(Button, { variant: "outline", children: [_jsx(FileUp, { className: "h-4 w-4 mr-2" }), "Upload Additional Documents"] }), _jsxs(Button, { children: [_jsx(Send, { className: "h-4 w-4 mr-2" }), "Contact Claims Department"] })] })] }) }), _jsx(TabsContent, { value: "claim-history", className: "mt-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Claim History" }), _jsx(CardDescription, { children: "View and manage your previous claim submissions" })] }), _jsx(CardContent, { children: _jsx(ScrollArea, { className: "h-[500px] pr-4", children: _jsx("div", { className: "space-y-4", children: claimHistory.map((claim) => (_jsxs("div", { className: "border rounded-md p-4", children: [_jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [getStatusIcon(claim.status), _jsx("h3", { className: "font-medium", children: claim.claimNumber }), _jsx(Badge, { variant: getStatusBadgeVariant(claim.status), children: claim.status === "paid"
                                                                                        ? "Paid"
                                                                                        : claim.status === "rejected"
                                                                                            ? "Rejected"
                                                                                            : claim.status === "partial"
                                                                                                ? "Partially Paid"
                                                                                                : claim.status === "returned"
                                                                                                    ? "Returned"
                                                                                                    : claim.status === "in-review"
                                                                                                        ? "In Review"
                                                                                                        : "Pending" })] }), _jsxs("p", { className: "text-sm text-muted-foreground mt-1", children: ["Submitted: ", claim.submissionDate, " | Amount: AED", " ", claim.amount.toFixed(2)] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => trackClaim(claim.claimNumber), children: "View Details" }), _jsx(Button, { size: "sm", onClick: () => trackClaim(claim.claimNumber), children: "Track" })] })] }), _jsxs("div", { className: "mt-3 bg-muted p-3 rounded-md", children: [_jsxs("p", { className: "text-sm", children: [_jsx("span", { className: "font-medium", children: "Status: " }), claim.comments] }), claim.paidAmount && (_jsxs("p", { className: "text-sm mt-1", children: [_jsxs("span", { className: "font-medium", children: ["Payment: AED ", claim.paidAmount.toFixed(2)] }), claim.paymentDate && (_jsxs("span", { className: "ml-2", children: ["on ", claim.paymentDate] })), claim.paymentReference && (_jsxs("span", { className: "ml-2", children: ["(Ref: ", claim.paymentReference, ")"] }))] }))] }), _jsxs("div", { className: "mt-3 flex gap-2", children: [claim.status === "paid" && (_jsxs(Button, { size: "sm", variant: "outline", children: [_jsx(Receipt, { className: "h-4 w-4 mr-1" }), "Download Receipt"] })), claim.status === "rejected" && (_jsxs(Button, { size: "sm", variant: "outline", children: [_jsx(FileUp, { className: "h-4 w-4 mr-1" }), "Resubmit"] })), claim.status === "returned" && (_jsxs(Button, { size: "sm", children: [_jsx(FileUp, { className: "h-4 w-4 mr-1" }), "Upload Additional Info"] })), claim.status === "in-review" && (_jsxs(Button, { size: "sm", variant: "outline", children: [_jsx(FileSearch, { className: "h-4 w-4 mr-1" }), "Track Status"] }))] })] }, claim.id))) }) }) }), _jsxs(CardFooter, { className: "flex justify-between border-t pt-4", children: [_jsxs("div", { className: "text-sm text-muted-foreground", children: ["Showing ", claimHistory.length, " claims from the last 90 days"] }), _jsxs(Button, { variant: "outline", children: [_jsx(BarChart, { className: "h-4 w-4 mr-2" }), "Generate Report"] })] })] }) }), _jsx(TabsContent, { value: "monthly-service-tracking", className: "mt-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: "Monthly Service Tracking" }), _jsx(CardDescription, { children: "Track daily service delivery and documentation compliance" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => {
                                                                const newMonth = currentMonth === 0 ? 11 : currentMonth - 1;
                                                                const newYear = currentMonth === 0 ? currentYear - 1 : currentYear;
                                                                setCurrentMonth(newMonth);
                                                                setCurrentYear(newYear);
                                                                // In a real app, this would load data for the new month
                                                                generateMockMonthlyData(newMonth, newYear);
                                                            }, children: "Previous Month" }), _jsx("div", { className: "font-medium", children: new Date(currentYear, currentMonth).toLocaleString("default", { month: "long", year: "numeric" }) }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => {
                                                                const newMonth = currentMonth === 11 ? 0 : currentMonth + 1;
                                                                const newYear = currentMonth === 11 ? currentYear + 1 : currentYear;
                                                                setCurrentMonth(newMonth);
                                                                setCurrentYear(newYear);
                                                                // In a real app, this would load data for the new month
                                                                generateMockMonthlyData(newMonth, newYear);
                                                            }, children: "Next Month" })] })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full border-collapse", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-muted", children: [_jsx("th", { className: "p-2 text-left", children: "Day" }), _jsx("th", { className: "p-2 text-left", children: "Service Provided" }), _jsx("th", { className: "p-2 text-left", children: "Service Type" }), _jsx("th", { className: "p-2 text-left", children: "Provider" }), _jsx("th", { className: "p-2 text-left", children: "Documentation" }), _jsx("th", { className: "p-2 text-left", children: "Actions" })] }) }), _jsx("tbody", { children: Array.from({
                                                            length: getDaysInMonth(currentMonth, currentYear),
                                                        }).map((_, index) => {
                                                            const day = index + 1;
                                                            const service = monthlyServices.find((s) => s.day === day) || {
                                                                day,
                                                                serviceProvided: false,
                                                                documentationComplete: false,
                                                            };
                                                            return (_jsxs("tr", { className: `border-b ${isToday(day, currentMonth, currentYear) ? "bg-blue-50" : ""}`, children: [_jsx("td", { className: "p-2", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: `font-medium ${isToday(day, currentMonth, currentYear) ? "text-blue-600" : ""}`, children: day }), isToday(day, currentMonth, currentYear) && (_jsx(Badge, { variant: "outline", className: "text-xs", children: "Today" }))] }) }), _jsx("td", { className: "p-2", children: _jsx("div", { className: "flex items-center", children: _jsx(Checkbox, { checked: service.serviceProvided, onCheckedChange: (checked) => {
                                                                                    const updatedServices = [
                                                                                        ...monthlyServices,
                                                                                    ];
                                                                                    const serviceIndex = updatedServices.findIndex((s) => s.day === day);
                                                                                    if (serviceIndex >= 0) {
                                                                                        updatedServices[serviceIndex] = {
                                                                                            ...updatedServices[serviceIndex],
                                                                                            serviceProvided: checked === true,
                                                                                        };
                                                                                    }
                                                                                    else {
                                                                                        updatedServices.push({
                                                                                            day,
                                                                                            serviceProvided: checked === true,
                                                                                            documentationComplete: false,
                                                                                        });
                                                                                    }
                                                                                    setMonthlyServices(updatedServices);
                                                                                } }) }) }), _jsx("td", { className: "p-2", children: service.serviceProvided ? (_jsxs(Select, { value: service.serviceType || "", onValueChange: (value) => {
                                                                                const updatedServices = [
                                                                                    ...monthlyServices,
                                                                                ];
                                                                                const serviceIndex = updatedServices.findIndex((s) => s.day === day);
                                                                                if (serviceIndex >= 0) {
                                                                                    updatedServices[serviceIndex] = {
                                                                                        ...updatedServices[serviceIndex],
                                                                                        serviceType: value,
                                                                                    };
                                                                                }
                                                                                setMonthlyServices(updatedServices);
                                                                            }, children: [_jsx(SelectTrigger, { className: "w-[180px]", children: _jsx(SelectValue, { placeholder: "Select service" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "nursing", children: "Home Nursing" }), _jsx(SelectItem, { value: "physiotherapy", children: "Physiotherapy" }), _jsx(SelectItem, { value: "occupational", children: "Occupational Therapy" }), _jsx(SelectItem, { value: "speech", children: "Speech Therapy" }), _jsx(SelectItem, { value: "respiratory", children: "Respiratory Therapy" })] })] })) : (_jsx("span", { className: "text-muted-foreground text-sm", children: "N/A" })) }), _jsx("td", { className: "p-2", children: service.serviceProvided ? (_jsxs(Select, { value: service.providerId || "", onValueChange: (value) => {
                                                                                const updatedServices = [
                                                                                    ...monthlyServices,
                                                                                ];
                                                                                const serviceIndex = updatedServices.findIndex((s) => s.day === day);
                                                                                if (serviceIndex >= 0) {
                                                                                    const providerName = value === "N12345"
                                                                                        ? "Sarah Ahmed"
                                                                                        : value === "PT6789"
                                                                                            ? "Ali Hassan"
                                                                                            : value === "OT4567"
                                                                                                ? "Fatima Al Zaabi"
                                                                                                : "";
                                                                                    updatedServices[serviceIndex] = {
                                                                                        ...updatedServices[serviceIndex],
                                                                                        providerId: value,
                                                                                        providerName,
                                                                                    };
                                                                                }
                                                                                setMonthlyServices(updatedServices);
                                                                            }, children: [_jsx(SelectTrigger, { className: "w-[180px]", children: _jsx(SelectValue, { placeholder: "Select provider" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "N12345", children: "Sarah Ahmed (Nurse)" }), _jsx(SelectItem, { value: "PT6789", children: "Ali Hassan (PT)" }), _jsx(SelectItem, { value: "OT4567", children: "Fatima Al Zaabi (OT)" })] })] })) : (_jsx("span", { className: "text-muted-foreground text-sm", children: "N/A" })) }), _jsx("td", { className: "p-2", children: service.serviceProvided ? (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Checkbox, { checked: service.documentationComplete, onCheckedChange: (checked) => {
                                                                                        const updatedServices = [
                                                                                            ...monthlyServices,
                                                                                        ];
                                                                                        const serviceIndex = updatedServices.findIndex((s) => s.day === day);
                                                                                        if (serviceIndex >= 0) {
                                                                                            updatedServices[serviceIndex] = {
                                                                                                ...updatedServices[serviceIndex],
                                                                                                documentationComplete: checked === true,
                                                                                                documentationId: checked === true
                                                                                                    ? `DOC-${day}-${currentMonth + 1}-${currentYear}`
                                                                                                    : undefined,
                                                                                            };
                                                                                        }
                                                                                        setMonthlyServices(updatedServices);
                                                                                    } }), _jsx("span", { className: service.documentationComplete
                                                                                        ? "text-green-600 text-sm"
                                                                                        : "text-amber-600 text-sm", children: service.documentationComplete
                                                                                        ? "Complete"
                                                                                        : "Pending" })] })) : (_jsx("span", { className: "text-muted-foreground text-sm", children: "N/A" })) }), _jsx("td", { className: "p-2", children: service.serviceProvided && (_jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(FileText, { className: "h-4 w-4 mr-1" }), service.documentationComplete
                                                                                            ? "View"
                                                                                            : "Add", " ", "Documentation"] }), _jsx(Button, { variant: "ghost", size: "sm", children: _jsx(ClipboardEdit, { className: "h-4 w-4" }) })] })) })] }, day));
                                                        }) })] }) }) }), _jsxs(CardFooter, { className: "flex justify-between border-t pt-4", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium", children: "Monthly Summary" }), _jsxs("div", { className: "flex gap-4 mt-2", children: [_jsxs("div", { className: "text-sm", children: [_jsx("span", { className: "font-medium", children: "Services Provided:" }), " ", monthlyServices.filter((s) => s.serviceProvided)
                                                                        .length, "/", getDaysInMonth(currentMonth, currentYear)] }), _jsxs("div", { className: "text-sm", children: [_jsx("span", { className: "font-medium", children: "Documentation Complete:" }), " ", monthlyServices.filter((s) => s.documentationComplete)
                                                                        .length, "/", monthlyServices.filter((s) => s.serviceProvided)
                                                                        .length] }), _jsxs("div", { className: "text-sm", children: [_jsx("span", { className: "font-medium", children: "Compliance Rate:" }), " ", monthlyServices.filter((s) => s.serviceProvided)
                                                                        .length > 0
                                                                        ? Math.round((monthlyServices.filter((s) => s.documentationComplete).length /
                                                                            monthlyServices.filter((s) => s.serviceProvided)
                                                                                .length) *
                                                                            100)
                                                                        : 0, "%"] })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "outline", children: [_jsx(FileSpreadsheet, { className: "h-4 w-4 mr-2" }), "Export to Excel"] }), _jsxs(Button, { children: [_jsx(Save, { className: "h-4 w-4 mr-2" }), "Save Changes"] })] })] })] }) }), _jsx(TabsContent, { value: "clinician-licenses", className: "mt-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: "Clinician Licenses Management" }), _jsx(CardDescription, { children: "Track and manage clinician licenses and compliance status" })] }), _jsxs(Button, { onClick: () => {
                                                        setSelectedLicense(null);
                                                        setLicenseFormMode("add");
                                                        setShowLicenseForm(true);
                                                    }, children: [_jsx(UserCheck, { className: "h-4 w-4 mr-2" }), "Add New License"] })] }) }), _jsx(CardContent, { children: showLicenseForm ? (_jsxs("div", { className: "border rounded-md p-4", children: [_jsx("h3", { className: "text-lg font-medium mb-4", children: licenseFormMode === "add"
                                                        ? "Add New License"
                                                        : "Edit License" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "clinician-name", children: "Clinician Name" }), _jsx(Input, { id: "clinician-name", placeholder: "Full name", value: selectedLicense?.clinicianName || "", onChange: (e) => setSelectedLicense((prev) => prev
                                                                        ? { ...prev, clinicianName: e.target.value }
                                                                        : null) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "employee-id", children: "Employee ID" }), _jsx(Input, { id: "employee-id", placeholder: "Employee ID", value: selectedLicense?.employeeId || "", onChange: (e) => setSelectedLicense((prev) => prev
                                                                        ? { ...prev, employeeId: e.target.value }
                                                                        : null) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "role", children: "Role" }), _jsxs(Select, { value: selectedLicense?.role || "", onValueChange: (value) => setSelectedLicense((prev) => prev ? { ...prev, role: value } : null), children: [_jsx(SelectTrigger, { id: "role", children: _jsx(SelectValue, { placeholder: "Select role" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "Nurse", children: "Nurse" }), _jsx(SelectItem, { value: "Physician", children: "Physician" }), _jsx(SelectItem, { value: "PT", children: "Physical Therapist" }), _jsx(SelectItem, { value: "OT", children: "Occupational Therapist" }), _jsx(SelectItem, { value: "ST", children: "Speech Therapist" }), _jsx(SelectItem, { value: "RT", children: "Respiratory Therapist" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "department", children: "Department" }), _jsxs(Select, { value: selectedLicense?.department || "", onValueChange: (value) => setSelectedLicense((prev) => prev ? { ...prev, department: value } : null), children: [_jsx(SelectTrigger, { id: "department", children: _jsx(SelectValue, { placeholder: "Select department" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "Nursing", children: "Nursing" }), _jsx(SelectItem, { value: "Medical", children: "Medical" }), _jsx(SelectItem, { value: "Therapy", children: "Therapy" }), _jsx(SelectItem, { value: "Respiratory", children: "Respiratory" }), _jsx(SelectItem, { value: "Administration", children: "Administration" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "license-number", children: "License Number" }), _jsx(Input, { id: "license-number", placeholder: "License number", value: selectedLicense?.licenseNumber || "", onChange: (e) => setSelectedLicense((prev) => prev
                                                                        ? { ...prev, licenseNumber: e.target.value }
                                                                        : null) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "license-type", children: "License Type" }), _jsxs(Select, { value: selectedLicense?.licenseType || "", onValueChange: (value) => setSelectedLicense((prev) => prev ? { ...prev, licenseType: value } : null), children: [_jsx(SelectTrigger, { id: "license-type", children: _jsx(SelectValue, { placeholder: "Select license type" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "DOH", children: "DOH License" }), _jsx(SelectItem, { value: "MOH", children: "MOH License" }), _jsx(SelectItem, { value: "DHA", children: "DHA License" }), _jsx(SelectItem, { value: "International", children: "International License" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "issuing-authority", children: "Issuing Authority" }), _jsx(Input, { id: "issuing-authority", placeholder: "Issuing authority", value: selectedLicense?.issuingAuthority || "", onChange: (e) => setSelectedLicense((prev) => prev
                                                                        ? {
                                                                            ...prev,
                                                                            issuingAuthority: e.target.value,
                                                                        }
                                                                        : null) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "issue-date", children: "Issue Date" }), _jsx(Input, { id: "issue-date", type: "date", value: selectedLicense?.issueDate || "", onChange: (e) => setSelectedLicense((prev) => prev
                                                                        ? { ...prev, issueDate: e.target.value }
                                                                        : null) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "expiry-date", children: "Expiry Date" }), _jsx(Input, { id: "expiry-date", type: "date", value: selectedLicense?.expiryDate || "", onChange: (e) => setSelectedLicense((prev) => prev
                                                                        ? { ...prev, expiryDate: e.target.value }
                                                                        : null) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "license-status", children: "License Status" }), _jsxs(Select, { value: selectedLicense?.licenseStatus || "Active", onValueChange: (value) => setSelectedLicense((prev) => prev ? { ...prev, licenseStatus: value } : null), children: [_jsx(SelectTrigger, { id: "license-status", children: _jsx(SelectValue, { placeholder: "Select status" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "Active", children: "Active" }), _jsx(SelectItem, { value: "Expired", children: "Expired" }), _jsx(SelectItem, { value: "Suspended", children: "Suspended" }), _jsx(SelectItem, { value: "Pending Renewal", children: "Pending Renewal" })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "renewal-notification", children: "Renewal Notification Date" }), _jsx(Input, { id: "renewal-notification", type: "date", value: selectedLicense?.renewalNotificationDate || "", onChange: (e) => setSelectedLicense((prev) => prev
                                                                        ? {
                                                                            ...prev,
                                                                            renewalNotificationDate: e.target.value,
                                                                        }
                                                                        : null) })] }), _jsx("div", { className: "space-y-2 flex items-center", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "renewal-initiated", checked: selectedLicense?.renewalInitiated || false, onCheckedChange: (checked) => setSelectedLicense((prev) => prev
                                                                            ? {
                                                                                ...prev,
                                                                                renewalInitiated: checked === true,
                                                                            }
                                                                            : null) }), _jsx(Label, { htmlFor: "renewal-initiated", children: "Renewal Initiated" })] }) }), _jsx("div", { className: "space-y-2 flex items-center", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "renewal-completed", checked: selectedLicense?.renewalCompleted || false, onCheckedChange: (checked) => setSelectedLicense((prev) => prev
                                                                            ? {
                                                                                ...prev,
                                                                                renewalCompleted: checked === true,
                                                                            }
                                                                            : null) }), _jsx(Label, { htmlFor: "renewal-completed", children: "Renewal Completed" })] }) }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "renewal-completion-date", children: "Renewal Completion Date" }), _jsx(Input, { id: "renewal-completion-date", type: "date", value: selectedLicense?.renewalCompletionDate || "", onChange: (e) => setSelectedLicense((prev) => prev
                                                                        ? {
                                                                            ...prev,
                                                                            renewalCompletionDate: e.target.value,
                                                                        }
                                                                        : null) })] }), _jsx("div", { className: "space-y-2 flex items-center", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "continuing-education", checked: selectedLicense?.continuingEducationCompleted ||
                                                                            false, onCheckedChange: (checked) => setSelectedLicense((prev) => prev
                                                                            ? {
                                                                                ...prev,
                                                                                continuingEducationCompleted: checked === true,
                                                                            }
                                                                            : null) }), _jsx(Label, { htmlFor: "continuing-education", children: "Continuing Education Completed" })] }) }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "education-hours", children: "Continuing Education Hours" }), _jsx(Input, { id: "education-hours", type: "number", value: selectedLicense?.continuingEducationHours || "", onChange: (e) => setSelectedLicense((prev) => prev
                                                                        ? {
                                                                            ...prev,
                                                                            continuingEducationHours: parseInt(e.target.value) || undefined,
                                                                        }
                                                                        : null) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "compliance-status", children: "Compliance Status" }), _jsxs(Select, { value: selectedLicense?.complianceStatus || "Compliant", onValueChange: (value) => setSelectedLicense((prev) => prev
                                                                        ? { ...prev, complianceStatus: value }
                                                                        : null), children: [_jsx(SelectTrigger, { id: "compliance-status", children: _jsx(SelectValue, { placeholder: "Select compliance status" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "Compliant", children: "Compliant" }), _jsx(SelectItem, { value: "Non-Compliant", children: "Non-Compliant" }), _jsx(SelectItem, { value: "Under Review", children: "Under Review" })] })] })] }), _jsx("div", { className: "space-y-2 flex items-center", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "active-for-claims", checked: selectedLicense?.currentlyActiveForClaims ||
                                                                            true, onCheckedChange: (checked) => setSelectedLicense((prev) => prev
                                                                            ? {
                                                                                ...prev,
                                                                                currentlyActiveForClaims: checked === true,
                                                                            }
                                                                            : null) }), _jsx(Label, { htmlFor: "active-for-claims", children: "Currently Active for Claims" })] }) })] }), _jsxs("div", { className: "flex justify-end gap-2 mt-6", children: [_jsx(Button, { variant: "outline", onClick: () => setShowLicenseForm(false), children: "Cancel" }), _jsx(Button, { onClick: () => {
                                                                if (selectedLicense) {
                                                                    if (licenseFormMode === "add") {
                                                                        // Generate a unique ID for the new license
                                                                        const newLicense = {
                                                                            ...selectedLicense,
                                                                            id: `license-${Date.now()}`,
                                                                            totalClaimsAssociated: 0,
                                                                        };
                                                                        setClinicianLicenses([
                                                                            ...clinicianLicenses,
                                                                            newLicense,
                                                                        ]);
                                                                    }
                                                                    else {
                                                                        // Update existing license
                                                                        setClinicianLicenses(clinicianLicenses.map((license) => license.id === selectedLicense.id
                                                                            ? selectedLicense
                                                                            : license));
                                                                    }
                                                                    setShowLicenseForm(false);
                                                                }
                                                            }, children: licenseFormMode === "add"
                                                                ? "Add License"
                                                                : "Update License" })] })] })) : (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx(Input, { placeholder: "Search licenses...", className: "max-w-sm" }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Select, { defaultValue: "all", children: [_jsx(SelectTrigger, { className: "w-[180px]", children: _jsx(SelectValue, { placeholder: "Filter by status" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Statuses" }), _jsx(SelectItem, { value: "active", children: "Active" }), _jsx(SelectItem, { value: "expired", children: "Expired" }), _jsx(SelectItem, { value: "pending", children: "Pending Renewal" }), _jsx(SelectItem, { value: "suspended", children: "Suspended" })] })] }), _jsxs(Select, { defaultValue: "all", children: [_jsx(SelectTrigger, { className: "w-[180px]", children: _jsx(SelectValue, { placeholder: "Filter by role" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Roles" }), _jsx(SelectItem, { value: "nurse", children: "Nurse" }), _jsx(SelectItem, { value: "physician", children: "Physician" }), _jsx(SelectItem, { value: "pt", children: "Physical Therapist" }), _jsx(SelectItem, { value: "ot", children: "Occupational Therapist" }), _jsx(SelectItem, { value: "st", children: "Speech Therapist" }), _jsx(SelectItem, { value: "rt", children: "Respiratory Therapist" })] })] })] })] }), _jsx("div", { className: "border rounded-md overflow-hidden", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-muted", children: [_jsx("th", { className: "p-2 text-left", children: "Clinician Name" }), _jsx("th", { className: "p-2 text-left", children: "Role" }), _jsx("th", { className: "p-2 text-left", children: "License Number" }), _jsx("th", { className: "p-2 text-left", children: "Expiry Date" }), _jsx("th", { className: "p-2 text-left", children: "Status" }), _jsx("th", { className: "p-2 text-left", children: "Compliance" }), _jsx("th", { className: "p-2 text-left", children: "Actions" })] }) }), _jsx("tbody", { children: clinicianLicenses.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 7, className: "p-4 text-center text-muted-foreground", children: "No licenses found. Add a new license to get started." }) })) : (clinicianLicenses.map((license) => (_jsxs("tr", { className: "border-b", children: [_jsx("td", { className: "p-2", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(User, { className: "h-4 w-4 text-muted-foreground" }), _jsx("span", { children: license.clinicianName })] }) }), _jsx("td", { className: "p-2", children: license.role }), _jsx("td", { className: "p-2", children: license.licenseNumber }), _jsx("td", { className: "p-2", children: _jsxs("div", { className: "flex items-center gap-2", children: [license.expiryDate, isLicenseExpiringSoon(license.expiryDate) && (_jsx(Badge, { variant: "warning", className: "text-xs", children: "Expiring Soon" }))] }) }), _jsx("td", { className: "p-2", children: _jsx(Badge, { variant: license.licenseStatus === "Active"
                                                                                    ? "success"
                                                                                    : license.licenseStatus === "Expired"
                                                                                        ? "destructive"
                                                                                        : license.licenseStatus ===
                                                                                            "Suspended"
                                                                                            ? "destructive"
                                                                                            : "warning", children: license.licenseStatus }) }), _jsx("td", { className: "p-2", children: _jsxs("div", { className: "flex items-center gap-2", children: [license.complianceStatus ===
                                                                                        "Compliant" ? (_jsx(ShieldCheck, { className: "h-4 w-4 text-green-500" })) : license.complianceStatus ===
                                                                                        "Non-Compliant" ? (_jsx(ShieldAlert, { className: "h-4 w-4 text-red-500" })) : (_jsx(AlertCircle, { className: "h-4 w-4 text-amber-500" })), _jsx("span", { children: license.complianceStatus })] }) }), _jsx("td", { className: "p-2", children: _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => {
                                                                                            setSelectedLicense(license);
                                                                                            setLicenseFormMode("edit");
                                                                                            setShowLicenseForm(true);
                                                                                        }, children: "Edit" }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => {
                                                                                            // In a real app, this would show a confirmation dialog
                                                                                            setClinicianLicenses(clinicianLicenses.filter((l) => l.id !== license.id));
                                                                                        }, children: _jsx(FileX, { className: "h-4 w-4 text-red-500" }) })] }) })] }, license.id)))) })] }) })] })) }), _jsxs(CardFooter, { className: "flex justify-between border-t pt-4", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium", children: "License Summary" }), _jsxs("div", { className: "flex gap-4 mt-2", children: [_jsxs("div", { className: "text-sm", children: [_jsx("span", { className: "font-medium", children: "Total Licenses:" }), " ", clinicianLicenses.length] }), _jsxs("div", { className: "text-sm", children: [_jsx("span", { className: "font-medium", children: "Active:" }), " ", clinicianLicenses.filter((l) => l.licenseStatus === "Active").length] }), _jsxs("div", { className: "text-sm", children: [_jsx("span", { className: "font-medium", children: "Expiring Soon:" }), " ", clinicianLicenses.filter((l) => isLicenseExpiringSoon(l.expiryDate)).length] }), _jsxs("div", { className: "text-sm", children: [_jsx("span", { className: "font-medium", children: "Expired:" }), " ", clinicianLicenses.filter((l) => l.licenseStatus === "Expired").length] })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "outline", children: [_jsx(FileSpreadsheet, { className: "h-4 w-4 mr-2" }), "Export Licenses"] }), _jsxs(Button, { variant: "outline", children: [_jsx(Bell, { className: "h-4 w-4 mr-2" }), "Set Renewal Alerts"] })] })] })] }) }), _jsx(TabsContent, { value: "daily-claims", className: "mt-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: "Daily Claims Generation & Validation" }), _jsx(CardDescription, { children: "Generate and validate claims based on service delivery documentation" })] }), _jsxs(Button, { onClick: () => {
                                                        // Simulate generating new claims
                                                        setClaimsProcessingData((prev) => ({
                                                            ...prev,
                                                            dailyClaimsGenerated: prev.dailyClaimsGenerated + 1,
                                                            pendingValidation: prev.pendingValidation + 1,
                                                        }));
                                                    }, children: [_jsx(FileBarChart, { className: "h-4 w-4 mr-2" }), "Generate New Claim"] })] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-base", children: "Claims Status" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium", children: "Generated Today:" }), _jsx(Badge, { children: claimsProcessingData.dailyClaimsGenerated })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium", children: "Pending Validation:" }), _jsx(Badge, { variant: "warning", children: claimsProcessingData.pendingValidation })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium", children: "Ready for Submission:" }), _jsx(Badge, { variant: "success", children: claimsProcessingData.readyForSubmission })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium", children: "Total Active Claims:" }), _jsx(Badge, { variant: "outline", children: claimsProcessingData.dailyClaimsGenerated +
                                                                                        claimsProcessingData.pendingValidation +
                                                                                        claimsProcessingData.readyForSubmission })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-base", children: "Validation Issues" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-2", children: [claimsProcessingData.validationIssues.map((issue, index) => (_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { className: "flex items-center gap-2", children: [issue.type === "license" ? (_jsx(BadgeAlert, { className: "h-4 w-4 text-red-500" })) : issue.type === "documentation" ? (_jsx(FileWarning, { className: "h-4 w-4 text-amber-500" })) : (_jsx(AlertCircle, { className: "h-4 w-4 text-amber-500" })), _jsx("span", { className: "text-sm", children: issue.description })] }), _jsx(Badge, { variant: "outline", children: issue.count })] }, index))), claimsProcessingData.validationIssues.length ===
                                                                            0 && (_jsx("div", { className: "text-center py-2 text-sm text-muted-foreground", children: "No validation issues found" }))] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-base", children: "Quick Actions" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-2", children: [_jsxs(Button, { variant: "outline", className: "w-full justify-start", size: "sm", children: [_jsx(FileCheck2, { className: "h-4 w-4 mr-2" }), "Validate Pending Claims"] }), _jsxs(Button, { variant: "outline", className: "w-full justify-start", size: "sm", children: [_jsx(FilePlus2, { className: "h-4 w-4 mr-2" }), "Batch Generate Claims"] }), _jsxs(Button, { variant: "outline", className: "w-full justify-start", size: "sm", children: [_jsx(UserCog, { className: "h-4 w-4 mr-2" }), "Verify Provider Licenses"] }), _jsxs(Button, { variant: "outline", className: "w-full justify-start", size: "sm", children: [_jsx(FileSpreadsheet, { className: "h-4 w-4 mr-2" }), "Export Claims Report"] })] }) })] })] }), _jsx("div", { className: "border rounded-md overflow-hidden", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-muted", children: [_jsx("th", { className: "p-2 text-left", children: "Claim ID" }), _jsx("th", { className: "p-2 text-left", children: "Patient" }), _jsx("th", { className: "p-2 text-left", children: "Service Period" }), _jsx("th", { className: "p-2 text-left", children: "Provider" }), _jsx("th", { className: "p-2 text-left", children: "Amount" }), _jsx("th", { className: "p-2 text-left", children: "Status" }), _jsx("th", { className: "p-2 text-left", children: "Actions" })] }) }), _jsxs("tbody", { children: [_jsxs("tr", { className: "border-b", children: [_jsx("td", { className: "p-2", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(FileText, { className: "h-4 w-4 text-muted-foreground" }), _jsx("span", { children: "CL-2024-0001" })] }) }), _jsx("td", { className: "p-2", children: "Mohammed Al Mansoori" }), _jsx("td", { className: "p-2", children: "Feb 1-15, 2024" }), _jsx("td", { className: "p-2", children: "Sarah Ahmed" }), _jsx("td", { className: "p-2", children: "AED 7,500.00" }), _jsx("td", { className: "p-2", children: _jsx(Badge, { variant: "success", children: "Validated" }) }), _jsx("td", { className: "p-2", children: _jsx("div", { className: "flex gap-2", children: _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(FileCheck, { className: "h-4 w-4 mr-1" }), "Submit"] }) }) })] }), _jsxs("tr", { className: "border-b", children: [_jsx("td", { className: "p-2", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(FileText, { className: "h-4 w-4 text-muted-foreground" }), _jsx("span", { children: "CL-2024-0002" })] }) }), _jsx("td", { className: "p-2", children: "Fatima Al Zaabi" }), _jsx("td", { className: "p-2", children: "Feb 1-15, 2024" }), _jsx("td", { className: "p-2", children: "Ali Hassan" }), _jsx("td", { className: "p-2", children: "AED 3,600.00" }), _jsx("td", { className: "p-2", children: _jsx(Badge, { variant: "warning", children: "Pending Validation" }) }), _jsx("td", { className: "p-2", children: _jsx("div", { className: "flex gap-2", children: _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(FileSearch, { className: "h-4 w-4 mr-1" }), "Validate"] }) }) })] }), _jsxs("tr", { className: "border-b", children: [_jsx("td", { className: "p-2", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(FileText, { className: "h-4 w-4 text-muted-foreground" }), _jsx("span", { children: "CL-2024-0003" })] }) }), _jsx("td", { className: "p-2", children: "Ahmed Al Shamsi" }), _jsx("td", { className: "p-2", children: "Feb 1-15, 2024" }), _jsx("td", { className: "p-2", children: "Khalid Rahman" }), _jsx("td", { className: "p-2", children: "AED 4,200.00" }), _jsx("td", { className: "p-2", children: _jsx(Badge, { variant: "destructive", children: "Validation Failed" }) }), _jsx("td", { className: "p-2", children: _jsx("div", { className: "flex gap-2", children: _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(FileWarning, { className: "h-4 w-4 mr-1" }), "View Issues"] }) }) })] }), _jsxs("tr", { className: "border-b", children: [_jsx("td", { className: "p-2", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(FileText, { className: "h-4 w-4 text-muted-foreground" }), _jsx("span", { children: "CL-2024-0004" })] }) }), _jsx("td", { className: "p-2", children: "Mariam Al Nuaimi" }), _jsx("td", { className: "p-2", children: "Feb 1-15, 2024" }), _jsx("td", { className: "p-2", children: "Aisha Al Hashimi" }), _jsx("td", { className: "p-2", children: "AED 6,750.00" }), _jsx("td", { className: "p-2", children: _jsx(Badge, { variant: "success", children: "Validated" }) }), _jsx("td", { className: "p-2", children: _jsx("div", { className: "flex gap-2", children: _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(FileCheck, { className: "h-4 w-4 mr-1" }), "Submit"] }) }) })] })] })] }) })] }), _jsxs(CardFooter, { className: "flex justify-between border-t pt-4", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium", children: "Claims Summary" }), _jsxs("div", { className: "flex gap-4 mt-2", children: [_jsxs("div", { className: "text-sm", children: [_jsx("span", { className: "font-medium", children: "Total Claims:" }), " ", claimsProcessingData.dailyClaimsGenerated +
                                                                        claimsProcessingData.pendingValidation +
                                                                        claimsProcessingData.readyForSubmission] }), _jsxs("div", { className: "text-sm", children: [_jsx("span", { className: "font-medium", children: "Validation Rate:" }), " ", claimsProcessingData.dailyClaimsGenerated > 0
                                                                        ? Math.round((claimsProcessingData.readyForSubmission /
                                                                            (claimsProcessingData.dailyClaimsGenerated +
                                                                                claimsProcessingData.pendingValidation +
                                                                                claimsProcessingData.readyForSubmission)) *
                                                                            100)
                                                                        : 0, "%"] })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "outline", children: [_jsx(FileSpreadsheet, { className: "h-4 w-4 mr-2" }), "Export Report"] }), _jsxs(Button, { children: [_jsx(Send, { className: "h-4 w-4 mr-2" }), "Submit All Validated"] })] })] })] }) }), _jsx(TabsContent, { value: "claims-audit", className: "mt-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: "Claims Audit & Quality Assurance" }), _jsx(CardDescription, { children: "Conduct systematic audits of submitted claims and verify documentation compliance" })] }), _jsx(Button, { onClick: () => {
                                                        setAuditInProgress(true);
                                                        // Simulate an audit process
                                                        setTimeout(() => {
                                                            setAuditResults({
                                                                passed: Math.floor(Math.random() * 10) + 15,
                                                                failed: Math.floor(Math.random() * 5) + 1,
                                                                total: 20,
                                                            });
                                                            setAuditInProgress(false);
                                                        }, 2000);
                                                    }, disabled: auditInProgress, children: auditInProgress ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }), "Running Audit..."] })) : (_jsxs(_Fragment, { children: [_jsx(ClipboardCheck, { className: "h-4 w-4 mr-2" }), "Run Audit"] })) })] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-base", children: "Audit Summary" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium", children: "Total Claims Audited:" }), _jsx("span", { className: "text-lg font-bold", children: auditResults.total })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium", children: "Passed:" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: "success", children: auditResults.passed }), _jsxs("span", { className: "text-green-600", children: [Math.round((auditResults.passed / auditResults.total) *
                                                                                                    100), "%"] })] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium", children: "Failed:" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: "destructive", children: auditResults.failed }), _jsxs("span", { className: "text-red-600", children: [Math.round((auditResults.failed / auditResults.total) *
                                                                                                    100), "%"] })] })] }), _jsx("div", { className: "h-2 w-full bg-muted rounded-full overflow-hidden", children: _jsx("div", { className: "h-full bg-green-500", style: {
                                                                                    width: `${(auditResults.passed / auditResults.total) * 100}%`,
                                                                                } }) })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-base", children: "Common Issues" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(AlertCircle, { className: "h-4 w-4 text-red-500" }), _jsx("span", { className: "text-sm", children: "Missing service logs" })] }), _jsx(Badge, { variant: "outline", children: "3 claims" })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(AlertCircle, { className: "h-4 w-4 text-amber-500" }), _jsx("span", { className: "text-sm", children: "Incomplete documentation" })] }), _jsx(Badge, { variant: "outline", children: "2 claims" })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(AlertCircle, { className: "h-4 w-4 text-amber-500" }), _jsx("span", { className: "text-sm", children: "Service code mismatch" })] }), _jsx(Badge, { variant: "outline", children: "1 claim" })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(AlertCircle, { className: "h-4 w-4 text-red-500" }), _jsx("span", { className: "text-sm", children: "Expired provider license" })] }), _jsx(Badge, { variant: "outline", children: "1 claim" })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-base", children: "Recommendations" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-start gap-2", children: [_jsx(CheckSquare, { className: "h-4 w-4 text-green-500 mt-1" }), _jsx("span", { className: "text-sm", children: "Implement daily service log verification" })] }), _jsxs("div", { className: "flex items-start gap-2", children: [_jsx(CheckSquare, { className: "h-4 w-4 text-green-500 mt-1" }), _jsx("span", { className: "text-sm", children: "Set up automated license expiry alerts" })] }), _jsxs("div", { className: "flex items-start gap-2", children: [_jsx(CheckSquare, { className: "h-4 w-4 text-green-500 mt-1" }), _jsx("span", { className: "text-sm", children: "Conduct monthly documentation training" })] }), _jsxs("div", { className: "flex items-start gap-2", children: [_jsx(CheckSquare, { className: "h-4 w-4 text-green-500 mt-1" }), _jsx("span", { className: "text-sm", children: "Implement pre-submission validation checks" })] })] }) })] })] }), _jsx("div", { className: "border rounded-md overflow-hidden", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-muted", children: [_jsx("th", { className: "p-2 text-left", children: "Claim Number" }), _jsx("th", { className: "p-2 text-left", children: "Submission Date" }), _jsx("th", { className: "p-2 text-left", children: "Amount" }), _jsx("th", { className: "p-2 text-left", children: "Provider" }), _jsx("th", { className: "p-2 text-left", children: "Audit Status" }), _jsx("th", { className: "p-2 text-left", children: "Issues" }), _jsx("th", { className: "p-2 text-left", children: "Actions" })] }) }), _jsx("tbody", { children: claimHistory.slice(0, 5).map((claim, index) => (_jsxs("tr", { className: "border-b", children: [_jsx("td", { className: "p-2", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(FileText, { className: "h-4 w-4 text-muted-foreground" }), _jsx("span", { children: claim.claimNumber })] }) }), _jsx("td", { className: "p-2", children: claim.submissionDate }), _jsxs("td", { className: "p-2", children: ["AED ", claim.amount.toFixed(2)] }), _jsx("td", { className: "p-2", children: index === 0
                                                                            ? "Sarah Ahmed"
                                                                            : index === 1
                                                                                ? "Ali Hassan"
                                                                                : "Fatima Al Zaabi" }), _jsx("td", { className: "p-2", children: _jsx(Badge, { variant: index < 3
                                                                                ? "success"
                                                                                : index === 3
                                                                                    ? "warning"
                                                                                    : "destructive", children: index < 3
                                                                                ? "Passed"
                                                                                : index === 3
                                                                                    ? "Warning"
                                                                                    : "Failed" }) }), _jsx("td", { className: "p-2", children: index < 3 ? (_jsx("span", { className: "text-green-600 text-sm", children: "No issues found" })) : index === 3 ? (_jsx("span", { className: "text-amber-600 text-sm", children: "Minor documentation issues" })) : (_jsx("span", { className: "text-red-600 text-sm", children: "Missing service logs" })) }), _jsx("td", { className: "p-2", children: _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(FileSearch, { className: "h-4 w-4 mr-1" }), "View Audit"] }), index >= 3 && (_jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(FileUp, { className: "h-4 w-4 mr-1" }), "Fix Issues"] }))] }) })] }, claim.id))) })] }) })] }), _jsxs(CardFooter, { className: "flex justify-between border-t pt-4", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium", children: "Audit Performance" }), _jsxs("div", { className: "flex gap-4 mt-2", children: [_jsxs("div", { className: "text-sm", children: [_jsx("span", { className: "font-medium", children: "Last Audit:" }), " ", new Date().toLocaleDateString()] }), _jsxs("div", { className: "text-sm", children: [_jsx("span", { className: "font-medium", children: "Compliance Rate:" }), " ", auditResults.total > 0
                                                                        ? Math.round((auditResults.passed / auditResults.total) * 100)
                                                                        : 0, "%"] }), _jsxs("div", { className: "text-sm", children: [_jsx("span", { className: "font-medium", children: "Target:" }), " 95%"] })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "outline", children: [_jsx(FileSpreadsheet, { className: "h-4 w-4 mr-2" }), "Export Audit Report"] }), _jsxs(Button, { children: [_jsx(CheckSquare, { className: "h-4 w-4 mr-2" }), "Schedule Next Audit"] })] })] })] }) }), _jsx(TabsContent, { value: "claim-history", className: "mt-4" })] })] })) }));
};
export default ClaimsSubmissionForm;
