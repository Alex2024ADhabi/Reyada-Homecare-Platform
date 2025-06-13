import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  AlertTriangle,
  Bell,
  Wifi,
  WifiOff,
  Mic,
  MicOff,
  Users,
  Settings,
  Shield,
  Clock,
  Signal,
  Smartphone,
  Monitor,
  Activity,
  CheckCircle,
  XCircle,
  Volume2,
  VolumeX,
} from "lucide-react";
import RealtimeChat from "./RealtimeChat";
import EmergencyPanel from "./EmergencyPanel";
import { communicationService } from "@/services/communication.service";
import { mobileCommunicationService } from "@/services/mobile-communication.service";
import { format } from "date-fns";

interface CommunicationHubProps {
  userId: string;
  className?: string;
}

interface NotificationItem {
  id: string;
  type: "message" | "emergency" | "system" | "alert";
  title: string;
  content: string;
  timestamp: string;
  priority: "low" | "medium" | "high" | "critical";
  read: boolean;
  actionRequired?: boolean;
}

const CommunicationHub: React.FC<CommunicationHubProps> = ({
  userId = "user_001",
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState("chat");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [networkStatus, setNetworkStatus] = useState({
    online: true,
    connectionType: "unknown",
    effectiveType: "4g",
  });
  const [voiceStatus, setVoiceStatus] = useState({
    supported: false,
    active: false,
    language: "en-US",
  });
  const [offlineQueueStatus, setOfflineQueueStatus] = useState({
    totalMessages: 0,
    priorityBreakdown: {},
    oldestMessage: undefined,
  });
  const [systemStats, setSystemStats] = useState({
    activeUsers: 0,
    activeEmergencies: 0,
    messagesProcessed: 0,
    systemHealth: "healthy" as "healthy" | "warning" | "critical",
  });
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

  useEffect(() => {
    initializeCommunicationHub();
    const interval = setInterval(updateSystemStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const initializeCommunicationHub = async () => {
    try {
      // Initialize notification channels for the user
      communicationService.setupUserNotificationChannels(userId, [
        {
          type: "push",
          enabled: true,
          priority: "medium",
          settings: {
            push: {
              deviceTokens: ["demo_token_123"],
              sound: true,
              vibration: true,
            },
          },
        },
        {
          type: "sms",
          enabled: true,
          priority: "high",
          settings: {
            sms: {
              phoneNumber: "+1234567890",
              provider: "twilio",
            },
          },
        },
      ]);

      // Add user to default channels
      communicationService.addUserToChannel("general", userId);
      communicationService.addUserToChannel("emergency", userId);
      communicationService.addUserToChannel("clinical", userId);

      // Set emergency contacts
      communicationService.setEmergencyContacts(userId, [
        "supervisor_001",
        "emergency_services",
        "security_team",
      ]);

      // Load initial notifications
      loadNotifications();
      updateSystemStatus();
    } catch (error) {
      console.error("Failed to initialize communication hub:", error);
    }
  };

  const loadNotifications = () => {
    // Simulate loading notifications
    const mockNotifications: NotificationItem[] = [
      {
        id: "notif_001",
        type: "message",
        title: "New Message from Dr. Smith",
        content: "Patient assessment completed for Room 205",
        timestamp: new Date(Date.now() - 300000).toISOString(),
        priority: "medium",
        read: false,
      },
      {
        id: "notif_002",
        type: "system",
        title: "System Maintenance",
        content: "Scheduled maintenance window: 2:00 AM - 4:00 AM",
        timestamp: new Date(Date.now() - 600000).toISOString(),
        priority: "low",
        read: true,
      },
      {
        id: "notif_003",
        type: "alert",
        title: "Medication Reminder",
        content: "Patient in Room 301 - Medication due in 15 minutes",
        timestamp: new Date(Date.now() - 900000).toISOString(),
        priority: "high",
        read: false,
        actionRequired: true,
      },
    ];
    setNotifications(mockNotifications);
  };

  const updateSystemStatus = () => {
    // Update network status
    const networkInfo = mobileCommunicationService.getNetworkStatus();
    setNetworkStatus(networkInfo);

    // Update voice recognition status
    const voiceInfo = mobileCommunicationService.getVoiceRecognitionStatus();
    setVoiceStatus(voiceInfo);

    // Update offline queue status
    const queueInfo = mobileCommunicationService.getOfflineQueueStatus();
    setOfflineQueueStatus(queueInfo);

    // Update system stats
    const activeEmergencies = communicationService.getActiveEmergencyAlerts();
    setSystemStats({
      activeUsers: 12, // Mock data
      activeEmergencies: activeEmergencies.length,
      messagesProcessed: 156, // Mock data
      systemHealth:
        activeEmergencies.length > 0
          ? "warning"
          : networkInfo.online
            ? "healthy"
            : "critical",
    });
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif,
      ),
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getNotificationIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "message":
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case "emergency":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "alert":
        return <Bell className="h-4 w-4 text-orange-500" />;
      case "system":
      default:
        return <Settings className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: NotificationItem["priority"]) => {
    switch (priority) {
      case "critical":
        return "border-l-red-500 bg-red-50";
      case "high":
        return "border-l-orange-500 bg-orange-50";
      case "medium":
        return "border-l-blue-500 bg-blue-50";
      case "low":
      default:
        return "border-l-gray-300 bg-gray-50";
    }
  };

  const getSystemHealthColor = (health: string) => {
    switch (health) {
      case "healthy":
        return "text-green-600 bg-green-100";
      case "warning":
        return "text-yellow-600 bg-yellow-100";
      case "critical":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const unreadNotifications = notifications.filter((n) => !n.read);
  const criticalNotifications = notifications.filter(
    (n) => n.priority === "critical" && !n.read,
  );

  return (
    <div className={`h-full flex flex-col bg-white ${className}`}>
      {/* Header with System Status */}
      <Card className="rounded-b-none border-b">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <span>Communication Hub</span>
            </CardTitle>

            <div className="flex items-center space-x-4">
              {/* Network Status */}
              <div className="flex items-center space-x-2">
                {networkStatus.online ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm text-gray-600">
                  {networkStatus.online ? "Online" : "Offline"}
                </span>
                {networkStatus.effectiveType && (
                  <Badge variant="outline" className="text-xs">
                    {networkStatus.effectiveType.toUpperCase()}
                  </Badge>
                )}
              </div>

              {/* Voice Status */}
              <div className="flex items-center space-x-2">
                {voiceStatus.supported ? (
                  voiceStatus.active ? (
                    <Mic className="h-4 w-4 text-green-500" />
                  ) : (
                    <MicOff className="h-4 w-4 text-gray-400" />
                  )
                ) : (
                  <VolumeX className="h-4 w-4 text-gray-400" />
                )}
                <span className="text-sm text-gray-600">
                  {voiceStatus.supported
                    ? voiceStatus.active
                      ? "Recording"
                      : "Voice Ready"
                    : "Voice N/A"}
                </span>
              </div>

              {/* Offline Queue Status */}
              {offlineQueueStatus.totalMessages > 0 && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <Badge variant="outline" className="text-orange-600">
                    {offlineQueueStatus.totalMessages} Queued
                  </Badge>
                </div>
              )}

              {/* System Health */}
              <Badge
                variant="outline"
                className={getSystemHealthColor(systemStats.systemHealth)}
              >
                <Activity className="h-3 w-3 mr-1" />
                {systemStats.systemHealth.toUpperCase()}
              </Badge>

              {/* Notifications */}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setIsNotificationPanelOpen(!isNotificationPanelOpen)
                }
                className="relative"
              >
                <Bell className="h-4 w-4" />
                {unreadNotifications.length > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {unreadNotifications.length}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* System Stats Bar */}
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{systemStats.activeUsers} Active Users</span>
              </div>
              <div className="flex items-center space-x-1">
                <AlertTriangle className="h-4 w-4" />
                <span>{systemStats.activeEmergencies} Emergencies</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageSquare className="h-4 w-4" />
                <span>{systemStats.messagesProcessed} Messages Today</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Smartphone className="h-4 w-4 text-blue-500" />
              <Monitor className="h-4 w-4 text-green-500" />
              <Shield className="h-4 w-4 text-purple-500" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Primary Communication Interface */}
        <div className="flex-1 flex flex-col">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="h-full"
          >
            <div className="border-b px-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="chat"
                  className="flex items-center space-x-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Chat</span>
                </TabsTrigger>
                <TabsTrigger
                  value="emergency"
                  className="flex items-center space-x-2"
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span>Emergency</span>
                  {systemStats.activeEmergencies > 0 && (
                    <Badge variant="destructive" className="ml-1">
                      {systemStats.activeEmergencies}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="chat" className="flex-1 m-0">
              <RealtimeChat
                userId={userId}
                channelId="general"
                className="h-full"
              />
            </TabsContent>

            <TabsContent value="emergency" className="flex-1 m-0 p-4">
              <EmergencyPanel userId={userId} className="h-full" />
            </TabsContent>
          </Tabs>
        </div>

        {/* Notification Panel */}
        {isNotificationPanelOpen && (
          <div className="w-80 border-l bg-gray-50">
            <Card className="h-full rounded-none border-0">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="h-5 w-5" />
                    <span>Notifications</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    {criticalNotifications.length > 0 && (
                      <Badge variant="destructive">
                        {criticalNotifications.length} Critical
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllNotifications}
                      className="text-xs"
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-96">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                      <p>No notifications</p>
                    </div>
                  ) : (
                    <div className="space-y-2 p-4">
                      {notifications.map((notification) => (
                        <Card
                          key={notification.id}
                          className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                            !notification.read ? "border-l-4" : ""
                          } ${getPriorityColor(notification.priority)}`}
                          onClick={() =>
                            markNotificationAsRead(notification.id)
                          }
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start space-x-3">
                              <div className="mt-1">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <h4
                                    className={`text-sm font-medium truncate ${
                                      !notification.read
                                        ? "text-gray-900"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    {notification.title}
                                  </h4>
                                  {!notification.read && (
                                    <div className="h-2 w-2 bg-blue-500 rounded-full ml-2" />
                                  )}
                                </div>
                                <p className="text-xs text-gray-600 mb-2">
                                  {notification.content}
                                </p>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500">
                                    {format(
                                      new Date(notification.timestamp),
                                      "MMM d, HH:mm",
                                    )}
                                  </span>
                                  {notification.actionRequired && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs text-orange-600 border-orange-200"
                                    >
                                      Action Required
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunicationHub;
