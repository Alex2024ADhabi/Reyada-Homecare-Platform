import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Brain,
  Lightbulb,
  Clock,
  Users,
} from "lucide-react";
import { damanAnalyticsIntelligence } from "@/services/daman-analytics-intelligence.service";

interface DamanPredictiveAnalyticsProps {
  authorizationData?: any;
  onRecommendationApply?: (recommendation: string) => void;
}

export const DamanPredictiveAnalytics: React.FC<
  DamanPredictiveAnalyticsProps
> = ({ authorizationData, onRecommendationApply }) => {
  const [prediction, setPrediction] = useState<any>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [trendAnalysis, setTrendAnalysis] = useState<any>(null);
  const [slaCompliance, setSlaCompliance] = useState<any>(null);
  const [capacityPlanning, setCapacityPlanning] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<
    "week" | "month" | "quarter" | "year"
  >("month");

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedTimeRange]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // Load all analytics data
      const [predictionResult, trendsResult, slaResult, capacityResult] =
        await Promise.all([
          authorizationData
            ? damanAnalyticsIntelligence.predictAuthorizationSuccess(
                authorizationData,
              )
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
    } catch (error) {
      console.error("Failed to load analytics data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 0.8) return "text-green-600";
    if (probability >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const getProbabilityBadgeVariant = (probability: number) => {
    if (probability >= 0.8) return "default";
    if (probability >= 0.6) return "secondary";
    return "destructive";
  };

  const renderPredictionCard = () => {
    if (!prediction) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Authorization Success Prediction
          </CardTitle>
          <CardDescription>
            AI-powered analysis of approval probability
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div
              className={`text-4xl font-bold ${getProbabilityColor(prediction.authorizationSuccessProbability)}`}
            >
              {Math.round(prediction.authorizationSuccessProbability * 100)}%
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Success Probability
            </div>
            <Badge
              variant={getProbabilityBadgeVariant(
                prediction.authorizationSuccessProbability,
              )}
              className="mt-2"
            >
              Confidence: {Math.round(prediction.confidenceLevel * 100)}%
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {Math.round(prediction.denialRiskScore * 100)}%
              </div>
              <div className="text-sm text-red-700">Denial Risk</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {prediction.factors.positive.length}
              </div>
              <div className="text-sm text-blue-700">Positive Factors</div>
            </div>
          </div>

          {/* Factors Analysis */}
          <div className="space-y-3">
            {prediction.factors.positive.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  Positive Factors
                </h4>
                <ul className="text-sm space-y-1">
                  {prediction.factors.positive.map(
                    (factor: string, index: number) => (
                      <li key={index} className="text-green-600">
                        • {factor}
                      </li>
                    ),
                  )}
                </ul>
              </div>
            )}

            {prediction.factors.negative.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-red-700 mb-2 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  Risk Factors
                </h4>
                <ul className="text-sm space-y-1">
                  {prediction.factors.negative.map(
                    (factor: string, index: number) => (
                      <li key={index} className="text-red-600">
                        • {factor}
                      </li>
                    ),
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* Recommendations */}
          {prediction.recommendedActions.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                <Lightbulb className="h-4 w-4" />
                Recommended Actions
              </h4>
              <div className="space-y-2">
                {prediction.recommendedActions.map(
                  (action: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <span className="text-sm">{action}</span>
                      {onRecommendationApply && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onRecommendationApply(action)}
                        >
                          Apply
                        </Button>
                      )}
                    </div>
                  ),
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderPerformanceMetrics = () => {
    if (!performanceMetrics) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Avg Processing Time
                </p>
                <p className="text-2xl font-bold">
                  {performanceMetrics.averageProcessingTime}h
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2">
              <Progress value={75} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">Target: 48h</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Success Rate
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {Math.round(performanceMetrics.successRate * 100)}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2">
              <Progress
                value={performanceMetrics.successRate * 100}
                className="h-2"
              />
              <p className="text-xs text-gray-500 mt-1">Target: 95%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Denial Rate</p>
                <p className="text-2xl font-bold text-red-600">
                  {Math.round(performanceMetrics.denialRate * 100)}%
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div className="mt-2">
              <Progress
                value={performanceMetrics.denialRate * 100}
                className="h-2"
              />
              <p className="text-xs text-gray-500 mt-1">Target: &lt;5%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  SLA Compliance
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(performanceMetrics.slaCompliance * 100)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2">
              <Progress
                value={performanceMetrics.slaCompliance * 100}
                className="h-2"
              />
              <p className="text-xs text-gray-500 mt-1">Target: 98%</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderTrendAnalysis = () => {
    if (!trendAnalysis) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Trend Analysis
          </CardTitle>
          <CardDescription>
            Patterns and trends in authorization data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 mb-4">
            {["week", "month", "quarter", "year"].map((range) => (
              <Button
                key={range}
                variant={selectedTimeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTimeRange(range as any)}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-2">By Service Type</h4>
              <div className="space-y-2">
                {Object.entries(
                  trendAnalysis.approvalPatterns.byServiceType,
                ).map(([service, count]) => (
                  <div
                    key={service}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm">{service.replace("_", " ")}</span>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={((count as number) / 50) * 100}
                        className="w-20 h-2"
                      />
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">By Time of Day</h4>
              <div className="space-y-2">
                {Object.entries(trendAnalysis.approvalPatterns.byTimeOfDay).map(
                  ([time, count]) => (
                    <div
                      key={time}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm">{time}</span>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={((count as number) / 40) * 100}
                          className="w-20 h-2"
                        />
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>

          {trendAnalysis.emergingPatterns.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Emerging Patterns</h4>
              <ul className="text-sm space-y-1">
                {trendAnalysis.emergingPatterns.map(
                  (pattern: string, index: number) => (
                    <li key={index} className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      {pattern}
                    </li>
                  ),
                )}
              </ul>
            </div>
          )}

          {trendAnalysis.anomalies.detected && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Anomalies Detected:</strong>
                <ul className="mt-1 list-disc list-inside">
                  {trendAnalysis.anomalies.description.map(
                    (desc: string, index: number) => (
                      <li key={index}>{desc}</li>
                    ),
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderSLACompliance = () => {
    if (!slaCompliance) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            SLA Compliance Monitoring
          </CardTitle>
          <CardDescription>
            Service level agreement performance tracking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {Math.round(slaCompliance.overallCompliance * 100)}%
            </div>
            <div className="text-sm text-gray-600">Overall Compliance</div>
          </div>

          {slaCompliance.breaches.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2 text-red-700">
                SLA Breaches
              </h4>
              <div className="space-y-2">
                {slaCompliance.breaches.map((breach: any, index: number) => (
                  <Alert key={index} variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>{breach.severity.toUpperCase()}:</strong>{" "}
                      {breach.details.join(", ")}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          )}

          {slaCompliance.recommendations.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Recommendations</h4>
              <ul className="text-sm space-y-1">
                {slaCompliance.recommendations.map(
                  (rec: string, index: number) => (
                    <li key={index} className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-600" />
                      {rec}
                    </li>
                  ),
                )}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderCapacityPlanning = () => {
    if (!capacityPlanning) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Capacity Planning
          </CardTitle>
          <CardDescription>
            Resource planning and scaling recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {capacityPlanning.currentLoad}
              </div>
              <div className="text-sm text-blue-700">Current Load</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {capacityPlanning.projectedLoad}
              </div>
              <div className="text-sm text-green-700">Projected Load</div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Capacity Utilization</span>
              <span>
                {Math.round(capacityPlanning.capacityUtilization * 100)}%
              </span>
            </div>
            <Progress
              value={capacityPlanning.capacityUtilization * 100}
              className="h-3"
            />
          </div>

          {capacityPlanning.scalingRecommendations.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">
                Scaling Recommendations
              </h4>
              <ul className="text-sm space-y-1">
                {capacityPlanning.scalingRecommendations.map(
                  (rec: string, index: number) => (
                    <li key={index} className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      {rec}
                    </li>
                  ),
                )}
              </ul>
            </div>
          )}

          <div>
            <h4 className="text-sm font-medium mb-2">Resource Requirements</h4>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-gray-50 rounded">
                <div className="font-bold">
                  {capacityPlanning.resourceRequirements.staff}
                </div>
                <div className="text-xs text-gray-600">Staff</div>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <div className="font-bold">
                  {capacityPlanning.resourceRequirements.systems.length}
                </div>
                <div className="text-xs text-gray-600">Systems</div>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <div className="font-bold">
                  {capacityPlanning.resourceRequirements.infrastructure.length}
                </div>
                <div className="text-xs text-gray-600">Infrastructure</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Daman Predictive Analytics</h2>
          <p className="text-gray-600">
            AI-powered insights and performance monitoring
          </p>
        </div>
        <Button onClick={loadAnalyticsData} disabled={isLoading}>
          <Activity className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      <Tabs defaultValue="prediction" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="prediction">Prediction</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="sla">SLA</TabsTrigger>
          <TabsTrigger value="capacity">Capacity</TabsTrigger>
        </TabsList>

        <TabsContent value="prediction" className="space-y-4">
          {renderPredictionCard()}
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          {renderPerformanceMetrics()}
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          {renderTrendAnalysis()}
        </TabsContent>

        <TabsContent value="sla" className="space-y-4">
          {renderSLACompliance()}
        </TabsContent>

        <TabsContent value="capacity" className="space-y-4">
          {renderCapacityPlanning()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DamanPredictiveAnalytics;
