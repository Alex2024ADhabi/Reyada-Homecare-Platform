import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, AlertTriangle, CheckCircle, Activity, Target, Brain, Lightbulb, Clock, Users, } from "lucide-react";
import { damanAnalyticsIntelligence } from "@/services/daman-analytics-intelligence.service";
export const DamanPredictiveAnalytics = ({ authorizationData, onRecommendationApply }) => {
    const [prediction, setPrediction] = useState(null);
    const [performanceMetrics, setPerformanceMetrics] = useState(null);
    const [trendAnalysis, setTrendAnalysis] = useState(null);
    const [slaCompliance, setSlaCompliance] = useState(null);
    const [capacityPlanning, setCapacityPlanning] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTimeRange, setSelectedTimeRange] = useState("month");
    useEffect(() => {
        loadAnalyticsData();
    }, [selectedTimeRange]);
    const loadAnalyticsData = async () => {
        setIsLoading(true);
        try {
            // Load all analytics data
            const [predictionResult, trendsResult, slaResult, capacityResult] = await Promise.all([
                authorizationData
                    ? damanAnalyticsIntelligence.predictAuthorizationSuccess(authorizationData)
                    : null,
                damanAnalyticsIntelligence.performTrendAnalysis(selectedTimeRange),
                damanAnalyticsIntelligence.monitorSLACompliance(),
                damanAnalyticsIntelligence.performCapacityPlanning("quarter"),
            ]);
            setPrediction(predictionResult);
            setTrendAnalysis(trendsResult);
            setSlaCompliance(slaResult);
            setCapacityPlanning(capacityResult);
            // Mock performance metrics
            setPerformanceMetrics({
                averageProcessingTime: 36,
                successRate: 0.92,
                denialRate: 0.08,
                resubmissionRate: 0.05,
                slaCompliance: 0.94,
                bottlenecks: ["Document validation", "Clinical review"],
                trends: {
                    daily: [85, 87, 89, 91, 88, 92, 94],
                    weekly: [88, 90, 89, 92, 91, 93, 95],
                    monthly: [87, 89, 91, 93, 92, 94, 96],
                },
            });
        }
        catch (error) {
            console.error("Failed to load analytics data:", error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const getProbabilityColor = (probability) => {
        if (probability >= 0.8)
            return "text-green-600";
        if (probability >= 0.6)
            return "text-yellow-600";
        return "text-red-600";
    };
    const getProbabilityBadgeVariant = (probability) => {
        if (probability >= 0.8)
            return "default";
        if (probability >= 0.6)
            return "secondary";
        return "destructive";
    };
    const renderPredictionCard = () => {
        if (!prediction)
            return null;
        return (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Brain, { className: "h-5 w-5" }), "Authorization Success Prediction"] }), _jsx(CardDescription, { children: "AI-powered analysis of approval probability" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "text-center", children: [_jsxs("div", { className: `text-4xl font-bold ${getProbabilityColor(prediction.authorizationSuccessProbability)}`, children: [Math.round(prediction.authorizationSuccessProbability * 100), "%"] }), _jsx("div", { className: "text-sm text-gray-600 mt-1", children: "Success Probability" }), _jsxs(Badge, { variant: getProbabilityBadgeVariant(prediction.authorizationSuccessProbability), className: "mt-2", children: ["Confidence: ", Math.round(prediction.confidenceLevel * 100), "%"] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "text-center p-3 bg-red-50 rounded-lg", children: [_jsxs("div", { className: "text-2xl font-bold text-red-600", children: [Math.round(prediction.denialRiskScore * 100), "%"] }), _jsx("div", { className: "text-sm text-red-700", children: "Denial Risk" })] }), _jsxs("div", { className: "text-center p-3 bg-blue-50 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: prediction.factors.positive.length }), _jsx("div", { className: "text-sm text-blue-700", children: "Positive Factors" })] })] }), _jsxs("div", { className: "space-y-3", children: [prediction.factors.positive.length > 0 && (_jsxs("div", { children: [_jsxs("h4", { className: "text-sm font-medium text-green-700 mb-2 flex items-center gap-1", children: [_jsx(CheckCircle, { className: "h-4 w-4" }), "Positive Factors"] }), _jsx("ul", { className: "text-sm space-y-1", children: prediction.factors.positive.map((factor, index) => (_jsxs("li", { className: "text-green-600", children: ["\u2022 ", factor] }, index))) })] })), prediction.factors.negative.length > 0 && (_jsxs("div", { children: [_jsxs("h4", { className: "text-sm font-medium text-red-700 mb-2 flex items-center gap-1", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), "Risk Factors"] }), _jsx("ul", { className: "text-sm space-y-1", children: prediction.factors.negative.map((factor, index) => (_jsxs("li", { className: "text-red-600", children: ["\u2022 ", factor] }, index))) })] }))] }), prediction.recommendedActions.length > 0 && (_jsxs("div", { children: [_jsxs("h4", { className: "text-sm font-medium mb-2 flex items-center gap-1", children: [_jsx(Lightbulb, { className: "h-4 w-4" }), "Recommended Actions"] }), _jsx("div", { className: "space-y-2", children: prediction.recommendedActions.map((action, index) => (_jsxs("div", { className: "flex items-center justify-between p-2 bg-gray-50 rounded", children: [_jsx("span", { className: "text-sm", children: action }), onRecommendationApply && (_jsx(Button, { size: "sm", variant: "outline", onClick: () => onRecommendationApply(action), children: "Apply" }))] }, index))) })] }))] })] }));
    };
    const renderPerformanceMetrics = () => {
        if (!performanceMetrics)
            return null;
        return (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx(Card, { children: _jsxs(CardContent, { className: "pt-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Avg Processing Time" }), _jsxs("p", { className: "text-2xl font-bold", children: [performanceMetrics.averageProcessingTime, "h"] })] }), _jsx(Clock, { className: "h-8 w-8 text-blue-600" })] }), _jsxs("div", { className: "mt-2", children: [_jsx(Progress, { value: 75, className: "h-2" }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Target: 48h" })] })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "pt-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Success Rate" }), _jsxs("p", { className: "text-2xl font-bold text-green-600", children: [Math.round(performanceMetrics.successRate * 100), "%"] })] }), _jsx(CheckCircle, { className: "h-8 w-8 text-green-600" })] }), _jsxs("div", { className: "mt-2", children: [_jsx(Progress, { value: performanceMetrics.successRate * 100, className: "h-2" }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Target: 95%" })] })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "pt-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Denial Rate" }), _jsxs("p", { className: "text-2xl font-bold text-red-600", children: [Math.round(performanceMetrics.denialRate * 100), "%"] })] }), _jsx(AlertTriangle, { className: "h-8 w-8 text-red-600" })] }), _jsxs("div", { className: "mt-2", children: [_jsx(Progress, { value: performanceMetrics.denialRate * 100, className: "h-2" }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Target: <5%" })] })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "pt-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "SLA Compliance" }), _jsxs("p", { className: "text-2xl font-bold text-blue-600", children: [Math.round(performanceMetrics.slaCompliance * 100), "%"] })] }), _jsx(Target, { className: "h-8 w-8 text-blue-600" })] }), _jsxs("div", { className: "mt-2", children: [_jsx(Progress, { value: performanceMetrics.slaCompliance * 100, className: "h-2" }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Target: 98%" })] })] }) })] }));
    };
    const renderTrendAnalysis = () => {
        if (!trendAnalysis)
            return null;
        return (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(TrendingUp, { className: "h-5 w-5" }), "Trend Analysis"] }), _jsx(CardDescription, { children: "Patterns and trends in authorization data" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsx("div", { className: "flex gap-2 mb-4", children: ["week", "month", "quarter", "year"].map((range) => (_jsx(Button, { variant: selectedTimeRange === range ? "default" : "outline", size: "sm", onClick: () => setSelectedTimeRange(range), children: range.charAt(0).toUpperCase() + range.slice(1) }, range))) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium mb-2", children: "By Service Type" }), _jsx("div", { className: "space-y-2", children: Object.entries(trendAnalysis.approvalPatterns.byServiceType).map(([service, count]) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm", children: service.replace("_", " ") }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Progress, { value: (count / 50) * 100, className: "w-20 h-2" }), _jsx("span", { className: "text-sm font-medium", children: count })] })] }, service))) })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium mb-2", children: "By Time of Day" }), _jsx("div", { className: "space-y-2", children: Object.entries(trendAnalysis.approvalPatterns.byTimeOfDay).map(([time, count]) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm", children: time }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Progress, { value: (count / 40) * 100, className: "w-20 h-2" }), _jsx("span", { className: "text-sm font-medium", children: count })] })] }, time))) })] })] }), trendAnalysis.emergingPatterns.length > 0 && (_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium mb-2", children: "Emerging Patterns" }), _jsx("ul", { className: "text-sm space-y-1", children: trendAnalysis.emergingPatterns.map((pattern, index) => (_jsxs("li", { className: "flex items-center gap-2", children: [_jsx(TrendingUp, { className: "h-4 w-4 text-green-600" }), pattern] }, index))) })] })), trendAnalysis.anomalies.detected && (_jsxs(Alert, { variant: "destructive", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsxs(AlertDescription, { children: [_jsx("strong", { children: "Anomalies Detected:" }), _jsx("ul", { className: "mt-1 list-disc list-inside", children: trendAnalysis.anomalies.description.map((desc, index) => (_jsx("li", { children: desc }, index))) })] })] }))] })] }));
    };
    const renderSLACompliance = () => {
        if (!slaCompliance)
            return null;
        return (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Target, { className: "h-5 w-5" }), "SLA Compliance Monitoring"] }), _jsx(CardDescription, { children: "Service level agreement performance tracking" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-3xl font-bold text-blue-600", children: [Math.round(slaCompliance.overallCompliance * 100), "%"] }), _jsx("div", { className: "text-sm text-gray-600", children: "Overall Compliance" })] }), slaCompliance.breaches.length > 0 && (_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium mb-2 text-red-700", children: "SLA Breaches" }), _jsx("div", { className: "space-y-2", children: slaCompliance.breaches.map((breach, index) => (_jsxs(Alert, { variant: "destructive", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsxs(AlertDescription, { children: [_jsxs("strong", { children: [breach.severity.toUpperCase(), ":"] }), " ", breach.details.join(", ")] })] }, index))) })] })), slaCompliance.recommendations.length > 0 && (_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium mb-2", children: "Recommendations" }), _jsx("ul", { className: "text-sm space-y-1", children: slaCompliance.recommendations.map((rec, index) => (_jsxs("li", { className: "flex items-center gap-2", children: [_jsx(Lightbulb, { className: "h-4 w-4 text-yellow-600" }), rec] }, index))) })] }))] })] }));
    };
    const renderCapacityPlanning = () => {
        if (!capacityPlanning)
            return null;
        return (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Users, { className: "h-5 w-5" }), "Capacity Planning"] }), _jsx(CardDescription, { children: "Resource planning and scaling recommendations" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "text-center p-3 bg-blue-50 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: capacityPlanning.currentLoad }), _jsx("div", { className: "text-sm text-blue-700", children: "Current Load" })] }), _jsxs("div", { className: "text-center p-3 bg-green-50 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: capacityPlanning.projectedLoad }), _jsx("div", { className: "text-sm text-green-700", children: "Projected Load" })] })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm mb-2", children: [_jsx("span", { children: "Capacity Utilization" }), _jsxs("span", { children: [Math.round(capacityPlanning.capacityUtilization * 100), "%"] })] }), _jsx(Progress, { value: capacityPlanning.capacityUtilization * 100, className: "h-3" })] }), capacityPlanning.scalingRecommendations.length > 0 && (_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium mb-2", children: "Scaling Recommendations" }), _jsx("ul", { className: "text-sm space-y-1", children: capacityPlanning.scalingRecommendations.map((rec, index) => (_jsxs("li", { className: "flex items-center gap-2", children: [_jsx(TrendingUp, { className: "h-4 w-4 text-blue-600" }), rec] }, index))) })] })), _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium mb-2", children: "Resource Requirements" }), _jsxs("div", { className: "grid grid-cols-3 gap-2 text-center", children: [_jsxs("div", { className: "p-2 bg-gray-50 rounded", children: [_jsx("div", { className: "font-bold", children: capacityPlanning.resourceRequirements.staff }), _jsx("div", { className: "text-xs text-gray-600", children: "Staff" })] }), _jsxs("div", { className: "p-2 bg-gray-50 rounded", children: [_jsx("div", { className: "font-bold", children: capacityPlanning.resourceRequirements.systems.length }), _jsx("div", { className: "text-xs text-gray-600", children: "Systems" })] }), _jsxs("div", { className: "p-2 bg-gray-50 rounded", children: [_jsx("div", { className: "font-bold", children: capacityPlanning.resourceRequirements.infrastructure.length }), _jsx("div", { className: "text-xs text-gray-600", children: "Infrastructure" })] })] })] })] })] }));
    };
    if (isLoading) {
        return (_jsx("div", { className: "space-y-4", children: _jsxs("div", { className: "text-center py-8", children: [_jsx(Activity, { className: "h-8 w-8 animate-spin mx-auto mb-4" }), _jsx("p", { children: "Loading analytics data..." })] }) }));
    }
    return (_jsxs("div", { className: "space-y-6 bg-white min-h-screen", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold", children: "Daman Predictive Analytics" }), _jsx("p", { className: "text-gray-600", children: "AI-powered insights and performance monitoring" })] }), _jsxs(Button, { onClick: loadAnalyticsData, disabled: isLoading, children: [_jsx(Activity, { className: "h-4 w-4 mr-2" }), "Refresh Data"] })] }), _jsxs(Tabs, { defaultValue: "prediction", className: "space-y-4", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-5", children: [_jsx(TabsTrigger, { value: "prediction", children: "Prediction" }), _jsx(TabsTrigger, { value: "performance", children: "Performance" }), _jsx(TabsTrigger, { value: "trends", children: "Trends" }), _jsx(TabsTrigger, { value: "sla", children: "SLA" }), _jsx(TabsTrigger, { value: "capacity", children: "Capacity" })] }), _jsx(TabsContent, { value: "prediction", className: "space-y-4", children: renderPredictionCard() }), _jsx(TabsContent, { value: "performance", className: "space-y-4", children: renderPerformanceMetrics() }), _jsx(TabsContent, { value: "trends", className: "space-y-4", children: renderTrendAnalysis() }), _jsx(TabsContent, { value: "sla", className: "space-y-4", children: renderSLACompliance() }), _jsx(TabsContent, { value: "capacity", className: "space-y-4", children: renderCapacityPlanning() })] })] }));
};
export default DamanPredictiveAnalytics;
