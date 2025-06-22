import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Brain,
  TrendingUp,
  Users,
  Calendar,
  AlertCircle,
  Target,
  Zap,
} from "lucide-react";

interface PredictionModel {
  id: string;
  name: string;
  type:
    | "patient_risk"
    | "resource_demand"
    | "revenue_forecast"
    | "quality_prediction";
  accuracy: number;
  lastTrained: string;
  status: "active" | "training" | "needs_update";
  predictions: number;
}

interface Insight {
  id: string;
  category: string;
  title: string;
  description: string;
  confidence: number;
  impact: "high" | "medium" | "low";
  actionable: boolean;
  recommendations: string[];
}

interface Forecast {
  id: string;
  metric: string;
  currentValue: number;
  predictedValue: number;
  timeframe: string;
  confidence: number;
  trend: "increasing" | "decreasing" | "stable";
}

const PredictiveIntelligenceDashboard: React.FC = () => {
  const [models, setModels] = useState<PredictionModel[]>([
    {
      id: "1",
      name: "Patient Risk Assessment",
      type: "patient_risk",
      accuracy: 94.2,
      lastTrained: "2024-01-15T10:00:00Z",
      status: "active",
      predictions: 1247,
    },
    {
      id: "2",
      name: "Resource Demand Forecasting",
      type: "resource_demand",
      accuracy: 87.8,
      lastTrained: "2024-01-14T08:00:00Z",
      status: "active",
      predictions: 892,
    },
    {
      id: "3",
      name: "Revenue Prediction",
      type: "revenue_forecast",
      accuracy: 91.5,
      lastTrained: "2024-01-13T12:00:00Z",
      status: "needs_update",
      predictions: 634,
    },
    {
      id: "4",
      name: "Quality Outcome Predictor",
      type: "quality_prediction",
      accuracy: 89.3,
      lastTrained: "2024-01-16T14:00:00Z",
      status: "training",
      predictions: 445,
    },
  ]);

  const [insights, setInsights] = useState<Insight[]>([
    {
      id: "1",
      category: "Patient Care",
      title: "High-Risk Patient Identification",
      description:
        "23 patients identified as high-risk for readmission within 30 days",
      confidence: 92,
      impact: "high",
      actionable: true,
      recommendations: [
        "Increase monitoring frequency for identified patients",
        "Schedule preventive care visits",
        "Implement care coordination protocols",
      ],
    },
    {
      id: "2",
      category: "Resource Planning",
      title: "Staffing Optimization Opportunity",
      description:
        "Predicted 15% increase in demand for physiotherapy services next month",
      confidence: 85,
      impact: "medium",
      actionable: true,
      recommendations: [
        "Schedule additional physiotherapy staff",
        "Consider temporary contractor arrangements",
        "Optimize appointment scheduling",
      ],
    },
    {
      id: "3",
      category: "Revenue",
      title: "Claims Processing Efficiency",
      description:
        "AI model suggests 12% improvement in claims approval rate with optimized documentation",
      confidence: 78,
      impact: "high",
      actionable: true,
      recommendations: [
        "Implement AI-assisted documentation review",
        "Train staff on optimal documentation practices",
        "Automate pre-submission validation",
      ],
    },
  ]);

  const [forecasts, setForecasts] = useState<Forecast[]>([
    {
      id: "1",
      metric: "Patient Volume",
      currentValue: 1247,
      predictedValue: 1389,
      timeframe: "Next 30 days",
      confidence: 87,
      trend: "increasing",
    },
    {
      id: "2",
      metric: "Revenue (AED)",
      currentValue: 2450000,
      predictedValue: 2680000,
      timeframe: "Next Quarter",
      confidence: 82,
      trend: "increasing",
    },
    {
      id: "3",
      metric: "Staff Utilization (%)",
      currentValue: 78,
      predictedValue: 85,
      timeframe: "Next 2 weeks",
      confidence: 91,
      trend: "increasing",
    },
    {
      id: "4",
      metric: "Patient Satisfaction",
      currentValue: 4.2,
      predictedValue: 4.4,
      timeframe: "Next Month",
      confidence: 76,
      trend: "increasing",
    },
  ]);

  const getModelStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "training":
        return "bg-blue-500";
      case "needs_update":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "decreasing":
        return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      case "stable":
        return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
      default:
        return null;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Predictive Intelligence Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              AI-powered insights and forecasting for optimal decision making
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Brain className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="models">AI Models</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Brain className="h-4 w-4 mr-2" />
                    Active Models
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {models.filter((m) => m.status === "active").length}
                  </div>
                  <p className="text-xs text-gray-600">
                    of {models.length} total models
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Target className="h-4 w-4 mr-2" />
                    Avg Accuracy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(
                      models.reduce((sum, m) => sum + m.accuracy, 0) /
                        models.length,
                    )}
                    %
                  </div>
                  <p className="text-xs text-gray-600">across all models</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Zap className="h-4 w-4 mr-2" />
                    Predictions Made
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatNumber(
                      models.reduce((sum, m) => sum + m.predictions, 0),
                    )}
                  </div>
                  <p className="text-xs text-gray-600">this month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Actionable Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {insights.filter((i) => i.actionable).length}
                  </div>
                  <p className="text-xs text-gray-600">requiring attention</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Key Insights</CardTitle>
                  <CardDescription>
                    High-impact AI-generated insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {insights.slice(0, 3).map((insight) => (
                      <div key={insight.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">
                            {insight.title}
                          </h4>
                          <Badge className={getImpactColor(insight.impact)}>
                            {insight.impact} impact
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">
                          {insight.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {insight.confidence}% confidence
                          </span>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Forecast Summary</CardTitle>
                  <CardDescription>
                    Key predictions for the coming period
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {forecasts.slice(0, 3).map((forecast) => (
                      <div
                        key={forecast.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium text-sm">
                            {forecast.metric}
                          </h4>
                          <p className="text-xs text-gray-600">
                            {forecast.timeframe}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">
                              {typeof forecast.predictedValue === "number" &&
                              forecast.predictedValue > 1000
                                ? formatNumber(forecast.predictedValue)
                                : forecast.predictedValue}
                            </span>
                            {getTrendIcon(forecast.trend)}
                          </div>
                          <p className="text-xs text-gray-500">
                            {forecast.confidence}% confidence
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="models" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {models.map((model) => (
                <Card key={model.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{model.name}</CardTitle>
                      <Badge className={getModelStatusColor(model.status)}>
                        {model.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      Type: {model.type.replace("_", " ")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Accuracy</span>
                          <span className="text-sm font-bold">
                            {model.accuracy}%
                          </span>
                        </div>
                        <Progress value={model.accuracy} className="h-2" />
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">
                            Predictions Made
                          </span>
                          <div className="font-medium">
                            {model.predictions.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Last Trained</span>
                          <div className="font-medium">
                            {new Date(model.lastTrained).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                        <Button size="sm" variant="outline">
                          Retrain
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="space-y-4">
              {insights.map((insight) => (
                <Card key={insight.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {insight.title}
                        </CardTitle>
                        <CardDescription>{insight.category}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getImpactColor(insight.impact)}>
                          {insight.impact} impact
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {insight.confidence}% confidence
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">{insight.description}</p>
                    {insight.actionable && (
                      <div>
                        <h4 className="font-medium mb-2">
                          Recommended Actions:
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                          {insight.recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="flex justify-end mt-4">
                      <Button size="sm">Take Action</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="forecasts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {forecasts.map((forecast) => (
                <Card key={forecast.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{forecast.metric}</CardTitle>
                    <CardDescription>{forecast.timeframe}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm text-gray-600">Current</span>
                          <div className="text-xl font-bold">
                            {typeof forecast.currentValue === "number" &&
                            forecast.currentValue > 1000
                              ? formatNumber(forecast.currentValue)
                              : forecast.currentValue}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-gray-600">
                            Predicted
                          </span>
                          <div className="text-xl font-bold flex items-center">
                            {typeof forecast.predictedValue === "number" &&
                            forecast.predictedValue > 1000
                              ? formatNumber(forecast.predictedValue)
                              : forecast.predictedValue}
                            {getTrendIcon(forecast.trend)}
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            Confidence
                          </span>
                          <span className="text-sm font-bold">
                            {forecast.confidence}%
                          </span>
                        </div>
                        <Progress value={forecast.confidence} className="h-2" />
                      </div>
                      <div className="text-center">
                        <span className="text-sm text-gray-600">
                          {forecast.trend === "increasing"
                            ? "Expected to increase"
                            : forecast.trend === "decreasing"
                              ? "Expected to decrease"
                              : "Expected to remain stable"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PredictiveIntelligenceDashboard;
