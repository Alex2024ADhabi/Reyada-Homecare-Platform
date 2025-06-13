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

function Home() {
  const navigate = useNavigate();
  const { toast } = useToastContext();
  const { handleApiError, handleSuccess } = useErrorHandler();
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

  useEffect(() => {
    initializeDatabase();
    loadPendingItems();

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

  return (
    <div className="bg-background min-h-screen">
      <header className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Reyada Homecare Platform
              </h1>
              <p className="text-lg opacity-90">
                Transforming homecare with DOH-compliant digital solutions
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
