import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, CheckCircle, AlertTriangle, TrendingUp, Clock, Target, Zap, BarChart3, } from "lucide-react";
const SmartClaimsAnalyticsDashboard = () => {
    const [claimsAnalytics, setClaimsAnalytics] = useState([]);
    const [paymentPredictions, setPaymentPredictions] = useState([]);
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedClaim, setSelectedClaim] = useState(null);
    useEffect(() => {
        loadSmartClaimsIntelligence();
    }, []);
    const loadSmartClaimsIntelligence = async () => {
        try {
            setLoading(true);
            // Mock data - in production, this would call the actual API
            const mockClaimsAnalytics = [
                {
                    claimAnalyticsId: "1",
                    claimId: "CLM-2024-001",
                    cleanClaimProbability: 0.92,
                    denialRiskScore: 0.15,
                    documentationQualityScore: 0.88,
                    codingAccuracyScore: 0.94,
                    authorizationAlignmentScore: 0.91,
                    predictedOutcome: "approved",
                    processingTimeEstimate: 3.2,
                    optimizationSuggestions: [
                        {
                            category: "documentation",
                            suggestion: "Add specific outcome measures to clinical notes",
                            expectedImpact: 8,
                            implementationEffort: "low",
                            priority: 1,
                        },
                    ],
                },
                {
                    claimAnalyticsId: "2",
                    claimId: "CLM-2024-002",
                    cleanClaimProbability: 0.76,
                    denialRiskScore: 0.35,
                    documentationQualityScore: 0.72,
                    codingAccuracyScore: 0.81,
                    authorizationAlignmentScore: 0.68,
                    predictedOutcome: "partial",
                    processingTimeEstimate: 7.1,
                    optimizationSuggestions: [
                        {
                            category: "authorization",
                            suggestion: "Verify authorization requirements alignment",
                            expectedImpact: 25,
                            implementationEffort: "medium",
                            priority: 1,
                        },
                        {
                            category: "coding",
                            suggestion: "Review and optimize diagnostic codes",
                            expectedImpact: 15,
                            implementationEffort: "low",
                            priority: 2,
                        },
                    ],
                },
            ];
            const mockPaymentPredictions = [
                {
                    claimId: "CLM-2024-001",
                    paymentProbability: 0.89,
                    expectedPaymentAmount: 2850,
                    expectedPaymentDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                    paymentRisk: 0.12,
                    confidenceScore: 0.91,
                },
                {
                    claimId: "CLM-2024-002",
                    paymentProbability: 0.67,
                    expectedPaymentAmount: 1920,
                    expectedPaymentDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
                    paymentRisk: 0.28,
                    confidenceScore: 0.84,
                },
            ];
            const mockMetrics = {
                totalClaimsAnalyzed: 342,
                averageCleanClaimRate: 0.84,
                averageDenialRiskReduction: 0.23,
                averageProcessingTimeReduction: 2.8,
                optimizationImpact: {
                    successRateImprovement: 0.18,
                    costSavings: 125000,
                    timeReduction: 3.2,
                },
            };
            setClaimsAnalytics(mockClaimsAnalytics);
            setPaymentPredictions(mockPaymentPredictions);
            setMetrics(mockMetrics);
        }
        catch (error) {
            console.error("Error loading smart claims intelligence:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-AE", {
            style: "currency",
            currency: "AED",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };
    const getCleanClaimColor = (probability) => {
        if (probability >= 0.85)
            return "text-green-600";
        if (probability >= 0.7)
            return "text-yellow-600";
        return "text-red-600";
    };
    const getCleanClaimBadge = (probability) => {
        if (probability >= 0.85)
            return _jsx(Badge, { className: "bg-green-100 text-green-800", children: "High" });
        if (probability >= 0.7)
            return _jsx(Badge, { className: "bg-yellow-100 text-yellow-800", children: "Medium" });
        return _jsx(Badge, { className: "bg-red-100 text-red-800", children: "Low" });
    };
    const getRiskColor = (risk) => {
        if (risk >= 0.3)
            return "text-red-600";
        if (risk >= 0.2)
            return "text-yellow-600";
        return "text-green-600";
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64 bg-white", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "Loading Smart Claims Analytics..." })] }) }));
    }
    return (_jsxs("div", { className: "p-6 space-y-6 bg-gray-50 min-h-screen", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-3xl font-bold text-gray-900 flex items-center gap-2", children: [_jsx(FileText, { className: "h-8 w-8 text-blue-600" }), "Smart Claims Analytics Dashboard"] }), _jsx("p", { className: "text-gray-600 mt-2", children: "AI-powered claims processing optimization and payment predictions" })] }), _jsxs(Button, { onClick: loadSmartClaimsIntelligence, className: "flex items-center gap-2", children: [_jsx(Zap, { className: "h-4 w-4" }), "Refresh Analytics"] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Claims Analyzed" }), _jsx(BarChart3, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: metrics?.totalClaimsAnalyzed || 0 }), _jsx("p", { className: "text-xs text-muted-foreground", children: "+15% from last month" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Clean Claim Rate" }), _jsx(CheckCircle, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold", children: [((metrics?.averageCleanClaimRate || 0) * 100).toFixed(1), "%"] }), _jsx("p", { className: "text-xs text-muted-foreground", children: "+12% improvement" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Denial Risk Reduction" }), _jsx(Target, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold", children: [((metrics?.averageDenialRiskReduction || 0) * 100).toFixed(1), "%"] }), _jsx("p", { className: "text-xs text-muted-foreground", children: "AI-powered optimization" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Processing Time Saved" }), _jsx(Clock, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold", children: [metrics?.averageProcessingTimeReduction || 0, " days"] }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Average reduction" })] })] })] }), _jsxs(Tabs, { defaultValue: "analytics", className: "space-y-4", children: [_jsxs(TabsList, { children: [_jsx(TabsTrigger, { value: "analytics", children: "Claims Analytics" }), _jsx(TabsTrigger, { value: "predictions", children: "Payment Predictions" }), _jsx(TabsTrigger, { value: "optimization", children: "Optimization Engine" }), _jsx(TabsTrigger, { value: "insights", children: "Intelligence Insights" })] }), _jsx(TabsContent, { value: "analytics", className: "space-y-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Smart Claims Analysis" }), _jsx(CardDescription, { children: "AI-powered analysis of claim quality and optimization opportunities" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: claimsAnalytics.map((claim) => (_jsxs("div", { className: "border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors", onClick: () => setSelectedClaim(claim), children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("h3", { className: "font-semibold", children: claim.claimId }), getCleanClaimBadge(claim.cleanClaimProbability)] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: `text-lg font-bold ${getCleanClaimColor(claim.cleanClaimProbability)}`, children: [(claim.cleanClaimProbability * 100).toFixed(1), "%"] }), _jsx("div", { className: "text-sm text-gray-500", children: "Clean Claim Probability" })] })] }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-sm text-gray-600", children: "Documentation" }), _jsxs("div", { className: "font-semibold", children: [(claim.documentationQualityScore * 100).toFixed(0), "%"] })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-sm text-gray-600", children: "Coding" }), _jsxs("div", { className: "font-semibold", children: [(claim.codingAccuracyScore * 100).toFixed(0), "%"] })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-sm text-gray-600", children: "Authorization" }), _jsxs("div", { className: "font-semibold", children: [(claim.authorizationAlignmentScore * 100).toFixed(0), "%"] })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-sm text-gray-600", children: "Processing Time" }), _jsxs("div", { className: "font-semibold", children: [claim.processingTimeEstimate, " days"] })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(AlertTriangle, { className: `h-4 w-4 ${getRiskColor(claim.denialRiskScore)}` }), _jsxs("span", { className: "text-sm", children: ["Denial Risk:", " ", (claim.denialRiskScore * 100).toFixed(1), "%"] })] }), _jsxs(Badge, { variant: "outline", children: [claim.optimizationSuggestions.length, " optimization", claim.optimizationSuggestions.length !== 1 ? "s" : ""] })] }), _jsxs("div", { className: "mt-3", children: [_jsxs("div", { className: "flex items-center justify-between text-sm text-gray-600 mb-1", children: [_jsx("span", { children: "Overall Quality Score" }), _jsxs("span", { children: [(((claim.documentationQualityScore +
                                                                            claim.codingAccuracyScore +
                                                                            claim.authorizationAlignmentScore) /
                                                                            3) *
                                                                            100).toFixed(1), "%"] })] }), _jsx(Progress, { value: ((claim.documentationQualityScore +
                                                                claim.codingAccuracyScore +
                                                                claim.authorizationAlignmentScore) /
                                                                3) *
                                                                100, className: "h-2" })] })] }, claim.claimAnalyticsId))) }) })] }) }), _jsx(TabsContent, { value: "predictions", className: "space-y-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Payment Predictions" }), _jsx(CardDescription, { children: "AI-powered predictions for claim payment probability and timing" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: paymentPredictions.map((prediction) => (_jsxs("div", { className: "border rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h3", { className: "font-semibold", children: prediction.claimId }), _jsxs(Badge, { className: `${prediction.paymentProbability >= 0.8 ? "bg-green-100 text-green-800" : prediction.paymentProbability >= 0.6 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`, children: [(prediction.paymentProbability * 100).toFixed(1), "% payment probability"] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "text-center p-3 bg-blue-50 rounded-lg", children: [_jsx("div", { className: "text-lg font-bold text-blue-600", children: formatCurrency(prediction.expectedPaymentAmount) }), _jsx("p", { className: "text-sm text-gray-600", children: "Expected Payment" })] }), _jsxs("div", { className: "text-center p-3 bg-green-50 rounded-lg", children: [_jsx("div", { className: "text-lg font-bold text-green-600", children: prediction.expectedPaymentDate.toLocaleDateString() }), _jsx("p", { className: "text-sm text-gray-600", children: "Expected Date" })] }), _jsxs("div", { className: "text-center p-3 bg-purple-50 rounded-lg", children: [_jsxs("div", { className: "text-lg font-bold text-purple-600", children: [(prediction.confidenceScore * 100).toFixed(1), "%"] }), _jsx("p", { className: "text-sm text-gray-600", children: "Confidence" })] })] }), _jsxs("div", { className: "mt-4", children: [_jsxs("div", { className: "flex items-center justify-between text-sm text-gray-600 mb-1", children: [_jsx("span", { children: "Payment Risk" }), _jsxs("span", { className: getRiskColor(prediction.paymentRisk), children: [(prediction.paymentRisk * 100).toFixed(1), "%"] })] }), _jsx(Progress, { value: prediction.paymentRisk * 100, className: "h-2" })] })] }, prediction.claimId))) }) })] }) }), _jsx(TabsContent, { value: "optimization", className: "space-y-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Claims Optimization Engine" }), _jsx(CardDescription, { children: "Advanced AI algorithms for claims processing optimization" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-6", children: [_jsxs(Alert, { children: [_jsx(CheckCircle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: "Multi-layered AI engine analyzing documentation quality, coding accuracy, and authorization alignment for optimal claim success rates." })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold mb-3", children: "Optimization Categories" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between p-3 bg-blue-50 rounded-lg", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: "Documentation Quality" }), _jsx("div", { className: "text-sm text-gray-600", children: "Clinical notes and supporting evidence" })] }), _jsx(Badge, { variant: "outline", children: "35%" })] }), _jsxs("div", { className: "flex items-center justify-between p-3 bg-green-50 rounded-lg", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: "Coding Accuracy" }), _jsx("div", { className: "text-sm text-gray-600", children: "ICD-10 and CPT code optimization" })] }), _jsx(Badge, { variant: "outline", children: "30%" })] }), _jsxs("div", { className: "flex items-center justify-between p-3 bg-purple-50 rounded-lg", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: "Authorization Alignment" }), _jsx("div", { className: "text-sm text-gray-600", children: "Prior auth requirements matching" })] }), _jsx(Badge, { variant: "outline", children: "25%" })] }), _jsxs("div", { className: "flex items-center justify-between p-3 bg-orange-50 rounded-lg", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: "Submission Timing" }), _jsx("div", { className: "text-sm text-gray-600", children: "Optimal submission windows" })] }), _jsx(Badge, { variant: "outline", children: "10%" })] })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold mb-3", children: "Performance Metrics" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { children: "Clean Claim Rate" }), _jsx("span", { children: "84.2%" })] }), _jsx(Progress, { value: 84.2, className: "h-2" })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { children: "Denial Prevention" }), _jsx("span", { children: "23.1%" })] }), _jsx(Progress, { value: 23.1, className: "h-2" })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { children: "Processing Acceleration" }), _jsx("span", { children: "45.8%" })] }), _jsx(Progress, { value: 45.8, className: "h-2" })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { children: "Cost Reduction" }), _jsx("span", { children: "18.7%" })] }), _jsx(Progress, { value: 18.7, className: "h-2" })] })] })] })] })] }) })] }) }), _jsx(TabsContent, { value: "insights", className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Intelligence Impact" }), _jsx(CardDescription, { children: "Measurable improvements from AI-powered claims optimization" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-3xl font-bold text-green-600", children: ["+", ((metrics?.optimizationImpact?.successRateImprovement ||
                                                                        0) * 100).toFixed(1), "%"] }), _jsx("p", { className: "text-sm text-gray-600", children: "Success Rate Improvement" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-center", children: [_jsxs("div", { children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: formatCurrency(metrics?.optimizationImpact?.costSavings || 0) }), _jsx("p", { className: "text-xs text-gray-600", children: "Cost Savings" })] }), _jsxs("div", { children: [_jsxs("div", { className: "text-2xl font-bold text-purple-600", children: [metrics?.optimizationImpact?.timeReduction || 0, " days"] }), _jsx("p", { className: "text-xs text-gray-600", children: "Time Reduction" })] })] })] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Key Insights" }), _jsx(CardDescription, { children: "AI-generated insights from claims processing analysis" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-start gap-3 p-3 bg-blue-50 rounded-lg", children: [_jsx(TrendingUp, { className: "h-5 w-5 text-blue-600 mt-0.5" }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-blue-900", children: "Documentation Enhancement" }), _jsx("div", { className: "text-sm text-blue-700", children: "Claims with enhanced clinical documentation show 35% higher approval rates" })] })] }), _jsxs("div", { className: "flex items-start gap-3 p-3 bg-green-50 rounded-lg", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-green-600 mt-0.5" }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-green-900", children: "Coding Optimization" }), _jsx("div", { className: "text-sm text-green-700", children: "AI-optimized coding reduces denial rates by 23% on average" })] })] }), _jsxs("div", { className: "flex items-start gap-3 p-3 bg-purple-50 rounded-lg", children: [_jsx(Target, { className: "h-5 w-5 text-purple-600 mt-0.5" }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-purple-900", children: "Authorization Alignment" }), _jsx("div", { className: "text-sm text-purple-700", children: "Perfect authorization alignment increases success probability by 28%" })] })] }), _jsxs("div", { className: "flex items-start gap-3 p-3 bg-orange-50 rounded-lg", children: [_jsx(Clock, { className: "h-5 w-5 text-orange-600 mt-0.5" }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-orange-900", children: "Processing Speed" }), _jsx("div", { className: "text-sm text-orange-700", children: "Optimized claims process 4.5 days faster than standard submissions" })] })] })] }) })] })] }) })] }), selectedClaim && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50", children: _jsxs(Card, { className: "w-full max-w-4xl max-h-[90vh] overflow-y-auto", children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { children: "Claim Analysis Details" }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setSelectedClaim(null), children: "Close" })] }), _jsxs(CardDescription, { children: [selectedClaim.claimId, " - Comprehensive AI Analysis"] })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "text-center p-4 bg-blue-50 rounded-lg", children: [_jsxs("div", { className: "text-2xl font-bold text-blue-600", children: [(selectedClaim.cleanClaimProbability * 100).toFixed(1), "%"] }), _jsx("p", { className: "text-sm text-gray-600", children: "Clean Claim Probability" })] }), _jsxs("div", { className: "text-center p-4 bg-red-50 rounded-lg", children: [_jsxs("div", { className: "text-2xl font-bold text-red-600", children: [(selectedClaim.denialRiskScore * 100).toFixed(1), "%"] }), _jsx("p", { className: "text-sm text-gray-600", children: "Denial Risk Score" })] }), _jsxs("div", { className: "text-center p-4 bg-green-50 rounded-lg", children: [_jsxs("div", { className: "text-2xl font-bold text-green-600", children: [selectedClaim.processingTimeEstimate, " days"] }), _jsx("p", { className: "text-sm text-gray-600", children: "Processing Time" })] }), _jsxs("div", { className: "text-center p-4 bg-purple-50 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-purple-600", children: selectedClaim.predictedOutcome }), _jsx("p", { className: "text-sm text-gray-600", children: "Predicted Outcome" })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold mb-3", children: "Quality Scores" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { children: "Documentation Quality" }), _jsxs("span", { children: [(selectedClaim.documentationQualityScore * 100).toFixed(1), "%"] })] }), _jsx(Progress, { value: selectedClaim.documentationQualityScore * 100, className: "h-2" })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { children: "Coding Accuracy" }), _jsxs("span", { children: [(selectedClaim.codingAccuracyScore * 100).toFixed(1), "%"] })] }), _jsx(Progress, { value: selectedClaim.codingAccuracyScore * 100, className: "h-2" })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { children: "Authorization Alignment" }), _jsxs("span", { children: [(selectedClaim.authorizationAlignmentScore * 100).toFixed(1), "%"] })] }), _jsx(Progress, { value: selectedClaim.authorizationAlignmentScore * 100, className: "h-2" })] })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold mb-3", children: "Optimization Suggestions" }), _jsx("div", { className: "space-y-3", children: selectedClaim.optimizationSuggestions.map((suggestion, index) => (_jsxs("div", { className: "border rounded-lg p-3", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(TrendingUp, { className: "h-4 w-4 text-green-600" }), _jsx("span", { className: "font-medium capitalize", children: suggestion.category }), _jsxs(Badge, { variant: "outline", children: ["+", suggestion.expectedImpact, "%"] })] }), _jsx("p", { className: "text-sm text-gray-600 mb-2", children: suggestion.suggestion }), _jsxs("div", { className: "flex items-center justify-between text-xs", children: [_jsxs("span", { className: "text-gray-500", children: ["Effort: ", suggestion.implementationEffort] }), _jsxs("span", { className: "text-gray-500", children: ["Priority: ", suggestion.priority] })] })] }, index))) })] })] })] }) })] }) }))] }));
};
export default SmartClaimsAnalyticsDashboard;
