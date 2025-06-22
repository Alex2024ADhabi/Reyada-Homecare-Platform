import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Hospital,
  Users,
  FileText,
  CheckCircle,
  Shield,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";
import { connectToDatabase, getDb, resetDatabase } from "@/api/db";
import { ObjectId } from "@/api/browser-mongodb";
import { useToastContext } from "@/components/ui/toast-provider";
import { useErrorHandler } from "@/services/error-handler.service";
import { LoadingSpinner } from "@/components/ui/loading-states";
import { OfflineBanner } from "@/components/ui/offline-banner";
import { offlineService } from "@/services/offline.service";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

function Home() {
  const navigate = useNavigate();
  const { toast } = useToastContext();
  const { handleApiError, handleSuccess } = useErrorHandler();
  const {
    user,
    session,
    userProfile,
    loading: authLoading,
    hasPermission,
    isRole,
  } = useSupabaseAuth();
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingItems, setPendingItems] = useState({
    clinicalForms: 0,
    patientAssessments: 0,
    serviceInitiations: 0,
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [roleStats, setRoleStats] = useState({
    todayVisits: 0,
    pendingTasks: 0,
    urgentAlerts: 0,
    completionRate: 0,
  });
  const [personalizedActions, setPersonalizedActions] = useState<any[]>([]);

  useEffect(() => {
    initializeDatabase();
    loadPendingItems();
    loadPersonalizedDashboard();

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      handleSuccess("Connection Restored", "You are now back online");
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Connection Lost",
        description:
          "You are now working offline. Changes will be saved locally.",
        variant: "warning",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const initializeDatabase = async () => {
    try {
      setLoading(true);
      setMessage("Connecting to database...");
      await connectToDatabase();

      setMessage("Loading referrals...");
      const db = getDb();
      const result = await db.collection("referrals").find().toArray();

      if (result.length === 0) {
        setMessage("No referrals found. Adding sample data...");
        await addSampleData();
        const newResult = await db.collection("referrals").find().toArray();
        setReferrals(newResult);
      } else {
        setReferrals(result);
      }

      setMessage("");
      handleSuccess(
        "Database Connected",
        "Successfully connected to the database",
      );
    } catch (error) {
      console.error("Database initialization error:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setMessage(`Error: ${errorMessage}`);
      handleApiError(error, "Database Initialization");
    } finally {
      setLoading(false);
    }
  };

  const addSampleData = async () => {
    const db = getDb();
    const sampleReferrals = [
      {
        referralDate: new Date(),
        referralSource: "Dr. Smith Clinic",
        referralSourceContact: "dr.smith@example.com",
        patientName: "John Doe",
        patientContact: "john.doe@example.com",
        preliminaryNeeds: "Post-surgery care",
        insuranceInfo: "MetLife #12345",
        geographicLocation: "Dubai, UAE",
        acknowledgmentStatus: "Pending",
        initialContactCompleted: false,
        documentationPrepared: false,
        referralStatus: "New",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        referralDate: new Date(Date.now() - 86400000), // Yesterday
        referralSource: "Central Hospital",
        referralSourceContact: "referrals@centralhospital.com",
        patientName: "Jane Smith",
        patientContact: "jane.smith@example.com",
        preliminaryNeeds: "Chronic condition management",
        insuranceInfo: "Daman #67890",
        geographicLocation: "Abu Dhabi, UAE",
        acknowledgmentStatus: "Acknowledged",
        acknowledgmentDate: new Date(),
        acknowledgedBy: "Nurse Manager",
        initialContactCompleted: true,
        documentationPrepared: false,
        referralStatus: "In Progress",
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(),
      },
    ];

    await db.collection("referrals").insertMany(sampleReferrals);
  };

  const resetDatabaseHandler = async () => {
    try {
      setLoading(true);
      setMessage("Resetting database...");
      resetDatabase();
      await addSampleData();
      const db = getDb();
      const result = await db.collection("referrals").find().toArray();
      setReferrals(result);
      setMessage("Database reset successfully!");
      handleSuccess(
        "Database Reset",
        "Database has been reset with sample data",
      );
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error resetting database:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setMessage(`Error: ${errorMessage}`);
      handleApiError(error, "Database Reset");
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeReferral = async (id: string) => {
    try {
      setLoading(true);

      if (!isOnline) {
        // Save to offline storage
        await offlineService.addToQueue({
          url: `/api/referrals/${id}/acknowledge`,
          method: "PATCH",
          data: {
            acknowledgmentStatus: "Acknowledged",
            acknowledgmentDate: new Date(),
            acknowledgedBy: "Current User",
            updatedAt: new Date(),
          },
          headers: { "Content-Type": "application/json" },
          timestamp: new Date().toISOString(),
        });

        // Update local state
        setReferrals((prev) =>
          prev.map((ref) =>
            ref._id.toString() === id
              ? {
                  ...ref,
                  acknowledgmentStatus: "Acknowledged",
                  acknowledgedBy: "Current User",
                }
              : ref,
          ),
        );

        toast({
          title: "Referral Acknowledged (Offline)",
          description: "Changes will be synced when you're back online",
          variant: "warning",
        });
        return;
      }

      const db = getDb();
      await db.collection("referrals").updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            acknowledgmentStatus: "Acknowledged",
            acknowledgmentDate: new Date(),
            acknowledgedBy: "Current User",
            updatedAt: new Date(),
          },
        },
      );

      const result = await db.collection("referrals").find().toArray();
      setReferrals(result);
      setMessage("Referral acknowledged successfully!");
      handleSuccess(
        "Referral Acknowledged",
        "Referral has been successfully acknowledged",
      );
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error acknowledging referral:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setMessage(`Error: ${errorMessage}`);
      handleApiError(error, "Acknowledge Referral");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "New":
        return "bg-blue-100 text-blue-800";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800";
      case "Accepted":
        return "bg-green-100 text-green-800";
      case "Declined":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAcknowledgmentBadgeColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Acknowledged":
        return "bg-green-100 text-green-800";
      case "Processed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const loadPendingItems = useCallback(async () => {
    try {
      const pendingSyncItems = await offlineService.getPendingSyncItems();
      setPendingItems({
        clinicalForms: pendingSyncItems.clinicalForms.length,
        patientAssessments: pendingSyncItems.patientAssessments.length,
        serviceInitiations: pendingSyncItems.serviceInitiations.length,
      });
    } catch (error) {
      console.error("Error loading pending items:", error);
    }
  }, []);

  const handleSyncClick = async () => {
    if (!isOnline) {
      toast({
        title: "Cannot Sync",
        description: "You need to be online to sync data",
        variant: "destructive",
      });
      return;
    }

    setIsSyncing(true);
    try {
      // Simulate sync process
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setPendingItems({
        clinicalForms: 0,
        patientAssessments: 0,
        serviceInitiations: 0,
      });
      handleSuccess(
        "Sync Complete",
        "All pending items have been synchronized",
      );
    } catch (error) {
      handleApiError(error, "Data Sync");
    } finally {
      setIsSyncing(false);
    }
  };

  const loadPersonalizedDashboard = useCallback(async () => {
    if (!user || !userProfile) return;

    try {
      // Load role-specific statistics
      const stats = await loadRoleSpecificStats(userProfile.role);
      setRoleStats(stats);

      // Load personalized actions based on role and permissions
      const actions = getPersonalizedActions(
        userProfile.role,
        userProfile.permissions || [],
      );
      setPersonalizedActions(actions);
    } catch (error) {
      console.error("Error loading personalized dashboard:", error);
    }
  }, [user, userProfile]);

  const loadRoleSpecificStats = async (role: string) => {
    // Simulate role-specific data loading
    const baseStats = {
      todayVisits: Math.floor(Math.random() * 20) + 5,
      pendingTasks: Math.floor(Math.random() * 15) + 2,
      urgentAlerts: Math.floor(Math.random() * 5),
      completionRate: Math.floor(Math.random() * 30) + 70,
    };

    // Adjust stats based on role
    switch (role) {
      case "nurse":
        return {
          ...baseStats,
          todayVisits: baseStats.todayVisits + 10,
          pendingTasks: baseStats.pendingTasks + 5,
        };
      case "doctor":
        return {
          ...baseStats,
          urgentAlerts: baseStats.urgentAlerts + 3,
          completionRate: Math.min(95, baseStats.completionRate + 10),
        };
      case "admin":
        return {
          ...baseStats,
          todayVisits: baseStats.todayVisits * 2,
          pendingTasks: baseStats.pendingTasks * 1.5,
        };
      default:
        return baseStats;
    }
  };

  const getPersonalizedActions = (role: string, permissions: string[]) => {
    const allActions = [
      {
        title: "Patient Management",
        description: "Manage patient records and episodes",
        icon: Users,
        path: "/patients",
        permission: "patient.read",
        priority: 1,
      },
      {
        title: "Clinical Documentation",
        description: "Complete clinical forms and assessments",
        icon: FileText,
        path: "/clinical/forms",
        permission: "clinical.write",
        priority: 2,
      },
      {
        title: "Quality Assurance",
        description: "Monitor compliance and quality metrics",
        icon: CheckCircle,
        path: "/quality",
        permission: "quality.read",
        priority: 3,
      },
      {
        title: "Claims & Revenue",
        description: "Process insurance claims and revenue",
        icon: Shield,
        path: "/claims",
        permission: "claims.read",
        priority: 4,
      },
      {
        title: "Reports & Analytics",
        description: "View performance and operational reports",
        icon: Hospital,
        path: "/reports",
        permission: "reports.read",
        priority: 5,
      },
      {
        title: "Therapy Sessions",
        description: "Manage therapy assessments and sessions",
        icon: Users,
        path: "/therapy",
        permission: "therapy.write",
        priority: 2,
      },
      {
        title: "Care Coordination",
        description: "Coordinate care plans and appointments",
        icon: Users,
        path: "/coordination",
        permission: "care.coordinate",
        priority: 2,
      },
      {
        title: "System Administration",
        description: "Manage system settings and users",
        icon: Shield,
        path: "/admin",
        permission: "system.admin",
        priority: 6,
      },
    ];

    // Enhanced role-based filtering with new role structure
    const roleBasedActions = allActions.filter((action) => {
      // Check if user has the required permission
      if (
        !permissions.includes(action.permission) &&
        !permissions.includes("all")
      ) {
        return false;
      }

      // Role-specific filtering
      switch (role) {
        case "physician":
          return [
            "Patient Management",
            "Clinical Documentation",
            "Quality Assurance",
            "Reports & Analytics",
          ].includes(action.title);

        case "registered_nurse":
          return [
            "Patient Management",
            "Clinical Documentation",
            "Quality Assurance",
          ].includes(action.title);

        case "therapist":
          return [
            "Patient Management",
            "Therapy Sessions",
            "Clinical Documentation",
          ].includes(action.title);

        case "care_coordinator":
          return [
            "Patient Management",
            "Care Coordination",
            "Reports & Analytics",
          ].includes(action.title);

        case "administrative_staff":
          return [
            "Patient Management",
            "Claims & Revenue",
            "Reports & Analytics",
          ].includes(action.title);

        case "quality_manager":
          return [
            "Quality Assurance",
            "Reports & Analytics",
            "Clinical Documentation",
          ].includes(action.title);

        case "clinical_director":
        case "super_admin":
          return true; // All actions available

        default:
          return true;
      }
    });

    // Sort by priority and role relevance
    return roleBasedActions
      .sort((a, b) => {
        // Higher priority roles get clinical actions first
        const clinicalRoles = [
          "physician",
          "clinical_director",
          "registered_nurse",
        ];
        if (clinicalRoles.includes(role)) {
          if (a.title.includes("Clinical") && !b.title.includes("Clinical"))
            return -1;
          if (!a.title.includes("Clinical") && b.title.includes("Clinical"))
            return 1;
        }

        return a.priority - b.priority;
      })
      .slice(0, 4);
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      super_admin: "Super Administrator",
      clinical_director: "Clinical Director",
      physician: "Physician",
      registered_nurse: "Registered Nurse",
      therapist: "Licensed Therapist",
      care_coordinator: "Care Coordinator",
      administrative_staff: "Administrative Staff",
      quality_manager: "Quality Manager",
      // Legacy role mappings
      nurse: "Clinical Nurse",
      doctor: "Attending Physician",
      admin: "System Administrator",
      coordinator: "Care Coordinator",
    };
    return roleNames[role as keyof typeof roleNames] || role;
  };

  const getSecurityBadgeColor = (securityStatus: any) => {
    if (!securityStatus) return "bg-gray-100 text-gray-800";

    if (securityStatus.mfaEnabled && securityStatus.deviceTrusted) {
      return "bg-green-100 text-green-800";
    } else if (securityStatus.mfaEnabled) {
      return "bg-yellow-100 text-yellow-800";
    } else {
      return "bg-red-100 text-red-800";
    }
  };

  const getSecurityLevel = (securityStatus: any) => {
    if (!securityStatus) return "Unknown";

    if (securityStatus.mfaEnabled && securityStatus.deviceTrusted) {
      return "High Security";
    } else if (securityStatus.mfaEnabled) {
      return "Medium Security";
    } else {
      return "Basic Security";
    }
  };

  const getPersonalizedGreeting = () => {
    if (!user) return "Welcome to Reyada Homecare Platform";

    const hour = new Date().getHours();
    const timeGreeting =
      hour < 12
        ? "Good morning"
        : hour < 18
          ? "Good afternoon"
          : "Good evening";

    // Enhanced user name extraction with profile support
    const userName =
      userProfile?.full_name ||
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "User";

    return `${timeGreeting}, ${userName}`;
  };

  const getEnhancedSecurityStatus = () => {
    if (!user || !session) return null;

    const sessionAge = Date.now() - new Date(session.created_at).getTime();
    const sessionHours = Math.floor(sessionAge / (1000 * 60 * 60));

    return {
      sessionAge: sessionHours,
      mfaEnabled: user.app_metadata?.mfa_enabled || false,
      lastSignIn: session.created_at,
      deviceTrusted: localStorage.getItem(`trusted_device_${user.id}`) !== null,
    };
  };

  return (
    <div className="bg-background min-h-screen">
      <header className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {getPersonalizedGreeting()}
              </h1>
              <p className="text-lg opacity-90">
                {user && userProfile ? (
                  <div className="flex flex-col gap-2">
                    <span className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="secondary"
                        className="bg-white/20 text-white border-white/30"
                      >
                        {getRoleDisplayName(userProfile.role)}
                      </Badge>
                      {userProfile.department && (
                        <span className="text-sm opacity-75">
                          • {userProfile.department}
                        </span>
                      )}
                      {userProfile.license_number && (
                        <span className="text-xs opacity-75">
                          License: {userProfile.license_number}
                        </span>
                      )}
                    </span>
                    {(() => {
                      const securityStatus = getEnhancedSecurityStatus();
                      return securityStatus ? (
                        <span className="flex items-center gap-2">
                          <Badge
                            className={getSecurityBadgeColor(securityStatus)}
                          >
                            {getSecurityLevel(securityStatus)}
                          </Badge>
                          <span className="text-xs opacity-75">
                            Session: {securityStatus.sessionAge}h
                          </span>
                        </span>
                      ) : null;
                    })()}
                  </div>
                ) : authLoading ? (
                  "Loading user information..."
                ) : (
                  "Transforming homecare with DOH-compliant digital solutions"
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="h-6 w-6 text-green-400" />
              ) : (
                <WifiOff className="h-6 w-6 text-red-400" />
              )}
              <span className="text-sm opacity-75">
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <OfflineBanner
          isOnline={isOnline}
          pendingItems={pendingItems}
          isSyncing={isSyncing}
          onSyncClick={handleSyncClick}
        />

        {/* Enhanced Authentication Status */}
        {user && userProfile && (
          <section className="mb-6">
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Security Status
                  </h3>
                  <p className="text-sm text-gray-600">
                    Enhanced authentication active
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {(() => {
                    const securityStatus = getEnhancedSecurityStatus();
                    return securityStatus ? (
                      <>
                        <div className="text-center">
                          <div className="text-xs text-gray-500">
                            MFA Status
                          </div>
                          <div
                            className={`text-sm font-medium ${
                              securityStatus.mfaEnabled
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {securityStatus.mfaEnabled ? "Enabled" : "Disabled"}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500">Device</div>
                          <div
                            className={`text-sm font-medium ${
                              securityStatus.deviceTrusted
                                ? "text-green-600"
                                : "text-yellow-600"
                            }`}
                          >
                            {securityStatus.deviceTrusted
                              ? "Trusted"
                              : "Unverified"}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500">Session</div>
                          <div className="text-sm font-medium text-blue-600">
                            {securityStatus.sessionAge}h active
                          </div>
                        </div>
                      </>
                    ) : null;
                  })()}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Personalized Dashboard Stats */}
        {user && userProfile && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Your Dashboard</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">
                        Today's Visits
                      </p>
                      <p className="text-2xl font-bold text-blue-900">
                        {roleStats.todayVisits}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-600 font-medium">
                        Pending Tasks
                      </p>
                      <p className="text-2xl font-bold text-orange-900">
                        {roleStats.pendingTasks}
                      </p>
                    </div>
                    <FileText className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-600 font-medium">
                        Urgent Alerts
                      </p>
                      <p className="text-2xl font-bold text-red-900">
                        {roleStats.urgentAlerts}
                      </p>
                    </div>
                    <Shield className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">
                        Completion Rate
                      </p>
                      <p className="text-2xl font-bold text-green-900">
                        {roleStats.completionRate}%
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Quick Actions with Permission Checks */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">
                Quick Actions for You
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {personalizedActions
                  .filter((action) => hasPermission(action.permission))
                  .map((action, index) => {
                    const IconComponent = action.icon;
                    return (
                      <Button
                        key={index}
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-primary/5 relative"
                        onClick={() => handleNavigate(action.path)}
                      >
                        <IconComponent className="h-6 w-6 text-primary" />
                        <div className="text-center">
                          <div className="font-medium text-sm">
                            {action.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {action.description}
                          </div>
                        </div>
                        {action.priority === 1 && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                        )}
                      </Button>
                    );
                  })}
              </div>
              {personalizedActions.filter((action) =>
                hasPermission(action.permission),
              ).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No actions available with your current permissions.</p>
                  <p className="text-sm">
                    Contact your administrator for access.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Patient Referrals</h2>
            <div className="flex gap-2">
              <Button
                onClick={resetDatabaseHandler}
                disabled={loading}
                variant="outline"
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Reset Database
              </Button>
              <Button onClick={() => handleNavigate("/dashboard")}>
                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {message && (
            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4">
              {message}
            </div>
          )}

          {loading ? (
            <div className="text-center p-8">
              <LoadingSpinner size="lg" text="Loading referrals..." />
            </div>
          ) : referrals.length === 0 ? (
            <div className="text-center p-8">No referrals found</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {referrals.map((referral) => (
                <Card key={referral._id.toString()} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{referral.patientName}</CardTitle>
                        <CardDescription>
                          {referral.referralSource}
                        </CardDescription>
                      </div>
                      <Badge
                        className={getStatusBadgeColor(referral.referralStatus)}
                      >
                        {referral.referralStatus}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <span className="font-semibold">Needs:</span>{" "}
                        {referral.preliminaryNeeds}
                      </div>
                      <div>
                        <span className="font-semibold">Contact:</span>{" "}
                        {referral.patientContact}
                      </div>
                      <div>
                        <span className="font-semibold">Location:</span>{" "}
                        {referral.geographicLocation}
                      </div>
                      <div>
                        <span className="font-semibold">Insurance:</span>{" "}
                        {referral.insuranceInfo}
                      </div>
                      <div>
                        <span className="font-semibold">Referral Date:</span>{" "}
                        {new Date(referral.referralDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Acknowledgment:</span>
                        <Badge
                          className={getAcknowledgmentBadgeColor(
                            referral.acknowledgmentStatus,
                          )}
                        >
                          {referral.acknowledgmentStatus}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-gray-50">
                    {referral.acknowledgmentStatus === "Pending" ? (
                      <Button
                        onClick={() =>
                          acknowledgeReferral(referral._id.toString())
                        }
                        disabled={loading}
                      >
                        Acknowledge Referral
                      </Button>
                    ) : (
                      <div className="text-sm text-gray-500">
                        Acknowledged by {referral.acknowledgedBy} on{" "}
                        {new Date(
                          referral.acknowledgmentDate,
                        ).toLocaleDateString()}
                      </div>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Key Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card border rounded-lg p-4">
              <CheckCircle className="h-6 w-6 text-green-500 mb-2" />
              <h3 className="font-medium mb-1">Emirates ID Integration</h3>
              <p className="text-sm text-muted-foreground">
                Scan and verify Emirates ID for instant patient registration
              </p>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <CheckCircle className="h-6 w-6 text-green-500 mb-2" />
              <h3 className="font-medium mb-1">Mobile-First Experience</h3>
              <p className="text-sm text-muted-foreground">
                Complete offline capabilities with voice-to-text and camera
                integration
              </p>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <CheckCircle className="h-6 w-6 text-green-500 mb-2" />
              <h3 className="font-medium mb-1">9-Domain Assessment</h3>
              <p className="text-sm text-muted-foreground">
                DOH-compliant healthcare assessment with clinical justification
              </p>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <CheckCircle className="h-6 w-6 text-green-500 mb-2" />
              <h3 className="font-medium mb-1">Secure Authentication</h3>
              <p className="text-sm text-muted-foreground">
                Multi-factor authentication with role-based access control
              </p>
            </div>
          </div>
        </section>

        <section>
          <div className="bg-muted p-6 rounded-lg">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h2 className="text-xl font-bold mb-2">
                  Ready to transform your homecare operations?
                </h2>
                <p className="text-muted-foreground">
                  Access the full platform and start delivering DOH-compliant
                  care
                </p>
              </div>
              <Button size="lg" onClick={() => handleNavigate("/dashboard")}>
                Launch Platform
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-muted py-6 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Reyada Homecare. All rights
                reserved.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline">DOH Compliant</Badge>
              <Badge variant="outline">JAWDA KPI Ready</Badge>
              <Badge variant="outline">Malaffi Integrated</Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
