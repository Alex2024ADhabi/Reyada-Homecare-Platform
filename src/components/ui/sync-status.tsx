import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Database,
  Upload,
  Download,
  Pause,
  Play,
  Settings,
} from "lucide-react";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { useToastContext } from "@/components/ui/toast-provider";

interface SyncStatusProps {
  className?: string;
  showDetails?: boolean;
  compact?: boolean;
}

export function SyncStatus({
  className = "",
  showDetails = true,
  compact = false,
}: SyncStatusProps) {
  const { isOnline, isSyncing, pendingItems, syncPendingData } =
    useOfflineSync();

  const { toast } = useToastContext();
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncErrors, setSyncErrors] = useState<string[]>([]);
  const [autoRefreshCw, setAutoSync] = useState(true);
  const [syncInterval, setSyncInterval] = useState<NodeJS.Timeout | null>(null);

  // Calculate total pending items
  const totalPendingItems = Object.values(pendingItems).reduce(
    (sum, count) => sum + count,
    0,
  );

  // Auto-sync when online
  useEffect(() => {
    if (autoSync && isOnline && totalPendingItems > 0 && !isSyncing) {
      const interval = setInterval(() => {
        handleSync();
      }, 30000); // Sync every 30 seconds

      setSyncInterval(interval);

      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [autoRefreshCw, isOnline, totalPendingItems, isSyncing]);

  // Handle manual sync
  const handleSync = async () => {
    if (!isOnline) {
      toast({
        title: "Sync Failed",
        description:
          "Device is offline. Sync will resume when connection is restored.",
        variant: "warning",
      });
      return;
    }

    try {
      setSyncProgress(0);
      setSyncErrors([]);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setSyncProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      await syncPendingData();

      clearInterval(progressInterval);
      setSyncProgress(100);
      setLastSyncTime(new Date());

      toast({
        title: "Sync Complete",
        description: `Successfully synchronized ${totalPendingItems} items`,
        variant: "success",
      });

      // Reset progress after a delay
      setTimeout(() => setSyncProgress(0), 2000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Sync failed";
      setSyncErrors((prev) => [...prev, errorMessage]);

      toast({
        title: "Sync Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Toggle auto-sync
  const toggleAutoSync = () => {
    setAutoSync((prev) => !prev);

    if (syncInterval) {
      clearInterval(syncInterval);
      setSyncInterval(null);
    }

    toast({
      title: autoSync ? "Auto-sync Disabled" : "Auto-sync Enabled",
      description: autoSync
        ? "Manual sync required for pending changes"
        : "Changes will sync automatically when online",
      variant: "success",
    });
  };

  // Get sync status info
  const getSyncStatus = () => {
    if (!isOnline) {
      return {
        status: "offline",
        color: "text-red-600",
        bgColor: "bg-red-100",
        icon: WifiOff,
        message: "Offline - Changes saved locally",
      };
    }

    if (isSyncing) {
      return {
        status: "syncing",
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        icon: RefreshCw,
        message: "Synchronizing data...",
      };
    }

    if (totalPendingItems > 0) {
      return {
        status: "pending",
        color: "text-orange-600",
        bgColor: "bg-orange-100",
        icon: Clock,
        message: `${totalPendingItems} items pending sync`,
      };
    }

    if (syncErrors.length > 0) {
      return {
        status: "error",
        color: "text-red-600",
        bgColor: "bg-red-100",
        icon: XCircle,
        message: `${syncErrors.length} sync errors`,
      };
    }

    return {
      status: "synced",
      color: "text-green-600",
      bgColor: "bg-green-100",
      icon: CheckCircle,
      message: "All data synchronized",
    };
  };

  const statusInfo = getSyncStatus();
  const StatusIcon = statusInfo.icon;

  // Compact view for mobile/small spaces
  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className={`p-2 rounded-full ${statusInfo.bgColor}`}>
          <StatusIcon
            className={`h-4 w-4 ${statusInfo.color} ${isSyncing ? "animate-spin" : ""}`}
          />
        </div>

        {totalPendingItems > 0 && (
          <Badge variant="outline" className="text-xs">
            {totalPendingItems}
          </Badge>
        )}

        {isOnline && totalPendingItems > 0 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSync}
            disabled={isSyncing}
            className="h-8 w-8 p-0"
          >
            <RefreshCw
              className={`h-3 w-3 ${isSyncing ? "animate-spin" : ""}`}
            />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center">
            <StatusIcon
              className={`h-5 w-5 mr-2 ${statusInfo.color} ${isSyncing ? "animate-spin" : ""}`}
            />
            Sync Status
          </span>

          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleAutoSync}
              className="h-8 px-2"
            >
              {autoSync ? (
                <Pause className="h-3 w-3" />
              ) : (
                <Play className="h-3 w-3" />
              )}
            </Button>

            {isOnline && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSync}
                disabled={isSyncing}
                className="h-8 px-2"
              >
                <RefreshCw
                  className={`h-3 w-3 ${isSyncing ? "animate-spin" : ""}`}
                />
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Message */}
        <div className={`p-3 rounded-lg ${statusInfo.bgColor}`}>
          <p className={`text-sm font-medium ${statusInfo.color}`}>
            {statusInfo.message}
          </p>

          {lastSyncTime && (
            <p className="text-xs text-gray-600 mt-1">
              Last sync: {lastSyncTime.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Sync Progress */}
        {isSyncing && syncProgress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Synchronizing...</span>
              <span>{syncProgress}%</span>
            </div>
            <Progress value={syncProgress} className="h-2" />
          </div>
        )}

        {/* Pending Items Breakdown */}
        {showDetails && totalPendingItems > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center">
              <Database className="h-4 w-4 mr-1" />
              Pending Items ({totalPendingItems})
            </h4>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(pendingItems).map(([key, count]) => {
                if (count === 0) return null;

                return (
                  <div
                    key={key}
                    className="flex justify-between p-2 bg-gray-50 rounded"
                  >
                    <span className="capitalize">
                      {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                    </span>
                    <Badge variant="secondary" className="h-4 text-xs">
                      {count}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Sync Errors */}
        {syncErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium">Sync Errors:</p>
                {syncErrors.slice(-3).map((error, index) => (
                  <p key={index} className="text-xs">
                    • {error}
                  </p>
                ))}
                {syncErrors.length > 3 && (
                  <p className="text-xs text-gray-600">
                    ... and {syncErrors.length - 3} more
                  </p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Auto-sync Status */}
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span className="flex items-center">
            <Settings className="h-3 w-3 mr-1" />
            Auto-sync: {autoSync ? "Enabled" : "Disabled"}
          </span>

          <span className="flex items-center">
            {isOnline ? (
              <>
                <Wifi className="h-3 w-3 mr-1" />
                Online
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 mr-1" />
                Offline
              </>
            )}
          </span>
        </div>

        {/* Manual Sync Button */}
        {!autoSync && totalPendingItems > 0 && isOnline && (
          <Button
            onClick={handleSync}
            disabled={isSyncing}
            className="w-full"
            size="sm"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isSyncing ? "Syncing..." : `Sync ${totalPendingItems} Items`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default SyncStatus;
