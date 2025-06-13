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
  TrendingUp,
  DollarSign,
  BarChart3,
  PieChart,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface RevenueForecast {
  forecastId: string;
  predictions: RevenuePrediction[];
  scenarioAnalysis: ScenarioAnalysis;
  riskFactors: RevenueRiskFactor[];
  opportunityAnalysis: RevenueOpportunity[];
}

interface RevenuePrediction {
  period: Date;
  predictedGrossRevenue: number;
  predictedNetRevenue: number;
  predictedMargin: number;
  confidenceScore: number;
}

interface ScenarioAnalysis {
  bestCase: ScenarioResult;
  worstCase: ScenarioResult;
  mostLikely: ScenarioResult;
}

interface ScenarioResult {
  totalRevenue: number;
  totalMargin: number;
  probability: number;
  keyDrivers: string[];
}

interface RevenueRiskFactor {
  riskType: string;
  description: string;
  probability: number;
  potentialImpact: number;
  mitigationStrategies: string[];
}

interface RevenueOpportunity {
  opportunityType: string;
  description: string;
  potentialValue: number;
  implementationEffort: string;
  timeToRealization: number;
  roi: number;
}

interface ServiceMixOptimization {
  optimizationId: string;
  expectedResults: {
    totalRevenueIncrease: number;
    totalMarginImprovement: number;
    capacityUtilizationImprovement: number;
    roi: number;
  };
}

