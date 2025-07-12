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
  FileText,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Clock,
  Target,
  Zap,
  BarChart3,
} from "lucide-react";

interface SmartClaimsAnalytics {
  claimAnalyticsId: string;
  claimId: string;
  cleanClaimProbability: number;
  denialRiskScore: number;
  documentationQualityScore: number;
  codingAccuracyScore: number;
  authorizationAlignmentScore: number;
  predictedOutcome: string;
  processingTimeEstimate: number;
  optimizationSuggestions: ClaimOptimizationSuggestion[];
}

interface ClaimOptimizationSuggestion {
  category: "documentation" | "coding" | "authorization" | "timing";
  suggestion: string;
  expectedImpact: number;
  implementationEffort: "low" | "medium" | "high";
  priority: number;
}

interface PaymentPrediction {
  claimId: string;
  paymentProbability: number;
  expectedPaymentAmount: number;
  expectedPaymentDate: Date;
  paymentRisk: number;
  confidenceScore: number;
}

interface ClaimsIntelligenceMetrics {
  totalClaimsAnalyzed: number;
  averageCleanClaimRate: number;
  averageDenialRiskReduction: number;
  averageProcessingTimeReduction: number;
  optimizationImpact: {
    successRateImprovement: number;
    costSavings: number;
    timeReduction: number;
  };
}

