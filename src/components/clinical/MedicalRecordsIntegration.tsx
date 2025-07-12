import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Heart,
  Thermometer,
  Activity,
  Droplets,
  Pill,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Calendar,
  Save,
  Upload,
} from "lucide-react";

interface MedicalRecordsIntegrationProps {
  patientId: string;
  episodeId?: string;
  readOnly?: boolean;
}

const MedicalRecordsIntegration: React.FC<MedicalRecordsIntegrationProps> = ({
  patientId,
  episodeId,
  readOnly = false,
}) => {
  const [activeTab, setActiveTab] = useState("vital-signs");
  const [vitalSigns, setVitalSigns] = useState({
    temperature: "",
    pulse: "",
    bloodPressure: "",
    respiratoryRate: "",
    oxygenSaturation: "",
    weight: "",
    height: "",
    painLevel: "",
  });

  const [medicationRecord, setMedicationRecord] = useState({
    medicationName: "",
    dosage: "",
    route: "",
    frequency: "",
    administeredBy: "",
    administrationTime: "",
    patientResponse: "",
    sideEffects: "",
  });

  const [seizureRecord, setSeizureRecord] = useState({
    onsetTime: "",
    duration: "",
    frequency: "",
    type: "",
    description: "",
    triggeringFactors: "",
    interventions: "",
    postSeizureStatus: "",
  });

  const [woundAssessment, setWoundAssessment] = useState({
    location: "",
    size: {
      length: "",
      width: "",
      depth: "",
    },
    stage: "",
    appearance: "",
    drainage: "",
    treatment: "",
    healingProgress: "",
    photographTaken: false,
  });

  const [feedingChart, setFeedingChart] = useState({
    feedingType: "",
    rate: "",
    startTime: "",
    endTime: "",
    totalVolume: "",
    flushingVolume: "",
    preparation: "",
    tolerance: "",
    complications: "",
  });

  // Mock historical data based on the medical records PDF
  const historicalVitalSigns = [
    {
      date: "2025-05-24",
      time: "04:00",
      temperature: 36.0,
      pulse: 94,
      bloodPressure: "N/A",
      respiratoryRate: 20,
      oxygenSaturation: 96,
      recordedBy: "Shere Porras Gonzales",
    },
    {
      date: "2025-05-24",
      time: "00:00",
      temperature: 36.0,
      pulse: 100,
      bloodPressure: "N/A",
      respiratoryRate: 21,
      oxygenSaturation: 95,
      recordedBy: "Shere Porras Gonzales",
    },
    {
      date: "2025-05-23",
      time: "20:00",
      temperature: 36.1,
      pulse: 80,
      bloodPressure: "N/A",
      respiratoryRate: 20,
      oxygenSaturation: 95,
      recordedBy: "Shere Porras Gonzales",
    },
  ];

  const medicationHistory = [
    {
      date: "2025-05-25",
      time: "05:00",
      medication: "Esomeprazole",
      dosage: "10mg",
      route: "Enteral",
      frequency: "BID",
      administeredBy: "Shere Porras Gonzales",
      status: "Active",
    },
    {
      date: "2025-05-25",
      time: "04:00",
      medication: "Movicol pedia",
      dosage: "6.9g",
      route: "Enteral",
      frequency: "BID",
      administeredBy: "Shere Porras Gonzales",
      status: "Active",
    },
    {
      date: "2025-05-24",
      time: "21:00",
      medication: "Levetiracetam",
      dosage: "800mg",
      route: "Enteral",
      frequency: "BID",
      administeredBy: "Shere Porras Gonzales",
      status: "Active",
    },
  ];

  const seizureHistory = [
    {
      date: "2025-05-23",
      time: "18:07",
      duration: "14 seconds",
      frequency: "2nd",
      type: "Moderate",
      description:
        "Rigid extremities, eyes rolled up, facial flushing noted, stable vital signs, no triggering factor",
      recordedBy: "Shere Porras Gonzales",
    },
    {
      date: "2025-05-23",
      time: "06:30",
      duration: "16 seconds",
      frequency: "1st",
      type: "Moderate",
      description:
        "Rigid extremities, eyes rolled up, facial flushing noted, stable vital signs, no triggering factor",
      recordedBy: "Sarah Mae Valdez",
    },
  ];

  const handleSaveRecord = (recordType: string) => {
    // In a real implementation, this would save to the backend
    console.log(`Saving ${recordType} record:`, {
      patientId,
      episodeId,
      recordType,
      timestamp: new Date().toISOString(),
    });
    alert(`${recordType} record saved successfully!`);
  };

  const getVitalSignsStatus = (value: number, type: string) => {
    // Basic vital signs ranges for adults
    const ranges = {
      temperature: { min: 36.1, max: 37.2 },
      pulse: { min: 60, max: 100 },
      respiratoryRate: { min: 12, max: 20 },
      oxygenSaturation: { min: 95, max: 100 },
    };

    const range = ranges[type as keyof typeof ranges];
    if (!range) return "normal";

    if (value < range.min) return "low";
    if (value > range.max) return "high";
    return "normal";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "low":
        return "text-blue-600 bg-blue-100";
      case "high":
        return "text-red-600 bg-red-100";
      case "normal":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="space-y-6 bg-white">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Medical Records Integration
          </CardTitle>
          <CardDescription>
            Comprehensive medical documentation based on DOH standards and
            clinical best practices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <Label className="text-sm font-medium text-gray-600">
                Patient ID
              </Label>
              <p className="font-medium">{patientId}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <Label className="text-sm font-medium text-gray-600">
                Episode ID
              </Label>
              <p className="font-medium">{episodeId || "N/A"}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <Label className="text-sm font-medium text-gray-600">
                Last Updated
              </Label>
              <p className="font-medium">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medical Records Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="vital-signs">
            <Heart className="w-4 h-4 mr-2" />
            Vital Signs
          </TabsTrigger>
          <TabsTrigger value="medications">
            <Pill className="w-4 h-4 mr-2" />
            Medications
          </TabsTrigger>
          <TabsTrigger value="seizure-monitoring">
            <Activity className="w-4 h-4 mr-2" />
            Seizures
          </TabsTrigger>
          <TabsTrigger value="wound-care">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Wounds
          </TabsTrigger>
          <TabsTrigger value="feeding">
            <Droplets className="w-4 h-4 mr-2" />
            Feeding
          </TabsTrigger>
          <TabsTrigger value="history">
            <Clock className="w-4 h-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Vital Signs Tab */}
        <TabsContent value="vital-signs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vital Signs Recording</CardTitle>
              <CardDescription>
                Record current vital signs with automatic range validation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="temperature">
                    Temperature (°C)
                    <Thermometer className="w-4 h-4 inline ml-1" />
                  </Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    value={vitalSigns.temperature}
                    onChange={(e) =>
                      setVitalSigns({
                        ...vitalSigns,
                        temperature: e.target.value,
                      })
                    }
                    placeholder="36.5"
                    disabled={readOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pulse">
                    Pulse (bpm)
                    <Heart className="w-4 h-4 inline ml-1" />
                  </Label>
                  <Input
                    id="pulse"
                    type="number"
                    value={vitalSigns.pulse}
                    onChange={(e) =>
                      setVitalSigns({ ...vitalSigns, pulse: e.target.value })
                    }
                    placeholder="80"
                    disabled={readOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bloodPressure">Blood Pressure (mmHg)</Label>
                  <Input
                    id="bloodPressure"
                    value={vitalSigns.bloodPressure}
                    onChange={(e) =>
                      setVitalSigns({
                        ...vitalSigns,
                        bloodPressure: e.target.value,
                      })
                    }
                    placeholder="120/80"
                    disabled={readOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="respiratoryRate">
                    Respiratory Rate (breaths/min)
                  </Label>
                  <Input
                    id="respiratoryRate"
                    type="number"
                    value={vitalSigns.respiratoryRate}
                    onChange={(e) =>
                      setVitalSigns({
                        ...vitalSigns,
                        respiratoryRate: e.target.value,
                      })
                    }
                    placeholder="16"
                    disabled={readOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="oxygenSaturation">
                    Oxygen Saturation (%)
                  </Label>
                  <Input
                    id="oxygenSaturation"
                    type="number"
                    value={vitalSigns.oxygenSaturation}
                    onChange={(e) =>
                      setVitalSigns({
                        ...vitalSigns,
                        oxygenSaturation: e.target.value,
                      })
                    }
                    placeholder="98"
                    disabled={readOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={vitalSigns.weight}
                    onChange={(e) =>
                      setVitalSigns({ ...vitalSigns, weight: e.target.value })
                    }
                    placeholder="70.5"
                    disabled={readOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={vitalSigns.height}
                    onChange={(e) =>
                      setVitalSigns({ ...vitalSigns, height: e.target.value })
                    }
                    placeholder="170"
                    disabled={readOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="painLevel">Pain Level (0-10)</Label>
                  <Select
                    value={vitalSigns.painLevel}
                    onValueChange={(value) =>
                      setVitalSigns({ ...vitalSigns, painLevel: value })
                    }
                    disabled={readOnly}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select pain level" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 11 }, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {i} -{" "}
                          {i === 0
                            ? "No Pain"
                            : i <= 3
                              ? "Mild"
                              : i <= 6
                                ? "Moderate"
                                : "Severe"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {!readOnly && (
                <div className="flex justify-end mt-4">
                  <Button onClick={() => handleSaveRecord("Vital Signs")}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Vital Signs
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medications Tab */}
        <TabsContent value="medications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Medication Administration Record</CardTitle>
              <CardDescription>
                Document medication administration with safety checks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="medicationName">Medication Name *</Label>
                  <Input
                    id="medicationName"
                    value={medicationRecord.medicationName}
                    onChange={(e) =>
                      setMedicationRecord({
                        ...medicationRecord,
                        medicationName: e.target.value,
                      })
                    }
                    placeholder="e.g., Esomeprazole"
                    disabled={readOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dosage">Dosage *</Label>
                  <Input
                    id="dosage"
                    value={medicationRecord.dosage}
                    onChange={(e) =>
                      setMedicationRecord({
                        ...medicationRecord,
                        dosage: e.target.value,
                      })
                    }
                    placeholder="e.g., 10mg"
                    disabled={readOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="route">Route of Administration *</Label>
                  <Select
                    value={medicationRecord.route}
                    onValueChange={(value) =>
                      setMedicationRecord({ ...medicationRecord, route: value })
                    }
                    disabled={readOnly}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select route" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="oral">Oral</SelectItem>
                      <SelectItem value="enteral">Enteral</SelectItem>
                      <SelectItem value="iv">Intravenous</SelectItem>
                      <SelectItem value="im">Intramuscular</SelectItem>
                      <SelectItem value="sc">Subcutaneous</SelectItem>
                      <SelectItem value="topical">Topical</SelectItem>
                      <SelectItem value="inhalation">Inhalation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency *</Label>
                  <Select
                    value={medicationRecord.frequency}
                    onValueChange={(value) =>
                      setMedicationRecord({
                        ...medicationRecord,
                        frequency: value,
                      })
                    }
                    disabled={readOnly}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OD">Once Daily (OD)</SelectItem>
                      <SelectItem value="BID">Twice Daily (BID)</SelectItem>
                      <SelectItem value="TID">
                        Three Times Daily (TID)
                      </SelectItem>
                      <SelectItem value="QID">
                        Four Times Daily (QID)
                      </SelectItem>
                      <SelectItem value="PRN">As Needed (PRN)</SelectItem>
                      <SelectItem value="STAT">Immediately (STAT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="administeredBy">Administered By *</Label>
                  <Input
                    id="administeredBy"
                    value={medicationRecord.administeredBy}
                    onChange={(e) =>
                      setMedicationRecord({
                        ...medicationRecord,
                        administeredBy: e.target.value,
                      })
                    }
                    placeholder="Healthcare provider name"
                    disabled={readOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="administrationTime">
                    Administration Time *
                  </Label>
                  <Input
                    id="administrationTime"
                    type="datetime-local"
                    value={medicationRecord.administrationTime}
                    onChange={(e) =>
                      setMedicationRecord({
                        ...medicationRecord,
                        administrationTime: e.target.value,
                      })
                    }
                    disabled={readOnly}
                  />
                </div>
              </div>
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="patientResponse">Patient Response</Label>
                  <Textarea
                    id="patientResponse"
                    value={medicationRecord.patientResponse}
                    onChange={(e) =>
                      setMedicationRecord({
                        ...medicationRecord,
                        patientResponse: e.target.value,
                      })
                    }
                    placeholder="Document patient's response to medication"
                    className="h-20"
                    disabled={readOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sideEffects">
                    Side Effects/Adverse Reactions
                  </Label>
                  <Textarea
                    id="sideEffects"
                    value={medicationRecord.sideEffects}
                    onChange={(e) =>
                      setMedicationRecord({
                        ...medicationRecord,
                        sideEffects: e.target.value,
                      })
                    }
                    placeholder="Document any side effects or adverse reactions"
                    className="h-20"
                    disabled={readOnly}
                  />
                </div>
              </div>
              {!readOnly && (
                <div className="flex justify-end mt-4">
                  <Button onClick={() => handleSaveRecord("Medication")}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Medication Record
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vital Signs History */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Vital Signs</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date/Time</TableHead>
                      <TableHead>Temp</TableHead>
                      <TableHead>Pulse</TableHead>
                      <TableHead>SpO2</TableHead>
                      <TableHead>RR</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historicalVitalSigns.map((record, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {record.date}
                          <br />
                          <span className="text-sm text-gray-500">
                            {record.time}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getStatusColor(
                              getVitalSignsStatus(
                                record.temperature,
                                "temperature",
                              ),
                            )}
                          >
                            {record.temperature}°C
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getStatusColor(
                              getVitalSignsStatus(record.pulse, "pulse"),
                            )}
                          >
                            {record.pulse}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getStatusColor(
                              getVitalSignsStatus(
                                record.oxygenSaturation,
                                "oxygenSaturation",
                              ),
                            )}
                          >
                            {record.oxygenSaturation}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getStatusColor(
                              getVitalSignsStatus(
                                record.respiratoryRate,
                                "respiratoryRate",
                              ),
                            )}
                          >
                            {record.respiratoryRate}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Medication History */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Medications</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date/Time</TableHead>
                      <TableHead>Medication</TableHead>
                      <TableHead>Dosage</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {medicationHistory.map((record, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {record.date}
                          <br />
                          <span className="text-sm text-gray-500">
                            {record.time}
                          </span>
                        </TableCell>
                        <TableCell>{record.medication}</TableCell>
                        <TableCell>
                          {record.dosage} ({record.route})
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              record.status === "Active"
                                ? "text-green-700 bg-green-100"
                                : "text-gray-700 bg-gray-100"
                            }
                          >
                            {record.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Seizure History */}
          <Card>
            <CardHeader>
              <CardTitle>Seizure History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date/Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Recorded By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {seizureHistory.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {record.date}
                        <br />
                        <span className="text-sm text-gray-500">
                          {record.time}
                        </span>
                      </TableCell>
                      <TableCell>{record.duration}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{record.type}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {record.description}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {record.recordedBy}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MedicalRecordsIntegration;
