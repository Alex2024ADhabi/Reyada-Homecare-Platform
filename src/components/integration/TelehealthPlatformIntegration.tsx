/**
 * Telehealth Platform Integration Component
 * Virtual care sessions and remote monitoring interface
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Video,
  Calendar,
  Clock,
  Users,
  Monitor,
  Mic,
  Camera,
  Share,
  Download,
  Upload,
  Settings,
  Activity,
  Heart,
  Thermometer,
  Stethoscope,
} from "lucide-react";

import { healthcareIntegrationService } from "@/services/healthcare-integration.service";

interface TelehealthPlatformIntegrationProps {
  patientId?: string;
  providerId?: string;
  className?: string;
}

const TelehealthPlatformIntegration: React.FC<
  TelehealthPlatformIntegrationProps
> = ({ patientId = "PAT-001", providerId = "PROV-001", className = "" }) => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    appointmentType: "",
    scheduledTime: "",
    duration: 30,
    sessionType: "consultation" as
      | "consultation"
      | "follow-up"
      | "emergency"
      | "group",
    features: {
      recordingEnabled: false,
      screenSharing: true,
      fileTransfer: true,
      vitalSigns: false,
    },
  });
  const [vitalSigns, setVitalSigns] = useState({
    bloodPressure: { systolic: "", diastolic: "" },
    heartRate: "",
    temperature: "",
    oxygenSaturation: "",
    respiratoryRate: "",
  });

  useEffect(() => {
    loadTelehealthSessions();
  }, [patientId]);

  const loadTelehealthSessions = async () => {
    setLoading(true);
    try {
      // Mock data - in real implementation, this would fetch from the service
      const mockSessions = [
        {
          id: "session-001",
          patientId,
          providerId,
          appointmentType: "Follow-up Consultation",
          scheduledTime: new Date(
            Date.now() + 24 * 60 * 60 * 1000,
          ).toISOString(),
          status: "scheduled",
          platform: { name: "Reyada Telehealth", version: "2.0" },
          sessionDetails: {
            meetingId: "MTG-001",
            joinUrl: "https://telehealth.reyadahomecare.ae/join/MTG-001",
            accessCode: "123456",
          },
          participants: [
            {
              id: patientId,
              role: "patient",
              name: "Patient",
              joinStatus: "pending",
            },
            {
              id: providerId,
              role: "provider",
              name: "Dr. Smith",
              joinStatus: "pending",
            },
          ],
        },
        {
          id: "session-002",
          patientId,
          providerId,
          appointmentType: "Initial Consultation",
          scheduledTime: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          status: "completed",
          platform: { name: "Reyada Telehealth", version: "2.0" },
          sessionDetails: {
            meetingId: "MTG-002",
            duration: 45,
            recordingAvailable: true,
          },
        },
      ];
      setSessions(mockSessions);
    } catch (error) {
      console.error("Error loading telehealth sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async () => {
    if (!sessionForm.appointmentType || !sessionForm.scheduledTime) {
      alert("Please fill in required fields");
      return;
    }

    setLoading(true);
    try {
      const sessionData = {
        patientId,
        providerId,
        appointmentType: sessionForm.appointmentType,
        scheduledTime: sessionForm.scheduledTime,
        duration: sessionForm.duration,
        sessionType: sessionForm.sessionType,
        features: sessionForm.features,
      };

      const result =
        await healthcareIntegrationService.createTelehealthSession(sessionData);

      if (result) {
        alert(`Session created successfully. Session ID: ${result.id}`);
        setSessionForm({
          appointmentType: "",
          scheduledTime: "",
          duration: 30,
          sessionType: "consultation",
          features: {
            recordingEnabled: false,
            screenSharing: true,
            fileTransfer: true,
            vitalSigns: false,
          },
        });
        await loadTelehealthSessions();
      } else {
        alert("Failed to create session. Please try again.");
      }
    } catch (error) {
      console.error("Error creating session:", error);
      alert("Error creating session. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSession = async (sessionId: string) => {
    try {
      const result = await healthcareIntegrationService.joinTelehealthSession(
        sessionId,
        providerId,
        "provider",
      );

      if (result.success && result.joinUrl) {
        window.open(result.joinUrl, "_blank");
      } else {
        alert("Unable to join session. Please try again.");
      }
    } catch (error) {
      console.error("Error joining session:", error);
      alert("Error joining session. Please try again.");
    }
  };

  const handleRecordVitalSigns = () => {
    // In a real implementation, this would integrate with IoT devices
    console.log("Recording vital signs:", vitalSigns);
    alert("Vital signs recorded successfully!");
  };

  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "text-blue-600 bg-blue-100";
      case "in-progress":
        return "text-green-600 bg-green-100";
      case "completed":
        return "text-gray-600 bg-gray-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className={`bg-white min-h-screen p-6 ${className}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Video className="h-8 w-8 text-blue-600" />
              Telehealth Platform Integration
            </h1>
            <p className="text-gray-600 mt-2">
              Virtual care sessions and remote monitoring for Patient{" "}
              {patientId}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button>
              <Video className="h-4 w-4 mr-2" />
              Quick Start
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Sessions
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {sessions.length}
                  </p>
                </div>
                <Video className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Scheduled</p>
                  <p className="text-2xl font-bold text-green-600">
                    {sessions.filter((s) => s.status === "scheduled").length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {sessions.filter((s) => s.status === "completed").length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    This Month
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {
                      sessions.filter(
                        (s) =>
                          new Date(s.scheduledTime).getMonth() ===
                          new Date().getMonth(),
                      ).length
                    }
                  </p>
                </div>
                <Activity className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="sessions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="schedule">Schedule New</TabsTrigger>
            <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
            <TabsTrigger value="recordings">Recordings</TabsTrigger>
          </TabsList>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Telehealth Sessions</CardTitle>
                <CardDescription>
                  Manage virtual care sessions and consultations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sessions.map((session, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-medium">
                              {session.appointmentType}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Session ID: {session.id} |{" "}
                              {new Date(session.scheduledTime).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={getSessionStatusColor(session.status)}
                            >
                              {session.status}
                            </Badge>
                            {session.status === "scheduled" && (
                              <Button
                                size="sm"
                                onClick={() => handleJoinSession(session.id)}
                              >
                                <Video className="h-4 w-4 mr-2" />
                                Join
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Platform:</span>
                            <p>
                              {session.platform.name} v
                              {session.platform.version}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium">Participants:</span>
                            <p>
                              {session.participants?.length || 0} participants
                            </p>
                          </div>
                          <div>
                            <span className="font-medium">Duration:</span>
                            <p>
                              {session.sessionDetails?.duration || 30} minutes
                            </p>
                          </div>
                        </div>

                        {session.sessionDetails?.joinUrl && (
                          <div className="mt-3 p-3 bg-blue-50 rounded">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-sm font-medium text-blue-900">
                                  Meeting ID: {session.sessionDetails.meetingId}
                                </span>
                                {session.sessionDetails.accessCode && (
                                  <p className="text-sm text-blue-700">
                                    Access Code:{" "}
                                    {session.sessionDetails.accessCode}
                                  </p>
                                )}
                              </div>
                              <Button size="sm" variant="outline">
                                <Share className="h-4 w-4 mr-2" />
                                Share Link
                              </Button>
                            </div>
                          </div>
                        )}

                        {session.sessionDetails?.recordingAvailable && (
                          <div className="mt-2">
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-2" />
                              Download Recording
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schedule New Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Schedule New Session</CardTitle>
                <CardDescription>
                  Create a new telehealth session for the patient
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="appointment-type">
                        Appointment Type *
                      </Label>
                      <Select
                        value={sessionForm.appointmentType}
                        onValueChange={(value) =>
                          setSessionForm((prev) => ({
                            ...prev,
                            appointmentType: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select appointment type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="initial-consultation">
                            Initial Consultation
                          </SelectItem>
                          <SelectItem value="follow-up">
                            Follow-up Visit
                          </SelectItem>
                          <SelectItem value="medication-review">
                            Medication Review
                          </SelectItem>
                          <SelectItem value="wound-assessment">
                            Wound Assessment
                          </SelectItem>
                          <SelectItem value="chronic-care-management">
                            Chronic Care Management
                          </SelectItem>
                          <SelectItem value="emergency-consultation">
                            Emergency Consultation
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="scheduled-time">Scheduled Time *</Label>
                      <Input
                        id="scheduled-time"
                        type="datetime-local"
                        value={sessionForm.scheduledTime}
                        onChange={(e) =>
                          setSessionForm((prev) => ({
                            ...prev,
                            scheduledTime: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Select
                        value={sessionForm.duration.toString()}
                        onValueChange={(value) =>
                          setSessionForm((prev) => ({
                            ...prev,
                            duration: parseInt(value),
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">60 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="session-type">Session Type</Label>
                      <Select
                        value={sessionForm.sessionType}
                        onValueChange={(
                          value:
                            | "consultation"
                            | "follow-up"
                            | "emergency"
                            | "group",
                        ) =>
                          setSessionForm((prev) => ({
                            ...prev,
                            sessionType: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="consultation">
                            Consultation
                          </SelectItem>
                          <SelectItem value="follow-up">Follow-up</SelectItem>
                          <SelectItem value="emergency">Emergency</SelectItem>
                          <SelectItem value="group">Group Session</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Session Features</Label>
                      <div className="space-y-3 mt-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="recording"
                            checked={sessionForm.features.recordingEnabled}
                            onChange={(e) =>
                              setSessionForm((prev) => ({
                                ...prev,
                                features: {
                                  ...prev.features,
                                  recordingEnabled: e.target.checked,
                                },
                              }))
                            }
                          />
                          <Label htmlFor="recording">Enable Recording</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="screen-sharing"
                            checked={sessionForm.features.screenSharing}
                            onChange={(e) =>
                              setSessionForm((prev) => ({
                                ...prev,
                                features: {
                                  ...prev.features,
                                  screenSharing: e.target.checked,
                                },
                              }))
                            }
                          />
                          <Label htmlFor="screen-sharing">Screen Sharing</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="file-transfer"
                            checked={sessionForm.features.fileTransfer}
                            onChange={(e) =>
                              setSessionForm((prev) => ({
                                ...prev,
                                features: {
                                  ...prev.features,
                                  fileTransfer: e.target.checked,
                                },
                              }))
                            }
                          />
                          <Label htmlFor="file-transfer">File Transfer</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="vital-signs"
                            checked={sessionForm.features.vitalSigns}
                            onChange={(e) =>
                              setSessionForm((prev) => ({
                                ...prev,
                                features: {
                                  ...prev.features,
                                  vitalSigns: e.target.checked,
                                },
                              }))
                            }
                          />
                          <Label htmlFor="vital-signs">
                            Vital Signs Monitoring
                          </Label>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">
                        Technical Requirements
                      </h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Minimum 1 Mbps internet connection</li>
                        <li>• Chrome, Firefox, Safari, or Edge browser</li>
                        <li>• Camera and microphone access</li>
                        <li>• Reyada Telehealth mobile app (optional)</li>
                      </ul>
                    </div>

                    <Button
                      onClick={handleCreateSession}
                      disabled={
                        loading ||
                        !sessionForm.appointmentType ||
                        !sessionForm.scheduledTime
                      }
                      className="w-full"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Session
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vital Signs Tab */}
          <TabsContent value="vitals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Remote Vital Signs Monitoring</CardTitle>
                <CardDescription>
                  Monitor patient vital signs during telehealth sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Blood Pressure</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          placeholder="Systolic"
                          value={vitalSigns.bloodPressure.systolic}
                          onChange={(e) =>
                            setVitalSigns((prev) => ({
                              ...prev,
                              bloodPressure: {
                                ...prev.bloodPressure,
                                systolic: e.target.value,
                              },
                            }))
                          }
                        />
                        <span className="self-center">/</span>
                        <Input
                          placeholder="Diastolic"
                          value={vitalSigns.bloodPressure.diastolic}
                          onChange={(e) =>
                            setVitalSigns((prev) => ({
                              ...prev,
                              bloodPressure: {
                                ...prev.bloodPressure,
                                diastolic: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="heart-rate">Heart Rate (bpm)</Label>
                      <Input
                        id="heart-rate"
                        value={vitalSigns.heartRate}
                        onChange={(e) =>
                          setVitalSigns((prev) => ({
                            ...prev,
                            heartRate: e.target.value,
                          }))
                        }
                        placeholder="72"
                      />
                    </div>

                    <div>
                      <Label htmlFor="temperature">Temperature (°C)</Label>
                      <Input
                        id="temperature"
                        value={vitalSigns.temperature}
                        onChange={(e) =>
                          setVitalSigns((prev) => ({
                            ...prev,
                            temperature: e.target.value,
                          }))
                        }
                        placeholder="36.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="oxygen-saturation">
                        Oxygen Saturation (%)
                      </Label>
                      <Input
                        id="oxygen-saturation"
                        value={vitalSigns.oxygenSaturation}
                        onChange={(e) =>
                          setVitalSigns((prev) => ({
                            ...prev,
                            oxygenSaturation: e.target.value,
                          }))
                        }
                        placeholder="98"
                      />
                    </div>

                    <div>
                      <Label htmlFor="respiratory-rate">
                        Respiratory Rate (breaths/min)
                      </Label>
                      <Input
                        id="respiratory-rate"
                        value={vitalSigns.respiratoryRate}
                        onChange={(e) =>
                          setVitalSigns((prev) => ({
                            ...prev,
                            respiratoryRate: e.target.value,
                          }))
                        }
                        placeholder="16"
                      />
                    </div>

                    <Button onClick={handleRecordVitalSigns} className="w-full">
                      <Activity className="h-4 w-4 mr-2" />
                      Record Vital Signs
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Heart className="h-5 w-5 text-red-500" />
                        Connected Devices
                      </h4>
                      <div className="space-y-2">
                        {[
                          {
                            device: "Blood Pressure Monitor",
                            status: "connected",
                            battery: "85%",
                          },
                          {
                            device: "Pulse Oximeter",
                            status: "connected",
                            battery: "92%",
                          },
                          {
                            device: "Digital Thermometer",
                            status: "disconnected",
                            battery: "--",
                          },
                          {
                            device: "Smart Scale",
                            status: "connected",
                            battery: "78%",
                          },
                        ].map((device, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-white rounded"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  device.status === "connected"
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                }`}
                              ></div>
                              <span className="text-sm">{device.device}</span>
                            </div>
                            <span className="text-xs text-gray-600">
                              {device.battery}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-3">
                        Recent Measurements
                      </h4>
                      <div className="space-y-2">
                        {[
                          {
                            parameter: "Blood Pressure",
                            value: "120/80 mmHg",
                            time: "2 hours ago",
                            status: "normal",
                          },
                          {
                            parameter: "Heart Rate",
                            value: "72 bpm",
                            time: "2 hours ago",
                            status: "normal",
                          },
                          {
                            parameter: "Temperature",
                            value: "36.5°C",
                            time: "4 hours ago",
                            status: "normal",
                          },
                          {
                            parameter: "SpO2",
                            value: "98%",
                            time: "4 hours ago",
                            status: "normal",
                          },
                        ].map((measurement, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between text-sm"
                          >
                            <div>
                              <div className="font-medium">
                                {measurement.parameter}
                              </div>
                              <div className="text-blue-700">
                                {measurement.value}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-blue-600">
                                {measurement.time}
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {measurement.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recordings Tab */}
          <TabsContent value="recordings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Session Recordings</CardTitle>
                <CardDescription>
                  Access and manage telehealth session recordings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      sessionId: "session-002",
                      title: "Initial Consultation",
                      date: "2024-12-18",
                      duration: "45 minutes",
                      size: "125 MB",
                      available: true,
                    },
                    {
                      sessionId: "session-001",
                      title: "Follow-up Visit",
                      date: "2024-12-15",
                      duration: "30 minutes",
                      size: "89 MB",
                      available: true,
                    },
                  ].map((recording, index) => (
                    <Card
                      key={index}
                      className="border-l-4 border-l-purple-500"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{recording.title}</h3>
                            <p className="text-sm text-gray-600">
                              {recording.date} • {recording.duration} •{" "}
                              {recording.size}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <Monitor className="h-4 w-4 mr-2" />
                              View
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TelehealthPlatformIntegration;
