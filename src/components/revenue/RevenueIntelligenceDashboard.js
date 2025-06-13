import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, DollarSign, BarChart3, Target, Zap, AlertTriangle, CheckCircle, } from "lucide-react";
const RevenueIntelligenceDashboard = () => {
    const [forecast, setForecast] = useState(null);
    const [serviceMixOptimization, setServiceMixOptimization] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedScenario, setSelectedScenario] = useState("mostLikely");
    useEffect(() => {
        loadRevenueIntelligence();
    }, []);
    const loadRevenueIntelligence = async () => {
        try {
            setLoading(true);
            // Mock data - in production, this would call the actual API
            const mockForecast = {
                forecastId: "FORECAST-2024-001",
                predictions: [
                    {
                        period: new Date("2024-01-01"),
                        predictedGrossRevenue: 520000,
                        predictedNetRevenue: 442000,
                        predictedMargin: 0.24,
                        confidenceScore: 0.89,
                    },
                    {
                        period: new Date("2024-02-01"),
                        predictedGrossRevenue: 535000,
                        predictedNetRevenue: 454750,
                        predictedMargin: 0.25,
                        confidenceScore: 0.87,
                    },
                    {
                        period: new Date("2024-03-01"),
                        predictedGrossRevenue: 548000,
                        predictedNetRevenue: 465800,
                        predictedMargin: 0.26,
                        confidenceScore: 0.85,
                    },
                ],
                scenarioAnalysis: {
                    bestCase: {
                        totalRevenue: 6900000,
                        totalMargin: 1725000,
                        probability: 0.25,
                        keyDrivers: [
                            "market_expansion",
                            "payer_rate_increases",
                            "volume_growth",
                        ],
                    },
                    worstCase: {
                        totalRevenue: 5100000,
                        totalMargin: 918000,
                        probability: 0.2,
                        keyDrivers: [
                            "competitive_pressure",
                            "reimbursement_cuts",
                            "volume_decline",
                        ],
                    },
                    mostLikely: {
                        totalRevenue: 6000000,
                        totalMargin: 1320000,
                        probability: 0.55,
                        keyDrivers: [
                            "steady_growth",
                            "stable_reimbursement",
                            "market_maturity",
                        ],
                    },
                },
                riskFactors: [
                    {
                        riskType: "market",
                        description: "Competitive pressure from new market entrants",
                        probability: 0.35,
                        potentialImpact: 0.15,
                        mitigationStrategies: [
                            "Differentiate services",
                            "Improve quality metrics",
                        ],
                    },
                    {
                        riskType: "regulatory",
                        description: "Potential reimbursement rate changes",
                        probability: 0.25,
                        potentialImpact: 0.2,
                        mitigationStrategies: ["Diversify payer mix", "Improve efficiency"],
                    },
                ],
                opportunityAnalysis: [
                    {
                        opportunityType: "service_optimization",
                        description: "Optimize high-margin service lines",
                        potentialValue: 250000,
                        implementationEffort: "medium",
                        timeToRealization: 6,
                        roi: 4.0,
                    },
                    {
                        opportunityType: "payer_negotiation",
                        description: "Renegotiate contracts with top payers",
                        potentialValue: 180000,
                        implementationEffort: "high",
                        timeToRealization: 12,
                        roi: 6.2,
                    },
                ],
            };
            const mockServiceMix = {
                optimizationId: "OPT-2024-001",
                expectedResults: {
                    totalRevenueIncrease: 125000,
                    totalMarginImprovement: 0.03,
                    capacityUtilizationImprovement: 0.08,
                    roi: 2.5,
                },
            };
            setForecast(mockForecast);
            setServiceMixOptimization(mockServiceMix);
        }
        catch (error) {
            console.error("Error loading revenue intelligence:", error);
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
    const getScenarioColor = (scenario) => {
        switch (scenario) {
            case "bestCase":
                return "text-green-600";
            case "worstCase":
                return "text-red-600";
            case "mostLikely":
                return "text-blue-600";
            default:
                return "text-gray-600";
        }
    };
    const getRiskColor = (impact) => {
        if (impact >= 0.15)
            return "text-red-600";
        if (impact >= 0.1)
            return "text-yellow-600";
        return "text-green-600";
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64 bg-white", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "Loading Revenue Intelligence..." })] }) }));
    }
    const selectedScenarioData = forecast?.scenarioAnalysis[selectedScenario];
    return (_jsxs("div", { className: "p-6 space-y-6 bg-gray-50 min-h-screen", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-3xl font-bold text-gray-900 flex items-center gap-2", children: [_jsx(TrendingUp, { className: "h-8 w-8 text-green-600" }), "Revenue Intelligence Dashboard"] }), _jsx("p", { className: "text-gray-600 mt-2", children: "AI-powered revenue forecasting and service mix optimization" })] }), _jsxs(Button, { onClick: loadRevenueIntelligence, className: "flex items-center gap-2", children: [_jsx(Zap, { className: "h-4 w-4" }), "Refresh Intelligence"] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Predicted Revenue" }), _jsx(DollarSign, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: formatCurrency(selectedScenarioData?.totalRevenue || 0) }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [selectedScenario === "mostLikely"
                                                ? "Most Likely"
                                                : selectedScenario === "bestCase"
                                                    ? "Best Case"
                                                    : "Worst Case", " ", "Scenario"] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Predicted Margin" }), _jsx(BarChart3, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: formatCurrency(selectedScenarioData?.totalMargin || 0) }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [(((selectedScenarioData?.totalMargin || 0) /
                                                (selectedScenarioData?.totalRevenue || 1)) *
                                                100).toFixed(1), "% margin rate"] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Optimization ROI" }), _jsx(Target, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold", children: [serviceMixOptimization?.expectedResults.roi.toFixed(1), "x"] }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Service mix optimization" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Revenue Increase" }), _jsx(TrendingUp, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: formatCurrency(serviceMixOptimization?.expectedResults.totalRevenueIncrease ||
                                            0) }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Potential annual increase" })] })] })] }), _jsxs(Tabs, { defaultValue: "forecast", className: "space-y-4", children: [_jsxs(TabsList, { children: [_jsx(TabsTrigger, { value: "forecast", children: "Revenue Forecast" }), _jsx(TabsTrigger, { value: "scenarios", children: "Scenario Analysis" }), _jsx(TabsTrigger, { value: "optimization", children: "Service Mix Optimization" }), _jsx(TabsTrigger, { value: "risks", children: "Risk & Opportunities" })] }), _jsx(TabsContent, { value: "forecast", className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Monthly Revenue Predictions" }), _jsx(CardDescription, { children: "AI-powered revenue forecasting with confidence intervals" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: forecast?.predictions.map((prediction, index) => (_jsxs("div", { className: "border rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h3", { className: "font-semibold", children: prediction.period.toLocaleDateString("en-US", {
                                                                        month: "long",
                                                                        year: "numeric",
                                                                    }) }), _jsxs(Badge, { className: "bg-blue-100 text-blue-800", children: [(prediction.confidenceScore * 100).toFixed(1), "% confidence"] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("p", { className: "text-gray-600", children: "Gross Revenue" }), _jsx("p", { className: "font-semibold", children: formatCurrency(prediction.predictedGrossRevenue) })] }), _jsxs("div", { children: [_jsx("p", { className: "text-gray-600", children: "Net Revenue" }), _jsx("p", { className: "font-semibold", children: formatCurrency(prediction.predictedNetRevenue) })] })] }), _jsxs("div", { className: "mt-3", children: [_jsxs("div", { className: "flex items-center justify-between text-sm text-gray-600 mb-1", children: [_jsx("span", { children: "Predicted Margin" }), _jsxs("span", { children: [(prediction.predictedMargin * 100).toFixed(1), "%"] })] }), _jsx(Progress, { value: prediction.predictedMargin * 100, className: "h-2" })] })] }, index))) }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Model Performance" }), _jsx(CardDescription, { children: "ARIMA + LSTM Hybrid model accuracy metrics" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-6", children: [_jsxs(Alert, { children: [_jsx(CheckCircle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: "Model v3.2-arima-lstm achieving 92% accuracy with 95% data quality score" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { children: "Forecast Accuracy" }), _jsx("span", { children: "92.0%" })] }), _jsx(Progress, { value: 92, className: "h-2" })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { children: "Data Quality Score" }), _jsx("span", { children: "95.0%" })] }), _jsx(Progress, { value: 95, className: "h-2" })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { children: "Model Confidence" }), _jsx("span", { children: "87.2%" })] }), _jsx(Progress, { value: 87.2, className: "h-2" })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold mb-2", children: "Feature Importance" }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Historical Revenue Trends" }), _jsx(Badge, { variant: "outline", children: "25%" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Patient Volume Patterns" }), _jsx(Badge, { variant: "outline", children: "20%" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Payer Mix Changes" }), _jsx(Badge, { variant: "outline", children: "18%" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Seasonal Adjustments" }), _jsx(Badge, { variant: "outline", children: "15%" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Economic Indicators" }), _jsx(Badge, { variant: "outline", children: "12%" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Regulatory Changes" }), _jsx(Badge, { variant: "outline", children: "10%" })] })] })] })] }) })] })] }) }), _jsx(TabsContent, { value: "scenarios", className: "space-y-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Scenario Analysis" }), _jsx(CardDescription, { children: "Compare different revenue scenarios with probability assessments" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "flex gap-2", children: ["bestCase", "mostLikely", "worstCase"].map((scenario) => (_jsx(Button, { variant: selectedScenario === scenario ? "default" : "outline", onClick: () => setSelectedScenario(scenario), className: "capitalize", children: scenario === "bestCase"
                                                        ? "Best Case"
                                                        : scenario === "mostLikely"
                                                            ? "Most Likely"
                                                            : "Worst Case" }, scenario))) }), selectedScenarioData && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs("div", { className: "text-center p-6 bg-blue-50 rounded-lg", children: [_jsx("div", { className: `text-3xl font-bold ${getScenarioColor(selectedScenario)}`, children: formatCurrency(selectedScenarioData.totalRevenue) }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Total Revenue" })] }), _jsxs("div", { className: "text-center p-6 bg-green-50 rounded-lg", children: [_jsx("div", { className: `text-3xl font-bold ${getScenarioColor(selectedScenario)}`, children: formatCurrency(selectedScenarioData.totalMargin) }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Total Margin" })] }), _jsxs("div", { className: "text-center p-6 bg-purple-50 rounded-lg", children: [_jsxs("div", { className: `text-3xl font-bold ${getScenarioColor(selectedScenario)}`, children: [(selectedScenarioData.probability * 100).toFixed(1), "%"] }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Probability" })] })] })), selectedScenarioData && (_jsxs("div", { children: [_jsx("h4", { className: "font-semibold mb-3", children: "Key Drivers" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-3", children: selectedScenarioData.keyDrivers.map((driver, index) => (_jsx(Badge, { variant: "outline", className: "justify-center p-2", children: driver
                                                                .replace("_", " ")
                                                                .replace(/\b\w/g, (l) => l.toUpperCase()) }, index))) })] }))] }) })] }) }), _jsx(TabsContent, { value: "optimization", className: "space-y-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Service Mix Optimization" }), _jsx(CardDescription, { children: "AI-powered optimization for maximum revenue and margin improvement" })] }), _jsx(CardContent, { children: serviceMixOptimization && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs("div", { className: "text-center p-4 bg-green-50 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: formatCurrency(serviceMixOptimization.expectedResults
                                                                    .totalRevenueIncrease) }), _jsx("p", { className: "text-sm text-gray-600", children: "Revenue Increase" })] }), _jsxs("div", { className: "text-center p-4 bg-blue-50 rounded-lg", children: [_jsxs("div", { className: "text-2xl font-bold text-blue-600", children: ["+", (serviceMixOptimization.expectedResults
                                                                        .totalMarginImprovement * 100).toFixed(1), "%"] }), _jsx("p", { className: "text-sm text-gray-600", children: "Margin Improvement" })] }), _jsxs("div", { className: "text-center p-4 bg-purple-50 rounded-lg", children: [_jsxs("div", { className: "text-2xl font-bold text-purple-600", children: ["+", (serviceMixOptimization.expectedResults
                                                                        .capacityUtilizationImprovement * 100).toFixed(1), "%"] }), _jsx("p", { className: "text-sm text-gray-600", children: "Capacity Utilization" })] }), _jsxs("div", { className: "text-center p-4 bg-orange-50 rounded-lg", children: [_jsxs("div", { className: "text-2xl font-bold text-orange-600", children: [serviceMixOptimization.expectedResults.roi.toFixed(1), "x"] }), _jsx("p", { className: "text-sm text-gray-600", children: "Return on Investment" })] })] }), _jsxs(Alert, { children: [_jsx(Target, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: "Optimization algorithm considers revenue maximization (40%), margin optimization (35%), and capacity utilization (25%) with operational constraints." })] })] })) })] }) }), _jsx(TabsContent, { value: "risks", className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Revenue Risk Factors" }), _jsx(CardDescription, { children: "Identified risks with probability and impact assessment" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: forecast?.riskFactors.map((risk, index) => (_jsxs("div", { className: "border rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(AlertTriangle, { className: `h-4 w-4 ${getRiskColor(risk.potentialImpact)}` }), _jsxs("span", { className: "font-medium capitalize", children: [risk.riskType, " Risk"] }), _jsxs(Badge, { variant: risk.potentialImpact >= 0.15
                                                                        ? "destructive"
                                                                        : risk.potentialImpact >= 0.1
                                                                            ? "default"
                                                                            : "secondary", children: [(risk.potentialImpact * 100).toFixed(1), "% impact"] })] }), _jsx("p", { className: "text-sm text-gray-600 mb-3", children: risk.description }), _jsxs("div", { className: "mb-3", children: [_jsxs("div", { className: "flex justify-between text-sm text-gray-600 mb-1", children: [_jsx("span", { children: "Probability" }), _jsxs("span", { children: [(risk.probability * 100).toFixed(1), "%"] })] }), _jsx(Progress, { value: risk.probability * 100, className: "h-2" })] }), _jsxs("div", { children: [_jsx("h5", { className: "text-sm font-medium mb-2", children: "Mitigation Strategies" }), _jsx("div", { className: "space-y-1", children: risk.mitigationStrategies.map((strategy, strategyIndex) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(CheckCircle, { className: "h-3 w-3 text-green-600" }), _jsx("span", { className: "text-sm", children: strategy })] }, strategyIndex))) })] })] }, index))) }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Revenue Opportunities" }), _jsx(CardDescription, { children: "Identified opportunities for revenue growth and optimization" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: forecast?.opportunityAnalysis.map((opportunity, index) => (_jsxs("div", { className: "border rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(TrendingUp, { className: "h-4 w-4 text-green-600" }), _jsx("span", { className: "font-medium capitalize", children: opportunity.opportunityType.replace("_", " ") }), _jsx(Badge, { className: "bg-green-100 text-green-800", children: formatCurrency(opportunity.potentialValue) })] }), _jsx("p", { className: "text-sm text-gray-600 mb-3", children: opportunity.description }), _jsxs("div", { className: "grid grid-cols-3 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("p", { className: "text-gray-500", children: "Implementation" }), _jsx("p", { className: "font-medium capitalize", children: opportunity.implementationEffort })] }), _jsxs("div", { children: [_jsx("p", { className: "text-gray-500", children: "Timeline" }), _jsxs("p", { className: "font-medium", children: [opportunity.timeToRealization, " months"] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-gray-500", children: "ROI" }), _jsxs("p", { className: "font-medium", children: [opportunity.roi.toFixed(1), "x"] })] })] })] }, index))) }) })] })] }) })] })] }));
};
export default RevenueIntelligenceDashboard;
