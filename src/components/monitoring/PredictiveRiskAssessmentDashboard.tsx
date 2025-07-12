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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertTriangle,
  Activity,
  Heart,
  Shield,
  TrendingUp,
  Users,
  Brain,
  Pill,
  Thermometer,
  UserCheck,
  Clock,
  Target,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  LineChart,
  PieChart,
  Zap,
} from "lucide-react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
} from "recharts";

interface PredictiveRiskAssessmentDashboardProps {
  className?: string;
}

const PredictiveRiskAssessmentDashboard: React.FC<
  PredictiveRiskAssessmentDashboardProps
> = ({ className = "" }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for demonstration
  const mockServiceStats = {
    totalPatients: 247,
    totalAssessments: 1,
    riskLevelDistribution: {
      low: 89,
      moderate: 102,
      high: 41,
      critical: 15,
    },
    highRiskPatients: 56,
    averageConfidence: 87,
    modelsLoaded: 3,
    lastBatchAssessment: new Date().toISOString(),
  };

  const mockHighRiskPatients = [
    {
      patientId: "PAT-001",
      overallRiskScore: 78.5,
      riskLevel: "high" as const,
      interventionPriority: "urgent" as const,
      specificRisks: {
        fallRisk: { score: 85.2, level: "critical" as const },
        medicationRisk: { score: 72.1, level: "high" as const },
        clinicalDeteriorationRisk: { score: 68.9, level: "moderate" as const },
        infectionRisk: { score: 45.3, level: "moderate" as const },
        psychosocialRisk: { score: 82.7, level: "high" as const },
      },
      predictedOutcomes: {
        hospitalizationRisk: 65,
        emergencyVisitRisk: 42,
        functionalDeclineRisk: 58,
        mortalityRisk: 12,
      },
      confidence: 89,
      assessmentDate: new Date().toISOString(),
    },
    {
      patientId: "PAT-002",
      overallRiskScore: 92.3,
      riskLevel: "critical" as const,
      interventionPriority: "immediate" as const,
      specificRisks: {
        fallRisk: { score: 91.8, level: "critical" as const },
        medicationRisk: { score: 88.4, level: "critical" as const },
        clinicalDeteriorationRisk: { score: 95.2, level: "critical" as const },
        infectionRisk: { score: 67.1, level: "high" as const },
        psychosocialRisk: { score: 73.6, level: "high" as const },
      },
      predictedOutcomes: {
        hospitalizationRisk: 87,
        emergencyVisitRisk: 74,
        functionalDeclineRisk: 82,
        mortalityRisk: 28,
      },
      confidence: 94,
      assessmentDate: new Date().toISOString(),
    },
    {
      patientId: "PAT-003",
      overallRiskScore: 71.2,
      riskLevel: "high" as const,
      interventionPriority: "urgent" as const,
      specificRisks: {
        fallRisk: { score: 62.4, level: "moderate" as const },
        medicationRisk: { score: 79.8, level: "high" as const },
        clinicalDeteriorationRisk: { score: 74.5, level: "high" as const },
        infectionRisk: { score: 58.9, level: "moderate" as const },
        psychosocialRisk: { score: 68.2, level: "moderate" as const },
      },
      predictedOutcomes: {
        hospitalizationRisk: 52,
        emergencyVisitRisk: 38,
        functionalDeclineRisk: 47,
        mortalityRisk: 8,
      },
      confidence: 85,
      assessmentDate: new Date().toISOString(),
    },
  ];

  const mockTrendData = [
    { month: "Jan", assessments: 198, highRisk: 42, critical: 8 },
    { month: "Feb", assessments: 215, highRisk: 48, critical: 12 },
    { month: "Mar", assessments: 232, highRisk: 52, critical: 15 },
    { month: "Apr", assessments: 247, highRisk: 56, critical: 18 },
  ];

  const mockModelPerformance = [
    { model: "Fall Risk", accuracy: 87, predictions: 1247 },
    { model: "Medication Risk", accuracy: 82, predictions: 1189 },
    { model: "Clinical Deterioration", accuracy: 91, predictions: 1356 },
  ];

  const riskLevelColors = {
    low: "#10B981",
    moderate: "#F59E0B",
    high: "#EF4444",
    critical: "#DC2626",
  };

  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "moderate":
        return "secondary";
      default:
        return "default";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "immediate":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "urgent":
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case "routine":
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
  };

  const getRiskIcon = (riskType: string) => {
    switch (riskType) {
      case "fallRisk":
        return <Activity className="h-4 w-4" />;
      case "medicationRisk":
        return <Pill className="h-4 w-4" />;
      case "clinicalDeteriorationRisk":
        return <Heart className="h-4 w-4" />;
      case "infectionRisk":
        return <Shield className="h-4 w-4" />;
      case "psychosocialRisk":
        return <Brain className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const formatRiskType = (riskType: string) => {
    const formatted = riskType
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
    return formatted.replace(" Risk", "");
  };

  return (
    <div className={`space-y-6 bg-white ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Brain className="h-8 w-8 text-blue-600" />
              Predictive Risk Assessment Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              AI-powered patient risk prediction and intervention planning
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="px-3 py-1">
              <Zap className="h-4 w-4 mr-2" />
              Real-time Analysis
            </Badge>
            <Button
              onClick={() => setIsLoading(true)}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "Processing..." : "Run Assessment"}
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Patients
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {mockServiceStats.totalPatients}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">
                {mockServiceStats.totalAssessments} assessments completed
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  High Risk Patients
                </p>
                <p className="text-3xl font-bold text-red-600">
                  {mockServiceStats.highRiskPatients}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">
                {Math.round(
                  (mockServiceStats.highRiskPatients /
                    mockServiceStats.totalPatients) *
                    100,
                )}
                % of total patients
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Model Confidence
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {mockServiceStats.averageConfidence}%
                </p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-4">
              <Progress
                value={mockServiceStats.averageConfidence}
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Models
                </p>
                <p className="text-3xl font-bold text-purple-600">
                  {mockServiceStats.modelsLoaded}
                </p>
              </div>
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="high-risk">High Risk Patients</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="models">Model Performance</TabsTrigger>
          <TabsTrigger value="interventions">Interventions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Risk Level Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(mockServiceStats.riskLevelDistribution).map(
                    ([level, count]) => (
                      <div
                        key={level}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{
                              backgroundColor:
                                riskLevelColors[
                                  level as keyof typeof riskLevelColors
                                ],
                            }}
                          />
                          <span className="capitalize font-medium">
                            {level}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{count}</span>
                          <span className="text-sm text-gray-500">
                            (
                            {Math.round(
                              (count / mockServiceStats.totalPatients) * 100,
                            )}
                            %)
                          </span>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Trend Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Risk Assessment Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsLineChart data={mockTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="assessments"
                      stroke="#3B82F6"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="highRisk"
                      stroke="#EF4444"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="critical"
                      stroke="#DC2626"
                      strokeWidth={2}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Recent High-Risk Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockHighRiskPatients.slice(0, 3).map((patient) => (
                  <Alert
                    key={patient.patientId}
                    className="border-l-4 border-l-red-500"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold">
                            {patient.patientId}
                          </span>
                          <span className="ml-2">
                            - {patient.riskLevel} risk (
                            {patient.overallRiskScore}%)
                          </span>
                        </div>
                        <Badge
                          variant={getRiskBadgeVariant(
                            patient.interventionPriority,
                          )}
                        >
                          {patient.interventionPriority}
                        </Badge>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="high-risk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                High-Risk Patient Details
              </CardTitle>
              <CardDescription>
                Patients requiring immediate or urgent intervention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {mockHighRiskPatients.map((patient) => (
                    <Card
                      key={patient.patientId}
                      className="border-l-4 border-l-red-500"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-lg">
                              {patient.patientId}
                            </h3>
                            <Badge
                              variant={getRiskBadgeVariant(patient.riskLevel)}
                            >
                              {patient.riskLevel}
                            </Badge>
                            <div className="flex items-center gap-1">
                              {getPriorityIcon(patient.interventionPriority)}
                              <span className="text-sm font-medium capitalize">
                                {patient.interventionPriority}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-red-600">
                              {patient.overallRiskScore}%
                            </p>
                            <p className="text-sm text-gray-500">
                              {patient.confidence}% confidence
                            </p>
                          </div>
                        </div>

                        {/* Specific Risk Breakdown */}
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                          {Object.entries(patient.specificRisks).map(
                            ([riskType, risk]) => (
                              <div key={riskType} className="text-center">
                                <div className="flex items-center justify-center mb-2">
                                  {getRiskIcon(riskType)}
                                </div>
                                <p className="text-xs font-medium text-gray-600 mb-1">
                                  {formatRiskType(riskType)}
                                </p>
                                <p className="text-lg font-bold">
                                  {risk.score}%
                                </p>
                                <Badge
                                  variant={getRiskBadgeVariant(risk.level)}
                                  className="text-xs"
                                >
                                  {risk.level}
                                </Badge>
                              </div>
                            ),
                          )}
                        </div>

                        {/* Predicted Outcomes */}
                        <div className="border-t pt-4">
                          <h4 className="font-medium mb-3">
                            Predicted Outcomes
                          </h4>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">
                                Hospitalization
                              </p>
                              <p className="text-lg font-semibold">
                                {patient.predictedOutcomes.hospitalizationRisk}%
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">
                                Emergency Visit
                              </p>
                              <p className="text-lg font-semibold">
                                {patient.predictedOutcomes.emergencyVisitRisk}%
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">
                                Functional Decline
                              </p>
                              <p className="text-lg font-semibold">
                                {
                                  patient.predictedOutcomes
                                    .functionalDeclineRisk
                                }
                                %
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Mortality</p>
                              <p className="text-lg font-semibold">
                                {patient.predictedOutcomes.mortalityRisk}%
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Risk Assessment Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="assessments" fill="#3B82F6" />
                    <Bar dataKey="highRisk" fill="#EF4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Risk Score Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(mockServiceStats.riskLevelDistribution).map(
                    ([level, count]) => (
                      <div key={level}>
                        <div className="flex justify-between mb-2">
                          <span className="capitalize font-medium">
                            {level}
                          </span>
                          <span>{count} patients</span>
                        </div>
                        <Progress
                          value={(count / mockServiceStats.totalPatients) * 100}
                          className="h-3"
                        />
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="models" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Predictive Model Performance
              </CardTitle>
              <CardDescription>
                Real-time performance metrics for AI prediction models
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockModelPerformance.map((model) => (
                  <div key={model.model} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">
                        {model.model} Model
                      </h3>
                      <Badge variant="outline">
                        {model.accuracy}% Accuracy
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Accuracy</p>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={model.accuracy}
                            className="flex-1 h-2"
                          />
                          <span className="font-semibold">
                            {model.accuracy}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Predictions Made
                        </p>
                        <p className="text-xl font-bold">
                          {model.predictions.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-green-600 font-medium">
                            Active
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interventions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Recommended Interventions
              </CardTitle>
              <CardDescription>
                AI-generated intervention recommendations based on risk
                assessments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockHighRiskPatients.slice(0, 2).map((patient) => (
                  <div
                    key={patient.patientId}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">
                        {patient.patientId}
                      </h3>
                      <div className="flex items-center gap-2">
                        {getPriorityIcon(patient.interventionPriority)}
                        <span className="font-medium capitalize">
                          {patient.interventionPriority} Priority
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="font-medium text-red-600 mb-2">
                          Immediate Actions
                        </h4>
                        <ul className="space-y-1 text-sm">
                          <li>• Emergency fall risk assessment</li>
                          <li>• Urgent medication review</li>
                          <li>• Immediate clinical evaluation</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-orange-600 mb-2">
                          Short-term (1-2 weeks)
                        </h4>
                        <ul className="space-y-1 text-sm">
                          <li>• Physical therapy evaluation</li>
                          <li>• Pharmacist consultation</li>
                          <li>• Specialist referral</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-600 mb-2">
                          Long-term (1-3 months)
                        </h4>
                        <ul className="space-y-1 text-sm">
                          <li>• Ongoing balance training</li>
                          <li>• Quarterly medication reviews</li>
                          <li>• Chronic disease management</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PredictiveRiskAssessmentDashboard;
