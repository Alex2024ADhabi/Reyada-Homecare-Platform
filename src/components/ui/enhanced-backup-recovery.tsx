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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Database,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  Download,
  Upload,
  RefreshCw,
  HardDrive,
  Cloud,
  Lock,
} from "lucide-react";

interface BackupStatus {
  id: string;
  type: "full" | "incremental" | "differential";
  status: "running" | "completed" | "failed" | "scheduled";
  progress: number;
  startTime: string;
  endTime?: string;
  size: number;
  location: string;
  encrypted: boolean;
  integrity: string;
}

interface RecoveryPoint {
  id: string;
  timestamp: string;
  type: string;
  size: number;
  location: string;
  verified: boolean;
  retentionExpiry: string;
}

const EnhancedBackupRecovery: React.FC = () => {
  const [backups, setBackups] = useState<BackupStatus[]>([]);
  const [recoveryPoints, setRecoveryPoints] = useState<RecoveryPoint[]>([]);
  const [isBackupRunning, setIsBackupRunning] = useState(false);
  const [lastBackup, setLastBackup] = useState<Date | null>(null);
  const [storageUsage, setStorageUsage] = useState({
    used: 0,
    total: 0,
    percentage: 0,
  });
  const [systemHealth, setSystemHealth] = useState<
    "healthy" | "warning" | "critical"
  >("healthy");

  useEffect(() => {
    // Initialize backup data
    const mockBackups: BackupStatus[] = [
      {
        id: "backup-001",
        type: "full",
        status: "completed",
        progress: 100,
        startTime: new Date(Date.now() - 3600000).toISOString(),
        endTime: new Date(Date.now() - 3000000).toISOString(),
        size: 2.5 * 1024 * 1024 * 1024, // 2.5GB
        location: "s3://reyada-backups/full/2024-01-15",
        encrypted: true,
        integrity: "verified",
      },
      {
        id: "backup-002",
        type: "incremental",
        status: "running",
        progress: 65,
        startTime: new Date(Date.now() - 1800000).toISOString(),
        size: 150 * 1024 * 1024, // 150MB
        location: "s3://reyada-backups/incremental/2024-01-15",
        encrypted: true,
        integrity: "pending",
      },
    ];

    const mockRecoveryPoints: RecoveryPoint[] = [
      {
        id: "rp-001",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        type: "Daily Full Backup",
        size: 2.5 * 1024 * 1024 * 1024,
        location: "Primary Storage",
        verified: true,
        retentionExpiry: new Date(Date.now() + 30 * 86400000).toISOString(),
      },
      {
        id: "rp-002",
        timestamp: new Date(Date.now() - 43200000).toISOString(),
        type: "Incremental Backup",
        size: 150 * 1024 * 1024,
        location: "Secondary Storage",
        verified: true,
        retentionExpiry: new Date(Date.now() + 7 * 86400000).toISOString(),
      },
    ];

    setBackups(mockBackups);
    setRecoveryPoints(mockRecoveryPoints);
    setLastBackup(new Date(Date.now() - 3000000));
    setStorageUsage({
      used: 15.7,
      total: 50,
      percentage: 31.4,
    });

    // Simulate backup progress
    const runningBackup = mockBackups.find((b) => b.status === "running");
    if (runningBackup) {
      setIsBackupRunning(true);
      const interval = setInterval(() => {
        setBackups((prev) =>
          prev.map((backup) => {
            if (backup.id === runningBackup.id && backup.progress < 100) {
              return { ...backup, progress: backup.progress + 5 };
            }
            return backup;
          }),
        );
      }, 2000);

      return () => clearInterval(interval);
    }
  }, []);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "running":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "scheduled":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "critical":
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Database className="h-5 w-5 text-gray-600" />;
    }
  };

  const initiateBackup = (type: "full" | "incremental" | "differential") => {
    const newBackup: BackupStatus = {
      id: `backup-${Date.now()}`,
      type,
      status: "running",
      progress: 0,
      startTime: new Date().toISOString(),
      size: 0,
      location: `s3://reyada-backups/${type}/${new Date().toISOString().split("T")[0]}`,
      encrypted: true,
      integrity: "pending",
    };

    setBackups((prev) => [newBackup, ...prev]);
    setIsBackupRunning(true);
  };

  const initiateRecovery = (recoveryPointId: string) => {
    console.log(`Initiating recovery from point: ${recoveryPointId}`);
    // Implementation would trigger actual recovery process
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Enhanced Backup & Recovery
            </h1>
            <p className="text-gray-600 mt-1">
              Comprehensive data protection and disaster recovery management
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {getHealthIcon(systemHealth)}
              <span className="font-medium text-gray-700">
                System {systemHealth.toUpperCase()}
              </span>
            </div>
            <Button
              onClick={() => initiateBackup("incremental")}
              disabled={isBackupRunning}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="h-4 w-4 mr-2" />
              Start Backup
            </Button>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Backup</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {lastBackup
                  ? new Date(lastBackup).toLocaleDateString()
                  : "Never"}
              </div>
              <p className="text-xs text-muted-foreground">
                {lastBackup
                  ? `${Math.floor((Date.now() - lastBackup.getTime()) / 3600000)} hours ago`
                  : "No backups found"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Storage Usage
              </CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{storageUsage.used} GB</div>
              <Progress value={storageUsage.percentage} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {storageUsage.percentage}% of {storageUsage.total} GB used
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Recovery Points
              </CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recoveryPoints.length}</div>
              <p className="text-xs text-muted-foreground">
                Available for restore
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Encryption</CardTitle>
              <Lock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">AES-256</div>
              <p className="text-xs text-muted-foreground">
                All backups encrypted
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="backups" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="backups">Active Backups</TabsTrigger>
            <TabsTrigger value="recovery">Recovery Points</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="backups" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Backup Operations</CardTitle>
                <CardDescription>
                  Monitor and manage ongoing backup operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {backups.map((backup) => (
                    <div
                      key={backup.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {backup.status === "running" ? (
                            <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                          ) : backup.status === "completed" ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          )}
                          <Badge className={getStatusColor(backup.status)}>
                            {backup.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div>
                          <p className="font-medium">
                            {backup.type.charAt(0).toUpperCase() +
                              backup.type.slice(1)}{" "}
                            Backup
                          </p>
                          <p className="text-sm text-gray-600">
                            Started:{" "}
                            {new Date(backup.startTime).toLocaleString()}
                          </p>
                          {backup.endTime && (
                            <p className="text-sm text-gray-600">
                              Completed:{" "}
                              {new Date(backup.endTime).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <Cloud className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium">
                            {formatBytes(backup.size)}
                          </span>
                        </div>
                        {backup.status === "running" && (
                          <div className="mt-2 w-32">
                            <Progress value={backup.progress} />
                            <p className="text-xs text-gray-600 mt-1">
                              {backup.progress}% complete
                            </p>
                          </div>
                        )}
                        {backup.encrypted && (
                          <div className="flex items-center space-x-1 mt-1">
                            <Lock className="h-3 w-3 text-green-600" />
                            <span className="text-xs text-green-600">
                              Encrypted
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recovery" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recovery Points</CardTitle>
                <CardDescription>
                  Available backup points for data recovery
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recoveryPoints.map((point) => (
                    <div
                      key={point.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {point.verified ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          )}
                          <Badge
                            variant={point.verified ? "default" : "secondary"}
                          >
                            {point.verified ? "VERIFIED" : "PENDING"}
                          </Badge>
                        </div>
                        <div>
                          <p className="font-medium">{point.type}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(point.timestamp).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            Expires:{" "}
                            {new Date(
                              point.retentionExpiry,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {formatBytes(point.size)}
                          </p>
                          <p className="text-xs text-gray-600">
                            {point.location}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => initiateRecovery(point.id)}
                          disabled={!point.verified}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Restore
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Backup Schedule</CardTitle>
                <CardDescription>
                  Configure automated backup schedules
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Full Backup</CardTitle>
                        <CardDescription>
                          Complete system backup
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm">
                            <strong>Frequency:</strong> Weekly
                          </p>
                          <p className="text-sm">
                            <strong>Schedule:</strong> Sundays at 2:00 AM
                          </p>
                          <p className="text-sm">
                            <strong>Retention:</strong> 4 weeks
                          </p>
                          <Button size="sm" className="mt-4">
                            Configure
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Incremental Backup
                        </CardTitle>
                        <CardDescription>
                          Changes since last backup
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm">
                            <strong>Frequency:</strong> Daily
                          </p>
                          <p className="text-sm">
                            <strong>Schedule:</strong> Every day at 11:00 PM
                          </p>
                          <p className="text-sm">
                            <strong>Retention:</strong> 2 weeks
                          </p>
                          <Button size="sm" className="mt-4">
                            Configure
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Differential Backup
                        </CardTitle>
                        <CardDescription>
                          Changes since last full backup
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm">
                            <strong>Frequency:</strong> Twice daily
                          </p>
                          <p className="text-sm">
                            <strong>Schedule:</strong> 6:00 AM & 6:00 PM
                          </p>
                          <p className="text-sm">
                            <strong>Retention:</strong> 1 week
                          </p>
                          <Button size="sm" className="mt-4">
                            Configure
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Backup Settings</CardTitle>
                <CardDescription>
                  Configure backup and recovery preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertTitle>Security Settings</AlertTitle>
                    <AlertDescription>
                      All backups are encrypted using AES-256 encryption with
                      rotating keys. Integrity checks are performed
                      automatically.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Storage Locations</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <p className="font-medium">Primary Storage</p>
                            <p className="text-sm text-gray-600">
                              AWS S3 - us-east-1
                            </p>
                          </div>
                          <Badge variant="default">Active</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <p className="font-medium">Secondary Storage</p>
                            <p className="text-sm text-gray-600">
                              AWS S3 - eu-west-1
                            </p>
                          </div>
                          <Badge variant="secondary">Standby</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">
                        Retention Policies
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between p-3 border rounded">
                          <span>Full Backups</span>
                          <span className="font-medium">4 weeks</span>
                        </div>
                        <div className="flex justify-between p-3 border rounded">
                          <span>Incremental Backups</span>
                          <span className="font-medium">2 weeks</span>
                        </div>
                        <div className="flex justify-between p-3 border rounded">
                          <span>Differential Backups</span>
                          <span className="font-medium">1 week</span>
                        </div>
                      </div>
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

export default EnhancedBackupRecovery;
