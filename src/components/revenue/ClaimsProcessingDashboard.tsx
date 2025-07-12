import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
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
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Search,
  Filter,
  Zap,
  Brain,
  Shield,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { damanComplianceValidator } from "@/services/daman-compliance-validator.service";

interface ClaimRecord {
  id: string;
  claimId: string;
  patientName: string;
  serviceDate: string;
  serviceCode: string;
  chargeAmount: number;
  status:
    | "submitted"
    | "processing"
    | "approved"
    | "denied"
    | "pending"
    | "auto-processing";
  processingTime: number;
  estimatedPayment: number;
  submissionDate: string;
  lastUpdated: string;
  automatedProcessing: boolean;
  eligibilityVerified: boolean;
  authorizationNumber?: string;
  diagnosisCode?: string;
  trackingId?: string;
  expectedDecision?: string;
  revenueOptimization?: any;
  processingNotes?: string;
}

interface ClaimsProcessingDashboardProps {
  isOffline?: boolean;
}

const ClaimsProcessingDashboard = ({
  isOffline = false,
}: ClaimsProcessingDashboardProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("processing");
  const [claims, setClaims] = useState<ClaimRecord[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<ClaimRecord | null>(null);
  const [showClaimDialog, setShowClaimDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [processingStats, setProcessingStats] = useState({
    totalClaims: 0,
    automatedProcessing: 0,
    averageProcessingTime: 0,
    approvalRate: 0,
  });

  // Mock data for demonstration
  const mockClaims: ClaimRecord[] = [
    {
      id: "1",
      claimId: "CLM-2024-0001",
      patientName: "Mohammed Al Mansoori",
      serviceDate: "2024-02-15",
      serviceCode: "17-25-1",
      chargeAmount: 1800,
      status: "processing",
      processingTime: 2,
      estimatedPayment: 1530,
      submissionDate: "2024-02-16",
      lastUpdated: "2024-02-17",
      automatedProcessing: true,
      eligibilityVerified: true,
    },
    {
      id: "2",
      claimId: "CLM-2024-0002",
      patientName: "Fatima Al Zaabi",
      serviceDate: "2024-02-14",
      serviceCode: "17-25-3",
      chargeAmount: 2400,
      status: "approved",
      processingTime: 1,
      estimatedPayment: 2040,
      submissionDate: "2024-02-15",
      lastUpdated: "2024-02-16",
      automatedProcessing: true,
      eligibilityVerified: true,
    },
    {
      id: "3",
      claimId: "CLM-2024-0003",
      patientName: "Ahmed Al Shamsi",
      serviceDate: "2024-02-13",
      serviceCode: "17-25-5",
      chargeAmount: 3600,
      status: "pending",
      processingTime: 5,
      estimatedPayment: 3060,
      submissionDate: "2024-02-14",
      lastUpdated: "2024-02-17",
      automatedProcessing: false,
      eligibilityVerified: false,
    },
  ];

  useEffect(() => {
    loadClaimsData();
  }, []);

  const loadClaimsData = async () => {
    try {
      setLoading(true);
      // In production, this would fetch from the API
      setClaims(mockClaims);

      // Calculate processing stats
      const stats = {
        totalClaims: mockClaims.length,
        automatedProcessing: mockClaims.filter((c) => c.automatedProcessing)
          .length,
        averageProcessingTime:
          mockClaims.reduce((sum, c) => sum + c.processingTime, 0) /
          mockClaims.length,
        approvalRate:
          (mockClaims.filter((c) => c.status === "approved").length /
            mockClaims.length) *
          100,
      };
      setProcessingStats(stats);
    } catch (error) {
      console.error("Error loading claims data:", error);
      toast({
        title: "Error",
        description: "Failed to load claims data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processClaimAutomatically = async (claim: ClaimRecord) => {
    try {
      setLoading(true);

      // Enhanced validation for automated processing
      const validation = damanComplianceValidator.validateClaimsProcessing({
        claimId: claim.claimId,
        patientId: claim.patientName,
        serviceDate: claim.serviceDate,
        serviceCode: claim.serviceCode,
        chargeAmount: claim.chargeAmount,
        supportingDocuments: [],
        priorAuthorizationNumber: claim.authorizationNumber,
        diagnosisCode: claim.diagnosisCode,
      });

      if (!validation.isValid) {
        toast({
          title: "Validation Failed",
          description: validation.errors.join(", "),
          variant: "destructive",
        });
        return;
      }

      // Enhanced automated processing with revenue optimization
      const response = await fetch("/api/daman-authorization/claims/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Processing-Priority":
            claim.chargeAmount > 5000 ? "high" : "standard",
          "X-Revenue-Optimization": "enabled",
        },
        body: JSON.stringify({
          claimId: claim.claimId,
          patientId: claim.patientName,
          serviceDate: claim.serviceDate,
          serviceCode: claim.serviceCode,
          chargeAmount: claim.chargeAmount,
          diagnosisCode: claim.diagnosisCode || "Z51.11",
          providerNPI: "1234567890",
          priorAuthorizationNumber: claim.authorizationNumber,
          automatedProcessing: true,
          revenueOptimization: {
            enabled: true,
            denialPrevention: true,
            paymentAcceleration: true,
            reconciliationTracking: true,
          },
        }),
      });

      if (response.ok) {
        const result = await response.json();

        // Update claim with enhanced processing information
        setClaims((prev) =>
          prev.map((c) =>
            c.id === claim.id
              ? {
                  ...c,
                  status: result.automatedProcessing
                    ? "auto-processing"
                    : "processing",
                  automatedProcessing: result.automatedProcessing,
                  estimatedPayment: result.estimatedPayment,
                  processingTime: result.processingTime,
                  revenueOptimization: result.revenueOptimization,
                  trackingId: result.claimId,
                  expectedDecision: result.trackingDetails?.expectedDecision,
                }
              : c,
          ),
        );

        toast({
          title: result.automatedProcessing
            ? "Automated Processing Started"
            : "Processing Started",
          description: result.automatedProcessing
            ? `Claim ${claim.claimId} is being processed automatically. Expected completion: ${result.processingTime} days`
            : `Claim ${claim.claimId} submitted for manual review`,
        });

        // Start real-time tracking if available
        if (result.trackingDetails?.realTimeUpdates) {
          startRealTimeClaimTracking(claim.id, result.claimId);
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process claim");
      }
    } catch (error) {
      console.error("Error processing claim:", error);
      toast({
        title: "Processing Failed",
        description:
          error instanceof Error
            ? error.message
            : "Unable to process claim automatically",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Real-time claim tracking function
  const startRealTimeClaimTracking = (claimId: string, trackingId: string) => {
    // Implementation for real-time claim status updates
    const trackingInterval = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/daman-authorization/claims/${trackingId}/status`,
        );
        if (response.ok) {
          const statusUpdate = await response.json();

          setClaims((prev) =>
            prev.map((c) =>
              c.id === claimId
                ? {
                    ...c,
                    status: statusUpdate.status,
                    lastUpdated: statusUpdate.lastUpdated,
                    processingNotes: statusUpdate.notes,
                  }
                : c,
            ),
          );

          // Clear interval if claim is completed
          if (["approved", "denied", "paid"].includes(statusUpdate.status)) {
            clearInterval(trackingInterval);
          }
        }
      } catch (error) {
        console.error("Error tracking claim status:", error);
      }
    }, 30000); // Check every 30 seconds

    // Clear interval after 1 hour to prevent indefinite polling
    setTimeout(() => clearInterval(trackingInterval), 3600000);
  };

  const filteredClaims = claims.filter((claim) => {
    const matchesSearch =
      claim.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.claimId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.serviceCode.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || claim.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      submitted: "outline",
      processing: "secondary",
      approved: "default",
      denied: "destructive",
      pending: "outline",
      "auto-processing": "secondary",
    } as const;

    const icons = {
      submitted: <FileText className="w-3 h-3" />,
      processing: <Clock className="w-3 h-3" />,
      approved: <CheckCircle className="w-3 h-3" />,
      denied: <AlertCircle className="w-3 h-3" />,
      pending: <Clock className="w-3 h-3" />,
      "auto-processing": <Zap className="w-3 h-3" />,
    };

    return (
      <Badge
        variant={variants[status as keyof typeof variants] || "outline"}
        className="flex items-center gap-1"
      >
        {icons[status as keyof typeof icons]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
    }).format(amount);
  };

  return (
    <div className="w-full h-full bg-background p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            Claims Processing Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Automated claims processing with real-time validation and tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={isOffline ? "destructive" : "secondary"}
            className="text-xs"
          >
            {isOffline ? "Offline Mode" : "Online"}
          </Badge>
          <Button onClick={loadClaimsData} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Processing Statistics */}
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
              {processingStats.totalClaims}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active claims in system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              Automated Processing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {processingStats.automatedProcessing}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Claims processed automatically
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Avg Processing Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {processingStats.averageProcessingTime.toFixed(1)} days
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Average time to process
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Approval Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {processingStats.approvalRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Claims approved successfully
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="processing">
            <Zap className="h-4 w-4 mr-2" />
            Automated Processing
          </TabsTrigger>
          <TabsTrigger value="tracking">
            <Shield className="h-4 w-4 mr-2" />
            Real-time Tracking
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Enhanced Automated Processing Tab */}
        <TabsContent value="processing" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Intelligent Claims Processing</CardTitle>
                  <CardDescription>
                    AI-powered automated processing with revenue optimization
                    and real-time validation
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Revenue Analytics
                  </Button>
                  <Button variant="outline" size="sm">
                    <Shield className="w-4 h-4 mr-2" />
                    Compliance Check
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by patient, claim ID, or service code..."
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
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="auto-processing">
                      Auto Processing
                    </SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="denied">Denied</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Claim ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Service Code</TableHead>
                      <TableHead>Charge Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Processing Time</TableHead>
                      <TableHead>Automated</TableHead>
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
                          No claims found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredClaims.map((claim) => (
                        <TableRow key={claim.id}>
                          <TableCell className="font-medium">
                            {claim.claimId}
                          </TableCell>
                          <TableCell>{claim.patientName}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{claim.serviceCode}</Badge>
                          </TableCell>
                          <TableCell>
                            {formatCurrency(claim.chargeAmount)}
                          </TableCell>
                          <TableCell>{getStatusBadge(claim.status)}</TableCell>
                          <TableCell>{claim.processingTime} days</TableCell>
                          <TableCell>
                            {claim.automatedProcessing ? (
                              <Badge className="bg-green-100 text-green-800">
                                <Zap className="w-3 h-3 mr-1" />
                                Auto
                              </Badge>
                            ) : (
                              <Badge variant="outline">Manual</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {!claim.automatedProcessing &&
                              claim.status === "pending" ? (
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    processClaimAutomatically(claim)
                                  }
                                  disabled={loading}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  <Zap className="w-3 h-3 mr-1" />
                                  Auto Process
                                </Button>
                              ) : claim.status === "auto-processing" ? (
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedClaim(claim);
                                      setShowClaimDialog(true);
                                    }}
                                  >
                                    <Clock className="w-3 h-3 mr-1" />
                                    Track
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      startRealTimeClaimTracking(
                                        claim.id,
                                        claim.trackingId || claim.claimId,
                                      )
                                    }
                                  >
                                    <RefreshCw className="w-3 h-3" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedClaim(claim);
                                    setShowClaimDialog(true);
                                  }}
                                >
                                  View Details
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Real-time Tracking Tab */}
        <TabsContent value="tracking" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Claims Tracking</CardTitle>
              <CardDescription>
                Monitor claim status and processing progress in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredClaims.map((claim) => (
                  <Card key={claim.id} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">
                            {claim.claimId} - {claim.patientName}
                          </CardTitle>
                          <CardDescription>
                            Service Date: {claim.serviceDate} | Last Updated:{" "}
                            {claim.lastUpdated}
                          </CardDescription>
                        </div>
                        {getStatusBadge(claim.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <span className="font-medium">Service Code:</span>
                          <p>{claim.serviceCode}</p>
                        </div>
                        <div>
                          <span className="font-medium">Charge Amount:</span>
                          <p>{formatCurrency(claim.chargeAmount)}</p>
                        </div>
                        <div>
                          <span className="font-medium">
                            Estimated Payment:
                          </span>
                          <p>{formatCurrency(claim.estimatedPayment)}</p>
                        </div>
                        <div>
                          <span className="font-medium">Processing Time:</span>
                          <p>{claim.processingTime} days</p>
                        </div>
                      </div>

                      {/* Processing Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Processing Progress</span>
                          <span>
                            {claim.status === "approved"
                              ? "100%"
                              : claim.status === "processing" ||
                                  claim.status === "auto-processing"
                                ? "60%"
                                : claim.status === "submitted"
                                  ? "30%"
                                  : "10%"}
                          </span>
                        </div>
                        <Progress
                          value={
                            claim.status === "approved"
                              ? 100
                              : claim.status === "processing" ||
                                  claim.status === "auto-processing"
                                ? 60
                                : claim.status === "submitted"
                                  ? 30
                                  : 10
                          }
                          className="h-2"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enhanced Analytics Tab */}
        <TabsContent value="analytics" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Processing Efficiency & Revenue Impact</CardTitle>
                <CardDescription>
                  Comprehensive analysis of automated vs manual processing with
                  revenue optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Automated Processing</span>
                      <span className="font-semibold text-green-600">
                        85% (+12% revenue impact)
                      </span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Manual Processing</span>
                      <span className="text-amber-600">15% (higher cost)</span>
                    </div>
                    <Progress value={15} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Average Processing Time</span>
                      <span className="font-semibold text-blue-600">
                        1.2 days (automated) vs 4.5 days (manual)
                      </span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Revenue Optimization Rate</span>
                      <span className="font-semibold text-purple-600">
                        94.2%
                      </span>
                    </div>
                    <Progress value={94} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Denial Prevention Success</span>
                      <span className="font-semibold text-green-600">
                        87.5%
                      </span>
                    </div>
                    <Progress value={87} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Performance by Service Type</CardTitle>
                <CardDescription>
                  Approval rates, reimbursement rates, and revenue optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <span className="text-sm font-medium">
                        Nursing Care (17-25-1)
                      </span>
                      <div className="text-xs text-gray-500">
                        Avg: AED 300 | Reimbursement: 92%
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge className="bg-green-100 text-green-800">
                        92% approval
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-800">
                        0.5d processing
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <span className="text-sm font-medium">
                        Physiotherapy (17-25-2)
                      </span>
                      <div className="text-xs text-gray-500">
                        Avg: AED 300 | Reimbursement: 88%
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge className="bg-green-100 text-green-800">
                        88% approval
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-800">
                        0.5d processing
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <span className="text-sm font-medium">
                        OT Consultation (17-25-3)
                      </span>
                      <div className="text-xs text-gray-500">
                        Avg: AED 800 | Reimbursement: 85%
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge className="bg-yellow-100 text-yellow-800">
                        75% approval
                      </Badge>
                      <Badge className="bg-amber-100 text-amber-800">
                        1.2d processing
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <span className="text-sm font-medium">
                        Routine Nursing (17-25-4)
                      </span>
                      <div className="text-xs text-gray-500">
                        Avg: AED 900 | Reimbursement: 90%
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge className="bg-green-100 text-green-800">
                        90% approval
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-800">
                        0.5d processing
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <span className="text-sm font-medium">
                        Advanced Nursing (17-25-5)
                      </span>
                      <div className="text-xs text-gray-500">
                        Avg: AED 1,800 | Reimbursement: 87%
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge className="bg-yellow-100 text-yellow-800">
                        78% approval
                      </Badge>
                      <Badge className="bg-amber-100 text-amber-800">
                        1.5d processing
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Cycle Optimization</CardTitle>
                <CardDescription>
                  Real-time revenue management insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Payment Acceleration</span>
                    <Badge className="bg-green-100 text-green-800">
                      +23% faster
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Denial Prevention</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      87.5% success
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Automated Reconciliation</span>
                    <Badge className="bg-purple-100 text-purple-800">
                      94.2% matched
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Revenue Leakage Prevention</span>
                    <Badge className="bg-green-100 text-green-800">
                      $125K saved
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Collection Efficiency</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      96.3% rate
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Claim Details Dialog */}
      <Dialog open={showClaimDialog} onOpenChange={setShowClaimDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Claim Details</DialogTitle>
            <DialogDescription>
              Detailed information for {selectedClaim?.claimId}
            </DialogDescription>
          </DialogHeader>
          {selectedClaim && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Patient Name</Label>
                  <Input value={selectedClaim.patientName} readOnly />
                </div>
                <div>
                  <Label>Service Date</Label>
                  <Input value={selectedClaim.serviceDate} readOnly />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Service Code</Label>
                  <Input value={selectedClaim.serviceCode} readOnly />
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-2">
                    {getStatusBadge(selectedClaim.status)}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Charge Amount</Label>
                  <Input
                    value={formatCurrency(selectedClaim.chargeAmount)}
                    readOnly
                  />
                </div>
                <div>
                  <Label>Estimated Payment</Label>
                  <Input
                    value={formatCurrency(selectedClaim.estimatedPayment)}
                    readOnly
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    Automated Processing:
                  </span>
                  {selectedClaim.automatedProcessing ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Yes
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      No
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    Eligibility Verified:
                  </span>
                  {selectedClaim.eligibilityVerified ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Yes
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      No
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowClaimDialog(false);
                setSelectedClaim(null);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClaimsProcessingDashboard;
