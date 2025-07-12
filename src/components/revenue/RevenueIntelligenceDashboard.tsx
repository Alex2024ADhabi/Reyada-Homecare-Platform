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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TrendingUp,
  DollarSign,
  BarChart3,
  PieChart,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  Brain,
  Shield,
  Search,
  FileText,
  Clock,
  Users,
  Activity,
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

// Advanced Claims Management Interfaces
interface PredictiveClaimsData {
  claimId: string;
  approvalProbability: number;
  denialRiskScore: number;
  expectedProcessingTime: number;
  reimbursementPrediction: {
    expectedAmount: number;
    confidenceLevel: number;
  };
  recommendations: string[];
}

interface AutomatedAuthData {
  authId: string;
  automationLevel: "full" | "partial" | "manual";
  authorizationStatus: string;
  processingTime: number;
  confidenceScore: number;
}

interface RevenueLeakageData {
  leakageType: string;
  severity: string;
  estimatedLoss: number;
  status: string;
}

interface PayerContractData {
  payerName: string;
  contractType: string;
  performanceMetrics: {
    averagePaymentTime: number;
    denialRate: number;
    contractCompliance: number;
  };
  status: string;
}

interface FinancialMetrics {
  totalRevenue: number;
  netRevenue: number;
  grossMargin: number;
  revenueGrowthRate: number;
  collectionRate: number;
  denialRate: number;
  averageDaysToPayment: number;
}

