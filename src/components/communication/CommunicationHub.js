import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, AlertTriangle, Bell, Wifi, WifiOff, Mic, MicOff, Users, Settings, Shield, Clock, Smartphone, Monitor, Activity, CheckCircle, VolumeX, } from "lucide-react";
import RealtimeChat from "./RealtimeChat";
import EmergencyPanel from "./EmergencyPanel";
import { communicationService } from "@/services/communication.service";
import { mobileCommunicationService } from "@/services/mobile-communication.service";
import { format } from "date-fns";
const CommunicationHub = ({ userId = "user_001", className = "", }) => {
    const [activeTab, setActiveTab] = useState("chat");
    const [notifications, setNotifications] = useState([]);
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
        systemHealth: "healthy",
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
        }
        catch (error) {
            console.error("Failed to initialize communication hub:", error);
        }
    };
    const loadNotifications = () => {
        // Simulate loading notifications
        const mockNotifications = [
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
            systemHealth: activeEmergencies.length > 0
                ? "warning"
                : networkInfo.online
                    ? "healthy"
                    : "critical",
        });
    };
    const markNotificationAsRead = (notificationId) => {
        setNotifications((prev) => prev.map((notif) => notif.id === notificationId ? { ...notif, read: true } : notif));
    };
    const clearAllNotifications = () => {
        setNotifications([]);
    };
    const getNotificationIcon = (type) => {
        switch (type) {
            case "message":
                return _jsx(MessageSquare, { className: "h-4 w-4 text-blue-500" });
            case "emergency":
                return _jsx(AlertTriangle, { className: "h-4 w-4 text-red-500" });
            case "alert":
                return _jsx(Bell, { className: "h-4 w-4 text-orange-500" });
            case "system":
            default:
                return _jsx(Settings, { className: "h-4 w-4 text-gray-500" });
        }
    };
    const getPriorityColor = (priority) => {
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
    const getSystemHealthColor = (health) => {
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
    const criticalNotifications = notifications.filter((n) => n.priority === "critical" && !n.read);
    return (_jsxs("div", { className: `h-full flex flex-col bg-white ${className}`, children: [_jsx(Card, { className: "rounded-b-none border-b", children: _jsxs(CardHeader, { className: "pb-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(CardTitle, { className: "flex items-center space-x-3", children: [_jsx("div", { className: "p-2 bg-blue-100 rounded-full", children: _jsx(MessageSquare, { className: "h-6 w-6 text-blue-600" }) }), _jsx("span", { children: "Communication Hub" })] }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [networkStatus.online ? (_jsx(Wifi, { className: "h-4 w-4 text-green-500" })) : (_jsx(WifiOff, { className: "h-4 w-4 text-red-500" })), _jsx("span", { className: "text-sm text-gray-600", children: networkStatus.online ? "Online" : "Offline" }), networkStatus.effectiveType && (_jsx(Badge, { variant: "outline", className: "text-xs", children: networkStatus.effectiveType.toUpperCase() }))] }), _jsxs("div", { className: "flex items-center space-x-2", children: [voiceStatus.supported ? (voiceStatus.active ? (_jsx(Mic, { className: "h-4 w-4 text-green-500" })) : (_jsx(MicOff, { className: "h-4 w-4 text-gray-400" }))) : (_jsx(VolumeX, { className: "h-4 w-4 text-gray-400" })), _jsx("span", { className: "text-sm text-gray-600", children: voiceStatus.supported
                                                        ? voiceStatus.active
                                                            ? "Recording"
                                                            : "Voice Ready"
                                                        : "Voice N/A" })] }), offlineQueueStatus.totalMessages > 0 && (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Clock, { className: "h-4 w-4 text-orange-500" }), _jsxs(Badge, { variant: "outline", className: "text-orange-600", children: [offlineQueueStatus.totalMessages, " Queued"] })] })), _jsxs(Badge, { variant: "outline", className: getSystemHealthColor(systemStats.systemHealth), children: [_jsx(Activity, { className: "h-3 w-3 mr-1" }), systemStats.systemHealth.toUpperCase()] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => setIsNotificationPanelOpen(!isNotificationPanelOpen), className: "relative", children: [_jsx(Bell, { className: "h-4 w-4" }), unreadNotifications.length > 0 && (_jsx(Badge, { variant: "destructive", className: "absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs", children: unreadNotifications.length }))] })] })] }), _jsxs("div", { className: "flex items-center justify-between pt-3 border-t", children: [_jsxs("div", { className: "flex items-center space-x-6 text-sm text-gray-600", children: [_jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(Users, { className: "h-4 w-4" }), _jsxs("span", { children: [systemStats.activeUsers, " Active Users"] })] }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsxs("span", { children: [systemStats.activeEmergencies, " Emergencies"] })] }), _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(MessageSquare, { className: "h-4 w-4" }), _jsxs("span", { children: [systemStats.messagesProcessed, " Messages Today"] })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Smartphone, { className: "h-4 w-4 text-blue-500" }), _jsx(Monitor, { className: "h-4 w-4 text-green-500" }), _jsx(Shield, { className: "h-4 w-4 text-purple-500" })] })] })] }) }), _jsxs("div", { className: "flex-1 flex overflow-hidden", children: [_jsx("div", { className: "flex-1 flex flex-col", children: _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "h-full", children: [_jsx("div", { className: "border-b px-4", children: _jsxs(TabsList, { className: "grid w-full grid-cols-2", children: [_jsxs(TabsTrigger, { value: "chat", className: "flex items-center space-x-2", children: [_jsx(MessageSquare, { className: "h-4 w-4" }), _jsx("span", { children: "Chat" })] }), _jsxs(TabsTrigger, { value: "emergency", className: "flex items-center space-x-2", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsx("span", { children: "Emergency" }), systemStats.activeEmergencies > 0 && (_jsx(Badge, { variant: "destructive", className: "ml-1", children: systemStats.activeEmergencies }))] })] }) }), _jsx(TabsContent, { value: "chat", className: "flex-1 m-0", children: _jsx(RealtimeChat, { userId: userId, channelId: "general", className: "h-full" }) }), _jsx(TabsContent, { value: "emergency", className: "flex-1 m-0 p-4", children: _jsx(EmergencyPanel, { userId: userId, className: "h-full" }) })] }) }), isNotificationPanelOpen && (_jsx("div", { className: "w-80 border-l bg-gray-50", children: _jsxs(Card, { className: "h-full rounded-none border-0", children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(CardTitle, { className: "flex items-center space-x-2", children: [_jsx(Bell, { className: "h-5 w-5" }), _jsx("span", { children: "Notifications" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [criticalNotifications.length > 0 && (_jsxs(Badge, { variant: "destructive", children: [criticalNotifications.length, " Critical"] })), _jsx(Button, { variant: "ghost", size: "sm", onClick: clearAllNotifications, className: "text-xs", children: "Clear All" })] })] }) }), _jsx(CardContent, { className: "p-0", children: _jsx(ScrollArea, { className: "h-96", children: notifications.length === 0 ? (_jsxs("div", { className: "p-4 text-center text-gray-500", children: [_jsx(CheckCircle, { className: "h-12 w-12 mx-auto mb-2 text-green-500" }), _jsx("p", { children: "No notifications" })] })) : (_jsx("div", { className: "space-y-2 p-4", children: notifications.map((notification) => (_jsx(Card, { className: `cursor-pointer transition-colors hover:bg-gray-50 ${!notification.read ? "border-l-4" : ""} ${getPriorityColor(notification.priority)}`, onClick: () => markNotificationAsRead(notification.id), children: _jsx(CardContent, { className: "p-3", children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx("div", { className: "mt-1", children: getNotificationIcon(notification.type) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("h4", { className: `text-sm font-medium truncate ${!notification.read
                                                                                    ? "text-gray-900"
                                                                                    : "text-gray-600"}`, children: notification.title }), !notification.read && (_jsx("div", { className: "h-2 w-2 bg-blue-500 rounded-full ml-2" }))] }), _jsx("p", { className: "text-xs text-gray-600 mb-2", children: notification.content }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-xs text-gray-500", children: format(new Date(notification.timestamp), "MMM d, HH:mm") }), notification.actionRequired && (_jsx(Badge, { variant: "outline", className: "text-xs text-orange-600 border-orange-200", children: "Action Required" }))] })] })] }) }) }, notification.id))) })) }) })] }) }))] })] }));
};
export default CommunicationHub;
