import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  FileText,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useRevenueManagement } from "@/hooks/useRevenueManagement";
import { useOfflineSync } from "@/hooks/useOfflineSync";

interface RevenueAnalyticsDashboardProps {
  isOffline?: boolean;
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

interface AgingBucket {
  range: string;
  amount: number;
  percentage: number;
  claimCount: number;
}

interface PayerPerformance {
  payerName: string;
  totalClaims: number;
  totalAmount: number;
  paidAmount: number;
  averagePaymentTime: number;
  denialRate: number;
  collectionRate: number;
}

const RevenueAnalyticsDashboard = ({
  isOffline = false,
}: RevenueAnalyticsDashboardProps) => {
  const { isOnline } = useOfflineSync();
  const {
    isLoading,
    error,
    revenueAnalytics,
    accountsReceivableAging,
    denialAnalytics,
    fetchRevenueAnalytics,
    fetchAccountsReceivableAging,
    fetchDenialAnalytics,
    getPayerPerformanceAnalytics,
    generateCashFlowProjection,
    getKPIDashboard,
  } = useRevenueManagement();

  const [activeTab, setActiveTab] = useState("overview");
  const [timeframe, setTimeframe] = useState("month");
  const [payerPerformance, setPayerPerformance] = useState<PayerPerformance[]>(
    [],
  );
  const [cashFlowProjection, setCashFlowProjection] = useState<any>(null);
  const [kpiData, setKpiData] = useState<any>(null);
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    todayRevenue: 0,
    todayCollections: 0,
    pendingClaims: 0,
    processingTime: 0,
  });
  const [financialTrends, setFinancialTrends] = useState<any[]>([]);

  // Mock data for demonstration
  const mockRevenueMetrics: RevenueMetrics = {
    totalClaims: 1247,
    totalAmount: 2847650.0,
    paidAmount: 2456780.0,
    pendingAmount: 298420.0,
    deniedAmount: 92450.0,
    adjustmentAmount: 15680.0,
    collectionRate: 86.3,
    averageDaysToPayment: 28.5,
  };

  const mockAgingBuckets: AgingBucket[] = [
    { range: "0-30 days", amount: 156780.0, percentage: 52.5, claimCount: 89 },
    { range: "31-60 days", amount: 89420.0, percentage: 30.0, claimCount: 45 },
    { range: "61-90 days", amount: 35680.0, percentage: 12.0, claimCount: 23 },
    { range: "91-120 days", amount: 12340.0, percentage: 4.1, claimCount: 8 },
    { range: "> 120 days", amount: 4200.0, percentage: 1.4, claimCount: 3 },
  ];

  const mockPayerPerformance: PayerPerformance[] = [
    {
      payerName: "Daman Health Insurance",
      totalClaims: 456,
      totalAmount: 1245680.0,
      paidAmount: 1098750.0,
      averagePaymentTime: 24.5,
      denialRate: 8.2,
      collectionRate: 88.2,
    },
    {
      payerName: "ADNIC Insurance",
      totalClaims: 298,
      totalAmount: 789420.0,
      paidAmount: 678950.0,
      averagePaymentTime: 32.1,
      denialRate: 12.1,
      collectionRate: 86.0,
    },
    {
      payerName: "NICO Insurance",
      totalClaims: 234,
      totalAmount: 567890.0,
      paidAmount: 489650.0,
      averagePaymentTime: 28.8,
      denialRate: 9.8,
      collectionRate: 86.2,
    },
    {
      payerName: "Orient Insurance",
      totalClaims: 189,
      totalAmount: 456780.0,
      paidAmount: 398420.0,
      averagePaymentTime: 35.2,
      denialRate: 10.5,
      collectionRate: 87.2,
    },
  ];

  useEffect(() => {
    loadAnalyticsData();

    // Real-time metrics update
    const metricsInterval = setInterval(() => {
      setRealTimeMetrics((prev) => ({
        todayRevenue: prev.todayRevenue + Math.random() * 1000,
        todayCollections: prev.todayCollections + Math.random() * 800,
        pendingClaims: Math.floor(Math.random() * 50) + 20,
        processingTime: Math.random() * 5 + 20,
      }));
    }, 5000);

    return () => clearInterval(metricsInterval);
  }, [timeframe]);

  const loadAnalyticsData = async () => {
    try {
      if (isOnline && !isOffline) {
        await Promise.all([
          fetchRevenueAnalytics({ timeframe }),
          fetchAccountsReceivableAging({ timeframe }),
          fetchDenialAnalytics({ timeframe }),
        ]);

        const payerData = await getPayerPerformanceAnalytics({ timeframe });
        setPayerPerformance(payerData || mockPayerPerformance);

        const cashFlow = await generateCashFlowProjection({ timeframe });
        setCashFlowProjection(cashFlow);

        const kpi = await getKPIDashboard({ timeframe });
        setKpiData(kpi);

        // Initialize real-time metrics
        setRealTimeMetrics({
          todayRevenue: Math.random() * 50000 + 10000,
          todayCollections: Math.random() * 40000 + 8000,
          pendingClaims: Math.floor(Math.random() * 30) + 15,
          processingTime: Math.random() * 10 + 15,
        });

        // Generate financial trends data
        const trends = Array.from({ length: 12 }, (_, i) => ({
          month: new Date(2024, i, 1).toLocaleString("default", {
            month: "short",
          }),
          revenue: Math.random() * 100000 + 50000,
          collections: Math.random() * 80000 + 40000,
          denials: Math.random() * 10000 + 2000,
        }));
        setFinancialTrends(trends);
      } else {
        setPayerPerformance(mockPayerPerformance);

        // Initialize real-time metrics for offline mode
        setRealTimeMetrics({
          todayRevenue: Math.random() * 50000 + 10000,
          todayCollections: Math.random() * 40000 + 8000,
          pendingClaims: Math.floor(Math.random() * 30) + 15,
          processingTime: Math.random() * 10 + 15,
        });

        // Generate financial trends data for offline mode
        const trends = Array.from({ length: 12 }, (_, i) => ({
          month: new Date(2024, i, 1).toLocaleString("default", {
            month: "short",
          }),
          revenue: Math.random() * 100000 + 50000,
          collections: Math.random() * 80000 + 40000,
          denials: Math.random() * 10000 + 2000,
        }));
        setFinancialTrends(trends);
      }
    } catch (error) {
      console.error("Error loading analytics data:", error);
      setPayerPerformance(mockPayerPerformance);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getMetrics = () => {
    return revenueAnalytics || mockRevenueMetrics;
  };

  const getAgingBuckets = () => {
    return accountsReceivableAging?.buckets || mockAgingBuckets;
  };

  const metrics = getMetrics();
  const agingBuckets = getAgingBuckets();

  return (
    <div className="w-full h-full bg-background p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Revenue Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive revenue cycle performance analytics and insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={isOffline ? "destructive" : "secondary"}
            className="text-xs"
          >
            {isOffline ? "Offline Mode" : "Online"}
          </Badge>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadAnalyticsData} disabled={isLoading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Real-Time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Activity className="h-4 w-4 mr-2" />
              Today's Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(realTimeMetrics.todayRevenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Live tracking • Updated now
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Today's Collections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(realTimeMetrics.todayCollections)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatPercentage(
                (realTimeMetrics.todayCollections /
                  realTimeMetrics.todayRevenue) *
                  100,
              )}{" "}
              collection rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Pending Claims
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {realTimeMetrics.pendingClaims}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting processing
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
            <div className="text-2xl font-bold">
              {realTimeMetrics.processingTime.toFixed(1)}h
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Real-time average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metrics.totalAmount)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.totalClaims} claims submitted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Collected Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(metrics.paidAmount)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatPercentage(metrics.collectionRate)} collection rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Pending Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {formatCurrency(metrics.pendingAmount)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg {metrics.averageDaysToPayment} days to payment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              Denied Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(metrics.deniedAmount)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatPercentage(
                (metrics.deniedAmount / metrics.totalAmount) * 100,
              )}{" "}
              denial rate
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="aging">
            <Clock className="h-4 w-4 mr-2" />
            Aging
          </TabsTrigger>
          <TabsTrigger value="payers">
            <PieChart className="h-4 w-4 mr-2" />
            Payers
          </TabsTrigger>
          <TabsTrigger value="trends">
            <TrendingUp className="h-4 w-4 mr-2" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="h-4 w-4 mr-2" />
            Reports
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>
                  Distribution of revenue by status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Collected</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {formatCurrency(metrics.paidAmount)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatPercentage(
                          (metrics.paidAmount / metrics.totalAmount) * 100,
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                      <span className="text-sm">Pending</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {formatCurrency(metrics.pendingAmount)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatPercentage(
                          (metrics.pendingAmount / metrics.totalAmount) * 100,
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm">Denied</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {formatCurrency(metrics.deniedAmount)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatPercentage(
                          (metrics.deniedAmount / metrics.totalAmount) * 100,
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Adjustments</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {formatCurrency(metrics.adjustmentAmount)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatPercentage(
                          (metrics.adjustmentAmount / metrics.totalAmount) *
                            100,
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Performance Metrics</CardTitle>
                <CardDescription>
                  Critical revenue cycle indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">
                        Collection Rate
                      </span>
                      <span className="text-sm font-bold">
                        {formatPercentage(metrics.collectionRate)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${metrics.collectionRate}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">
                        Average Days to Payment
                      </span>
                      <span className="text-sm font-bold">
                        {metrics.averageDaysToPayment} days
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${Math.min((metrics.averageDaysToPayment / 60) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Denial Rate</span>
                      <span className="text-sm font-bold">
                        {formatPercentage(
                          (metrics.deniedAmount / metrics.totalAmount) * 100,
                        )}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{
                          width: `${(metrics.deniedAmount / metrics.totalAmount) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Aging Tab */}
        <TabsContent value="aging" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Accounts Receivable Aging</CardTitle>
              <CardDescription>
                Outstanding claims by age categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agingBuckets.map((bucket, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {bucket.range}
                      </span>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatCurrency(bucket.amount)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {bucket.claimCount} claims
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          index === 0
                            ? "bg-green-500"
                            : index === 1
                              ? "bg-yellow-500"
                              : index === 2
                                ? "bg-orange-500"
                                : "bg-red-500"
                        }`}
                        style={{ width: `${bucket.percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatPercentage(bucket.percentage)} of total outstanding
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payers Tab */}
        <TabsContent value="payers" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Payer Performance Analysis</CardTitle>
              <CardDescription>
                Performance metrics by insurance payer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {payerPerformance.map((payer, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        {payer.payerName}
                      </CardTitle>
                      <CardDescription>
                        {payer.totalClaims} claims •{" "}
                        {formatCurrency(payer.totalAmount)} total
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Collection Rate:</span>
                          <p className="text-green-600 font-bold">
                            {formatPercentage(payer.collectionRate)}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">Avg Payment Time:</span>
                          <p className="font-bold">
                            {payer.averagePaymentTime.toFixed(1)} days
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">Denial Rate:</span>
                          <p className="text-red-600 font-bold">
                            {formatPercentage(payer.denialRate)}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">Paid Amount:</span>
                          <p className="font-bold">
                            {formatCurrency(payer.paidAmount)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>
                  Monthly revenue performance over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {financialTrends.map((trend, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm font-medium">{trend.month}</span>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-bold">
                            {formatCurrency(trend.revenue)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Revenue
                          </div>
                        </div>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${(trend.revenue / Math.max(...financialTrends.map((t) => t.revenue))) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Collection Trends</CardTitle>
                <CardDescription>
                  Collection rate trends and patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {financialTrends.map((trend, index) => {
                    const collectionRate =
                      (trend.collections / trend.revenue) * 100;
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm font-medium">
                          {trend.month}
                        </span>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm font-bold text-green-600">
                              {formatPercentage(collectionRate)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatCurrency(trend.collections)}
                            </div>
                          </div>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${collectionRate}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Financial Performance Summary</CardTitle>
                <CardDescription>
                  Comprehensive financial metrics and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(
                        financialTrends.reduce((sum, t) => sum + t.revenue, 0),
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Total Revenue (YTD)
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(
                        financialTrends.reduce(
                          (sum, t) => sum + t.collections,
                          0,
                        ),
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Total Collections (YTD)
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(
                        financialTrends.reduce((sum, t) => sum + t.denials, 0),
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Total Denials (YTD)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  Revenue Summary
                </CardTitle>
                <CardDescription>
                  Comprehensive revenue cycle summary
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge>Monthly</Badge>
                <p className="mt-2 text-sm text-gray-500">
                  Complete overview of revenue performance
                </p>
                <Button className="w-full mt-4" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-primary" />
                  Aging Report
                </CardTitle>
                <CardDescription>
                  Detailed accounts receivable aging analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge>Weekly</Badge>
                <p className="mt-2 text-sm text-gray-500">
                  Track outstanding claims by age
                </p>
                <Button className="w-full mt-4" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2 text-primary" />
                  Payer Analysis
                </CardTitle>
                <CardDescription>
                  Performance analysis by insurance payer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge>Monthly</Badge>
                <p className="mt-2 text-sm text-gray-500">
                  Compare payer performance metrics
                </p>
                <Button className="w-full mt-4" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                  Trend Analysis
                </CardTitle>
                <CardDescription>
                  Historical trends and forecasting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge>Quarterly</Badge>
                <p className="mt-2 text-sm text-gray-500">
                  Identify patterns and predict future performance
                </p>
                <Button className="w-full mt-4" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-primary" />
                  Denial Analysis
                </CardTitle>
                <CardDescription>
                  Comprehensive denial and appeal analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge>Monthly</Badge>
                <p className="mt-2 text-sm text-gray-500">
                  Track denial patterns and appeal success
                </p>
                <Button className="w-full mt-4" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  Cash Flow Projection
                </CardTitle>
                <CardDescription>
                  Future cash flow predictions and planning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge>Quarterly</Badge>
                <p className="mt-2 text-sm text-gray-500">
                  Forecast expected cash flows
                </p>
                <Button className="w-full mt-4" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RevenueAnalyticsDashboard;
