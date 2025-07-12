import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  Brain,
  Activity,
  Users,
  DollarSign,
  Clock,
  RefreshCw,
  Zap,
  BarChart3,
  LineChart,
  PieChart,
} from "lucide-react";
import { useToastContext } from "@/components/ui/toast-provider";

interface RiskPrediction {
  id: string;
  patientId: string;
  patientName: string;
  riskType: "hospitalization" | "readmission" | "deterioration" | "fall";
  riskScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  probability: number;
  timeframe: string;
  factors: string[];
  recommendations: string[];
  confidence: number;
}

interface TrendForecast {
  metric: string;
  currentValue: number;
  predictedValue: number;
  change: number;
  confidence: number;
  timeframe: string;
  trend: "increasing" | "decreasing" | "stable";
  factors: string[];
}

interface BenchmarkComparison {
  metric: string;
  ourValue: number;
  industryAverage: number;
  topPerformer: number;
  percentile: number;
  gap: number;
  improvement: string;
}

interface PerformancePrediction {
  category: string;
  currentScore: number;
  predictedScore: number;
  improvement: number;
  timeframe: string;
  interventions: {
    action: string;
    impact: number;
    effort: "low" | "medium" | "high";
    timeline: string;
  }[];
}

const PredictiveAnalyticsDashboard: React.FC = () => {
  const { toast } = useToastContext();
  const [activeTab, setActiveTab] = useState("risk-prediction");
  const [selectedTimeframe, setSelectedTimeframe] = useState("30d");
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Mock data - in real implementation, this would come from analytics service
  const [riskPredictions, setRiskPredictions] = useState<RiskPrediction[]>([
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

  const [trendForecasts, setTrendForecasts] = useState<TrendForecast[]>([
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

  const [benchmarkData, setBenchmarkData] = useState<BenchmarkComparison[]>([
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

  const [performancePredictions, setPerformancePredictions] = useState<
    PerformancePrediction[]
  >([
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
      setRiskPredictions((prev) =>
        prev.map((risk) => ({
          ...risk,
          riskScore: Math.max(
            0,
            Math.min(100, risk.riskScore + (Math.random() - 0.5) * 10),
          ),
          probability: Math.max(
            0,
            Math.min(1, risk.probability + (Math.random() - 0.5) * 0.1),
          ),
          confidence: Math.max(
            50,
            Math.min(100, risk.confidence + (Math.random() - 0.5) * 5),
          ),
        })),
      );

      setLastUpdated(new Date());

      toast({
        title: "Predictions Updated",
        description: "Latest predictive analytics have been loaded",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to refresh predictive analytics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
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

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "decreasing":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPercentileColor = (percentile: number) => {
    if (percentile >= 80) return "text-green-600";
    if (percentile >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="w-full bg-background p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Predictive Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            AI-powered risk prediction, trend forecasting, and performance
            modeling
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Select
            value={selectedTimeframe}
            onValueChange={setSelectedTimeframe}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 days</SelectItem>
              <SelectItem value="30d">30 days</SelectItem>
              <SelectItem value="90d">90 days</SelectItem>
              <SelectItem value="1y">1 year</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={refreshPredictions} disabled={isLoading}>
            {isLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Brain className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      <div className="text-sm text-gray-500 mb-6">
        Last updated: {lastUpdated.toLocaleString()} • Powered by AI Analytics
        Engine
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="risk-prediction">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Risk Prediction
          </TabsTrigger>
          <TabsTrigger value="trend-forecasting">
            <LineChart className="h-4 w-4 mr-2" />
            Trend Forecasting
          </TabsTrigger>
          <TabsTrigger value="benchmarks">
            <Target className="h-4 w-4 mr-2" />
            Benchmarks
          </TabsTrigger>
          <TabsTrigger value="performance-models">
            <BarChart3 className="h-4 w-4 mr-2" />
            Performance Models
          </TabsTrigger>
        </TabsList>

        {/* Risk Prediction Tab */}
        <TabsContent value="risk-prediction" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  High Risk Patients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {
                    riskPredictions.filter(
                      (r) =>
                        r.riskLevel === "high" || r.riskLevel === "critical",
                    ).length
                  }
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Require immediate attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Risk Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(
                    riskPredictions.reduce((sum, r) => sum + r.riskScore, 0) /
                      riskPredictions.length,
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Across all patients
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Prediction Accuracy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">94.2%</div>
                <p className="text-xs text-gray-500 mt-1">Model confidence</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {riskPredictions.map((prediction) => (
              <Card
                key={prediction.id}
                className="border-l-4 border-l-blue-500"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {prediction.patientName}
                      </CardTitle>
                      <CardDescription>
                        Patient ID: {prediction.patientId}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={getRiskLevelColor(prediction.riskLevel)}
                      >
                        {prediction.riskLevel.toUpperCase()} RISK
                      </Badge>
                      <Badge variant="outline">
                        {prediction.confidence}% confidence
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium">
                            Risk Type:
                          </span>
                          <p className="text-sm text-gray-600 capitalize">
                            {prediction.riskType}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium">
                            Probability:
                          </span>
                          <p className="text-sm text-gray-600">
                            {(prediction.probability * 100).toFixed(1)}% within{" "}
                            {prediction.timeframe}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium">
                            Risk Score:
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress
                              value={prediction.riskScore}
                              className="flex-1"
                            />
                            <span className="text-sm font-medium">
                              {prediction.riskScore}/100
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium">
                            Risk Factors:
                          </span>
                          <ul className="text-sm text-gray-600 mt-1 space-y-1">
                            {prediction.factors.map((factor, index) => (
                              <li
                                key={index}
                                className="flex items-center gap-2"
                              >
                                <div className="w-1 h-1 bg-gray-400 rounded-full" />
                                {factor}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="text-sm font-medium">
                            Recommendations:
                          </span>
                          <ul className="text-sm text-gray-600 mt-1 space-y-1">
                            {prediction.recommendations.map((rec, index) => (
                              <li
                                key={index}
                                className="flex items-center gap-2"
                              >
                                <Zap className="h-3 w-3 text-blue-500" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Trend Forecasting Tab */}
        <TabsContent value="trend-forecasting" className="mt-6">
          <div className="space-y-6">
            {trendForecasts.map((forecast, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getTrendIcon(forecast.trend)}
                      <CardTitle>{forecast.metric}</CardTitle>
                    </div>
                    <Badge variant="outline">
                      {forecast.confidence}% confidence
                    </Badge>
                  </div>
                  <CardDescription>
                    Forecast for {forecast.timeframe}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Current Value</span>
                      <div className="text-2xl font-bold">
                        {forecast.currentValue.toLocaleString()}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm font-medium">
                        Predicted Value
                      </span>
                      <div className="text-2xl font-bold text-blue-600">
                        {forecast.predictedValue.toLocaleString()}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm font-medium">
                        Expected Change
                      </span>
                      <div
                        className={`text-2xl font-bold ${
                          forecast.change > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {forecast.change > 0 ? "+" : ""}
                        {forecast.change.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-sm font-medium">Key Factors:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {forecast.factors.map((factor, idx) => (
                        <Badge key={idx} variant="secondary">
                          {factor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Benchmarks Tab */}
        <TabsContent value="benchmarks" className="mt-6">
          <div className="space-y-6">
            {benchmarkData.map((benchmark, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{benchmark.metric}</CardTitle>
                  <CardDescription>
                    Performance comparison against industry standards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-sm text-gray-500">
                          Our Performance
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {benchmark.ourValue.toFixed(1)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-500">
                          Industry Average
                        </div>
                        <div className="text-2xl font-bold">
                          {benchmark.industryAverage.toFixed(1)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-500">
                          Top Performer
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {benchmark.topPerformer.toFixed(1)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-500">
                          Percentile Rank
                        </div>
                        <div
                          className={`text-2xl font-bold ${getPercentileColor(benchmark.percentile)}`}
                        >
                          {benchmark.percentile}th
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Gap to Top Performer</span>
                        <span className="font-medium">
                          {benchmark.gap.toFixed(1)} points
                        </span>
                      </div>
                      <Progress
                        value={
                          (benchmark.ourValue / benchmark.topPerformer) * 100
                        }
                        className="h-2"
                      />
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg">
                      <span className="text-sm font-medium text-blue-900">
                        Improvement Strategy:
                      </span>
                      <p className="text-sm text-blue-800 mt-1">
                        {benchmark.improvement}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Performance Models Tab */}
        <TabsContent value="performance-models" className="mt-6">
          <div className="space-y-6">
            {performancePredictions.map((prediction, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{prediction.category}</CardTitle>
                  <CardDescription>
                    Performance prediction model for {prediction.timeframe}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Current Score</div>
                      <div className="text-3xl font-bold">
                        {prediction.currentScore.toFixed(1)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-500">
                        Predicted Score
                      </div>
                      <div className="text-3xl font-bold text-green-600">
                        {prediction.predictedScore.toFixed(1)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Improvement</div>
                      <div className="text-3xl font-bold text-blue-600">
                        +{prediction.improvement.toFixed(1)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">
                      Recommended Interventions
                    </h4>
                    <div className="space-y-3">
                      {prediction.interventions.map((intervention, idx) => (
                        <div key={idx} className="border rounded-lg p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="font-medium">
                                {intervention.action}
                              </h5>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                <span>
                                  Impact: +{intervention.impact.toFixed(1)}{" "}
                                  points
                                </span>
                                <span>Timeline: {intervention.timeline}</span>
                              </div>
                            </div>
                            <Badge
                              variant={
                                intervention.effort === "high"
                                  ? "destructive"
                                  : intervention.effort === "medium"
                                    ? "secondary"
                                    : "default"
                              }
                            >
                              {intervention.effort} effort
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PredictiveAnalyticsDashboard;
