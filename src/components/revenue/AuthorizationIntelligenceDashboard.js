import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Clock, Target, Zap, BarChart3, } from "lucide-react";
const AuthorizationIntelligenceDashboard = () => {
    const [predictions, setPredictions] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedPrediction, setSelectedPrediction] = useState(null);
    useEffect(() => {
        loadAuthorizationIntelligence();
    }, []);
    const loadAuthorizationIntelligence = async () => {
        try {
            setLoading(true);
            // Mock data - in production, this would call the actual API
            const mockPredictions = [
                {
                    predictionId: "1",
                    authorizationRequestId: "AUTH-2024-001",
                    successProbability: 0.87,
                    confidenceScore: 0.92,
                    predictedOutcome: "approved",
                    estimatedProcessingTime: 3.2,
                    riskFactors: [
                        {
                            factor: "incomplete_documentation",
                            impact: "medium",
                            description: "Some supporting documents may be missing",
                            mitigation: "Add comprehensive clinical notes",
                            confidence: 0.75,
                        },
                    ],
                    optimizationSuggestions: [
                        {
                            category: "documentation",
                            suggestion: "Enhance clinical documentation with specific outcome measures",
                            expectedImpact: 15,
                            implementationEffort: "medium",
                            priority: 1,
                        },
                    ],
                },
                {
                    predictionId: "2",
                    authorizationRequestId: "AUTH-2024-002",
                    successProbability: 0.65,
                    confidenceScore: 0.88,
                    predictedOutcome: "partial",
                    estimatedProcessingTime: 5.1,
                    riskFactors: [
                        {
                            factor: "suboptimal_timing",
                            impact: "high",
                            description: "Submission timing may affect approval probability",
                            mitigation: "Consider resubmitting during optimal review periods",
                            confidence: 0.85,
                        },
                    ],
                    optimizationSuggestions: [
                        {
                            category: "timing",
                            suggestion: "Submit during optimal review periods (Tuesday-Thursday)",
                            expectedImpact: 20,
                            implementationEffort: "low",
                            priority: 1,
                        },
                    ],
                },
            ];
            const mockAnalytics = {
                totalPredictions: 156,
                averageSuccessProbability: 0.78,
                predictionAccuracy: 0.91,
                commonRiskFactors: {
                    documentation_issues: 0.35,
                    timing_issues: 0.22,
                    coding_issues: 0.18,
                    justification_issues: 0.25,
                },
                optimizationImpact: {
                    averageImprovementScore: 0.23,
                    successRateImprovement: 0.18,
                    processingTimeReduction: 2.3,
                },
            };
            setPredictions(mockPredictions);
            setAnalytics(mockAnalytics);
        }
        catch (error) {
            console.error("Error loading authorization intelligence:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const getSuccessProbabilityColor = (probability) => {
        if (probability >= 0.8)
            return "text-green-600";
        if (probability >= 0.6)
            return "text-yellow-600";
        return "text-red-600";
    };
    const getSuccessProbabilityBadge = (probability) => {
        if (probability >= 0.8)
            return _jsx(Badge, { className: "bg-green-100 text-green-800", children: "High" });
        if (probability >= 0.6)
            return _jsx(Badge, { className: "bg-yellow-100 text-yellow-800", children: "Medium" });
        return _jsx(Badge, { className: "bg-red-100 text-red-800", children: "Low" });
    };
    const getRiskImpactColor = (impact) => {
        switch (impact) {
            case "high":
                return "text-red-600";
            case "medium":
                return "text-yellow-600";
            case "low":
                return "text-green-600";
            default:
                return "text-gray-600";
        }
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64 bg-white", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "Loading Authorization Intelligence..." })] }) }));
    }
    return (_jsxs("div", { className: "p-6 space-y-6 bg-gray-50 min-h-screen", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-3xl font-bold text-gray-900 flex items-center gap-2", children: [_jsx(Brain, { className: "h-8 w-8 text-blue-600" }), "Authorization Intelligence Dashboard"] }), _jsx("p", { className: "text-gray-600 mt-2", children: "AI-powered authorization optimization and predictive analytics" })] }), _jsxs(Button, { onClick: loadAuthorizationIntelligence, className: "flex items-center gap-2", children: [_jsx(Zap, { className: "h-4 w-4" }), "Refresh Intelligence"] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Total Predictions" }), _jsx(BarChart3, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: analytics?.totalPredictions || 0 }), _jsx("p", { className: "text-xs text-muted-foreground", children: "+12% from last month" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Avg Success Rate" }), _jsx(Target, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold", children: [((analytics?.averageSuccessProbability || 0) * 100).toFixed(1), "%"] }), _jsx("p", { className: "text-xs text-muted-foreground", children: "+5.2% improvement" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Prediction Accuracy" }), _jsx(CheckCircle, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold", children: [((analytics?.predictionAccuracy || 0) * 100).toFixed(1), "%"] }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Model v2.1-ensemble" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Time Reduction" }), _jsx(Clock, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold", children: [analytics?.optimizationImpact?.processingTimeReduction || 0, " days"] }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Average processing time saved" })] })] })] }), _jsxs(Tabs, { defaultValue: "predictions", className: "space-y-4", children: [_jsxs(TabsList, { children: [_jsx(TabsTrigger, { value: "predictions", children: "Active Predictions" }), _jsx(TabsTrigger, { value: "analytics", children: "Analytics & Insights" }), _jsx(TabsTrigger, { value: "optimization", children: "Optimization Engine" })] }), _jsx(TabsContent, { value: "predictions", className: "space-y-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Authorization Predictions" }), _jsx(CardDescription, { children: "AI-powered predictions for pending authorization requests" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: predictions.map((prediction) => (_jsxs("div", { className: "border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors", onClick: () => setSelectedPrediction(prediction), children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("h3", { className: "font-semibold", children: prediction.authorizationRequestId }), getSuccessProbabilityBadge(prediction.successProbability)] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: `text-lg font-bold ${getSuccessProbabilityColor(prediction.successProbability)}`, children: [(prediction.successProbability * 100).toFixed(1), "%"] }), _jsxs("div", { className: "text-sm text-gray-500", children: [prediction.estimatedProcessingTime, " days"] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-700 mb-2", children: "Risk Factors" }), _jsx("div", { className: "space-y-1", children: prediction.riskFactors
                                                                        .slice(0, 2)
                                                                        .map((risk, index) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(AlertTriangle, { className: `h-4 w-4 ${getRiskImpactColor(risk.impact)}` }), _jsx("span", { className: "text-sm", children: risk.description })] }, index))) })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-700 mb-2", children: "Top Optimization" }), _jsx("div", { className: "space-y-1", children: prediction.optimizationSuggestions
                                                                        .slice(0, 1)
                                                                        .map((suggestion, index) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(TrendingUp, { className: "h-4 w-4 text-green-600" }), _jsx("span", { className: "text-sm", children: suggestion.suggestion }), _jsxs(Badge, { variant: "outline", className: "text-xs", children: ["+", suggestion.expectedImpact, "%"] })] }, index))) })] })] }), _jsxs("div", { className: "mt-3", children: [_jsxs("div", { className: "flex items-center justify-between text-sm text-gray-600 mb-1", children: [_jsx("span", { children: "Confidence Score" }), _jsxs("span", { children: [(prediction.confidenceScore * 100).toFixed(1), "%"] })] }), _jsx(Progress, { value: prediction.confidenceScore * 100, className: "h-2" })] })] }, prediction.predictionId))) }) })] }) }), _jsx(TabsContent, { value: "analytics", className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Risk Factor Analysis" }), _jsx(CardDescription, { children: "Common factors affecting authorization success" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: analytics &&
                                                    Object.entries(analytics.commonRiskFactors).map(([factor, percentage]) => (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "capitalize", children: factor.replace("_", " ") }), _jsxs("span", { children: [(percentage * 100).toFixed(1), "%"] })] }), _jsx(Progress, { value: percentage * 100, className: "h-2" })] }, factor))) }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Optimization Impact" }), _jsx(CardDescription, { children: "Measurable improvements from AI optimization" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-3xl font-bold text-green-600", children: ["+", ((analytics?.optimizationImpact
                                                                        ?.successRateImprovement || 0) * 100).toFixed(1), "%"] }), _jsx("p", { className: "text-sm text-gray-600", children: "Success Rate Improvement" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-center", children: [_jsxs("div", { children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: analytics?.optimizationImpact
                                                                            ?.processingTimeReduction || 0 }), _jsx("p", { className: "text-xs text-gray-600", children: "Days Saved" })] }), _jsxs("div", { children: [_jsxs("div", { className: "text-2xl font-bold text-purple-600", children: [((analytics?.optimizationImpact
                                                                                ?.averageImprovementScore || 0) * 100).toFixed(0), "%"] }), _jsx("p", { className: "text-xs text-gray-600", children: "Avg Improvement" })] })] })] }) })] })] }) }), _jsx(TabsContent, { value: "optimization", className: "space-y-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "AI Optimization Engine" }), _jsx(CardDescription, { children: "Advanced machine learning models for authorization optimization" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-6", children: [_jsxs(Alert, { children: [_jsx(Brain, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: "The optimization engine uses Gradient Boosting + Neural Network Ensemble with 85%+ accuracy target and weekly retraining frequency." })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold mb-3", children: "Model Features" }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Patient Demographics" }), _jsx(Badge, { variant: "outline", children: "25%" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Diagnosis Complexity" }), _jsx(Badge, { variant: "outline", children: "20%" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Documentation Quality" }), _jsx(Badge, { variant: "outline", children: "18%" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Historical Patterns" }), _jsx(Badge, { variant: "outline", children: "15%" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Submission Timing" }), _jsx(Badge, { variant: "outline", children: "12%" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Payer Patterns" }), _jsx(Badge, { variant: "outline", children: "10%" })] })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold mb-3", children: "Model Performance" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { children: "Prediction Accuracy" }), _jsx("span", { children: "91.2%" })] }), _jsx(Progress, { value: 91.2, className: "h-2" })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { children: "Model Confidence" }), _jsx("span", { children: "88.5%" })] }), _jsx(Progress, { value: 88.5, className: "h-2" })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { children: "Training Data Quality" }), _jsx("span", { children: "94.8%" })] }), _jsx(Progress, { value: 94.8, className: "h-2" })] })] })] })] })] }) })] }) })] }), selectedPrediction && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50", children: _jsxs(Card, { className: "w-full max-w-4xl max-h-[90vh] overflow-y-auto", children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { children: "Authorization Prediction Details" }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setSelectedPrediction(null), children: "Close" })] }), _jsxs(CardDescription, { children: [selectedPrediction.authorizationRequestId, " - Detailed Analysis"] })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "text-center p-4 bg-blue-50 rounded-lg", children: [_jsxs("div", { className: "text-2xl font-bold text-blue-600", children: [(selectedPrediction.successProbability * 100).toFixed(1), "%"] }), _jsx("p", { className: "text-sm text-gray-600", children: "Success Probability" })] }), _jsxs("div", { className: "text-center p-4 bg-green-50 rounded-lg", children: [_jsxs("div", { className: "text-2xl font-bold text-green-600", children: [(selectedPrediction.confidenceScore * 100).toFixed(1), "%"] }), _jsx("p", { className: "text-sm text-gray-600", children: "Confidence Score" })] }), _jsxs("div", { className: "text-center p-4 bg-purple-50 rounded-lg", children: [_jsxs("div", { className: "text-2xl font-bold text-purple-600", children: [selectedPrediction.estimatedProcessingTime, " days"] }), _jsx("p", { className: "text-sm text-gray-600", children: "Est. Processing Time" })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold mb-3", children: "Risk Factors" }), _jsx("div", { className: "space-y-3", children: selectedPrediction.riskFactors.map((risk, index) => (_jsxs("div", { className: "border rounded-lg p-3", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(AlertTriangle, { className: `h-4 w-4 ${getRiskImpactColor(risk.impact)}` }), _jsx("span", { className: "font-medium capitalize", children: risk.factor.replace("_", " ") }), _jsx(Badge, { variant: risk.impact === "high"
                                                                                ? "destructive"
                                                                                : risk.impact === "medium"
                                                                                    ? "default"
                                                                                    : "secondary", children: risk.impact })] }), _jsx("p", { className: "text-sm text-gray-600 mb-2", children: risk.description }), _jsxs("p", { className: "text-sm text-blue-600 font-medium", children: ["Mitigation: ", risk.mitigation] }), _jsxs("div", { className: "mt-2", children: [_jsxs("div", { className: "flex justify-between text-xs text-gray-500 mb-1", children: [_jsx("span", { children: "Confidence" }), _jsxs("span", { children: [(risk.confidence * 100).toFixed(1), "%"] })] }), _jsx(Progress, { value: risk.confidence * 100, className: "h-1" })] })] }, index))) })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold mb-3", children: "Optimization Suggestions" }), _jsx("div", { className: "space-y-3", children: selectedPrediction.optimizationSuggestions.map((suggestion, index) => (_jsxs("div", { className: "border rounded-lg p-3", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(TrendingUp, { className: "h-4 w-4 text-green-600" }), _jsx("span", { className: "font-medium capitalize", children: suggestion.category }), _jsxs(Badge, { variant: "outline", children: ["+", suggestion.expectedImpact, "%"] })] }), _jsx("p", { className: "text-sm text-gray-600 mb-2", children: suggestion.suggestion }), _jsxs("div", { className: "flex items-center justify-between text-xs", children: [_jsxs("span", { className: "text-gray-500", children: ["Effort: ", suggestion.implementationEffort] }), _jsxs("span", { className: "text-gray-500", children: ["Priority: ", suggestion.priority] })] })] }, index))) })] })] })] }) })] }) }))] }));
};
export default AuthorizationIntelligenceDashboard;
