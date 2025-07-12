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
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Database,
  Shield,
  Clock,
  HardDrive,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Upload,
  Server,
  Activity,
  FileText,
  Settings,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";
import { backupRecoveryService } from "@/services/backup-recovery.service";

interface BackupStatus {
  activeJobs: number;
  completedToday: number;
  failedToday: number;
  nextScheduled: string;
  totalStorage: number;
}

interface DRStatus {
  plansTotal: number;
  plansReady: number;
  lastTestDate: string;
  nextTestDate: string;
  averageRTO: number;
  averageRPO: number;
}

interface ReplicationStatus {
  configurationsTotal: number;
  configurationsHealthy: number;
  averageLag: number;
  lastError: string;
}

interface BusinessContinuityDoc {
  executiveSummary: string;
  riskAssessment: any;
  recoveryStrategies: any;
  roles: any;
  procedures: any;
  testing: any;
  maintenance: any;
}

export default function BackupRecoveryDashboard() {
  const [backupStatus, setBackupStatus] = useState<BackupStatus>({
    activeJobs: 0,
    completedToday: 0,
    failedToday: 0,
    nextScheduled: "",
    totalStorage: 0,
  });

  const [drStatus, setDRStatus] = useState<DRStatus>({
    plansTotal: 0,
    plansReady: 0,
    lastTestDate: "",
    nextTestDate: "",
    averageRTO: 0,
    averageRPO: 0,
  });

  const [replicationStatus, setReplicationStatus] = useState<ReplicationStatus>(
    {
      configurationsTotal: 0,
      configurationsHealthy: 0,
      averageLag: 0,
      lastError: "",
    },
  );

  const [businessContinuityDoc, setBusinessContinuityDoc] =
    useState<BusinessContinuityDoc | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Initialize backup recovery service
      await backupRecoveryService.initialize();

      // Load status data
      const backup = backupRecoveryService.getBackupStatus();
      const dr = backupRecoveryService.getDRStatus();
      const replication = backupRecoveryService.getReplicationStatus();
      const bcDoc =
        backupRecoveryService.generateBusinessContinuityDocumentation();

      setBackupStatus(backup);
      setDRStatus(dr);
      setReplicationStatus(replication);
      setBusinessContinuityDoc(bcDoc);
    } catch (error) {
      console.error("Failed to load backup recovery dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunFullBackup = async () => {
    try {
      setIsLoading(true);
      await backupRecoveryService.executeBackup("daily-full-backup");
      await loadDashboardData();
    } catch (error) {
      console.error("Failed to run full backup:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunIncrementalBackup = async () => {
    try {
      setIsLoading(true);
      await backupRecoveryService.executeBackup("incremental-backup");
      await loadDashboardData();
    } catch (error) {
      console.error("Failed to run incremental backup:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestDRPlan = async (planId: string) => {
    try {
      setIsLoading(true);
      await backupRecoveryService.executeDRTest(planId, "partial");
      await loadDashboardData();
    } catch (error) {
      console.error("Failed to test DR plan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  if (isLoading && !backupStatus.activeJobs) {
    return (
      <div className="flex items-center justify-center h-96 bg-white">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">
            Loading backup and recovery dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Backup & Recovery Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Comprehensive backup management, disaster recovery testing, and
            business continuity planning
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={handleRunIncrementalBackup}
            variant="outline"
            disabled={isLoading}
          >
            <Upload className="h-4 w-4 mr-2" />
            Run Incremental Backup
          </Button>
          <Button onClick={handleRunFullBackup} disabled={isLoading}>
            <Database className="h-4 w-4 mr-2" />
            Run Full Backup
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="backups">Backups</TabsTrigger>
          <TabsTrigger value="disaster-recovery">Disaster Recovery</TabsTrigger>
          <TabsTrigger value="replication">Replication</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* System Health Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Backup Jobs
                </CardTitle>
                <Activity className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {backupStatus.activeJobs}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {backupStatus.completedToday} completed today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  DR Readiness
                </CardTitle>
                <Shield className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {drStatus.plansTotal > 0
                    ? Math.round(
                        (drStatus.plansReady / drStatus.plansTotal) * 100,
                      )
                    : 0}
                  %
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {drStatus.plansReady} of {drStatus.plansTotal} plans ready
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Replication Health
                </CardTitle>
                <Server className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {replicationStatus.configurationsTotal > 0
                    ? Math.round(
                        (replicationStatus.configurationsHealthy /
                          replicationStatus.configurationsTotal) *
                          100,
                      )
                    : 0}
                  %
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Avg lag: {replicationStatus.averageLag.toFixed(1)}s
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Storage Used
                </CardTitle>
                <HardDrive className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatBytes(backupStatus.totalStorage)}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Next backup: {formatDate(backupStatus.nextScheduled)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Status Alerts */}
          <div className="space-y-4">
            {backupStatus.failedToday > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Backup Failures Detected</AlertTitle>
                <AlertDescription>
                  {backupStatus.failedToday} backup job(s) failed today. Please
                  review the backup logs and take corrective action.
                </AlertDescription>
              </Alert>
            )}

            {replicationStatus.lastError && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Replication Error</AlertTitle>
                <AlertDescription>
                  Latest replication error: {replicationStatus.lastError}
                </AlertDescription>
              </Alert>
            )}

            {drStatus.plansReady < drStatus.plansTotal && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>DR Plans Need Testing</AlertTitle>
                <AlertDescription>
                  {drStatus.plansTotal - drStatus.plansReady} disaster recovery
                  plan(s) require testing to ensure readiness.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </TabsContent>

        <TabsContent value="backups" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Backup Status
                </CardTitle>
                <CardDescription>
                  Current backup job status and recent activity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Active Jobs</span>
                  <Badge
                    variant={
                      backupStatus.activeJobs > 0 ? "default" : "secondary"
                    }
                  >
                    {backupStatus.activeJobs}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Completed Today</span>
                  <Badge variant="outline">{backupStatus.completedToday}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Failed Today</span>
                  <Badge
                    variant={
                      backupStatus.failedToday > 0 ? "destructive" : "outline"
                    }
                  >
                    {backupStatus.failedToday}
                  </Badge>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Next Scheduled Backup</span>
                    <span className="text-gray-600">
                      {formatDate(backupStatus.nextScheduled)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Total Storage Used</span>
                    <span className="text-gray-600">
                      {formatBytes(backupStatus.totalStorage)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Backup Configuration
                </CardTitle>
                <CardDescription>
                  Automated backup procedures and retention policies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Full Backup Schedule
                    </span>
                    <Badge variant="outline">Daily at 2:00 AM</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Incremental Backup
                    </span>
                    <Badge variant="outline">Every 6 hours</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Retention Policy
                    </span>
                    <Badge variant="outline">7D/4W/12M/3Y</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Encryption</span>
                    <Badge variant="default">AES-256-GCM</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Compression</span>
                    <Badge variant="default">Level 6</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Manually trigger backup operations and maintenance tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={handleRunFullBackup}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Run Full Backup
                </Button>
                <Button
                  onClick={handleRunIncrementalBackup}
                  variant="outline"
                  disabled={isLoading}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Run Incremental Backup
                </Button>
                <Button
                  variant="outline"
                  disabled={isLoading}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Backup Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="disaster-recovery" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  DR Plan Status
                </CardTitle>
                <CardDescription>
                  Disaster recovery plan readiness and testing status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total DR Plans</span>
                    <Badge variant="outline">{drStatus.plansTotal}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Plans Ready</span>
                    <Badge
                      variant={
                        drStatus.plansReady === drStatus.plansTotal
                          ? "default"
                          : "destructive"
                      }
                    >
                      {drStatus.plansReady}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Last Test</span>
                    <span className="text-sm text-gray-600">
                      {formatDate(drStatus.lastTestDate)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Next Test</span>
                    <span className="text-sm text-gray-600">
                      {formatDate(drStatus.nextTestDate)}
                    </span>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Average RTO</span>
                    <span className="text-gray-600">
                      {drStatus.averageRTO.toFixed(1)} hours
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Average RPO</span>
                    <span className="text-gray-600">
                      {drStatus.averageRPO.toFixed(1)} minutes
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Recovery Objectives
                </CardTitle>
                <CardDescription>
                  Recovery time and point objectives for critical systems
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Critical Systems RTO
                      </span>
                      <span className="text-sm text-gray-600">
                        Target: 1 hour
                      </span>
                    </div>
                    <Progress value={85} className="h-2" />
                    <p className="text-xs text-gray-600 mt-1">
                      Current: 51 minutes (85% of target)
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Data Recovery RPO
                      </span>
                      <span className="text-sm text-gray-600">
                        Target: 15 minutes
                      </span>
                    </div>
                    <Progress value={92} className="h-2" />
                    <p className="text-xs text-gray-600 mt-1">
                      Current: 13.8 minutes (92% of target)
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Full System Recovery
                      </span>
                      <span className="text-sm text-gray-600">
                        Target: 4 hours
                      </span>
                    </div>
                    <Progress value={78} className="h-2" />
                    <p className="text-xs text-gray-600 mt-1">
                      Current: 3.1 hours (78% of target)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>DR Testing Actions</CardTitle>
              <CardDescription>
                Execute disaster recovery tests and simulations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={() => handleTestDRPlan("critical-system-recovery")}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Test Critical Systems DR
                </Button>
                <Button
                  onClick={() =>
                    handleTestDRPlan("datacenter-failure-recovery")
                  }
                  variant="outline"
                  disabled={isLoading}
                  className="w-full"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Test Data Center Failover
                </Button>
                <Button
                  variant="outline"
                  disabled={isLoading}
                  className="w-full"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generate DR Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="replication" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Server className="h-5 w-5 mr-2" />
                  Replication Status
                </CardTitle>
                <CardDescription>
                  Real-time data replication and failover system status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Total Configurations
                    </span>
                    <Badge variant="outline">
                      {replicationStatus.configurationsTotal}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Healthy Configurations
                    </span>
                    <Badge
                      variant={
                        replicationStatus.configurationsHealthy ===
                        replicationStatus.configurationsTotal
                          ? "default"
                          : "destructive"
                      }
                    >
                      {replicationStatus.configurationsHealthy}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Average Lag</span>
                    <Badge
                      variant={
                        replicationStatus.averageLag < 10
                          ? "default"
                          : "destructive"
                      }
                    >
                      {replicationStatus.averageLag.toFixed(1)}s
                    </Badge>
                  </div>
                </div>
                <Separator />
                {replicationStatus.lastError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-800 font-medium">
                      Last Error:
                    </p>
                    <p className="text-sm text-red-700 mt-1">
                      {replicationStatus.lastError}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Failover Configuration
                </CardTitle>
                <CardDescription>
                  Automatic failover system configuration and monitoring
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Automatic Failover
                    </span>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Health Check Interval
                    </span>
                    <Badge variant="outline">30 seconds</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Failure Threshold
                    </span>
                    <Badge variant="outline">3 consecutive failures</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Last Failover Test
                    </span>
                    <span className="text-sm text-gray-600">Never</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documentation" className="space-y-6">
          {businessContinuityDoc && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Business Continuity Plan
                  </CardTitle>
                  <CardDescription>
                    Comprehensive business continuity documentation and
                    procedures
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-4 text-sm">
                      <div>
                        <h4 className="font-semibold mb-2">
                          Executive Summary
                        </h4>
                        <p className="text-gray-700 whitespace-pre-line">
                          {businessContinuityDoc.executiveSummary}
                        </p>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-semibold mb-2">Risk Assessment</h4>
                        <div className="space-y-3">
                          <div>
                            <h5 className="font-medium text-red-700">
                              High Risk Items
                            </h5>
                            <ul className="list-disc list-inside space-y-1 mt-1">
                              {businessContinuityDoc.riskAssessment.highRisk.map(
                                (risk: any, index: number) => (
                                  <li key={index} className="text-gray-700">
                                    <strong>{risk.risk}:</strong> {risk.impact}{" "}
                                    - {risk.mitigation}
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-medium text-yellow-700">
                              Medium Risk Items
                            </h5>
                            <ul className="list-disc list-inside space-y-1 mt-1">
                              {businessContinuityDoc.riskAssessment.mediumRisk.map(
                                (risk: any, index: number) => (
                                  <li key={index} className="text-gray-700">
                                    <strong>{risk.risk}:</strong> {risk.impact}{" "}
                                    - {risk.mitigation}
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-semibold mb-2">
                          Recovery Strategies
                        </h4>
                        <div className="space-y-3">
                          {Object.entries(
                            businessContinuityDoc.recoveryStrategies,
                          ).map(([key, strategy]: [string, any]) => (
                            <div key={key}>
                              <h5 className="font-medium capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()} (
                                {strategy.timeframe})
                              </h5>
                              <ul className="list-disc list-inside space-y-1 mt-1">
                                {strategy.actions.map(
                                  (action: string, index: number) => (
                                    <li key={index} className="text-gray-700">
                                      {action}
                                    </li>
                                  ),
                                )}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
