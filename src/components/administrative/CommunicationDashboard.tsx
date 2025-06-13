import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageCircle,
  Mail,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Bell,
  Eye,
  BarChart3,
  Activity,
  Zap,
  Target,
  Brain,
  Network,
  Lightbulb,
  Plus,
} from "lucide-react";
import { communicationAPI } from "@/api/communication.api";
import { ApiService } from "@/services/api.service";
import { SecurityService, AuditLogger } from "@/services/security.service";

interface DashboardMetrics {
  chat_groups: {
    total_active_groups: number;
    new_groups_today: number;
    messages_sent_today: number;
    average_response_time_minutes: number;
    most_active_group: string;
  };
  email_communications: {
    emails_sent_today: number;
    emails_delivered: number;
    emails_opened: number;
    open_rate_percentage: number;
    click_rate_percentage: number;
    bounce_rate_percentage: number;
  };
  committee_activities: {
    active_committees: number;
    meetings_this_month: number;
    pending_action_items: number;
    overdue_action_items: number;
    upcoming_meetings_next_7_days: number;
  };
  governance_documents: {
    total_documents: number;
    pending_acknowledgments: number;
    documents_updated_this_week: number;
    compliance_rate_percentage: number;
  };
}

interface Alert {
  alert_id: string;
  alert_type: string;
  severity: string;
  message: string;
  details: string;
  created_at: string;
}

interface Trend {
  communication_volume: {
    last_7_days: number[];
    trend_direction: string;
    percentage_change: number;
  };
  email_engagement: {
    last_30_days_open_rate: number[];
    trend_direction: string;
    percentage_change: number;
  };
  committee_efficiency: {
    action_item_completion_rate: number[];
    trend_direction: string;
    percentage_change: number;
  };
}

interface CommunicationIntelligence {
  sentiment_analysis: {
    overall_sentiment_score: number;
    satisfaction_level: number;
    anxiety_level: number;
    trust_level: number;
    compliance_willingness: number;
  };
  orchestration_metrics: {
    messages_optimized: number;
    routing_efficiency: number;
    content_optimization_rate: number;
    delivery_timing_accuracy: number;
  };
  whatsapp_intelligence: {
    group_participation_rate: number;
    engagement_quality_score: number;
    response_time_average: number;
    information_accuracy_rate: number;
  };
  daman_integration: {
    provider_relations_score: number;
    communication_compliance_rate: number;
    response_time_sla: number;
    escalation_management_efficiency: number;
  };
  openjet_integration: {
    query_resolution_rate: number;
    automated_routing_success: number;
    provider_satisfaction_score: number;
    system_uptime: number;
  };
}

interface TeamDynamics {
  team_cohesion_score: number;
  communication_efficiency: number;
  knowledge_sharing_instances: number;
  innovation_index: number;
  collaboration_effectiveness: number;
  conflict_resolution_capability: number;
}

interface KnowledgeManagement {
  knowledge_creation_rate: number;
  knowledge_utilization_rate: number;
  knowledge_quality_score: number;
  identified_gaps: number;
  learning_path_completions: number;
  mentorship_matches: number;
}

const CommunicationDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [trends, setTrends] = useState<Trend | null>(null);
  const [communicationIntelligence, setCommunicationIntelligence] =
    useState<CommunicationIntelligence | null>(null);
  const [teamDynamics, setTeamDynamics] = useState<TeamDynamics | null>(null);
  const [knowledgeManagement, setKnowledgeManagement] =
    useState<KnowledgeManagement | null>(null);
  const [emailAuditTrails, setEmailAuditTrails] = useState<any[]>([]);
  const [damanNotificationChannels, setDamanNotificationChannels] = useState<
    any[]
  >([]);
  const [escalationWorkflows, setEscalationWorkflows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(
    null,
  );

  useEffect(() => {
    loadDashboardData();

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    setRefreshInterval(interval);

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const dashboardData =
        await communicationAPI.dashboard.getCommunicationDashboard();

      if (dashboardData) {
        setMetrics(dashboardData.metrics);
        setAlerts(dashboardData.alerts || []);
        setTrends(dashboardData.trends || null);
      }

      // Load Communication Intelligence data
      const intelligenceData = await loadCommunicationIntelligence();
      setCommunicationIntelligence(intelligenceData);

      // Load Team Dynamics data
      const teamData = await loadTeamDynamics();
      setTeamDynamics(teamData);

      // Load Knowledge Management data
      const knowledgeData = await loadKnowledgeManagement();
      setKnowledgeManagement(knowledgeData);

      // Load Email Audit Trails
      const emailAuditData = await loadEmailAuditTrails();
      setEmailAuditTrails(emailAuditData);

      // Load Daman Notification Channels
      const notificationData = await loadDamanNotificationChannels();
      setDamanNotificationChannels(notificationData);

      // Load Escalation Workflows
      const escalationData = await loadEscalationWorkflows();
      setEscalationWorkflows(escalationData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCommunicationIntelligence =
    async (): Promise<CommunicationIntelligence> => {
      try {
        // Log communication intelligence access
        AuditLogger.logSecurityEvent({
          type: "data_access",
          resource: "communication_intelligence",
          details: "Accessed communication intelligence dashboard",
          severity: "low",
        });

        // Try to load from API first
        const response = await ApiService.get(
          "/api/communication/intelligence",
        );
        return response;
      } catch (error) {
        console.warn(
          "Failed to load communication intelligence from API, using mock data",
        );

        // Mock data - in production, this would call the actual API
        return {
          sentiment_analysis: {
            overall_sentiment_score: 0.72,
            satisfaction_level: 0.78,
            anxiety_level: 0.34,
            trust_level: 0.85,
            compliance_willingness: 0.89,
          },
          orchestration_metrics: {
            messages_optimized: 156,
            routing_efficiency: 0.87,
            content_optimization_rate: 0.82,
            delivery_timing_accuracy: 0.91,
          },
          whatsapp_intelligence: {
            group_participation_rate: 0.78,
            engagement_quality_score: 0.83,
            response_time_average: 25,
            information_accuracy_rate: 0.92,
          },
          daman_integration: {
            provider_relations_score: 0.85,
            communication_compliance_rate: 0.92,
            response_time_sla: 0.88,
            escalation_management_efficiency: 0.91,
          },
          openjet_integration: {
            query_resolution_rate: 0.89,
            automated_routing_success: 0.94,
            provider_satisfaction_score: 0.87,
            system_uptime: 0.99,
          },
        };
      }
    };

  const loadTeamDynamics = async (): Promise<TeamDynamics> => {
    // Mock data - in production, this would call the actual API
    return {
      team_cohesion_score: 0.82,
      communication_efficiency: 0.78,
      knowledge_sharing_instances: 67,
      innovation_index: 0.68,
      collaboration_effectiveness: 0.85,
      conflict_resolution_capability: 0.81,
    };
  };

  const loadKnowledgeManagement = async (): Promise<KnowledgeManagement> => {
    // Mock data - in production, this would call the actual API
    return {
      knowledge_creation_rate: 0.12,
      knowledge_utilization_rate: 0.67,
      knowledge_quality_score: 0.84,
      identified_gaps: 8,
      learning_path_completions: 23,
      mentorship_matches: 12,
    };
  };

  const loadEmailAuditTrails = async (): Promise<any[]> => {
    return [
      {
        id: "email-001",
        timestamp: new Date().toISOString(),
        sender: "system@reyada-homecare.ae",
        recipient: "provider@clinic.ae",
        subject: "Authorization Status Update",
        status: "delivered",
        damanRelated: true,
        complianceLevel: "high",
      },
      {
        id: "email-002",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        sender: "notifications@reyada-homecare.ae",
        recipient: "admin@provider.ae",
        subject: "Daman Compliance Alert",
        status: "opened",
        damanRelated: true,
        complianceLevel: "critical",
      },
    ];
  };

  const loadDamanNotificationChannels = async (): Promise<any[]> => {
    return [
      {
        id: "channel-001",
        name: "Authorization Updates",
        type: "email",
        status: "active",
        subscribers: 45,
        lastNotification: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        id: "channel-002",
        name: "Compliance Alerts",
        type: "sms",
        status: "active",
        subscribers: 23,
        lastNotification: new Date(Date.now() - 900000).toISOString(),
      },
    ];
  };

  const loadEscalationWorkflows = async (): Promise<any[]> => {
    return [
      {
        id: "escalation-001",
        name: "Late Submission Escalation",
        triggerCondition: "submission_deadline_missed",
        status: "active",
        escalationLevels: 3,
        lastTriggered: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: "escalation-002",
        name: "Compliance Violation Escalation",
        triggerCondition: "compliance_score_below_threshold",
        status: "active",
        escalationLevels: 2,
        lastTriggered: new Date(Date.now() - 14400000).toISOString(),
      },
    ];
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case "increasing":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "decreasing":
        return (
          <TrendingUp className="h-4 w-4 text-red-600 transform rotate-180" />
        );
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading && !metrics) {
    return (
      <div className="flex items-center justify-center h-96 bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading communication dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Activity className="h-6 w-6 mr-3 text-blue-600" />
              Communication Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Real-time communication analytics and monitoring
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Live</span>
            </div>
            <Button variant="outline" onClick={loadDashboardData}>
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="mb-6">
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                Active Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <div
                    key={alert.alert_id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        <span className="font-medium text-gray-900">
                          {alert.message}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {alert.details}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatTime(alert.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Chat Groups
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics?.chat_groups.total_active_groups || 0}
                </p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  {getTrendIcon("increasing")}
                  <span className="ml-1">
                    +{metrics?.chat_groups.new_groups_today || 0} today
                  </span>
                </p>
              </div>
              <MessageCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Messages Today
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics?.chat_groups.messages_sent_today || 0}
                </p>
                <p className="text-xs text-gray-600 flex items-center mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  Avg response:{" "}
                  {metrics?.chat_groups.average_response_time_minutes || 0}m
                </p>
              </div>
              <Zap className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Email Open Rate
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics?.email_communications.open_rate_percentage || 0}%
                </p>
                <p className="text-xs text-blue-600 flex items-center mt-1">
                  {getTrendIcon(
                    trends?.email_engagement.trend_direction || "stable",
                  )}
                  <span className="ml-1">
                    {trends?.email_engagement.percentage_change || 0}% vs last
                    month
                  </span>
                </p>
              </div>
              <Mail className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pending Actions
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics?.committee_activities.pending_action_items || 0}
                </p>
                <p className="text-xs text-red-600 flex items-center mt-1">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {metrics?.committee_activities.overdue_action_items || 0}{" "}
                  overdue
                </p>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="chat">Chat Activity</TabsTrigger>
          <TabsTrigger value="email">Email Performance</TabsTrigger>
          <TabsTrigger value="committees">Committees</TabsTrigger>
          <TabsTrigger value="governance">Governance</TabsTrigger>
          <TabsTrigger value="intelligence">AI Intelligence</TabsTrigger>
          <TabsTrigger value="teamdynamics">Team Dynamics</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Mgmt</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Communication Volume Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Last 7 Days</span>
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(
                        trends?.communication_volume.trend_direction ||
                          "stable",
                      )}
                      <span className="text-sm text-gray-600">
                        {trends?.communication_volume.percentage_change || 0}%
                      </span>
                    </div>
                  </div>
                  <div className="h-32 flex items-end space-x-1">
                    {trends?.communication_volume.last_7_days.map(
                      (value, index) => (
                        <div
                          key={index}
                          className="bg-blue-500 rounded-t flex-1"
                          style={{
                            height: `${(value / Math.max(...(trends?.communication_volume.last_7_days || [1]))) * 100}%`,
                          }}
                        ></div>
                      ),
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Most Active Communication Channels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Chat Groups</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={85} className="w-20 h-2" />
                      <span className="text-sm text-gray-600">85%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">Email</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={65} className="w-20 h-2" />
                      <span className="text-sm text-gray-600">65%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">
                        Committee Meetings
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={45} className="w-20 h-2" />
                      <span className="text-sm text-gray-600">45%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Chat Activity Tab */}
        <TabsContent value="chat">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Chat Group Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-blue-900">
                        Most Active Group
                      </h4>
                      <Badge className="bg-blue-100 text-blue-800">
                        Top Performer
                      </Badge>
                    </div>
                    <p className="text-sm text-blue-800">
                      {metrics?.chat_groups.most_active_group || "N/A"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">
                        {metrics?.chat_groups.total_active_groups || 0}
                      </p>
                      <p className="text-sm text-gray-600">Active Groups</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">
                        {metrics?.chat_groups.average_response_time_minutes ||
                          0}
                        m
                      </p>
                      <p className="text-sm text-gray-600">Avg Response Time</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button className="w-full justify-start" variant="outline">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    View All Groups
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Group
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Chat Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Email Performance Tab */}
        <TabsContent value="email">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {metrics?.email_communications.emails_delivered || 0}
                      </p>
                      <p className="text-sm text-gray-600">Delivered</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {metrics?.email_communications.emails_opened || 0}
                      </p>
                      <p className="text-sm text-gray-600">Opened</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Open Rate</span>
                      <span className="text-sm text-gray-600">
                        {metrics?.email_communications.open_rate_percentage ||
                          0}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        metrics?.email_communications.open_rate_percentage || 0
                      }
                      className="h-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Click Rate</span>
                      <span className="text-sm text-gray-600">
                        {metrics?.email_communications.click_rate_percentage ||
                          0}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        metrics?.email_communications.click_rate_percentage || 0
                      }
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Email Engagement Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Last 30 Days</span>
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(
                        trends?.email_engagement.trend_direction || "stable",
                      )}
                      <span className="text-sm text-gray-600">
                        {trends?.email_engagement.percentage_change || 0}%
                      </span>
                    </div>
                  </div>
                  <div className="h-32 flex items-end space-x-1">
                    {trends?.email_engagement.last_30_days_open_rate.map(
                      (value, index) => (
                        <div
                          key={index}
                          className="bg-purple-500 rounded-t flex-1"
                          style={{ height: `${value}%` }}
                        ></div>
                      ),
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Committees Tab */}
        <TabsContent value="committees">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Committee Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Active Committees
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      {metrics?.committee_activities.active_committees || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Meetings This Month
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      {metrics?.committee_activities.meetings_this_month || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Upcoming Meetings
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      {metrics?.committee_activities
                        .upcoming_meetings_next_7_days || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Action Items Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">
                        {metrics?.committee_activities.pending_action_items ||
                          0}
                      </p>
                      <p className="text-sm text-gray-600">Pending</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-red-600">
                        {metrics?.committee_activities.overdue_action_items ||
                          0}
                      </p>
                      <p className="text-sm text-gray-600">Overdue</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Completion Rate
                      </span>
                      <span className="text-sm text-gray-600">
                        {trends?.committee_efficiency.action_item_completion_rate.slice(
                          -1,
                        )[0] || 0}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        trends?.committee_efficiency.action_item_completion_rate.slice(
                          -1,
                        )[0] || 0
                      }
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Governance Tab */}
        <TabsContent value="governance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Document Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">
                        {metrics?.governance_documents.total_documents || 0}
                      </p>
                      <p className="text-sm text-gray-600">Total Documents</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">
                        {metrics?.governance_documents
                          .pending_acknowledgments || 0}
                      </p>
                      <p className="text-sm text-gray-600">Pending Acks</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Compliance Rate
                      </span>
                      <span className="text-sm text-gray-600">
                        {metrics?.governance_documents
                          .compliance_rate_percentage || 0}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        metrics?.governance_documents
                          .compliance_rate_percentage || 0
                      }
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Documents updated this week
                      </p>
                      <p className="text-xs text-gray-600">
                        {metrics?.governance_documents
                          .documents_updated_this_week || 0}{" "}
                        documents
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                    <Bell className="h-4 w-4 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Acknowledgment reminders sent
                      </p>
                      <p className="text-xs text-gray-600">
                        To{" "}
                        {metrics?.governance_documents
                          .pending_acknowledgments || 0}{" "}
                        staff members
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Intelligence Tab */}
        <TabsContent value="intelligence">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-purple-600" />
                  Sentiment Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {Math.round(
                          (communicationIntelligence?.sentiment_analysis
                            .overall_sentiment_score || 0) * 100,
                        )}
                        %
                      </p>
                      <p className="text-sm text-gray-600">Overall Sentiment</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {Math.round(
                          (communicationIntelligence?.sentiment_analysis
                            .satisfaction_level || 0) * 100,
                        )}
                        %
                      </p>
                      <p className="text-sm text-gray-600">Satisfaction</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Trust Level</span>
                      <span className="text-sm text-gray-600">
                        {Math.round(
                          (communicationIntelligence?.sentiment_analysis
                            .trust_level || 0) * 100,
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        (communicationIntelligence?.sentiment_analysis
                          .trust_level || 0) * 100
                      }
                      className="h-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Compliance Willingness
                      </span>
                      <span className="text-sm text-gray-600">
                        {Math.round(
                          (communicationIntelligence?.sentiment_analysis
                            .compliance_willingness || 0) * 100,
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        (communicationIntelligence?.sentiment_analysis
                          .compliance_willingness || 0) * 100
                      }
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-orange-600" />
                  Message Orchestration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">
                        {communicationIntelligence?.orchestration_metrics
                          .messages_optimized || 0}
                      </p>
                      <p className="text-sm text-gray-600">
                        Messages Optimized
                      </p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {Math.round(
                          (communicationIntelligence?.orchestration_metrics
                            .routing_efficiency || 0) * 100,
                        )}
                        %
                      </p>
                      <p className="text-sm text-gray-600">
                        Routing Efficiency
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Content Optimization
                      </span>
                      <span className="text-sm text-gray-600">
                        {Math.round(
                          (communicationIntelligence?.orchestration_metrics
                            .content_optimization_rate || 0) * 100,
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        (communicationIntelligence?.orchestration_metrics
                          .content_optimization_rate || 0) * 100
                      }
                      className="h-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Timing Accuracy
                      </span>
                      <span className="text-sm text-gray-600">
                        {Math.round(
                          (communicationIntelligence?.orchestration_metrics
                            .delivery_timing_accuracy || 0) * 100,
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        (communicationIntelligence?.orchestration_metrics
                          .delivery_timing_accuracy || 0) * 100
                      }
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2 text-green-600" />
                  WhatsApp Group Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-xl font-bold text-green-600">
                      {Math.round(
                        (communicationIntelligence?.whatsapp_intelligence
                          .group_participation_rate || 0) * 100,
                      )}
                      %
                    </p>
                    <p className="text-sm text-gray-600">Participation Rate</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-xl font-bold text-blue-600">
                      {Math.round(
                        (communicationIntelligence?.whatsapp_intelligence
                          .engagement_quality_score || 0) * 100,
                      )}
                      %
                    </p>
                    <p className="text-sm text-gray-600">Engagement Quality</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-xl font-bold text-orange-600">
                      {communicationIntelligence?.whatsapp_intelligence
                        .response_time_average || 0}
                      m
                    </p>
                    <p className="text-sm text-gray-600">Avg Response Time</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-xl font-bold text-purple-600">
                      {Math.round(
                        (communicationIntelligence?.whatsapp_intelligence
                          .information_accuracy_rate || 0) * 100,
                      )}
                      %
                    </p>
                    <p className="text-sm text-gray-600">Info Accuracy</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Team Dynamics Tab */}
        <TabsContent value="teamdynamics">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Network className="h-5 w-5 mr-2 text-blue-600" />
                  Team Cohesion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {Math.round((teamDynamics?.team_cohesion_score || 0) * 100)}
                    %
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Overall Team Cohesion
                  </p>
                  <Progress
                    value={(teamDynamics?.team_cohesion_score || 0) * 100}
                    className="h-3"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
                  Innovation Index
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-yellow-600 mb-2">
                    {Math.round((teamDynamics?.innovation_index || 0) * 100)}%
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Innovation Capability
                  </p>
                  <Progress
                    value={(teamDynamics?.innovation_index || 0) * 100}
                    className="h-3"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-green-600" />
                  Collaboration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {Math.round(
                      (teamDynamics?.collaboration_effectiveness || 0) * 100,
                    )}
                    %
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Collaboration Effectiveness
                  </p>
                  <Progress
                    value={
                      (teamDynamics?.collaboration_effectiveness || 0) * 100
                    }
                    className="h-3"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Team Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Communication Efficiency
                      </span>
                      <span className="text-sm text-gray-600">
                        {Math.round(
                          (teamDynamics?.communication_efficiency || 0) * 100,
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        (teamDynamics?.communication_efficiency || 0) * 100
                      }
                      className="h-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Knowledge Sharing
                      </span>
                      <span className="text-sm text-gray-600">
                        {teamDynamics?.knowledge_sharing_instances || 0}{" "}
                        instances
                      </span>
                    </div>
                    <Progress
                      value={Math.min(
                        (teamDynamics?.knowledge_sharing_instances || 0) * 1.5,
                        100,
                      )}
                      className="h-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Conflict Resolution
                      </span>
                      <span className="text-sm text-gray-600">
                        {Math.round(
                          (teamDynamics?.conflict_resolution_capability || 0) *
                            100,
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        (teamDynamics?.conflict_resolution_capability || 0) *
                        100
                      }
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Knowledge Management Tab */}
        <TabsContent value="knowledge">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-indigo-600" />
                  Knowledge Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-indigo-600">
                        {Math.round(
                          (knowledgeManagement?.knowledge_creation_rate || 0) *
                            100,
                        )}
                        %
                      </p>
                      <p className="text-sm text-gray-600">Creation Rate</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {Math.round(
                          (knowledgeManagement?.knowledge_utilization_rate ||
                            0) * 100,
                        )}
                        %
                      </p>
                      <p className="text-sm text-gray-600">Utilization Rate</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Knowledge Quality
                      </span>
                      <span className="text-sm text-gray-600">
                        {Math.round(
                          (knowledgeManagement?.knowledge_quality_score || 0) *
                            100,
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        (knowledgeManagement?.knowledge_quality_score || 0) *
                        100
                      }
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-red-600" />
                  Knowledge Gaps & Learning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-red-600">
                        {knowledgeManagement?.identified_gaps || 0}
                      </p>
                      <p className="text-sm text-gray-600">Identified Gaps</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {knowledgeManagement?.learning_path_completions || 0}
                      </p>
                      <p className="text-sm text-gray-600">
                        Learning Completions
                      </p>
                    </div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-xl font-bold text-green-600">
                      {knowledgeManagement?.mentorship_matches || 0}
                    </p>
                    <p className="text-sm text-gray-600">
                      Active Mentorship Matches
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Knowledge Management Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Lightbulb className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Implement AI-powered knowledge discovery
                      </p>
                      <p className="text-xs text-gray-600">
                        Automatically identify and categorize new knowledge
                        assets
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <Users className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Expand mentorship program
                      </p>
                      <p className="text-xs text-gray-600">
                        Match experts with learners based on skill gaps
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <Brain className="h-5 w-5 text-purple-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Create interactive learning paths
                      </p>
                      <p className="text-xs text-gray-600">
                        Develop personalized learning journeys for identified
                        gaps
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                    <Network className="h-5 w-5 text-orange-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Establish knowledge sharing communities
                      </p>
                      <p className="text-xs text-gray-600">
                        Foster cross-departmental knowledge exchange
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunicationDashboard;
