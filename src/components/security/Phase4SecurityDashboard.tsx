import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  Eye,
  FileText,
  Play,
  Pause,
  CheckCircle,
  AlertTriangle,
  Clock,
  Target,
  Activity,
  Lock,
  Zap,
  Database,
  Users,
  Network,
  Brain,
  Search,
  BarChart3,
  TrendingUp,
  Settings,
  RefreshCw,
} from "lucide-react";

// Types
interface SecurityTask {
  id: string;
  category: "zero-trust" | "threat-detection" | "audit-trail";
  name: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  status: "pending" | "in-progress" | "completed" | "failed";
  progress: number;
  estimatedTime: number;
  actualTime?: number;
  startTime?: string;
  completionTime?: string;
  error?: string;
}

interface SecurityMetrics {
  zeroTrustCompliance: number;
  threatDetectionCoverage: number;
  auditTrailIntegrity: number;
  overallSecurityScore: number;
  vulnerabilitiesDetected: number;
  threatsBlocked: number;
  auditEventsProcessed: number;
  complianceStatus: "compliant" | "partial" | "non-compliant";
}

const Phase4SecurityDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isImplementing, setIsImplementing] = useState(false);
  const [implementationStarted, setImplementationStarted] = useState(false);
  
  // Mock data - in real implementation, this would come from the orchestrator service
  const [tasks, setTasks] = useState<SecurityTask[]>([
    // Zero-Trust Architecture
    {
      id: "zt-001",
      category: "zero-trust",
      name: "Complete Zero-Trust Framework",
      description: "Implement full zero-trust architecture with never trust, always verify principle",
      priority: "critical",
      status: implementationStarted ? "completed" : "pending",
      progress: implementationStarted ? 100 : 0,
      estimatedTime: 45,
      actualTime: implementationStarted ? 42 : undefined,
    },
    {
      id: "zt-002",
      category: "zero-trust",
      name: "Advanced Identity Verification",
      description: "Multi-factor authentication with biometrics and behavioral analysis",
      priority: "critical",
      status: implementationStarted ? "completed" : "pending",
      progress: implementationStarted ? 100 : 0,
      estimatedTime: 30,
      actualTime: implementationStarted ? 28 : undefined,
    },
    {
      id: "zt-003",
      category: "zero-trust",
      name: "Continuous Security Validation",
      description: "Real-time session validation and risk assessment",
      priority: "high",
      status: implementationStarted ? "completed" : "pending",
      progress: implementationStarted ? 100 : 0,
      estimatedTime: 25,
      actualTime: implementationStarted ? 23 : undefined,
    },
    {
      id: "zt-004",
      category: "zero-trust",
      name: "Micro-Segmentation Implementation",
      description: "Network micro-segmentation with dynamic access control",
      priority: "high",
      status: implementationStarted ? "completed" : "pending",
      progress: implementationStarted ? 100 : 0,
      estimatedTime: 35,
      actualTime: implementationStarted ? 33 : undefined,
    },
    // Threat Detection
    {
      id: "td-001",
      category: "threat-detection",
      name: "AI-Powered Threat Detection",
      description: "Machine learning-based anomaly detection and threat identification",
      priority: "critical",
      status: implementationStarted ? "completed" : "pending",
      progress: implementationStarted ? 100 : 0,
      estimatedTime: 40,
      actualTime: implementationStarted ? 38 : undefined,
    },
    {
      id: "td-002",
      category: "threat-detection",
      name: "Real-Time Threat Response Automation",
      description: "Automated threat response workflows and incident handling",
      priority: "critical",
      status: implementationStarted ? "completed" : "pending",
      progress: implementationStarted ? 100 : 0,
      estimatedTime: 30,
      actualTime: implementationStarted ? 29 : undefined,
    },
    {
      id: "td-003",
      category: "threat-detection",
      name: "Advanced Behavioral Analysis",
      description: "User behavior analytics and insider threat detection",
      priority: "high",
      status: implementationStarted ? "completed" : "pending",
      progress: implementationStarted ? 100 : 0,
      estimatedTime: 25,
      actualTime: implementationStarted ? 24 : undefined,
    },
    {
      id: "td-004",
      category: "threat-detection",
      name: "Threat Intelligence Integration",
      description: "External threat feed integration and correlation",
      priority: "high",
      status: implementationStarted ? "completed" : "pending",
      progress: implementationStarted ? 100 : 0,
      estimatedTime: 20,
      actualTime: implementationStarted ? 19 : undefined,
    },
    // Audit Trail
    {
      id: "at-001",
      category: "audit-trail",
      name: "Immutable Audit Trail",
      description: "Blockchain-based immutable audit logging system",
      priority: "critical",
      status: implementationStarted ? "completed" : "pending",
      progress: implementationStarted ? 100 : 0,
      estimatedTime: 35,
      actualTime: implementationStarted ? 34 : undefined,
    },
    {
      id: "at-002",
      category: "audit-trail",
      name: "Real-Time Audit Monitoring",
      description: "Live audit event monitoring and alerting",
      priority: "high",
      status: implementationStarted ? "completed" : "pending",
      progress: implementationStarted ? 100 : 0,
      estimatedTime: 20,
      actualTime: implementationStarted ? 18 : undefined,
    },
    {
      id: "at-003",
      category: "audit-trail",
      name: "Advanced Audit Analytics",
      description: "AI-powered audit analysis and pattern detection",
      priority: "medium",
      status: implementationStarted ? "completed" : "pending",
      progress: implementationStarted ? 100 : 0,
      estimatedTime: 25,
      actualTime: implementationStarted ? 24 : undefined,
    },
    {
      id: "at-004",
      category: "audit-trail",
      name: "Comprehensive Compliance Reporting",
      description: "Automated compliance reporting for healthcare regulations",
      priority: "high",
      status: implementationStarted ? "completed" : "pending",
      progress: implementationStarted ? 100 : 0,
      estimatedTime: 30,
      actualTime: implementationStarted ? 28 : undefined,
    },
  ]);

  const [metrics, setMetrics] = useState<SecurityMetrics>({
    zeroTrustCompliance: implementationStarted ? 98.5 : 0,
    threatDetectionCoverage: implementationStarted ? 96.2 : 0,
    auditTrailIntegrity: implementationStarted ? 99.8 : 0,
    overallSecurityScore: implementationStarted ? 98.2 : 0,
    vulnerabilitiesDetected: implementationStarted ? 3 : 0,
    threatsBlocked: implementationStarted ? 47 : 0,
    auditEventsProcessed: implementationStarted ? 15420 : 0,
    complianceStatus: implementationStarted ? "compliant" : "non-compliant",
  });

  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Simulate implementation process
  const startImplementation = async () => {
    setIsImplementing(true);
    
    // Simulate progressive implementation
    for (let i = 0; i < tasks.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 seconds per task
      
      setTasks(prevTasks => 
        prevTasks.map((task, index) => {
          if (index <= i) {
            return {
              ...task,
              status: "completed" as const,
              progress: 100,
              actualTime: Math.round(task.estimatedTime * (0.8 + Math.random() * 0.4)),
            };
          }
          return task;
        })
      );

      // Update metrics progressively
      const completedCount = i + 1;
      const totalTasks = tasks.length;
      const progressRatio = completedCount / totalTasks;

      setMetrics(prev => ({
        ...prev,
        zeroTrustCompliance: Math.round(98.5 * progressRatio),
        threatDetectionCoverage: Math.round(96.2 * progressRatio),
        auditTrailIntegrity: Math.round(99.8 * progressRatio),
        overallSecurityScore: Math.round(98.2 * progressRatio),
        vulnerabilitiesDetected: Math.round(3 * progressRatio),
        threatsBlocked: Math.round(47 * progressRatio),
        auditEventsProcessed: Math.round(15420 * progressRatio),
        complianceStatus: progressRatio > 0.9 ? "compliant" : progressRatio > 0.5 ? "partial" : "non-compliant",
      }));
    }

    setIsImplementing(false);
    setImplementationStarted(true);
    setLastUpdated(new Date());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-600 bg-green-100";
      case "in-progress": return "text-blue-600 bg-blue-100";
      case "failed": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "text-red-600 bg-red-100";
      case "high": return "text-orange-600 bg-orange-100";
      case "medium": return "text-yellow-600 bg-yellow-100";
      case "low": return "text-blue-600 bg-blue-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "zero-trust": return <Shield className="h-4 w-4" />;
      case "threat-detection": return <Eye className="h-4 w-4" />;
      case "audit-trail": return <FileText className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getCompletedTasksByCategory = (category: string) => {
    return tasks.filter(task => task.category === category && task.status === "completed").length;
  };

  const getTotalTasksByCategory = (category: string) => {
    return tasks.filter(task => task.category === category).length;
  };

  const overallProgress = Math.round((tasks.filter(t => t.status === "completed").length / tasks.length) * 100);

  return (
    <div className="bg-white min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Phase 4: Security Hardening Control Center
            </h1>
            <p className="text-gray-600 mt-1">
              Complete implementation of all 12 Security Hardening subtasks with production-ready solutions
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
              <div className={`text-lg font-semibold ${
                metrics.complianceStatus === "compliant" ? "text-green-600" : 
                metrics.complianceStatus === "partial" ? "text-yellow-600" : "text-red-600"
              }`}>
                Status: {metrics.complianceStatus.charAt(0).toUpperCase() + metrics.complianceStatus.slice(1)}
              </div>
            </div>
            <Button 
              onClick={startImplementation}
              disabled={isImplementing || implementationStarted}
              className="bg-red-600 hover:bg-red-700"
            >
              {isImplementing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Implementing...
                </>
              ) : implementationStarted ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Completed
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Implementation
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Security Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Alert className="border-red-200 bg-red-50">
            <Shield className="h-4 w-4 text-red-600" />
            <AlertDescription>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-800">
                  {getCompletedTasksByCategory("zero-trust")}/{getTotalTasksByCategory("zero-trust")}
                </div>
                <p className="text-red-700 text-sm">Zero-Trust Architecture</p>
                <div className="text-xs text-red-600 mt-1">
                  {metrics.zeroTrustCompliance.toFixed(1)}% compliance
                </div>
              </div>
            </AlertDescription>
          </Alert>

          <Alert className="border-orange-200 bg-orange-50">
            <Eye className="h-4 w-4 text-orange-600" />
            <AlertDescription>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-800">
                  {getCompletedTasksByCategory("threat-detection")}/{getTotalTasksByCategory("threat-detection")}
                </div>
                <p className="text-orange-700 text-sm">Threat Detection</p>
                <div className="text-xs text-orange-600 mt-1">
                  {metrics.threatDetectionCoverage.toFixed(1)}% coverage
                </div>
              </div>
            </AlertDescription>
          </Alert>

          <Alert className="border-blue-200 bg-blue-50">
            <FileText className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-800">
                  {getCompletedTasksByCategory("audit-trail")}/{getTotalTasksByCategory("audit-trail")}
                </div>
                <p className="text-blue-700 text-sm">Audit Trail</p>
                <div className="text-xs text-blue-600 mt-1">
                  {metrics.auditTrailIntegrity.toFixed(1)}% integrity
                </div>
              </div>
            </AlertDescription>
          </Alert>

          <Alert className="border-green-200 bg-green-50">
            <Target className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-800">
                  {metrics.overallSecurityScore.toFixed(0)}
                </div>
                <p className="text-green-700 text-sm">Security Score</p>
                <div className="text-xs text-green-600 mt-1">
                  {overallProgress}% complete
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="zero-trust">Zero-Trust</TabsTrigger>
            <TabsTrigger value="threat-detection">Threat Detection</TabsTrigger>
            <TabsTrigger value="audit-trail">Audit Trail</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Implementation Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-blue-600" />
                  Implementation Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Overall Progress</span>
                      <span>{overallProgress}%</span>
                    </div>
                    <Progress value={overallProgress} className="h-3" />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {tasks.filter(t => t.status === "completed").length}
                      </div>
                      <div className="text-sm text-gray-600">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {tasks.filter(t => t.status === "in-progress").length}
                      </div>
                      <div className="text-sm text-gray-600">In Progress</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-600">
                        {tasks.filter(t => t.status === "pending").length}
                      </div>
                      <div className="text-sm text-gray-600">Pending</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Task Summary by Category */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {["zero-trust", "threat-detection", "audit-trail"].map((category) => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="flex items-center text-sm">
                      {getCategoryIcon(category)}
                      <span className="ml-2 capitalize">{category.replace("-", " ")}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {tasks.filter(task => task.category === category).map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex-1">
                            <div className="font-medium text-xs">{task.name}</div>
                            <div className="text-xs text-gray-500 mt-1">{task.description}</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority.toUpperCase()}
                            </Badge>
                            <Badge className={getStatusColor(task.status)}>
                              {task.status === "completed" ? "✓" : task.status === "in-progress" ? "⏳" : "⏸"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="zero-trust" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-red-600" />
                  Zero-Trust Architecture Implementation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasks.filter(task => task.category === "zero-trust").map((task) => (
                    <div key={task.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{task.name}</h3>
                        <div className="flex items-center space-x-2">
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority.toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(task.status)}>
                            {task.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{task.progress}%</span>
                      </div>
                      <Progress value={task.progress} className="h-2 mb-2" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Estimated: {task.estimatedTime}min</span>
                        {task.actualTime && <span>Actual: {task.actualTime}min</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="threat-detection" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-orange-600" />
                  Threat Detection Implementation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasks.filter(task => task.category === "threat-detection").map((task) => (
                    <div key={task.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{task.name}</h3>
                        <div className="flex items-center space-x-2">
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority.toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(task.status)}>
                            {task.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{task.progress}%</span>
                      </div>
                      <Progress value={task.progress} className="h-2 mb-2" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Estimated: {task.estimatedTime}min</span>
                        {task.actualTime && <span>Actual: {task.actualTime}min</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit-trail" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Audit Trail Implementation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasks.filter(task => task.category === "audit-trail").map((task) => (
                    <div key={task.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{task.name}</h3>
                        <div className="flex items-center space-x-2">
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority.toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(task.status)}>
                            {task.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{task.progress}%</span>
                      </div>
                      <Progress value={task.progress} className="h-2 mb-2" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Estimated: {task.estimatedTime}min</span>
                        {task.actualTime && <span>Actual: {task.actualTime}min</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
                    Security Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Zero-Trust Compliance</span>
                        <span>{metrics.zeroTrustCompliance.toFixed(1)}%</span>
                      </div>
                      <Progress value={metrics.zeroTrustCompliance} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Threat Detection Coverage</span>
                        <span>{metrics.threatDetectionCoverage.toFixed(1)}%</span>
                      </div>
                      <Progress value={metrics.threatDetectionCoverage} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Audit Trail Integrity</span>
                        <span>{metrics.auditTrailIntegrity.toFixed(1)}%</span>
                      </div>
                      <Progress value={metrics.auditTrailIntegrity} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Overall Security Score</span>
                        <span>{metrics.overallSecurityScore.toFixed(1)}%</span>
                      </div>
                      <Progress value={metrics.overallSecurityScore} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                    Security Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {metrics.vulnerabilitiesDetected}
                      </div>
                      <div className="text-sm text-gray-600">Vulnerabilities Detected</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {metrics.threatsBlocked}
                      </div>
                      <div className="text-sm text-gray-600">Threats Blocked</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {metrics.auditEventsProcessed.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Audit Events</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        metrics.complianceStatus === "compliant" ? "text-green-600" : 
                        metrics.complianceStatus === "partial" ? "text-yellow-600" : "text-red-600"
                      }`}>
                        {metrics.complianceStatus === "compliant" ? "✓" : 
                         metrics.complianceStatus === "partial" ? "⚠" : "✗"}
                      </div>
                      <div className="text-sm text-gray-600">Compliance Status</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Phase4SecurityDashboard;