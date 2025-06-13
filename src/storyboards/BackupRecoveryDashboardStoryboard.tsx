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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  HardDrive,
  RefreshCw,
  Database,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  FileText,
  Zap,
  Play,
  Settings,
} from "lucide-react";

const BackupRecoveryDashboard: React.FC = () => {
  const [backupStatus, setBackupStatus] = useState<any>(null);
  const [drStatus, setDrStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const fetchBackupStatus = async () => {
    try {
      const response = await fetch("/api/doh-audit/backup-status");
      const data = await response.json();
      if (data.success) {
        setBackupStatus(data.backupStatus);
      }
    } catch (error) {
      console.error("Error fetching backup status:", error);
    }
  };

  const fetchDRStatus = async () => {
    try {
      const response = await fetch("/api/doh-audit/disaster-recovery-status");
      const data = await response.json();
      if (data.success) {
        setDrStatus(data.drStatus);
      }
    } catch (error) {
      console.error("Error fetching DR status:", error);
    }
  };

  const triggerBackup = async (type: string = "incremental") => {
    setLoading(true);
    try {
      const response = await fetch("/api/doh-audit/trigger-backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ backupType: type }),
      });
      const data = await response.json();
      if (data.success) {
        await fetchBackupStatus();
      }
    } catch (error) {
      console.error("Error triggering backup:", error);
    } finally {
      setLoading(false);
    }
  };

  const initiateDRTest = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/doh-audit/initiate-dr-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testType: "partial" }),
      });
      const data = await response.json();
      if (data.success) {
        await fetchDRStatus();
      }
    } catch (error) {
      console.error("Error initiating DR test:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackupStatus();
    fetchDRStatus();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "healthy":
      case "completed":
        return "text-green-600";
      case "warning":
      case "running":
        return "text-yellow-600";
      case "critical":
      case "failed":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "healthy":
      case "completed":
        return <Badge className="bg-green-100 text-green-800">{status}</Badge>;
      case "warning":
      case "running":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">{status}</Badge>
        );
      case "critical":
      case "failed":
        return <Badge className="bg-red-100 text-red-800">{status}</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Backup & Recovery Management
              </h1>
              <p className="text-gray-600 mt-2">
                Comprehensive backup and disaster recovery monitoring and
                management
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => fetchBackupStatus()}
                disabled={loading}
                variant="outline"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button
                onClick={() => triggerBackup("incremental")}
                disabled={loading}
              >
                <HardDrive className="h-4 w-4 mr-2" />
                Trigger Backup
              </Button>
            </div>
          </div>
        </div>

        {/* Critical Status Alert */}
        {drStatus?.overallReadiness?.score < 50 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">
              Critical: Backup & Recovery System Not Implemented
            </AlertTitle>
            <AlertDescription className="text-red-700">
              Your system currently has a backup readiness score of{" "}
              {drStatus?.overallReadiness?.score}%. Immediate action is required
              to implement automated backups and disaster recovery procedures.
            </AlertDescription>
          </Alert>
        )}

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <HardDrive className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium text-gray-600">
                  Backup System
                </span>
              </div>
              <div className="text-2xl font-bold mt-2 text-red-600">
                NOT IMPLEMENTED
              </div>
              <div className="text-sm text-red-600 mt-1">
                No automated backups
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium text-gray-600">
                  DR Readiness
                </span>
              </div>
              <div className="text-2xl font-bold mt-2 text-red-600">
                {drStatus?.overallReadiness?.score || 0}%
              </div>
              <Progress
                value={drStatus?.overallReadiness?.score || 0}
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-medium text-gray-600">
                  RTO Target
                </span>
              </div>
              <div className="text-2xl font-bold mt-2 text-yellow-600">
                4 Hours
              </div>
              <div className="text-sm text-yellow-600 mt-1">Not tested</div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-medium text-gray-600">
                  RPO Target
                </span>
              </div>
              <div className="text-2xl font-bold mt-2 text-yellow-600">
                1 Hour
              </div>
              <div className="text-sm text-yellow-600 mt-1">Not tested</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="backups">Backups</TabsTrigger>
            <TabsTrigger value="disaster-recovery">
              Disaster Recovery
            </TabsTrigger>
            <TabsTrigger value="implementation">Implementation</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span>Critical Gaps</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {drStatus?.criticalGaps?.map(
                      (gap: string, index: number) => (
                        <div key={index} className="flex items-start space-x-2">
                          <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{gap}</span>
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-yellow-600" />
                    <span>Immediate Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {drStatus?.immediateActions
                      ?.slice(0, 6)
                      .map((action: string, index: number) => (
                        <div key={index} className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{action}</span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Components Status */}
            <Card>
              <CardHeader>
                <CardTitle>System Components Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {drStatus?.drComponents &&
                    Object.entries(drStatus.drComponents).map(
                      ([key, component]: [string, any]) => (
                        <div key={key} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm capitalize">
                              {key.replace(/([A-Z])/g, " $1").trim()}
                            </span>
                            {getStatusBadge(component.status)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Completeness: {component.completeness || 0}%
                          </div>
                        </div>
                      ),
                    )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backups" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Backup Status</CardTitle>
                  <CardDescription>
                    Current backup system status and recent activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {backupStatus ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {backupStatus.currentBackups?.completed || 0}
                          </div>
                          <div className="text-sm text-gray-500">Completed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">
                            {backupStatus.currentBackups?.failed || 0}
                          </div>
                          <div className="text-sm text-gray-500">Failed</div>
                        </div>
                      </div>

                      {backupStatus.lastBackup && (
                        <div className="border-t pt-4">
                          <h4 className="font-medium mb-2">Last Backup</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Type:</span>
                              <span className="capitalize">
                                {backupStatus.lastBackup.type}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Status:</span>
                              {getStatusBadge(backupStatus.lastBackup.status)}
                            </div>
                            <div className="flex justify-between">
                              <span>Duration:</span>
                              <span>{backupStatus.lastBackup.duration}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Size:</span>
                              <span>{backupStatus.lastBackup.dataSize}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <HardDrive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        No backup system configured
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Backup Actions</CardTitle>
                  <CardDescription>
                    Manual backup operations and testing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={() => triggerBackup("full")}
                    disabled={loading}
                    className="w-full"
                  >
                    <HardDrive className="h-4 w-4 mr-2" />
                    Trigger Full Backup
                  </Button>

                  <Button
                    onClick={() => triggerBackup("incremental")}
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Trigger Incremental Backup
                  </Button>

                  <Button disabled={true} variant="outline" className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Test Backup Restoration
                    <span className="ml-2 text-xs">(Not Available)</span>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="disaster-recovery" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>DR Test Results</CardTitle>
                  <CardDescription>
                    Disaster recovery testing history and results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {drStatus?.lastDrTest?.date ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Last Test:</span>
                        <span>{drStatus.lastDrTest.date}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Type:</span>
                        <span className="capitalize">
                          {drStatus.lastDrTest.type}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <span className="font-medium">Issues:</span>
                        {drStatus.lastDrTest.issues.map(
                          (issue: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-start space-x-2"
                            >
                              <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{issue}</span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        No DR tests have been conducted
                      </p>
                      <Button
                        onClick={initiateDRTest}
                        disabled={loading}
                        className="mt-4"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Initiate DR Test
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>RTO/RPO Targets</CardTitle>
                  <CardDescription>
                    Recovery time and point objectives
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">
                          Recovery Time Objective (RTO)
                        </div>
                        <div className="text-sm text-gray-500">
                          Maximum acceptable downtime
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">
                          {drStatus?.rtoRpoTargets?.rto?.target}
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800">
                          {drStatus?.rtoRpoTargets?.rto?.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">
                          Recovery Point Objective (RPO)
                        </div>
                        <div className="text-sm text-gray-500">
                          Maximum acceptable data loss
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">
                          {drStatus?.rtoRpoTargets?.rpo?.target}
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800">
                          {drStatus?.rtoRpoTargets?.rpo?.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="implementation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Implementation Roadmap</CardTitle>
                <CardDescription>
                  Step-by-step plan to implement backup and disaster recovery
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    {
                      phase: "Phase 1: Critical Backup Implementation",
                      duration: "2-3 weeks",
                      priority: "CRITICAL",
                      tasks: [
                        "Set up automated daily backups to AWS S3",
                        "Configure incremental backups every 4 hours",
                        "Implement backup monitoring and alerting",
                        "Set up backup encryption and compression",
                      ],
                      effort: "60 hours",
                    },
                    {
                      phase: "Phase 2: Disaster Recovery Setup",
                      duration: "3-4 weeks",
                      priority: "HIGH",
                      tasks: [
                        "Develop comprehensive disaster recovery plan",
                        "Set up database replication to secondary region",
                        "Configure automated failover systems",
                        "Implement DR testing procedures",
                      ],
                      effort: "80 hours",
                    },
                    {
                      phase: "Phase 3: Business Continuity Planning",
                      duration: "2-3 weeks",
                      priority: "MEDIUM",
                      tasks: [
                        "Create business continuity plan document",
                        "Conduct business impact analysis",
                        "Establish alternative operation procedures",
                        "Set up emergency communication systems",
                      ],
                      effort: "40 hours",
                    },
                    {
                      phase: "Phase 4: Testing and Optimization",
                      duration: "2-3 weeks",
                      priority: "MEDIUM",
                      tasks: [
                        "Conduct comprehensive DR testing",
                        "Perform backup restoration tests",
                        "Optimize backup and recovery performance",
                        "Document all procedures and test results",
                      ],
                      effort: "50 hours",
                    },
                  ].map((phase, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-lg">{phase.phase}</h3>
                        <div className="flex items-center space-x-2">
                          <Badge
                            className={`${
                              phase.priority === "CRITICAL"
                                ? "bg-red-100 text-red-800"
                                : phase.priority === "HIGH"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {phase.priority}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {phase.duration}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-3">
                        {phase.tasks.map((task, taskIndex) => (
                          <div
                            key={taskIndex}
                            className="flex items-start space-x-2"
                          >
                            <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{task}</span>
                          </div>
                        ))}
                      </div>

                      <div className="text-sm text-gray-600">
                        <strong>Estimated Effort:</strong> {phase.effort}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BackupRecoveryDashboard;
