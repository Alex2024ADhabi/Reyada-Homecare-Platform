/**
 * EMR Integration Panel
 * Specialized panel for Electronic Medical Records integration with HL7 FHIR
 */

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Database,
  FileText,
  Users,
  Activity,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Download,
  Upload,
  Search,
  Filter,
} from "lucide-react";

import { healthcareIntegrationService } from "@/services/healthcare-integration.service";

interface FHIRResource {
  resourceType: string;
  id: string;
  meta?: {
    versionId: string;
    lastUpdated: string;
    source: string;
  };
  [key: string]: any;
}

interface SyncStatus {
  lastSyncTime: string;
  syncStatus: "synced" | "pending" | "error" | "conflict";
  pendingChanges: number;
  conflicts: any[];
  nextScheduledSync: string;
}

const EMRIntegrationPanel: React.FC = () => {
  const [patients, setPatients] = useState<FHIRResource[]>([]);
  const [observations, setObservations] = useState<FHIRResource[]>([]);
  const [syncStatus, setSyncStatus] = useState<RefreshCwStatus | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [resourceType, setResourceType] = useState("Patient");

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadPatients(), loadObservations(), loadSyncStatus()]);
    } catch (error) {
      console.error("Error loading EMR data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const bundle = await healthcareIntegrationService.searchFHIRResources(
        "Patient",
        { _count: "10" },
      );
      if (bundle?.entry) {
        setPatients(bundle.entry.map((entry: any) => entry.resource));
      }
    } catch (error) {
      console.error("Error loading patients:", error);
    }
  };

  const loadObservations = async () => {
    try {
      const bundle = await healthcareIntegrationService.searchFHIRResources(
        "Observation",
        { _count: "10", category: "vital-signs" },
      );
      if (bundle?.entry) {
        setObservations(bundle.entry.map((entry: any) => entry.resource));
      }
    } catch (error) {
      console.error("Error loading observations:", error);
    }
  };

  const loadSyncStatus = async () => {
    if (selectedPatient) {
      try {
        const status =
          await healthcareIntegrationService.getPatientDataSyncStatus(
            selectedPatient,
          );
        setSyncStatus(status);
      } catch (error) {
        console.error("Error loading sync status:", error);
      }
    }
  };

  const syncPatientData = async () => {
    if (!selectedPatient) return;

    try {
      setLoading(true);
      const result = await healthcareIntegrationService.syncPatientData(
        selectedPatient,
        {
          includeHistory: true,
          includeMedications: true,
          includeAllergies: true,
          includeVitals: true,
        },
      );

      if (result.success) {
        await loadSyncStatus();
        console.log("Patient data synced successfully");
      } else {
        console.error("Sync failed:", result.conflicts);
      }
    } catch (error) {
      console.error("Error syncing patient data:", error);
    } finally {
      setLoading(false);
    }
  };

  const createFHIRPatient = async () => {
    try {
      const patientData = {
        identifier: `EID-${Date.now()}`,
        name: {
          given: ["John"],
          family: "Doe",
        },
        gender: "male" as const,
        birthDate: "1980-01-01",
      };

      const patient =
        await healthcareIntegrationService.createFHIRPatient(patientData);
      if (patient) {
        await loadPatients();
        console.log("Patient created successfully");
      }
    } catch (error) {
      console.error("Error creating patient:", error);
    }
  };

  const createFHIRObservation = async () => {
    if (!selectedPatient) return;

    try {
      const observationData = {
        patientId: selectedPatient,
        code: {
          system: "http://loinc.org",
          code: "8867-4",
          display: "Heart rate",
        },
        value: {
          value: 72,
          unit: "beats/min",
          system: "http://unitsofmeasure.org",
          code: "/min",
        },
        effectiveDateTime: new Date().toISOString(),
      };

      const observation =
        await healthcareIntegrationService.createFHIRObservation(
          observationData,
        );
      if (observation) {
        await loadObservations();
        console.log("Observation created successfully");
      }
    } catch (error) {
      console.error("Error creating observation:", error);
    }
  };

  const searchFHIRResources = async () => {
    if (!searchTerm) return;

    try {
      setLoading(true);
      const searchParams: Record<string, string> = {};

      if (resourceType === "Patient") {
        searchParams.name = searchTerm;
      } else if (resourceType === "Observation") {
        searchParams.code = searchTerm;
      }

      const bundle = await healthcareIntegrationService.searchFHIRResources(
        resourceType,
        searchParams,
      );

      if (bundle?.entry) {
        const resources = bundle.entry.map((entry: any) => entry.resource);
        if (resourceType === "Patient") {
          setPatients(resources);
        } else if (resourceType === "Observation") {
          setObservations(resources);
        }
      }
    } catch (error) {
      console.error("Error searching FHIR resources:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case "synced":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "error":
        return "text-red-600 bg-red-100";
      case "conflict":
        return "text-orange-600 bg-orange-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            EMR Integration Panel
          </h1>
          <p className="text-gray-600">
            Electronic Medical Records integration with HL7 FHIR R4
          </p>
        </div>

        {/* Search and Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>FHIR Resource Search</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="resource-type">Resource Type</Label>
                <Select value={resourceType} onValueChange={setResourceType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Patient">Patient</SelectItem>
                    <SelectItem value="Observation">Observation</SelectItem>
                    <SelectItem value="Condition">Condition</SelectItem>
                    <SelectItem value="MedicationRequest">
                      Medication Request
                    </SelectItem>
                    <SelectItem value="DiagnosticReport">
                      Diagnostic Report
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="search-term">Search Term</Label>
                <Input
                  id="search-term"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Enter search term..."
                />
              </div>
              <div>
                <Label htmlFor="patient-select">Patient ID</Label>
                <Input
                  id="patient-select"
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  placeholder="Enter patient ID..."
                />
              </div>
              <div className="flex items-end space-x-2">
                <Button onClick={searchFHIRResources} disabled={loading}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                <Button
                  onClick={syncPatientData}
                  disabled={loading || !selectedPatient}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                  />
                  Sync
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="patients" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="observations">Observations</TabsTrigger>
            <TabsTrigger value="sync-status">Sync Status</TabsTrigger>
            <TabsTrigger value="create">Create Resources</TabsTrigger>
          </TabsList>

          {/* Patients Tab */}
          <TabsContent value="patients">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>FHIR Patients</span>
                    </CardTitle>
                    <CardDescription>
                      Patient resources from EMR system
                    </CardDescription>
                  </div>
                  <Button onClick={loadPatients} disabled={loading}>
                    <RefreshCw
                      className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                    />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {patients.map((patient) => (
                    <div key={patient.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-medium">
                            {patient.name?.[0]?.given?.join(" ")}{" "}
                            {patient.name?.[0]?.family}
                          </h3>
                          <p className="text-sm text-gray-600">
                            ID: {patient.id}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{patient.gender}</Badge>
                          <Badge variant="outline">{patient.birthDate}</Badge>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        <p>Resource Type: {patient.resourceType}</p>
                        <p>Last Updated: {patient.meta?.lastUpdated}</p>
                        <p>Version: {patient.meta?.versionId}</p>
                      </div>
                    </div>
                  ))}
                  {patients.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No patients found</p>
                      <p className="text-sm">
                        Try searching or creating a new patient
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Observations Tab */}
          <TabsContent value="observations">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="h-5 w-5" />
                      <span>FHIR Observations</span>
                    </CardTitle>
                    <CardDescription>
                      Clinical observations and vital signs
                    </CardDescription>
                  </div>
                  <Button onClick={loadObservations} disabled={loading}>
                    <RefreshCw
                      className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                    />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {observations.map((observation) => (
                    <div key={observation.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-medium">
                            {observation.code?.coding?.[0]?.display ||
                              "Unknown Observation"}
                          </h3>
                          <p className="text-sm text-gray-600">
                            ID: {observation.id}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{observation.status}</Badge>
                          {observation.valueQuantity && (
                            <Badge>
                              {observation.valueQuantity.value}{" "}
                              {observation.valueQuantity.unit}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        <p>Patient: {observation.subject?.reference}</p>
                        <p>Effective: {observation.effectiveDateTime}</p>
                        <p>Code: {observation.code?.coding?.[0]?.code}</p>
                      </div>
                    </div>
                  ))}
                  {observations.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No observations found</p>
                      <p className="text-sm">
                        Try searching or creating a new observation
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sync Status Tab */}
          <TabsContent value="sync-status">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Synchronization Status</span>
                </CardTitle>
                <CardDescription>
                  Patient data synchronization with EMR
                </CardDescription>
              </CardHeader>
              <CardContent>
                {syncStatus ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="text-center">
                        <Badge
                          className={getSyncStatusColor(syncStatus.syncStatus)}
                        >
                          {syncStatus.syncStatus}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">Status</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">
                          {syncStatus.pendingChanges}
                        </p>
                        <p className="text-sm text-gray-600">Pending Changes</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">
                          {syncStatus.conflicts.length}
                        </p>
                        <p className="text-sm text-gray-600">Conflicts</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(syncStatus.lastSyncTime).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">Last Sync</p>
                      </div>
                    </div>

                    {syncStatus.conflicts.length > 0 && (
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-2 flex items-center space-x-2">
                          <AlertCircle className="h-4 w-4 text-orange-500" />
                          <span>Data Conflicts</span>
                        </h4>
                        <div className="space-y-2">
                          {syncStatus.conflicts.map((conflict, index) => (
                            <div
                              key={index}
                              className="bg-orange-50 border border-orange-200 rounded p-3"
                            >
                              <p className="text-sm font-medium">
                                {conflict.message}
                              </p>
                              <p className="text-xs text-gray-600">
                                Type: {conflict.type}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No sync status available</p>
                    <p className="text-sm">
                      Select a patient and sync to view status
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Create Resources Tab */}
          <TabsContent value="create">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Create FHIR Patient</span>
                  </CardTitle>
                  <CardDescription>
                    Create a new patient resource
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="first-name">First Name</Label>
                        <Input id="first-name" placeholder="John" />
                      </div>
                      <div>
                        <Label htmlFor="last-name">Last Name</Label>
                        <Input id="last-name" placeholder="Doe" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="gender">Gender</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                            <SelectItem value="unknown">Unknown</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="birth-date">Birth Date</Label>
                        <Input id="birth-date" type="date" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="identifier">
                        Identifier (Emirates ID)
                      </Label>
                      <Input id="identifier" placeholder="784-YYYY-XXXXXXX-X" />
                    </div>
                    <Button onClick={createFHIRPatient} className="w-full">
                      <Users className="h-4 w-4 mr-2" />
                      Create Patient
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>Create FHIR Observation</span>
                  </CardTitle>
                  <CardDescription>
                    Create a new observation resource
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="obs-patient">Patient ID</Label>
                      <Input
                        id="obs-patient"
                        value={selectedPatient}
                        onChange={(e) => setSelectedPatient(e.target.value)}
                        placeholder="Enter patient ID"
                      />
                    </div>
                    <div>
                      <Label htmlFor="obs-type">Observation Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select observation type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="heart-rate">Heart Rate</SelectItem>
                          <SelectItem value="blood-pressure">
                            Blood Pressure
                          </SelectItem>
                          <SelectItem value="temperature">
                            Temperature
                          </SelectItem>
                          <SelectItem value="weight">Weight</SelectItem>
                          <SelectItem value="height">Height</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="obs-value">Value</Label>
                        <Input id="obs-value" type="number" placeholder="72" />
                      </div>
                      <div>
                        <Label htmlFor="obs-unit">Unit</Label>
                        <Input id="obs-unit" placeholder="beats/min" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="obs-date">Observation Date</Label>
                      <Input id="obs-date" type="datetime-local" />
                    </div>
                    <Button
                      onClick={createFHIRObservation}
                      className="w-full"
                      disabled={!selectedPatient}
                    >
                      <Activity className="h-4 w-4 mr-2" />
                      Create Observation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EMRIntegrationPanel;
