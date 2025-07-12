import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  FileText,
  Upload,
  Save,
  CheckCircle,
  AlertCircle,
  FileUp,
  Clipboard,
  ClipboardCheck,
  Calendar,
  User,
  CreditCard,
  Stethoscope,
  Pill,
  Activity,
  FileSpreadsheet,
  FileCheck,
  FileBarChart,
  FileMinus,
  FileSymlink,
  FileBox,
  Send,
  Clock,
  CheckSquare,
  BarChart,
  FileSearch,
  FileQuestion,
  FileX,
  FileCheck2,
  History,
  DollarSign,
  Receipt,
  Calculator,
  Percent,
  Building,
  CalendarClock,
  ClipboardList,
  Banknote,
  UserCheck,
  CalendarDays,
  AlertTriangle,
  Award,
  BadgeCheck,
  BadgeAlert,
  Calendar as CalendarIcon,
  CheckSquare2,
  ClipboardEdit,
  FileWarning,
  FilePlus2,
  UserCog,
  Users,
  ShieldCheck,
  ShieldAlert,
  Briefcase,
  Bell,
  Loader2,
} from "lucide-react";
import { ApiService } from "@/services/api.service";
import { SERVICE_ENDPOINTS } from "@/config/api.config";

interface ClaimsSubmissionFormProps {
  patientId?: string;
  episodeId?: string;
  authorizationId?: string;
  isOffline?: boolean;
  onComplete?: (success: boolean) => void;
}

interface ClinicianLicense {
  id: string;
  clinicianName: string;
  employeeId: string;
  role: string;
  department: string;
  licenseNumber: string;
  licenseType: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  licenseStatus: "Active" | "Expired" | "Suspended" | "Pending Renewal";
  renewalNotificationDate?: string;
  renewalInitiated: boolean;
  renewalCompleted: boolean;
  renewalCompletionDate?: string;
  continuingEducationCompleted: boolean;
  continuingEducationHours?: number;
  complianceStatus: "Compliant" | "Non-Compliant" | "Under Review";
  currentlyActiveForClaims: boolean;
  lastUsedForClaim?: string;
  totalClaimsAssociated: number;
}

interface MonthlyServiceTracking {
  day: number;
  serviceProvided: boolean;
  serviceType?: string;
  providerId?: string;
  providerName?: string;
  documentationComplete: boolean;
  documentationId?: string;
  notes?: string;
}

interface ClaimDocument {
  id: string;
  name: string;
  required: boolean;
  uploaded: boolean;
  icon: React.ReactNode;
  description: string;
  file?: File;
  uploadDate?: string;
  uploadedBy?: string;
  fileSize?: number;
  fileType?: string;
}

interface ClaimStatus {
  id: string;
  claimNumber: string;
  submissionDate: string;
  status:
    | "pending"
    | "paid"
    | "rejected"
    | "partial"
    | "in-review"
    | "returned";
  amount: number;
  paidAmount?: number;
  comments?: string;
  reviewer?: string;
  reviewDate?: string;
  paymentDate?: string;
  paymentReference?: string;
}

interface PaymentRecord {
  id: string;
  claimId: string;
  claimNumber: string;
  paymentDate: string;
  paymentAmount: number;
  paymentMethod: string;
  paymentReference: string;
  expectedAmount: number;
  variance: number;
  varianceReason?: string;
  status: "reconciled" | "unreconciled" | "disputed";
  notes?: string;
}

interface DenialRecord {
  id: string;
  claimId: string;
  claimNumber: string;
  denialDate: string;
  denialReason: string;
  denialCode: string;
  appealStatus:
    | "not_started"
    | "in_progress"
    | "submitted"
    | "resolved"
    | "rejected";
  appealDeadline?: string;
  appealSubmissionDate?: string;
  supportingDocuments: string[];
  resolutionDate?: string;
  resolutionAmount?: number;
  status: "active" | "resolved" | "write_off";
  notes?: string;
}

interface RevenueMetrics {
  totalClaims: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  deniedAmount: number;
  adjustmentAmount: number;
  collectionRate: number;
  averageDaysToPayment: number;
}

interface ServiceLine {
  id: string;
  serviceCode: string;
  serviceDescription: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  dateOfService: string;
  providerId: string;
  providerName: string;
  authorizationReference?: string;
}

