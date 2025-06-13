import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Mail, Users, AlertTriangle, CheckCircle, Clock, TrendingUp, Bell, BarChart3, Activity, Zap, Target, Brain, Network, Lightbulb, Plus, } from "lucide-react";
import { communicationAPI } from "@/api/communication.api";
import { ApiService } from "@/services/api.service";
import { AuditLogger } from "@/services/security.service";
const CommunicationDashboard = () => {
    const [activeTab, setActiveTab] = useState("overview");
    const [metrics, setMetrics] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [trends, setTrends] = useState(null);
    const [communicationIntelligence, setCommunicationIntelligence] = useState(null);
    const [teamDynamics, setTeamDynamics] = useState(null);
    const [knowledgeManagement, setKnowledgeManagement] = useState(null);
    const [emailAuditTrails, setEmailAuditTrails] = useState([]);
    const [damanNotificationChannels, setDamanNotificationChannels] = useState([]);
    const [escalationWorkflows, setEscalationWorkflows] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState(null);
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
            const dashboardData = await communicationAPI.dashboard.getCommunicationDashboard();
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
        }
        catch (error) {
            console.error("Error loading dashboard data:", error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const loadCommunicationIntelligence = async () => {
        try {
            // Log communication intelligence access
            AuditLogger.logSecurityEvent({
                type: "data_access",
                resource: "communication_intelligence",
                details: "Accessed communication intelligence dashboard",
                severity: "low",
            });
            // Try to load from API first
            const response = await ApiService.get("/api/communication/intelligence");
            return response;
        }
        catch (error) {
            console.warn("Failed to load communication intelligence from API, using mock data");
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
    const loadTeamDynamics = async () => {
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
    const loadKnowledgeManagement = async () => {
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
    const loadEmailAuditTrails = async () => {
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
    const loadDamanNotificationChannels = async () => {
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
    const loadEscalationWorkflows = async () => {
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
    const getSeverityColor = (severity) => {
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
    const getTrendIcon = (direction) => {
        switch (direction) {
            case "increasing":
                return _jsx(TrendingUp, { className: "h-4 w-4 text-green-600" });
            case "decreasing":
                return (_jsx(TrendingUp, { className: "h-4 w-4 text-red-600 transform rotate-180" }));
            default:
                return _jsx(Activity, { className: "h-4 w-4 text-gray-600" });
        }
    };
    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };
    if (isLoading && !metrics) {
        return (_jsx("div", { className: "flex items-center justify-center h-96 bg-white", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "Loading communication dashboard..." })] }) }));
    }
    return (_jsxs("div", { className: "p-6 bg-gray-50 min-h-screen", children: [_jsx("div", { className: "mb-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-2xl font-bold text-gray-900 flex items-center", children: [_jsx(Activity, { className: "h-6 w-6 mr-3 text-blue-600" }), "Communication Dashboard"] }), _jsx("p", { className: "text-gray-600 mt-1", children: "Real-time communication analytics and monitoring" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("div", { className: "flex items-center space-x-1 text-sm text-gray-500", children: [_jsx("div", { className: "h-2 w-2 bg-green-400 rounded-full animate-pulse" }), _jsx("span", { children: "Live" })] }), _jsx(Button, { variant: "outline", onClick: loadDashboardData, children: "Refresh" })] })] }) }), alerts.length > 0 && (_jsx("div", { className: "mb-6", children: _jsxs(Card, { className: "border-l-4 border-l-orange-500", children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs(CardTitle, { className: "text-lg flex items-center", children: [_jsx(AlertTriangle, { className: "h-5 w-5 mr-2 text-orange-600" }), "Active Alerts"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-2", children: alerts.map((alert) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded-lg", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Badge, { className: getSeverityColor(alert.severity), children: alert.severity }), _jsx("span", { className: "font-medium text-gray-900", children: alert.message })] }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: alert.details })] }), _jsx("div", { className: "text-sm text-gray-500", children: formatTime(alert.created_at) })] }, alert.alert_id))) }) })] }) })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6", children: [_jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Active Chat Groups" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: metrics?.chat_groups.total_active_groups || 0 }), _jsxs("p", { className: "text-xs text-green-600 flex items-center mt-1", children: [getTrendIcon("increasing"), _jsxs("span", { className: "ml-1", children: ["+", metrics?.chat_groups.new_groups_today || 0, " today"] })] })] }), _jsx(MessageCircle, { className: "h-8 w-8 text-blue-600" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Messages Today" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: metrics?.chat_groups.messages_sent_today || 0 }), _jsxs("p", { className: "text-xs text-gray-600 flex items-center mt-1", children: [_jsx(Clock, { className: "h-3 w-3 mr-1" }), "Avg response:", " ", metrics?.chat_groups.average_response_time_minutes || 0, "m"] })] }), _jsx(Zap, { className: "h-8 w-8 text-green-600" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Email Open Rate" }), _jsxs("p", { className: "text-2xl font-bold text-gray-900", children: [metrics?.email_communications.open_rate_percentage || 0, "%"] }), _jsxs("p", { className: "text-xs text-blue-600 flex items-center mt-1", children: [getTrendIcon(trends?.email_engagement.trend_direction || "stable"), _jsxs("span", { className: "ml-1", children: [trends?.email_engagement.percentage_change || 0, "% vs last month"] })] })] }), _jsx(Mail, { className: "h-8 w-8 text-purple-600" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Pending Actions" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: metrics?.committee_activities.pending_action_items || 0 }), _jsxs("p", { className: "text-xs text-red-600 flex items-center mt-1", children: [_jsx(AlertTriangle, { className: "h-3 w-3 mr-1" }), metrics?.committee_activities.overdue_action_items || 0, " ", "overdue"] })] }), _jsx(Target, { className: "h-8 w-8 text-orange-600" })] }) }) })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "space-y-6", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-8", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "chat", children: "Chat Activity" }), _jsx(TabsTrigger, { value: "email", children: "Email Performance" }), _jsx(TabsTrigger, { value: "committees", children: "Committees" }), _jsx(TabsTrigger, { value: "governance", children: "Governance" }), _jsx(TabsTrigger, { value: "intelligence", children: "AI Intelligence" }), _jsx(TabsTrigger, { value: "teamdynamics", children: "Team Dynamics" }), _jsx(TabsTrigger, { value: "knowledge", children: "Knowledge Mgmt" })] }), _jsx(TabsContent, { value: "overview", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Communication Volume Trend" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Last 7 Days" }), _jsxs("div", { className: "flex items-center space-x-1", children: [getTrendIcon(trends?.communication_volume.trend_direction ||
                                                                        "stable"), _jsxs("span", { className: "text-sm text-gray-600", children: [trends?.communication_volume.percentage_change || 0, "%"] })] })] }), _jsx("div", { className: "h-32 flex items-end space-x-1", children: trends?.communication_volume.last_7_days.map((value, index) => (_jsx("div", { className: "bg-blue-500 rounded-t flex-1", style: {
                                                                height: `${(value / Math.max(...(trends?.communication_volume.last_7_days || [1]))) * 100}%`,
                                                            } }, index))) })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Most Active Communication Channels" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(MessageCircle, { className: "h-4 w-4 text-blue-600" }), _jsx("span", { className: "text-sm font-medium", children: "Chat Groups" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Progress, { value: 85, className: "w-20 h-2" }), _jsx("span", { className: "text-sm text-gray-600", children: "85%" })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Mail, { className: "h-4 w-4 text-purple-600" }), _jsx("span", { className: "text-sm font-medium", children: "Email" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Progress, { value: 65, className: "w-20 h-2" }), _jsx("span", { className: "text-sm text-gray-600", children: "65%" })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Users, { className: "h-4 w-4 text-green-600" }), _jsx("span", { className: "text-sm font-medium", children: "Committee Meetings" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Progress, { value: 45, className: "w-20 h-2" }), _jsx("span", { className: "text-sm text-gray-600", children: "45%" })] })] })] }) })] })] }) }), _jsx(TabsContent, { value: "chat", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs(Card, { className: "lg:col-span-2", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Chat Group Performance" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "p-4 bg-blue-50 rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h4", { className: "font-medium text-blue-900", children: "Most Active Group" }), _jsx(Badge, { className: "bg-blue-100 text-blue-800", children: "Top Performer" })] }), _jsx("p", { className: "text-sm text-blue-800", children: metrics?.chat_groups.most_active_group || "N/A" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "text-center p-4 border rounded-lg", children: [_jsx("p", { className: "text-2xl font-bold text-gray-900", children: metrics?.chat_groups.total_active_groups || 0 }), _jsx("p", { className: "text-sm text-gray-600", children: "Active Groups" })] }), _jsxs("div", { className: "text-center p-4 border rounded-lg", children: [_jsxs("p", { className: "text-2xl font-bold text-gray-900", children: [metrics?.chat_groups.average_response_time_minutes ||
                                                                                0, "m"] }), _jsx("p", { className: "text-sm text-gray-600", children: "Avg Response Time" })] })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Quick Actions" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-2", children: [_jsxs(Button, { className: "w-full justify-start", variant: "outline", children: [_jsx(MessageCircle, { className: "h-4 w-4 mr-2" }), "View All Groups"] }), _jsxs(Button, { className: "w-full justify-start", variant: "outline", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Create New Group"] }), _jsxs(Button, { className: "w-full justify-start", variant: "outline", children: [_jsx(BarChart3, { className: "h-4 w-4 mr-2" }), "Chat Analytics"] })] }) })] })] }) }), _jsx(TabsContent, { value: "email", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Email Metrics" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "text-center p-4 border rounded-lg", children: [_jsx("p", { className: "text-2xl font-bold text-green-600", children: metrics?.email_communications.emails_delivered || 0 }), _jsx("p", { className: "text-sm text-gray-600", children: "Delivered" })] }), _jsxs("div", { className: "text-center p-4 border rounded-lg", children: [_jsx("p", { className: "text-2xl font-bold text-blue-600", children: metrics?.email_communications.emails_opened || 0 }), _jsx("p", { className: "text-sm text-gray-600", children: "Opened" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Open Rate" }), _jsxs("span", { className: "text-sm text-gray-600", children: [metrics?.email_communications.open_rate_percentage ||
                                                                                0, "%"] })] }), _jsx(Progress, { value: metrics?.email_communications.open_rate_percentage || 0, className: "h-2" })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Click Rate" }), _jsxs("span", { className: "text-sm text-gray-600", children: [metrics?.email_communications.click_rate_percentage ||
                                                                                0, "%"] })] }), _jsx(Progress, { value: metrics?.email_communications.click_rate_percentage || 0, className: "h-2" })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Email Engagement Trend" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Last 30 Days" }), _jsxs("div", { className: "flex items-center space-x-1", children: [getTrendIcon(trends?.email_engagement.trend_direction || "stable"), _jsxs("span", { className: "text-sm text-gray-600", children: [trends?.email_engagement.percentage_change || 0, "%"] })] })] }), _jsx("div", { className: "h-32 flex items-end space-x-1", children: trends?.email_engagement.last_30_days_open_rate.map((value, index) => (_jsx("div", { className: "bg-purple-500 rounded-t flex-1", style: { height: `${value}%` } }, index))) })] }) })] })] }) }), _jsx(TabsContent, { value: "committees", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Committee Overview" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Active Committees" }), _jsx("span", { className: "text-lg font-bold text-gray-900", children: metrics?.committee_activities.active_committees || 0 })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Meetings This Month" }), _jsx("span", { className: "text-lg font-bold text-gray-900", children: metrics?.committee_activities.meetings_this_month || 0 })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Upcoming Meetings" }), _jsx("span", { className: "text-lg font-bold text-gray-900", children: metrics?.committee_activities
                                                                    .upcoming_meetings_next_7_days || 0 })] })] }) })] }), _jsxs(Card, { className: "lg:col-span-2", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Action Items Status" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "text-center p-4 border rounded-lg", children: [_jsx("p", { className: "text-2xl font-bold text-orange-600", children: metrics?.committee_activities.pending_action_items ||
                                                                            0 }), _jsx("p", { className: "text-sm text-gray-600", children: "Pending" })] }), _jsxs("div", { className: "text-center p-4 border rounded-lg", children: [_jsx("p", { className: "text-2xl font-bold text-red-600", children: metrics?.committee_activities.overdue_action_items ||
                                                                            0 }), _jsx("p", { className: "text-sm text-gray-600", children: "Overdue" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Completion Rate" }), _jsxs("span", { className: "text-sm text-gray-600", children: [trends?.committee_efficiency.action_item_completion_rate.slice(-1)[0] || 0, "%"] })] }), _jsx(Progress, { value: trends?.committee_efficiency.action_item_completion_rate.slice(-1)[0] || 0, className: "h-2" })] })] }) })] })] }) }), _jsx(TabsContent, { value: "governance", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Document Management" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "text-center p-4 border rounded-lg", children: [_jsx("p", { className: "text-2xl font-bold text-gray-900", children: metrics?.governance_documents.total_documents || 0 }), _jsx("p", { className: "text-sm text-gray-600", children: "Total Documents" })] }), _jsxs("div", { className: "text-center p-4 border rounded-lg", children: [_jsx("p", { className: "text-2xl font-bold text-orange-600", children: metrics?.governance_documents
                                                                            .pending_acknowledgments || 0 }), _jsx("p", { className: "text-sm text-gray-600", children: "Pending Acks" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Compliance Rate" }), _jsxs("span", { className: "text-sm text-gray-600", children: [metrics?.governance_documents
                                                                                .compliance_rate_percentage || 0, "%"] })] }), _jsx(Progress, { value: metrics?.governance_documents
                                                                    .compliance_rate_percentage || 0, className: "h-2" })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Recent Activity" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center space-x-3 p-2 bg-gray-50 rounded", children: [_jsx(CheckCircle, { className: "h-4 w-4 text-green-600" }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-medium", children: "Documents updated this week" }), _jsxs("p", { className: "text-xs text-gray-600", children: [metrics?.governance_documents
                                                                                .documents_updated_this_week || 0, " ", "documents"] })] })] }), _jsxs("div", { className: "flex items-center space-x-3 p-2 bg-gray-50 rounded", children: [_jsx(Bell, { className: "h-4 w-4 text-blue-600" }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-medium", children: "Acknowledgment reminders sent" }), _jsxs("p", { className: "text-xs text-gray-600", children: ["To", " ", metrics?.governance_documents
                                                                                .pending_acknowledgments || 0, " ", "staff members"] })] })] })] }) })] })] }) }), _jsx(TabsContent, { value: "intelligence", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Brain, { className: "h-5 w-5 mr-2 text-purple-600" }), "Sentiment Analysis"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "text-center p-4 border rounded-lg", children: [_jsxs("p", { className: "text-2xl font-bold text-green-600", children: [Math.round((communicationIntelligence?.sentiment_analysis
                                                                                .overall_sentiment_score || 0) * 100), "%"] }), _jsx("p", { className: "text-sm text-gray-600", children: "Overall Sentiment" })] }), _jsxs("div", { className: "text-center p-4 border rounded-lg", children: [_jsxs("p", { className: "text-2xl font-bold text-blue-600", children: [Math.round((communicationIntelligence?.sentiment_analysis
                                                                                .satisfaction_level || 0) * 100), "%"] }), _jsx("p", { className: "text-sm text-gray-600", children: "Satisfaction" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Trust Level" }), _jsxs("span", { className: "text-sm text-gray-600", children: [Math.round((communicationIntelligence?.sentiment_analysis
                                                                                .trust_level || 0) * 100), "%"] })] }), _jsx(Progress, { value: (communicationIntelligence?.sentiment_analysis
                                                                    .trust_level || 0) * 100, className: "h-2" })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Compliance Willingness" }), _jsxs("span", { className: "text-sm text-gray-600", children: [Math.round((communicationIntelligence?.sentiment_analysis
                                                                                .compliance_willingness || 0) * 100), "%"] })] }), _jsx(Progress, { value: (communicationIntelligence?.sentiment_analysis
                                                                    .compliance_willingness || 0) * 100, className: "h-2" })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Zap, { className: "h-5 w-5 mr-2 text-orange-600" }), "Message Orchestration"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "text-center p-4 border rounded-lg", children: [_jsx("p", { className: "text-2xl font-bold text-purple-600", children: communicationIntelligence?.orchestration_metrics
                                                                            .messages_optimized || 0 }), _jsx("p", { className: "text-sm text-gray-600", children: "Messages Optimized" })] }), _jsxs("div", { className: "text-center p-4 border rounded-lg", children: [_jsxs("p", { className: "text-2xl font-bold text-green-600", children: [Math.round((communicationIntelligence?.orchestration_metrics
                                                                                .routing_efficiency || 0) * 100), "%"] }), _jsx("p", { className: "text-sm text-gray-600", children: "Routing Efficiency" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Content Optimization" }), _jsxs("span", { className: "text-sm text-gray-600", children: [Math.round((communicationIntelligence?.orchestration_metrics
                                                                                .content_optimization_rate || 0) * 100), "%"] })] }), _jsx(Progress, { value: (communicationIntelligence?.orchestration_metrics
                                                                    .content_optimization_rate || 0) * 100, className: "h-2" })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Timing Accuracy" }), _jsxs("span", { className: "text-sm text-gray-600", children: [Math.round((communicationIntelligence?.orchestration_metrics
                                                                                .delivery_timing_accuracy || 0) * 100), "%"] })] }), _jsx(Progress, { value: (communicationIntelligence?.orchestration_metrics
                                                                    .delivery_timing_accuracy || 0) * 100, className: "h-2" })] })] }) })] }), _jsxs(Card, { className: "lg:col-span-2", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(MessageCircle, { className: "h-5 w-5 mr-2 text-green-600" }), "WhatsApp Group Intelligence"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-4 gap-4", children: [_jsxs("div", { className: "text-center p-4 border rounded-lg", children: [_jsxs("p", { className: "text-xl font-bold text-green-600", children: [Math.round((communicationIntelligence?.whatsapp_intelligence
                                                                        .group_participation_rate || 0) * 100), "%"] }), _jsx("p", { className: "text-sm text-gray-600", children: "Participation Rate" })] }), _jsxs("div", { className: "text-center p-4 border rounded-lg", children: [_jsxs("p", { className: "text-xl font-bold text-blue-600", children: [Math.round((communicationIntelligence?.whatsapp_intelligence
                                                                        .engagement_quality_score || 0) * 100), "%"] }), _jsx("p", { className: "text-sm text-gray-600", children: "Engagement Quality" })] }), _jsxs("div", { className: "text-center p-4 border rounded-lg", children: [_jsxs("p", { className: "text-xl font-bold text-orange-600", children: [communicationIntelligence?.whatsapp_intelligence
                                                                        .response_time_average || 0, "m"] }), _jsx("p", { className: "text-sm text-gray-600", children: "Avg Response Time" })] }), _jsxs("div", { className: "text-center p-4 border rounded-lg", children: [_jsxs("p", { className: "text-xl font-bold text-purple-600", children: [Math.round((communicationIntelligence?.whatsapp_intelligence
                                                                        .information_accuracy_rate || 0) * 100), "%"] }), _jsx("p", { className: "text-sm text-gray-600", children: "Info Accuracy" })] })] }) })] })] }) }), _jsx(TabsContent, { value: "teamdynamics", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Network, { className: "h-5 w-5 mr-2 text-blue-600" }), "Team Cohesion"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-4xl font-bold text-blue-600 mb-2", children: [Math.round((teamDynamics?.team_cohesion_score || 0) * 100), "%"] }), _jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Overall Team Cohesion" }), _jsx(Progress, { value: (teamDynamics?.team_cohesion_score || 0) * 100, className: "h-3" })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Lightbulb, { className: "h-5 w-5 mr-2 text-yellow-600" }), "Innovation Index"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-4xl font-bold text-yellow-600 mb-2", children: [Math.round((teamDynamics?.innovation_index || 0) * 100), "%"] }), _jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Innovation Capability" }), _jsx(Progress, { value: (teamDynamics?.innovation_index || 0) * 100, className: "h-3" })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Users, { className: "h-5 w-5 mr-2 text-green-600" }), "Collaboration"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-4xl font-bold text-green-600 mb-2", children: [Math.round((teamDynamics?.collaboration_effectiveness || 0) * 100), "%"] }), _jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Collaboration Effectiveness" }), _jsx(Progress, { value: (teamDynamics?.collaboration_effectiveness || 0) * 100, className: "h-3" })] }) })] }), _jsxs(Card, { className: "lg:col-span-3", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Team Performance Metrics" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-3 gap-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Communication Efficiency" }), _jsxs("span", { className: "text-sm text-gray-600", children: [Math.round((teamDynamics?.communication_efficiency || 0) * 100), "%"] })] }), _jsx(Progress, { value: (teamDynamics?.communication_efficiency || 0) * 100, className: "h-2" })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Knowledge Sharing" }), _jsxs("span", { className: "text-sm text-gray-600", children: [teamDynamics?.knowledge_sharing_instances || 0, " ", "instances"] })] }), _jsx(Progress, { value: Math.min((teamDynamics?.knowledge_sharing_instances || 0) * 1.5, 100), className: "h-2" })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Conflict Resolution" }), _jsxs("span", { className: "text-sm text-gray-600", children: [Math.round((teamDynamics?.conflict_resolution_capability || 0) *
                                                                                100), "%"] })] }), _jsx(Progress, { value: (teamDynamics?.conflict_resolution_capability || 0) *
                                                                    100, className: "h-2" })] })] }) })] })] }) }), _jsx(TabsContent, { value: "knowledge", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Brain, { className: "h-5 w-5 mr-2 text-indigo-600" }), "Knowledge Metrics"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "text-center p-4 border rounded-lg", children: [_jsxs("p", { className: "text-2xl font-bold text-indigo-600", children: [Math.round((knowledgeManagement?.knowledge_creation_rate || 0) *
                                                                                100), "%"] }), _jsx("p", { className: "text-sm text-gray-600", children: "Creation Rate" })] }), _jsxs("div", { className: "text-center p-4 border rounded-lg", children: [_jsxs("p", { className: "text-2xl font-bold text-green-600", children: [Math.round((knowledgeManagement?.knowledge_utilization_rate ||
                                                                                0) * 100), "%"] }), _jsx("p", { className: "text-sm text-gray-600", children: "Utilization Rate" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Knowledge Quality" }), _jsxs("span", { className: "text-sm text-gray-600", children: [Math.round((knowledgeManagement?.knowledge_quality_score || 0) *
                                                                                100), "%"] })] }), _jsx(Progress, { value: (knowledgeManagement?.knowledge_quality_score || 0) *
                                                                    100, className: "h-2" })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center", children: [_jsx(Target, { className: "h-5 w-5 mr-2 text-red-600" }), "Knowledge Gaps & Learning"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "text-center p-4 border rounded-lg", children: [_jsx("p", { className: "text-2xl font-bold text-red-600", children: knowledgeManagement?.identified_gaps || 0 }), _jsx("p", { className: "text-sm text-gray-600", children: "Identified Gaps" })] }), _jsxs("div", { className: "text-center p-4 border rounded-lg", children: [_jsx("p", { className: "text-2xl font-bold text-blue-600", children: knowledgeManagement?.learning_path_completions || 0 }), _jsx("p", { className: "text-sm text-gray-600", children: "Learning Completions" })] })] }), _jsxs("div", { className: "text-center p-4 bg-green-50 rounded-lg", children: [_jsx("p", { className: "text-xl font-bold text-green-600", children: knowledgeManagement?.mentorship_matches || 0 }), _jsx("p", { className: "text-sm text-gray-600", children: "Active Mentorship Matches" })] })] }) })] }), _jsxs(Card, { className: "lg:col-span-2", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Knowledge Management Recommendations" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center space-x-3 p-3 bg-blue-50 rounded-lg", children: [_jsx(Lightbulb, { className: "h-5 w-5 text-blue-600" }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-medium", children: "Implement AI-powered knowledge discovery" }), _jsx("p", { className: "text-xs text-gray-600", children: "Automatically identify and categorize new knowledge assets" })] })] }), _jsxs("div", { className: "flex items-center space-x-3 p-3 bg-green-50 rounded-lg", children: [_jsx(Users, { className: "h-5 w-5 text-green-600" }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-medium", children: "Expand mentorship program" }), _jsx("p", { className: "text-xs text-gray-600", children: "Match experts with learners based on skill gaps" })] })] }), _jsxs("div", { className: "flex items-center space-x-3 p-3 bg-purple-50 rounded-lg", children: [_jsx(Brain, { className: "h-5 w-5 text-purple-600" }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-medium", children: "Create interactive learning paths" }), _jsx("p", { className: "text-xs text-gray-600", children: "Develop personalized learning journeys for identified gaps" })] })] }), _jsxs("div", { className: "flex items-center space-x-3 p-3 bg-orange-50 rounded-lg", children: [_jsx(Network, { className: "h-5 w-5 text-orange-600" }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-medium", children: "Establish knowledge sharing communities" }), _jsx("p", { className: "text-xs text-gray-600", children: "Foster cross-departmental knowledge exchange" })] })] })] }) })] })] }) })] })] }));
};
export default CommunicationDashboard;
