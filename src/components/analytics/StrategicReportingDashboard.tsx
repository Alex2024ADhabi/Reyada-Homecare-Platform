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
  DollarSign,
  Users,
  Activity,
  Target,
  FileText,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
} from "lucide-react";
import { useToastContext } from "@/components/ui/toast-provider";

interface ExecutiveSummary {
  period: string;
  totalRevenue: number;
  revenueGrowth: number;
  totalPatients: number;
  patientGrowth: number;
  operationalEfficiency: number;
  qualityScore: number;
  keyAchievements: string[];
  criticalIssues: string[];
  strategicInitiatives: {
    name: string;
    status: "on-track" | "at-risk" | "delayed" | "completed";
    progress: number;
    impact: string;
  }[];
}

interface FinancialForecast {
  period: string;
  revenue: {
    current: number;
    projected: number;
    growth: number;
    confidence: number;
  };
  expenses: {
    current: number;
    projected: number;
    change: number;
  };
  profitability: {
    current: number;
    projected: number;
    margin: number;
  };
  cashFlow: {
    operating: number;
    investing: number;
    financing: number;
    net: number;
  };
  scenarios: {
    optimistic: number;
    realistic: number;
    pessimistic: number;
  };
}

interface OperationalMetrics {
  category: string;
  metrics: {
    name: string;
    current: number;
    target: number;
    trend: "improving" | "declining" | "stable";
    unit: string;
    benchmark: number;
  }[];
  efficiency: {
    score: number;
    factors: string[];
    improvements: {
      action: string;
      impact: number;
      timeline: string;
    }[];
  };
}

interface QualityImprovement {
  domain: string;
  currentScore: number;
  targetScore: number;
  improvement: number;
  initiatives: {
    name: string;
    status: "planning" | "in-progress" | "completed" | "on-hold";
    impact: number;
    timeline: string;
    resources: string[];
  }[];
  metrics: {
    name: string;
    baseline: number;
    current: number;
    target: number;
    trend: "up" | "down" | "stable";
  }[];
}

