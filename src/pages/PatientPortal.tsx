import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  Calendar,
  MessageSquare,
  FileText,
  Settings,
  Bell,
  Heart,
  BookOpen,
  Shield,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { PatientDashboard } from "@/components/patient-portal/PatientDashboard";
import { CarePlanViewer } from "@/components/patient-portal/CarePlanViewer";
import { AppointmentScheduler } from "@/components/patient-portal/AppointmentScheduler";
import { SecureMessaging } from "@/components/patient-portal/SecureMessaging";
import { HealthTrackingTools } from "@/components/patient-portal/HealthTrackingTools";
import { HealthEducationModules } from "@/components/patient-portal/HealthEducationModules";
import { NotificationSettings } from "@/components/patient-portal/NotificationSettings";
import { FamilyAccessControls } from "@/components/patient-portal/FamilyAccessControls";
import { usePatientAuth } from "@/hooks/usePatientAuth";
import { usePatientData } from "@/hooks/usePatientData";
import { PatientUser } from "@/types/patient-portal";

interface PatientPortalProps {
  className?: string;
}

export const PatientPortal: React.FC<PatientPortalProps> = ({
  className = "",
}) => {
  const navigate = useNavigate();
  const {
    patient,
    isAuthenticated,
    logout,
    isLoading: authLoading,
  } = usePatientAuth();
  const {
    dashboardData,
    isLoading: dataLoading,
    error,
  } = usePatientData(patient?.id);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/patient/login");
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/patient/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: User },
    { id: "care-plans", label: "Care Plans", icon: FileText },
    { id: "appointments", label: "Appointments", icon: Calendar },
    {
      id: "messages",
      label: "Messages",
      icon: MessageSquare,
      badge: dashboardData?.notifications.unread || 0,
    },
    { id: "health-tracking", label: "Health Tracking", icon: Heart },
    { id: "education", label: "Education", icon: BookOpen },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your portal...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !patient) {
    return null;
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                {sidebarOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
              <div className="flex items-center ml-4 lg:ml-0">
                <Shield className="h-8 w-8 text-blue-600" />
                <h1 className="ml-2 text-xl font-semibold text-gray-900">
                  Patient Portal
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="h-6 w-6 text-gray-400 hover:text-gray-500 cursor-pointer" />
                {dashboardData?.notifications.unread > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs">
                    {dashboardData.notifications.unread}
                  </Badge>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {patient.firstName} {patient.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    Patient ID: {patient.id.slice(-8)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white shadow-lg border-r transition-transform duration-300 ease-in-out
          lg:shadow-none
        `}
        >
          <div className="h-full flex flex-col pt-16 lg:pt-0">
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`
                      w-full flex items-center px-3 py-2 text-sm font-medium rounded-md
                      transition-colors duration-200
                      ${
                        activeTab === item.id
                          ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }
                    `}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.label}
                    {item.badge && item.badge > 0 && (
                      <Badge className="ml-auto h-5 w-5 flex items-center justify-center text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {dataLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {activeTab === "dashboard" && (
                  <PatientDashboard
                    patient={patient}
                    dashboardData={dashboardData}
                  />
                )}

                {activeTab === "care-plans" && (
                  <CarePlanViewer
                    patientId={patient.id}
                    carePlans={dashboardData?.activeCarePlans || []}
                  />
                )}

                {activeTab === "appointments" && (
                  <AppointmentScheduler
                    patientId={patient.id}
                    upcomingAppointments={
                      dashboardData?.upcomingAppointments || []
                    }
                  />
                )}

                {activeTab === "messages" && (
                  <SecureMessaging
                    patientId={patient.id}
                    recentMessages={dashboardData?.recentMessages || []}
                  />
                )}

                {activeTab === "health-tracking" && (
                  <HealthTrackingTools
                    patientId={patient.id}
                    healthMetrics={dashboardData?.healthMetrics}
                  />
                )}

                {activeTab === "education" && (
                  <HealthEducationModules
                    patientId={patient.id}
                    recommendations={
                      dashboardData?.educationalRecommendations || []
                    }
                  />
                )}

                {activeTab === "settings" && (
                  <div className="space-y-6">
                    <NotificationSettings patientId={patient.id} />
                    <FamilyAccessControls patientId={patient.id} />
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PatientPortal;
