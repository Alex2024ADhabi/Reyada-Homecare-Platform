import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { TrendingUp, TrendingDown, AlertTriangle, Target, Brain, Activity, RefreshCw, Zap, BarChart3, LineChart, } from "lucide-react";
import { useToastContext } from "@/components/ui/toast-provider";
const PredictiveAnalyticsDashboard = () => {
    const { toast } = useToastContext();
    const [activeTab, setActiveTab] = useState("risk-prediction");
    const [selectedTimeframe, setSelectedTimeframe] = useState("30d");
    const [isLoading, setIsLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    // Mock data - in real implementation, this would come from analytics service
    const [riskPredictions, setRiskPredictions] = useState([
        {
            id: "1",
            patientId: "PAT-001",
            patientName: "Ahmed Al-Rashid",
            riskType: "hospitalization",
            riskScore: 85,
            riskLevel: "high",
            probability: 0.78,
            timeframe: "30 days",
            factors: [
                "Multiple chronic conditions",
                "Recent medication changes",
                "Age >75",
            ],
            recommendations: [
                "Increase monitoring frequency",
                "Medication review with pharmacist",
                "Family education on warning signs",
            ],
            confidence: 87,
        },
        {
            id: "2",
            patientId: "PAT-002",
            patientName: "Fatima Hassan",
            riskType: "fall",
            riskScore: 72,
            riskLevel: "medium",
            probability: 0.45,
            timeframe: "14 days",
            factors: ["Balance issues", "Medication side effects", "Home hazards"],
            recommendations: [
                "Physical therapy assessment",
                "Home safety evaluation",
                "Balance training program",
            ],
            confidence: 82,
        },
        {
            id: "3",
            patientId: "PAT-003",
            patientName: "Omar Abdullah",
            riskType: "readmission",
            riskScore: 91,
            riskLevel: "critical",
            probability: 0.89,
            timeframe: "7 days",
            factors: [
                "Recent discharge",
                "Poor medication adherence",
                "Social isolation",
            ],
            recommendations: [
                "Daily check-ins for 1 week",
                "Medication management support",
                "Social services referral",
            ],
            confidence: 94,
        },
    ]);
    const [trendForecasts, setTrendForecasts] = useState([
        {
            metric: "Patient Volume",
            currentValue: 1247,
            predictedValue: 1389,
            change: 11.4,
            confidence: 89,
            timeframe: "Next 3 months",
            trend: "increasing",
            factors: ["Seasonal patterns", "Referral growth", "Service expansion"],
        },
        {
            metric: "Average Length of Stay",
            currentValue: 14.2,
            predictedValue: 12.8,
            change: -9.9,
            confidence: 76,
            timeframe: "Next quarter",
            trend: "decreasing",
            factors: [
                "Improved care protocols",
                "Early intervention",
                "Technology adoption",
            ],
        },
        {
            metric: "Readmission Rate",
            currentValue: 8.5,
            predictedValue: 6.2,
            change: -27.1,
            confidence: 83,
            timeframe: "Next 6 months",
            trend: "decreasing",
            factors: [
                "Enhanced discharge planning",
                "Follow-up protocols",
                "Patient education",
            ],
        },
    ]);
    const [benchmarkData, setBenchmarkData] = useState([
        {
            metric: "Patient Satisfaction",
            ourValue: 94.2,
            industryAverage: 87.5,
            topPerformer: 96.8,
            percentile: 78,
            gap: 2.6,
            improvement: "Focus on communication and response times",
        },
        {
            metric: "Clinical Outcomes",
            ourValue: 91.3,
            industryAverage: 89.1,
            topPerformer: 94.7,
            percentile: 65,
            gap: 3.4,
            improvement: "Implement evidence-based protocols",
        },
        {
            metric: "Cost Efficiency",
            ourValue: 82.1,
            industryAverage: 85.3,
            topPerformer: 92.4,
            percentile: 42,
            gap: 10.3,
            improvement: "Optimize resource allocation and reduce waste",
        },
    ]);
    const [performancePredictions, setPerformancePredictions] = useState([
        {
            category: "Quality of Care",
            currentScore: 91.3,
            predictedScore: 94.7,
            improvement: 3.4,
            timeframe: "6 months",
            interventions: [
                {
                    action: "Implement AI-powered care protocols",
                    impact: 2.1,
                    effort: "high",
                    timeline: "3 months",
                },
                {
                    action: "Enhanced staff training program",
                    impact: 1.3,
                    effort: "medium",
                    timeline: "2 months",
                },
            ],
        },
        {
            category: "Operational Efficiency",
            currentScore: 87.2,
            predictedScore: 92.8,
            improvement: 5.6,
            timeframe: "4 months",
            interventions: [
                {
                    action: "Workflow automation implementation",
                    impact: 3.2,
                    effort: "high",
                    timeline: "2 months",
                },
                {
                    action: "Resource optimization algorithms",
                    impact: 2.4,
                    effort: "medium",
                    timeline: "1 month",
                },
            ],
        },
    ]);
    useEffect(() => {
        // Auto-refresh data every 5 minutes
        const interval = setInterval(() => {
            refreshPredictions();
        }, 300000);
        return () => clearInterval(interval);
    }, []);
    const refreshPredictions = async () => {
        setIsLoading(true);
        try {
            // Simulate API call to analytics service
            await new Promise((resolve) => setTimeout(resolve, 2000));
            // Update predictions with slight variations
            setRiskPredictions((prev) => prev.map((risk) => ({
                ...risk,
                riskScore: Math.max(0, Math.min(100, risk.riskScore + (Math.random() - 0.5) * 10)),
                probability: Math.max(0, Math.min(1, risk.probability + (Math.random() - 0.5) * 0.1)),
                confidence: Math.max(50, Math.min(100, risk.confidence + (Math.random() - 0.5) * 5)),
            })));
            setLastUpdated(new Date());
            toast({
                title: "Predictions Updated",
                description: "Latest predictive analytics have been loaded",
                variant: "success",
            });
        }
        catch (error) {
            toast({
                title: "Update Failed",
                description: "Failed to refresh predictive analytics",
                variant: "destructive",
            });
        }
        finally {
            setIsLoading(false);
        }
    };
    const getRiskLevelColor = (level) => {
        switch (level) {
            case "critical":
                return "bg-red-100 text-red-800 border-red-200";
            case "high":
                return "bg-orange-100 text-orange-800 border-orange-200";
            case "medium":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "low":
                return "bg-green-100 text-green-800 border-green-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };
    const getTrendIcon = (trend) => {
        switch (trend) {
            case "increasing":
                return _jsx(TrendingUp, { className: "h-4 w-4 text-green-500" });
            case "decreasing":
                return _jsx(TrendingDown, { className: "h-4 w-4 text-red-500" });
            default:
                return _jsx(Activity, { className: "h-4 w-4 text-gray-500" });
        }
    };
    const getPercentileColor = (percentile) => {
        if (percentile >= 80)
            return "text-green-600";
        if (percentile >= 60)
            return "text-yellow-600";
        return "text-red-600";
    };
    return (_jsxs("div", { className: "w-full bg-background p-6", children: [_jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Predictive Analytics Dashboard" }), _jsx("p", { className: "text-gray-600 mt-1", children: "AI-powered risk prediction, trend forecasting, and performance modeling" })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs(Select, { value: selectedTimeframe, onValueChange: setSelectedTimeframe, children: [_jsx(SelectTrigger, { className: "w-32", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "7d", children: "7 days" }), _jsx(SelectItem, { value: "30d", children: "30 days" }), _jsx(SelectItem, { value: "90d", children: "90 days" }), _jsx(SelectItem, { value: "1y", children: "1 year" })] })] }), _jsxs(Button, { onClick: refreshPredictions, disabled: isLoading, children: [isLoading ? (_jsx(RefreshCw, { className: "h-4 w-4 mr-2 animate-spin" })) : (_jsx(Brain, { className: "h-4 w-4 mr-2" })), "Refresh"] })] })] }), _jsxs("div", { className: "text-sm text-gray-500 mb-6", children: ["Last updated: ", lastUpdated.toLocaleString(), " \u2022 Powered by AI Analytics Engine"] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsxs(TabsTrigger, { value: "risk-prediction", children: [_jsx(AlertTriangle, { className: "h-4 w-4 mr-2" }), "Risk Prediction"] }), _jsxs(TabsTrigger, { value: "trend-forecasting", children: [_jsx(LineChart, { className: "h-4 w-4 mr-2" }), "Trend Forecasting"] }), _jsxs(TabsTrigger, { value: "benchmarks", children: [_jsx(Target, { className: "h-4 w-4 mr-2" }), "Benchmarks"] }), _jsxs(TabsTrigger, { value: "performance-models", children: [_jsx(BarChart3, { className: "h-4 w-4 mr-2" }), "Performance Models"] })] }), _jsxs(TabsContent, { value: "risk-prediction", className: "mt-6", children: [_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "High Risk Patients" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-red-600", children: riskPredictions.filter((r) => r.riskLevel === "high" || r.riskLevel === "critical").length }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Require immediate attention" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Average Risk Score" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: Math.round(riskPredictions.reduce((sum, r) => sum + r.riskScore, 0) /
                                                            riskPredictions.length) }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Across all patients" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium", children: "Prediction Accuracy" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: "94.2%" }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Model confidence" })] })] })] }), _jsx("div", { className: "space-y-4", children: riskPredictions.map((prediction) => (_jsxs(Card, { className: "border-l-4 border-l-blue-500", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: "text-lg", children: prediction.patientName }), _jsxs(CardDescription, { children: ["Patient ID: ", prediction.patientId] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Badge, { className: getRiskLevelColor(prediction.riskLevel), children: [prediction.riskLevel.toUpperCase(), " RISK"] }), _jsxs(Badge, { variant: "outline", children: [prediction.confidence, "% confidence"] })] })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsx("div", { children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("span", { className: "text-sm font-medium", children: "Risk Type:" }), _jsx("p", { className: "text-sm text-gray-600 capitalize", children: prediction.riskType })] }), _jsxs("div", { children: [_jsx("span", { className: "text-sm font-medium", children: "Probability:" }), _jsxs("p", { className: "text-sm text-gray-600", children: [(prediction.probability * 100).toFixed(1), "% within", " ", prediction.timeframe] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-sm font-medium", children: "Risk Score:" }), _jsxs("div", { className: "flex items-center gap-2 mt-1", children: [_jsx(Progress, { value: prediction.riskScore, className: "flex-1" }), _jsxs("span", { className: "text-sm font-medium", children: [prediction.riskScore, "/100"] })] })] })] }) }), _jsx("div", { children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("span", { className: "text-sm font-medium", children: "Risk Factors:" }), _jsx("ul", { className: "text-sm text-gray-600 mt-1 space-y-1", children: prediction.factors.map((factor, index) => (_jsxs("li", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-1 h-1 bg-gray-400 rounded-full" }), factor] }, index))) })] }), _jsxs("div", { children: [_jsx("span", { className: "text-sm font-medium", children: "Recommendations:" }), _jsx("ul", { className: "text-sm text-gray-600 mt-1 space-y-1", children: prediction.recommendations.map((rec, index) => (_jsxs("li", { className: "flex items-center gap-2", children: [_jsx(Zap, { className: "h-3 w-3 text-blue-500" }), rec] }, index))) })] })] }) })] }) })] }, prediction.id))) })] }), _jsx(TabsContent, { value: "trend-forecasting", className: "mt-6", children: _jsx("div", { className: "space-y-6", children: trendForecasts.map((forecast, index) => (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [getTrendIcon(forecast.trend), _jsx(CardTitle, { children: forecast.metric })] }), _jsxs(Badge, { variant: "outline", children: [forecast.confidence, "% confidence"] })] }), _jsxs(CardDescription, { children: ["Forecast for ", forecast.timeframe] })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("span", { className: "text-sm font-medium", children: "Current Value" }), _jsx("div", { className: "text-2xl font-bold", children: forecast.currentValue.toLocaleString() })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("span", { className: "text-sm font-medium", children: "Predicted Value" }), _jsx("div", { className: "text-2xl font-bold text-blue-600", children: forecast.predictedValue.toLocaleString() })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("span", { className: "text-sm font-medium", children: "Expected Change" }), _jsxs("div", { className: `text-2xl font-bold ${forecast.change > 0
                                                                    ? "text-green-600"
                                                                    : "text-red-600"}`, children: [forecast.change > 0 ? "+" : "", forecast.change.toFixed(1), "%"] })] })] }), _jsxs("div", { className: "mt-4", children: [_jsx("span", { className: "text-sm font-medium", children: "Key Factors:" }), _jsx("div", { className: "flex flex-wrap gap-2 mt-2", children: forecast.factors.map((factor, idx) => (_jsx(Badge, { variant: "secondary", children: factor }, idx))) })] })] })] }, index))) }) }), _jsx(TabsContent, { value: "benchmarks", className: "mt-6", children: _jsx("div", { className: "space-y-6", children: benchmarkData.map((benchmark, index) => (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: benchmark.metric }), _jsx(CardDescription, { children: "Performance comparison against industry standards" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-sm text-gray-500", children: "Our Performance" }), _jsx("div", { className: "text-2xl font-bold text-blue-600", children: benchmark.ourValue.toFixed(1) })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-sm text-gray-500", children: "Industry Average" }), _jsx("div", { className: "text-2xl font-bold", children: benchmark.industryAverage.toFixed(1) })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-sm text-gray-500", children: "Top Performer" }), _jsx("div", { className: "text-2xl font-bold text-green-600", children: benchmark.topPerformer.toFixed(1) })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-sm text-gray-500", children: "Percentile Rank" }), _jsxs("div", { className: `text-2xl font-bold ${getPercentileColor(benchmark.percentile)}`, children: [benchmark.percentile, "th"] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Gap to Top Performer" }), _jsxs("span", { className: "font-medium", children: [benchmark.gap.toFixed(1), " points"] })] }), _jsx(Progress, { value: (benchmark.ourValue / benchmark.topPerformer) * 100, className: "h-2" })] }), _jsxs("div", { className: "bg-blue-50 p-3 rounded-lg", children: [_jsx("span", { className: "text-sm font-medium text-blue-900", children: "Improvement Strategy:" }), _jsx("p", { className: "text-sm text-blue-800 mt-1", children: benchmark.improvement })] })] }) })] }, index))) }) }), _jsx(TabsContent, { value: "performance-models", className: "mt-6", children: _jsx("div", { className: "space-y-6", children: performancePredictions.map((prediction, index) => (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: prediction.category }), _jsxs(CardDescription, { children: ["Performance prediction model for ", prediction.timeframe] })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-6", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-sm text-gray-500", children: "Current Score" }), _jsx("div", { className: "text-3xl font-bold", children: prediction.currentScore.toFixed(1) })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-sm text-gray-500", children: "Predicted Score" }), _jsx("div", { className: "text-3xl font-bold text-green-600", children: prediction.predictedScore.toFixed(1) })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-sm text-gray-500", children: "Improvement" }), _jsxs("div", { className: "text-3xl font-bold text-blue-600", children: ["+", prediction.improvement.toFixed(1)] })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-3", children: "Recommended Interventions" }), _jsx("div", { className: "space-y-3", children: prediction.interventions.map((intervention, idx) => (_jsx("div", { className: "border rounded-lg p-3", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h5", { className: "font-medium", children: intervention.action }), _jsxs("div", { className: "flex items-center gap-4 mt-2 text-sm text-gray-600", children: [_jsxs("span", { children: ["Impact: +", intervention.impact.toFixed(1), " ", "points"] }), _jsxs("span", { children: ["Timeline: ", intervention.timeline] })] })] }), _jsxs(Badge, { variant: intervention.effort === "high"
                                                                            ? "destructive"
                                                                            : intervention.effort === "medium"
                                                                                ? "secondary"
                                                                                : "default", children: [intervention.effort, " effort"] })] }) }, idx))) })] })] })] }, index))) }) })] })] }));
};
export default PredictiveAnalyticsDashboard;
