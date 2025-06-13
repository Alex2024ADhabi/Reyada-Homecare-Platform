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
import { Textarea } from "@/components/ui/textarea";
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
  DollarSign,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  Upload,
  Download,
  RefreshCw,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useRevenueManagement } from "@/hooks/useRevenueManagement";
import { useOfflineSync } from "@/hooks/useOfflineSync";

interface PaymentReconciliationDashboardProps {
  isOffline?: boolean;
}

interface ReconciliationRecord {
  id: string;
  claimId: string;
  patientName: string;
  expectedAmount: number;
  receivedAmount: number;
  variance: number;
  varianceReason?: string;
  paymentDate: string;
  paymentMethod: string;
  referenceNumber: string;
  status: "matched" | "variance" | "unmatched" | "pending";
  reconciliationDate?: string;
  notes?: string;
}

const PaymentReconciliationDashboard = ({
  isOffline = false,
}: PaymentReconciliationDashboardProps) => {
  const { isOnline } = useOfflineSync();
  const {
    isLoading,
    error,
    getPaymentReconciliation,
    processPaymentReconciliation,
  } = useRevenueManagement();

  const [activeTab, setActiveTab] = useState("reconciliation");
  const [reconciliationData, setReconciliationData] = useState<
    ReconciliationRecord[]
  >([]);
  const [selectedRecord, setSelectedRecord] =
    useState<ReconciliationRecord | null>(null);
  const [showReconcileDialog, setShowReconcileDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reconciliationNotes, setReconciliationNotes] = useState("");

  // Mock data for demonstration
  const mockReconciliationData: ReconciliationRecord[] = [
    {
      id: "1",
      claimId: "CL-2024-0001",
      patientName: "Mohammed Al Mansoori",
      expectedAmount: 7500.0,
      receivedAmount: 7500.0,
      variance: 0,
      paymentDate: "2024-02-15",
      paymentMethod: "Electronic Transfer",
      referenceNumber: "PAY-2024-001",
      status: "matched",
      reconciliationDate: "2024-02-15",
    },
    {
      id: "2",
      claimId: "CL-2024-0002",
      patientName: "Fatima Al Zaabi",
      expectedAmount: 3600.0,
      receivedAmount: 3240.0,
      variance: -360.0,
      varianceReason: "Contractual adjustment",
      paymentDate: "2024-02-14",
      paymentMethod: "Check",
      referenceNumber: "CHK-2024-045",
      status: "variance",
      reconciliationDate: "2024-02-14",
    },
    {
      id: "3",
      claimId: "CL-2024-0003",
      patientName: "Ahmed Al Shamsi",
      expectedAmount: 4200.0,
      receivedAmount: 0,
      variance: -4200.0,
      paymentDate: "",
      paymentMethod: "",
      referenceNumber: "",
      status: "unmatched",
    },
    {
      id: "4",
      claimId: "CL-2024-0004",
      patientName: "Mariam Al Nuaimi",
      expectedAmount: 6750.0,
      receivedAmount: 6750.0,
      variance: 0,
      paymentDate: "2024-02-16",
      paymentMethod: "Electronic Transfer",
      referenceNumber: "PAY-2024-002",
      status: "pending",
    },
  ];

  useEffect(() => {
    loadReconciliationData();
  }, []);

  const loadReconciliationData = async () => {
    try {
      if (isOnline && !isOffline) {
        const data = await getPaymentReconciliation();
        setReconciliationData(data || mockReconciliationData);
      } else {
        setReconciliationData(mockReconciliationData);
      }
    } catch (error) {
      console.error("Error loading reconciliation data:", error);
      setReconciliationData(mockReconciliationData);
    }
  };

  const handleReconcile = async (record: ReconciliationRecord) => {
    try {
      const reconciliationData = {
        claimId: record.claimId,
        expectedAmount: record.expectedAmount,
        receivedAmount: record.receivedAmount,
        variance: record.variance,
        varianceReason: record.varianceReason,
        notes: reconciliationNotes,
        reconciliationDate: new Date().toISOString(),
        status: "reconciled",
      };

      if (isOnline && !isOffline) {
        await processPaymentReconciliation(reconciliationData);
      }

      // Update local state
      setReconciliationData((prev) =>
        prev.map((item) =>
          item.id === record.id
            ? {
                ...item,
                status: "matched" as const,
                reconciliationDate: new Date().toISOString(),
                notes: reconciliationNotes,
              }
            : item,
        ),
      );

      setShowReconcileDialog(false);
      setSelectedRecord(null);
      setReconciliationNotes("");
    } catch (error) {
      console.error("Error reconciling payment:", error);
    }
  };

  const filteredData = reconciliationData.filter((record) => {
    const matchesSearch =
      record.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.claimId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || record.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      matched: "default",
      variance: "secondary",
      unmatched: "destructive",
      pending: "outline",
    } as const;

    const icons = {
      matched: <CheckCircle className="w-3 h-3" />,
      variance: <AlertCircle className="w-3 h-3" />,
      unmatched: <AlertCircle className="w-3 h-3" />,
      pending: <Clock className="w-3 h-3" />,
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

  const calculateSummaryStats = () => {
    const totalExpected = reconciliationData.reduce(
      (sum, record) => sum + record.expectedAmount,
      0,
    );
    const totalReceived = reconciliationData.reduce(
      (sum, record) => sum + record.receivedAmount,
      0,
    );
    const totalVariance = reconciliationData.reduce(
      (sum, record) => sum + record.variance,
      0,
    );
    const matchedCount = reconciliationData.filter(
      (record) => record.status === "matched",
    ).length;
    const varianceCount = reconciliationData.filter(
      (record) => record.status === "variance",
    ).length;
    const unmatchedCount = reconciliationData.filter(
      (record) => record.status === "unmatched",
    ).length;
    const pendingCount = reconciliationData.filter(
      (record) => record.status === "pending",
    ).length;

    return {
      totalExpected,
      totalReceived,
      totalVariance,
      matchedCount,
      varianceCount,
      unmatchedCount,
      pendingCount,
      reconciliationRate:
        reconciliationData.length > 0
          ? (matchedCount / reconciliationData.length) * 100
          : 0,
    };
  };

  const stats = calculateSummaryStats();

  return (
    <div className="w-full h-full bg-background p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Payment Reconciliation Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Reconcile payments with expected claim amounts and manage variances
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={isOffline ? "destructive" : "secondary"}
            className="text-xs"
          >
            {isOffline ? "Offline Mode" : "Online"}
          </Badge>
          <Button onClick={loadReconciliationData} disabled={isLoading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Expected Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalExpected)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total expected from claims
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Received Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalReceived)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total payments received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              {stats.totalVariance >= 0 ? (
                <TrendingUp className="h-4 w-4 mr-2" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-2" />
              )}
              Total Variance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                stats.totalVariance >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatCurrency(stats.totalVariance)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Difference from expected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Reconciliation Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.reconciliationRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.matchedCount} of {reconciliationData.length} reconciled
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reconciliation">
            <FileText className="h-4 w-4 mr-2" />
            Reconciliation
          </TabsTrigger>
          <TabsTrigger value="variances">
            <AlertCircle className="h-4 w-4 mr-2" />
            Variances
          </TabsTrigger>
          <TabsTrigger value="reports">
            <Download className="h-4 w-4 mr-2" />
            Reports
          </TabsTrigger>
        </TabsList>

        {/* Reconciliation Tab */}
        <TabsContent value="reconciliation" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Payment Reconciliation</CardTitle>
                  <CardDescription>
                    Match received payments with expected claim amounts
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Payments
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by patient, claim ID, or reference..."
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
                    <SelectItem value="matched">Matched</SelectItem>
                    <SelectItem value="variance">Variance</SelectItem>
                    <SelectItem value="unmatched">Unmatched</SelectItem>
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
                      <TableHead>Expected</TableHead>
                      <TableHead>Received</TableHead>
                      <TableHead>Variance</TableHead>
                      <TableHead>Payment Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    ) : filteredData.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No reconciliation records found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredData.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">
                            {record.claimId}
                          </TableCell>
                          <TableCell>{record.patientName}</TableCell>
                          <TableCell>
                            {formatCurrency(record.expectedAmount)}
                          </TableCell>
                          <TableCell>
                            {record.receivedAmount > 0
                              ? formatCurrency(record.receivedAmount)
                              : "—"}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`font-medium ${
                                record.variance > 0
                                  ? "text-green-600"
                                  : record.variance < 0
                                    ? "text-red-600"
                                    : "text-gray-600"
                              }`}
                            >
                              {record.variance !== 0
                                ? formatCurrency(record.variance)
                                : "—"}
                            </span>
                          </TableCell>
                          <TableCell>{record.paymentDate || "—"}</TableCell>
                          <TableCell>{getStatusBadge(record.status)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {record.status === "pending" ||
                              record.status === "variance" ? (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedRecord(record);
                                    setShowReconcileDialog(true);
                                  }}
                                >
                                  Reconcile
                                </Button>
                              ) : (
                                <Button size="sm" variant="outline">
                                  View
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

        {/* Variances Tab */}
        <TabsContent value="variances" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Variances</CardTitle>
              <CardDescription>
                Review and manage payment variances that require attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredData
                  .filter(
                    (record) =>
                      record.status === "variance" || record.variance !== 0,
                  )
                  .map((record) => (
                    <Card
                      key={record.id}
                      className="border-l-4 border-l-amber-500"
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">
                              {record.claimId} - {record.patientName}
                            </CardTitle>
                            <CardDescription>
                              Payment Reference:{" "}
                              {record.referenceNumber || "N/A"}
                            </CardDescription>
                          </div>
                          <Badge variant="secondary">
                            {formatCurrency(record.variance)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Expected:</span>
                            <p>{formatCurrency(record.expectedAmount)}</p>
                          </div>
                          <div>
                            <span className="font-medium">Received:</span>
                            <p>{formatCurrency(record.receivedAmount)}</p>
                          </div>
                          <div>
                            <span className="font-medium">Payment Date:</span>
                            <p>{record.paymentDate || "N/A"}</p>
                          </div>
                          <div>
                            <span className="font-medium">Method:</span>
                            <p>{record.paymentMethod || "N/A"}</p>
                          </div>
                        </div>
                        {record.varianceReason && (
                          <div className="mt-4 bg-amber-50 p-3 rounded-md">
                            <p className="text-sm text-amber-800">
                              <strong>Variance Reason:</strong>{" "}
                              {record.varianceReason}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  Reconciliation Summary
                </CardTitle>
                <CardDescription>
                  Daily reconciliation summary report
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge>Daily</Badge>
                <p className="mt-2 text-sm text-gray-500">
                  Summary of all reconciliation activities
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-primary" />
                  Variance Analysis
                </CardTitle>
                <CardDescription>
                  Detailed analysis of payment variances
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge>Weekly</Badge>
                <p className="mt-2 text-sm text-gray-500">
                  Trends and patterns in payment variances
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                  Reconciliation Trends
                </CardTitle>
                <CardDescription>
                  Historical reconciliation performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge>Monthly</Badge>
                <p className="mt-2 text-sm text-gray-500">
                  Track reconciliation efficiency over time
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Reconcile Dialog */}
      <Dialog open={showReconcileDialog} onOpenChange={setShowReconcileDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reconcile Payment</DialogTitle>
            <DialogDescription>
              Review and reconcile the payment for {selectedRecord?.claimId}
            </DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Expected Amount</Label>
                  <Input
                    value={formatCurrency(selectedRecord.expectedAmount)}
                    readOnly
                  />
                </div>
                <div>
                  <Label>Received Amount</Label>
                  <Input
                    value={formatCurrency(selectedRecord.receivedAmount)}
                    readOnly
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Variance</Label>
                  <Input
                    value={formatCurrency(selectedRecord.variance)}
                    readOnly
                    className={
                      selectedRecord.variance !== 0 ? "text-red-600" : ""
                    }
                  />
                </div>
                <div>
                  <Label>Payment Date</Label>
                  <Input value={selectedRecord.paymentDate || ""} readOnly />
                </div>
              </div>
              {selectedRecord.varianceReason && (
                <div>
                  <Label>Variance Reason</Label>
                  <Input value={selectedRecord.varianceReason} readOnly />
                </div>
              )}
              <div>
                <Label htmlFor="reconciliation-notes">
                  Reconciliation Notes
                </Label>
                <Textarea
                  id="reconciliation-notes"
                  placeholder="Add notes about this reconciliation..."
                  value={reconciliationNotes}
                  onChange={(e) => setReconciliationNotes(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowReconcileDialog(false);
                setSelectedRecord(null);
                setReconciliationNotes("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => selectedRecord && handleReconcile(selectedRecord)}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Reconcile"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentReconciliationDashboard;
