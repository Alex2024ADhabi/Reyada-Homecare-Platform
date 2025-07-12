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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Server,
  Globe,
  RefreshCw,
  Play,
  Pause,
  RotateCcw,
  FileText,
  Users,
  Calendar,
  Target,
  Activity,
} from "lucide-react";

interface DRPlan {
  id: string;
  name: string;
  priority: "critical" | "high" | "medium" | "low";
  rto: number; // Recovery Time Objective in minutes
  rpo: number; // Recovery Point Objective in minutes
  status: "ready" | "testing" | "needs_update" | "failed";
  lastTested: Date;
  nextTest: Date;
  testResults: {
    rtoAchieved: number;
    rpoAchieved: number;
    successRate: number;
    issues: number;
  };
}

interface BackupStatus {
  type: "database" | "application" | "configuration";
  lastBackup: Date;
  size: string;
  status: "completed" | "running" | "failed";
  retention: string;
  location: string;
}

interface FailoverStatus {
  component: string;
  primaryStatus: "active" | "failed" | "maintenance";
  secondaryStatus: "standby" | "active" | "failed";
  lastFailover: Date | null;
  autoFailover: boolean;
  healthCheck: "passing" | "failing";
}

const DisasterRecoveryDashboard: React.FC = () => {
  const [drPlans, setDrPlans] = useState<DRPlan[]>([]);
  const [backupStatus, setBackupStatus] = useState<BackupStatus[]>([]);
  const [failoverStatus, setFailoverStatus] = useState<FailoverStatus[]>([]);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    loadDRData();
    const interval = setInterval(loadDRData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const loadDRData = async () => {
    // Simulate loading DR data
    const mockDRPlans: DRPlan[] = [
      {
        id: "critical-system-recovery",
        name: "Critical System Recovery",
        priority: "critical",
        rto: 60,
        rpo: 15,
        status: "ready",
        lastTested: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        nextTest: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        testResults: {
          rtoAchieved: 45,
          rpoAchieved: 12,
          successRate: 95,
          issues: 1,
        },
      },
      {
        id: "database-failover",
        name: "Database Failover Plan",
        priority: "critical",
        rto: 30,
        rpo: 5,
        status: "ready",
        lastTested: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        nextTest: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
        testResults: {
          rtoAchieved: 28,
          rpoAchieved: 4,
          successRate: 100,
          issues: 0,
        },
      },
      {
        id: "datacenter-failover",
        name: "Data Center Failover",
        priority: "high",
        rto: 240,
        rpo: 60,
        status: "needs_update",
        lastTested: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        nextTest: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        testResults: {
          rtoAchieved: 280,
          rpoAchieved: 75,
          successRate: 85,
          issues: 3,
        },
      },
    ];

    const mockBackupStatus: BackupStatus[] = [
      {
        type: "database",
        lastBackup: new Date(Date.now() - 2 * 60 * 60 * 1000),
        size: "2.4 GB",
        status: "completed",
        retention: "30 days",
        location: "S3 (Dubai + Ireland)",
      },
      {
        type: "application",
        lastBackup: new Date(Date.now() - 6 * 60 * 60 * 1000),
        size: "1.8 GB",
        status: "completed",
        retention: "90 days",
        location: "S3 (Multi-region)",
      },
      {
        type: "configuration",
        lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000),
        size: "45 MB",
        status: "completed",
        retention: "365 days",
        location: "S3 + Git",
      },
    ];

    const mockFailoverStatus: FailoverStatus[] = [
      {
        component: "Application Load Balancer",
        primaryStatus: "active",
        secondaryStatus: "standby",
        lastFailover: null,
        autoFailover: true,
        healthCheck: "passing",
      },
      {
        component: "Database Cluster",
        primaryStatus: "active",
        secondaryStatus: "standby",
        lastFailover: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        autoFailover: true,
        healthCheck: "passing",
      },
      {
        component: "Kubernetes Cluster",
        primaryStatus: "active",
        secondaryStatus: "standby",
        lastFailover: null,
        autoFailover: false,
        healthCheck: "passing",
      },
    ];

    setDrPlans(mockDRPlans);
    setBackupStatus(mockBackupStatus);
    setFailoverStatus(mockFailoverStatus);
    setLastUpdate(new Date());
  };

  const runDRTest = async (planId: string) => {
    setIsRunningTest(true);
    setTestProgress(0);

    // Simulate test execution
    const progressInterval = setInterval(() => {
      setTestProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 500);

    // Simulate test completion
    setTimeout(() => {
      setIsRunningTest(false);
      setTestProgress(0);
      // Update the plan status
      setDrPlans((prev) =>
        prev.map((plan) =>
          plan.id === planId
            ? { ...plan, lastTested: new Date(), status: "ready" as const }
            : plan,
        ),
      );
    }, 5000);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "text-red-600 bg-red-100";
      case "high":
        return "text-orange-600 bg-orange-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "low":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "text-green-600 bg-green-100";
      case "testing":
        return "text-blue-600 bg-blue-100";
      case "needs_update":
        return "text-yellow-600 bg-yellow-100";
      case "failed":
        return "text-red-600 bg-red-100";
      case "completed":
        return "text-green-600 bg-green-100";
      case "running":
        return "text-blue-600 bg-blue-100";
      case "active":
        return "text-green-600 bg-green-100";
      case "standby":
        return "text-blue-600 bg-blue-100";
      case "passing":
        return "text-green-600 bg-green-100";
      case "failing":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const overallReadiness =
    (drPlans.filter((plan) => plan.status === "ready").length /
      drPlans.length) *
    100;
  const criticalPlansReady = drPlans.filter(
    (plan) => plan.priority === "critical" && plan.status === "ready",
  ).length;
  const totalCriticalPlans = drPlans.filter(
    (plan) => plan.priority === "critical",
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Disaster Recovery Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Comprehensive disaster recovery planning and business continuity
              management
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="text-sm">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </Badge>
            <Button onClick={loadDRData} size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Overall Readiness
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overallReadiness.toFixed(0)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {drPlans.filter((p) => p.status === "ready").length} of{" "}
                {drPlans.length} plans ready
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Critical Plans
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {criticalPlansReady}/{totalCriticalPlans}
              </div>
              <p className="text-xs text-muted-foreground">
                Critical plans ready
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg RTO</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(
                  drPlans.reduce((sum, plan) => sum + plan.rto, 0) /
                    drPlans.length,
                )}{" "}
                min
              </div>
              <p className="text-xs text-muted-foreground">
                Recovery Time Objective
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg RPO</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(
                  drPlans.reduce((sum, plan) => sum + plan.rpo, 0) /
                    drPlans.length,
                )}{" "}
                min
              </div>
              <p className="text-xs text-muted-foreground">
                Recovery Point Objective
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Test Progress */}
        {isRunningTest && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2 animate-pulse" />
                Running Disaster Recovery Test
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Test Progress</span>
                  <span>{testProgress}%</span>
                </div>
                <Progress value={testProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="plans" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="plans">DR Plans</TabsTrigger>
            <TabsTrigger value="backups">Backups</TabsTrigger>
            <TabsTrigger value="failover">Failover</TabsTrigger>
            <TabsTrigger value="testing">Testing</TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {drPlans.map((plan) => (
                <Card key={plan.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center">
                          <FileText className="h-5 w-5 mr-2" />
                          {plan.name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          RTO: {plan.rto} min | RPO: {plan.rpo} min
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getPriorityColor(plan.priority)}>
                          {plan.priority.toUpperCase()}
                        </Badge>
                        <Badge className={getStatusColor(plan.status)}>
                          {plan.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm">Test Results</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>RTO Achieved:</span>
                            <span
                              className={
                                plan.testResults.rtoAchieved <= plan.rto
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {plan.testResults.rtoAchieved} min
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>RPO Achieved:</span>
                            <span
                              className={
                                plan.testResults.rpoAchieved <= plan.rpo
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {plan.testResults.rpoAchieved} min
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Success Rate:</span>
                            <span
                              className={
                                plan.testResults.successRate >= 95
                                  ? "text-green-600"
                                  : "text-yellow-600"
                              }
                            >
                              {plan.testResults.successRate}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium text-sm">Schedule</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Last Tested:</span>
                            <span>{plan.lastTested.toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Next Test:</span>
                            <span>{plan.nextTest.toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Issues:</span>
                            <span
                              className={
                                plan.testResults.issues === 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {plan.testResults.issues}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium text-sm">Actions</h4>
                        <div className="space-y-2">
                          <Button
                            size="sm"
                            onClick={() => runDRTest(plan.id)}
                            disabled={isRunningTest}
                            className="w-full"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Run Test
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            View Plan
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="backups" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {backupStatus.map((backup, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center capitalize">
                      <Database className="h-5 w-5 mr-2" />
                      {backup.type} Backup
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Status</span>
                      <Badge className={getStatusColor(backup.status)}>
                        {backup.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Last Backup:</span>
                        <span>{backup.lastBackup.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Size:</span>
                        <span>{backup.size}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Retention:</span>
                        <span>{backup.retention}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Location:</span>
                        <span className="text-right">{backup.location}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="failover" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {failoverStatus.map((failover, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        <RotateCcw className="h-5 w-5 mr-2" />
                        {failover.component}
                      </span>
                      <Badge className={getStatusColor(failover.healthCheck)}>
                        {failover.healthCheck.toUpperCase()}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Primary</h4>
                        <Badge
                          className={getStatusColor(failover.primaryStatus)}
                        >
                          {failover.primaryStatus.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Secondary</h4>
                        <Badge
                          className={getStatusColor(failover.secondaryStatus)}
                        >
                          {failover.secondaryStatus.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Configuration</h4>
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span>Auto Failover:</span>
                            <span
                              className={
                                failover.autoFailover
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {failover.autoFailover ? "Enabled" : "Disabled"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Last Failover:</span>
                            <span>
                              {failover.lastFailover
                                ? failover.lastFailover.toLocaleDateString()
                                : "Never"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="testing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>DR Testing Schedule & Results</CardTitle>
                <CardDescription>
                  Automated and manual disaster recovery testing schedule
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        Monthly
                      </div>
                      <div className="text-sm text-gray-600">
                        Tabletop Exercises
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        Quarterly
                      </div>
                      <div className="text-sm text-gray-600">Partial Tests</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        Annually
                      </div>
                      <div className="text-sm text-gray-600">Full DR Tests</div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-medium mb-4">Upcoming Tests</h4>
                    <div className="space-y-3">
                      {drPlans.map((plan) => (
                        <div
                          key={plan.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <div className="font-medium">{plan.name}</div>
                            <div className="text-sm text-gray-600">
                              Next test: {plan.nextTest.toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getPriorityColor(plan.priority)}>
                              {plan.priority}
                            </Badge>
                            <Button
                              size="sm"
                              onClick={() => runDRTest(plan.id)}
                              disabled={isRunningTest}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Test
                            </Button>
                          </div>
                        </div>
                      ))}
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
};

export default DisasterRecoveryDashboard;