const RevenueIntelligenceDashboard: React.FC = () => {
  const [forecast, setForecast] = useState<RevenueForecast | null>(null);
  const [serviceMixOptimization, setServiceMixOptimization] =
    useState<ServiceMixOptimization | null>(null);
  const [predictiveClaims, setPredictiveClaims] = useState<
    PredictiveClaimsData[]
  >([]);
  const [automatedAuth, setAutomatedAuth] = useState<AutomatedAuthData[]>([]);
  const [revenueLeakage, setRevenueLeakage] = useState<RevenueLeakageData[]>(
    [],
  );
  const [payerContracts, setPayerContracts] = useState<PayerContractData[]>([]);
  const [financialMetrics, setFinancialMetrics] =
    useState<FinancialMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedScenario, setSelectedScenario] = useState<
    "bestCase" | "worstCase" | "mostLikely"
  >("mostLikely");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadRevenueIntelligence();
  }, []);

  const loadRevenueIntelligence = async () => {
    try {
      setLoading(true);

      // Load Advanced Claims Management Data
      await loadPredictiveClaimsData();
      await loadAutomatedAuthData();
      await loadRevenueLeakageData();
      await loadPayerContractsData();
      await loadFinancialMetricsData();

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

  // Advanced Claims Management Data Loading Functions
  const loadPredictiveClaimsData = async () => {
    // Mock predictive claims analytics data
    const mockPredictiveClaims: PredictiveClaimsData[] = [
      {
        claimId: "CLM-2024-001",
        approvalProbability: 0.94,
        denialRiskScore: 0.06,
        expectedProcessingTime: 0.5,
        reimbursementPrediction: {
          expectedAmount: 1530,
          confidenceLevel: 0.92,
        },
        recommendations: ["High approval probability", "Submit immediately"],
      },
      {
        claimId: "CLM-2024-002",
        approvalProbability: 0.78,
        denialRiskScore: 0.22,
        expectedProcessingTime: 2.1,
        reimbursementPrediction: {
          expectedAmount: 2040,
          confidenceLevel: 0.85,
        },
        recommendations: ["Moderate risk", "Review documentation"],
      },
    ];
    setPredictiveClaims(mockPredictiveClaims);
  };

  const loadAutomatedAuthData = async () => {
    // Mock automated authorization data
    const mockAutomatedAuth: AutomatedAuthData[] = [
      {
        authId: "AUTH-001",
        automationLevel: "full",
        authorizationStatus: "approved",
        processingTime: 0.25,
        confidenceScore: 0.96,
      },
      {
        authId: "AUTH-002",
        automationLevel: "partial",
        authorizationStatus: "requires_review",
        processingTime: 1.5,
        confidenceScore: 0.78,
      },
    ];
    setAutomatedAuth(mockAutomatedAuth);
  };

  const loadRevenueLeakageData = async () => {
    // Mock revenue leakage detection data
    const mockRevenueLeakage: RevenueLeakageData[] = [
      {
        leakageType: "undercoding",
        severity: "medium",
        estimatedLoss: 15000,
        status: "detected",
      },
      {
        leakageType: "payment_delays",
        severity: "low",
        estimatedLoss: 8500,
        status: "monitoring",
      },
    ];
    setRevenueLeakage(mockRevenueLeakage);
  };

  const loadPayerContractsData = async () => {
    // Mock payer contract management data
    const mockPayerContracts: PayerContractData[] = [
      {
        payerName: "Daman Health Insurance",
        contractType: "fee_for_service",
        performanceMetrics: {
          averagePaymentTime: 28.5,
          denialRate: 0.032,
          contractCompliance: 0.94,
        },
        status: "active",
      },
      {
        payerName: "ADNIC Insurance",
        contractType: "bundled_payment",
        performanceMetrics: {
          averagePaymentTime: 32.1,
          denialRate: 0.045,
          contractCompliance: 0.89,
        },
        status: "pending_renewal",
      },
    ];
    setPayerContracts(mockPayerContracts);
  };

  const loadFinancialMetricsData = async () => {
    // Mock financial performance analytics
    const mockFinancialMetrics: FinancialMetrics = {
      totalRevenue: 2847650,
      netRevenue: 2456780,
      grossMargin: 0.42,
      revenueGrowthRate: 0.123,
      collectionRate: 0.863,
      denialRate: 0.032,
      averageDaysToPayment: 28.5,
    };
    setFinancialMetrics(mockFinancialMetrics);
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
            <Brain className="h-8 w-8 text-blue-600" />
            Revenue Intelligence Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Advanced Claims Management & Revenue Cycle Optimization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-100 text-green-800">
            AI-Powered Analytics
          </Badge>
          <Button
            onClick={loadRevenueIntelligence}
            className="flex items-center gap-2"
          >
            <Zap className="h-4 w-4" />
            Refresh Intelligence
          </Button>
        </div>
      </div>

      {/* Advanced Claims Management Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(financialMetrics?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              +{((financialMetrics?.revenueGrowthRate || 0) * 100).toFixed(1)}%
              growth
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Collection Rate
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {((financialMetrics?.collectionRate || 0) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Above industry average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Denial Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {((financialMetrics?.denialRate || 0) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Below industry average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Days to Payment
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {(financialMetrics?.averageDaysToPayment || 0).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Faster than average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Automation</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">87.5%</div>
            <p className="text-xs text-muted-foreground">Claims automated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Revenue Leakage
            </CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(
                revenueLeakage.reduce(
                  (sum, leak) => sum + leak.estimatedLoss,
                  0,
                ),
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Detected & monitored
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">
            <Activity className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="multi-payer">
            <Users className="h-4 w-4 mr-2" />
            Multi-Payer
          </TabsTrigger>
          <TabsTrigger value="eligibility">
            <CheckCircle className="h-4 w-4 mr-2" />
            Eligibility
          </TabsTrigger>
          <TabsTrigger value="reconciliation">
            <BarChart3 className="h-4 w-4 mr-2" />
            Reconciliation
          </TabsTrigger>
          <TabsTrigger value="denials">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Denials
          </TabsTrigger>
          <TabsTrigger value="forecasting">
            <TrendingUp className="h-4 w-4 mr-2" />
            Forecasting
          </TabsTrigger>
          <TabsTrigger value="predictive">
            <Brain className="h-4 w-4 mr-2" />
            Predictive
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Cycle Performance</CardTitle>
                <CardDescription>
                  Real-time performance metrics and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Claims Processing Automation</span>
                      <span className="font-semibold text-blue-600">87.5%</span>
                    </div>
                    <Progress value={87.5} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Prior Authorization Success</span>
                      <span className="font-semibold text-green-600">
                        94.2%
                      </span>
                    </div>
                    <Progress value={94.2} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Revenue Leakage Prevention</span>
                      <span className="font-semibold text-purple-600">
                        91.8%
                      </span>
                    </div>
                    <Progress value={91.8} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Contract Compliance</span>
                      <span className="font-semibold text-indigo-600">
                        96.3%
                      </span>
                    </div>
                    <Progress value={96.3} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Insights</CardTitle>
                <CardDescription>
                  Machine learning recommendations and predictions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <Brain className="h-4 w-4" />
                    <AlertDescription>
                      AI model v3.2 achieving 94% accuracy in claim approval
                      predictions
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">
                          Automated Processing
                        </span>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">
                        +23% efficiency
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">
                          Denial Prevention
                        </span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        -18% denials
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium">
                          Leakage Detection
                        </span>
                      </div>
                      <Badge className="bg-purple-100 text-purple-800">
                        AED 459K recovered
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Predictive Claims Analytics</CardTitle>
              <CardDescription>
                AI-powered claim approval prediction and risk assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      94.2%
                    </div>
                    <p className="text-sm text-gray-600">
                      Average Approval Probability
                    </p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      0.8 days
                    </div>
                    <p className="text-sm text-gray-600">Avg Processing Time</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      92.1%
                    </div>
                    <p className="text-sm text-gray-600">Prediction Accuracy</p>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Claim ID</TableHead>
                      <TableHead>Approval Probability</TableHead>
                      <TableHead>Risk Score</TableHead>
                      <TableHead>Processing Time</TableHead>
                      <TableHead>Expected Amount</TableHead>
                      <TableHead>Recommendations</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {predictiveClaims.map((claim) => (
                      <TableRow key={claim.claimId}>
                        <TableCell className="font-medium">
                          {claim.claimId}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={claim.approvalProbability * 100}
                              className="w-16 h-2"
                            />
                            <span className="text-sm font-medium">
                              {(claim.approvalProbability * 100).toFixed(1)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              claim.denialRiskScore < 0.1
                                ? "secondary"
                                : claim.denialRiskScore < 0.3
                                  ? "default"
                                  : "destructive"
                            }
                          >
                            {(claim.denialRiskScore * 100).toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {claim.expectedProcessingTime} days
                        </TableCell>
                        <TableCell>
                          {formatCurrency(
                            claim.reimbursementPrediction.expectedAmount,
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {claim.recommendations
                              .slice(0, 2)
                              .map((rec, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {rec}
                                </Badge>
                              ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="authorization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automated Prior Authorization</CardTitle>
              <CardDescription>
                Streamlined insurance authorization with AI-powered decision
                making
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      78.5%
                    </div>
                    <p className="text-sm text-gray-600">
                      Full Automation Rate
                    </p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      0.25 hrs
                    </div>
                    <p className="text-sm text-gray-600">Avg Processing Time</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      96.3%
                    </div>
                    <p className="text-sm text-gray-600">Approval Rate</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      -67%
                    </div>
                    <p className="text-sm text-gray-600">
                      Processing Time Reduction
                    </p>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Auth ID</TableHead>
                      <TableHead>Automation Level</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Processing Time</TableHead>
                      <TableHead>Confidence Score</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {automatedAuth.map((auth) => (
                      <TableRow key={auth.authId}>
                        <TableCell className="font-medium">
                          {auth.authId}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              auth.automationLevel === "full"
                                ? "default"
                                : auth.automationLevel === "partial"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {auth.automationLevel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              auth.authorizationStatus === "approved"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {auth.authorizationStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>{auth.processingTime} hrs</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={auth.confidenceScore * 100}
                              className="w-16 h-2"
                            />
                            <span className="text-sm">
                              {(auth.confidenceScore * 100).toFixed(1)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leakage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Leakage Prevention</CardTitle>
              <CardDescription>
                Automated detection and prevention of billing discrepancies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(
                        revenueLeakage.reduce(
                          (sum, leak) => sum + leak.estimatedLoss,
                          0,
                        ),
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      Total Detected Leakage
                    </p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {revenueLeakage.length}
                    </div>
                    <p className="text-sm text-gray-600">
                      Active Investigations
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      91.8%
                    </div>
                    <p className="text-sm text-gray-600">Prevention Rate</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {revenueLeakage.map((leak, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <AlertTriangle
                            className={`h-4 w-4 ${
                              leak.severity === "high"
                                ? "text-red-600"
                                : leak.severity === "medium"
                                  ? "text-yellow-600"
                                  : "text-blue-600"
                            }`}
                          />
                          <span className="font-medium capitalize">
                            {leak.leakageType.replace("_", " ")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              leak.severity === "high"
                                ? "destructive"
                                : leak.severity === "medium"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {leak.severity}
                          </Badge>
                          <Badge variant="outline">{leak.status}</Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Estimated Loss:</span>
                          <p className="text-red-600 font-semibold">
                            {formatCurrency(leak.estimatedLoss)}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">Detection Method:</span>
                          <p>AI Pattern Analysis</p>
                        </div>
                        <div>
                          <span className="font-medium">Recovery Actions:</span>
                          <p>Automated correction initiated</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contracts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payer Contract Management</CardTitle>
              <CardDescription>
                Contract terms, rates, and performance monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {payerContracts.length}
                    </div>
                    <p className="text-sm text-gray-600">Active Contracts</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      96.3%
                    </div>
                    <p className="text-sm text-gray-600">Avg Compliance</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      28.5
                    </div>
                    <p className="text-sm text-gray-600">Avg Payment Days</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      3.2%
                    </div>
                    <p className="text-sm text-gray-600">Avg Denial Rate</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {payerContracts.map((contract, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">
                            {contract.payerName}
                          </h3>
                          <p className="text-sm text-gray-600 capitalize">
                            {contract.contractType.replace("_", " ")}
                          </p>
                        </div>
                        <Badge
                          variant={
                            contract.status === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {contract.status.replace("_", " ")}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Payment Time:</span>
                          <p>
                            {contract.performanceMetrics.averagePaymentTime}{" "}
                            days
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">Denial Rate:</span>
                          <p>
                            {(
                              contract.performanceMetrics.denialRate * 100
                            ).toFixed(1)}
                            %
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">Compliance:</span>
                          <p>
                            {(
                              contract.performanceMetrics.contractCompliance *
                              100
                            ).toFixed(1)}
                            %
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Multi-Payer Integration Tab */}
        <TabsContent value="multi-payer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Multi-Payer Integration Management</CardTitle>
              <CardDescription>
                Comprehensive payer connectivity and performance monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">8</div>
                  <p className="text-sm text-gray-600">Active Payers</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">96.2%</div>
                  <p className="text-sm text-gray-600">Integration Health</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">2.3s</div>
                  <p className="text-sm text-gray-600">Avg Response Time</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    94.8%
                  </div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  {
                    name: "Daman Health Insurance",
                    status: "active",
                    performance: 96.2,
                    responseTime: 1.8,
                    issues: 0,
                  },
                  {
                    name: "ADNIC Insurance",
                    status: "active",
                    performance: 94.5,
                    responseTime: 2.1,
                    issues: 1,
                  },
                  {
                    name: "Abu Dhabi National Insurance",
                    status: "active",
                    performance: 92.8,
                    responseTime: 2.5,
                    issues: 0,
                  },
                  {
                    name: "Dubai Insurance Company",
                    status: "active",
                    performance: 89.3,
                    responseTime: 3.2,
                    issues: 2,
                  },
                  {
                    name: "Oman Insurance Company",
                    status: "pending",
                    performance: 0,
                    responseTime: 0,
                    issues: 1,
                  },
                ].map((payer, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            payer.status === "active"
                              ? "bg-green-500"
                              : "bg-yellow-500"
                          }`}
                        ></div>
                        <h3 className="font-semibold">{payer.name}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            payer.status === "active" ? "default" : "secondary"
                          }
                        >
                          {payer.status}
                        </Badge>
                        {payer.issues > 0 && (
                          <Badge variant="destructive">
                            {payer.issues} issues
                          </Badge>
                        )}
                      </div>
                    </div>

                    {payer.status === "active" && (
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">
                            Performance Score:
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress
                              value={payer.performance}
                              className="flex-1 h-2"
                            />
                            <span className="text-sm font-medium">
                              {payer.performance}%
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Response Time:</span>
                          <p className="text-blue-600 font-semibold">
                            {payer.responseTime}s
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">Services:</span>
                          <p>Eligibility, Claims, Payments</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Real-Time Eligibility Verification Tab */}
        <TabsContent value="eligibility" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Real-Time Eligibility Verification</CardTitle>
              <CardDescription>
                Live insurance coverage validation and benefit verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">1,247</div>
                  <p className="text-sm text-gray-600">Verifications Today</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">2.3s</div>
                  <p className="text-sm text-gray-600">Avg Response Time</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    94.2%
                  </div>
                  <p className="text-sm text-gray-600">Eligibility Rate</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    78.5%
                  </div>
                  <p className="text-sm text-gray-600">Cache Hit Rate</p>
                </div>
                <div className="text-center p-4 bg-indigo-50 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">
                    99.1%
                  </div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                </div>
              </div>

              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Real-time eligibility verification active for all major
                    payers with 99.1% uptime
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Service Coverage Analysis</h4>
                    {[
                      {
                        service: "17-25-1 (Simple Nursing)",
                        coverage: 98.5,
                        authRequired: false,
                      },
                      {
                        service: "17-25-2 (Supportive Care)",
                        coverage: 97.2,
                        authRequired: false,
                      },
                      {
                        service: "17-25-3 (Consultation)",
                        coverage: 89.3,
                        authRequired: true,
                      },
                      {
                        service: "17-25-4 (Routine Nursing)",
                        coverage: 95.8,
                        authRequired: false,
                      },
                      {
                        service: "17-25-5 (Advanced Nursing)",
                        coverage: 82.1,
                        authRequired: true,
                      },
                    ].map((service, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded"
                      >
                        <div className="flex-1">
                          <span className="text-sm font-medium">
                            {service.service}
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress
                              value={service.coverage}
                              className="flex-1 h-2"
                            />
                            <span className="text-xs">{service.coverage}%</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          {service.authRequired ? (
                            <Badge variant="outline">Auth Required</Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-800">
                              Direct
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Recent Verifications</h4>
                    {[
                      {
                        patient: "Ahmed Al Mansoori",
                        payer: "Daman",
                        status: "Eligible",
                        time: "2 min ago",
                      },
                      {
                        patient: "Fatima Al Zaabi",
                        payer: "ADNIC",
                        status: "Eligible",
                        time: "5 min ago",
                      },
                      {
                        patient: "Mohammed Al Shamsi",
                        payer: "ADNIC",
                        status: "Pending",
                        time: "8 min ago",
                      },
                      {
                        patient: "Aisha Al Rashid",
                        payer: "Daman",
                        status: "Eligible",
                        time: "12 min ago",
                      },
                      {
                        patient: "Omar Al Maktoum",
                        payer: "Dubai Insurance",
                        status: "Eligible",
                        time: "15 min ago",
                      },
                    ].map((verification, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded"
                      >
                        <div>
                          <p className="font-medium text-sm">
                            {verification.patient}
                          </p>
                          <p className="text-xs text-gray-600">
                            {verification.payer}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              verification.status === "Eligible"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {verification.status}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            {verification.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Automated Claim Reconciliation Tab */}
        <TabsContent value="reconciliation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automated Claim Reconciliation</CardTitle>
              <CardDescription>
                Intelligent payment matching and variance analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">156</div>
                  <p className="text-sm text-gray-600">Reconciliations</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">89.2%</div>
                  <p className="text-sm text-gray-600">Auto Matched</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">2.1%</div>
                  <p className="text-sm text-gray-600">Avg Variance</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">0.8h</div>
                  <p className="text-sm text-gray-600">Processing Time</p>
                </div>
                <div className="text-center p-4 bg-indigo-50 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">
                    96.8%
                  </div>
                  <p className="text-sm text-gray-600">Accuracy</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">
                        Payment Matching Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Automated Matches</span>
                            <span className="font-semibold text-green-600">
                              89.2%
                            </span>
                          </div>
                          <Progress value={89.2} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Partial Matches</span>
                            <span className="font-semibold text-yellow-600">
                              7.3%
                            </span>
                          </div>
                          <Progress value={7.3} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Manual Review</span>
                            <span className="font-semibold text-red-600">
                              3.5%
                            </span>
                          </div>
                          <Progress value={3.5} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">
                        Variance Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          {
                            type: "Contractual Adjustments",
                            count: 23,
                            amount: 4580,
                          },
                          {
                            type: "Coordination of Benefits",
                            count: 8,
                            amount: 1240,
                          },
                          { type: "Timely Filing", count: 5, amount: 890 },
                          {
                            type: "Network Discounts",
                            count: 12,
                            amount: 2340,
                          },
                        ].map((variance, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between"
                          >
                            <div>
                              <p className="text-sm font-medium">
                                {variance.type}
                              </p>
                              <p className="text-xs text-gray-600">
                                {variance.count} adjustments
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold">
                                {formatCurrency(variance.amount)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Alert>
                  <BarChart3 className="h-4 w-4" />
                  <AlertDescription>
                    Automated reconciliation processing 96.8% of payments with
                    average variance of 2.1%
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Denial Management Workflow Tab */}
        <TabsContent value="denials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Denial Management Workflow</CardTitle>
              <CardDescription>
                Systematic denial resolution and appeal management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">42</div>
                  <p className="text-sm text-gray-600">Total Denials</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">78.6%</div>
                  <p className="text-sm text-gray-600">Auto Workflows</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">5.2d</div>
                  <p className="text-sm text-gray-600">Avg Resolution</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    67.3%
                  </div>
                  <p className="text-sm text-gray-600">Recovery Rate</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    73.8%
                  </div>
                  <p className="text-sm text-gray-600">Appeal Success</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">
                        Denial Categories
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          {
                            category: "Administrative",
                            count: 18,
                            percentage: 42.9,
                            color: "bg-blue-500",
                          },
                          {
                            category: "Clinical",
                            count: 12,
                            percentage: 28.6,
                            color: "bg-red-500",
                          },
                          {
                            category: "Authorization",
                            count: 8,
                            percentage: 19.0,
                            color: "bg-yellow-500",
                          },
                          {
                            category: "Technical",
                            count: 4,
                            percentage: 9.5,
                            color: "bg-green-500",
                          },
                        ].map((category, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-3 h-3 rounded-full ${category.color}`}
                              ></div>
                              <span className="text-sm font-medium">
                                {category.category}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{category.count}</span>
                              <span className="text-xs text-gray-600">
                                ({category.percentage}%)
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">
                        Recovery Potential
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-xl font-bold text-green-600">
                            {formatCurrency(28450)}
                          </div>
                          <p className="text-sm text-gray-600">
                            Estimated Recovery
                          </p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>High Probability</span>
                            <span className="font-semibold text-green-600">
                              {formatCurrency(18200)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Medium Probability</span>
                            <span className="font-semibold text-yellow-600">
                              {formatCurrency(7850)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Low Probability</span>
                            <span className="font-semibold text-red-600">
                              {formatCurrency(2400)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Active Denial Workflows</h4>
                  {[
                    {
                      id: "CLM-2024-001",
                      reason: "Missing Authorization",
                      category: "Authorization",
                      status: "In Progress",
                      daysOpen: 3,
                      recoveryAmount: 1800,
                    },
                    {
                      id: "CLM-2024-002",
                      reason: "Insufficient Documentation",
                      category: "Administrative",
                      status: "Appealed",
                      daysOpen: 8,
                      recoveryAmount: 2400,
                    },
                    {
                      id: "CLM-2024-003",
                      reason: "Medical Necessity",
                      category: "Clinical",
                      status: "Under Review",
                      daysOpen: 12,
                      recoveryAmount: 3600,
                    },
                    {
                      id: "CLM-2024-004",
                      reason: "Duplicate Claim",
                      category: "Technical",
                      status: "Resolved",
                      daysOpen: 2,
                      recoveryAmount: 900,
                    },
                  ].map((workflow, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{workflow.id}</span>
                          <Badge variant="outline">{workflow.category}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              workflow.status === "Resolved"
                                ? "default"
                                : workflow.status === "Appealed"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {workflow.status}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {workflow.daysOpen}d open
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Denial Reason:</span>
                          <p>{workflow.reason}</p>
                        </div>
                        <div>
                          <span className="font-medium">Recovery Amount:</span>
                          <p className="font-semibold text-green-600">
                            {formatCurrency(workflow.recoveryAmount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Forecasting Tab */}
        <TabsContent value="forecasting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Revenue Forecasting</CardTitle>
              <CardDescription>
                AI-powered predictive analytics with scenario modeling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">92.1%</div>
                  <p className="text-sm text-gray-600">Forecast Accuracy</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(3125000)}
                  </div>
                  <p className="text-sm text-gray-600">Next Quarter</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    87.5%
                  </div>
                  <p className="text-sm text-gray-600">Confidence Level</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    +8.5%
                  </div>
                  <p className="text-sm text-gray-600">Growth Projection</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">
                        Scenario Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          {
                            scenario: "Optimistic",
                            revenue: 3750000,
                            probability: 25,
                            color: "text-green-600",
                          },
                          {
                            scenario: "Realistic",
                            revenue: 3125000,
                            probability: 55,
                            color: "text-blue-600",
                          },
                          {
                            scenario: "Pessimistic",
                            revenue: 2500000,
                            probability: 20,
                            color: "text-red-600",
                          },
                        ].map((scenario, index) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">
                                {scenario.scenario}
                              </span>
                              <Badge variant="outline">
                                {scenario.probability}% probability
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-lg font-bold ${scenario.color}`}
                              >
                                {formatCurrency(scenario.revenue)}
                              </span>
                              <Progress
                                value={scenario.probability}
                                className="w-20 h-2"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Risk Factors</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          {
                            factor: "Payer Contract Renegotiation",
                            impact: "Medium",
                            probability: 30,
                          },
                          {
                            factor: "Regulatory Changes",
                            impact: "High",
                            probability: 20,
                          },
                          {
                            factor: "Economic Downturn",
                            impact: "Medium",
                            probability: 25,
                          },
                          {
                            factor: "Competition Increase",
                            impact: "Low",
                            probability: 35,
                          },
                        ].map((risk, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded"
                          >
                            <div>
                              <p className="text-sm font-medium">
                                {risk.factor}
                              </p>
                              <p className="text-xs text-gray-600">
                                {risk.probability}% probability
                              </p>
                            </div>
                            <Badge
                              variant={
                                risk.impact === "High"
                                  ? "destructive"
                                  : risk.impact === "Medium"
                                    ? "default"
                                    : "secondary"
                              }
                            >
                              {risk.impact}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Alert>
                  <TrendingUp className="h-4 w-4" />
                  <AlertDescription>
                    Advanced forecasting model (ARIMA + LSTM Hybrid) achieving
                    92.1% accuracy with 87.5% confidence level
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">
                      Next Month
                    </div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(1041667)}
                    </div>
                    <p className="text-sm text-gray-600">+2.1% from current</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">
                      Next Quarter
                    </div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(3125000)}
                    </div>
                    <p className="text-sm text-gray-600">+8.5% growth</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-lg font-bold text-purple-600">
                      Annual Forecast
                    </div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(12500000)}
                    </div>
                    <p className="text-sm text-gray-600">+12.3% growth</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Performance Metrics</CardTitle>
                <CardDescription>
                  Comprehensive revenue and profitability analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-xl font-bold text-blue-600">
                        {formatCurrency(financialMetrics?.totalRevenue || 0)}
                      </div>
                      <p className="text-xs text-gray-600">Total Revenue</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-xl font-bold text-green-600">
                        {((financialMetrics?.grossMargin || 0) * 100).toFixed(
                          1,
                        )}
                        %
                      </div>
                      <p className="text-xs text-gray-600">Gross Margin</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Revenue Growth Rate</span>
                        <span className="font-semibold text-green-600">
                          +
                          {(
                            (financialMetrics?.revenueGrowthRate || 0) * 100
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                      <Progress
                        value={(financialMetrics?.revenueGrowthRate || 0) * 100}
                        className="h-2"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Collection Efficiency</span>
                        <span className="font-semibold text-blue-600">
                          {(
                            (financialMetrics?.collectionRate || 0) * 100
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                      <Progress
                        value={(financialMetrics?.collectionRate || 0) * 100}
                        className="h-2"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Denial Rate (Lower is Better)</span>
                        <span className="font-semibold text-purple-600">
                          {((financialMetrics?.denialRate || 0) * 100).toFixed(
                            1,
                          )}
                          %
                        </span>
                      </div>
                      <Progress
                        value={100 - (financialMetrics?.denialRate || 0) * 100}
                        className="h-2"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Predictive Insights & Recommendations</CardTitle>
                <CardDescription>
                  AI-powered recommendations for revenue optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <TrendingUp className="h-4 w-4" />
                    <AlertDescription>
                      Projected 15.2% revenue increase with full AI automation
                      implementation
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">
                      Top Recommendations:
                    </h4>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">
                          Implement predictive denial management
                        </span>
                        <Badge className="ml-auto bg-green-100 text-green-800">
                          +AED 459K
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">
                          Expand automated prior authorization
                        </span>
                        <Badge className="ml-auto bg-blue-100 text-blue-800">
                          +18% efficiency
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 p-2 bg-purple-50 rounded">
                        <CheckCircle className="h-4 w-4 text-purple-600" />
                        <span className="text-sm">
                          Optimize high-margin service lines
                        </span>
                        <Badge className="ml-auto bg-purple-100 text-purple-800">
                          +8% margin
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 p-2 bg-orange-50 rounded">
                        <CheckCircle className="h-4 w-4 text-orange-600" />
                        <span className="text-sm">
                          Enhance contract negotiation strategy
                        </span>
                        <Badge className="ml-auto bg-orange-100 text-orange-800">
                          +AED 661K
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-semibold text-sm mb-2">
                      Risk Mitigation:
                    </h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>• Monitor payer contract renewal dates</p>
                      <p>• Implement real-time leakage detection</p>
                      <p>• Enhance documentation quality controls</p>
                    </div>
                  </div>
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