// Mock revenue metrics data
const mockRevenueMetrics: RevenueMetrics = {
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
const mockPaymentRecords: PaymentRecord[] = [
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
const mockDenialRecords: DenialRecord[] = [
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

export const ClaimsSubmissionForm = ({
  patientId = "P12345",
  episodeId = "EP789",
  authorizationId = "AUTH-12345",
  isOffline = false,
  onComplete,
}: ClaimsSubmissionFormProps) => {
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
  const [revenueMetrics, setRevenueMetrics] =
    useState<RevenueMetrics>(mockRevenueMetrics);
  const [paymentRecords, setPaymentRecords] =
    useState<PaymentRecord[]>(mockPaymentRecords);
  const [denialRecords, setDenialRecords] =
    useState<DenialRecord[]>(mockDenialRecords);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Monthly service tracking state
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [monthlyServices, setMonthlyServices] = useState<
    MonthlyServiceTracking[]
  >([]);

  // Clinician licenses state
  const [clinicianLicenses, setClinicianLicenses] = useState<
    ClinicianLicense[]
  >([]);
  const [selectedLicense, setSelectedLicense] =
    useState<ClinicianLicense | null>(null);
  const [showLicenseForm, setShowLicenseForm] = useState(false);
  const [licenseFormMode, setLicenseFormMode] = useState<"add" | "edit">("add");

  // Claims audit state
  const [auditResults, setAuditResults] = useState<{
    passed: number;
    failed: number;
    total: number;
  }>({ passed: 0, failed: 0, total: 0 });
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
  const [serviceLines, setServiceLines] = useState<ServiceLine[]>([
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
  const [claimHistory, setClaimHistory] = useState<ClaimStatus[]>([
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
  const requiredDocuments: ClaimDocument[] = [
    {
      id: "claim-form",
      name: "Daman Claim Submission Form",
      required: true,
      uploaded: false,
      icon: <FileText className="h-4 w-4" />,
      description: "Official Daman form for claim submission",
    },
    {
      id: "service-log",
      name: "Service Log/Visit Notes",
      required: true,
      uploaded: false,
      icon: <ClipboardList className="h-4 w-4" />,
      description:
        "Detailed log of all services provided during billing period",
    },
    {
      id: "authorization-letter",
      name: "Authorization Approval Letter",
      required: true,
      uploaded: false,
      icon: <FileCheck className="h-4 w-4" />,
      description: "Copy of the approved authorization letter from Daman",
    },
    {
      id: "invoice",
      name: "Detailed Invoice",
      required: true,
      uploaded: false,
      icon: <Receipt className="h-4 w-4" />,
      description: "Itemized invoice for all services being claimed",
    },
    {
      id: "attendance-sheet",
      name: "Staff Attendance Sheet",
      required: true,
      uploaded: false,
      icon: <CalendarClock className="h-4 w-4" />,
      description: "Staff attendance record with timestamps for each visit",
    },
    {
      id: "clinical-notes",
      name: "Clinical Progress Notes",
      required: true,
      uploaded: false,
      icon: <FileSymlink className="h-4 w-4" />,
      description: "Clinical documentation for the billing period",
    },
    {
      id: "mar",
      name: "Medication Administration Record",
      required: true,
      uploaded: false,
      icon: <Clipboard className="h-4 w-4" />,
      description:
        "Documentation of medication administration during billing period",
    },
    {
      id: "vital-signs",
      name: "Vital Signs Monitoring Sheet",
      required: true,
      uploaded: false,
      icon: <Activity className="h-4 w-4" />,
      description: "Record of patient's vital signs measurements",
    },
    {
      id: "thiqa-card",
      name: "Patient Thiqa Card copy",
      required: true,
      uploaded: false,
      icon: <CreditCard className="h-4 w-4" />,
      description: "Copy of patient's Thiqa insurance card",
    },
    {
      id: "emirates-id",
      name: "Patient Emirates ID copy",
      required: true,
      uploaded: false,
      icon: <CreditCard className="h-4 w-4" />,
      description: "Copy of patient's Emirates ID",
    },
    {
      id: "provider-licenses",
      name: "Provider Licenses",
      required: true,
      uploaded: false,
      icon: <FileCheck className="h-4 w-4" />,
      description: "Copies of professional licenses for all providers",
    },
    {
      id: "previous-claim",
      name: "Previous Claim Documentation",
      required: false,
      uploaded: false,
      icon: <History className="h-4 w-4" />,
      description: "Documentation from previous claims (if applicable)",
    },
  ];

  const [documents, setDocuments] =
    useState<ClaimDocument[]>(requiredDocuments);

  // Calculate submission progress
  const calculateProgress = () => {
    const requiredDocs = documents.filter((doc) => doc.required);
    const uploadedRequiredDocs = requiredDocs.filter((doc) => doc.uploaded);
    const progress = Math.round(
      (uploadedRequiredDocs.length / requiredDocs.length) * 100,
    );
    setSubmissionProgress(progress);
    return progress;
  };

  // Handle document upload
  const handleDocumentUpload = (documentId: string) => {
    // Create a file input element
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png";

    // Handle file selection
    fileInput.onchange = (e) => {
      const target = e.target as HTMLInputElement;
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
    const newServiceLine: ServiceLine = {
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
  const handleUpdateServiceLine = (
    id: string,
    field: keyof ServiceLine,
    value: any,
  ) => {
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
  const handleRemoveServiceLine = (id: string) => {
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
      const missingDocs = documents.filter(
        (doc) => doc.required && !doc.uploaded,
      );

      if (missingDocs.length > 0) {
        alert(
          `Please upload all required documents. Missing: ${missingDocs
            .map((d) => d.name)
            .join(", ")}`,
        );
        setIsSubmitting(false);
        return;
      }

      // Validate service lines
      if (serviceLines.length === 0) {
        alert("Please add at least one service line to the claim.");
        setIsSubmitting(false);
        return;
      }

      const invalidServiceLines = serviceLines.filter(
        (line) =>
          !line.serviceCode ||
          !line.serviceDescription ||
          line.quantity <= 0 ||
          line.unitPrice <= 0 ||
          !line.dateOfService ||
          !line.providerId ||
          !line.providerName,
      );

      if (invalidServiceLines.length > 0) {
        alert(
          "Please complete all service line details. Each service line must have a code, description, quantity, price, date, and provider information.",
        );
        setIsSubmitting(false);
        return;
      }

      // Validate provider licenses
      const invalidProviders = validateClaimLicenses();
      if (invalidProviders.length > 0) {
        const confirmSubmit = window.confirm(
          `Warning: The following providers have license issues:\n\n${invalidProviders.join("\n")}\n\nContinuing may result in claim rejection. Do you want to proceed anyway?`,
        );

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
      const missingDocumentation: string[] = [];

      serviceDates.forEach((dateInfo) => {
        if (!dateInfo) return;

        const { startDate, endDate, line } = dateInfo;
        let currentDate = new Date(startDate);

        while (currentDate <= endDate) {
          const day = currentDate.getDate();
          const month = currentDate.getMonth();
          const year = currentDate.getFullYear();

          // Find service record for this day
          const serviceRecord = monthlyServices.find(
            (s) =>
              s.day === day &&
              s.serviceProvided &&
              s.providerId === line.providerId,
          );

          if (!serviceRecord || !serviceRecord.documentationComplete) {
            missingDocumentation.push(
              `${currentDate.toLocaleDateString()} - ${line.providerName}`,
            );
          }

          // Move to next day
          currentDate.setDate(currentDate.getDate() + 1);
        }
      });

      if (missingDocumentation.length > 0) {
        // Only show first 5 missing dates to avoid overwhelming the user
        const displayMissing = missingDocumentation.slice(0, 5);
        const remainingCount = missingDocumentation.length - 5;

        const confirmSubmit = window.confirm(
          `Warning: Missing documentation for the following dates:\n\n${displayMissing.join("\n")}${remainingCount > 0 ? `\n...and ${remainingCount} more dates` : ""}\n\nContinuing may result in claim rejection. Do you want to proceed anyway?`,
        );

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
          const newClaim: ClaimStatus = {
            id: `offline-${Date.now()}`,
            claimNumber,
            submissionDate: new Date().toLocaleDateString(),
            status: "pending",
            amount: calculateTotalClaimAmount(),
            comments: "Pending online synchronization",
          };

          setClaimHistory((prev) => [newClaim, ...prev]);
          setSubmissionSuccess(true);
          if (onComplete) onComplete(true);

          // Show success message
          alert(
            "Claim saved for later sync when online connection is restored.\n\n" +
              "Claim Number: " +
              claimNumber +
              "\n" +
              "Please note this claim number for tracking purposes.",
          );
        } catch (offlineError) {
          console.error("Error saving offline claim:", offlineError);
          alert("Error saving claim for offline sync. Please try again.");
          setIsSubmitting(false);
        }
      } else {
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
            claimNumber: `DAMAN-CL-${new Date().getFullYear()}-${Math.floor(
              Math.random() * 100000,
            )}`,
            status: "in-review",
            message: "Claim received and under initial review",
            reviewer: "Daman Claims Department",
            submissionDate: new Date().toISOString(),
            estimatedProcessingCompletion: new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000,
            ).toISOString(), // 7 days from now
            amount: calculateTotalClaimAmount(),
          };

          // Add to claim history
          const newClaim: ClaimStatus = {
            id: response.id,
            claimNumber: response.claimNumber,
            submissionDate: new Date().toLocaleDateString(),
            status: "in-review",
            amount: response.amount,
            comments:
              response.message || "Claim received and under initial review",
            reviewer: response.reviewer || "Daman Claims Department",
          };

          setClaimHistory((prev) => [newClaim, ...prev]);
          setSubmissionSuccess(true);
          if (onComplete) onComplete(true);

          // Show success message with more details
          alert(
            "Claim successfully submitted to Daman.\n\n" +
              "Claim Number: " +
              response.claimNumber +
              "\n" +
              "Status: In Review\n" +
              "Estimated Processing Completion: " +
              new Date(
                response.estimatedProcessingCompletion,
              ).toLocaleDateString() +
              "\n\n" +
              "Total Claim Amount: AED " +
              response.amount.toFixed(2),
          );
        } catch (apiError: any) {
          console.error("Error submitting claim:", apiError);
          alert(
            `Error submitting claim: ${apiError.message || "Unknown error"}`,
          );
          setIsSubmitting(false);
        }
      }
    } catch (error: any) {
      console.error("Error submitting claim:", error);
      alert(
        `Error: ${error.message || "An unexpected error occurred. Please try again."}`,
      );
      if (onComplete) onComplete(false);
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
  const getStatusBadgeVariant = (status: ClaimStatus["status"]) => {
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
  const getStatusIcon = (status: ClaimStatus["status"]) => {
    switch (status) {
      case "paid":
        return <Banknote className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <FileX className="h-4 w-4 text-red-500" />;
      case "partial":
        return <Percent className="h-4 w-4 text-amber-500" />;
      case "returned":
        return <FileQuestion className="h-4 w-4 text-amber-500" />;
      case "in-review":
        return <FileSearch className="h-4 w-4 text-blue-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-gray-500" />;
      default:
        return <FileText className="h-4 w-4" />;
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      console.error("Error loading denial records:", error);
    }
  };

  // Helper functions for monthly service tracking
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const isToday = (day: number, month: number, year: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  // Helper function to check if a license is expiring soon (within 30 days)
  const isLicenseExpiringSoon = (expiryDate: string) => {
    if (!expiryDate) return false;

    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 && diffDays <= 30;
  };

  // Helper function to check if a license is valid for claims
  const isLicenseValidForClaims = (license: ClinicianLicense) => {
    if (
      license.licenseStatus !== "Active" &&
      license.licenseStatus !== "Pending Renewal"
    ) {
      return false;
    }

    const expiry = new Date(license.expiryDate);
    const today = new Date();
    return expiry > today;
  };

  // Helper function to get license status color
  const getLicenseStatusColor = (status: ClinicianLicense["licenseStatus"]) => {
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
    const invalidProviders: string[] = [];

    serviceLines.forEach((line) => {
      const providerLicense = clinicianLicenses.find(
        (license) =>
          license.clinicianName === line.providerName ||
          license.employeeId === line.providerId,
      );

      if (!providerLicense) {
        invalidProviders.push(`${line.providerName} (No license record found)`);
      } else if (!isLicenseValidForClaims(providerLicense)) {
        invalidProviders.push(
          `${line.providerName} (${providerLicense.licenseStatus} license)`,
        );
      }
    });

    return invalidProviders;
  };

  // Generate mock monthly service data
  const generateMockMonthlyData = (month: number, year: number) => {
    const daysInMonth = getDaysInMonth(month, year);
    const mockData: MonthlyServiceTracking[] = [];

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
          const serviceType =
            rand > 0.6
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
          const daysSinceService = Math.floor(
            (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
          );
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
        } else {
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
    const mockLicenses: ClinicianLicense[] = [
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
  const [claimsProcessingData, setClaimsProcessingData] = useState<{
    dailyClaimsGenerated: number;
    pendingValidation: number;
    readyForSubmission: number;
    validationIssues: { type: string; count: number; description: string }[];
  }>({
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
    } else if (activeTab === "denial-management") {
      loadDenialRecords();
    } else if (activeTab === "revenue-analytics") {
      loadRevenueMetrics();
    }
  }, [activeTab]);

  // Record payment
  const recordPayment = async (claimId: string, claimNumber: string) => {
    try {
      setIsSubmitting(true);

      // Get payment details from form
      const paymentAmount = parseFloat(
        prompt("Enter payment amount:", "0") || "0",
      );
      const paymentReference = prompt("Enter payment reference:", "") || "";
      const paymentMethod =
        prompt("Enter payment method:", "Bank Transfer") || "Bank Transfer";
      const paymentDate =
        prompt(
          "Enter payment date (YYYY-MM-DD):",
          new Date().toISOString().split("T")[0],
        ) || new Date().toISOString().split("T")[0];

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
      const paymentRecord: PaymentRecord = {
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

      alert(
        `Payment of AED ${paymentAmount.toFixed(2)} recorded successfully for claim ${claimNumber}.`,
      );
      setIsSubmitting(false);
    } catch (error: any) {
      console.error("Error recording payment:", error);
      alert(`Error recording payment: ${error.message || "Unknown error"}`);
      setIsSubmitting(false);
    }
  };

  // Record denial
  const recordDenial = async (claimId: string, claimNumber: string) => {
    try {
      setIsSubmitting(true);

      // Get denial details from form
      const denialReason = prompt("Enter denial reason:", "") || "";
      const denialCode = prompt("Enter denial code:", "") || "";
      const appealDeadline =
        prompt("Enter appeal deadline (YYYY-MM-DD):", "") || undefined;

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
      const denialRecord: DenialRecord = {
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
    } catch (error: any) {
      console.error("Error recording denial:", error);
      alert(`Error recording denial: ${error.message || "Unknown error"}`);
      setIsSubmitting(false);
    }
  };

  // Submit appeal
  const submitAppeal = async (denialId: string) => {
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
      const supportingDocs =
        prompt("Enter supporting documents (comma-separated):", "") || "";

      if (!appealNotes) {
        alert("Appeal notes are required.");
        setIsSubmitting(false);
        return;
      }

      // Update denial record
      const updatedDenialRecord = {
        ...denialRecord,
        appealStatus: "submitted" as const,
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
    } catch (error: any) {
      console.error("Error submitting appeal:", error);
      alert(`Error submitting appeal: ${error.message || "Unknown error"}`);
      setIsSubmitting(false);
    }
  };

  // Track claim status
  const trackClaim = async (claimNumber: string) => {
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
        } else {
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
          comments:
            Math.random() > 0.5
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
          estimatedCompletionDate: new Date(
            Date.now() + 5 * 24 * 60 * 60 * 1000,
          ).toISOString(), // 5 days from now
          trackingDetails: {
            claimId: `CL-${Math.floor(Math.random() * 100000)}`,
            receivedBy: "Daman Claims Processing Center",
            processingStage: "Financial Review",
            assignedReviewer: "Claims Processing Team",
            priorityLevel: "Standard",
            estimatedDecisionDate: new Date(
              Date.now() + 5 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            lastUpdated: new Date().toISOString(),
            documentVerificationStatus: "Complete",
            financialReviewStatus: "In Progress",
            paymentStatus: "Pending",
            appealEligible: false,
            trackingUrl: `https://provider.damanhealth.ae/claims/tracking/${claimNumber}`,
          },
        };

        // Find the claim in history
        const existingClaimIndex = claimHistory.findIndex(
          (c) => c.claimNumber === claimNumber,
        );

        if (existingClaimIndex >= 0) {
          // Update the claim with latest status
          const updatedHistory = [...claimHistory];
          updatedHistory[existingClaimIndex] = {
            ...updatedHistory[existingClaimIndex],
            status: statusResponse.status,
            comments:
              statusResponse.comments ||
              updatedHistory[existingClaimIndex].comments,
            reviewer:
              statusResponse.reviewer ||
              updatedHistory[existingClaimIndex].reviewer,
            reviewDate:
              statusResponse.reviewDate ||
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
              alert(
                `Tracking Information for ${claimNumber}:\n\n` +
                  `Processing Stage: ${trackingInfo.processingStage}\n` +
                  `Assigned Reviewer: ${trackingInfo.assignedReviewer}\n` +
                  `Priority Level: ${trackingInfo.priorityLevel}\n` +
                  `Estimated Decision Date: ${new Date(trackingInfo.estimatedDecisionDate).toLocaleDateString()}\n` +
                  `Document Verification: ${trackingInfo.documentVerificationStatus}\n` +
                  `Financial Review: ${trackingInfo.financialReviewStatus}\n` +
                  `Payment Status: ${trackingInfo.paymentStatus}\n\n` +
                  `For real-time updates, you can visit: ${trackingInfo.trackingUrl}`,
              );
            }, 500);
          }
        } else {
          // If not found in history, add it
          const newClaim: ClaimStatus = {
            id: statusResponse.id,
            claimNumber,
            submissionDate:
              statusResponse.submissionDate || new Date().toLocaleDateString(),
            status: statusResponse.status,
            amount: statusResponse.amount,
            comments:
              statusResponse.comments || "Status retrieved from Daman portal",
            reviewer: statusResponse.reviewer || "Not assigned",
            reviewDate: statusResponse.reviewDate,
          };

          setClaimHistory((prev) => [newClaim, ...prev]);
          setActiveTab("claim-tracking");
        }
      } catch (apiError: any) {
        console.error(`Error fetching status for ${claimNumber}:`, apiError);
        alert(`Error tracking claim: ${apiError.message || "Unknown error"}`);
      }

      setIsSubmitting(false);
    } catch (error: any) {
      console.error("Error tracking claim:", error);
      alert(
        `Error tracking claim ${claimNumber}: ${error.message || "Please try again."}`,
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-background">
      {submissionSuccess ? (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-xl text-center text-green-600">
              <CheckCircle className="h-12 w-12 mx-auto mb-2" />
              Claim Submission Complete
            </CardTitle>
            <CardDescription className="text-center">
              Your claim has been successfully{" "}
              {isOffline ? "saved for later submission" : "submitted to Daman"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-md">
              <p className="font-medium">Claim Reference:</p>
              <p className="text-sm">
                {isOffline ? "OFFLINE-" : ""}REF-
                {Math.random().toString(36).substring(2, 10).toUpperCase()}
              </p>
              <p className="font-medium mt-2">Submission Date:</p>
              <p className="text-sm">{new Date().toLocaleDateString()}</p>
              <p className="font-medium mt-2">Total Claim Amount:</p>
              <p className="text-sm">
                AED {calculateTotalClaimAmount().toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {isOffline
                  ? "This claim will be processed when your device reconnects to the internet."
                  : "You will receive a notification when Daman processes this claim."}
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={handleReset}>Submit Another Claim</Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold">Claims Submission</h2>
              <p className="text-muted-foreground">
                Prepare and submit claims to Daman insurance
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={isOffline ? "destructive" : "outline"}
                className="text-xs"
              >
                {isOffline ? "Offline Mode" : "Online"}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Patient ID: {patientId}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Episode: {episodeId}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Auth: {authorizationId}
              </Badge>
            </div>
          </div>

          {/* Tabs for different sections of the claims process */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-9">
              <TabsTrigger value="claim-assembly">
                <FileText className="h-4 w-4 mr-2" />
                Claim Assembly
              </TabsTrigger>
              <TabsTrigger value="claim-tracking">
                <FileSearch className="h-4 w-4 mr-2" />
                Claim Tracking
              </TabsTrigger>
              <TabsTrigger value="claim-history">
                <History className="h-4 w-4 mr-2" />
                Claim History
              </TabsTrigger>
              <TabsTrigger value="daily-claims">
                <FileBarChart className="h-4 w-4 mr-2" />
                Daily Claims
              </TabsTrigger>
              <TabsTrigger value="monthly-service-tracking">
                <CalendarDays className="h-4 w-4 mr-2" />
                Monthly Services
              </TabsTrigger>
              <TabsTrigger value="clinician-licenses">
                <BadgeCheck className="h-4 w-4 mr-2" />
                Clinician Licenses
              </TabsTrigger>
              <TabsTrigger value="payment-reconciliation">
                <DollarSign className="h-4 w-4 mr-2" />
                Payment Reconciliation
              </TabsTrigger>
              <TabsTrigger value="denial-management">
                <FileX className="h-4 w-4 mr-2" />
                Denial Management
              </TabsTrigger>
              <TabsTrigger value="claims-audit">
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Claims Audit
              </TabsTrigger>
            </TabsList>

            {/* Claim Assembly Tab */}
            <TabsContent value="claim-assembly" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Claim Details Form */}
                <Card className="lg:col-span-3 mb-6">
                  <CardHeader>
                    <CardTitle>Claim Details</CardTitle>
                    <CardDescription>
                      Provide details for the claim submission
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="claimType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Claim Type</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select claim type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="initial">
                                      Initial Claim
                                    </SelectItem>
                                    <SelectItem value="follow-up">
                                      Follow-up Claim
                                    </SelectItem>
                                    <SelectItem value="adjustment">
                                      Adjustment Claim
                                    </SelectItem>
                                    <SelectItem value="final">
                                      Final Claim
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="billingPeriod"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Billing Period</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select billing period" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="current-month">
                                      Current Month (Jan 20 - Feb 19, 2024)
                                    </SelectItem>
                                    <SelectItem value="previous-month">
                                      Previous Month (Dec 20 - Jan 19, 2024)
                                    </SelectItem>
                                    <SelectItem value="custom">
                                      Custom Date Range
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="includeAllServices"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>
                                    Include all authorized services
                                  </FormLabel>
                                  <FormDescription>
                                    Automatically include all services from the
                                    authorization
                                  </FormDescription>
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>

                        <div>
                          <FormField
                            control={form.control}
                            name="claimNotes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Claim Notes</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Add any notes or special instructions for this claim"
                                    className="min-h-[150px]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Include any special circumstances,
                                  explanations, or additional information
                                  relevant to this claim
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </Form>
                  </CardContent>
                </Card>

                {/* Service Lines */}
                <Card className="lg:col-span-3 mb-6">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Service Lines</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddServiceLine}
                      >
                        Add Service Line
                      </Button>
                    </div>
                    <CardDescription>
                      Add all services provided during the billing period
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {serviceLines.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No service lines added. Click "Add Service Line" to
                          begin.
                        </div>
                      ) : (
                        serviceLines.map((line) => (
                          <div
                            key={line.id}
                            className="border rounded-md p-4 space-y-4"
                          >
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium">
                                Service Line:{" "}
                                {line.serviceDescription || "New Service"}
                              </h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveServiceLine(line.id)}
                              >
                                <FileX className="h-4 w-4" />
                                Remove
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`service-code-${line.id}`}>
                                  Service Code
                                </Label>
                                <Input
                                  id={`service-code-${line.id}`}
                                  value={line.serviceCode}
                                  onChange={(e) =>
                                    handleUpdateServiceLine(
                                      line.id,
                                      "serviceCode",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="e.g. HN001"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`service-desc-${line.id}`}>
                                  Service Description
                                </Label>
                                <Input
                                  id={`service-desc-${line.id}`}
                                  value={line.serviceDescription}
                                  onChange={(e) =>
                                    handleUpdateServiceLine(
                                      line.id,
                                      "serviceDescription",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="e.g. Home Nursing Visit"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`date-of-service-${line.id}`}>
                                  Date of Service
                                </Label>
                                <Input
                                  id={`date-of-service-${line.id}`}
                                  value={line.dateOfService}
                                  onChange={(e) =>
                                    handleUpdateServiceLine(
                                      line.id,
                                      "dateOfService",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="e.g. Jan 20 - Feb 19, 2024"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`quantity-${line.id}`}>
                                  Quantity
                                </Label>
                                <Input
                                  id={`quantity-${line.id}`}
                                  type="number"
                                  value={line.quantity}
                                  onChange={(e) =>
                                    handleUpdateServiceLine(
                                      line.id,
                                      "quantity",
                                      parseInt(e.target.value) || 0,
                                    )
                                  }
                                  min="0"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`unit-price-${line.id}`}>
                                  Unit Price (AED)
                                </Label>
                                <Input
                                  id={`unit-price-${line.id}`}
                                  type="number"
                                  value={line.unitPrice}
                                  onChange={(e) =>
                                    handleUpdateServiceLine(
                                      line.id,
                                      "unitPrice",
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
                                  min="0"
                                  step="0.01"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`total-amount-${line.id}`}>
                                  Total Amount (AED)
                                </Label>
                                <Input
                                  id={`total-amount-${line.id}`}
                                  value={line.totalAmount.toFixed(2)}
                                  readOnly
                                  className="bg-muted"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`provider-id-${line.id}`}>
                                  Provider ID
                                </Label>
                                <Input
                                  id={`provider-id-${line.id}`}
                                  value={line.providerId}
                                  onChange={(e) =>
                                    handleUpdateServiceLine(
                                      line.id,
                                      "providerId",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="e.g. N12345"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`provider-name-${line.id}`}>
                                  Provider Name
                                </Label>
                                <Input
                                  id={`provider-name-${line.id}`}
                                  value={line.providerName}
                                  onChange={(e) =>
                                    handleUpdateServiceLine(
                                      line.id,
                                      "providerName",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="e.g. Nurse Sarah Ahmed"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`auth-ref-${line.id}`}>
                                  Authorization Reference
                                </Label>
                                <Input
                                  id={`auth-ref-${line.id}`}
                                  value={line.authorizationReference || ""}
                                  onChange={(e) =>
                                    handleUpdateServiceLine(
                                      line.id,
                                      "authorizationReference",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="e.g. AUTH-12345"
                                />
                              </div>
                            </div>
                          </div>
                        ))
                      )}

                      {serviceLines.length > 0 && (
                        <div className="bg-muted p-4 rounded-md mt-4">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">
                              Total Claim Amount:
                            </span>
                            <span className="font-bold text-lg">
                              AED {calculateTotalClaimAmount().toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Main Content - Takes 2/3 of space on large screens */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Document Assembly</CardTitle>
                      <Badge variant="outline">
                        {submissionProgress}% Complete
                      </Badge>
                    </div>
                    <CardDescription>
                      Upload all required documents for claim submission
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px] pr-4">
                      <div className="space-y-6">
                        {documents.map((doc) => (
                          <div key={doc.id} className="border rounded-md p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2">
                                <div className="bg-muted p-2 rounded-md">
                                  {doc.icon}
                                </div>
                                <div>
                                  <p className="font-medium">{doc.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {doc.description}
                                  </p>
                                </div>
                              </div>
                              <Badge
                                variant={doc.required ? "default" : "outline"}
                                className="text-xs"
                              >
                                {doc.required ? "Required" : "Optional"}
                              </Badge>
                            </div>
                            <div className="mt-4 flex flex-col space-y-2">
                              {doc.uploaded ? (
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center text-green-600 text-sm">
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Document uploaded
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        // In a real implementation, this would preview the document
                                        if (doc.file) {
                                          const url = URL.createObjectURL(
                                            doc.file,
                                          );
                                          window.open(url, "_blank");
                                        } else {
                                          alert(
                                            "Preview not available for this document",
                                          );
                                        }
                                      }}
                                    >
                                      Preview
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleDocumentUpload(doc.id)
                                      }
                                    >
                                      Replace
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between">
                                  <div className="text-sm text-muted-foreground">
                                    {doc.required
                                      ? "Required document"
                                      : "Optional document"}
                                  </div>
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => handleDocumentUpload(doc.id)}
                                  >
                                    <Upload className="h-4 w-4 mr-1" />
                                    Upload
                                  </Button>
                                </div>
                              )}

                              {doc.uploaded && doc.file && (
                                <div className="bg-muted rounded p-2 text-xs">
                                  <div className="flex justify-between">
                                    <span className="font-medium">
                                      {doc.file.name}
                                    </span>
                                    <span>
                                      {(doc.fileSize! / 1024).toFixed(1)} KB
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-muted-foreground mt-1">
                                    <span>
                                      Uploaded:{" "}
                                      {new Date(
                                        doc.uploadDate!,
                                      ).toLocaleString()}
                                    </span>
                                    <span>Type: {doc.fileType}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4">
                    <Button variant="outline" onClick={handleReset}>
                      Reset
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting || submissionProgress < 100}
                    >
                      {isSubmitting
                        ? "Submitting..."
                        : isOffline
                          ? "Save for Later"
                          : "Submit Claim"}
                    </Button>
                  </CardFooter>
                </Card>

                {/* Sidebar - Takes 1/3 of space on large screens */}
                <div className="space-y-6">
                  {/* Submission Progress */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        Submission Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${submissionProgress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{submissionProgress}% Complete</span>
                          <span>{100 - submissionProgress}% Remaining</span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                Required Documents
                              </span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {
                                documents.filter(
                                  (d) => d.required && d.uploaded,
                                ).length
                              }
                              /{documents.filter((d) => d.required).length}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                Optional Documents
                              </span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {
                                documents.filter(
                                  (d) => !d.required && d.uploaded,
                                ).length
                              }
                              /{documents.filter((d) => !d.required).length}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Authorization Details */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        Authorization Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">Reference:</span>
                          <span>{authorizationDetails.referenceNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Approval Date:</span>
                          <span>{authorizationDetails.approvalDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Effective Date:</span>
                          <span>{authorizationDetails.effectiveDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Expiration Date:</span>
                          <span>{authorizationDetails.expirationDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Duration:</span>
                          <span>
                            {authorizationDetails.approvedDuration} days
                          </span>
                        </div>
                        <Separator className="my-2" />
                        <div>
                          <p className="font-medium mb-1">Approved Services:</p>
                          <ul className="list-disc pl-5 space-y-1">
                            {Object.entries(
                              authorizationDetails.approvedFrequency,
                            ).map(([service, frequency]) => (
                              <li key={service}>
                                {service.charAt(0).toUpperCase() +
                                  service.slice(1)}
                                : {frequency}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Submission Guidelines */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        Submission Guidelines
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <p>• Accepted formats: PDF, DOC, DOCX, JPG, PNG</p>
                        <p>• Maximum file size: 5MB per document</p>
                        <p>
                          • Claims must be submitted within 30 days of service
                        </p>
                        <p>• All service lines must match authorization</p>
                        <p>
                          • Service logs must be signed by both provider and
                          patient
                        </p>
                        <p>• Ensure all documents are clear and legible</p>
                        <p>• Documents must comply with DOH standards</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          For assistance, contact the Insurance Coding
                          Department at ext. 4567
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Claim Tracking Tab */}
            <TabsContent value="claim-tracking" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Claim Tracking</CardTitle>
                  <CardDescription>
                    Track the status of your claim submissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="tracking-reference">Claim Number</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            id="tracking-reference"
                            placeholder="Enter claim number"
                            defaultValue="DAMAN-CL-2024-00456"
                          />
                          <Button
                            onClick={() => trackClaim("DAMAN-CL-2024-00456")}
                          >
                            Track
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="tracking-status">Current Status</Label>
                        <div className="flex items-center gap-2 mt-3">
                          <FileSearch className="h-5 w-5 text-blue-500" />
                          <span className="font-medium">In Review</span>
                          <Badge variant="secondary" className="ml-2">
                            Updated 2 hours ago
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Claim timeline */}
                    <div>
                      <h3 className="font-medium mb-2">Claim Timeline</h3>
                      <div className="space-y-4">
                        <div className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="w-0.5 h-full bg-muted" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">Claim Received</p>
                              <Badge variant="outline" className="text-xs">
                                15 Feb 2024, 09:15
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Claim request received by Daman
                            </p>
                            <div className="mt-2 bg-green-50 p-2 rounded-md text-xs">
                              <p className="font-medium text-green-700">
                                Processing Details:
                              </p>
                              <p className="text-green-600">
                                Claim validated and assigned tracking ID:
                                CL-12345. All required documents received.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="w-0.5 h-full bg-muted" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">
                                Initial Verification
                              </p>
                              <Badge variant="outline" className="text-xs">
                                15 Feb 2024, 11:30
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Document verification completed
                            </p>
                            <div className="mt-2 bg-green-50 p-2 rounded-md text-xs">
                              <p className="font-medium text-green-700">
                                Verification Results:
                              </p>
                              <p className="text-green-600">
                                All required documents verified. Service logs
                                match authorization. Claim passed to financial
                                review team.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                              <FileSearch className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="w-0.5 h-full bg-muted" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">Financial Review</p>
                              <Badge variant="outline" className="text-xs">
                                16 Feb 2024, 09:45
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Under review by Financial Department
                            </p>
                            <div className="mt-2 bg-blue-50 p-2 rounded-md text-xs">
                              <p className="font-medium text-blue-700">
                                Review Notes:
                              </p>
                              <p className="text-blue-600">
                                Financial assessment in progress. Verifying
                                service rates and quantities against contract
                                terms. Expected completion by EOD.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center">
                              <Clock className="h-4 w-4 text-gray-600" />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-muted-foreground">
                                Payment Processing
                              </p>
                              <Badge variant="outline" className="text-xs">
                                Pending
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Expected by 22 Feb 2024
                            </p>
                            <div className="mt-2 bg-gray-50 p-2 rounded-md text-xs">
                              <p className="font-medium text-gray-700">
                                Next Steps:
                              </p>
                              <p className="text-gray-600">
                                Financial review → Payment approval → Payment
                                processing. Estimated completion within 5-7
                                business days.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Claim details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-medium mb-2">Processing Details</h3>
                        <div className="bg-white border rounded-md p-4 space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">
                              Tracking ID:
                            </span>
                            <span className="text-sm">CL-12345</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">
                              Priority Level:
                            </span>
                            <span className="text-sm">Standard</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">
                              Assigned Reviewer:
                            </span>
                            <span className="text-sm">
                              Claims Processing Team
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">
                              Processing Stage:
                            </span>
                            <span className="text-sm">Financial Review</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">
                              Est. Completion:
                            </span>
                            <span className="text-sm">22 Feb 2024</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">
                              Last Updated:
                            </span>
                            <span className="text-sm">16 Feb 2024, 09:45</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium mb-2">
                          Financial Information
                        </h3>
                        <div className="bg-white border border-gray-200 p-4 rounded-md">
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">
                                Total Claim Amount:
                              </span>
                              <span className="text-sm">AED 11,100.00</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">
                                Service Lines:
                              </span>
                              <span className="text-sm">2</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">
                                Expected Payment:
                              </span>
                              <span className="text-sm">AED 11,100.00</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">
                                Payment Status:
                              </span>
                              <span className="text-sm">Pending</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">
                                Expected Payment Date:
                              </span>
                              <span className="text-sm">22-25 Feb 2024</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Escalation options */}
                    <div>
                      <h3 className="font-medium mb-2">Escalation Options</h3>
                      <div className="bg-gray-50 border rounded-md p-4">
                        <p className="text-sm mb-3">
                          If you need to escalate this claim due to urgency or
                          delays:
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              Claims Department:
                            </span>
                            <span className="text-sm">+971-2-614-9555</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Email:</span>
                            <span className="text-sm">
                              claims.support@damanhealth.ae
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              Reference:
                            </span>
                            <span className="text-sm">DAMAN-CL-2024-00456</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              Escalation Criteria:
                            </span>
                            <span className="text-sm">
                              Payment delay, incorrect processing
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <Button variant="outline">
                    <FileUp className="h-4 w-4 mr-2" />
                    Upload Additional Documents
                  </Button>
                  <Button>
                    <Send className="h-4 w-4 mr-2" />
                    Contact Claims Department
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Claim History Tab */}
            <TabsContent value="claim-history" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Claim History</CardTitle>
                  <CardDescription>
                    View and manage your previous claim submissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-4">
                      {claimHistory.map((claim) => (
                        <div key={claim.id} className="border rounded-md p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(claim.status)}
                                <h3 className="font-medium">
                                  {claim.claimNumber}
                                </h3>
                                <Badge
                                  variant={getStatusBadgeVariant(claim.status)}
                                >
                                  {claim.status === "paid"
                                    ? "Paid"
                                    : claim.status === "rejected"
                                      ? "Rejected"
                                      : claim.status === "partial"
                                        ? "Partially Paid"
                                        : claim.status === "returned"
                                          ? "Returned"
                                          : claim.status === "in-review"
                                            ? "In Review"
                                            : "Pending"}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                Submitted: {claim.submissionDate} | Amount: AED{" "}
                                {claim.amount.toFixed(2)}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => trackClaim(claim.claimNumber)}
                              >
                                View Details
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => trackClaim(claim.claimNumber)}
                              >
                                Track
                              </Button>
                            </div>
                          </div>

                          <div className="mt-3 bg-muted p-3 rounded-md">
                            <p className="text-sm">
                              <span className="font-medium">Status: </span>
                              {claim.comments}
                            </p>
                            {claim.paidAmount && (
                              <p className="text-sm mt-1">
                                <span className="font-medium">
                                  Payment: AED {claim.paidAmount.toFixed(2)}
                                </span>
                                {claim.paymentDate && (
                                  <span className="ml-2">
                                    on {claim.paymentDate}
                                  </span>
                                )}
                                {claim.paymentReference && (
                                  <span className="ml-2">
                                    (Ref: {claim.paymentReference})
                                  </span>
                                )}
                              </p>
                            )}
                          </div>

                          <div className="mt-3 flex gap-2">
                            {claim.status === "paid" && (
                              <Button size="sm" variant="outline">
                                <Receipt className="h-4 w-4 mr-1" />
                                Download Receipt
                              </Button>
                            )}
                            {claim.status === "rejected" && (
                              <Button size="sm" variant="outline">
                                <FileUp className="h-4 w-4 mr-1" />
                                Resubmit
                              </Button>
                            )}
                            {claim.status === "returned" && (
                              <Button size="sm">
                                <FileUp className="h-4 w-4 mr-1" />
                                Upload Additional Info
                              </Button>
                            )}
                            {claim.status === "in-review" && (
                              <Button size="sm" variant="outline">
                                <FileSearch className="h-4 w-4 mr-1" />
                                Track Status
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {claimHistory.length} claims from the last 90 days
                  </div>
                  <Button variant="outline">
                    <BarChart className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Monthly Service Tracking Tab */}
            <TabsContent value="monthly-service-tracking" className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Monthly Service Tracking</CardTitle>
                      <CardDescription>
                        Track daily service delivery and documentation
                        compliance
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newMonth =
                            currentMonth === 0 ? 11 : currentMonth - 1;
                          const newYear =
                            currentMonth === 0 ? currentYear - 1 : currentYear;
                          setCurrentMonth(newMonth);
                          setCurrentYear(newYear);
                          // In a real app, this would load data for the new month
                          generateMockMonthlyData(newMonth, newYear);
                        }}
                      >
                        Previous Month
                      </Button>
                      <div className="font-medium">
                        {new Date(currentYear, currentMonth).toLocaleString(
                          "default",
                          { month: "long", year: "numeric" },
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newMonth =
                            currentMonth === 11 ? 0 : currentMonth + 1;
                          const newYear =
                            currentMonth === 11 ? currentYear + 1 : currentYear;
                          setCurrentMonth(newMonth);
                          setCurrentYear(newYear);
                          // In a real app, this would load data for the new month
                          generateMockMonthlyData(newMonth, newYear);
                        }}
                      >
                        Next Month
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-muted">
                          <th className="p-2 text-left">Day</th>
                          <th className="p-2 text-left">Service Provided</th>
                          <th className="p-2 text-left">Service Type</th>
                          <th className="p-2 text-left">Provider</th>
                          <th className="p-2 text-left">Documentation</th>
                          <th className="p-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({
                          length: getDaysInMonth(currentMonth, currentYear),
                        }).map((_, index) => {
                          const day = index + 1;
                          const service = monthlyServices.find(
                            (s) => s.day === day,
                          ) || {
                            day,
                            serviceProvided: false,
                            documentationComplete: false,
                          };

                          return (
                            <tr
                              key={day}
                              className={`border-b ${isToday(day, currentMonth, currentYear) ? "bg-blue-50" : ""}`}
                            >
                              <td className="p-2">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`font-medium ${isToday(day, currentMonth, currentYear) ? "text-blue-600" : ""}`}
                                  >
                                    {day}
                                  </span>
                                  {isToday(day, currentMonth, currentYear) && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      Today
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              <td className="p-2">
                                <div className="flex items-center">
                                  <Checkbox
                                    checked={service.serviceProvided}
                                    onCheckedChange={(checked) => {
                                      const updatedServices = [
                                        ...monthlyServices,
                                      ];
                                      const serviceIndex =
                                        updatedServices.findIndex(
                                          (s) => s.day === day,
                                        );

                                      if (serviceIndex >= 0) {
                                        updatedServices[serviceIndex] = {
                                          ...updatedServices[serviceIndex],
                                          serviceProvided: checked === true,
                                        };
                                      } else {
                                        updatedServices.push({
                                          day,
                                          serviceProvided: checked === true,
                                          documentationComplete: false,
                                        });
                                      }

                                      setMonthlyServices(updatedServices);
                                    }}
                                  />
                                </div>
                              </td>
                              <td className="p-2">
                                {service.serviceProvided ? (
                                  <Select
                                    value={service.serviceType || ""}
                                    onValueChange={(value) => {
                                      const updatedServices = [
                                        ...monthlyServices,
                                      ];
                                      const serviceIndex =
                                        updatedServices.findIndex(
                                          (s) => s.day === day,
                                        );

                                      if (serviceIndex >= 0) {
                                        updatedServices[serviceIndex] = {
                                          ...updatedServices[serviceIndex],
                                          serviceType: value,
                                        };
                                      }

                                      setMonthlyServices(updatedServices);
                                    }}
                                  >
                                    <SelectTrigger className="w-[180px]">
                                      <SelectValue placeholder="Select service" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="nursing">
                                        Home Nursing
                                      </SelectItem>
                                      <SelectItem value="physiotherapy">
                                        Physiotherapy
                                      </SelectItem>
                                      <SelectItem value="occupational">
                                        Occupational Therapy
                                      </SelectItem>
                                      <SelectItem value="speech">
                                        Speech Therapy
                                      </SelectItem>
                                      <SelectItem value="respiratory">
                                        Respiratory Therapy
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <span className="text-muted-foreground text-sm">
                                    N/A
                                  </span>
                                )}
                              </td>
                              <td className="p-2">
                                {service.serviceProvided ? (
                                  <Select
                                    value={service.providerId || ""}
                                    onValueChange={(value) => {
                                      const updatedServices = [
                                        ...monthlyServices,
                                      ];
                                      const serviceIndex =
                                        updatedServices.findIndex(
                                          (s) => s.day === day,
                                        );

                                      if (serviceIndex >= 0) {
                                        const providerName =
                                          value === "N12345"
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
                                    }}
                                  >
                                    <SelectTrigger className="w-[180px]">
                                      <SelectValue placeholder="Select provider" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="N12345">
                                        Sarah Ahmed (Nurse)
                                      </SelectItem>
                                      <SelectItem value="PT6789">
                                        Ali Hassan (PT)
                                      </SelectItem>
                                      <SelectItem value="OT4567">
                                        Fatima Al Zaabi (OT)
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <span className="text-muted-foreground text-sm">
                                    N/A
                                  </span>
                                )}
                              </td>
                              <td className="p-2">
                                {service.serviceProvided ? (
                                  <div className="flex items-center gap-2">
                                    <Checkbox
                                      checked={service.documentationComplete}
                                      onCheckedChange={(checked) => {
                                        const updatedServices = [
                                          ...monthlyServices,
                                        ];
                                        const serviceIndex =
                                          updatedServices.findIndex(
                                            (s) => s.day === day,
                                          );

                                        if (serviceIndex >= 0) {
                                          updatedServices[serviceIndex] = {
                                            ...updatedServices[serviceIndex],
                                            documentationComplete:
                                              checked === true,
                                            documentationId:
                                              checked === true
                                                ? `DOC-${day}-${currentMonth + 1}-${currentYear}`
                                                : undefined,
                                          };
                                        }

                                        setMonthlyServices(updatedServices);
                                      }}
                                    />
                                    <span
                                      className={
                                        service.documentationComplete
                                          ? "text-green-600 text-sm"
                                          : "text-amber-600 text-sm"
                                      }
                                    >
                                      {service.documentationComplete
                                        ? "Complete"
                                        : "Pending"}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground text-sm">
                                    N/A
                                  </span>
                                )}
                              </td>
                              <td className="p-2">
                                {service.serviceProvided && (
                                  <div className="flex gap-2">
                                    <Button variant="outline" size="sm">
                                      <FileText className="h-4 w-4 mr-1" />
                                      {service.documentationComplete
                                        ? "View"
                                        : "Add"}{" "}
                                      Documentation
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                      <ClipboardEdit className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <div>
                    <div className="text-sm font-medium">Monthly Summary</div>
                    <div className="flex gap-4 mt-2">
                      <div className="text-sm">
                        <span className="font-medium">Services Provided:</span>{" "}
                        {
                          monthlyServices.filter((s) => s.serviceProvided)
                            .length
                        }
                        /{getDaysInMonth(currentMonth, currentYear)}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">
                          Documentation Complete:
                        </span>{" "}
                        {
                          monthlyServices.filter((s) => s.documentationComplete)
                            .length
                        }
                        /
                        {
                          monthlyServices.filter((s) => s.serviceProvided)
                            .length
                        }
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Compliance Rate:</span>{" "}
                        {monthlyServices.filter((s) => s.serviceProvided)
                          .length > 0
                          ? Math.round(
                              (monthlyServices.filter(
                                (s) => s.documentationComplete,
                              ).length /
                                monthlyServices.filter((s) => s.serviceProvided)
                                  .length) *
                                100,
                            )
                          : 0}
                        %
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Export to Excel
                    </Button>
                    <Button>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Clinician Licenses Tab */}
            <TabsContent value="clinician-licenses" className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Clinician Licenses Management</CardTitle>
                      <CardDescription>
                        Track and manage clinician licenses and compliance
                        status
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => {
                        setSelectedLicense(null);
                        setLicenseFormMode("add");
                        setShowLicenseForm(true);
                      }}
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Add New License
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {showLicenseForm ? (
                    <div className="border rounded-md p-4">
                      <h3 className="text-lg font-medium mb-4">
                        {licenseFormMode === "add"
                          ? "Add New License"
                          : "Edit License"}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="clinician-name">Clinician Name</Label>
                          <Input
                            id="clinician-name"
                            placeholder="Full name"
                            value={selectedLicense?.clinicianName || ""}
                            onChange={(e) =>
                              setSelectedLicense((prev) =>
                                prev
                                  ? { ...prev, clinicianName: e.target.value }
                                  : null,
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="employee-id">Employee ID</Label>
                          <Input
                            id="employee-id"
                            placeholder="Employee ID"
                            value={selectedLicense?.employeeId || ""}
                            onChange={(e) =>
                              setSelectedLicense((prev) =>
                                prev
                                  ? { ...prev, employeeId: e.target.value }
                                  : null,
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="role">Role</Label>
                          <Select
                            value={selectedLicense?.role || ""}
                            onValueChange={(value) =>
                              setSelectedLicense((prev) =>
                                prev ? { ...prev, role: value } : null,
                              )
                            }
                          >
                            <SelectTrigger id="role">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Nurse">Nurse</SelectItem>
                              <SelectItem value="Physician">
                                Physician
                              </SelectItem>
                              <SelectItem value="PT">
                                Physical Therapist
                              </SelectItem>
                              <SelectItem value="OT">
                                Occupational Therapist
                              </SelectItem>
                              <SelectItem value="ST">
                                Speech Therapist
                              </SelectItem>
                              <SelectItem value="RT">
                                Respiratory Therapist
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="department">Department</Label>
                          <Select
                            value={selectedLicense?.department || ""}
                            onValueChange={(value) =>
                              setSelectedLicense((prev) =>
                                prev ? { ...prev, department: value } : null,
                              )
                            }
                          >
                            <SelectTrigger id="department">
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Nursing">Nursing</SelectItem>
                              <SelectItem value="Medical">Medical</SelectItem>
                              <SelectItem value="Therapy">Therapy</SelectItem>
                              <SelectItem value="Respiratory">
                                Respiratory
                              </SelectItem>
                              <SelectItem value="Administration">
                                Administration
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="license-number">License Number</Label>
                          <Input
                            id="license-number"
                            placeholder="License number"
                            value={selectedLicense?.licenseNumber || ""}
                            onChange={(e) =>
                              setSelectedLicense((prev) =>
                                prev
                                  ? { ...prev, licenseNumber: e.target.value }
                                  : null,
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="license-type">License Type</Label>
                          <Select
                            value={selectedLicense?.licenseType || ""}
                            onValueChange={(value) =>
                              setSelectedLicense((prev) =>
                                prev ? { ...prev, licenseType: value } : null,
                              )
                            }
                          >
                            <SelectTrigger id="license-type">
                              <SelectValue placeholder="Select license type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="DOH">DOH License</SelectItem>
                              <SelectItem value="MOH">MOH License</SelectItem>
                              <SelectItem value="DHA">DHA License</SelectItem>
                              <SelectItem value="International">
                                International License
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="issuing-authority">
                            Issuing Authority
                          </Label>
                          <Input
                            id="issuing-authority"
                            placeholder="Issuing authority"
                            value={selectedLicense?.issuingAuthority || ""}
                            onChange={(e) =>
                              setSelectedLicense((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      issuingAuthority: e.target.value,
                                    }
                                  : null,
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="issue-date">Issue Date</Label>
                          <Input
                            id="issue-date"
                            type="date"
                            value={selectedLicense?.issueDate || ""}
                            onChange={(e) =>
                              setSelectedLicense((prev) =>
                                prev
                                  ? { ...prev, issueDate: e.target.value }
                                  : null,
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="expiry-date">Expiry Date</Label>
                          <Input
                            id="expiry-date"
                            type="date"
                            value={selectedLicense?.expiryDate || ""}
                            onChange={(e) =>
                              setSelectedLicense((prev) =>
                                prev
                                  ? { ...prev, expiryDate: e.target.value }
                                  : null,
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="license-status">License Status</Label>
                          <Select
                            value={selectedLicense?.licenseStatus || "Active"}
                            onValueChange={(
                              value:
                                | "Active"
                                | "Expired"
                                | "Suspended"
                                | "Pending Renewal",
                            ) =>
                              setSelectedLicense((prev) =>
                                prev ? { ...prev, licenseStatus: value } : null,
                              )
                            }
                          >
                            <SelectTrigger id="license-status">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Active">Active</SelectItem>
                              <SelectItem value="Expired">Expired</SelectItem>
                              <SelectItem value="Suspended">
                                Suspended
                              </SelectItem>
                              <SelectItem value="Pending Renewal">
                                Pending Renewal
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="renewal-notification">
                            Renewal Notification Date
                          </Label>
                          <Input
                            id="renewal-notification"
                            type="date"
                            value={
                              selectedLicense?.renewalNotificationDate || ""
                            }
                            onChange={(e) =>
                              setSelectedLicense((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      renewalNotificationDate: e.target.value,
                                    }
                                  : null,
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2 flex items-center">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="renewal-initiated"
                              checked={
                                selectedLicense?.renewalInitiated || false
                              }
                              onCheckedChange={(checked) =>
                                setSelectedLicense((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        renewalInitiated: checked === true,
                                      }
                                    : null,
                                )
                              }
                            />
                            <Label htmlFor="renewal-initiated">
                              Renewal Initiated
                            </Label>
                          </div>
                        </div>
                        <div className="space-y-2 flex items-center">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="renewal-completed"
                              checked={
                                selectedLicense?.renewalCompleted || false
                              }
                              onCheckedChange={(checked) =>
                                setSelectedLicense((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        renewalCompleted: checked === true,
                                      }
                                    : null,
                                )
                              }
                            />
                            <Label htmlFor="renewal-completed">
                              Renewal Completed
                            </Label>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="renewal-completion-date">
                            Renewal Completion Date
                          </Label>
                          <Input
                            id="renewal-completion-date"
                            type="date"
                            value={selectedLicense?.renewalCompletionDate || ""}
                            onChange={(e) =>
                              setSelectedLicense((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      renewalCompletionDate: e.target.value,
                                    }
                                  : null,
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2 flex items-center">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="continuing-education"
                              checked={
                                selectedLicense?.continuingEducationCompleted ||
                                false
                              }
                              onCheckedChange={(checked) =>
                                setSelectedLicense((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        continuingEducationCompleted:
                                          checked === true,
                                      }
                                    : null,
                                )
                              }
                            />
                            <Label htmlFor="continuing-education">
                              Continuing Education Completed
                            </Label>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="education-hours">
                            Continuing Education Hours
                          </Label>
                          <Input
                            id="education-hours"
                            type="number"
                            value={
                              selectedLicense?.continuingEducationHours || ""
                            }
                            onChange={(e) =>
                              setSelectedLicense((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      continuingEducationHours:
                                        parseInt(e.target.value) || undefined,
                                    }
                                  : null,
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="compliance-status">
                            Compliance Status
                          </Label>
                          <Select
                            value={
                              selectedLicense?.complianceStatus || "Compliant"
                            }
                            onValueChange={(
                              value:
                                | "Compliant"
                                | "Non-Compliant"
                                | "Under Review",
                            ) =>
                              setSelectedLicense((prev) =>
                                prev
                                  ? { ...prev, complianceStatus: value }
                                  : null,
                              )
                            }
                          >
                            <SelectTrigger id="compliance-status">
                              <SelectValue placeholder="Select compliance status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Compliant">
                                Compliant
                              </SelectItem>
                              <SelectItem value="Non-Compliant">
                                Non-Compliant
                              </SelectItem>
                              <SelectItem value="Under Review">
                                Under Review
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2 flex items-center">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="active-for-claims"
                              checked={
                                selectedLicense?.currentlyActiveForClaims ||
                                true
                              }
                              onCheckedChange={(checked) =>
                                setSelectedLicense((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        currentlyActiveForClaims:
                                          checked === true,
                                      }
                                    : null,
                                )
                              }
                            />
                            <Label htmlFor="active-for-claims">
                              Currently Active for Claims
                            </Label>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-6">
                        <Button
                          variant="outline"
                          onClick={() => setShowLicenseForm(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => {
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
                              } else {
                                // Update existing license
                                setClinicianLicenses(
                                  clinicianLicenses.map((license) =>
                                    license.id === selectedLicense.id
                                      ? selectedLicense
                                      : license,
                                  ),
                                );
                              }
                              setShowLicenseForm(false);
                            }
                          }}
                        >
                          {licenseFormMode === "add"
                            ? "Add License"
                            : "Update License"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Input
                          placeholder="Search licenses..."
                          className="max-w-sm"
                        />
                        <div className="flex gap-2">
                          <Select defaultValue="all">
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Statuses</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="expired">Expired</SelectItem>
                              <SelectItem value="pending">
                                Pending Renewal
                              </SelectItem>
                              <SelectItem value="suspended">
                                Suspended
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <Select defaultValue="all">
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Filter by role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Roles</SelectItem>
                              <SelectItem value="nurse">Nurse</SelectItem>
                              <SelectItem value="physician">
                                Physician
                              </SelectItem>
                              <SelectItem value="pt">
                                Physical Therapist
                              </SelectItem>
                              <SelectItem value="ot">
                                Occupational Therapist
                              </SelectItem>
                              <SelectItem value="st">
                                Speech Therapist
                              </SelectItem>
                              <SelectItem value="rt">
                                Respiratory Therapist
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="border rounded-md overflow-hidden">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-muted">
                              <th className="p-2 text-left">Clinician Name</th>
                              <th className="p-2 text-left">Role</th>
                              <th className="p-2 text-left">License Number</th>
                              <th className="p-2 text-left">Expiry Date</th>
                              <th className="p-2 text-left">Status</th>
                              <th className="p-2 text-left">Compliance</th>
                              <th className="p-2 text-left">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {clinicianLicenses.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={7}
                                  className="p-4 text-center text-muted-foreground"
                                >
                                  No licenses found. Add a new license to get
                                  started.
                                </td>
                              </tr>
                            ) : (
                              clinicianLicenses.map((license) => (
                                <tr key={license.id} className="border-b">
                                  <td className="p-2">
                                    <div className="flex items-center gap-2">
                                      <User className="h-4 w-4 text-muted-foreground" />
                                      <span>{license.clinicianName}</span>
                                    </div>
                                  </td>
                                  <td className="p-2">{license.role}</td>
                                  <td className="p-2">
                                    {license.licenseNumber}
                                  </td>
                                  <td className="p-2">
                                    <div className="flex items-center gap-2">
                                      {license.expiryDate}
                                      {isLicenseExpiringSoon(
                                        license.expiryDate,
                                      ) && (
                                        <Badge
                                          variant="warning"
                                          className="text-xs"
                                        >
                                          Expiring Soon
                                        </Badge>
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-2">
                                    <Badge
                                      variant={
                                        license.licenseStatus === "Active"
                                          ? "success"
                                          : license.licenseStatus === "Expired"
                                            ? "destructive"
                                            : license.licenseStatus ===
                                                "Suspended"
                                              ? "destructive"
                                              : "warning"
                                      }
                                    >
                                      {license.licenseStatus}
                                    </Badge>
                                  </td>
                                  <td className="p-2">
                                    <div className="flex items-center gap-2">
                                      {license.complianceStatus ===
                                      "Compliant" ? (
                                        <ShieldCheck className="h-4 w-4 text-green-500" />
                                      ) : license.complianceStatus ===
                                        "Non-Compliant" ? (
                                        <ShieldAlert className="h-4 w-4 text-red-500" />
                                      ) : (
                                        <AlertCircle className="h-4 w-4 text-amber-500" />
                                      )}
                                      <span>{license.complianceStatus}</span>
                                    </div>
                                  </td>
                                  <td className="p-2">
                                    <div className="flex gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          setSelectedLicense(license);
                                          setLicenseFormMode("edit");
                                          setShowLicenseForm(true);
                                        }}
                                      >
                                        Edit
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          // In a real app, this would show a confirmation dialog
                                          setClinicianLicenses(
                                            clinicianLicenses.filter(
                                              (l) => l.id !== license.id,
                                            ),
                                          );
                                        }}
                                      >
                                        <FileX className="h-4 w-4 text-red-500" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <div>
                    <div className="text-sm font-medium">License Summary</div>
                    <div className="flex gap-4 mt-2">
                      <div className="text-sm">
                        <span className="font-medium">Total Licenses:</span>{" "}
                        {clinicianLicenses.length}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Active:</span>{" "}
                        {
                          clinicianLicenses.filter(
                            (l) => l.licenseStatus === "Active",
                          ).length
                        }
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Expiring Soon:</span>{" "}
                        {
                          clinicianLicenses.filter((l) =>
                            isLicenseExpiringSoon(l.expiryDate),
                          ).length
                        }
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Expired:</span>{" "}
                        {
                          clinicianLicenses.filter(
                            (l) => l.licenseStatus === "Expired",
                          ).length
                        }
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Export Licenses
                    </Button>
                    <Button variant="outline">
                      <Bell className="h-4 w-4 mr-2" />
                      Set Renewal Alerts
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Daily Claims Generation Tab */}
            <TabsContent value="daily-claims" className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>
                        Daily Claims Generation & Validation
                      </CardTitle>
                      <CardDescription>
                        Generate and validate claims based on service delivery
                        documentation
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => {
                        // Simulate generating new claims
                        setClaimsProcessingData((prev) => ({
                          ...prev,
                          dailyClaimsGenerated: prev.dailyClaimsGenerated + 1,
                          pendingValidation: prev.pendingValidation + 1,
                        }));
                      }}
                    >
                      <FileBarChart className="h-4 w-4 mr-2" />
                      Generate New Claim
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                          Claims Status
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                              Generated Today:
                            </span>
                            <Badge>
                              {claimsProcessingData.dailyClaimsGenerated}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                              Pending Validation:
                            </span>
                            <Badge variant="warning">
                              {claimsProcessingData.pendingValidation}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                              Ready for Submission:
                            </span>
                            <Badge variant="success">
                              {claimsProcessingData.readyForSubmission}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                              Total Active Claims:
                            </span>
                            <Badge variant="outline">
                              {claimsProcessingData.dailyClaimsGenerated +
                                claimsProcessingData.pendingValidation +
                                claimsProcessingData.readyForSubmission}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                          Validation Issues
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {claimsProcessingData.validationIssues.map(
                            (issue, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-center"
                              >
                                <div className="flex items-center gap-2">
                                  {issue.type === "license" ? (
                                    <BadgeAlert className="h-4 w-4 text-red-500" />
                                  ) : issue.type === "documentation" ? (
                                    <FileWarning className="h-4 w-4 text-amber-500" />
                                  ) : (
                                    <AlertCircle className="h-4 w-4 text-amber-500" />
                                  )}
                                  <span className="text-sm">
                                    {issue.description}
                                  </span>
                                </div>
                                <Badge variant="outline">{issue.count}</Badge>
                              </div>
                            ),
                          )}
                          {claimsProcessingData.validationIssues.length ===
                            0 && (
                            <div className="text-center py-2 text-sm text-muted-foreground">
                              No validation issues found
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                          Quick Actions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            size="sm"
                          >
                            <FileCheck2 className="h-4 w-4 mr-2" />
                            Validate Pending Claims
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            size="sm"
                          >
                            <FilePlus2 className="h-4 w-4 mr-2" />
                            Batch Generate Claims
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            size="sm"
                          >
                            <UserCog className="h-4 w-4 mr-2" />
                            Verify Provider Licenses
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            size="sm"
                          >
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            Export Claims Report
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted">
                          <th className="p-2 text-left">Claim ID</th>
                          <th className="p-2 text-left">Patient</th>
                          <th className="p-2 text-left">Service Period</th>
                          <th className="p-2 text-left">Provider</th>
                          <th className="p-2 text-left">Amount</th>
                          <th className="p-2 text-left">Status</th>
                          <th className="p-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Sample claims data */}
                        <tr className="border-b">
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span>CL-2024-0001</span>
                            </div>
                          </td>
                          <td className="p-2">Mohammed Al Mansoori</td>
                          <td className="p-2">Feb 1-15, 2024</td>
                          <td className="p-2">Sarah Ahmed</td>
                          <td className="p-2">AED 7,500.00</td>
                          <td className="p-2">
                            <Badge variant="success">Validated</Badge>
                          </td>
                          <td className="p-2">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <FileCheck className="h-4 w-4 mr-1" />
                                Submit
                              </Button>
                            </div>
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span>CL-2024-0002</span>
                            </div>
                          </td>
                          <td className="p-2">Fatima Al Zaabi</td>
                          <td className="p-2">Feb 1-15, 2024</td>
                          <td className="p-2">Ali Hassan</td>
                          <td className="p-2">AED 3,600.00</td>
                          <td className="p-2">
                            <Badge variant="warning">Pending Validation</Badge>
                          </td>
                          <td className="p-2">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <FileSearch className="h-4 w-4 mr-1" />
                                Validate
                              </Button>
                            </div>
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span>CL-2024-0003</span>
                            </div>
                          </td>
                          <td className="p-2">Ahmed Al Shamsi</td>
                          <td className="p-2">Feb 1-15, 2024</td>
                          <td className="p-2">Khalid Rahman</td>
                          <td className="p-2">AED 4,200.00</td>
                          <td className="p-2">
                            <Badge variant="destructive">
                              Validation Failed
                            </Badge>
                          </td>
                          <td className="p-2">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <FileWarning className="h-4 w-4 mr-1" />
                                View Issues
                              </Button>
                            </div>
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span>CL-2024-0004</span>
                            </div>
                          </td>
                          <td className="p-2">Mariam Al Nuaimi</td>
                          <td className="p-2">Feb 1-15, 2024</td>
                          <td className="p-2">Aisha Al Hashimi</td>
                          <td className="p-2">AED 6,750.00</td>
                          <td className="p-2">
                            <Badge variant="success">Validated</Badge>
                          </td>
                          <td className="p-2">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <FileCheck className="h-4 w-4 mr-1" />
                                Submit
                              </Button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <div>
                    <div className="text-sm font-medium">Claims Summary</div>
                    <div className="flex gap-4 mt-2">
                      <div className="text-sm">
                        <span className="font-medium">Total Claims:</span>{" "}
                        {claimsProcessingData.dailyClaimsGenerated +
                          claimsProcessingData.pendingValidation +
                          claimsProcessingData.readyForSubmission}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Validation Rate:</span>{" "}
                        {claimsProcessingData.dailyClaimsGenerated > 0
                          ? Math.round(
                              (claimsProcessingData.readyForSubmission /
                                (claimsProcessingData.dailyClaimsGenerated +
                                  claimsProcessingData.pendingValidation +
                                  claimsProcessingData.readyForSubmission)) *
                                100,
                            )
                          : 0}
                        %
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Export Report
                    </Button>
                    <Button>
                      <Send className="h-4 w-4 mr-2" />
                      Submit All Validated
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Claims Audit Tab */}
            <TabsContent value="claims-audit" className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Claims Audit & Quality Assurance</CardTitle>
                      <CardDescription>
                        Conduct systematic audits of submitted claims and verify
                        documentation compliance
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => {
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
                      }}
                      disabled={auditInProgress}
                    >
                      {auditInProgress ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Running Audit...
                        </>
                      ) : (
                        <>
                          <ClipboardCheck className="h-4 w-4 mr-2" />
                          Run Audit
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                          Audit Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                              Total Claims Audited:
                            </span>
                            <span className="text-lg font-bold">
                              {auditResults.total}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Passed:</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="success">
                                {auditResults.passed}
                              </Badge>
                              <span className="text-green-600">
                                {Math.round(
                                  (auditResults.passed / auditResults.total) *
                                    100,
                                )}
                                %
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Failed:</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="destructive">
                                {auditResults.failed}
                              </Badge>
                              <span className="text-red-600">
                                {Math.round(
                                  (auditResults.failed / auditResults.total) *
                                    100,
                                )}
                                %
                              </span>
                            </div>
                          </div>
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500"
                              style={{
                                width: `${(auditResults.passed / auditResults.total) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                          Common Issues
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              <span className="text-sm">
                                Missing service logs
                              </span>
                            </div>
                            <Badge variant="outline">3 claims</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-amber-500" />
                              <span className="text-sm">
                                Incomplete documentation
                              </span>
                            </div>
                            <Badge variant="outline">2 claims</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-amber-500" />
                              <span className="text-sm">
                                Service code mismatch
                              </span>
                            </div>
                            <Badge variant="outline">1 claim</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              <span className="text-sm">
                                Expired provider license
                              </span>
                            </div>
                            <Badge variant="outline">1 claim</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                          Recommendations
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <CheckSquare className="h-4 w-4 text-green-500 mt-1" />
                            <span className="text-sm">
                              Implement daily service log verification
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckSquare className="h-4 w-4 text-green-500 mt-1" />
                            <span className="text-sm">
                              Set up automated license expiry alerts
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckSquare className="h-4 w-4 text-green-500 mt-1" />
                            <span className="text-sm">
                              Conduct monthly documentation training
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckSquare className="h-4 w-4 text-green-500 mt-1" />
                            <span className="text-sm">
                              Implement pre-submission validation checks
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted">
                          <th className="p-2 text-left">Claim Number</th>
                          <th className="p-2 text-left">Submission Date</th>
                          <th className="p-2 text-left">Amount</th>
                          <th className="p-2 text-left">Provider</th>
                          <th className="p-2 text-left">Audit Status</th>
                          <th className="p-2 text-left">Issues</th>
                          <th className="p-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {claimHistory.slice(0, 5).map((claim, index) => (
                          <tr key={claim.id} className="border-b">
                            <td className="p-2">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span>{claim.claimNumber}</span>
                              </div>
                            </td>
                            <td className="p-2">{claim.submissionDate}</td>
                            <td className="p-2">
                              AED {claim.amount.toFixed(2)}
                            </td>
                            <td className="p-2">
                              {index === 0
                                ? "Sarah Ahmed"
                                : index === 1
                                  ? "Ali Hassan"
                                  : "Fatima Al Zaabi"}
                            </td>
                            <td className="p-2">
                              <Badge
                                variant={
                                  index < 3
                                    ? "success"
                                    : index === 3
                                      ? "warning"
                                      : "destructive"
                                }
                              >
                                {index < 3
                                  ? "Passed"
                                  : index === 3
                                    ? "Warning"
                                    : "Failed"}
                              </Badge>
                            </td>
                            <td className="p-2">
                              {index < 3 ? (
                                <span className="text-green-600 text-sm">
                                  No issues found
                                </span>
                              ) : index === 3 ? (
                                <span className="text-amber-600 text-sm">
                                  Minor documentation issues
                                </span>
                              ) : (
                                <span className="text-red-600 text-sm">
                                  Missing service logs
                                </span>
                              )}
                            </td>
                            <td className="p-2">
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  <FileSearch className="h-4 w-4 mr-1" />
                                  View Audit
                                </Button>
                                {index >= 3 && (
                                  <Button variant="outline" size="sm">
                                    <FileUp className="h-4 w-4 mr-1" />
                                    Fix Issues
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <div>
                    <div className="text-sm font-medium">Audit Performance</div>
                    <div className="flex gap-4 mt-2">
                      <div className="text-sm">
                        <span className="font-medium">Last Audit:</span>{" "}
                        {new Date().toLocaleDateString()}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Compliance Rate:</span>{" "}
                        {auditResults.total > 0
                          ? Math.round(
                              (auditResults.passed / auditResults.total) * 100,
                            )
                          : 0}
                        %
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Target:</span> 95%
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Export Audit Report
                    </Button>
                    <Button>
                      <CheckSquare className="h-4 w-4 mr-2" />
                      Schedule Next Audit
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Claim History Tab */}
            <TabsContent value="claim-history" className="mt-4">
              {/* Content for claim history tab is already defined above */}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default ClaimsSubmissionForm;
