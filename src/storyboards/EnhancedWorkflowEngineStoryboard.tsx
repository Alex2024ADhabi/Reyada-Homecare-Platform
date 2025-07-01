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
  Workflow,
  Play,
  Pause,
  RotateCcw,
  Users,
  AlertTriangle,
  Activity,
  Zap,
  Brain,
  Shield,
} from "lucide-react";

export default function EnhancedWorkflowEngineStoryboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [workflowProgress, setWorkflowProgress] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const [completedWorkflows, setCompletedWorkflows] = useState(0);
  const [currentStep, setCurrentStep] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setCompletedWorkflows((prev) => prev + Math.floor(Math.random() * 2));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const executeWorkflow = async () => {
    setIsExecuting(true);
    setWorkflowProgress(0);

    const steps = [
      { name: "Initial Assessment", duration: 1000 },
      { name: "Medical Review", duration: 1500 },
      { name: "Care Plan Creation", duration: 1200 },
      { name: "Team Notification", duration: 800 },
      { name: "Documentation", duration: 600 },
    ];

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(steps[i].name);
      await new Promise((resolve) => setTimeout(resolve, steps[i].duration));
      setWorkflowProgress(((i + 1) / steps.length) * 100);
    }

    setIsExecuting(false);
    setCurrentStep("Completed");
    setCompletedWorkflows((prev) => prev + 1);
  };

  const workflowStats = {
    totalWorkflows: 8,
    activeInstances: 23 + Math.floor(completedWorkflows / 10),
    completedToday: 156 + completedWorkflows,
    averageExecutionTime: "4.2 min",
    successRate: 98.5,
    aiOptimizationScore: 92.8,
  };

  const workflows = [
    {
      id: "patient_admission",
      name: "Patient Admission Workflow",
      category: "clinical",
      steps: 4,
      avgTime: "15 min",
      compliance: ["DOH", "JAWDA"],
      aiEnhanced: true,
      status: "active",
    },
    {
      id: "medication_reconciliation",
      name: "Medication Reconciliation",
      category: "clinical",
      steps: 4,
      avgTime: "8 min",
      compliance: ["DOH"],
      aiEnhanced: true,
      status: "active",
    },
    {
      id: "doh_compliance_audit",
      name: "DOH Compliance Audit",
      category: "compliance",
      steps: 5,
      avgTime: "25 min",
      compliance: ["DOH", "JAWDA"],
      aiEnhanced: true,
      status: "active",
    },
    {
      id: "safety_incident",
      name: "Patient Safety Incident",
      category: "clinical",
      steps: 6,
      avgTime: "12 min",
      compliance: ["DOH"],
      aiEnhanced: true,
      status: "active",
    },
  ];

  const activeInstances = [
    {
      id: "inst_001",
      workflowName: "Patient Admission",
      currentStep: "Medical Review",
      progress: 60,
      assignee: "Dr. Sarah Ahmed",
      priority: "high",
      startTime: "2 hours ago",
    },
    {
      id: "inst_002",
      workflowName: "DOH Compliance Audit",
      currentStep: "Compliance Assessment",
      progress: 25,
      assignee: "Compliance Team",
      priority: "medium",
      startTime: "4 hours ago",
    },
    {
      id: "inst_003",
      workflowName: "Safety Incident Report",
      currentStep: "Investigation",
      progress: 80,
      assignee: "Quality Manager",
      priority: "critical",
      startTime: "1 hour ago",
    },
  ];

  const aiFeatures = [
    {
      name: "Intelligent Routing",
      description: "AI-powered step optimization based on context",
      active: true,
    },
    {
      name: "Predictive Scheduling",
      description: "Optimal timing predictions for workflow steps",
      active: true,
    },
    {
      name: "Resource Optimization",
      description: "Smart resource allocation and load balancing",
      active: true,
    },
    {
      name: "Auto-escalation",
      description: "Automatic escalation for delayed or critical workflows",
      active: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Workflow className="h-12 w-12 text-purple-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              Enhanced Workflow Engine
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            AI-powered workflow automation with intelligent routing, predictive
            scheduling, and healthcare compliance integration
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {workflowStats.totalWorkflows}
              </div>
              <div className="text-sm text-gray-600">Workflows</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {workflowStats.activeInstances}
              </div>
              <div className="text-sm text-gray-600">Active</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {workflowStats.completedToday}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {workflowStats.averageExecutionTime}
              </div>
              <div className="text-sm text-gray-600">Avg Time</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {workflowStats.successRate}%
              </div>
              <div className="text-sm text-gray-600">Success</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {workflowStats.aiOptimizationScore}%
              </div>
              <div className="text-sm text-gray-600">AI Score</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="instances">Active Instances</TabsTrigger>
            <TabsTrigger value="demo">Live Demo</TabsTrigger>
            <TabsTrigger value="ai-features">AI Features</TabsTrigger>
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
                    <span>Workflow Processor</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Running
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
                    <span>Compliance Validation</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      <Shield className="h-3 w-3 mr-1" />
                      DOH + JAWDA
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Task Management</span>
                    <Badge className="bg-orange-100 text-orange-800">
                      <Users className="h-3 w-3 mr-1" />
                      Enabled
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Execution Speed</span>
                      <span>94%</span>
                    </div>
                    <Progress value={94} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Success Rate</span>
                      <span>98.5%</span>
                    </div>
                    <Progress value={98.5} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>AI Optimization</span>
                      <span>92.8%</span>
                    </div>
                    <Progress value={92.8} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Resource Efficiency</span>
                      <span>89.3%</span>
                    </div>
                    <Progress value={89.3} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Workflow Engine is fully operational with AI-powered
                optimization. All healthcare workflows are DOH and JAWDA
                compliant with real-time monitoring and intelligent task
                management.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="workflows" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {workflows.map((workflow) => (
                <Card key={workflow.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{workflow.name}</span>
                      <div className="flex space-x-2">
                        {workflow.aiEnhanced && (
                          <Badge variant="secondary">
                            <Brain className="h-3 w-3 mr-1" />
                            AI
                          </Badge>
                        )}
                        <Badge
                          variant={
                            workflow.status === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {workflow.status}
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Category</span>
                      <Badge variant="outline">{workflow.category}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Steps</span>
                      <span className="font-medium">{workflow.steps}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Avg Time</span>
                      <span className="font-medium">{workflow.avgTime}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Compliance</span>
                      <div className="flex space-x-1">
                        {workflow.compliance.map((comp) => (
                          <Badge
                            key={comp}
                            variant="default"
                            className="text-xs"
                          >
                            {comp}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex space-x-2 pt-2">
                      <Button size="sm" className="flex-1">
                        <Play className="h-3 w-3 mr-1" />
                        Start
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="instances" className="space-y-6">
            <div className="space-y-4">
              {activeInstances.map((instance) => (
                <Card key={instance.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">
                          {instance.workflowName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Started {instance.startTime} • Assigned to{" "}
                          {instance.assignee}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            instance.priority === "critical"
                              ? "destructive"
                              : instance.priority === "high"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {instance.priority}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Pause className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Current Step: {instance.currentStep}</span>
                        <span>{instance.progress}%</span>
                      </div>
                      <Progress value={instance.progress} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="demo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Live Workflow Execution Demo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  <Button
                    onClick={executeWorkflow}
                    disabled={isExecuting}
                    size="lg"
                    className="px-8"
                  >
                    {isExecuting ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Executing Workflow...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Execute Patient Admission Workflow
                      </>
                    )}
                  </Button>

                  {isExecuting && (
                    <div className="space-y-3">
                      <div className="text-lg font-medium text-purple-600">
                        Current Step: {currentStep}
                      </div>
                      <Progress value={workflowProgress} className="h-4" />
                      <p className="text-sm text-gray-600">
                        AI optimization active • Intelligent routing enabled
                      </p>
                    </div>
                  )}

                  {!isExecuting && workflowProgress === 100 && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Patient Admission Workflow completed successfully! All
                        steps executed with AI optimization and compliance
                        validation.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-features" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {aiFeatures.map((feature, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Zap className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{feature.name}</h3>
                          <Badge
                            variant={feature.active ? "default" : "secondary"}
                            className={
                              feature.active
                                ? "bg-green-100 text-green-800"
                                : ""
                            }
                          >
                            {feature.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>AI Optimization Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">23%</div>
                    <div className="text-sm text-gray-600">
                      Faster Execution
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">31%</div>
                    <div className="text-sm text-gray-600">
                      Resource Savings
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      18%
                    </div>
                    <div className="text-sm text-gray-600">Error Reduction</div>
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
