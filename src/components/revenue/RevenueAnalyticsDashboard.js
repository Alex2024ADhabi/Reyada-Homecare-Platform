import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { DollarSign, TrendingUp, Clock, FileText, BarChart3, PieChart, Calendar, Download, RefreshCw, AlertCircle, CheckCircle, } from "lucide-react";
import { useRevenueManagement } from "@/hooks/useRevenueManagement";
import { useOfflineSync } from "@/hooks/useOfflineSync";
const RevenueAnalyticsDashboard = ({ isOffline = false, }) => {
    const { isOnline } = useOfflineSync();
    const { isLoading, error, revenueAnalytics, accountsReceivableAging, denialAnalytics, fetchRevenueAnalytics, fetchAccountsReceivableAging, fetchDenialAnalytics, getPayerPerformanceAnalytics, generateCashFlowProjection, getKPIDashboard, } = useRevenueManagement();
    const [activeTab, setActiveTab] = useState("overview");
    const [timeframe, setTimeframe] = useState("month");
    const [payerPerformance, setPayerPerformance] = useState([]);
    const [cashFlowProjection, setCashFlowProjection] = useState(null);
    const [kpiData, setKpiData] = useState(null);
    // Mock data for demonstration
    const mockRevenueMetrics = {
        totalClaims: 1247,
        totalAmount: 2847650.0,
        paidAmount: 2456780.0,
        pendingAmount: 298420.0,
        deniedAmount: 92450.0,
        adjustmentAmount: 15680.0,
        collectionRate: 86.3,
        averageDaysToPayment: 28.5,
    };
    const mockAgingBuckets = [
        { range: "0-30 days", amount: 156780.0, percentage: 52.5, claimCount: 89 },
        { range: "31-60 days", amount: 89420.0, percentage: 30.0, claimCount: 45 },
        { range: "61-90 days", amount: 35680.0, percentage: 12.0, claimCount: 23 },
        { range: "91-120 days", amount: 12340.0, percentage: 4.1, claimCount: 8 },
        { range: "> 120 days", amount: 4200.0, percentage: 1.4, claimCount: 3 },
    ];
    const mockPayerPerformance = [
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
            }
            else {
                setPayerPerformance(mockPayerPerformance);
            }
        }
        catch (error) {
            console.error("Error loading analytics data:", error);
            setPayerPerformance(mockPayerPerformance);
        }
    };
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-AE", {
            style: "currency",
            currency: "AED",
        }).format(amount);
    };
    const formatPercentage = (value) => {
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
    return (_jsxs("div", { className: "w-full h-full bg-background p-4 md:p-6", children: [_jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Revenue Analytics Dashboard" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Comprehensive revenue cycle performance analytics and insights" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: isOffline ? "destructive" : "secondary", className: "text-xs", children: isOffline ? "Offline Mode" : "Online" }), _jsxs(Select, { value: timeframe, onValueChange: setTimeframe, children: [_jsx(SelectTrigger, { className: "w-32", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "week", children: "This Week" }), _jsx(SelectItem, { value: "month", children: "This Month" }), _jsx(SelectItem, { value: "quarter", children: "This Quarter" }), _jsx(SelectItem, { value: "year", children: "This Year" })] })] }), _jsxs(Button, { onClick: loadAnalyticsData, disabled: isLoading, children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "Refresh"] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium flex items-center", children: [_jsx(DollarSign, { className: "h-4 w-4 mr-2" }), "Total Revenue"] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: formatCurrency(metrics.totalAmount) }), _jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [metrics.totalClaims, " claims submitted"] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium flex items-center", children: [_jsx(CheckCircle, { className: "h-4 w-4 mr-2" }), "Collected Amount"] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: formatCurrency(metrics.paidAmount) }), _jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [formatPercentage(metrics.collectionRate), " collection rate"] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium flex items-center", children: [_jsx(Clock, { className: "h-4 w-4 mr-2" }), "Pending Amount"] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-amber-600", children: formatCurrency(metrics.pendingAmount) }), _jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: ["Avg ", metrics.averageDaysToPayment, " days to payment"] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium flex items-center", children: [_jsx(AlertCircle, { className: "h-4 w-4 mr-2" }), "Denied Amount"] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-red-600", children: formatCurrency(metrics.deniedAmount) }), _jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [formatPercentage((metrics.deniedAmount / metrics.totalAmount) * 100), " ", "denial rate"] })] })] })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-5", children: [_jsxs(TabsTrigger, { value: "overview", children: [_jsx(BarChart3, { className: "h-4 w-4 mr-2" }), "Overview"] }), _jsxs(TabsTrigger, { value: "aging", children: [_jsx(Clock, { className: "h-4 w-4 mr-2" }), "Aging"] }), _jsxs(TabsTrigger, { value: "payers", children: [_jsx(PieChart, { className: "h-4 w-4 mr-2" }), "Payers"] }), _jsxs(TabsTrigger, { value: "trends", children: [_jsx(TrendingUp, { className: "h-4 w-4 mr-2" }), "Trends"] }), _jsxs(TabsTrigger, { value: "reports", children: [_jsx(FileText, { className: "h-4 w-4 mr-2" }), "Reports"] })] }), _jsx(TabsContent, { value: "overview", className: "mt-4", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Revenue Breakdown" }), _jsx(CardDescription, { children: "Distribution of revenue by status" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-3 h-3 bg-green-500 rounded-full" }), _jsx("span", { className: "text-sm", children: "Collected" })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "font-medium", children: formatCurrency(metrics.paidAmount) }), _jsx("div", { className: "text-xs text-muted-foreground", children: formatPercentage((metrics.paidAmount / metrics.totalAmount) * 100) })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-3 h-3 bg-amber-500 rounded-full" }), _jsx("span", { className: "text-sm", children: "Pending" })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "font-medium", children: formatCurrency(metrics.pendingAmount) }), _jsx("div", { className: "text-xs text-muted-foreground", children: formatPercentage((metrics.pendingAmount / metrics.totalAmount) * 100) })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-3 h-3 bg-red-500 rounded-full" }), _jsx("span", { className: "text-sm", children: "Denied" })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "font-medium", children: formatCurrency(metrics.deniedAmount) }), _jsx("div", { className: "text-xs text-muted-foreground", children: formatPercentage((metrics.deniedAmount / metrics.totalAmount) * 100) })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-3 h-3 bg-blue-500 rounded-full" }), _jsx("span", { className: "text-sm", children: "Adjustments" })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "font-medium", children: formatCurrency(metrics.adjustmentAmount) }), _jsx("div", { className: "text-xs text-muted-foreground", children: formatPercentage((metrics.adjustmentAmount / metrics.totalAmount) *
                                                                            100) })] })] })] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Key Performance Metrics" }), _jsx(CardDescription, { children: "Critical revenue cycle indicators" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsx("span", { className: "text-sm font-medium", children: "Collection Rate" }), _jsx("span", { className: "text-sm font-bold", children: formatPercentage(metrics.collectionRate) })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-green-500 h-2 rounded-full", style: { width: `${metrics.collectionRate}%` } }) })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsx("span", { className: "text-sm font-medium", children: "Average Days to Payment" }), _jsxs("span", { className: "text-sm font-bold", children: [metrics.averageDaysToPayment, " days"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-blue-500 h-2 rounded-full", style: {
                                                                        width: `${Math.min((metrics.averageDaysToPayment / 60) * 100, 100)}%`,
                                                                    } }) })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsx("span", { className: "text-sm font-medium", children: "Denial Rate" }), _jsx("span", { className: "text-sm font-bold", children: formatPercentage((metrics.deniedAmount / metrics.totalAmount) * 100) })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-red-500 h-2 rounded-full", style: {
                                                                        width: `${(metrics.deniedAmount / metrics.totalAmount) * 100}%`,
                                                                    } }) })] })] }) })] })] }) }), _jsx(TabsContent, { value: "aging", className: "mt-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Accounts Receivable Aging" }), _jsx(CardDescription, { children: "Outstanding claims by age categories" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: agingBuckets.map((bucket, index) => (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm font-medium", children: bucket.range }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "font-medium", children: formatCurrency(bucket.amount) }), _jsxs("div", { className: "text-xs text-muted-foreground", children: [bucket.claimCount, " claims"] })] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: `h-2 rounded-full ${index === 0
                                                            ? "bg-green-500"
                                                            : index === 1
                                                                ? "bg-yellow-500"
                                                                : index === 2
                                                                    ? "bg-orange-500"
                                                                    : "bg-red-500"}`, style: { width: `${bucket.percentage}%` } }) }), _jsxs("div", { className: "text-xs text-muted-foreground", children: [formatPercentage(bucket.percentage), " of total outstanding"] })] }, index))) }) })] }) }), _jsx(TabsContent, { value: "payers", className: "mt-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Payer Performance Analysis" }), _jsx(CardDescription, { children: "Performance metrics by insurance payer" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-6", children: payerPerformance.map((payer, index) => (_jsxs(Card, { className: "border-l-4 border-l-blue-500", children: [_jsxs(CardHeader, { className: "pb-2", children: [_jsx(CardTitle, { className: "text-base", children: payer.payerName }), _jsxs(CardDescription, { children: [payer.totalClaims, " claims \u2022", " ", formatCurrency(payer.totalAmount), " total"] })] }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Collection Rate:" }), _jsx("p", { className: "text-green-600 font-bold", children: formatPercentage(payer.collectionRate) })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Avg Payment Time:" }), _jsxs("p", { className: "font-bold", children: [payer.averagePaymentTime.toFixed(1), " days"] })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Denial Rate:" }), _jsx("p", { className: "text-red-600 font-bold", children: formatPercentage(payer.denialRate) })] }), _jsxs("div", { children: [_jsx("span", { className: "font-medium", children: "Paid Amount:" }), _jsx("p", { className: "font-bold", children: formatCurrency(payer.paidAmount) })] })] }) })] }, index))) }) })] }) }), _jsx(TabsContent, { value: "trends", className: "mt-4", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Revenue Trends" }), _jsx(CardDescription, { children: "Monthly revenue performance over time" })] }), _jsx(CardContent, { children: _jsx("div", { className: "h-64 flex items-center justify-center text-muted-foreground", children: _jsxs("div", { className: "text-center", children: [_jsx(BarChart3, { className: "h-12 w-12 mx-auto mb-2" }), _jsx("p", { children: "Revenue trend chart would be displayed here" }), _jsx("p", { className: "text-xs", children: "Integration with charting library required" })] }) }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Collection Trends" }), _jsx(CardDescription, { children: "Collection rate trends and patterns" })] }), _jsx(CardContent, { children: _jsx("div", { className: "h-64 flex items-center justify-center text-muted-foreground", children: _jsxs("div", { className: "text-center", children: [_jsx(TrendingUp, { className: "h-12 w-12 mx-auto mb-2" }), _jsx("p", { children: "Collection trend chart would be displayed here" }), _jsx("p", { className: "text-xs", children: "Integration with charting library required" })] }) }) })] })] }) }), _jsx(TabsContent, { value: "reports", className: "mt-4", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: [_jsxs(Card, { className: "cursor-pointer hover:bg-gray-50 transition-colors", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(FileText, { className: "h-5 w-5 mr-2 text-primary" }), "Revenue Summary"] }), _jsx(CardDescription, { children: "Comprehensive revenue cycle summary" })] }), _jsxs(CardContent, { children: [_jsx(Badge, { children: "Monthly" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "Complete overview of revenue performance" }), _jsxs(Button, { className: "w-full mt-4", variant: "outline", children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "Generate Report"] })] })] }), _jsxs(Card, { className: "cursor-pointer hover:bg-gray-50 transition-colors", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Clock, { className: "h-5 w-5 mr-2 text-primary" }), "Aging Report"] }), _jsx(CardDescription, { children: "Detailed accounts receivable aging analysis" })] }), _jsxs(CardContent, { children: [_jsx(Badge, { children: "Weekly" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "Track outstanding claims by age" }), _jsxs(Button, { className: "w-full mt-4", variant: "outline", children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "Generate Report"] })] })] }), _jsxs(Card, { className: "cursor-pointer hover:bg-gray-50 transition-colors", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(PieChart, { className: "h-5 w-5 mr-2 text-primary" }), "Payer Analysis"] }), _jsx(CardDescription, { children: "Performance analysis by insurance payer" })] }), _jsxs(CardContent, { children: [_jsx(Badge, { children: "Monthly" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "Compare payer performance metrics" }), _jsxs(Button, { className: "w-full mt-4", variant: "outline", children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "Generate Report"] })] })] }), _jsxs(Card, { className: "cursor-pointer hover:bg-gray-50 transition-colors", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(TrendingUp, { className: "h-5 w-5 mr-2 text-primary" }), "Trend Analysis"] }), _jsx(CardDescription, { children: "Historical trends and forecasting" })] }), _jsxs(CardContent, { children: [_jsx(Badge, { children: "Quarterly" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "Identify patterns and predict future performance" }), _jsxs(Button, { className: "w-full mt-4", variant: "outline", children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "Generate Report"] })] })] }), _jsxs(Card, { className: "cursor-pointer hover:bg-gray-50 transition-colors", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(AlertCircle, { className: "h-5 w-5 mr-2 text-primary" }), "Denial Analysis"] }), _jsx(CardDescription, { children: "Comprehensive denial and appeal analysis" })] }), _jsxs(CardContent, { children: [_jsx(Badge, { children: "Monthly" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "Track denial patterns and appeal success" }), _jsxs(Button, { className: "w-full mt-4", variant: "outline", children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "Generate Report"] })] })] }), _jsxs(Card, { className: "cursor-pointer hover:bg-gray-50 transition-colors", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Calendar, { className: "h-5 w-5 mr-2 text-primary" }), "Cash Flow Projection"] }), _jsx(CardDescription, { children: "Future cash flow predictions and planning" })] }), _jsxs(CardContent, { children: [_jsx(Badge, { children: "Quarterly" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "Forecast expected cash flows" }), _jsxs(Button, { className: "w-full mt-4", variant: "outline", children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "Generate Report"] })] })] })] }) })] })] }));
};
export default RevenueAnalyticsDashboard;
