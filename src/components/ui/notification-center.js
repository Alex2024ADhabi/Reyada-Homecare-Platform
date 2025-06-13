import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, BellRing, Check, X, AlertTriangle, Info, CheckCircle, Clock, } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
export const NotificationCenter = ({ className, maxHeight = "400px", showFilters = true, onNotificationClick, onNotificationAction, }) => {
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [isOpen, setIsOpen] = useState(false);
    useEffect(() => {
        loadNotifications();
        const interval = setInterval(loadNotifications, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);
    const loadNotifications = () => {
        // Load from localStorage or generate mock data
        const stored = localStorage.getItem("notifications");
        if (stored) {
            const parsed = JSON.parse(stored).map((n) => ({
                ...n,
                timestamp: new Date(n.timestamp),
            }));
            setNotifications(parsed);
        }
        else {
            const mockNotifications = generateMockNotifications();
            setNotifications(mockNotifications);
            localStorage.setItem("notifications", JSON.stringify(mockNotifications));
        }
    };
    const generateMockNotifications = () => {
        const now = new Date();
        return [
            {
                id: "1",
                title: "Patient Assessment Due",
                message: "Patient John Doe requires monthly assessment review",
                type: "warning",
                priority: "high",
                category: "clinical",
                timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
                read: false,
                actionUrl: "/patients/john-doe/assessment",
                actionLabel: "Review Assessment",
            },
            {
                id: "2",
                title: "Daman Authorization Approved",
                message: "Authorization request #DA-2024-001 has been approved",
                type: "success",
                priority: "medium",
                category: "administrative",
                timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
                read: false,
                actionUrl: "/authorizations/DA-2024-001",
                actionLabel: "View Details",
            },
            {
                id: "3",
                title: "System Maintenance Scheduled",
                message: "Planned maintenance window: Tonight 11 PM - 2 AM",
                type: "info",
                priority: "low",
                category: "system",
                timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000), // 6 hours ago
                read: true,
            },
            {
                id: "4",
                title: "Critical: Patient Emergency",
                message: "Emergency alert for patient Sarah Ahmed - immediate attention required",
                type: "error",
                priority: "critical",
                category: "clinical",
                timestamp: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
                read: false,
                actionUrl: "/patients/sarah-ahmed/emergency",
                actionLabel: "Respond Now",
            },
            {
                id: "5",
                title: "Compliance Report Generated",
                message: "Monthly DOH compliance report is ready for review",
                type: "info",
                priority: "medium",
                category: "compliance",
                timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
                read: true,
                actionUrl: "/compliance/reports/monthly",
                actionLabel: "View Report",
            },
        ];
    };
    const filteredNotifications = notifications.filter((notification) => {
        if (filter === "unread" && notification.read)
            return false;
        if (filter === "high-priority" &&
            !["high", "critical"].includes(notification.priority))
            return false;
        if (typeFilter !== "all" && notification.category !== typeFilter)
            return false;
        return true;
    });
    const unreadCount = notifications.filter((n) => !n.read).length;
    const criticalCount = notifications.filter((n) => n.priority === "critical" && !n.read).length;
    const markAsRead = (id) => {
        const updated = notifications.map((n) => n.id === id ? { ...n, read: true } : n);
        setNotifications(updated);
        localStorage.setItem("notifications", JSON.stringify(updated));
    };
    const markAllAsRead = () => {
        const updated = notifications.map((n) => ({ ...n, read: true }));
        setNotifications(updated);
        localStorage.setItem("notifications", JSON.stringify(updated));
    };
    const dismissNotification = (id) => {
        const updated = notifications.filter((n) => n.id !== id);
        setNotifications(updated);
        localStorage.setItem("notifications", JSON.stringify(updated));
    };
    const getNotificationIcon = (type) => {
        switch (type) {
            case "success":
                return _jsx(CheckCircle, { className: "h-4 w-4 text-green-500" });
            case "warning":
                return _jsx(AlertTriangle, { className: "h-4 w-4 text-yellow-500" });
            case "error":
                return _jsx(AlertTriangle, { className: "h-4 w-4 text-red-500" });
            case "info":
            case "system":
            default:
                return _jsx(Info, { className: "h-4 w-4 text-blue-500" });
        }
    };
    const getPriorityColor = (priority) => {
        switch (priority) {
            case "critical":
                return "bg-red-100 text-red-800 border-red-200";
            case "high":
                return "bg-orange-100 text-orange-800 border-orange-200";
            case "medium":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "low":
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };
    const handleNotificationClick = (notification) => {
        if (!notification.read) {
            markAsRead(notification.id);
        }
        if (onNotificationClick) {
            onNotificationClick(notification);
        }
    };
    const handleActionClick = (notification, e) => {
        e.stopPropagation();
        if (onNotificationAction) {
            onNotificationAction(notification);
        }
        else if (notification.actionUrl) {
            window.location.href = notification.actionUrl;
        }
    };
    return (_jsxs("div", { className: cn("relative", className), children: [_jsxs(Button, { variant: "ghost", size: "sm", className: "relative", onClick: () => setIsOpen(!isOpen), children: [unreadCount > 0 ? (_jsx(BellRing, { className: "h-5 w-5" })) : (_jsx(Bell, { className: "h-5 w-5" })), unreadCount > 0 && (_jsx(Badge, { className: cn("absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs", criticalCount > 0 ? "bg-red-500" : "bg-blue-500"), children: unreadCount > 99 ? "99+" : unreadCount }))] }), isOpen && (_jsxs(Card, { className: "absolute right-0 top-full mt-2 w-96 z-50 shadow-lg border", children: [_jsxs(CardHeader, { className: "pb-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { className: "text-lg", children: "Notifications" }), _jsxs("div", { className: "flex items-center gap-2", children: [unreadCount > 0 && (_jsxs(Button, { variant: "ghost", size: "sm", onClick: markAllAsRead, children: [_jsx(Check, { className: "h-4 w-4 mr-1" }), "Mark all read"] })), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => setIsOpen(false), children: _jsx(X, { className: "h-4 w-4" }) })] })] }), showFilters && (_jsxs("div", { className: "flex gap-2 mt-2", children: [_jsxs("select", { value: filter, onChange: (e) => setFilter(e.target.value), className: "text-sm border rounded px-2 py-1", children: [_jsx("option", { value: "all", children: "All" }), _jsx("option", { value: "unread", children: "Unread" }), _jsx("option", { value: "high-priority", children: "High Priority" })] }), _jsxs("select", { value: typeFilter, onChange: (e) => setTypeFilter(e.target.value), className: "text-sm border rounded px-2 py-1", children: [_jsx("option", { value: "all", children: "All Types" }), _jsx("option", { value: "clinical", children: "Clinical" }), _jsx("option", { value: "administrative", children: "Administrative" }), _jsx("option", { value: "system", children: "System" }), _jsx("option", { value: "compliance", children: "Compliance" }), _jsx("option", { value: "revenue", children: "Revenue" })] })] }))] }), _jsx(CardContent, { className: "p-0", children: _jsx(ScrollArea, { style: { height: maxHeight }, children: filteredNotifications.length === 0 ? (_jsxs("div", { className: "p-4 text-center text-gray-500", children: [_jsx(Bell, { className: "h-8 w-8 mx-auto mb-2 opacity-50" }), _jsx("p", { children: "No notifications" })] })) : (_jsx("div", { className: "space-y-1", children: filteredNotifications.map((notification) => (_jsx("div", { className: cn("p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors", !notification.read &&
                                        "bg-blue-50 border-l-4 border-l-blue-500"), onClick: () => handleNotificationClick(notification), children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "mt-0.5", children: getNotificationIcon(notification.type) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("h4", { className: cn("text-sm font-medium truncate", !notification.read && "font-semibold"), children: notification.title }), _jsx(Badge, { variant: "outline", className: cn("text-xs", getPriorityColor(notification.priority)), children: notification.priority })] }), _jsx("p", { className: "text-sm text-gray-600 mb-2", children: notification.message }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2 text-xs text-gray-500", children: [_jsx(Clock, { className: "h-3 w-3" }), _jsx("span", { title: format(notification.timestamp, "PPpp"), children: formatDistanceToNow(notification.timestamp, {
                                                                            addSuffix: true,
                                                                        }) }), _jsx(Badge, { variant: "outline", className: "text-xs", children: notification.category })] }), _jsxs("div", { className: "flex items-center gap-1", children: [notification.actionLabel && (_jsx(Button, { variant: "ghost", size: "sm", className: "text-xs h-6 px-2", onClick: (e) => handleActionClick(notification, e), children: notification.actionLabel })), _jsx(Button, { variant: "ghost", size: "sm", className: "h-6 w-6 p-0", onClick: (e) => {
                                                                            e.stopPropagation();
                                                                            dismissNotification(notification.id);
                                                                        }, children: _jsx(X, { className: "h-3 w-3" }) })] })] })] })] }) }, notification.id))) })) }) })] }))] }));
};
// Hook for managing notifications
export const useNotifications = () => {
    const [notifications, setNotifications] = React.useState([]);
    const addNotification = React.useCallback((notification) => {
        const newNotification = {
            ...notification,
            id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
            read: false,
        };
        setNotifications((prev) => [newNotification, ...prev]);
    }, []);
    const markAsRead = React.useCallback((id) => {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    }, []);
    const markAllAsRead = React.useCallback(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }, []);
    const deleteNotification = React.useCallback((id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);
    const clearAll = React.useCallback(() => {
        setNotifications([]);
    }, []);
    const getUnreadCount = React.useCallback(() => {
        return notifications.filter((n) => !n.read).length;
    }, [notifications]);
    return {
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        getUnreadCount,
    };
};
export default NotificationCenter;
