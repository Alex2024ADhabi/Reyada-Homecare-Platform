// Backup and Recovery Management Component
// P1-008: Backup & Disaster Recovery Implementation

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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { BackupRecoveryService } from "@/api/supabase.api";
import {
  Database,
  Download,
  Upload,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  HardDrive,
  Shield,
} from "lucide-react";

interface BackupRecord {
  id: string;
  backup_type: "full" | "incremental" | "differential";
  backup_status: "in_progress" | "completed" | "failed";
  backup_location: string;
  backup_size?: number;
  checksum?: string;
  created_at: string;
  completed_at?: string;
}

export default function BackupManagement() {
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeBackup, setActiveBackup] = useState<string | null>(null);

  useEffect(() => {
    loadBackups();
    // Refresh every 30 seconds to update backup status
    const interval = setInterval(loadBackups, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadBackups = async () => {
    const result = await BackupRecoveryService.listBackups(20);

    if (result.error) {
      setError(result.error.message);
    } else {
      setBackups(result.data || []);
    }
  };

  const initiateBackup = async (
    backupType: "full" | "incremental" | "differential",
  ) => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    const result = await BackupRecoveryService.initiateBackup(
      backupType,
      "current-user-id",
    );

    if (result.error) {
      setError(result.error.message);
    } else {
      setSuccess(
        `${backupType.charAt(0).toUpperCase() + backupType.slice(1)} backup initiated successfully`,
      );
      setActiveBackup(result.backupId);
      loadBackups();
    }

    setIsLoading(false);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown";
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "in_progress":
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" } =
      {
        completed: "default",
        in_progress: "secondary",
        failed: "destructive",
      };

    return (
      <Badge variant={variants[status] || "secondary"}>
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  const getBackupTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      full: "bg-blue-100 text-blue-800",
      incremental: "bg-green-100 text-green-800",
      differential: "bg-purple-100 text-purple-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="bg-white min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Database className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Backup & Recovery Management
            </h1>
          </div>
          <p className="text-gray-600">
            Manage database backups and disaster recovery for the Reyada
            Homecare Platform.
          </p>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Backup Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Create New Backup
            </CardTitle>
            <CardDescription>
              Choose the type of backup to create. Full backups include all
              data, while incremental and differential backups only include
              changes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <HardDrive className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold">Full Backup</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Complete backup of all database tables and data. Recommended
                    for weekly backups.
                  </p>
                  <Button
                    onClick={() => initiateBackup("full")}
                    disabled={isLoading}
                    className="w-full"
                  >
                    Create Full Backup
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Download className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold">Incremental</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Backup of changes since the last backup. Faster and uses
                    less storage.
                  </p>
                  <Button
                    onClick={() => initiateBackup("incremental")}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full"
                  >
                    Create Incremental
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-purple-600" />
                    <h3 className="font-semibold">Differential</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Backup of changes since the last full backup. Good balance
                    of speed and completeness.
                  </p>
                  <Button
                    onClick={() => initiateBackup("differential")}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full"
                  >
                    Create Differential
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Backup History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Backup History
                </CardTitle>
                <CardDescription>
                  Recent backup operations and their status
                </CardDescription>
              </div>
              <Button
                onClick={loadBackups}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {backups.length === 0 ? (
              <div className="text-center py-8">
                <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  No backups found. Create your first backup above.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {backups.map((backup) => (
                  <div key={backup.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(backup.backup_status)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              Backup #{backup.id.slice(0, 8)}
                            </span>
                            <Badge
                              className={getBackupTypeColor(backup.backup_type)}
                            >
                              {backup.backup_type.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            Created:{" "}
                            {new Date(backup.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(backup.backup_status)}
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Size:</span>
                        <p className="font-medium">
                          {formatFileSize(backup.backup_size)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Location:</span>
                        <p className="font-medium truncate">
                          {backup.backup_location}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Checksum:</span>
                        <p className="font-mono text-xs">
                          {backup.checksum
                            ? backup.checksum.slice(0, 16) + "..."
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Completed:</span>
                        <p className="font-medium">
                          {backup.completed_at
                            ? new Date(backup.completed_at).toLocaleString()
                            : "In Progress"}
                        </p>
                      </div>
                    </div>

                    {backup.backup_status === "in_progress" &&
                      backup.id === activeBackup && (
                        <div className="mt-3">
                          <div className="flex items-center gap-2 mb-2">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span className="text-sm">
                              Backup in progress...
                            </span>
                          </div>
                          <Progress value={65} className="h-2" />
                        </div>
                      )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Separator className="my-8" />

        {/* Recovery Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Disaster Recovery Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Recovery Procedures</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Full backups can be restored independently</li>
                  <li>
                    • Incremental backups require the previous full backup
                  </li>
                  <li>
                    • Differential backups require only the last full backup
                  </li>
                  <li>• All backups are encrypted and checksummed</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Backup Schedule</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Full backup: Weekly (Sundays at 2:00 AM)</li>
                  <li>• Incremental backup: Daily (2:00 AM)</li>
                  <li>• Retention: 30 days for daily, 12 weeks for weekly</li>
                  <li>• Off-site replication: Every 6 hours</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
