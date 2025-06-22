import React, { useState, useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Calendar,
  Clock,
  RefreshCw,
  Filter,
  Download,
  Bell,
  AlertTriangle,
  CheckSquare,
  XSquare,
  FileCheck,
  FileX,
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  Target,
  Zap,
  Shield,
  FileBarChart,
  ClipboardCheck,
  Send,
  Eye,
  Settings,
  Calendar as CalendarIcon,
} from "lucide-react";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { usePaymentProcessing } from "@/hooks/usePaymentProcessing";
import { PaymentGateway, PaymentTransaction } from "@/types/payment";

interface ClaimsProcessingRecord {
  id: string;
  patient_id: number;
  patient_name: string;
  service_month: number;
  service_year: number;
  claim_number: string;
  claim_type: string;
  claim_status: string;
  submission_date?: string;
  primary_clinician: string;
  primary_clinician_license: string;
  primary_clinician_license_expiry: string;
  primary_clinician_license_status: string;
  authorization_number: string;
  authorization_start_date: string;
  authorization_end_date: string;
  authorized_services: string;
  authorized_quantity: number;
  total_services_provided: number;
  total_authorized_services: number;
  service_utilization_rate: number;
  clinical_notes?: string;
  service_provision_status: string;
  coder_notes?: string;
  documentation_audit_status: string;
  documentation_audit_remarks?: string;
  claim_amount: number;
  approved_amount?: number;
  paid_amount?: number;
  denied_amount?: number;
  claim_processing_time_days?: number;
  approval_probability?: number;
  created_at: string;
  updated_at: string;
}

interface ClaimsProcessingDashboardProps {
  isOffline?: boolean;
}

