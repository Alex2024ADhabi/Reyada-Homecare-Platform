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
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Zap,
  BarChart3,
} from "lucide-react";

interface AuthorizationPrediction {
  predictionId: string;
  authorizationRequestId: string;
  successProbability: number;
  confidenceScore: number;
  predictedOutcome: string;
  estimatedProcessingTime: number;
  riskFactors: RiskFactor[];
  optimizationSuggestions: OptimizationSuggestion[];
}

interface RiskFactor {
  factor: string;
  impact: "high" | "medium" | "low";
  description: string;
  mitigation: string;
  confidence: number;
}

interface OptimizationSuggestion {
  category: "documentation" | "timing" | "coding" | "justification";
  suggestion: string;
  expectedImpact: number;
  implementationEffort: "low" | "medium" | "high";
  priority: number;
}

interface AuthorizationAnalytics {
  totalPredictions: number;
  averageSuccessProbability: number;
  predictionAccuracy: number;
  commonRiskFactors: any;
  optimizationImpact: any;
}

const AuthorizationIntelligenceDashboard: React.FC = () => {
  const [predictions, setPredictions] = useState<AuthorizationPrediction[]>([]);
  const [analytics, setAnalytics] = useState<AuthorizationAnalytics | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [selectedPrediction, setSelectedPrediction] =
    useState<AuthorizationPrediction | null>(null);

  useEffect(() => {
    loadAuthorizationIntelligence();
  }, []);

  const loadAuthorizationIntelligence = async () => {
    try {
      setLoading(true);

      // Mock data - in production, this would call the actual API
      const mockPredictions: AuthorizationPrediction[] = [
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
              suggestion:
                "Enhance clinical documentation with specific outcome measures",
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
              suggestion:
                "Submit during optimal review periods (Tuesday-Thursday)",
              expectedImpact: 20,
              implementationEffort: "low",
              priority: 1,
            },
          ],
        },
      ];

      const mockAnalytics: AuthorizationAnalytics = {
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
    } catch (error) {
      console.error("Error loading authorization intelligence:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSuccessProbabilityColor = (probability: number) => {
    if (probability >= 0.8) return "text-green-600";
    if (probability >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const getSuccessProbabilityBadge = (probability: number) => {
    if (probability >= 0.8)
      return <Badge className="bg-green-100 text-green-800">High</Badge>;
    if (probability >= 0.6)
      return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
    return <Badge className="bg-red-100 text-red-800">Low</Badge>;
  };

  const getRiskImpactColor = (impact: string) => {
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
    return (
      <div className="flex items-center justify-center h-64 bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Authorization Intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="h-8 w-8 text-blue-600" />
            Authorization Intelligence Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            AI-powered authorization optimization and predictive analytics
          </p>
        </div>
        <Button
          onClick={loadAuthorizationIntelligence}
          className="flex items-center gap-2"
        >
          <Zap className="h-4 w-4" />
          Refresh Intelligence
        </Button>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Predictions
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.totalPredictions || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Success Rate
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((analytics?.averageSuccessProbability || 0) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">+5.2% improvement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Prediction Accuracy
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((analytics?.predictionAccuracy || 0) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Model v2.1-ensemble</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Time Reduction
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.optimizationImpact?.processingTimeReduction || 0} days
            </div>
            <p className="text-xs text-muted-foreground">
              Average processing time saved
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="predictions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="predictions">Active Predictions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics & Insights</TabsTrigger>
          <TabsTrigger value="optimization">Optimization Engine</TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Authorization Predictions</CardTitle>
              <CardDescription>
                AI-powered predictions for pending authorization requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predictions.map((prediction) => (
                  <div
                    key={prediction.predictionId}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedPrediction(prediction)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">
                          {prediction.authorizationRequestId}
                        </h3>
                        {getSuccessProbabilityBadge(
                          prediction.successProbability,
                        )}
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-lg font-bold ${getSuccessProbabilityColor(prediction.successProbability)}`}
                        >
                          {(prediction.successProbability * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-500">
                          {prediction.estimatedProcessingTime} days
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Risk Factors
                        </h4>
                        <div className="space-y-1">
                          {prediction.riskFactors
                            .slice(0, 2)
                            .map((risk, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2"
                              >
                                <AlertTriangle
                                  className={`h-4 w-4 ${getRiskImpactColor(risk.impact)}`}
                                />
                                <span className="text-sm">
                                  {risk.description}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Top Optimization
                        </h4>
                        <div className="space-y-1">
                          {prediction.optimizationSuggestions
                            .slice(0, 1)
                            .map((suggestion, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2"
                              >
                                <TrendingUp className="h-4 w-4 text-green-600" />
                                <span className="text-sm">
                                  {suggestion.suggestion}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  +{suggestion.expectedImpact}%
                                </Badge>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Confidence Score</span>
                        <span>
                          {(prediction.confidenceScore * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress
                        value={prediction.confidenceScore * 100}
                        className="h-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Factor Analysis</CardTitle>
                <CardDescription>
                  Common factors affecting authorization success
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics &&
                    Object.entries(analytics.commonRiskFactors).map(
                      ([factor, percentage]) => (
                        <div key={factor} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="capitalize">
                              {factor.replace("_", " ")}
                            </span>
                            <span>
                              {((percentage as number) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <Progress
                            value={(percentage as number) * 100}
                            className="h-2"
                          />
                        </div>
                      ),
                    )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Optimization Impact</CardTitle>
                <CardDescription>
                  Measurable improvements from AI optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      +
                      {(
                        (analytics?.optimizationImpact
                          ?.successRateImprovement || 0) * 100
                      ).toFixed(1)}
                      %
                    </div>
                    <p className="text-sm text-gray-600">
                      Success Rate Improvement
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {analytics?.optimizationImpact
                          ?.processingTimeReduction || 0}
                      </div>
                      <p className="text-xs text-gray-600">Days Saved</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {(
                          (analytics?.optimizationImpact
                            ?.averageImprovementScore || 0) * 100
                        ).toFixed(0)}
                        %
                      </div>
                      <p className="text-xs text-gray-600">Avg Improvement</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Optimization Engine</CardTitle>
              <CardDescription>
                Advanced machine learning models for authorization optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertDescription>
                    The optimization engine uses Gradient Boosting + Neural
                    Network Ensemble with 85%+ accuracy target and weekly
                    retraining frequency.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Model Features</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Patient Demographics</span>
                        <Badge variant="outline">25%</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Diagnosis Complexity</span>
                        <Badge variant="outline">20%</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Documentation Quality</span>
                        <Badge variant="outline">18%</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Historical Patterns</span>
                        <Badge variant="outline">15%</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Submission Timing</span>
                        <Badge variant="outline">12%</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Payer Patterns</span>
                        <Badge variant="outline">10%</Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Model Performance</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Prediction Accuracy</span>
                          <span>91.2%</span>
                        </div>
                        <Progress value={91.2} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Model Confidence</span>
                          <span>88.5%</span>
                        </div>
                        <Progress value={88.5} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Training Data Quality</span>
                          <span>94.8%</span>
                        </div>
                        <Progress value={94.8} className="h-2" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detailed Prediction Modal */}
      {selectedPrediction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Authorization Prediction Details</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPrediction(null)}
                >
                  Close
                </Button>
              </div>
              <CardDescription>
                {selectedPrediction.authorizationRequestId} - Detailed Analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {(selectedPrediction.successProbability * 100).toFixed(1)}
                      %
                    </div>
                    <p className="text-sm text-gray-600">Success Probability</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {(selectedPrediction.confidenceScore * 100).toFixed(1)}%
                    </div>
                    <p className="text-sm text-gray-600">Confidence Score</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {selectedPrediction.estimatedProcessingTime} days
                    </div>
                    <p className="text-sm text-gray-600">
                      Est. Processing Time
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Risk Factors</h3>
                    <div className="space-y-3">
                      {selectedPrediction.riskFactors.map((risk, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle
                              className={`h-4 w-4 ${getRiskImpactColor(risk.impact)}`}
                            />
                            <span className="font-medium capitalize">
                              {risk.factor.replace("_", " ")}
                            </span>
                            <Badge
                              variant={
                                risk.impact === "high"
                                  ? "destructive"
                                  : risk.impact === "medium"
                                    ? "default"
                                    : "secondary"
                              }
                            >
                              {risk.impact}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {risk.description}
                          </p>
                          <p className="text-sm text-blue-600 font-medium">
                            Mitigation: {risk.mitigation}
                          </p>
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Confidence</span>
                              <span>{(risk.confidence * 100).toFixed(1)}%</span>
                            </div>
                            <Progress
                              value={risk.confidence * 100}
                              className="h-1"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">
                      Optimization Suggestions
                    </h3>
                    <div className="space-y-3">
                      {selectedPrediction.optimizationSuggestions.map(
                        (suggestion, index) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingUp className="h-4 w-4 text-green-600" />
                              <span className="font-medium capitalize">
                                {suggestion.category}
                              </span>
                              <Badge variant="outline">
                                +{suggestion.expectedImpact}%
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {suggestion.suggestion}
                            </p>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">
                                Effort: {suggestion.implementationEffort}
                              </span>
                              <span className="text-gray-500">
                                Priority: {suggestion.priority}
                              </span>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AuthorizationIntelligenceDashboard;
