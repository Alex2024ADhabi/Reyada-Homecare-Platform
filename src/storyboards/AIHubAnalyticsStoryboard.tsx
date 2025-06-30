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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Activity,
  Brain,
  Cpu,
  Database,
  Heart,
  Shield,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Stethoscope,
  Users,
  Target,
} from "lucide-react";

export default function AIHubAnalyticsStoryboard() {
  const [aiMetrics, setAiMetrics] = useState({
    totalInferences: 25847,
    successfulInferences: 25720,
    averageResponseTime: 67,
    modelAccuracy: 0.96,
    activeModels: 18,
    healthcareModels: 12,
    complianceModels: 6,
    realTimeProcessing: true,
    orchestrationActive: true,
    clinicalWorkflowsOptimized: 8,
    predictiveAlertsGenerated: 156,
  });

  const [performanceMetrics, setPerformanceMetrics] = useState({
    cpu: 67,
    memory: 74,
    gpu: 82,
    storage: 45,
    networkLatency: 23,
    throughput: 1250,
  });

  const [healthcareInsights, setHealthcareInsights] = useState([
    {
      id: "insight_001",
      type: "clinical-decision-support",
      title: "AI-Enhanced Clinical Decision Support Active",
      description:
        "AI orchestration providing real-time clinical recommendations with 96% accuracy",
      confidence: 0.96,
      priority: "high",
      timestamp: new Date(Date.now() - 180000),
      action: "Integrated with clinical workflows",
    },
    {
      id: "insight_002",
      type: "predictive-analytics",
      title: "Predictive Patient Deterioration Alert",
      description:
        "AI detected early warning signs for 3 patients requiring immediate attention",
      confidence: 0.94,
      priority: "critical",
      timestamp: new Date(Date.now() - 300000),
      action: "Clinical teams notified",
    },
    {
      id: "insight_003",
      type: "workflow-optimization",
      title: "Clinical Workflow Optimization Complete",
      description:
        "AI optimized 8 clinical workflows, reducing processing time by 35%",
      confidence: 0.92,
      priority: "high",
      timestamp: new Date(Date.now() - 450000),
      action: "Implemented across all zones",
    },
    {
      id: "insight_004",
      type: "compliance-automation",
      title: "Automated Compliance Validation",
      description:
        "AI continuously monitoring DOH, JAWDA, and HIPAA compliance with 98.5% accuracy",
      confidence: 0.98,
      priority: "medium",
      timestamp: new Date(Date.now() - 600000),
      action: "Real-time compliance assured",
    },
  ]);

  const [complianceScores, setComplianceScores] = useState({
    doh: 98.5,
    jawda: 97.8,
    hipaa: 99.2,
    aiEthics: 96.4,
  });

  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time AI metrics updates
      setAiMetrics((prev) => ({
        ...prev,
        totalInferences: prev.totalInferences + Math.floor(Math.random() * 5),
        successfulInferences:
          prev.successfulInferences + Math.floor(Math.random() * 5),
        averageResponseTime: 80 + Math.random() * 20,
        modelAccuracy: Math.max(
          0.9,
          Math.min(0.99, prev.modelAccuracy + (Math.random() - 0.5) * 0.01),
        ),
      }));

      // Update performance metrics
      setPerformanceMetrics((prev) => ({
        ...prev,
        cpu: Math.max(50, Math.min(90, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(
          60,
          Math.min(85, prev.memory + (Math.random() - 0.5) * 8),
        ),
        gpu: Math.max(70, Math.min(95, prev.gpu + (Math.random() - 0.5) * 6)),
        throughput: 1200 + Math.random() * 100,
      }));

      // Update compliance scores
      setComplianceScores((prev) => ({
        ...prev,
        doh: Math.max(95, Math.min(100, prev.doh + (Math.random() - 0.5) * 2)),
        jawda: Math.max(
          95,
          Math.min(100, prev.jawda + (Math.random() - 0.5) * 1.5),
        ),
        hipaa: Math.max(
          95,
          Math.min(100, prev.hipaa + (Math.random() - 0.5) * 1),
        ),
        aiEthics: Math.max(
          90,
          Math.min(100, prev.aiEthics + (Math.random() - 0.5) * 2),
        ),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const runAIAnalysis = () => {
    setIsProcessing(true);

    // Simulate AI analysis processing
    setTimeout(() => {
      const newInsight = {
        id: `insight_${Date.now()}`,
        type: "predictive-analysis",
        title: "Predictive Analysis Complete",
        description:
          "AI analysis identified 3 optimization opportunities and 1 risk factor",
        confidence: 0.89,
        priority: "high" as const,
        timestamp: new Date(),
        action: "Results available",
      };

      setHealthcareInsights((prev) => [newInsight, ...prev.slice(0, 4)]);
      setIsProcessing(false);
    }, 3000);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-500 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-yellow-500 text-black";
      default:
        return "bg-green-500 text-white";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "clinical-decision-support":
        return <Stethoscope className="h-4 w-4" />;
      case "predictive-analytics":
        return <Brain className="h-4 w-4" />;
      case "workflow-optimization":
        return <TrendingUp className="h-4 w-4" />;
      case "compliance-automation":
        return <Shield className="h-4 w-4" />;
      case "risk-prediction":
        return <AlertTriangle className="h-4 w-4" />;
      case "resource-optimization":
        return <TrendingUp className="h-4 w-4" />;
      case "compliance-alert":
        return <Shield className="h-4 w-4" />;
      case "predictive-analysis":
        return <Brain className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const successRate = (
    (aiMetrics.successfulInferences / aiMetrics.totalInferences) *
    100
  ).toFixed(2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <Brain className="h-10 w-10 text-purple-600" />
            AI Hub Analytics Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Real-time monitoring of AI services, healthcare models, and
            intelligent automation
          </p>
        </div>

        {/* Status Alert */}
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <AlertDescription className="text-green-800">
            🤖 AI Orchestration Active - {aiMetrics.activeModels} models
            operational with {successRate}% success rate •
            {aiMetrics.clinicalWorkflowsOptimized} clinical workflows optimized
            •{aiMetrics.predictiveAlertsGenerated} predictive alerts generated
          </AlertDescription>
        </Alert>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Inferences
              </CardTitle>
              <Brain className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {aiMetrics.totalInferences.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {successRate}% success rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Response Time
              </CardTitle>
              <Zap className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {aiMetrics.averageResponseTime.toFixed(0)}ms
              </div>
              <p className="text-xs text-muted-foreground">
                Average inference time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Model Accuracy
              </CardTitle>
              <Target className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {(aiMetrics.modelAccuracy * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Across all active models
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Throughput</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {performanceMetrics.throughput.toFixed(0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Requests per second
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-blue-600" />
              System Performance
            </CardTitle>
            <CardDescription>
              Real-time monitoring of AI infrastructure and resource utilization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">CPU Usage</span>
                  <span className="text-sm text-muted-foreground">
                    {performanceMetrics.cpu.toFixed(0)}%
                  </span>
                </div>
                <Progress value={performanceMetrics.cpu} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Memory Usage</span>
                  <span className="text-sm text-muted-foreground">
                    {performanceMetrics.memory.toFixed(0)}%
                  </span>
                </div>
                <Progress value={performanceMetrics.memory} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">GPU Usage</span>
                  <span className="text-sm text-muted-foreground">
                    {performanceMetrics.gpu.toFixed(0)}%
                  </span>
                </div>
                <Progress value={performanceMetrics.gpu} className="h-2" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Storage Usage</span>
                  <span className="text-sm text-muted-foreground">
                    {performanceMetrics.storage}%
                  </span>
                </div>
                <Progress value={performanceMetrics.storage} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Network Latency</span>
                  <span className="text-sm text-muted-foreground">
                    {performanceMetrics.networkLatency}ms
                  </span>
                </div>
                <Progress
                  value={100 - performanceMetrics.networkLatency}
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Healthcare AI Insights and Compliance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-600" />
                Healthcare AI Insights
              </CardTitle>
              <CardDescription>
                Real-time AI-generated insights for healthcare operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {healthcareInsights.map((insight) => (
                <div
                  key={insight.id}
                  className="flex items-start justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    {getTypeIcon(insight.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {insight.title}
                        </span>
                        <Badge className={getPriorityColor(insight.priority)}>
                          {insight.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {insight.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          Confidence: {(insight.confidence * 100).toFixed(0)}%
                        </span>
                        <span>{insight.timestamp.toLocaleTimeString()}</span>
                        <span className="text-blue-600">{insight.action}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                AI Compliance Monitoring
              </CardTitle>
              <CardDescription>
                Healthcare compliance scores and AI ethics monitoring
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Stethoscope className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">
                    {complianceScores.doh.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    DOH Compliance
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">
                    {complianceScores.jawda.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    JAWDA Standards
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">
                    {complianceScores.hipaa.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    HIPAA Privacy
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Brain className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-600">
                    {complianceScores.aiEthics.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">AI Ethics</div>
                </div>
              </div>

              <Button
                onClick={runAIAnalysis}
                disabled={isProcessing}
                className="w-full"
                variant={isProcessing ? "secondary" : "default"}
              >
                {isProcessing ? (
                  <>
                    <Activity className="h-4 w-4 mr-2 animate-spin" />
                    Running AI Orchestration Analysis...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Execute AI Healthcare Orchestration
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Model Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-indigo-600" />
              AI Model Status
            </CardTitle>
            <CardDescription>
              Status and performance of active AI models
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-indigo-600 mb-1">
                  {aiMetrics.healthcareModels}
                </div>
                <div className="text-sm text-muted-foreground">
                  Healthcare Models
                </div>
                <div className="text-xs text-green-600 mt-1">All Active</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {aiMetrics.complianceModels}
                </div>
                <div className="text-sm text-muted-foreground">
                  Compliance Models
                </div>
                <div className="text-xs text-green-600 mt-1">All Active</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {aiMetrics.activeModels}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Active Models
                </div>
                <div className="text-xs text-green-600 mt-1">Operational</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Orchestration Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              AI Orchestration Status
            </CardTitle>
            <CardDescription>
              Real-time coordination of AI services for optimal healthcare
              delivery
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {aiMetrics.clinicalWorkflowsOptimized}
                </div>
                <div className="text-sm text-muted-foreground">
                  Workflows Optimized
                </div>
                <div className="text-xs text-green-600 mt-1">
                  35% Time Reduction
                </div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {aiMetrics.predictiveAlertsGenerated}
                </div>
                <div className="text-sm text-muted-foreground">
                  Predictive Alerts
                </div>
                <div className="text-xs text-green-600 mt-1">94% Accuracy</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  98.5%
                </div>
                <div className="text-sm text-muted-foreground">
                  Compliance Score
                </div>
                <div className="text-xs text-green-600 mt-1">Automated</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  Real-time
                </div>
                <div className="text-sm text-muted-foreground">
                  AI Orchestration
                </div>
                <div className="text-xs text-green-600 mt-1">Active</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          AI Hub Analytics - Healthcare Intelligence Orchestration • Real-time
          Clinical Decision Support • Automated Compliance Validation •
          Predictive Healthcare Analytics
        </div>
      </div>
    </div>
  );
}