const RevenueIntelligenceDashboard: React.FC = () => {
  const [forecast, setForecast] = useState<RevenueForecast | null>(null);
  const [serviceMixOptimization, setServiceMixOptimization] =
    useState<ServiceMixOptimization | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedScenario, setSelectedScenario] = useState<
    "bestCase" | "worstCase" | "mostLikely"
  >("mostLikely");

  useEffect(() => {
    loadRevenueIntelligence();
  }, []);

  const loadRevenueIntelligence = async () => {
    try {
      setLoading(true);

      // Mock data - in production, this would call the actual API
      const mockForecast: RevenueForecast = {
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

      const mockServiceMix: ServiceMixOptimization = {
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
    } catch (error) {
      console.error("Error loading revenue intelligence:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getScenarioColor = (scenario: string) => {
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

  const getRiskColor = (impact: number) => {
    if (impact >= 0.15) return "text-red-600";
    if (impact >= 0.1) return "text-yellow-600";
    return "text-green-600";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Revenue Intelligence...</p>
        </div>
      </div>
    );
  }

  const selectedScenarioData = forecast?.scenarioAnalysis[selectedScenario];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-green-600" />
            Revenue Intelligence Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            AI-powered revenue forecasting and service mix optimization
          </p>
        </div>
        <Button
          onClick={loadRevenueIntelligence}
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
              Predicted Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(selectedScenarioData?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedScenario === "mostLikely"
                ? "Most Likely"
                : selectedScenario === "bestCase"
                  ? "Best Case"
                  : "Worst Case"}{" "}
              Scenario
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Predicted Margin
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(selectedScenarioData?.totalMargin || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {(
                ((selectedScenarioData?.totalMargin || 0) /
                  (selectedScenarioData?.totalRevenue || 1)) *
                100
              ).toFixed(1)}
              % margin rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Optimization ROI
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {serviceMixOptimization?.expectedResults.roi.toFixed(1)}x
            </div>
            <p className="text-xs text-muted-foreground">
              Service mix optimization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Revenue Increase
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                serviceMixOptimization?.expectedResults.totalRevenueIncrease ||
                  0,
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Potential annual increase
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="forecast" className="space-y-4">
        <TabsList>
          <TabsTrigger value="forecast">Revenue Forecast</TabsTrigger>
          <TabsTrigger value="scenarios">Scenario Analysis</TabsTrigger>
          <TabsTrigger value="optimization">
            Service Mix Optimization
          </TabsTrigger>
          <TabsTrigger value="risks">Risk & Opportunities</TabsTrigger>
        </TabsList>

        <TabsContent value="forecast" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue Predictions</CardTitle>
                <CardDescription>
                  AI-powered revenue forecasting with confidence intervals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {forecast?.predictions.map((prediction, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">
                          {prediction.period.toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                          })}
                        </h3>
                        <Badge className="bg-blue-100 text-blue-800">
                          {(prediction.confidenceScore * 100).toFixed(1)}%
                          confidence
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Gross Revenue</p>
                          <p className="font-semibold">
                            {formatCurrency(prediction.predictedGrossRevenue)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Net Revenue</p>
                          <p className="font-semibold">
                            {formatCurrency(prediction.predictedNetRevenue)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                          <span>Predicted Margin</span>
                          <span>
                            {(prediction.predictedMargin * 100).toFixed(1)}%
                          </span>
                        </div>
                        <Progress
                          value={prediction.predictedMargin * 100}
                          className="h-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Model Performance</CardTitle>
                <CardDescription>
                  ARIMA + LSTM Hybrid model accuracy metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Model v3.2-arima-lstm achieving 92% accuracy with 95% data
                      quality score
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Forecast Accuracy</span>
                        <span>92.0%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Data Quality Score</span>
                        <span>95.0%</span>
                      </div>
                      <Progress value={95} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Model Confidence</span>
                        <span>87.2%</span>
                      </div>
                      <Progress value={87.2} className="h-2" />
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Feature Importance</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Historical Revenue Trends</span>
                        <Badge variant="outline">25%</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Patient Volume Patterns</span>
                        <Badge variant="outline">20%</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Payer Mix Changes</span>
                        <Badge variant="outline">18%</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Seasonal Adjustments</span>
                        <Badge variant="outline">15%</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Economic Indicators</span>
                        <Badge variant="outline">12%</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Regulatory Changes</span>
                        <Badge variant="outline">10%</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scenario Analysis</CardTitle>
              <CardDescription>
                Compare different revenue scenarios with probability assessments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex gap-2">
                  {(["bestCase", "mostLikely", "worstCase"] as const).map(
                    (scenario) => (
                      <Button
                        key={scenario}
                        variant={
                          selectedScenario === scenario ? "default" : "outline"
                        }
                        onClick={() => setSelectedScenario(scenario)}
                        className="capitalize"
                      >
                        {scenario === "bestCase"
                          ? "Best Case"
                          : scenario === "mostLikely"
                            ? "Most Likely"
                            : "Worst Case"}
                      </Button>
                    ),
                  )}
                </div>

                {selectedScenarioData && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-blue-50 rounded-lg">
                      <div
                        className={`text-3xl font-bold ${getScenarioColor(selectedScenario)}`}
                      >
                        {formatCurrency(selectedScenarioData.totalRevenue)}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Total Revenue
                      </p>
                    </div>

                    <div className="text-center p-6 bg-green-50 rounded-lg">
                      <div
                        className={`text-3xl font-bold ${getScenarioColor(selectedScenario)}`}
                      >
                        {formatCurrency(selectedScenarioData.totalMargin)}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Total Margin</p>
                    </div>

                    <div className="text-center p-6 bg-purple-50 rounded-lg">
                      <div
                        className={`text-3xl font-bold ${getScenarioColor(selectedScenario)}`}
                      >
                        {(selectedScenarioData.probability * 100).toFixed(1)}%
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Probability</p>
                    </div>
                  </div>
                )}

                {selectedScenarioData && (
                  <div>
                    <h4 className="font-semibold mb-3">Key Drivers</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {selectedScenarioData.keyDrivers.map((driver, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="justify-center p-2"
                        >
                          {driver
                            .replace("_", " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Mix Optimization</CardTitle>
              <CardDescription>
                AI-powered optimization for maximum revenue and margin
                improvement
              </CardDescription>
            </CardHeader>
            <CardContent>
              {serviceMixOptimization && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(
                          serviceMixOptimization.expectedResults
                            .totalRevenueIncrease,
                        )}
                      </div>
                      <p className="text-sm text-gray-600">Revenue Increase</p>
                    </div>

                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        +
                        {(
                          serviceMixOptimization.expectedResults
                            .totalMarginImprovement * 100
                        ).toFixed(1)}
                        %
                      </div>
                      <p className="text-sm text-gray-600">
                        Margin Improvement
                      </p>
                    </div>

                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        +
                        {(
                          serviceMixOptimization.expectedResults
                            .capacityUtilizationImprovement * 100
                        ).toFixed(1)}
                        %
                      </div>
                      <p className="text-sm text-gray-600">
                        Capacity Utilization
                      </p>
                    </div>

                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {serviceMixOptimization.expectedResults.roi.toFixed(1)}x
                      </div>
                      <p className="text-sm text-gray-600">
                        Return on Investment
                      </p>
                    </div>
                  </div>

                  <Alert>
                    <Target className="h-4 w-4" />
                    <AlertDescription>
                      Optimization algorithm considers revenue maximization
                      (40%), margin optimization (35%), and capacity utilization
                      (25%) with operational constraints.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Risk Factors</CardTitle>
                <CardDescription>
                  Identified risks with probability and impact assessment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {forecast?.riskFactors.map((risk, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle
                          className={`h-4 w-4 ${getRiskColor(risk.potentialImpact)}`}
                        />
                        <span className="font-medium capitalize">
                          {risk.riskType} Risk
                        </span>
                        <Badge
                          variant={
                            risk.potentialImpact >= 0.15
                              ? "destructive"
                              : risk.potentialImpact >= 0.1
                                ? "default"
                                : "secondary"
                          }
                        >
                          {(risk.potentialImpact * 100).toFixed(1)}% impact
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {risk.description}
                      </p>

                      <div className="mb-3">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Probability</span>
                          <span>{(risk.probability * 100).toFixed(1)}%</span>
                        </div>
                        <Progress
                          value={risk.probability * 100}
                          className="h-2"
                        />
                      </div>

                      <div>
                        <h5 className="text-sm font-medium mb-2">
                          Mitigation Strategies
                        </h5>
                        <div className="space-y-1">
                          {risk.mitigationStrategies.map(
                            (strategy, strategyIndex) => (
                              <div
                                key={strategyIndex}
                                className="flex items-center gap-2"
                              >
                                <CheckCircle className="h-3 w-3 text-green-600" />
                                <span className="text-sm">{strategy}</span>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Opportunities</CardTitle>
                <CardDescription>
                  Identified opportunities for revenue growth and optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {forecast?.opportunityAnalysis.map((opportunity, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="font-medium capitalize">
                          {opportunity.opportunityType.replace("_", " ")}
                        </span>
                        <Badge className="bg-green-100 text-green-800">
                          {formatCurrency(opportunity.potentialValue)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {opportunity.description}
                      </p>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Implementation</p>
                          <p className="font-medium capitalize">
                            {opportunity.implementationEffort}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Timeline</p>
                          <p className="font-medium">
                            {opportunity.timeToRealization} months
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">ROI</p>
                          <p className="font-medium">
                            {opportunity.roi.toFixed(1)}x
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RevenueIntelligenceDashboard;
