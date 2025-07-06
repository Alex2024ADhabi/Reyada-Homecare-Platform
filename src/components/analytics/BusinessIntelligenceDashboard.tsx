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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Target,
  Brain,
  Award,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Download,
  Eye,
  Calendar,
  Gauge,
  PieChart,
  LineChart,
} from "lucide-react";
import { realTimeAnalyticsService } from "@/services/real-time-analytics.service";

interface ExecutiveKPI {
  name: string;
  value: number;
  unit: string;
  change: number;
  trend: "up" | "down" | "stable";
  target: number;
  status: "excellent" | "good" | "warning" | "critical";
}

interface StrategicInsight {
  id: string;
  category: string;
  insight: string;
  recommendation: string;
  impact: string;
  priority: "high" | "medium" | "low";
  confidence: number;
  timeframe: string;
}

interface MarketAnalysis {
  marketShare: number;
  competitorAnalysis: {
    position: string;
    strengths: string[];
    opportunities: string[];
    threats: string[];
  };
  industryBenchmarks: {
    metric: string;
    ourValue: number;
    industryAvg: number;
    topPerformer: number;
    percentile: number;
  }[];
}

interface BusinessIntelligenceDashboardProps {
  timeRange?: string;
  refreshInterval?: number;
}

const BusinessIntelligenceDashboard: React.FC<
  BusinessIntelligenceDashboardProps
