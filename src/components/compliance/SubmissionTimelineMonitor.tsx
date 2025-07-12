import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Bell,
  Timer,
  Send,
  RefreshCw,
  TrendingUp,
  FileText,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SubmissionDeadline {
  id: string;
  claimId: string;
  patientName: string;
  claimType: "MSC" | "Regular" | "Emergency" | "Wheelchair";
  submissionDate: string;
  deadlineDate: string;
  deadlineTime: string;
  status: "pending" | "submitted" | "overdue" | "grace_period" | "expired";
  gracePeriodEnd?: string;
  hoursRemaining: number;
  priority: "low" | "medium" | "high" | "critical";
  remindersSent: number;
  lastReminderSent?: string;
  submittedBy?: string;
  submissionTime?: string;
  notes: string[];
}

interface ReminderSettings {
  enabled: boolean;
  intervals: number[]; // hours before deadline
  dailyDeadlineAlert: boolean;
  gracePeriodAlert: boolean;
  escalationEnabled: boolean;
}

interface SubmissionTimelineMonitorProps {
  className?: string;
}

const SubmissionTimelineMonitor: React.FC<SubmissionTimelineMonitorProps> = ({
  className = "",
}) => {
  const [submissions, setSubmissions] = useState<SubmissionDeadline[]>([]);
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>({
    enabled: true,
    intervals: [24, 12, 6, 2, 1],
    dailyDeadlineAlert: true,
    gracePeriodAlert: true,
    escalationEnabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("timeline");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSubmissions();
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      updateSubmissionStatuses();
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockSubmissions: SubmissionDeadline[] = [
        {
          id: "sub-001",
          claimId: "CLM-2024-001",
          patientName: "Ahmed Al Mansouri",
          claimType: "MSC",
          submissionDate: "2024-03-20",
          deadlineDate: "2024-03-21",
          deadlineTime: "08:00",
          status: "pending",
          gracePeriodEnd: "2024-03-21T10:00:00Z",
          hoursRemaining: 6,
          priority: "high",
          remindersSent: 2,
          lastReminderSent: "2024-03-20T14:00:00Z",
          notes: [
            "MSC claim requires submission by 8:00 AM",
            "Grace period until 10:00 AM",
          ],
        },
        {
          id: "sub-002",
          claimId: "CLM-2024-002",
          patientName: "Fatima Al Zahra",
          claimType: "Wheelchair",
          submissionDate: "2024-03-19",
          deadlineDate: "2024-03-20",
          deadlineTime: "17:00",
          status: "submitted",
          hoursRemaining: 0,
          priority: "medium",
          remindersSent: 1,
          submittedBy: "Dr. Sarah Ahmed",
          submissionTime: "2024-03-20T15:30:00Z",
          notes: ["Wheelchair pre-approval submitted successfully"],
        },
        {
          id: "sub-003",
          claimId: "CLM-2024-003",
          patientName: "Mohammed Hassan",
          claimType: "Regular",
          submissionDate: "2024-03-18",
          deadlineDate: "2024-03-19",
          deadlineTime: "23:59",
          status: "overdue",
          hoursRemaining: -18,
          priority: "critical",
          remindersSent: 4,
          lastReminderSent: "2024-03-19T22:00:00Z",
          notes: ["Claim is overdue", "Escalation required"],
        },
        {
          id: "sub-004",
          claimId: "CLM-2024-004",
          patientName: "Aisha Abdullah",
          claimType: "MSC",
          submissionDate: "2024-03-21",
          deadlineDate: "2024-03-22",
          deadlineTime: "08:00",
          status: "grace_period",
          gracePeriodEnd: "2024-03-22T10:00:00Z",
          hoursRemaining: 1,
          priority: "critical",
          remindersSent: 3,
          lastReminderSent: "2024-03-22T07:00:00Z",
          notes: ["Currently in grace period", "Must submit within 2 hours"],
        },
        {
          id: "sub-005",
          claimId: "CLM-2024-005",
          patientName: "Omar Al Rashid",
          claimType: "Emergency",
          submissionDate: "2024-03-22",
          deadlineDate: "2024-03-23",
          deadlineTime: "12:00",
          status: "pending",
          hoursRemaining: 28,
          priority: "medium",
          remindersSent: 0,
          notes: ["Emergency claim - extended deadline"],
        },
      ];
      setSubmissions(mockSubmissions);
    } catch (error) {
      console.error("Error loading submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateSubmissionStatuses = () => {
    setSubmissions((prev) =>
      prev.map((submission) => {
        const now = new Date();
        const deadline = new Date(
          `${submission.deadlineDate}T${submission.deadlineTime}:00`,
        );
        const gracePeriodEnd = submission.gracePeriodEnd
          ? new Date(submission.gracePeriodEnd)
          : null;

        const hoursRemaining = Math.round(
          (deadline.getTime() - now.getTime()) / (1000 * 60 * 60),
        );

        let status = submission.status;
        let priority = submission.priority;

        if (submission.status !== "submitted") {
          if (now > deadline) {
            if (gracePeriodEnd && now <= gracePeriodEnd) {
              status = "grace_period";
              priority = "critical";
            } else if (gracePeriodEnd && now > gracePeriodEnd) {
              status = "expired";
              priority = "critical";
            } else {
              status = "overdue";
              priority = "critical";
            }
          } else {
            status = "pending";
            if (hoursRemaining <= 2) priority = "critical";
            else if (hoursRemaining <= 6) priority = "high";
            else if (hoursRemaining <= 24) priority = "medium";
            else priority = "low";
          }
        }

        return {
          ...submission,
          hoursRemaining,
          status,
          priority,
        };
      }),
    );
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadSubmissions();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-blue-100 text-blue-800";
      case "grace_period":
        return "bg-orange-100 text-orange-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "text-red-600";
      case "high":
        return "text-orange-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const formatTimeRemaining = (hours: number) => {
    if (hours < 0) {
      return `${Math.abs(hours)}h overdue`;
    }
    if (hours < 24) {
      return `${hours}h remaining`;
    }
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h remaining`;
  };

  const sendReminder = async (submissionId: string) => {
    // Mock reminder sending
    setSubmissions((prev) =>
      prev.map((sub) =>
        sub.id === submissionId
          ? {
              ...sub,
              remindersSent: sub.remindersSent + 1,
              lastReminderSent: new Date().toISOString(),
            }
          : sub,
      ),
    );
  };

  const markAsSubmitted = async (submissionId: string) => {
    setSubmissions((prev) =>
      prev.map((sub) =>
        sub.id === submissionId
          ? {
              ...sub,
              status: "submitted",
              submittedBy: "Current User",
              submissionTime: new Date().toISOString(),
            }
          : sub,
      ),
    );
  };

  const criticalSubmissions = submissions.filter(
    (sub) => sub.priority === "critical" && sub.status !== "submitted",
  );
  const overdueSubmissions = submissions.filter(
    (sub) => sub.status === "overdue" || sub.status === "expired",
  );
  const gracePeriodSubmissions = submissions.filter(
    (sub) => sub.status === "grace_period",
  );
  const pendingSubmissions = submissions.filter(
    (sub) => sub.status === "pending",
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading submission timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6 bg-gray-50 min-h-screen p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Clock className="h-6 w-6 mr-3 text-blue-600" />
            Submission Timeline Monitor
          </h1>
          <p className="text-gray-600 mt-1">
            Track submission deadlines, 8:00 AM alerts, and grace periods
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-gray-600">
            Last updated: {currentTime.toLocaleTimeString()}
          </div>
          <Button
            onClick={refreshData}
            disabled={refreshing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw
              className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Critical Alerts */}
      {criticalSubmissions.length > 0 && (
        <Alert variant="compliance-critical">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Critical Submission Deadlines</AlertTitle>
          <AlertDescription>
            {criticalSubmissions.length} submission(s) require immediate
            attention.
            {gracePeriodSubmissions.length > 0 &&
              ` ${gracePeriodSubmissions.length} in grace period.`}
          </AlertDescription>
        </Alert>
      )}

      {/* Daily 8:00 AM Alert */}
      {currentTime.getHours() === 8 && currentTime.getMinutes() < 30 && (
        <Alert variant="doh-requirement">
          <Bell className="h-4 w-4" />
          <AlertTitle>Daily 8:00 AM Deadline Alert</AlertTitle>
          <AlertDescription>
            MSC claims must be submitted by 8:00 AM daily. Check pending MSC
            submissions.
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-blue-600">
                  {pendingSubmissions.length}
                </p>
              </div>
              <Timer className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Grace Period</p>
                <p className="text-2xl font-bold text-orange-600">
                  {gracePeriodSubmissions.length}
                </p>
              </div>
              <Zap className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">
                  {overdueSubmissions.length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Submitted Today</p>
                <p className="text-2xl font-bold text-green-600">
                  {
                    submissions.filter(
                      (sub) =>
                        sub.status === "submitted" &&
                        sub.submissionTime &&
                        new Date(sub.submissionTime).toDateString() ===
                          new Date().toDateString(),
                    ).length
                  }
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="critical">Critical</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Submission Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {submissions
                  .sort((a, b) => a.hoursRemaining - b.hoursRemaining)
                  .map((submission) => (
                    <Card
                      key={submission.id}
                      className={cn(
                        "transition-all hover:shadow-md",
                        submission.priority === "critical" &&
                          "border-l-4 border-l-red-500",
                        submission.status === "grace_period" &&
                          "border-l-4 border-l-orange-500",
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold">
                                {submission.patientName}
                              </h3>
                              <Badge
                                className={getStatusColor(submission.status)}
                              >
                                {submission.status.replace("_", " ")}
                              </Badge>
                              <Badge variant="outline">
                                {submission.claimType}
                              </Badge>
                              <span
                                className={cn(
                                  "text-sm font-medium",
                                  getPriorityColor(submission.priority),
                                )}
                              >
                                {submission.priority.toUpperCase()}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                              <div>
                                <span className="text-gray-600">Claim ID:</span>
                                <p className="font-medium">
                                  {submission.claimId}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-600">Deadline:</span>
                                <p className="font-medium">
                                  {new Date(
                                    submission.deadlineDate,
                                  ).toLocaleDateString()}{" "}
                                  {submission.deadlineTime}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-600">
                                  Time Remaining:
                                </span>
                                <p
                                  className={cn(
                                    "font-medium",
                                    submission.hoursRemaining < 0
                                      ? "text-red-600"
                                      : submission.hoursRemaining <= 2
                                        ? "text-orange-600"
                                        : "text-green-600",
                                  )}
                                >
                                  {formatTimeRemaining(
                                    submission.hoursRemaining,
                                  )}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-600">
                                  Reminders Sent:
                                </span>
                                <p className="font-medium">
                                  {submission.remindersSent}
                                </p>
                              </div>
                            </div>
                            {submission.gracePeriodEnd &&
                              submission.status === "grace_period" && (
                                <div className="mb-3 p-2 bg-orange-50 rounded">
                                  <div className="flex items-center space-x-2">
                                    <Zap className="h-4 w-4 text-orange-600" />
                                    <span className="text-sm text-orange-800">
                                      Grace period ends:{" "}
                                      {new Date(
                                        submission.gracePeriodEnd,
                                      ).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              )}
                            {submission.notes.length > 0 && (
                              <div className="mt-3">
                                <h4 className="font-medium text-gray-800 mb-1">
                                  Notes:
                                </h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                  {submission.notes.map((note, index) => (
                                    <li key={index}>• {note}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col space-y-2">
                            {submission.status === "pending" ||
                            submission.status === "grace_period" ? (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => markAsSubmitted(submission.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Send className="h-3 w-3 mr-1" />
                                  Mark Submitted
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => sendReminder(submission.id)}
                                >
                                  <Bell className="h-3 w-3 mr-1" />
                                  Send Reminder
                                </Button>
                              </>
                            ) : submission.status === "submitted" ? (
                              <div className="text-center">
                                <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
                                <p className="text-xs text-gray-600">
                                  Submitted by {submission.submittedBy}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {submission.submissionTime &&
                                    new Date(
                                      submission.submissionTime,
                                    ).toLocaleString()}
                                </p>
                              </div>
                            ) : (
                              <Button size="sm" variant="outline">
                                View Details
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="critical">
          <Card>
            <CardHeader>
              <CardTitle>Critical Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {criticalSubmissions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>No critical submissions at this time</p>
                  </div>
                ) : (
                  criticalSubmissions.map((submission) => (
                    <Card
                      key={submission.id}
                      className="border-l-4 border-l-red-500"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-red-800">
                              {submission.patientName} - {submission.claimId}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {submission.claimType} |{" "}
                              {formatTimeRemaining(submission.hoursRemaining)}
                            </p>
                            <Badge
                              className={getStatusColor(submission.status)}
                            >
                              {submission.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => markAsSubmitted(submission.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Submit Now
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => sendReminder(submission.id)}
                            >
                              Send Alert
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reminders">
          <Card>
            <CardHeader>
              <CardTitle>Reminder System</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Reminder Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span>Automated Reminders</span>
                          <Badge
                            className={
                              reminderSettings.enabled
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {reminderSettings.enabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">
                            Reminder Intervals:
                          </span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {reminderSettings.intervals.map((interval) => (
                              <Badge key={interval} variant="outline">
                                {interval}h before
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Daily 8:00 AM Alert</span>
                          <Badge
                            className={
                              reminderSettings.dailyDeadlineAlert
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {reminderSettings.dailyDeadlineAlert
                              ? "Active"
                              : "Inactive"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Grace Period Alerts</span>
                          <Badge
                            className={
                              reminderSettings.gracePeriodAlert
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {reminderSettings.gracePeriodAlert
                              ? "Active"
                              : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Recent Reminders
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {submissions
                          .filter((sub) => sub.lastReminderSent)
                          .sort(
                            (a, b) =>
                              new Date(b.lastReminderSent!).getTime() -
                              new Date(a.lastReminderSent!).getTime(),
                          )
                          .slice(0, 5)
                          .map((submission) => (
                            <div
                              key={submission.id}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded"
                            >
                              <div>
                                <p className="font-medium text-sm">
                                  {submission.patientName}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {submission.lastReminderSent &&
                                    new Date(
                                      submission.lastReminderSent,
                                    ).toLocaleString()}
                                </p>
                              </div>
                              <Badge variant="outline">
                                {submission.remindersSent} sent
                              </Badge>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Submission Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>On-Time Submissions</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={85} className="w-20 h-2" />
                      <span className="text-sm font-medium">85%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Grace Period Usage</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={12} className="w-20 h-2" />
                      <span className="text-sm font-medium">12%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Overdue Rate</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={3} className="w-20 h-2" />
                      <span className="text-sm font-medium">3%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Claim Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["MSC", "Regular", "Emergency", "Wheelchair"].map((type) => {
                    const count = submissions.filter(
                      (sub) => sub.claimType === type,
                    ).length;
                    const percentage = Math.round(
                      (count / submissions.length) * 100,
                    );
                    return (
                      <div
                        key={type}
                        className="flex items-center justify-between"
                      >
                        <span>{type}</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={percentage} className="w-20 h-2" />
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SubmissionTimelineMonitor;
