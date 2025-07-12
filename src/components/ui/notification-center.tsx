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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  BellRing,
  Check,
  X,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  Settings,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "system";
  priority: "low" | "medium" | "high" | "critical";
  category: "clinical" | "administrative" | "system" | "compliance" | "revenue";
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
}

interface NotificationCenterProps {
  className?: string;
  maxHeight?: string;
  showFilters?: boolean;
  onNotificationClick?: (notification: Notification) => void;
  onNotificationAction?: (notification: Notification) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  className,
  maxHeight = "400px",
  showFilters = true,
  onNotificationClick,
  onNotificationAction,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread" | "high-priority">(
    "all",
  );
  const [typeFilter, setTypeFilter] = useState<string>("all");
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
      const parsed = JSON.parse(stored).map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp),
      }));
      setNotifications(parsed);
    } else {
      const mockNotifications = generateMockNotifications();
      setNotifications(mockNotifications);
      localStorage.setItem("notifications", JSON.stringify(mockNotifications));
    }
  };

  const generateMockNotifications = (): Notification[] => {
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
        message:
          "Emergency alert for patient Sarah Ahmed - immediate attention required",
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
    if (filter === "unread" && notification.read) return false;
    if (
      filter === "high-priority" &&
      !["high", "critical"].includes(notification.priority)
    )
      return false;
    if (typeFilter !== "all" && notification.category !== typeFilter)
      return false;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;
  const criticalCount = notifications.filter(
    (n) => n.priority === "critical" && !n.read,
  ).length;

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n,
    );
    setNotifications(updated);
    localStorage.setItem("notifications", JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem("notifications", JSON.stringify(updated));
  };

  const dismissNotification = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    localStorage.setItem("notifications", JSON.stringify(updated));
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "info":
      case "system":
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: Notification["priority"]) => {
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

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  const handleActionClick = (
    notification: Notification,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    if (onNotificationAction) {
      onNotificationAction(notification);
    } else if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        {unreadCount > 0 ? (
          <BellRing className="h-5 w-5" />
        ) : (
          <Bell className="h-5 w-5" />
        )}
        {unreadCount > 0 && (
          <Badge
            className={cn(
              "absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs",
              criticalCount > 0 ? "bg-red-500" : "bg-blue-500",
            )}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-96 z-50 shadow-lg border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                    <Check className="h-4 w-4 mr-1" />
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {showFilters && (
              <div className="flex gap-2 mt-2">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="text-sm border rounded px-2 py-1"
                >
                  <option value="all">All</option>
                  <option value="unread">Unread</option>
                  <option value="high-priority">High Priority</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="text-sm border rounded px-2 py-1"
                >
                  <option value="all">All Types</option>
                  <option value="clinical">Clinical</option>
                  <option value="administrative">Administrative</option>
                  <option value="system">System</option>
                  <option value="compliance">Compliance</option>
                  <option value="revenue">Revenue</option>
                </select>
              </div>
            )}
          </CardHeader>

          <CardContent className="p-0">
            <ScrollArea style={{ height: maxHeight }}>
              {filteredNotifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors",
                        !notification.read &&
                          "bg-blue-50 border-l-4 border-l-blue-500",
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4
                              className={cn(
                                "text-sm font-medium truncate",
                                !notification.read && "font-semibold",
                              )}
                            >
                              {notification.title}
                            </h4>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs",
                                getPriorityColor(notification.priority),
                              )}
                            >
                              {notification.priority}
                            </Badge>
                          </div>

                          <p className="text-sm text-gray-600 mb-2">
                            {notification.message}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              <span
                                title={format(notification.timestamp, "PPpp")}
                              >
                                {formatDistanceToNow(notification.timestamp, {
                                  addSuffix: true,
                                })}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {notification.category}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-1">
                              {notification.actionLabel && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs h-6 px-2"
                                  onClick={(e) =>
                                    handleActionClick(notification, e)
                                  }
                                >
                                  {notification.actionLabel}
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  dismissNotification(notification.id);
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Hook for managing notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);

  const addNotification = React.useCallback(
    (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
      const newNotification: Notification = {
        ...notification,
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        read: false,
      };
      setNotifications((prev) => [newNotification, ...prev]);
    },
    [],
  );

  const markAsRead = React.useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const markAllAsRead = React.useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const deleteNotification = React.useCallback((id: string) => {
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
