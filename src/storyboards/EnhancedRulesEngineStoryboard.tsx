import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  Clock,
  Scale,
  Play,
  AlertTriangle,
  Activity,
  Zap,
  Brain,
  Shield,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

export default function EnhancedRulesEngineStoryboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [evaluationProgress, setEvaluationProgress] = useState(0);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [rulesExecuted, setRulesExecuted] = useState(0);
  const [currentRule, setCurrentRule] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setRulesExecuted((prev) => prev + Math.floor(Math.random() * 5));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const evaluateRules = async () => {
    setIsEvaluating(true);
    setEvaluationProgress(0);

    const rules = [
      { name: "Patient Age Validation", duration: 300 },
      { name: "Medication Allergy Check", duration: 500 },
      { name: "High Risk Assessment", duration: 400 },
      { name: "DOH Compliance Check", duration: 600 },
      { name: "Safety Protocol Validation", duration: 350 },
    ];

    for (let i = 0; i < rules.length; i++) {
      setCurrentRule(rules[i].name);
      await new Promise((resolve) => setTimeout(resolve, rules[i].duration));
      setEvaluationProgress(((i + 1) / rules.length) * 100);
    }

    setIsEvaluating(false);
    setCurrentRule("Evaluation Complete");
    setRulesExecuted((prev) => prev + rules.length);
  };

  const engineStats = {
    totalRules: 24,
    activeRules: 21,
    executionsToday: 2847 + rulesExecuted,
    successRate: 99.2,
    averageExecutionTime: "0.8ms",
    aiOptimizationScore: 96.4,
  };

  const ruleCategories = [
    {
      name: "Clinical Rules",
      count: 8,
      description: "Patient care and clinical decision support",
      icon: Activity,
      color: "blue",
      rules: [
        "Patient Age Validation",
        "High Risk Patient Assessment",
        "Critical Vital Signs Alert",
        "Medication Dosage Validation",
      ],
    },
    {
      name: "Safety Rules",
      count: 6,
      description: "Patient safety and risk management",
      icon: Shield,
      color: "red",
      rules: [
        "Medication Allergy Check",
        "Fall Risk Assessment",
        "Infection Control Protocol",
      ],
    },
    {
      name: "Compliance Rules",
      count: 7,
      description: "DOH and JAWDA regulatory compliance",
      icon: CheckCircle,
      color: "green",
      rules: [
        "DOH Documentation Compliance",
        "JAWDA Quality Standards",
        "Data Privacy Compliance",
      ],
    },
    {
      name: "Business Rules",
      count: 3,
      description: "Operational and administrative logic",
      icon: TrendingUp,
      color: "purple",
      rules: [
        "Resource Allocation",
        "Workflow Optimization",
        "Cost Management",
      ],
    },
  ];

  const recentExecutions = [
    {
      id: "exec_001",
      ruleName: "Medication Allergy Check",
      result: "BLOCKED",
      patient: "Patient #1247",
      time: "2 min ago",
      severity: "critical",
      action: "Prescription blocked due to known allergy",
    },
    {
      id: "exec_002",
      ruleName: "High Risk Assessment",
      result: "TRIGGERED",
      patient: "Patient #1248",
      time: "5 min ago",
      severity: "high",
      action: "Enhanced monitoring workflow initiated",
    },
    {
      id: "exec_003",
      ruleName: "DOH Compliance Check",
      result: "PASSED",
      patient: "Patient #1249",
      time: "8 min ago",
      severity: "medium",
      action: "Documentation validated successfully",
    },
    {
      id: "exec_004",
      ruleName: "Fall Risk Assessment",
      result: "WARNING",
      patient: "Patient #1250",
      time: "12 min ago",
      severity: "medium",
      action: "Fall prevention measures recommended",
    },
  ];

  const performanceMetrics = [
    { name: "Rule Execution Speed", value: 98.7, color: "blue" },
    { name: "Accuracy Rate", value: 99.2, color: "green" },
    { name: "AI Optimization", value: 96.4, color: "purple" },
    { name: "Compliance Coverage", value: 100, color: "orange" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Scale className="h-12 w-12 text-green-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              Enhanced Rules Engine
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Advanced business rules processing with AI-powered decision
            automation, healthcare compliance validation, and real-time clinical
            decision support
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {engineStats.totalRules}
              </div>
              <div className="text-sm text-gray-600">Total Rules</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {engineStats.activeRules}
              </div>
              <div className="text-sm text-gray-600">Active</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {engineStats.executionsToday.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Executions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {engineStats.averageExecutionTime}
              </div>
              <div className="text-sm text-gray-600">Avg Time</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {engineStats.successRate}%
              </div>
              <div className="text-sm text-gray-600">Success</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {engineStats.aiOptimizationScore}%
              </div>
              <div className="text-sm text-gray-600">AI Score</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="rules">Rule Categories</TabsTrigger>
            <TabsTrigger value="executions">Recent Executions</TabsTrigger>
            <TabsTrigger value="demo">Live Demo</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>Engine Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Rules Engine</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Initialized
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>AI Enhancements</span>
                    <Badge className="bg-purple-100 text-purple-800">
                      <Brain className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Healthcare Rules</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      <Shield className="h-3 w-3 mr-1" />
                      Loaded
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Compliance Validation</span>
                    <Badge className="bg-orange-100 text-orange-800">
                      <Target className="h-3 w-3 mr-1" />
                      DOH + JAWDA
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rule Execution Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        1,247
                      </div>
                      <div className="text-sm text-gray-600">Rules Matched</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">23</div>
                      <div className="text-sm text-gray-600">
                        Actions Blocked
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">89</div>
                      <div className="text-sm text-gray-600">
                        Workflows Triggered
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        456
                      </div>
                      <div className="text-sm text-gray-600">
                        Notifications Sent
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Rules Engine is fully operational with AI-powered optimization.
                All healthcare rules are active with real-time clinical decision
                support and compliance validation for DOH and JAWDA standards.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="rules" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ruleCategories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <Card key={category.name}>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-3">
                        <div
                          className={`p-2 bg-${category.color}-100 rounded-lg`}
                        >
                          <IconComponent
                            className={`h-6 w-6 text-${category.color}-600`}
                          />
                        </div>
                        <div>
                          <div>{category.name}</div>
                          <div className="text-sm font-normal text-gray-600">
                            {category.count} rules active
                          </div>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-600">
                        {category.description}
                      </p>
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Sample Rules:</div>
                        <ul className="space-y-1">
                          {category.rules.map((rule, index) => (
                            <li
                              key={index}
                              className="text-sm text-gray-600 flex items-center"
                            >
                              <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                              {rule}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Button size="sm" className="w-full">
                        View All Rules
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="executions" className="space-y-6">
            <div className="space-y-4">
              {recentExecutions.map((execution) => (
                <Card key={execution.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{execution.ruleName}</h3>
                        <p className="text-sm text-gray-600">
                          {execution.patient} • {execution.time}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            execution.result === "BLOCKED"
                              ? "destructive"
                              : execution.result === "TRIGGERED"
                                ? "default"
                                : execution.result === "WARNING"
                                  ? "secondary"
                                  : "outline"
                          }
                        >
                          {execution.result}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={
                            execution.severity === "critical"
                              ? "border-red-200 text-red-700"
                              : execution.severity === "high"
                                ? "border-orange-200 text-orange-700"
                                : "border-blue-200 text-blue-700"
                          }
                        >
                          {execution.severity}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Action:</strong> {execution.action}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="demo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Live Rules Evaluation Demo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  <Button
                    onClick={evaluateRules}
                    disabled={isEvaluating}
                    size="lg"
                    className="px-8"
                  >
                    {isEvaluating ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Evaluating Rules...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Evaluate Patient Safety Rules
                      </>
                    )}
                  </Button>

                  {isEvaluating && (
                    <div className="space-y-3">
                      <div className="text-lg font-medium text-green-600">
                        Current Rule: {currentRule}
                      </div>
                      <Progress value={evaluationProgress} className="h-4" />
                      <p className="text-sm text-gray-600">
                        AI-powered rule evaluation with clinical context
                        analysis
                      </p>
                    </div>
                  )}

                  {!isEvaluating && evaluationProgress === 100 && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Rules evaluation completed successfully! All patient
                        safety and compliance rules processed with AI
                        optimization.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {performanceMetrics.map((metric) => (
                    <div key={metric.name} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{metric.name}</span>
                        <span>{metric.value}%</span>
                      </div>
                      <Progress value={metric.value} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI Optimization Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        47%
                      </div>
                      <div className="text-sm text-gray-600">
                        Faster Rule Evaluation
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        62%
                      </div>
                      <div className="text-sm text-gray-600">
                        Improved Accuracy
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">
                        38%
                      </div>
                      <div className="text-sm text-gray-600">
                        Reduced False Positives
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Medication Allergy Check</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={98} className="w-20 h-2" />
                      <span className="text-sm font-medium">98%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">High Risk Assessment</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={95} className="w-20 h-2" />
                      <span className="text-sm font-medium">95%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">DOH Compliance Check</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={100} className="w-20 h-2" />
                      <span className="text-sm font-medium">100%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Fall Risk Assessment</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={92} className="w-20 h-2" />
                      <span className="text-sm font-medium">92%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
