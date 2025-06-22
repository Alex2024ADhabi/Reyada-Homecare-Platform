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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  MessageSquare,
  Bell,
  AlertTriangle,
  Users,
  Activity,
  Send,
  Settings,
  Zap,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import communicationService from "@/services/communication.service";

interface UnifiedMessage {
  id: string;
  type: string;
  priority: string;
  source: {
    module: string;
    userId?: string;
    service?: string;
  };
  content: {
    title: string;
    message: string;
    data?: any;
  };
  metadata: {
    timestamp: string;
    correlationId?: string;
    workflowId?: string;
  };
}

interface HubMetrics {
  messagesProcessed: number;
  notificationsSent: number;
  emergencyAlertsTriggered: number;
  crossModuleEvents: number;
  activeConnections: number;
  moduleSubscriptions: number;
  communicationChannels: number;
  notificationRules: number;
  queuedMessages: number;
  lastActivity: string;
}

const IntegratedCommunicationHub: React.FC = () => {
  const [messages, setMessages] = useState<UnifiedMessage[]>([]);
  const [metrics, setMetrics] = useState<HubMetrics | null>(null);
  const [hubStatus, setHubStatus] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHubData();

    // Setup real-time updates
    const interval = setInterval(loadHubData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadHubData = async () => {
    try {
      const hubMetrics = communicationService.getHubMetrics();
      const unifiedMessages = communicationService.getUnifiedMessages({
        limit: 20,
      });
      const status = communicationService.getHubStatus();

      setMetrics(hubMetrics);
      setMessages(unifiedMessages);
      setHubStatus(status);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to load hub data:", error);
      setIsLoading(false);
    }
  };

  const sendTestMessage = async (
    type: "workflow" | "emergency" | "compliance",
  ) => {
    try {
      const testMessages = {
        workflow: {
          type: "workflow",
          priority: "medium" as const,
          source: {
            module: "test",
            userId: "demo-user",
            service: "demo",
          },
          destination: {
            channels: ["workflow-notifications"],
            broadcast: false,
          },
          content: {
            title: "Test Workflow Notification",
            message:
              "This is a test workflow notification from the communication hub.",
            data: { testId: Date.now() },
          },
          routing: {
            immediate: false,
            persistent: true,
            acknowledgmentRequired: false,
          },
        },
        emergency: {
          type: "emergency",
          priority: "critical" as const,
          source: {
            module: "emergency",
            userId: "demo-user",
            service: "emergency-system",
          },
          destination: {
            channels: ["emergency"],
            broadcast: true,
          },
          content: {
            title: "🚨 Test Emergency Alert",
            message:
              "This is a test emergency alert. In a real scenario, this would trigger immediate notifications.",
            data: { alertType: "test", location: "Demo Location" },
          },
          routing: {
            immediate: true,
            persistent: true,
            acknowledgmentRequired: true,
          },
        },
        compliance: {
          type: "alert",
          priority: "high" as const,
          source: {
            module: "compliance",
            userId: "demo-user",
            service: "compliance-monitor",
          },
          destination: {
            channels: ["compliance-alerts"],
            broadcast: false,
          },
          content: {
            title: "Test Compliance Alert",
            message:
              "This is a test compliance alert. Documentation review required.",
            data: { violationType: "test", severity: "medium" },
          },
          routing: {
            immediate: true,
            persistent: true,
            acknowledgmentRequired: true,
          },
        },
      };

      await communicationService.sendUnifiedMessage(testMessages[type]);
      loadHubData(); // Refresh data
    } catch (error) {
      console.error("Failed to send test message:", error);
    }
  };

  const triggerCrossModuleEvent = () => {
    communicationService.triggerCrossModuleEvent({
      module: "patient",
      type: "episode.started",
      data: {
        patientId: "demo-patient-123",
        patientName: "John Doe",
        episodeId: "episode-456",
      },
      userId: "demo-user",
      correlationId: `demo-${Date.now()}`,
    });

    setTimeout(loadHubData, 1000); // Refresh after event processing
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "emergency":
        return <AlertTriangle className="h-4 w-4" />;
      case "workflow":
        return <Activity className="h-4 w-4" />;
      case "alert":
        return <Bell className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-white">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading Communication Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Integrated Communication Hub
          </h1>
          <p className="text-gray-600">
            Unified messaging system with real-time notifications and
            cross-module communication
          </p>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Messages Processed
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics?.messagesProcessed || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Total unified messages
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Connections
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics?.activeConnections || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Real-time connections
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Emergency Alerts
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {metrics?.emergencyAlertsTriggered || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Critical alerts sent
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Cross-Module Events
              </CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics?.crossModuleEvents || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Module integrations
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="channels">Channels</TabsTrigger>
            <TabsTrigger value="testing">Testing</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Hub Status</CardTitle>
                  <CardDescription>
                    Current system health and metrics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Status</span>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {hubStatus?.status || "Active"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Communication Channels</span>
                    <span className="font-medium">
                      {metrics?.communicationChannels || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Notification Rules</span>
                    <span className="font-medium">
                      {metrics?.notificationRules || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Module Subscriptions</span>
                    <span className="font-medium">
                      {metrics?.moduleSubscriptions || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Queue Health</span>
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700"
                    >
                      {hubStatus?.health?.queueHealth || "Healthy"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest communication hub events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">
                        Hub initialized successfully
                      </span>
                      <span className="text-xs text-gray-500 ml-auto">
                        Active
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">
                        Cross-module channels configured
                      </span>
                      <span className="text-xs text-gray-500 ml-auto">
                        Ready
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">Notification rules active</span>
                      <span className="text-xs text-gray-500 ml-auto">
                        Monitoring
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm">
                        Emergency protocols enabled
                      </span>
                      <span className="text-xs text-gray-500 ml-auto">
                        Standby
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Unified Messages</CardTitle>
                <CardDescription>
                  Recent messages processed by the communication hub
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No messages yet. Try sending a test message!</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className="border rounded-lg p-4 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {getTypeIcon(message.type)}
                              <span className="font-medium">
                                {message.content.title}
                              </span>
                              <Badge
                                variant="outline"
                                className={`${getPriorityColor(message.priority)} text-white`}
                              >
                                {message.priority}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <Clock className="h-3 w-3" />
                              {new Date(
                                message.metadata.timestamp,
                              ).toLocaleTimeString()}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">
                            {message.content.message}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Module: {message.source.module}</span>
                            <span>Type: {message.type}</span>
                            {message.metadata.correlationId && (
                              <span>
                                ID: {message.metadata.correlationId.slice(-8)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="channels" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Communication Channels</CardTitle>
                <CardDescription>
                  Active channels for cross-module communication
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Activity className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">
                        Patient-Clinical Bridge
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Workflow communication between patient and clinical
                      modules
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-600">Active</span>
                      <span>Encrypted</span>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="font-medium">Compliance Alerts</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Critical compliance violations and audit notifications
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-600">Active</span>
                      <span>High Priority</span>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Bell className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">
                        Workflow Notifications
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      General workflow updates and system notifications
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-600">Active</span>
                      <span>Standard</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="testing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Communication Hub Testing</CardTitle>
                <CardDescription>
                  Test the unified messaging system and cross-module
                  communication
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Use these controls to test different aspects of the
                    communication hub. Messages will appear in the Messages tab.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Message Testing</h3>
                    <div className="space-y-2">
                      <Button
                        onClick={() => sendTestMessage("workflow")}
                        className="w-full justify-start"
                        variant="outline"
                      >
                        <Activity className="h-4 w-4 mr-2" />
                        Send Workflow Notification
                      </Button>
                      <Button
                        onClick={() => sendTestMessage("compliance")}
                        className="w-full justify-start"
                        variant="outline"
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Send Compliance Alert
                      </Button>
                      <Button
                        onClick={() => sendTestMessage("emergency")}
                        className="w-full justify-start"
                        variant="destructive"
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Send Emergency Alert
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Cross-Module Events</h3>
                    <div className="space-y-2">
                      <Button
                        onClick={triggerCrossModuleEvent}
                        className="w-full justify-start"
                        variant="outline"
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Trigger Patient Episode Event
                      </Button>
                      <Button
                        onClick={loadHubData}
                        className="w-full justify-start"
                        variant="outline"
                      >
                        <Activity className="h-4 w-4 mr-2" />
                        Refresh Hub Data
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-medium mb-3">Current Queue Status</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="p-3 bg-gray-50 rounded">
                      <div className="text-lg font-bold">
                        {metrics?.queuedMessages || 0}
                      </div>
                      <div className="text-xs text-gray-600">Queued</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded">
                      <div className="text-lg font-bold text-blue-600">
                        {metrics?.notificationsSent || 0}
                      </div>
                      <div className="text-xs text-gray-600">Sent</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded">
                      <div className="text-lg font-bold text-green-600">
                        {metrics?.activeConnections || 0}
                      </div>
                      <div className="text-xs text-gray-600">Connected</div>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded">
                      <div className="text-lg font-bold text-yellow-600">
                        {metrics?.moduleSubscriptions || 0}
                      </div>
                      <div className="text-xs text-gray-600">Subscribed</div>
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

export default IntegratedCommunicationHub;
