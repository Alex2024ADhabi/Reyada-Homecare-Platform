/**
 * Payment Gateway Manager Component
 * Comprehensive payment processing interface with multiple gateway support
 */

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
  CreditCard,
  Banknote,
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  Settings,
  TrendingUp,
  DollarSign,
  Activity,
  Zap,
  Lock,
  Globe,
  Smartphone,
  Building,
  Receipt,
  AlertTriangle,
  Eye,
  Download,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  RotateCcw,
  X,
  Check,
  Loader2,
  Bell,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Users,
  Calendar,
  FileText,
  Send,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { usePaymentProcessing } from "@/hooks/usePaymentProcessing";
import {
  PaymentGateway,
  PaymentTransaction,
  PaymentStatus,
} from "@/types/payment";
import { useOfflineSync } from "@/hooks/useOfflineSync";

interface PaymentGatewayManagerProps {
  isOffline?: boolean;
}

const PaymentGatewayManager = ({
  isOffline = false,
}: PaymentGatewayManagerProps) => {
  const { isOnline } = useOfflineSync();
  const {
    isProcessing,
    currentTransaction,
    paymentHistory,
    availableGateways,
    selectedGateway,
    error,
    processPayment,
    checkPaymentStatus,
    processRefund,
    selectGateway,
    retryPayment,
    cancelPayment,
    getOptimalGateway,
    validatePaymentData,
    calculateFees,
    getPaymentAnalytics,
    getGatewayPerformance,
  } = usePaymentProcessing();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<PaymentTransaction | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [gatewayFilter, setGatewayFilter] = useState("all");
  const [analytics, setAnalytics] = useState<any>(null);
  const [gatewayPerformance, setGatewayPerformance] = useState<any[]>([]);

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    currency: "AED",
    patientId: "",
    claimId: "",
    description: "",
    paymentMethod: "card",
    gatewayId: "",
  });

  // Refund form state
  const [refundForm, setRefundForm] = useState({
    amount: "",
    reason: "",
    fullRefund: true,
  });

  // Load analytics and performance data
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const analyticsData = await getPaymentAnalytics({
          startDate: new Date(
            Date.now() - 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          endDate: new Date().toISOString(),
        });
        setAnalytics(analyticsData);

        const performanceData = await getGatewayPerformance();
        setGatewayPerformance(performanceData);
      } catch (error) {
        console.error("Error loading analytics:", error);
      }
    };

    loadAnalytics();
  }, [getPaymentAnalytics, getGatewayPerformance]);

  // Filter transactions
  const filteredTransactions = paymentHistory.filter((transaction) => {
    const matchesSearch =
      transaction.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.description
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      transaction.paymentId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || transaction.status === statusFilter;
    const matchesGateway =
      gatewayFilter === "all" || transaction.gatewayId === gatewayFilter;

    return matchesSearch && matchesStatus && matchesGateway;
  });

  // Get status badge variant
  const getStatusBadgeVariant = (status: PaymentStatus) => {
    switch (status) {
      case "completed":
        return "default";
      case "failed":
        return "destructive";
      case "pending":
      case "processing":
        return "secondary";
      case "refunded":
        return "outline";
      default:
        return "secondary";
    }
  };

  // Get gateway icon
  const getGatewayIcon = (gatewayType: string) => {
    switch (gatewayType) {
      case "stripe":
        return <CreditCard className="h-4 w-4" />;
      case "adcb":
      case "emirates_nbd":
      case "mashreq":
        return <Building className="h-4 w-4" />;
      case "daman_pay":
        return <Shield className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  // Handle payment submission
  const handlePaymentSubmit = async () => {
    try {
      const paymentRequest = {
        amount: parseFloat(paymentForm.amount),
        currency: paymentForm.currency as "AED" | "USD",
        patientId: paymentForm.patientId,
        serviceId: paymentForm.claimId || "manual_payment",
        description: paymentForm.description,
        paymentMethod: paymentForm.paymentMethod as any,
        metadata: {
          claimId: paymentForm.claimId,
          manualEntry: true,
        },
      };

      await processPayment(paymentRequest, paymentForm.gatewayId || undefined);
      setShowPaymentDialog(false);
      setPaymentForm({
        amount: "",
        currency: "AED",
        patientId: "",
        claimId: "",
        description: "",
        paymentMethod: "card",
        gatewayId: "",
      });
    } catch (error) {
      console.error("Payment submission error:", error);
    }
  };

  // Handle refund submission
  const handleRefundSubmit = async () => {
    if (!selectedTransaction) return;

    try {
      const refundAmount = refundForm.fullRefund
        ? undefined
        : parseFloat(refundForm.amount);
      await processRefund(
        selectedTransaction.paymentId,
        refundAmount,
        refundForm.reason,
      );
      setShowRefundDialog(false);
      setSelectedTransaction(null);
      setRefundForm({
        amount: "",
        reason: "",
        fullRefund: true,
      });
    } catch (error) {
      console.error("Refund submission error:", error);
    }
  };

  return (
    <div className="w-full h-full bg-background p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Payment Gateway Manager</h1>
          <p className="text-muted-foreground">
            Manage payments across multiple gateways with secure processing
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={isOffline ? "destructive" : "secondary"}
            className="text-xs"
          >
            {isOffline ? "Offline Mode" : "Online"}
          </Badge>
          <Button onClick={() => setShowPaymentDialog(true)}>
            <Plus className="h-4 w-4 mr-2" /> Process Payment
          </Button>
        </div>
      </div>

      {/* Gateway Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Activity className="h-4 w-4 mr-2" />
              Active Gateways
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {availableGateways.filter((g) => g.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              of {availableGateways.length} total gateways
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {analytics ? `${analytics.successRate.toFixed(1)}%` : "0%"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Total Processed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              AED {analytics ? analytics.totalAmount.toLocaleString() : "0"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics ? analytics.totalTransactions : 0} transactions
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
            <div className="text-2xl font-bold">2.3s</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all gateways
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">
            <BarChart3 className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="transactions">
            <Receipt className="h-4 w-4 mr-2" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="gateways">
            <Globe className="h-4 w-4 mr-2" />
            Gateways
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <PieChart className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>
                  Latest payment activities across all gateways
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {paymentHistory.slice(0, 10).map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          {getGatewayIcon(
                            availableGateways.find(
                              (g) => g.id === transaction.gatewayId,
                            )?.type || "default",
                          )}
                          <div>
                            <p className="font-medium text-sm">
                              {transaction.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {transaction.patientId} •{" "}
                              {new Date(
                                transaction.timeline.initiatedAt,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {transaction.currency} {transaction.amount}
                          </p>
                          <Badge
                            variant={getStatusBadgeVariant(transaction.status)}
                            className="text-xs"
                          >
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Gateway Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Gateway Performance</CardTitle>
                <CardDescription>
                  Real-time performance metrics for each gateway
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {gatewayPerformance.map((gateway) => (
                    <div key={gateway.gatewayId} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          {getGatewayIcon(
                            availableGateways.find(
                              (g) => g.id === gateway.gatewayId,
                            )?.type || "default",
                          )}
                          <span className="font-medium text-sm">
                            {gateway.gatewayName}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium">
                            {gateway.successRate.toFixed(1)}%
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {gateway.transactionCount} txns
                          </p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${gateway.successRate}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Payment Transactions</CardTitle>
                  <CardDescription>
                    View and manage all payment transactions
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={gatewayFilter} onValueChange={setGatewayFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by gateway" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Gateways</SelectItem>
                    {availableGateways.map((gateway) => (
                      <SelectItem key={gateway.id} value={gateway.id}>
                        {gateway.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Transactions Table */}
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Gateway</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No transactions found matching your criteria
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">
                            {transaction.paymentId.substring(0, 12)}...
                          </TableCell>
                          <TableCell>{transaction.patientId}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getGatewayIcon(
                                availableGateways.find(
                                  (g) => g.id === transaction.gatewayId,
                                )?.type || "default",
                              )}
                              <span className="text-sm">
                                {availableGateways.find(
                                  (g) => g.id === transaction.gatewayId,
                                )?.name || "Unknown"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {transaction.currency}{" "}
                            {transaction.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={getStatusBadgeVariant(
                                transaction.status,
                              )}
                            >
                              {transaction.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(
                              transaction.timeline.initiatedAt,
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setSelectedTransaction(transaction)
                                }
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {transaction.status === "completed" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedTransaction(transaction);
                                    setShowRefundDialog(true);
                                  }}
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              )}
                              {transaction.status === "failed" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    retryPayment(transaction.paymentId)
                                  }
                                >
                                  <RefreshCw className="h-4 w-4" />
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
            <CardFooter className="flex justify-between border-t pt-4">
              <div className="text-sm text-muted-foreground">
                Showing {filteredTransactions.length} of {paymentHistory.length}{" "}
                transactions
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Gateways Tab */}
        <TabsContent value="gateways" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableGateways.map((gateway) => {
              const performance = gatewayPerformance.find(
                (p) => p.gatewayId === gateway.id,
              );
              return (
                <Card
                  key={gateway.id}
                  className={`${selectedGateway?.id === gateway.id ? "ring-2 ring-primary" : ""}`}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        {getGatewayIcon(gateway.type)}
                        <div>
                          <CardTitle className="text-base">
                            {gateway.name}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {gateway.type.toUpperCase()}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge
                        variant={gateway.isActive ? "default" : "secondary"}
                      >
                        {gateway.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Processing Fee:</span>
                        <span className="font-medium">
                          {gateway.processingFee}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Settlement:</span>
                        <span className="font-medium">
                          {gateway.settlementTime}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Success Rate:</span>
                        <span className="font-medium text-green-600">
                          {performance
                            ? `${performance.successRate.toFixed(1)}%`
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Transactions:</span>
                        <span className="font-medium">
                          {performance ? performance.transactionCount : 0}
                        </span>
                      </div>
                      <Separator />
                      <div>
                        <p className="text-xs font-medium mb-2">
                          Supported Currencies:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {gateway.supportedCurrencies.map((currency) => (
                            <Badge
                              key={currency}
                              variant="outline"
                              className="text-xs"
                            >
                              {currency}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium mb-2">
                          Payment Methods:
                        </p>
                        <div className="space-y-1">
                          {gateway.supportedPaymentMethods.map(
                            (method, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-center text-xs"
                              >
                                <span>{method.displayName}</span>
                                <Badge
                                  variant={
                                    method.isEnabled ? "default" : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {method.isEnabled ? "Enabled" : "Disabled"}
                                </Badge>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button
                      variant={
                        selectedGateway?.id === gateway.id
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      className="flex-1"
                      onClick={() => selectGateway(gateway.id)}
                    >
                      {selectedGateway?.id === gateway.id
                        ? "Selected"
                        : "Select"}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Volume Trends</CardTitle>
                <CardDescription>
                  Transaction volume and success rates over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <LineChart className="h-8 w-8 mr-2" />
                  Chart visualization would be implemented here
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gateway Distribution</CardTitle>
                <CardDescription>
                  Payment distribution across different gateways
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <PieChart className="h-8 w-8 mr-2" />
                  Pie chart visualization would be implemented here
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                  Key performance indicators for payment processing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {analytics
                        ? `${analytics.successRate.toFixed(1)}%`
                        : "0%"}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Success Rate
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">2.3s</div>
                    <p className="text-sm text-muted-foreground">
                      Avg Processing
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">99.9%</div>
                    <p className="text-sm text-muted-foreground">Uptime</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      AED{" "}
                      {analytics
                        ? (analytics.averageAmount || 0).toLocaleString()
                        : "0"}
                    </div>
                    <p className="text-sm text-muted-foreground">Avg Amount</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Analysis</CardTitle>
                <CardDescription>
                  Fraud detection and risk assessment metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Low Risk Transactions:</span>
                    <span className="font-medium text-green-600">94.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Medium Risk Transactions:</span>
                    <span className="font-medium text-yellow-600">4.8%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">High Risk Transactions:</span>
                    <span className="font-medium text-red-600">1.0%</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Fraud Detection Rate:</span>
                    <span className="font-medium">99.7%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">False Positive Rate:</span>
                    <span className="font-medium">0.3%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Status</CardTitle>
                <CardDescription>
                  Current security configuration and compliance status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span className="text-sm">PCI DSS Compliance</span>
                    </div>
                    <Badge variant="default">Level 1</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Lock className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Data Encryption</span>
                    </div>
                    <Badge variant="default">AES-256</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Tokenization</span>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Eye className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Fraud Detection</span>
                    </div>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Audit Logging</span>
                    </div>
                    <Badge variant="default">Complete</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Events</CardTitle>
                <CardDescription>
                  Recent security events and alerts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-2 border rounded">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          Payment Processed Securely
                        </p>
                        <p className="text-xs text-muted-foreground">
                          2 minutes ago
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-2 border rounded">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          Suspicious Activity Detected
                        </p>
                        <p className="text-xs text-muted-foreground">
                          15 minutes ago
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-2 border rounded">
                      <Shield className="h-4 w-4 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          Security Scan Completed
                        </p>
                        <p className="text-xs text-muted-foreground">
                          1 hour ago
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Compliance Checklist</CardTitle>
                <CardDescription>
                  Ensure all security requirements are met
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">SSL/TLS Encryption</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Payment Card Tokenization</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Secure API Endpoints</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Data Masking</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Access Control</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Audit Trail</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Vulnerability Scanning</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Incident Response Plan</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Process Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
            <DialogDescription>
              Process a new payment through the selected gateway
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={paymentForm.amount}
                  onChange={(e) =>
                    setPaymentForm((prev) => ({
                      ...prev,
                      amount: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={paymentForm.currency}
                  onValueChange={(value) =>
                    setPaymentForm((prev) => ({ ...prev, currency: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AED">AED</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="patientId">Patient ID</Label>
              <Input
                id="patientId"
                placeholder="Enter patient ID"
                value={paymentForm.patientId}
                onChange={(e) =>
                  setPaymentForm((prev) => ({
                    ...prev,
                    patientId: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="claimId">Claim ID (Optional)</Label>
              <Input
                id="claimId"
                placeholder="Enter claim ID"
                value={paymentForm.claimId}
                onChange={(e) =>
                  setPaymentForm((prev) => ({
                    ...prev,
                    claimId: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Payment description"
                value={paymentForm.description}
                onChange={(e) =>
                  setPaymentForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                value={paymentForm.paymentMethod}
                onValueChange={(value) =>
                  setPaymentForm((prev) => ({ ...prev, paymentMethod: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="digital_wallet">Digital Wallet</SelectItem>
                  <SelectItem value="insurance_direct">
                    Insurance Direct
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="gateway">Gateway (Optional)</Label>
              <Select
                value={paymentForm.gatewayId}
                onValueChange={(value) =>
                  setPaymentForm((prev) => ({ ...prev, gatewayId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Auto-select optimal gateway" />
                </SelectTrigger>
                <SelectContent>
                  {availableGateways
                    .filter((g) => g.isActive)
                    .map((gateway) => (
                      <SelectItem key={gateway.id} value={gateway.id}>
                        {gateway.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPaymentDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handlePaymentSubmit} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Process Payment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Process Refund Dialog */}
      <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              Process a refund for the selected transaction
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium">Transaction Details</p>
                <p className="text-xs text-muted-foreground">
                  ID: {selectedTransaction.paymentId}
                </p>
                <p className="text-xs text-muted-foreground">
                  Amount: {selectedTransaction.currency}{" "}
                  {selectedTransaction.amount}
                </p>
                <p className="text-xs text-muted-foreground">
                  Patient: {selectedTransaction.patientId}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="fullRefund"
                  checked={refundForm.fullRefund}
                  onChange={(e) =>
                    setRefundForm((prev) => ({
                      ...prev,
                      fullRefund: e.target.checked,
                    }))
                  }
                />
                <Label htmlFor="fullRefund">Full Refund</Label>
              </div>
              {!refundForm.fullRefund && (
                <div>
                  <Label htmlFor="refundAmount">Refund Amount</Label>
                  <Input
                    id="refundAmount"
                    type="number"
                    placeholder="0.00"
                    max={selectedTransaction.amount}
                    value={refundForm.amount}
                    onChange={(e) =>
                      setRefundForm((prev) => ({
                        ...prev,
                        amount: e.target.value,
                      }))
                    }
                  />
                </div>
              )}
              <div>
                <Label htmlFor="refundReason">Reason for Refund</Label>
                <Textarea
                  id="refundReason"
                  placeholder="Enter reason for refund"
                  value={refundForm.reason}
                  onChange={(e) =>
                    setRefundForm((prev) => ({
                      ...prev,
                      reason: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRefundDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleRefundSubmit} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Process Refund"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentGatewayManager;