const StrategicReportingDashboard: React.FC = () => {
  const { toast } = useToastContext();
  const [activeTab, setActiveTab] = useState("executive-summary");
  const [selectedPeriod, setSelectedPeriod] = useState("current-quarter");
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Mock data - in real implementation, this would come from analytics service
  const [executiveSummary, setExecutiveSummary] = useState<ExecutiveSummary>({
    period: "Q4 2024",
    totalRevenue: 12450000,
    revenueGrowth: 18.5,
    totalPatients: 3247,
    patientGrowth: 12.3,
    operationalEfficiency: 87.2,
    qualityScore: 94.1,
    keyAchievements: [
      "Exceeded quarterly revenue target by 15%",
      "Achieved 98% patient satisfaction rating",
      "Reduced average response time by 23%",
      "Implemented AI-powered care optimization",
    ],
    criticalIssues: [
      "Staff shortage in physiotherapy department",
      "Delayed implementation of new EHR system",
      "Compliance documentation backlog",
    ],
    strategicInitiatives: [
      {
        name: "Digital Transformation Program",
        status: "on-track",
        progress: 78,
        impact: "Expected 25% efficiency improvement",
      },
      {
        name: "Quality Excellence Initiative",
        status: "completed",
        progress: 100,
        impact: "Achieved 94.1% quality score",
      },
      {
        name: "Market Expansion Strategy",
        status: "at-risk",
        progress: 45,
        impact: "Potential 30% patient volume increase",
      },
    ],
  });

  const [financialForecast, setFinancialForecast] = useState<FinancialForecast>(
    {
      period: "Next 12 Months",
      revenue: {
        current: 12450000,
        projected: 15680000,
        growth: 25.9,
        confidence: 87,
      },
      expenses: {
        current: 9340000,
        projected: 11250000,
        change: 20.4,
      },
      profitability: {
        current: 3110000,
        projected: 4430000,
        margin: 28.3,
      },
      cashFlow: {
        operating: 3850000,
        investing: -1200000,
        financing: -500000,
        net: 2150000,
      },
      scenarios: {
        optimistic: 17200000,
        realistic: 15680000,
        pessimistic: 14100000,
      },
    },
  );

  const [operationalMetrics, setOperationalMetrics] = useState<
    OperationalMetrics[]
  >([
    {
      category: "Patient Care",
      metrics: [
        {
          name: "Average Response Time",
          current: 2.3,
          target: 2.0,
          trend: "improving",
          unit: "hours",
          benchmark: 2.8,
        },
        {
          name: "Patient Satisfaction",
          current: 94.2,
          target: 95.0,
          trend: "stable",
          unit: "%",
          benchmark: 87.5,
        },
        {
          name: "Care Plan Adherence",
          current: 91.7,
          target: 95.0,
          trend: "improving",
          unit: "%",
          benchmark: 89.2,
        },
      ],
      efficiency: {
        score: 87.2,
        factors: [
          "Optimized scheduling",
          "Staff training",
          "Technology adoption",
        ],
        improvements: [
          {
            action: "Implement AI-powered scheduling",
            impact: 12,
            timeline: "3 months",
          },
          {
            action: "Enhanced mobile app features",
            impact: 8,
            timeline: "2 months",
          },
        ],
      },
    },
    {
      category: "Financial Performance",
      metrics: [
        {
          name: "Revenue per Patient",
          current: 3834,
          target: 4000,
          trend: "improving",
          unit: "AED",
          benchmark: 3650,
        },
        {
          name: "Cost per Visit",
          current: 287,
          target: 275,
          trend: "declining",
          unit: "AED",
          benchmark: 310,
        },
        {
          name: "Collection Rate",
          current: 96.8,
          target: 98.0,
          trend: "stable",
          unit: "%",
          benchmark: 94.2,
        },
      ],
      efficiency: {
        score: 82.4,
        factors: [
          "Automated billing",
          "Insurance optimization",
          "Cost control",
        ],
        improvements: [
          {
            action: "Optimize insurance claim processing",
            impact: 15,
            timeline: "4 months",
          },
        ],
      },
    },
  ]);

  const [qualityImprovements, setQualityImprovements] = useState<
    QualityImprovement[]
  >([
    {
      domain: "Clinical Excellence",
      currentScore: 91.3,
      targetScore: 95.0,
      improvement: 3.7,
      initiatives: [
        {
          name: "Evidence-Based Care Protocols",
          status: "in-progress",
          impact: 2.1,
          timeline: "6 months",
          resources: [
            "Clinical team",
            "Training budget",
            "Technology platform",
          ],
        },
        {
          name: "Continuous Quality Monitoring",
          status: "completed",
          impact: 1.6,
          timeline: "Completed",
          resources: ["Quality team", "Analytics platform"],
        },
      ],
      metrics: [
        {
          name: "Clinical Outcomes",
          baseline: 87.5,
          current: 91.3,
          target: 95.0,
          trend: "up",
        },
        {
          name: "Patient Safety Incidents",
          baseline: 2.3,
          current: 1.1,
          target: 0.5,
          trend: "down",
        },
      ],
    },
    {
      domain: "Patient Experience",
      currentScore: 94.2,
      targetScore: 96.0,
      improvement: 1.8,
      initiatives: [
        {
          name: "Patient Communication Enhancement",
          status: "planning",
          impact: 1.2,
          timeline: "4 months",
          resources: ["Communication team", "Technology upgrade"],
        },
        {
          name: "Family Engagement Program",
          status: "in-progress",
          impact: 0.6,
          timeline: "3 months",
          resources: ["Social services", "Training materials"],
        },
      ],
      metrics: [
        {
          name: "Patient Satisfaction",
          baseline: 89.7,
          current: 94.2,
          target: 96.0,
          trend: "up",
        },
        {
          name: "Family Satisfaction",
          baseline: 91.2,
          current: 93.8,
          target: 95.5,
          trend: "up",
        },
      ],
    },
  ]);

  useEffect(() => {
    // Auto-refresh data every 10 minutes
    const interval = setInterval(() => {
      refreshReports();
    }, 600000);

    return () => clearInterval(interval);
  }, []);

  const refreshReports = async () => {
    setIsLoading(true);
    try {
      // Simulate API call to analytics service
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update data with slight variations
      setExecutiveSummary((prev) => ({
        ...prev,
        totalRevenue:
          prev.totalRevenue + (Math.random() - 0.5) * prev.totalRevenue * 0.02,
        revenueGrowth: prev.revenueGrowth + (Math.random() - 0.5) * 2,
        operationalEfficiency: Math.max(
          70,
          Math.min(100, prev.operationalEfficiency + (Math.random() - 0.5) * 3),
        ),
      }));

      setLastUpdated(new Date());

      toast({
        title: "Reports Updated",
        description: "Latest strategic reports have been generated",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to refresh strategic reports",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = async (reportType: string) => {
    toast({
      title: "Export Started",
      description: `Generating ${reportType} report...`,
      variant: "default",
    });

    // Simulate export process
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: `${reportType} report has been downloaded`,
        variant: "success",
      });
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "on-track":
        return "bg-blue-100 text-blue-800";
      case "at-risk":
        return "bg-yellow-100 text-yellow-800";
      case "delayed":
        return "bg-red-100 text-red-800";
      case "in-progress":
        return "bg-purple-100 text-purple-800";
      case "planning":
        return "bg-gray-100 text-gray-800";
      case "on-hold":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "declining":
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="w-full bg-background p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Strategic Reporting Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Executive insights, financial forecasting, and operational analytics
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-quarter">Current Quarter</SelectItem>
              <SelectItem value="last-quarter">Last Quarter</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
              <SelectItem value="last-year">Last Year</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={refreshReports} disabled={isLoading}>
            {isLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      <div className="text-sm text-gray-500 mb-6">
        Last updated: {lastUpdated.toLocaleString()} • Strategic Analytics
        Engine
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="executive-summary">
            <FileText className="h-4 w-4 mr-2" />
            Executive Summary
          </TabsTrigger>
          <TabsTrigger value="financial-forecast">
            <DollarSign className="h-4 w-4 mr-2" />
            Financial Forecast
          </TabsTrigger>
          <TabsTrigger value="operational-analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Operational Analytics
          </TabsTrigger>
          <TabsTrigger value="quality-tracking">
            <Target className="h-4 w-4 mr-2" />
            Quality Tracking
          </TabsTrigger>
        </TabsList>

        {/* Executive Summary Tab */}
        <TabsContent value="executive-summary" className="mt-6">
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(executiveSummary.totalRevenue)}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">
                      +{executiveSummary.revenueGrowth.toFixed(1)}%
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Patients
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {executiveSummary.totalPatients.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">
                      +{executiveSummary.patientGrowth.toFixed(1)}%
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Operational Efficiency
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {executiveSummary.operationalEfficiency.toFixed(1)}%
                  </div>
                  <Progress
                    value={executiveSummary.operationalEfficiency}
                    className="mt-2"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Quality Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {executiveSummary.qualityScore.toFixed(1)}%
                  </div>
                  <Progress
                    value={executiveSummary.qualityScore}
                    className="mt-2"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Strategic Initiatives */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Strategic Initiatives</CardTitle>
                  <Button
                    size="sm"
                    onClick={() => exportReport("Strategic Initiatives")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
                <CardDescription>
                  Progress on key strategic initiatives
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {executiveSummary.strategicInitiatives.map(
                    (initiative, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{initiative.name}</h4>
                          <Badge className={getStatusColor(initiative.status)}>
                            {initiative.status.replace("-", " ").toUpperCase()}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progress</span>
                            <span>{initiative.progress}%</span>
                          </div>
                          <Progress value={initiative.progress} />
                          <p className="text-sm text-gray-600">
                            {initiative.impact}
                          </p>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Key Achievements and Issues */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Key Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {executiveSummary.keyAchievements.map(
                      (achievement, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-sm">{achievement}</span>
                        </li>
                      ),
                    )}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    Critical Issues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {executiveSummary.criticalIssues.map((issue, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm">{issue}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Financial Forecast Tab */}
        <TabsContent value="financial-forecast" className="mt-6">
          <div className="space-y-6">
            {/* Revenue Forecast */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Revenue Forecast</CardTitle>
                  <Button
                    size="sm"
                    onClick={() => exportReport("Financial Forecast")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
                <CardDescription>{financialForecast.period}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Current Revenue</div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(financialForecast.revenue.current)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500">
                      Projected Revenue
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(financialForecast.revenue.projected)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Growth Rate</div>
                    <div className="text-2xl font-bold text-blue-600">
                      +{financialForecast.revenue.growth.toFixed(1)}%
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Forecast Confidence</span>
                    <span>{financialForecast.revenue.confidence}%</span>
                  </div>
                  <Progress value={financialForecast.revenue.confidence} />
                </div>
              </CardContent>
            </Card>

            {/* Scenario Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Scenario Analysis</CardTitle>
                <CardDescription>
                  Revenue projections under different scenarios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-sm text-green-700 font-medium">
                      Optimistic
                    </div>
                    <div className="text-xl font-bold text-green-800">
                      {formatCurrency(financialForecast.scenarios.optimistic)}
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      +
                      {(
                        ((financialForecast.scenarios.optimistic -
                          financialForecast.revenue.current) /
                          financialForecast.revenue.current) *
                        100
                      ).toFixed(1)}
                      %
                    </div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-700 font-medium">
                      Realistic
                    </div>
                    <div className="text-xl font-bold text-blue-800">
                      {formatCurrency(financialForecast.scenarios.realistic)}
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      +
                      {(
                        ((financialForecast.scenarios.realistic -
                          financialForecast.revenue.current) /
                          financialForecast.revenue.current) *
                        100
                      ).toFixed(1)}
                      %
                    </div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-sm text-orange-700 font-medium">
                      Pessimistic
                    </div>
                    <div className="text-xl font-bold text-orange-800">
                      {formatCurrency(financialForecast.scenarios.pessimistic)}
                    </div>
                    <div className="text-xs text-orange-600 mt-1">
                      +
                      {(
                        ((financialForecast.scenarios.pessimistic -
                          financialForecast.revenue.current) /
                          financialForecast.revenue.current) *
                        100
                      ).toFixed(1)}
                      %
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cash Flow Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Cash Flow Analysis</CardTitle>
                <CardDescription>Projected cash flow breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Operating</div>
                    <div className="text-lg font-bold text-green-600">
                      {formatCurrency(financialForecast.cashFlow.operating)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Investing</div>
                    <div className="text-lg font-bold text-red-600">
                      {formatCurrency(financialForecast.cashFlow.investing)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Financing</div>
                    <div className="text-lg font-bold text-red-600">
                      {formatCurrency(financialForecast.cashFlow.financing)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Net Cash Flow</div>
                    <div className="text-lg font-bold text-blue-600">
                      {formatCurrency(financialForecast.cashFlow.net)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Operational Analytics Tab */}
        <TabsContent value="operational-analytics" className="mt-6">
          <div className="space-y-6">
            {operationalMetrics.map((category, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{category.category}</CardTitle>
                    <Button
                      size="sm"
                      onClick={() => exportReport(category.category)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                  <CardDescription>
                    Efficiency Score: {category.efficiency.score.toFixed(1)}%
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {category.metrics.map((metric, idx) => (
                        <div key={idx} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">
                              {metric.name}
                            </span>
                            {getTrendIcon(metric.trend)}
                          </div>
                          <div className="text-2xl font-bold">
                            {metric.current.toLocaleString()}
                            {metric.unit && (
                              <span className="text-sm text-gray-500 ml-1">
                                {metric.unit}
                              </span>
                            )}
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-2">
                            <span>
                              Target: {metric.target.toLocaleString()}
                              {metric.unit}
                            </span>
                            <span>
                              Benchmark: {metric.benchmark.toLocaleString()}
                              {metric.unit}
                            </span>
                          </div>
                          <Progress
                            value={(metric.current / metric.target) * 100}
                            className="mt-2 h-1"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Improvement Opportunities */}
                    <div>
                      <h4 className="font-medium mb-3">
                        Improvement Opportunities
                      </h4>
                      <div className="space-y-2">
                        {category.efficiency.improvements.map(
                          (improvement, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                            >
                              <div>
                                <span className="font-medium">
                                  {improvement.action}
                                </span>
                                <div className="text-sm text-gray-600">
                                  Timeline: {improvement.timeline}
                                </div>
                              </div>
                              <Badge variant="secondary">
                                +{improvement.impact}% impact
                              </Badge>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Quality Tracking Tab */}
        <TabsContent value="quality-tracking" className="mt-6">
          <div className="space-y-6">
            {qualityImprovements.map((domain, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{domain.domain}</CardTitle>
                    <Button
                      size="sm"
                      onClick={() => exportReport(domain.domain)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                  <CardDescription>
                    Target improvement: +{domain.improvement.toFixed(1)} points
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Score Progress */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-sm text-gray-500">
                          Current Score
                        </div>
                        <div className="text-2xl font-bold">
                          {domain.currentScore.toFixed(1)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-500">
                          Target Score
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {domain.targetScore.toFixed(1)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-500">Gap</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {(domain.targetScore - domain.currentScore).toFixed(
                            1,
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quality Initiatives */}
                    <div>
                      <h4 className="font-medium mb-3">Quality Initiatives</h4>
                      <div className="space-y-3">
                        {domain.initiatives.map((initiative, idx) => (
                          <div key={idx} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-medium">{initiative.name}</h5>
                              <Badge
                                className={getStatusColor(initiative.status)}
                              >
                                {initiative.status
                                  .replace("-", " ")
                                  .toUpperCase()}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Impact:</span>
                                <span className="ml-2 font-medium">
                                  +{initiative.impact.toFixed(1)} points
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">Timeline:</span>
                                <span className="ml-2">
                                  {initiative.timeline}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">
                                  Resources:
                                </span>
                                <span className="ml-2">
                                  {initiative.resources.join(", ")}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quality Metrics */}
                    <div>
                      <h4 className="font-medium mb-3">Quality Metrics</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {domain.metrics.map((metric, idx) => (
                          <div key={idx} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{metric.name}</span>
                              {getTrendIcon(metric.trend)}
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>
                                  Baseline: {metric.baseline.toFixed(1)}
                                </span>
                                <span>
                                  Current: {metric.current.toFixed(1)}
                                </span>
                                <span>Target: {metric.target.toFixed(1)}</span>
                              </div>
                              <Progress
                                value={(metric.current / metric.target) * 100}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
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

export default StrategicReportingDashboard;