const SmartClaimsAnalyticsDashboard: React.FC = () => {
  const [claimsAnalytics, setClaimsAnalytics] = useState<
    SmartClaimsAnalytics[]
  >([]);
  const [paymentPredictions, setPaymentPredictions] = useState<
    PaymentPrediction[]
  >([]);
  const [metrics, setMetrics] = useState<ClaimsIntelligenceMetrics | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] =
    useState<SmartClaimsAnalytics | null>(null);

  useEffect(() => {
    loadSmartClaimsIntelligence();
  }, []);

  const loadSmartClaimsIntelligence = async () => {
    try {
      setLoading(true);

      // Mock data - in production, this would call the actual API
      const mockClaimsAnalytics: SmartClaimsAnalytics[] = [
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

      const mockPaymentPredictions: PaymentPrediction[] = [
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

      const mockMetrics: ClaimsIntelligenceMetrics = {
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
    } catch (error) {
      console.error("Error loading smart claims intelligence:", error);
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

  const getCleanClaimColor = (probability: number) => {
    if (probability >= 0.85) return "text-green-600";
    if (probability >= 0.7) return "text-yellow-600";
    return "text-red-600";
  };

  const getCleanClaimBadge = (probability: number) => {
    if (probability >= 0.85)
      return <Badge className="bg-green-100 text-green-800">High</Badge>;
    if (probability >= 0.7)
      return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
    return <Badge className="bg-red-100 text-red-800">Low</Badge>;
  };

  const getRiskColor = (risk: number) => {
    if (risk >= 0.3) return "text-red-600";
    if (risk >= 0.2) return "text-yellow-600";
    return "text-green-600";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Smart Claims Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-8 w-8 text-blue-600" />
            Smart Claims Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            AI-powered claims processing optimization and payment predictions
          </p>
        </div>
        <Button
          onClick={loadSmartClaimsIntelligence}
          className="flex items-center gap-2"
        >
          <Zap className="h-4 w-4" />
          Refresh Analytics
        </Button>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Claims Analyzed
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.totalClaimsAnalyzed || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +15% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Clean Claim Rate
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((metrics?.averageCleanClaimRate || 0) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">+12% improvement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Denial Risk Reduction
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((metrics?.averageDenialRiskReduction || 0) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              AI-powered optimization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Processing Time Saved
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.averageProcessingTimeReduction || 0} days
            </div>
            <p className="text-xs text-muted-foreground">Average reduction</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analytics">Claims Analytics</TabsTrigger>
          <TabsTrigger value="predictions">Payment Predictions</TabsTrigger>
          <TabsTrigger value="optimization">Optimization Engine</TabsTrigger>
          <TabsTrigger value="insights">Intelligence Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Smart Claims Analysis</CardTitle>
              <CardDescription>
                AI-powered analysis of claim quality and optimization
                opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {claimsAnalytics.map((claim) => (
                  <div
                    key={claim.claimAnalyticsId}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedClaim(claim)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{claim.claimId}</h3>
                        {getCleanClaimBadge(claim.cleanClaimProbability)}
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-lg font-bold ${getCleanClaimColor(claim.cleanClaimProbability)}`}
                        >
                          {(claim.cleanClaimProbability * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-500">
                          Clean Claim Probability
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-sm text-gray-600">
                          Documentation
                        </div>
                        <div className="font-semibold">
                          {(claim.documentationQualityScore * 100).toFixed(0)}%
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600">Coding</div>
                        <div className="font-semibold">
                          {(claim.codingAccuracyScore * 100).toFixed(0)}%
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600">
                          Authorization
                        </div>
                        <div className="font-semibold">
                          {(claim.authorizationAlignmentScore * 100).toFixed(0)}
                          %
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600">
                          Processing Time
                        </div>
                        <div className="font-semibold">
                          {claim.processingTimeEstimate} days
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle
                          className={`h-4 w-4 ${getRiskColor(claim.denialRiskScore)}`}
                        />
                        <span className="text-sm">
                          Denial Risk:{" "}
                          {(claim.denialRiskScore * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Badge variant="outline">
                        {claim.optimizationSuggestions.length} optimization
                        {claim.optimizationSuggestions.length !== 1 ? "s" : ""}
                      </Badge>
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Overall Quality Score</span>
                        <span>
                          {(
                            ((claim.documentationQualityScore +
                              claim.codingAccuracyScore +
                              claim.authorizationAlignmentScore) /
                              3) *
                            100
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                      <Progress
                        value={
                          ((claim.documentationQualityScore +
                            claim.codingAccuracyScore +
                            claim.authorizationAlignmentScore) /
                            3) *
                          100
                        }
                        className="h-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Predictions</CardTitle>
              <CardDescription>
                AI-powered predictions for claim payment probability and timing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentPredictions.map((prediction) => (
                  <div
                    key={prediction.claimId}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{prediction.claimId}</h3>
                      <Badge
                        className={`${prediction.paymentProbability >= 0.8 ? "bg-green-100 text-green-800" : prediction.paymentProbability >= 0.6 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}
                      >
                        {(prediction.paymentProbability * 100).toFixed(1)}%
                        payment probability
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">
                          {formatCurrency(prediction.expectedPaymentAmount)}
                        </div>
                        <p className="text-sm text-gray-600">
                          Expected Payment
                        </p>
                      </div>

                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-600">
                          {prediction.expectedPaymentDate.toLocaleDateString()}
                        </div>
                        <p className="text-sm text-gray-600">Expected Date</p>
                      </div>

                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-lg font-bold text-purple-600">
                          {(prediction.confidenceScore * 100).toFixed(1)}%
                        </div>
                        <p className="text-sm text-gray-600">Confidence</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Payment Risk</span>
                        <span className={getRiskColor(prediction.paymentRisk)}>
                          {(prediction.paymentRisk * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress
                        value={prediction.paymentRisk * 100}
                        className="h-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Claims Optimization Engine</CardTitle>
              <CardDescription>
                Advanced AI algorithms for claims processing optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Multi-layered AI engine analyzing documentation quality,
                    coding accuracy, and authorization alignment for optimal
                    claim success rates.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">
                      Optimization Categories
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div>
                          <div className="font-medium">
                            Documentation Quality
                          </div>
                          <div className="text-sm text-gray-600">
                            Clinical notes and supporting evidence
                          </div>
                        </div>
                        <Badge variant="outline">35%</Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div>
                          <div className="font-medium">Coding Accuracy</div>
                          <div className="text-sm text-gray-600">
                            ICD-10 and CPT code optimization
                          </div>
                        </div>
                        <Badge variant="outline">30%</Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <div>
                          <div className="font-medium">
                            Authorization Alignment
                          </div>
                          <div className="text-sm text-gray-600">
                            Prior auth requirements matching
                          </div>
                        </div>
                        <Badge variant="outline">25%</Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                        <div>
                          <div className="font-medium">Submission Timing</div>
                          <div className="text-sm text-gray-600">
                            Optimal submission windows
                          </div>
                        </div>
                        <Badge variant="outline">10%</Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Performance Metrics</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Clean Claim Rate</span>
                          <span>84.2%</span>
                        </div>
                        <Progress value={84.2} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Denial Prevention</span>
                          <span>23.1%</span>
                        </div>
                        <Progress value={23.1} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Processing Acceleration</span>
                          <span>45.8%</span>
                        </div>
                        <Progress value={45.8} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Cost Reduction</span>
                          <span>18.7%</span>
                        </div>
                        <Progress value={18.7} className="h-2" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Intelligence Impact</CardTitle>
                <CardDescription>
                  Measurable improvements from AI-powered claims optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      +
                      {(
                        (metrics?.optimizationImpact?.successRateImprovement ||
                          0) * 100
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
                        {formatCurrency(
                          metrics?.optimizationImpact?.costSavings || 0,
                        )}
                      </div>
                      <p className="text-xs text-gray-600">Cost Savings</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {metrics?.optimizationImpact?.timeReduction || 0} days
                      </div>
                      <p className="text-xs text-gray-600">Time Reduction</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
                <CardDescription>
                  AI-generated insights from claims processing analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-blue-900">
                        Documentation Enhancement
                      </div>
                      <div className="text-sm text-blue-700">
                        Claims with enhanced clinical documentation show 35%
                        higher approval rates
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-green-900">
                        Coding Optimization
                      </div>
                      <div className="text-sm text-green-700">
                        AI-optimized coding reduces denial rates by 23% on
                        average
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                    <Target className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-purple-900">
                        Authorization Alignment
                      </div>
                      <div className="text-sm text-purple-700">
                        Perfect authorization alignment increases success
                        probability by 28%
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                    <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-orange-900">
                        Processing Speed
                      </div>
                      <div className="text-sm text-orange-700">
                        Optimized claims process 4.5 days faster than standard
                        submissions
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Detailed Claim Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Claim Analysis Details</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedClaim(null)}
                >
                  Close
                </Button>
              </div>
              <CardDescription>
                {selectedClaim.claimId} - Comprehensive AI Analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {(selectedClaim.cleanClaimProbability * 100).toFixed(1)}%
                    </div>
                    <p className="text-sm text-gray-600">
                      Clean Claim Probability
                    </p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {(selectedClaim.denialRiskScore * 100).toFixed(1)}%
                    </div>
                    <p className="text-sm text-gray-600">Denial Risk Score</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedClaim.processingTimeEstimate} days
                    </div>
                    <p className="text-sm text-gray-600">Processing Time</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {selectedClaim.predictedOutcome}
                    </div>
                    <p className="text-sm text-gray-600">Predicted Outcome</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Quality Scores</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Documentation Quality</span>
                          <span>
                            {(
                              selectedClaim.documentationQualityScore * 100
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                        <Progress
                          value={selectedClaim.documentationQualityScore * 100}
                          className="h-2"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Coding Accuracy</span>
                          <span>
                            {(selectedClaim.codingAccuracyScore * 100).toFixed(
                              1,
                            )}
                            %
                          </span>
                        </div>
                        <Progress
                          value={selectedClaim.codingAccuracyScore * 100}
                          className="h-2"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Authorization Alignment</span>
                          <span>
                            {(
                              selectedClaim.authorizationAlignmentScore * 100
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                        <Progress
                          value={
                            selectedClaim.authorizationAlignmentScore * 100
                          }
                          className="h-2"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">
                      Optimization Suggestions
                    </h3>
                    <div className="space-y-3">
                      {selectedClaim.optimizationSuggestions.map(
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

export default SmartClaimsAnalyticsDashboard;
