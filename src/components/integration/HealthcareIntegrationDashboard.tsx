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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Database,
  TestTube,
  Pill,
  Building2,
  Video,
  Link,
  Zap,
  Monitor,
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  Settings,
  Eye,
  Download,
  Upload,
  Wifi,
  WifiOff,
} from "lucide-react";
import { healthcareIntegrationService } from "@/services/healthcare-integration.service";
import type {
  HealthcareIntegrationStatus,
  LabResult,
  MedicationData,
  HospitalAdmission,
  TelehealthSession,
} from "@/types/supabase";

interface HealthcareIntegrationDashboardProps {
  patientId?: string;
  className?: string;
}

const HealthcareIntegrationDashboard: React.FC<
  HealthcareIntegrationDashboardProps
> = ({ patientId = "PAT-001", className = "" }) => {
  const [integrationStatus, setIntegrationStatus] =
    useState<HealthcareIntegrationStatus | null>(null);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [medicationData, setMedicationData] = useState<MedicationData | null>(
    null,
  );
  const [hospitalData, setHospitalData] = useState<HospitalAdmission[]>([]);
  const [telehealthSessions, setTelehealthSessions] = useState<
    TelehealthSession[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [realTimeConnections, setRealTimeConnections] = useState<{
    lab: boolean;
    pharmacy: boolean;
    hospital: boolean;
  }>({ lab: false, pharmacy: false, hospital: false });

  useEffect(() => {
    loadIntegrationData();
    setupRealTimeConnections();
  }, [patientId]);

  const loadIntegrationData = async () => {
    setIsLoading(true);
    try {
      // Load integration status
      const status = await healthcareIntegrationService.getIntegrationStatus();
      setIntegrationStatus(status);

      // Load patient-specific data
      const [labs, medications, admissions] = await Promise.all([
        healthcareIntegrationService.getLabResults(patientId),
        healthcareIntegrationService.getMedicationData(patientId),
        healthcareIntegrationService.getHospitalAdmissions(patientId),
      ]);

      setLabResults(labs);
      setMedicationData(medications);
      setHospitalData(admissions);
    } catch (error) {
      console.error("Error loading integration data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealTimeConnections = async () => {
    try {
      // Subscribe to real-time lab results
      const unsubscribeLab =
        await healthcareIntegrationService.subscribeToLabResults(
          patientId,
          (newResult) => {
            setLabResults((prev) => [newResult, ...prev]);
          },
        );

      // Subscribe to medication alerts
      const unsubscribePharmacy =
        await healthcareIntegrationService.subscribeToMedicationAlerts(
          patientId,
          (alert) => {
            console.log("Medication alert:", alert);
          },
        );

      // Subscribe to hospital updates
      const unsubscribeHospital =
        await healthcareIntegrationService.subscribeToHospitalUpdates(
          patientId,
          (update) => {
            console.log("Hospital update:", update);
          },
        );

      setRealTimeConnections({ lab: true, pharmacy: true, hospital: true });

      // Cleanup on unmount
      return () => {
        unsubscribeLab();
        unsubscribePharmacy();
        unsubscribeHospital();
      };
    } catch (error) {
      console.error("Error setting up real-time connections:", error);
    }
  };

  const handleRefreshIntegrations = async () => {
    setIsRefreshing(true);
    try {
      await healthcareIntegrationService.syncIntegrationData(patientId);
      await loadIntegrationData();
    } catch (error) {
      console.error("Error refreshing integrations:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleTestIntegration = async (
    integrationType:
      | "fhir"
      | "laboratory"
      | "pharmacy"
      | "hospital"
      | "telehealth",
  ) => {
    try {
      const success =
        await healthcareIntegrationService.testIntegration(integrationType);
      if (success) {
        console.log(`${integrationType} integration test successful`);
      } else {
        console.error(`${integrationType} integration test failed`);
      }
    } catch (error) {
      console.error(`Error testing ${integrationType} integration:`, error);
    }
  };

  const createTelehealthSession = async () => {
    try {
      const session =
        await healthcareIntegrationService.createTelehealthSession({
          patientId,
          providerId: "PROV-001",
          appointmentType: "consultation",
          scheduledTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        });

      if (session) {
        setTelehealthSessions((prev) => [...prev, session]);
      }
    } catch (error) {
      console.error("Error creating telehealth session:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "text-green-600";
      case "disconnected":
        return "text-gray-500";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "disconnected":
        return <Clock className="h-4 w-4 text-gray-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-white min-h-screen p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-4 text-lg">
            Loading healthcare integrations...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white min-h-screen p-6 ${className}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Healthcare System Integrations
            </h1>
            <p className="text-gray-600 mt-2">
              Real-time connections to external healthcare systems
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleRefreshIntegrations}
              disabled={isRefreshing}
              variant="outline"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh All
            </Button>
            <Button onClick={createTelehealthSession}>
              <Video className="h-4 w-4 mr-2" />
              Start Telehealth
            </Button>
          </div>
        </div>

        {/* Integration Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {integrationStatus &&
            Object.entries(integrationStatus).map(([key, status]) => {
              const icons = {
                fhir: Database,
                laboratory: TestTube,
                pharmacy: Pill,
                hospital: Building2,
                telehealth: Video,
              };
              const Icon = icons[key as keyof typeof icons];

              return (
                <Card key={key} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Icon className="h-8 w-8 text-blue-600" />
                      {getStatusIcon(status.status)}
                    </div>
                    <CardTitle className="text-lg capitalize">{key}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status</span>
                        <Badge
                          variant={
                            status.status === "connected"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {status.status}
                        </Badge>
                      </div>
                      {status.lastSync && (
                        <div className="text-xs text-gray-500">
                          Last sync:{" "}
                          {new Date(status.lastSync).toLocaleString()}
                        </div>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => handleTestIntegration(key as any)}
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        Test
                      </Button>
                    </div>
                  </CardContent>
                  {realTimeConnections[
                    key as keyof typeof realTimeConnections
                  ] && (
                    <div className="absolute top-2 right-2">
                      <Wifi className="h-4 w-4 text-green-500" />
                    </div>
                  )}
                </Card>
              );
            })}
        </div>

        {/* Detailed Integration Data */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="laboratory">Laboratory</TabsTrigger>
            <TabsTrigger value="pharmacy">Pharmacy</TabsTrigger>
            <TabsTrigger value="hospital">Hospital</TabsTrigger>
            <TabsTrigger value="telehealth">Telehealth</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Lab Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="h-5 w-5" />
                    Recent Lab Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {labResults.slice(0, 3).map((result, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border-b last:border-b-0"
                    >
                      <div>
                        <div className="font-medium">{result.testType}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(result.resultDate).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge
                        variant={
                          result.status === "final" ? "default" : "secondary"
                        }
                      >
                        {result.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Current Medications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="h-5 w-5" />
                    Current Medications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {medicationData?.currentMedications
                    .slice(0, 3)
                    .map((med, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border-b last:border-b-0"
                      >
                        <div>
                          <div className="font-medium">{med.name}</div>
                          <div className="text-sm text-gray-600">
                            {med.strength} - {med.frequency}
                          </div>
                        </div>
                        <Badge
                          variant={
                            med.adherence.score >= 80
                              ? "default"
                              : "destructive"
                          }
                        >
                          {med.adherence.score}%
                        </Badge>
                      </div>
                    ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="laboratory" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Laboratory Results Integration</CardTitle>
                <CardDescription>
                  Real-time laboratory results from connected healthcare
                  facilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {labResults.map((result, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            {result.testType}
                          </CardTitle>
                          <Badge
                            variant={
                              result.status === "final"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {result.status}
                          </Badge>
                        </div>
                        <CardDescription>
                          {result.laboratory.name} |{" "}
                          {new Date(result.collectionDate).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {result.results.map((param, paramIndex) => (
                            <div
                              key={paramIndex}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded"
                            >
                              <div>
                                <div className="font-medium text-sm">
                                  {param.parameter}
                                </div>
                                <div className="text-xs text-gray-600">
                                  Ref: {param.referenceRange}
                                </div>
                              </div>
                              <div className="text-right">
                                <div
                                  className={`font-bold ${
                                    param.status === "high"
                                      ? "text-red-600"
                                      : param.status === "low"
                                        ? "text-orange-600"
                                        : "text-green-600"
                                  }`}
                                >
                                  {param.value} {param.unit}
                                </div>
                                <Badge
                                  variant={
                                    param.status === "normal"
                                      ? "default"
                                      : "destructive"
                                  }
                                  className="text-xs"
                                >
                                  {param.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pharmacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pharmacy Integration</CardTitle>
                <CardDescription>
                  Medication management and adherence monitoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                {medicationData && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-2xl font-bold text-blue-600">
                            {medicationData.currentMedications.length}
                          </div>
                          <div className="text-sm text-gray-600">
                            Active Medications
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-2xl font-bold text-green-600">
                            {medicationData.adherenceScore}%
                          </div>
                          <div className="text-sm text-gray-600">
                            Overall Adherence
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-2xl font-bold text-orange-600">
                            {medicationData.allergies.length}
                          </div>
                          <div className="text-sm text-gray-600">
                            Known Allergies
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-4">
                      {medicationData.currentMedications.map((med, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="font-medium">
                                  {med.name} ({med.genericName})
                                </div>
                                <div className="text-sm text-gray-600">
                                  {med.strength} - {med.frequency}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Pharmacy: {med.pharmacy.name} | Next Refill:{" "}
                                  {new Date(
                                    med.nextRefillDate,
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={
                                    med.status === "active"
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {med.status}
                                </Badge>
                                <Badge
                                  variant={
                                    med.adherence.score >= 80
                                      ? "default"
                                      : "destructive"
                                  }
                                >
                                  {med.adherence.score}%
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hospital" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hospital System Integration</CardTitle>
                <CardDescription>
                  Hospital admissions and care transitions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {hospitalData.map((admission, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">
                            {admission.hospital.name}
                          </div>
                          <Badge variant="outline">
                            {admission.admissionType}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {new Date(
                            admission.admissionDate,
                          ).toLocaleDateString()}{" "}
                          -
                          {admission.dischargeDate
                            ? new Date(
                                admission.dischargeDate,
                              ).toLocaleDateString()
                            : "Current"}
                        </div>
                        <div className="text-sm">
                          <strong>Primary Diagnosis:</strong>{" "}
                          {admission.primaryDiagnosis.description}
                        </div>
                        <div className="text-sm">
                          <strong>Attending Physician:</strong>{" "}
                          {admission.attendingPhysician.name}
                        </div>
                        {admission.transitionToCare?.homecareReferral && (
                          <Alert className="mt-2">
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription>
                              Homecare referral active - Services:{" "}
                              {admission.transitionToCare.services.join(", ")}
                            </AlertDescription>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="telehealth" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Telehealth Platform Integration</CardTitle>
                <CardDescription>
                  Virtual care sessions and remote monitoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button onClick={createTelehealthSession} className="w-full">
                    <Video className="h-4 w-4 mr-2" />
                    Schedule New Telehealth Session
                  </Button>

                  {telehealthSessions.length > 0 && (
                    <div className="space-y-4">
                      {telehealthSessions.map((session, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium">
                                Telehealth Session
                              </div>
                              <Badge
                                variant={
                                  session.status === "scheduled"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {session.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                              Scheduled:{" "}
                              {new Date(session.scheduledTime).toLocaleString()}
                            </div>
                            <div className="text-sm">
                              <strong>Type:</strong> {session.appointmentType}
                            </div>
                            <div className="text-sm">
                              <strong>Platform:</strong> {session.platform.name}{" "}
                              v{session.platform.version}
                            </div>
                            <div className="flex items-center gap-2 mt-3">
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3 mr-1" />
                                View Details
                              </Button>
                              <Button size="sm">
                                <Video className="h-3 w-3 mr-1" />
                                Join Session
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HealthcareIntegrationDashboard;