const ClaimsProcessingDashboard = ({
  isOffline = false,
}: ClaimsProcessingDashboardProps) => {
  const { isOnline } = useOfflineSync();
  const {
    processPayment,
    availableGateways,
    selectedGateway,
    isProcessing: isPaymentProcessing,
    getOptimalGateway,
  } = usePaymentProcessing();
  const [activeTab, setActiveTab] = useState("daily-generation");
  const [claims, setClaims] = useState<ClaimsProcessingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] =
    useState<ClaimsProcessingRecord | null>(null);
  const [showClaimDialog, setShowClaimDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedClaimForPayment, setSelectedClaimForPayment] =
    useState<ClaimsProcessingRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Dashboard statistics
  const [dashboardStats, setDashboardStats] = useState({
    totalClaims: 0,
    pendingValidation: 0,
    readyForSubmission: 0,
    validationIssues: 0,
    averageProcessingTime: 0,
    approvalRate: 0,
    totalClaimAmount: 0,
    paidAmount: 0,
  });

  // Mock data for claims processing
  const mockClaims: ClaimsProcessingRecord[] = [
    {
      id: "1",
      patient_id: 12345,
      patient_name: "Mohammed Al Mansoori",
      service_month: 2,
      service_year: 2024,
      claim_number: "CL-2024-0001",
      claim_type: "Initial",
      claim_status: "Draft",
      primary_clinician: "Sarah Ahmed",
      primary_clinician_license: "DOH-N-2023-12345",
      primary_clinician_license_expiry: "2025-01-14",
      primary_clinician_license_status: "Active",
      authorization_number: "DAMAN-PA-2024-12345",
      authorization_start_date: "2024-01-20",
      authorization_end_date: "2024-04-20",
      authorized_services: "Home Nursing, Physiotherapy",
      authorized_quantity: 90,
      total_services_provided: 28,
      total_authorized_services: 30,
      service_utilization_rate: 93.3,
      service_provision_status: "Active",
      documentation_audit_status: "Pass",
      claim_amount: 7500.0,
      approved_amount: 7500.0,
      approval_probability: 0.95,
      created_at: "2024-02-01T08:00:00Z",
      updated_at: "2024-02-15T14:30:00Z",
    },
    {
      id: "2",
      patient_id: 12346,
      patient_name: "Fatima Al Zaabi",
      service_month: 2,
      service_year: 2024,
      claim_number: "CL-2024-0002",
      claim_type: "Initial",
      claim_status: "Pending",
      primary_clinician: "Ali Hassan",
      primary_clinician_license: "DOH-PT-2022-67890",
      primary_clinician_license_expiry: "2024-03-09",
      primary_clinician_license_status: "Pending Renewal",
      authorization_number: "DAMAN-PA-2024-12346",
      authorization_start_date: "2024-01-22",
      authorization_end_date: "2024-04-22",
      authorized_services: "Physical Therapy",
      authorized_quantity: 36,
      total_services_provided: 12,
      total_authorized_services: 12,
      service_utilization_rate: 100.0,
      service_provision_status: "Active",
      documentation_audit_status: "Needs Review",
      documentation_audit_remarks: "Missing service logs for 3 days",
      claim_amount: 3600.0,
      approval_probability: 0.75,
      created_at: "2024-02-01T09:15:00Z",
      updated_at: "2024-02-15T16:45:00Z",
    },
    {
      id: "3",
      patient_id: 12347,
      patient_name: "Ahmed Al Shamsi",
      service_month: 2,
      service_year: 2024,
      claim_number: "CL-2024-0003",
      claim_type: "Initial",
      claim_status: "Submitted",
      submission_date: "2024-02-14",
      primary_clinician: "Khalid Rahman",
      primary_clinician_license: "DOH-ST-2023-24680",
      primary_clinician_license_expiry: "2024-03-31",
      primary_clinician_license_status: "Pending Renewal",
      authorization_number: "DAMAN-PA-2024-12347",
      authorization_start_date: "2024-01-25",
      authorization_end_date: "2024-04-25",
      authorized_services: "Speech Therapy",
      authorized_quantity: 24,
      total_services_provided: 8,
      total_authorized_services: 8,
      service_utilization_rate: 100.0,
      service_provision_status: "Active",
      documentation_audit_status: "Pass",
      claim_amount: 4200.0,
      approved_amount: 4200.0,
      claim_processing_time_days: 3,
      approval_probability: 0.9,
      created_at: "2024-02-01T10:30:00Z",
      updated_at: "2024-02-14T11:20:00Z",
    },
    {
      id: "4",
      patient_id: 12348,
      patient_name: "Mariam Al Nuaimi",
      service_month: 2,
      service_year: 2024,
      claim_number: "CL-2024-0004",
      claim_type: "Initial",
      claim_status: "Draft",
      primary_clinician: "Aisha Al Hashimi",
      primary_clinician_license: "DOH-N-2022-98765",
      primary_clinician_license_expiry: "2024-07-14",
      primary_clinician_license_status: "Active",
      authorization_number: "DAMAN-PA-2024-12348",
      authorization_start_date: "2024-01-28",
      authorization_end_date: "2024-04-28",
      authorized_services: "Home Nursing",
      authorized_quantity: 60,
      total_services_provided: 27,
      total_authorized_services: 30,
      service_utilization_rate: 90.0,
      service_provision_status: "Active",
      documentation_audit_status: "Fail",
      documentation_audit_remarks:
        "Incomplete clinical notes, missing vital signs records",
      claim_amount: 6750.0,
      approval_probability: 0.45,
      created_at: "2024-02-01T11:45:00Z",
      updated_at: "2024-02-15T17:10:00Z",
    },
  ];

  // Load claims on component mount
  useEffect(() => {
    const fetchClaims = async () => {
      try {
        // In a real implementation, this would be an API call
        setClaims(mockClaims);

        // Calculate dashboard statistics
        const stats = {
          totalClaims: mockClaims.length,
          pendingValidation: mockClaims.filter(
            (c) =>
              c.documentation_audit_status === "Needs Review" ||
              c.documentation_audit_status === "Fail",
          ).length,
          readyForSubmission: mockClaims.filter(
            (c) =>
              c.claim_status === "Draft" &&
              c.documentation_audit_status === "Pass",
          ).length,
          validationIssues: mockClaims.filter(
            (c) => c.documentation_audit_status === "Fail",
          ).length,
          averageProcessingTime:
            mockClaims
              .filter((c) => c.claim_processing_time_days)
              .reduce(
                (sum, c) => sum + (c.claim_processing_time_days || 0),
                0,
              ) /
              mockClaims.filter((c) => c.claim_processing_time_days).length ||
            0,
          approvalRate:
            (mockClaims
              .filter((c) => c.approval_probability)
              .reduce((sum, c) => sum + (c.approval_probability || 0), 0) /
              mockClaims.filter((c) => c.approval_probability).length) *
              100 || 0,
          totalClaimAmount: mockClaims.reduce(
            (sum, c) => sum + c.claim_amount,
            0,
          ),
          paidAmount: mockClaims.reduce(
            (sum, c) => sum + (c.paid_amount || 0),
            0,
          ),
        };

        setDashboardStats(stats);
      } catch (error) {
        console.error("Error fetching claims:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, []);

  // Filter claims based on search and status
  const filteredClaims = claims.filter((claim) => {
    const matchesSearch =
      claim.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.claim_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.primary_clinician.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      claim.claim_status.toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "submitted":
        return "default";
      case "paid":
        return "success";
      case "denied":
        return "destructive";
      case "pending":
        return "warning";
      case "draft":
        return "secondary";
      default:
        return "outline";
    }
  };

  // Get audit status badge variant
  const getAuditStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "pass":
        return "success";
      case "fail":
        return "destructive";
      case "needs review":
        return "warning";
      default:
        return "secondary";
    }
  };

  // Handle claim validation
  const handleValidateClaim = (claimId: string) => {
    setClaims(
      claims.map((claim) =>
        claim.id === claimId
          ? {
              ...claim,
              documentation_audit_status: "Pass",
              updated_at: new Date().toISOString(),
            }
          : claim,
      ),
    );
  };

  // Handle claim submission
  const handleSubmitClaim = (claimId: string) => {
    setClaims(
      claims.map((claim) =>
        claim.id === claimId
          ? {
              ...claim,
              claim_status: "Submitted",
              submission_date: new Date().toISOString().split("T")[0],
              updated_at: new Date().toISOString(),
            }
          : claim,
      ),
    );
  };

  // Handle bulk claims submission
  const handleBulkSubmitClaims = () => {
    const readyClaims = claims.filter(
      (c) =>
        c.claim_status === "Draft" && c.documentation_audit_status === "Pass",
    );

    setClaims(
      claims.map((claim) =>
        readyClaims.includes(claim)
          ? {
              ...claim,
              claim_status: "Submitted",
              submission_date: new Date().toISOString().split("T")[0],
              updated_at: new Date().toISOString(),
            }
          : claim,
      ),
    );

    // Update dashboard statistics after bulk submission
    const updatedStats = {
      ...dashboardStats,
      readyForSubmission: 0,
      totalClaims: claims.length,
    };
    setDashboardStats(updatedStats);
  };

  // Handle payment processing for approved claims
  const handleProcessPayment = async (claim: ClaimsProcessingRecord) => {
    if (!claim.approved_amount) {
      console.error("No approved amount for claim:", claim.id);
      return;
    }

    try {
      const optimalGateway = getOptimalGateway(
        claim.approved_amount,
        "AED",
        "insurance_direct",
      );

      const paymentRequest = {
        amount: claim.approved_amount,
        currency: "AED" as const,
        patientId: claim.patient_id.toString(),
        serviceId: claim.claim_number,
        description: `Payment for ${claim.authorized_services} - ${claim.patient_name}`,
        paymentMethod: "insurance_direct" as const,
        metadata: {
          claimId: claim.id,
          authorizationId: claim.authorization_number,
          episodeId: claim.patient_id.toString(),
        },
      };

      const response = await processPayment(paymentRequest, optimalGateway?.id);

      if (response.status === "completed") {
        // Update claim status to paid
        setClaims(
          claims.map((c) =>
            c.id === claim.id
              ? {
                  ...c,
                  claim_status: "Paid",
                  paid_amount: claim.approved_amount,
                  claim_processing_time_days: Math.floor(Math.random() * 5) + 1,
                  updated_at: new Date().toISOString(),
                }
              : c,
          ),
        );
      }
    } catch (error) {
      console.error("Payment processing error:", error);
    }
  };

  // Handle bulk payment processing
  const handleBulkProcessPayments = async () => {
    const approvedClaims = claims.filter(
      (c) =>
        c.claim_status === "Submitted" &&
        c.approved_amount &&
        c.approved_amount > 0,
    );

    for (const claim of approvedClaims) {
      try {
        await handleProcessPayment(claim);
        // Add delay between payments to avoid overwhelming the system
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(
          `Failed to process payment for claim ${claim.id}:`,
          error,
        );
      }
    }
  };

  // Handle claims reconciliation
  const handleReconcileClaims = () => {
    // Simulate reconciliation process
    const submittedClaims = claims.filter(
      (c) => c.claim_status === "Submitted",
    );

    setClaims(
      claims.map((claim) => {
        if (submittedClaims.includes(claim)) {
          // Simulate random reconciliation results
          const reconciliationResult = Math.random();
          if (reconciliationResult > 0.8) {
            return {
              ...claim,
              claim_status: "Paid",
              paid_amount: claim.approved_amount || claim.claim_amount,
              claim_processing_time_days: Math.floor(Math.random() * 15) + 5,
            };
          } else if (reconciliationResult > 0.6) {
            return {
              ...claim,
              claim_status: "Partially Paid",
              paid_amount: (claim.approved_amount || claim.claim_amount) * 0.8,
              claim_processing_time_days: Math.floor(Math.random() * 20) + 10,
            };
          } else if (reconciliationResult > 0.4) {
            return {
              ...claim,
              claim_status: "Pending Review",
              claim_processing_time_days: Math.floor(Math.random() * 10) + 3,
            };
          }
        }
        return claim;
      }),
    );

    // Update dashboard statistics after reconciliation
    setTimeout(() => {
      const updatedClaims = claims.map((claim) => {
        if (submittedClaims.includes(claim)) {
          const reconciliationResult = Math.random();
          if (reconciliationResult > 0.8) {
            return {
              ...claim,
              claim_status: "Paid",
              paid_amount: claim.approved_amount || claim.claim_amount,
            };
          } else if (reconciliationResult > 0.6) {
            return {
              ...claim,
              claim_status: "Partially Paid",
              paid_amount: (claim.approved_amount || claim.claim_amount) * 0.8,
            };
          }
        }
        return claim;
      });

      const newPaidAmount = updatedClaims.reduce(
        (sum, c) => sum + (c.paid_amount || 0),
        0,
      );

      setDashboardStats((prev) => ({
        ...prev,
        paidAmount: newPaidAmount,
      }));
    }, 1000);
  };

  // Auto-refresh claim status tracking
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate automated claim status updates
      setClaims((prevClaims) =>
        prevClaims.map((claim) => {
          if (claim.claim_status === "Submitted" && Math.random() > 0.95) {
            return {
              ...claim,
              claim_status: "Under Review",
              updated_at: new Date().toISOString(),
            };
          }
          return claim;
        }),
      );
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full bg-background p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Claims Processing Dashboard</h1>
          <p className="text-muted-foreground">
            Manage daily claims generation, validation, and submission processes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={isOffline ? "destructive" : "secondary"}
            className="text-xs"
          >
            {isOffline ? "Offline Mode" : "Online"}
          </Badge>
          <Button onClick={() => setShowClaimDialog(true)}>
            <Plus className="h-4 w-4 mr-2" /> Generate New Claim
          </Button>
        </div>
      </div>

      {/* Dashboard Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Total Claims
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats.totalClaims}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active processing records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              Pending Validation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {dashboardStats.pendingValidation}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Require review and validation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Ready for Submission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {dashboardStats.readyForSubmission}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Validated and ready to submit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Total Claim Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              AED {dashboardStats.totalClaimAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Combined claim amounts
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="daily-generation">
            <FileBarChart className="h-4 w-4 mr-2" />
            Daily Generation
          </TabsTrigger>
          <TabsTrigger value="validation">
            <ClipboardCheck className="h-4 w-4 mr-2" />
            Validation
          </TabsTrigger>
          <TabsTrigger value="submission">
            <Send className="h-4 w-4 mr-2" />
            Submission
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Daily Claims Generation Tab */}
        <TabsContent value="daily-generation" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Daily Claims Generation</CardTitle>
                  <CardDescription>
                    Generate and manage daily claims based on service delivery
                    documentation
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Generate Claims
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search claims..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="denied">Denied</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Claim Number</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Service Period</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Audit Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    ) : filteredClaims.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No claims found matching your criteria
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredClaims.map((claim) => (
                        <TableRow key={claim.id}>
                          <TableCell className="font-medium">
                            {claim.claim_number}
                          </TableCell>
                          <TableCell>{claim.patient_name}</TableCell>
                          <TableCell>{claim.primary_clinician}</TableCell>
                          <TableCell>
                            {new Date(
                              0,
                              claim.service_month - 1,
                            ).toLocaleString("default", {
                              month: "short",
                            })}{" "}
                            {claim.service_year}
                          </TableCell>
                          <TableCell>
                            AED {claim.claim_amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={getStatusBadgeVariant(
                                claim.claim_status,
                              )}
                            >
                              {claim.claim_status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={getAuditStatusBadgeVariant(
                                claim.documentation_audit_status,
                              )}
                            >
                              {claim.documentation_audit_status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedClaim(claim)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedClaim(claim)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <div className="text-sm text-muted-foreground">
                Showing {filteredClaims.length} of {claims.length} claims
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReconcileClaims}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Reconcile
                </Button>
                <Button size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Validation Tab */}
        <TabsContent value="validation" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Claims Validation</CardTitle>
              <CardDescription>
                Review and validate claims before submission
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      Validation Queue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-amber-600">
                      {
                        claims.filter(
                          (c) =>
                            c.documentation_audit_status === "Needs Review",
                        ).length
                      }
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Claims awaiting review
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      Failed Validation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {
                        claims.filter(
                          (c) => c.documentation_audit_status === "Fail",
                        ).length
                      }
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Claims with issues
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Validation Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(
                        (claims.filter(
                          (c) => c.documentation_audit_status === "Pass",
                        ).length /
                          claims.length) *
                          100,
                      )}
                      %
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Success rate
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                {claims
                  .filter((c) => c.documentation_audit_status !== "Pass")
                  .map((claim) => (
                    <Card
                      key={claim.id}
                      className="border-l-4 border-l-amber-500"
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">
                              {claim.claim_number}
                            </CardTitle>
                            <CardDescription>
                              {claim.patient_name} • {claim.primary_clinician}
                            </CardDescription>
                          </div>
                          <Badge
                            variant={getAuditStatusBadgeVariant(
                              claim.documentation_audit_status,
                            )}
                          >
                            {claim.documentation_audit_status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {claim.documentation_audit_remarks && (
                          <div className="bg-amber-50 p-3 rounded-md mb-4">
                            <p className="text-sm text-amber-800">
                              <AlertTriangle className="h-4 w-4 inline mr-2" />
                              {claim.documentation_audit_remarks}
                            </p>
                          </div>
                        )}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Amount:</span>
                            <p>AED {claim.claim_amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="font-medium">Services:</span>
                            <p>
                              {claim.total_services_provided}/
                              {claim.total_authorized_services}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium">Utilization:</span>
                            <p>{claim.service_utilization_rate.toFixed(1)}%</p>
                          </div>
                          <div>
                            <span className="font-medium">License Status:</span>
                            <p>{claim.primary_clinician_license_status}</p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Review Details
                        </Button>
                        {claim.documentation_audit_status ===
                          "Needs Review" && (
                          <Button
                            size="sm"
                            onClick={() => handleValidateClaim(claim.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                        )}
                        {claim.documentation_audit_status === "Fail" && (
                          <Button variant="destructive" size="sm">
                            <FileX className="h-4 w-4 mr-2" />
                            Request Corrections
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Submission Tab */}
        <TabsContent value="submission" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Claims Submission</CardTitle>
              <CardDescription>
                Submit validated claims to insurance providers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      Ready for Submission
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {
                        claims.filter(
                          (c) =>
                            c.claim_status === "Draft" &&
                            c.documentation_audit_status === "Pass",
                        ).length
                      }
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Validated claims
                    </p>
                    <Button
                      className="w-full mt-4"
                      size="sm"
                      onClick={handleBulkSubmitClaims}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Submit All (
                      {
                        claims.filter(
                          (c) =>
                            c.claim_status === "Draft" &&
                            c.documentation_audit_status === "Pass",
                        ).length
                      }
                      )
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      Payment Processing
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {
                        claims.filter(
                          (c) =>
                            c.claim_status === "Submitted" &&
                            c.approved_amount &&
                            c.approved_amount > 0,
                        ).length
                      }
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Ready for payment
                    </p>
                    <Button
                      className="w-full mt-4"
                      size="sm"
                      onClick={handleBulkProcessPayments}
                      disabled={isPaymentProcessing}
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Process Payments
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      Processing Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Under Review:</span>
                        <span className="font-bold">
                          {
                            claims.filter(
                              (c) => c.claim_status === "Under Review",
                            ).length
                          }
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Paid:</span>
                        <span className="font-bold text-green-600">
                          {
                            claims.filter((c) => c.claim_status === "Paid")
                              .length
                          }
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Partially Paid:</span>
                        <span className="font-bold text-amber-600">
                          {
                            claims.filter(
                              (c) => c.claim_status === "Partially Paid",
                            ).length
                          }
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Denied:</span>
                        <span className="font-bold text-red-600">
                          {
                            claims.filter((c) => c.claim_status === "Denied")
                              .length
                          }
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Payment Processing:</span>
                        <span className="font-bold text-blue-600">
                          {
                            claims.filter(
                              (c) => c.claim_status === "Processing Payment",
                            ).length
                          }
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        className="flex-1"
                        size="sm"
                        onClick={handleReconcileClaims}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reconcile
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        size="sm"
                        onClick={handleBulkProcessPayments}
                        disabled={isPaymentProcessing}
                      >
                        <DollarSign className="h-4 w-4 mr-2" />
                        Pay All
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                {claims
                  .filter(
                    (c) =>
                      c.claim_status === "Draft" &&
                      c.documentation_audit_status === "Pass",
                  )
                  .map((claim) => (
                    <Card
                      key={claim.id}
                      className="border-l-4 border-l-green-500"
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">
                              {claim.claim_number}
                            </CardTitle>
                            <CardDescription>
                              {claim.patient_name} • AED{" "}
                              {claim.claim_amount.toLocaleString()}
                            </CardDescription>
                          </div>
                          <Badge variant="success">Ready to Submit</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Provider:</span>
                            <p>{claim.primary_clinician}</p>
                          </div>
                          <div>
                            <span className="font-medium">Authorization:</span>
                            <p>{claim.authorization_number}</p>
                          </div>
                          <div>
                            <span className="font-medium">Service Period:</span>
                            <p>
                              {new Date(
                                0,
                                claim.service_month - 1,
                              ).toLocaleString("default", {
                                month: "short",
                              })}{" "}
                              {claim.service_year}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium">
                              Approval Probability:
                            </span>
                            <p>
                              {(
                                (claim.approval_probability || 0) * 100
                              ).toFixed(0)}
                              %
                            </p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSubmitClaim(claim.id)}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Submit
                        </Button>
                        {claim.approved_amount && claim.approved_amount > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleProcessPayment(claim)}
                            disabled={isPaymentProcessing}
                          >
                            <DollarSign className="h-4 w-4 mr-2" />
                            Pay
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Processing Performance</CardTitle>
                <CardDescription>
                  Key metrics for claims processing efficiency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Average Processing Time:
                    </span>
                    <span className="text-lg font-bold">
                      {dashboardStats.averageProcessingTime.toFixed(1)} days
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Approval Rate:</span>
                    <span className="text-lg font-bold text-green-600">
                      {dashboardStats.approvalRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Validation Success Rate:
                    </span>
                    <span className="text-lg font-bold">
                      {Math.round(
                        (claims.filter(
                          (c) => c.documentation_audit_status === "Pass",
                        ).length /
                          claims.length) *
                          100,
                      )}
                      %
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Claims Requiring Attention:
                    </span>
                    <span className="text-lg font-bold text-amber-600">
                      {dashboardStats.validationIssues}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
                <CardDescription>
                  Claims value and payment tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Total Claims Value:
                    </span>
                    <span className="text-lg font-bold">
                      AED {dashboardStats.totalClaimAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Approved Amount:
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      AED{" "}
                      {claims
                        .reduce((sum, c) => sum + (c.approved_amount || 0), 0)
                        .toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Paid Amount:</span>
                    <span className="text-lg font-bold">
                      AED {dashboardStats.paidAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Collection Rate:
                    </span>
                    <span className="text-lg font-bold">
                      {dashboardStats.totalClaimAmount > 0
                        ? Math.round(
                            (dashboardStats.paidAmount /
                              dashboardStats.totalClaimAmount) *
                              100,
                          )
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Authorization Intelligence</CardTitle>
                <CardDescription>
                  AI-powered authorization insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Authorization Success Rate:
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      89.8%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Avg Processing Time:
                    </span>
                    <span className="text-lg font-bold">3.2 days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Pending Authorizations:
                    </span>
                    <span className="text-lg font-bold text-amber-600">15</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      AI Prediction Accuracy:
                    </span>
                    <span className="text-lg font-bold text-blue-600">
                      94.2%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Forecasting</CardTitle>
                <CardDescription>
                  Predictive revenue analysis for next 6 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { month: "Jul", amount: 172000, confidence: 85 },
                    { month: "Aug", amount: 165000, confidence: 82 },
                    { month: "Sep", amount: 178000, confidence: 88 },
                    { month: "Oct", amount: 185000, confidence: 90 },
                    { month: "Nov", amount: 180000, confidence: 87 },
                    { month: "Dec", amount: 175000, confidence: 83 },
                  ].map((forecast, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <span className="font-medium">{forecast.month} 2024</span>
                      <div className="text-right">
                        <div className="font-bold">
                          AED {forecast.amount.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {forecast.confidence}% confidence
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Trend Analysis</CardTitle>
                <CardDescription>
                  Payment velocity and payer performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Average Payment Time</h4>
                    <div className="text-2xl font-bold text-blue-600">
                      28.5 days
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Top Payers Performance</h4>
                    <div className="space-y-2">
                      {[
                        { name: "DAMAN", days: 22, rate: 95.2, risk: "Low" },
                        { name: "ADNIC", days: 35, rate: 88.7, risk: "Medium" },
                        {
                          name: "Oman Insurance",
                          days: 42,
                          rate: 82.1,
                          risk: "High",
                        },
                      ].map((payer, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center text-sm"
                        >
                          <span className="font-medium">{payer.name}</span>
                          <div className="text-right">
                            <div>
                              {payer.days} days • {payer.rate}%
                            </div>
                            <Badge
                              variant={
                                payer.risk === "Low"
                                  ? "success"
                                  : payer.risk === "Medium"
                                    ? "warning"
                                    : "destructive"
                              }
                              className="text-xs"
                            >
                              {payer.risk} Risk
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Claim Details Dialog */}
      {selectedClaim && (
        <Dialog
          open={!!selectedClaim}
          onOpenChange={() => setSelectedClaim(null)}
        >
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedClaim.claim_number}</DialogTitle>
              <DialogDescription>
                Claim details for {selectedClaim.patient_name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Patient Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Patient ID:</span>
                      <span>{selectedClaim.patient_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Name:</span>
                      <span>{selectedClaim.patient_name}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Service Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Service Period:</span>
                      <span>
                        {new Date(
                          0,
                          selectedClaim.service_month - 1,
                        ).toLocaleString("default", { month: "long" })}{" "}
                        {selectedClaim.service_year}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Authorized Services:</span>
                      <span>{selectedClaim.authorized_services}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Services Provided:</span>
                      <span>
                        {selectedClaim.total_services_provided}/
                        {selectedClaim.total_authorized_services}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Utilization Rate:</span>
                      <span>
                        {selectedClaim.service_utilization_rate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Provider Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Primary Clinician:</span>
                      <span>{selectedClaim.primary_clinician}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>License Number:</span>
                      <span>{selectedClaim.primary_clinician_license}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>License Expiry:</span>
                      <span>
                        {selectedClaim.primary_clinician_license_expiry}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>License Status:</span>
                      <Badge
                        variant={
                          selectedClaim.primary_clinician_license_status ===
                          "Active"
                            ? "success"
                            : "warning"
                        }
                      >
                        {selectedClaim.primary_clinician_license_status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Financial Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Claim Amount:</span>
                      <span>
                        AED {selectedClaim.claim_amount.toLocaleString()}
                      </span>
                    </div>
                    {selectedClaim.approved_amount && (
                      <div className="flex justify-between">
                        <span>Approved Amount:</span>
                        <span>
                          AED {selectedClaim.approved_amount.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {selectedClaim.approval_probability && (
                      <div className="flex justify-between">
                        <span>Approval Probability:</span>
                        <span>
                          {(selectedClaim.approval_probability * 100).toFixed(
                            0,
                          )}
                          %
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {selectedClaim.documentation_audit_remarks && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Audit Remarks</h3>
                <div className="bg-amber-50 p-3 rounded-md">
                  <p className="text-sm text-amber-800">
                    {selectedClaim.documentation_audit_remarks}
                  </p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedClaim(null)}>
                Close
              </Button>
              <Button>Edit Claim</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ClaimsProcessingDashboard;
