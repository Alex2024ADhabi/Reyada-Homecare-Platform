import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  MessageSquare,
  FileText,
  Heart,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  CheckCircle,
  AlertCircle,
  Bell,
} from "lucide-react";
import {
  PatientUser,
  PatientDashboardData,
  Appointment,
  CarePlan,
} from "@/types/patient-portal";
import { useSatisfactionSurveys } from "@/hooks/useSatisfactionSurveys";
import SatisfactionSurveyComponent from "./SatisfactionSurvey";
import { format, isToday, isTomorrow } from "date-fns";
import { useMalaffiSync } from "@/hooks/useMalaffiSync";
import { usePatientData } from "@/hooks/usePatientData";

interface PatientDashboardProps {
  patient: PatientUser;
  dashboardData?: PatientDashboardData;
  className?: string;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  patient,
  dashboardData,
  className = "",
}) => {
  const { pendingSurveys } = useSatisfactionSurveys(patient.id);
  const { syncStatus, lastSync, triggerSync } = useMalaffiSync(patient.id);
  const {
    patientData,
    isLoading: patientDataLoading,
    refreshData,
  } = usePatientData(patient.id);
  const getAppointmentDateLabel = (date: string) => {
    const appointmentDate = new Date(date);
    if (isToday(appointmentDate)) return "Today";
    if (isTomorrow(appointmentDate)) return "Tomorrow";
    return format(appointmentDate, "MMM dd");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "confirmed":
      case "scheduled":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTrendIcon = (trend: "improving" | "stable" | "declining") => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "declining":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Welcome back, {patient.firstName}!
            </h2>
            <p className="text-blue-100">
              Here's an overview of your health journey and upcoming activities.
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  syncStatus === "synced"
                    ? "bg-green-400"
                    : syncStatus === "syncing"
                      ? "bg-yellow-400 animate-pulse"
                      : "bg-red-400"
                }`}
              ></div>
              <span className="text-sm text-blue-100">
                {syncStatus === "synced"
                  ? "Data Synced"
                  : syncStatus === "syncing"
                    ? "Syncing..."
                    : "Sync Pending"}
              </span>
            </div>
            {lastSync && (
              <p className="text-xs text-blue-200">
                Last sync: {format(new Date(lastSync), "MMM dd, HH:mm")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Upcoming Appointments
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData?.upcomingAppointments?.length || 0}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Care Plans
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData?.activeCarePlans?.length || 0}
                </p>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Unread Messages
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData?.notifications?.unread || 0}
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Health Metrics
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData?.healthMetrics?.recent?.length || 0}
                </p>
                <div className="flex items-center mt-1">
                  <div
                    className={`w-1 h-1 rounded-full mr-1 ${
                      patientData?.malaffiSync?.status === "active"
                        ? "bg-green-500"
                        : "bg-gray-400"
                    }`}
                  ></div>
                  <span className="text-xs text-gray-500">
                    {patientData?.malaffiSync?.status === "active"
                      ? "EMR Connected"
                      : "EMR Offline"}
                  </span>
                </div>
              </div>
              <Heart className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Upcoming Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData?.upcomingAppointments?.length ? (
              <div className="space-y-4">
                {dashboardData.upcomingAppointments
                  .slice(0, 3)
                  .map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">
                            {appointment.title}
                          </h4>
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {appointment.providerName} •{" "}
                          {appointment.location.type}
                        </p>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Clock className="h-4 w-4 mr-1" />
                          {getAppointmentDateLabel(
                            appointment.scheduledDate,
                          )}{" "}
                          at{" "}
                          {format(new Date(appointment.scheduledDate), "HH:mm")}
                        </div>
                      </div>
                    </div>
                  ))}
                <Button variant="outline" className="w-full">
                  View All Appointments
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No upcoming appointments</p>
                <Button className="mt-4">Schedule Appointment</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Care Plans */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Active Care Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData?.activeCarePlans?.length ? (
              <div className="space-y-4">
                {dashboardData.activeCarePlans.slice(0, 2).map((carePlan) => {
                  const overallProgress =
                    carePlan.goals.reduce(
                      (acc, goal) => acc + goal.progress,
                      0,
                    ) / carePlan.goals.length;
                  return (
                    <div
                      key={carePlan.id}
                      className="p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">
                          {carePlan.title}
                        </h4>
                        <Badge className={getStatusColor(carePlan.status)}>
                          {carePlan.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {carePlan.description}
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            Overall Progress
                          </span>
                          <span className="font-medium">
                            {Math.round(overallProgress)}%
                          </span>
                        </div>
                        <Progress value={overallProgress} className="h-2" />
                      </div>
                      <div className="flex justify-between items-center mt-3 text-sm text-gray-500">
                        <span>{carePlan.goals.length} goals</span>
                        <span>
                          {carePlan.interventions.length} interventions
                        </span>
                      </div>
                    </div>
                  );
                })}
                <Button variant="outline" className="w-full">
                  View All Care Plans
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No active care plans</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="h-5 w-5 mr-2" />
              Health Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData?.healthMetrics?.trends?.length ? (
              <div className="space-y-4">
                {dashboardData.healthMetrics.trends.map((trend, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      {getTrendIcon(trend.trend)}
                      <div>
                        <p className="font-medium text-gray-900 capitalize">
                          {trend.type.replace("-", " ")}
                        </p>
                        <p className="text-sm text-gray-600">
                          {trend.trend === "improving"
                            ? "Improving"
                            : trend.trend === "declining"
                              ? "Needs attention"
                              : "Stable"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-medium ${
                          trend.trend === "improving"
                            ? "text-green-600"
                            : trend.trend === "declining"
                              ? "text-red-600"
                              : "text-gray-600"
                        }`}
                      >
                        {trend.change > 0 ? "+" : ""}
                        {trend.change}%
                      </p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  View Detailed Metrics
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No health data available</p>
                <Button className="mt-4">Start Tracking</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Recent Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData?.notifications?.recent?.length ? (
              <div className="space-y-3">
                {dashboardData.notifications.recent
                  .slice(0, 4)
                  .map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border-l-4 ${
                        notification.read
                          ? "bg-gray-50 border-gray-300"
                          : "bg-blue-50 border-blue-500"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4
                            className={`text-sm font-medium ${
                              notification.read
                                ? "text-gray-700"
                                : "text-gray-900"
                            }`}
                          >
                            {notification.title}
                          </h4>
                          <p
                            className={`text-sm mt-1 ${
                              notification.read
                                ? "text-gray-500"
                                : "text-gray-600"
                            }`}
                          >
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {format(
                              new Date(notification.createdAt),
                              "MMM dd, HH:mm",
                            )}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
                        )}
                      </div>
                    </div>
                  ))}
                <Button variant="outline" className="w-full">
                  View All Notifications
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No recent notifications</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pending Surveys */}
      {(pendingSurveys.length > 0 ||
        dashboardData?.pendingSurveys?.length > 0) && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            Pending Surveys
          </h3>
          {pendingSurveys.map((survey) => (
            <SatisfactionSurveyComponent
              key={survey.id}
              survey={survey}
              onComplete={() => {
                // Refresh dashboard data if needed
              }}
              onDismiss={() => {
                // Handle survey dismissal
              }}
            />
          ))}
          {dashboardData?.pendingSurveys?.map((survey) => (
            <div
              key={survey.id}
              className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{survey.title}</h4>
                  <p className="text-sm text-gray-600">
                    {survey.questions.length} questions • Expires{" "}
                    {format(new Date(survey.expiresAt), "MMM dd")}
                  </p>
                </div>
                <Button size="sm">Complete Survey</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