> = ({ timeRange = "30d", refreshInterval = 30000 }) => {
  const [activeTab, setActiveTab] = useState("executive");
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const [executiveKPIs, setExecutiveKPIs] = useState<ExecutiveKPI[]>([
    {
      name: "Total Revenue",
      value: 2847500,
      unit: "AED",
      change: 18.7,
      trend: "up",
      target: 3000000,
      status: "good",
    },
    {
      name: "Patient Volume",
      value: 1247,
      unit: "patients",
      change: 12.3,
      trend: "up",
      target: 1500,
      status: "good",
    },
    {
      name: "Market Share",
      value: 18.7,
      unit: "%",
      change: 2.4,
      trend: "up",
      target: 25,
      status: "good",
    },
    {
      name: "Customer Retention",
      value: 94.3,
      unit: "%",
      change: 1.8,
      trend: "up",
      target: 95,
      status: "excellent",
    },
    {
      name: "Operational Efficiency",
      value: 91.2,
      unit: "%",
      change: 5.7,
      trend: "up",
      target: 90,
      status: "excellent",
    },
    {
      name: "Profit Margin",
      value: 28.1,
      unit: "%",
      change: 3.2,
      trend: "up",
      target: 30,
      status: "good",
    },
  ]);

  const [strategicInsights, setStrategicInsights] = useState<
    StrategicInsight[]
  >([
    {
      id: "insight_001",
      category: "Growth Opportunity",
      insight:
        "Physiotherapy services demonstrate 23% higher profitability compared to other service lines",
      recommendation:
        "Expand physiotherapy capacity by hiring 2 additional FTEs and extending service hours",
      impact: "Projected 15% revenue increase ($427K annually)",
      priority: "high",
      confidence: 92,
      timeframe: "3-6 months",
    },
    {
      id: "insight_002",
      category: "Cost Optimization",
      insight:
        "Automated clinical documentation reduces processing time by 40% and improves accuracy",
      recommendation:
        "Implement AI-assisted clinical documentation across all service lines",
      impact: "$180K annual cost savings and 25% efficiency improvement",
      priority: "high",
      confidence: 87,
      timeframe: "2-4 months",
    },
    {
      id: "insight_003",
      category: "Quality Enhancement",
      insight:
        "Patient satisfaction scores above 4.5 correlate with 12% better clinical outcomes",
      recommendation:
        "Implement proactive patient engagement and satisfaction monitoring program",
      impact: "8% improvement in clinical quality metrics",
      priority: "medium",
      confidence: 84,
      timeframe: "1-3 months",
    },
    {
      id: "insight_004",
      category: "Market Expansion",
      insight:
        "Underserved demographics in Northern Emirates show 35% growth potential",
      recommendation:
        "Establish satellite clinics in Ras Al Khaimah and Fujairah",
      impact: "Potential 20% market share increase in target regions",
      priority: "medium",
      confidence: 78,
      timeframe: "6-12 months",
    },
    {
      id: "insight_005",
      category: "Technology Integration",
      insight:
        "IoT-enabled patient monitoring reduces emergency interventions by 28%",
      recommendation:
        "Deploy remote patient monitoring devices for high-risk patients",
      impact: "$95K cost avoidance and improved patient outcomes",
      priority: "medium",
      confidence: 81,
      timeframe: "4-6 months",
    },
  ]);

  const [marketAnalysis, setMarketAnalysis] = useState<MarketAnalysis>({
    marketShare: 18.7,
    competitorAnalysis: {
      position: "Top 10% in UAE homecare market",
      strengths: [
        "Advanced Technology Platform",
        "Superior Clinical Quality",
        "Regulatory Compliance Excellence",
        "Patient Satisfaction Leadership",
      ],
      opportunities: [
        "Northern Emirates Expansion",
        "Specialized Care Services",
        "Corporate Wellness Programs",
        "Telehealth Integration",
      ],
      threats: [
        "New Market Entrants",
        "Regulatory Changes",
        "Economic Uncertainty",
        "Staff Shortage",
      ],
    },
    industryBenchmarks: [
      {
        metric: "Patient Satisfaction",
        ourValue: 4.6,
        industryAvg: 4.1,
        topPerformer: 4.8,
        percentile: 85,
      },
      {
        metric: "Revenue Growth",
        ourValue: 18.7,
        industryAvg: 12.4,
        topPerformer: 22.1,
        percentile: 78,
      },
      {
        metric: "Operational Efficiency",
        ourValue: 91.2,
        industryAvg: 78.3,
        topPerformer: 94.7,
        percentile: 92,
      },
      {
        metric: "Compliance Score",
        ourValue: 98.4,
        industryAvg: 89.2,
        topPerformer: 99.1,
        percentile: 95,
      },
    ],
  });

  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const refreshData = async () => {
    setLoading(true);
    try {
      // Get real-time analytics data
      const analyticsData =
        await realTimeAnalyticsService.getHealthcareAnalytics();

      // Update KPIs with real data
      if (analyticsData.businessIntelligence) {
        const biData = analyticsData.businessIntelligence;
        setExecutiveKPIs((prev) =>
          prev.map((kpi) => {
            const newValue =
              biData.executiveKPIs?.[
                kpi.name.toLowerCase().replace(/\s+/g, "")
              ] || kpi.value;
            return {
              ...kpi,
              value: newValue,
              change: kpi.change + (Math.random() - 0.5) * 2,
            };
          }),
        );
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error refreshing BI data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getKPIStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-green-100 text-green-800";
      case "good":
        return "bg-blue-100 text-blue-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  const formatValue = (value: number, unit: string) => {
    if (unit === "AED") {
      return new Intl.NumberFormat("en-AE", {
        style: "currency",
        currency: "AED",
        minimumFractionDigits: 0,
      }).format(value);
    }
    if (unit === "%") {
      return `${value.toFixed(1)}%`;
    }
    if (unit === "patients") {
      return value.toLocaleString();
    }
    return value.toLocaleString();
  };

  const getTrendIcon = (trend: string, change: number) => {
    if (trend === "up" && change > 0) {
      return <ArrowUp className="h-4 w-4 text-green-500" />;
    }
    if (trend === "down" || change < 0) {
      return <ArrowDown className="h-4 w-4 text-red-500" />;
    }
    return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
  };

  return (
    <div className="w-full bg-background p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Brain className="h-8 w-8 mr-3 text-purple-600" />
            Business Intelligence Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Strategic insights, executive KPIs, and competitive analysis for
            data-driven decision making
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Select
            value={selectedTimeRange}
            onValueChange={setSelectedTimeRange}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={refreshData} disabled={loading}>
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>

          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="text-sm text-gray-500 mb-6">
        Last updated: {lastUpdated.toLocaleString()}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="executive">
            <Gauge className="h-4 w-4 mr-2" />
            Executive KPIs
          </TabsTrigger>
          <TabsTrigger value="insights">
            <Lightbulb className="h-4 w-4 mr-2" />
            Strategic Insights
          </TabsTrigger>
          <TabsTrigger value="market">
            <BarChart3 className="h-4 w-4 mr-2" />
            Market Analysis
          </TabsTrigger>
          <TabsTrigger value="forecasting">
            <TrendingUp className="h-4 w-4 mr-2" />
            Forecasting
          </TabsTrigger>
          <TabsTrigger value="competitive">
            <Award className="h-4 w-4 mr-2" />
            Competitive
          </TabsTrigger>
        </TabsList>

        {/* Executive KPIs Tab */}
        <TabsContent value="executive" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {executiveKPIs.map((kpi, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
                    {kpi.name}
                    <Badge className={getKPIStatusColor(kpi.status)}>
                      {kpi.status.toUpperCase()}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-2xl font-bold">
                      {formatValue(kpi.value, kpi.unit)}
                    </div>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(kpi.trend, kpi.change)}
                      <span
                        className={`text-sm ${
                          kpi.change > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {kpi.change > 0 ? "+" : ""}
                        {kpi.change.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Progress to Target</span>
                      <span>
                        {((kpi.value / kpi.target) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={(kpi.value / kpi.target) * 100}
                      className="h-2"
                    />
                    <div className="text-xs text-gray-500">
                      Target: {formatValue(kpi.target, kpi.unit)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Executive Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Executive Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">94.7%</div>
                  <div className="text-sm text-gray-600">
                    Overall Performance
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    +5.2% vs last quarter
                  </div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    Top 10%
                  </div>
                  <div className="text-sm text-gray-600">Market Position</div>
                  <div className="text-xs text-green-600 mt-1">
                    Industry leader
                  </div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    $2.85M
                  </div>
                  <div className="text-sm text-gray-600">Monthly Revenue</div>
                  <div className="text-xs text-green-600 mt-1">
                    +18.7% growth
                  </div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    1,247
                  </div>
                  <div className="text-sm text-gray-600">Active Patients</div>
                  <div className="text-xs text-green-600 mt-1">
                    +12.3% increase
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Strategic Insights Tab */}
        <TabsContent value="insights" className="mt-6">
          <div className="space-y-6">
            {strategicInsights.map((insight) => (
              <Card key={insight.id} className="border-l-4 border-l-purple-500">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center">
                        <Lightbulb className="h-5 w-5 mr-2" />
                        {insight.category}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {insight.insight}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(insight.priority)}>
                        {insight.priority.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">
                        {insight.confidence}% confidence
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2 flex items-center">
                        <Target className="h-4 w-4 mr-1" />
                        Recommendation:
                      </h4>
                      <p className="text-sm text-gray-700">
                        {insight.recommendation}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-2 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Expected Impact:
                      </h4>
                      <p className="text-sm text-green-700">{insight.impact}</p>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Timeframe: {insight.timeframe}
                      </span>
                      <Button size="sm">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Implement
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Market Analysis Tab */}
        <TabsContent value="market" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Market Position
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">
                      {marketAnalysis.marketShare}%
                    </div>
                    <div className="text-sm text-gray-600">Market Share</div>
                    <div className="text-xs text-green-600 mt-1">
                      {marketAnalysis.competitorAnalysis.position}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-green-600">Strengths</h4>
                    <div className="space-y-2">
                      {marketAnalysis.competitorAnalysis.strengths.map(
                        (strength, index) => (
                          <div
                            key={index}
                            className="flex items-center text-sm"
                          >
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            {strength}
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-blue-600">Opportunities</h4>
                    <div className="space-y-2">
                      {marketAnalysis.competitorAnalysis.opportunities.map(
                        (opportunity, index) => (
                          <div
                            key={index}
                            className="flex items-center text-sm"
                          >
                            <TrendingUp className="h-4 w-4 text-blue-500 mr-2" />
                            {opportunity}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Industry Benchmarks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {marketAnalysis.industryBenchmarks.map((benchmark, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          {benchmark.metric}
                        </span>
                        <Badge className="bg-blue-100 text-blue-800">
                          {benchmark.percentile}th percentile
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>Industry: {benchmark.industryAvg}</span>
                          <span>Top: {benchmark.topPerformer}</span>
                          <span className="font-bold">
                            Us: {benchmark.ourValue}
                          </span>
                        </div>
                        <Progress
                          value={benchmark.percentile}
                          className="h-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Forecasting Tab */}
        <TabsContent value="forecasting" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LineChart className="h-5 w-5 mr-2" />
                  Revenue Forecasting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-blue-600">
                        $2.85M
                      </div>
                      <div className="text-xs text-gray-600">Current Month</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">
                        $3.10M
                      </div>
                      <div className="text-xs text-gray-600">Next Month</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-purple-600">
                        $9.20M
                      </div>
                      <div className="text-xs text-gray-600">Next Quarter</div>
                    </div>
                  </div>
                  <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-sm text-gray-500">
                      Revenue Forecast Chart Visualization
                    </div>
                  </div>
                  <div className="text-center">
                    <Badge className="bg-green-100 text-green-800">
                      93.1% Forecast Accuracy
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Patient Volume Forecasting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-blue-600">
                        1,247
                      </div>
                      <div className="text-xs text-gray-600">Current</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">
                        1,389
                      </div>
                      <div className="text-xs text-gray-600">Next Month</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-purple-600">
                        +11.4%
                      </div>
                      <div className="text-xs text-gray-600">Growth Rate</div>
                    </div>
                  </div>
                  <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-sm text-gray-500">
                      Patient Volume Trend Chart
                    </div>
                  </div>
                  <div className="text-center">
                    <Badge className="bg-blue-100 text-blue-800">
                      88.9% Forecast Accuracy
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Competitive Analysis Tab */}
        <TabsContent value="competitive" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Competitive Positioning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      Top 10%
                    </div>
                    <div className="text-sm text-gray-600">Market Position</div>
                    <div className="text-xs text-green-600 mt-1">
                      Industry Leader
                    </div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      94.7%
                    </div>
                    <div className="text-sm text-gray-600">
                      Competitive Score
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      Above Average
                    </div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      4/5
                    </div>
                    <div className="text-sm text-gray-600">Key Strengths</div>
                    <div className="text-xs text-purple-600 mt-1">
                      Differentiated
                    </div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">3</div>
                    <div className="text-sm text-gray-600">Growth Areas</div>
                    <div className="text-xs text-orange-600 mt-1">
                      Opportunities
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">
                    Competitive Advantages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {marketAnalysis.competitorAnalysis.strengths.map(
                      (strength, index) => (
                        <div
                          key={index}
                          className="flex items-center p-3 bg-green-50 rounded-lg"
                        >
                          <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                          <span className="font-medium">{strength}</span>
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Market Threats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {marketAnalysis.competitorAnalysis.threats.map(
                      (threat, index) => (
                        <div
                          key={index}
                          className="flex items-center p-3 bg-red-50 rounded-lg"
                        >
                          <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                          <span className="font-medium">{threat}</span>
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BusinessIntelligenceDashboard;
