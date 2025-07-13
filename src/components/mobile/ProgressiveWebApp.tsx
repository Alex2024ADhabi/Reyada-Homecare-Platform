/**
 * Progressive Web App Component
 * P5-001: PWA Implementation (32h)
 *
 * Provides PWA functionality including offline support, app installation,
 * push notifications, and mobile-optimized experience.
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Smartphone,
  Download,
  Wifi,
  WifiOff,
  Bell,
  BellOff,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Settings,
  Battery,
  Signal,
  Globe,
  RefreshCw,
  Database,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface PWACapabilities {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  hasNotificationPermission: boolean;
  hasCameraAccess: boolean;
  hasLocationAccess: boolean;
  supportsServiceWorker: boolean;
  supportsIndexedDB: boolean;
  supportsPushNotifications: boolean;
  batteryLevel?: number;
  connectionType?: string;
}

export interface OfflineData {
  cachedPages: number;
  cachedAssets: number;
  offlineStorage: number;
  maxStorage: number;
  lastSync: string;
  pendingSync: number;
  syncErrors: number;
}

export interface NotificationSettings {
  enabled: boolean;
  types: {
    appointments: boolean;
    reminders: boolean;
    alerts: boolean;
    updates: boolean;
  };
  frequency: "immediate" | "hourly" | "daily";
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export interface ProgressiveWebAppProps {
  capabilities?: PWACapabilities;
  offlineData?: OfflineData;
  notificationSettings?: NotificationSettings;
  onInstallApp?: () => Promise<void>;
  onEnableNotifications?: () => Promise<boolean>;
  onUpdateNotificationSettings?: (
    settings: NotificationSettings,
  ) => Promise<void>;
  onSyncData?: () => Promise<void>;
  onClearCache?: () => Promise<void>;
  className?: string;
}

const ProgressiveWebApp: React.FC<ProgressiveWebAppProps> = ({
  capabilities = {
    isInstallable: true,
    isInstalled: false,
    isOnline: true,
    hasNotificationPermission: false,
    hasCameraAccess: true,
    hasLocationAccess: false,
    supportsServiceWorker: true,
    supportsIndexedDB: true,
    supportsPushNotifications: true,
    batteryLevel: 85,
    connectionType: "4g",
  },
  offlineData = {
    cachedPages: 24,
    cachedAssets: 156,
    offlineStorage: 45.2,
    maxStorage: 100,
    lastSync: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    pendingSync: 3,
    syncErrors: 0,
  },
  notificationSettings = {
    enabled: false,
    types: {
      appointments: true,
      reminders: true,
      alerts: true,
      updates: false,
    },
    frequency: "immediate",
    quietHours: {
      enabled: true,
      start: "22:00",
      end: "07:00",
    },
  },
  onInstallApp,
  onEnableNotifications,
  onUpdateNotificationSettings,
  onSyncData,
  onClearCache,
  className,
}) => {
  const [isInstalling, setIsInstalling] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [localNotificationSettings, setLocalNotificationSettings] =
    useState(notificationSettings);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      console.log("App is online");
    };

    const handleOffline = () => {
      console.log("App is offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleInstallApp = async () => {
    setIsInstalling(true);
    try {
      await onInstallApp?.();
    } finally {
      setIsInstalling(false);
    }
  };

  const handleEnableNotifications = async () => {
    const granted = await onEnableNotifications?.();
    if (granted) {
      setLocalNotificationSettings((prev) => ({ ...prev, enabled: true }));
    }
  };

  const handleSyncData = async () => {
    setIsSyncing(true);
    try {
      await onSyncData?.();
    } finally {
      setIsSyncing(false);
    }
  };

  const updateNotificationSetting = async (key: string, value: any) => {
    const newSettings = { ...localNotificationSettings, [key]: value };
    setLocalNotificationSettings(newSettings);
    await onUpdateNotificationSettings?.(newSettings);
  };

  const updateNotificationType = async (type: string, enabled: boolean) => {
    const newSettings = {
      ...localNotificationSettings,
      types: { ...localNotificationSettings.types, [type]: enabled },
    };
    setLocalNotificationSettings(newSettings);
    await onUpdateNotificationSettings?.(newSettings);
  };

  const getConnectionIcon = () => {
    if (!capabilities.isOnline)
      return <WifiOff className="h-5 w-5 text-red-600" />;
    switch (capabilities.connectionType) {
      case "4g":
      case "5g":
        return <Signal className="h-5 w-5 text-green-600" />;
      case "wifi":
        return <Wifi className="h-5 w-5 text-blue-600" />;
      default:
        return <Globe className="h-5 w-5 text-gray-600" />;
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return "text-green-600";
    if (level > 20) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className={cn("space-y-6 bg-white p-6", className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-6 w-6 text-blue-600" />
              Progressive Web App
            </CardTitle>
            <div className="flex items-center gap-4">
              {/* Connection Status */}
              <div className="flex items-center gap-2">
                {getConnectionIcon()}
                <span className="text-sm text-gray-600">
                  {capabilities.isOnline ? "Online" : "Offline"}
                </span>
              </div>

              {/* Battery Status */}
              {capabilities.batteryLevel && (
                <div className="flex items-center gap-2">
                  <Battery
                    className={cn(
                      "h-5 w-5",
                      getBatteryColor(capabilities.batteryLevel),
                    )}
                  />
                  <span className="text-sm text-gray-600">
                    {capabilities.batteryLevel}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Offline Alert */}
      {!capabilities.isOnline && (
        <Alert>
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                You're currently offline. Some features may be limited, but you
                can still access cached content.
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSyncData}
                disabled={isSyncing}
                className="flex items-center gap-2"
              >
                {isSyncing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Sync When Online
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Installation */}
      {capabilities.isInstallable && !capabilities.isInstalled && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-2">
                  Install Reyada Homecare App
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Install the app on your device for faster access, offline
                  functionality, and push notifications.
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Offline Access
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Push Notifications
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Native Experience
                  </div>
                </div>
              </div>
              <Button
                onClick={handleInstallApp}
                disabled={isInstalling}
                className="flex items-center gap-2"
              >
                {isInstalling ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {isInstalling ? "Installing..." : "Install App"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PWA Capabilities */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Service Worker</span>
              {capabilities.supportsServiceWorker ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
            </div>
            <p className="text-xs text-gray-600">
              {capabilities.supportsServiceWorker ? "Enabled" : "Not Supported"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Offline Storage</span>
              {capabilities.supportsIndexedDB ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
            </div>
            <p className="text-xs text-gray-600">
              {capabilities.supportsIndexedDB ? "Available" : "Not Supported"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Push Notifications</span>
              {capabilities.supportsPushNotifications ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
            </div>
            <p className="text-xs text-gray-600">
              {capabilities.supportsPushNotifications
                ? "Supported"
                : "Not Available"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Camera Access</span>
              {capabilities.hasCameraAccess ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
            </div>
            <p className="text-xs text-gray-600">
              {capabilities.hasCameraAccess ? "Granted" : "Not Granted"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Location Access</span>
              {capabilities.hasLocationAccess ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
            </div>
            <p className="text-xs text-gray-600">
              {capabilities.hasLocationAccess ? "Granted" : "Not Granted"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">App Installation</span>
              {capabilities.isInstalled ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : capabilities.isInstallable ? (
                <Download className="h-4 w-4 text-blue-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
            </div>
            <p className="text-xs text-gray-600">
              {capabilities.isInstalled
                ? "Installed"
                : capabilities.isInstallable
                  ? "Available"
                  : "Not Available"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Offline Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Offline Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Storage Usage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Storage Usage</span>
              <span className="text-sm text-gray-600">
                {offlineData.offlineStorage.toFixed(1)} MB /{" "}
                {offlineData.maxStorage} MB
              </span>
            </div>
            <Progress
              value={
                (offlineData.offlineStorage / offlineData.maxStorage) * 100
              }
              className="h-2"
            />
          </div>

          {/* Cache Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 border rounded-lg">
              <div className="text-xl font-bold text-blue-600">
                {offlineData.cachedPages}
              </div>
              <div className="text-xs text-gray-600">Cached Pages</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-xl font-bold text-green-600">
                {offlineData.cachedAssets}
              </div>
              <div className="text-xs text-gray-600">Cached Assets</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-xl font-bold text-yellow-600">
                {offlineData.pendingSync}
              </div>
              <div className="text-xs text-gray-600">Pending Sync</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-xl font-bold text-red-600">
                {offlineData.syncErrors}
              </div>
              <div className="text-xs text-gray-600">Sync Errors</div>
            </div>
          </div>

          {/* Sync Status */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="text-sm font-medium">Last Sync</div>
              <div className="text-xs text-gray-600">
                {new Date(offlineData.lastSync).toLocaleString()}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSyncData}
                disabled={isSyncing || !capabilities.isOnline}
                className="flex items-center gap-2"
              >
                {isSyncing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Sync Now
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onClearCache}
                className="flex items-center gap-2"
              >
                <Database className="h-4 w-4" />
                Clear Cache
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Enable Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Push Notifications</div>
              <div className="text-sm text-gray-600">
                Receive important updates and reminders
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!capabilities.hasNotificationPermission && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEnableNotifications}
                  className="flex items-center gap-2"
                >
                  <Bell className="h-4 w-4" />
                  Enable
                </Button>
              )}
              <Switch
                checked={
                  localNotificationSettings.enabled &&
                  capabilities.hasNotificationPermission
                }
                onCheckedChange={(checked) =>
                  updateNotificationSetting("enabled", checked)
                }
                disabled={!capabilities.hasNotificationPermission}
              />
            </div>
          </div>

          {/* Notification Types */}
          {localNotificationSettings.enabled &&
            capabilities.hasNotificationPermission && (
              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-medium">Notification Types</h4>
                {Object.entries(localNotificationSettings.types).map(
                  ([type, enabled]) => (
                    <div
                      key={type}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm capitalize">
                        {type.replace("_", " ")}
                      </span>
                      <Switch
                        checked={enabled}
                        onCheckedChange={(checked) =>
                          updateNotificationType(type, checked)
                        }
                      />
                    </div>
                  ),
                )}
              </div>
            )}

          {/* Quiet Hours */}
          {localNotificationSettings.enabled &&
            capabilities.hasNotificationPermission && (
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Quiet Hours</div>
                    <div className="text-sm text-gray-600">
                      {localNotificationSettings.quietHours.start} -{" "}
                      {localNotificationSettings.quietHours.end}
                    </div>
                  </div>
                  <Switch
                    checked={localNotificationSettings.quietHours.enabled}
                    onCheckedChange={(checked) =>
                      updateNotificationSetting("quietHours", {
                        ...localNotificationSettings.quietHours,
                        enabled: checked,
                      })
                    }
                  />
                </div>
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressiveWebApp;
