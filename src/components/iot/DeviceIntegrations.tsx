import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Heart,
  Pill,
  Shield,
  Thermometer,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Battery,
  Wifi,
  WifiOff,
  Droplets,
  Wind,
  Sun,
  Volume2,
  Settings,
  RefreshCw,
  Plus,
  Eye,
  Bell,
  BellOff,
  Zap,
  Database,
  LineChart,
  Brain,
} from "lucide-react";
import { useIoTDevices } from "@/hooks/useIoTDevices";
import {
  IoTDevice,
  DeviceAlert,
  VitalSignsReading,
  MedicationDispenserReading,
  FallDetectionReading,
  EnvironmentalReading,
  DeviceType,
  DeviceStatus,
  AlertSeverity,
} from "@/types/iot-devices";
import { format } from "date-fns";

interface DeviceIntegrationsProps {
  facilityId?: string;
  patientId?: string;
}

export default function DeviceIntegrations({
  facilityId = "RHHCS-001",
  patientId,
}: DeviceIntegrationsProps) {
  const {
    devices,
    alerts,
    analytics,
    pipelines,
    loading,
    error,
    addDevice,
    updateDevice,
    removeDevice,
    executeAction,
    getVitalSigns,
    getMedicationData,
    getFallDetectionData,
    getEnvironmentalData,
    acknowledgeAlert,
    resolveAlert,
    getDeviceAnalytics,
    subscribeToDevice,
    unsubscribeFromDevice,
  } = useIoTDevices();

  const [selectedDevice, setSelectedDevice] = useState<IoTDevice | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [deviceReadings, setDeviceReadings] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Filter devices by patient if specified
  const filteredDevices = patientId
    ? devices.filter((device) => device.patientId === patientId)
    : devices;

  // Filter alerts by patient if specified
  const filteredAlerts = patientId
    ? alerts.filter((alert) => {
        const device = devices.find((d) => d.id === alert.deviceId);
        return device?.patientId === patientId;
      })
    : alerts;

  const getDeviceIcon = (type: DeviceType) => {
    switch (type) {
      case "vital_signs_monitor":
        return <Heart className="w-5 h-5" />;
      case "medication_dispenser":
        return <Pill className="w-5 h-5" />;
      case "fall_detection":
        return <Shield className="w-5 h-5" />;
      case "environmental_sensor":
        return <Thermometer className="w-5 h-5" />;
      case "glucose_monitor":
        return <Activity className="w-5 h-5" />;
      case "blood_pressure_monitor":
        return <Heart className="w-5 h-5" />;
      case "pulse_oximeter":
        return <Activity className="w-5 h-5" />;
      case "weight_scale":
        return <TrendingUp className="w-5 h-5" />;
      case "temperature_sensor":
        return <Thermometer className="w-5 h-5" />;
      case "air_quality_sensor":
        return <Wind className="w-5 h-5" />;
      default:
        return <Settings className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: DeviceStatus) => {
    switch (status) {
      case "online":
        return "text-green-600 bg-green-100";
      case "offline":
        return "text-red-600 bg-red-100";
      case "maintenance":
        return "text-yellow-600 bg-yellow-100";
      case "error":
        return "text-red-600 bg-red-100";
      case "low_battery":
        return "text-orange-600 bg-orange-100";
      case "calibrating":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case "critical":
        return "text-red-600 bg-red-100 border-red-200";
      case "high":
        return "text-orange-600 bg-orange-100 border-orange-200";
      case "medium":
        return "text-yellow-600 bg-yellow-100 border-yellow-200";
      case "low":
        return "text-blue-600 bg-blue-100 border-blue-200";
      default:
        return "text-gray-600 bg-gray-100 border-gray-200";
    }
  };

  const handleDeviceSelect = async (device: IoTDevice) => {
    setSelectedDevice(device);
    setRefreshing(true);

    try {
      let readings: any[] = [];
      const timeRange = {
        start: new Date(Date.now() - 24 * 60 * 60 * 1000),
        end: new Date(),
      };

      switch (device.type) {
        case "vital_signs_monitor":
          readings = await getVitalSigns(device.id, timeRange);
          break;
        case "medication_dispenser":
          readings = await getMedicationData(device.id, timeRange);
          break;
        case "fall_detection":
          readings = await getFallDetectionData(device.id, timeRange);
          break;
        case "environmental_sensor":
          readings = await getEnvironmentalData(device.id, timeRange);
          break;
      }

      setDeviceReadings(readings);
    } catch (error) {
      console.error("Error fetching device readings:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleAlertAction = async (
    alertId: string,
    action: "acknowledge" | "resolve",
  ) => {
    try {
      if (action === "acknowledge") {
        await acknowledgeAlert(alertId);
      } else {
        await resolveAlert(alertId);
      }
    } catch (error) {
      console.error(`Error ${action}ing alert:`, error);
    }
  };

  const renderDeviceReadings = () => {
    if (!selectedDevice || deviceReadings.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          Select a device to view readings
        </div>
      );
    }

    const latestReading = deviceReadings[0];

    switch (selectedDevice.type) {
      case "vital_signs_monitor":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium">Heart Rate</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {Math.round(latestReading.heartRate)} BPM
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">Blood Pressure</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {Math.round(latestReading.bloodPressure.systolic)}/
                    {Math.round(latestReading.bloodPressure.diastolic)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">O2 Saturation</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {Math.round(latestReading.oxygenSaturation)}%
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium">Temperature</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {latestReading.temperature.toFixed(1)}°C
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "medication_dispenser":
        return (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medication</TableHead>
                  <TableHead>Dosage</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deviceReadings.slice(0, 10).map((reading) => (
                  <TableRow key={reading.id}>
                    <TableCell>{reading.medicationName}</TableCell>
                    <TableCell>{reading.dosage}</TableCell>
                    <TableCell>
                      {format(new Date(reading.scheduledTime), "MMM dd, HH:mm")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          reading.dispensed
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {reading.dispensed
                          ? "Dispensed"
                          : reading.missed
                            ? "Missed"
                            : "Pending"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );

      case "fall_detection":
        return (
          <div className="space-y-4">
            {deviceReadings.map((reading) => (
              <Card
                key={reading.id}
                className={
                  reading.fallDetected ? "border-red-200 bg-red-50" : ""
                }
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield
                        className={`w-4 h-4 ${reading.fallDetected ? "text-red-500" : "text-green-500"}`}
                      />
                      <span className="font-medium">
                        {reading.fallDetected
                          ? "Fall Detected"
                          : "Normal Activity"}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {format(new Date(reading.timestamp), "MMM dd, HH:mm")}
                    </span>
                  </div>
                  {reading.fallDetected && (
                    <div className="mt-2 text-sm">
                      <p>
                        Confidence: {(reading.confidence * 100).toFixed(1)}%
                      </p>
                      <p>
                        Emergency Triggered:{" "}
                        {reading.emergencyTriggered ? "Yes" : "No"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case "environmental_sensor":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium">Temperature</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {latestReading.temperature.toFixed(1)}°C
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">Humidity</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {Math.round(latestReading.humidity)}%
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">Air Quality</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {Math.round(latestReading.airQuality.pm25)} PM2.5
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-gray-500">
            No specific readings available for this device type
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading IoT devices...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Zap className="w-8 h-8 mr-3 text-blue-600" />
              IoT Device Integration
            </h1>
            <p className="text-gray-600 mt-1">
              Real-time monitoring and management of connected healthcare
              devices
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Database className="w-3 h-3" />
              {filteredDevices.length} Devices
            </Badge>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Device
            </Button>
          </div>
        </div>

        {/* Device Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Online Devices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">
                {filteredDevices.filter((d) => d.status === "online").length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-800 flex items-center gap-2">
                <WifiOff className="w-4 h-4" />
                Offline Devices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900">
                {filteredDevices.filter((d) => d.status === "offline").length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Active Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">
                {filteredAlerts.filter((a) => !a.resolvedAt).length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
                <LineChart className="w-4 h-4" />
                Data Pipelines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                {pipelines.filter((p) => p.status === "active").length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="devices">Devices</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="pipelines">Data Pipelines</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Device Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {["online", "offline", "maintenance", "error"].map(
                      (status) => {
                        const count = filteredDevices.filter(
                          (d) => d.status === status,
                        ).length;
                        const percentage =
                          filteredDevices.length > 0
                            ? (count / filteredDevices.length) * 100
                            : 0;
                        return (
                          <div
                            key={status}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  status === "online"
                                    ? "bg-green-500"
                                    : status === "offline"
                                      ? "bg-red-500"
                                      : status === "maintenance"
                                        ? "bg-yellow-500"
                                        : "bg-red-600"
                                }`}
                              />
                              <span className="capitalize">{status}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {count}
                              </span>
                              <Progress
                                value={percentage}
                                className="w-20 h-2"
                              />
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredAlerts.slice(0, 5).map((alert) => (
                      <div
                        key={alert.id}
                        className="flex items-center justify-between p-3 border rounded"
                      >
                        <div className="flex items-center gap-2">
                          <AlertTriangle
                            className={`w-4 h-4 ${
                              alert.severity === "critical"
                                ? "text-red-500"
                                : alert.severity === "high"
                                  ? "text-orange-500"
                                  : alert.severity === "medium"
                                    ? "text-yellow-500"
                                    : "text-blue-500"
                            }`}
                          />
                          <div>
                            <p className="text-sm font-medium">
                              {alert.message}
                            </p>
                            <p className="text-xs text-gray-500">
                              {format(
                                new Date(alert.timestamp),
                                "MMM dd, HH:mm",
                              )}
                            </p>
                          </div>
                        </div>
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Devices Tab */}
          <TabsContent value="devices" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Connected Devices</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredDevices.map((device) => (
                      <div
                        key={device.id}
                        className={`p-4 border rounded cursor-pointer transition-colors ${
                          selectedDevice?.id === device.id
                            ? "border-blue-500 bg-blue-50"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => handleDeviceSelect(device)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getDeviceIcon(device.type)}
                            <div>
                              <h4 className="font-medium">{device.name}</h4>
                              <p className="text-sm text-gray-500">
                                {device.location}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(device.status)}>
                              {device.status}
                            </Badge>
                            {device.batteryLevel && (
                              <div className="flex items-center gap-1">
                                <Battery className="w-3 h-3" />
                                <span className="text-xs">
                                  {Math.round(device.batteryLevel)}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          Last seen:{" "}
                          {format(new Date(device.lastSeen), "MMM dd, HH:mm")}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Device Readings
                    {refreshing && (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>{renderDeviceReadings()}</CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Device Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredAlerts.map((alert) => {
                    const device = devices.find((d) => d.id === alert.deviceId);
                    return (
                      <div
                        key={alert.id}
                        className={`p-4 border rounded ${getSeverityColor(alert.severity)}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5" />
                            <div>
                              <h4 className="font-medium">{alert.message}</h4>
                              <p className="text-sm opacity-75">
                                {device?.name} •{" "}
                                {format(
                                  new Date(alert.timestamp),
                                  "MMM dd, HH:mm",
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {!alert.acknowledged && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleAlertAction(alert.id, "acknowledge")
                                }
                              >
                                <Bell className="w-3 h-3 mr-1" />
                                Acknowledge
                              </Button>
                            )}
                            {alert.acknowledged && !alert.resolvedAt && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleAlertAction(alert.id, "resolve")
                                }
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Resolve
                              </Button>
                            )}
                            <Badge className={getSeverityColor(alert.severity)}>
                              {alert.severity}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Device Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredDevices.slice(0, 5).map((device) => (
                      <div
                        key={device.id}
                        className="flex items-center justify-between p-3 border rounded"
                      >
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(device.type)}
                          <span className="font-medium">{device.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">98.5% uptime</span>
                          <Progress value={98.5} className="w-20 h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Predictive Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Alert className="bg-blue-50 border-blue-200">
                      <Brain className="h-4 w-4 text-blue-600" />
                      <AlertTitle className="text-blue-800">
                        Maintenance Prediction
                      </AlertTitle>
                      <AlertDescription className="text-blue-700">
                        Device VSM-2024-001 may require calibration within 48
                        hours based on drift patterns.
                      </AlertDescription>
                    </Alert>
                    <Alert className="bg-yellow-50 border-yellow-200">
                      <TrendingUp className="h-4 w-4 text-yellow-600" />
                      <AlertTitle className="text-yellow-800">
                        Usage Trend
                      </AlertTitle>
                      <AlertDescription className="text-yellow-700">
                        Medication dispenser usage increased 15% this week.
                        Consider inventory check.
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Data Pipelines Tab */}
          <TabsContent value="pipelines" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Processing Pipelines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pipelines.map((pipeline) => (
                    <div key={pipeline.id} className="p-4 border rounded">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{pipeline.name}</h4>
                          <p className="text-sm text-gray-500">
                            Processing {pipeline.deviceTypes.join(", ")} data
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={
                              pipeline.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {pipeline.status}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {pipeline.throughput} records/min
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                        <span>{pipeline.processors.length} processors</span>
                        <span>{pipeline.destinations.length} destinations</span>
                        <span>
                          Last processed:{" "}
                          {format(new Date(pipeline.lastProcessed), "HH:mm")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
