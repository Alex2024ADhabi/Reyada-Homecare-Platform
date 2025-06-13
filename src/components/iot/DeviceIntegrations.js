import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Heart, Pill, Shield, Thermometer, Activity, TrendingUp, AlertTriangle, CheckCircle, Battery, WifiOff, Droplets, Wind, Settings, RefreshCw, Plus, Bell, Zap, Database, LineChart, Brain, } from "lucide-react";
import { useIoTDevices } from "@/hooks/useIoTDevices";
import { format } from "date-fns";
export default function DeviceIntegrations({ facilityId = "RHHCS-001", patientId, }) {
    const { devices, alerts, analytics, pipelines, loading, error, addDevice, updateDevice, removeDevice, executeAction, getVitalSigns, getMedicationData, getFallDetectionData, getEnvironmentalData, acknowledgeAlert, resolveAlert, getDeviceAnalytics, subscribeToDevice, unsubscribeFromDevice, } = useIoTDevices();
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [activeTab, setActiveTab] = useState("overview");
    const [deviceReadings, setDeviceReadings] = useState([]);
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
    const getDeviceIcon = (type) => {
        switch (type) {
            case "vital_signs_monitor":
                return _jsx(Heart, { className: "w-5 h-5" });
            case "medication_dispenser":
                return _jsx(Pill, { className: "w-5 h-5" });
            case "fall_detection":
                return _jsx(Shield, { className: "w-5 h-5" });
            case "environmental_sensor":
                return _jsx(Thermometer, { className: "w-5 h-5" });
            case "glucose_monitor":
                return _jsx(Activity, { className: "w-5 h-5" });
            case "blood_pressure_monitor":
                return _jsx(Heart, { className: "w-5 h-5" });
            case "pulse_oximeter":
                return _jsx(Activity, { className: "w-5 h-5" });
            case "weight_scale":
                return _jsx(TrendingUp, { className: "w-5 h-5" });
            case "temperature_sensor":
                return _jsx(Thermometer, { className: "w-5 h-5" });
            case "air_quality_sensor":
                return _jsx(Wind, { className: "w-5 h-5" });
            default:
                return _jsx(Settings, { className: "w-5 h-5" });
        }
    };
    const getStatusColor = (status) => {
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
    const getSeverityColor = (severity) => {
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
    const handleDeviceSelect = async (device) => {
        setSelectedDevice(device);
        setRefreshing(true);
        try {
            let readings = [];
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
        }
        catch (error) {
            console.error("Error fetching device readings:", error);
        }
        finally {
            setRefreshing(false);
        }
    };
    const handleAlertAction = async (alertId, action) => {
        try {
            if (action === "acknowledge") {
                await acknowledgeAlert(alertId);
            }
            else {
                await resolveAlert(alertId);
            }
        }
        catch (error) {
            console.error(`Error ${action}ing alert:`, error);
        }
    };
    const renderDeviceReadings = () => {
        if (!selectedDevice || deviceReadings.length === 0) {
            return (_jsx("div", { className: "text-center py-8 text-gray-500", children: "Select a device to view readings" }));
        }
        const latestReading = deviceReadings[0];
        switch (selectedDevice.type) {
            case "vital_signs_monitor":
                return (_jsx("div", { className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [_jsx(Card, { children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Heart, { className: "w-4 h-4 text-red-500" }), _jsx("span", { className: "text-sm font-medium", children: "Heart Rate" })] }), _jsxs("div", { className: "text-2xl font-bold", children: [Math.round(latestReading.heartRate), " BPM"] })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Activity, { className: "w-4 h-4 text-blue-500" }), _jsx("span", { className: "text-sm font-medium", children: "Blood Pressure" })] }), _jsxs("div", { className: "text-2xl font-bold", children: [Math.round(latestReading.bloodPressure.systolic), "/", Math.round(latestReading.bloodPressure.diastolic)] })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Wind, { className: "w-4 h-4 text-green-500" }), _jsx("span", { className: "text-sm font-medium", children: "O2 Saturation" })] }), _jsxs("div", { className: "text-2xl font-bold", children: [Math.round(latestReading.oxygenSaturation), "%"] })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Thermometer, { className: "w-4 h-4 text-orange-500" }), _jsx("span", { className: "text-sm font-medium", children: "Temperature" })] }), _jsxs("div", { className: "text-2xl font-bold", children: [latestReading.temperature.toFixed(1), "\u00B0C"] })] }) })] }) }));
            case "medication_dispenser":
                return (_jsx("div", { className: "space-y-4", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Medication" }), _jsx(TableHead, { children: "Dosage" }), _jsx(TableHead, { children: "Scheduled" }), _jsx(TableHead, { children: "Status" })] }) }), _jsx(TableBody, { children: deviceReadings.slice(0, 10).map((reading) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: reading.medicationName }), _jsx(TableCell, { children: reading.dosage }), _jsx(TableCell, { children: format(new Date(reading.scheduledTime), "MMM dd, HH:mm") }), _jsx(TableCell, { children: _jsx(Badge, { className: reading.dispensed
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800", children: reading.dispensed
                                                    ? "Dispensed"
                                                    : reading.missed
                                                        ? "Missed"
                                                        : "Pending" }) })] }, reading.id))) })] }) }));
            case "fall_detection":
                return (_jsx("div", { className: "space-y-4", children: deviceReadings.map((reading) => (_jsx(Card, { className: reading.fallDetected ? "border-red-200 bg-red-50" : "", children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Shield, { className: `w-4 h-4 ${reading.fallDetected ? "text-red-500" : "text-green-500"}` }), _jsx("span", { className: "font-medium", children: reading.fallDetected
                                                        ? "Fall Detected"
                                                        : "Normal Activity" })] }), _jsx("span", { className: "text-sm text-gray-500", children: format(new Date(reading.timestamp), "MMM dd, HH:mm") })] }), reading.fallDetected && (_jsxs("div", { className: "mt-2 text-sm", children: [_jsxs("p", { children: ["Confidence: ", (reading.confidence * 100).toFixed(1), "%"] }), _jsxs("p", { children: ["Emergency Triggered:", " ", reading.emergencyTriggered ? "Yes" : "No"] })] }))] }) }, reading.id))) }));
            case "environmental_sensor":
                return (_jsx("div", { className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-4", children: [_jsx(Card, { children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Thermometer, { className: "w-4 h-4 text-red-500" }), _jsx("span", { className: "text-sm font-medium", children: "Temperature" })] }), _jsxs("div", { className: "text-2xl font-bold", children: [latestReading.temperature.toFixed(1), "\u00B0C"] })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Droplets, { className: "w-4 h-4 text-blue-500" }), _jsx("span", { className: "text-sm font-medium", children: "Humidity" })] }), _jsxs("div", { className: "text-2xl font-bold", children: [Math.round(latestReading.humidity), "%"] })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Wind, { className: "w-4 h-4 text-green-500" }), _jsx("span", { className: "text-sm font-medium", children: "Air Quality" })] }), _jsxs("div", { className: "text-2xl font-bold", children: [Math.round(latestReading.airQuality.pm25), " PM2.5"] })] }) })] }) }));
            default:
                return (_jsx("div", { className: "text-center py-8 text-gray-500", children: "No specific readings available for this device type" }));
        }
    };
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 p-6 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx(RefreshCw, { className: "w-8 h-8 animate-spin mx-auto mb-4" }), _jsx("p", { children: "Loading IoT devices..." })] }) }));
    }
    if (error) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 p-6 flex items-center justify-center", children: _jsxs(Alert, { className: "max-w-md", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "Error" }), _jsx(AlertDescription, { children: error })] }) }));
    }
    return (_jsx("div", { className: "min-h-screen bg-gray-50 p-6", children: _jsxs("div", { className: "max-w-7xl mx-auto space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-3xl font-bold text-gray-900 flex items-center", children: [_jsx(Zap, { className: "w-8 h-8 mr-3 text-blue-600" }), "IoT Device Integration"] }), _jsx("p", { className: "text-gray-600 mt-1", children: "Real-time monitoring and management of connected healthcare devices" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Badge, { variant: "outline", className: "flex items-center gap-1", children: [_jsx(Database, { className: "w-3 h-3" }), filteredDevices.length, " Devices"] }), _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Add Device"] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs(Card, { className: "border-green-200 bg-green-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium text-green-800 flex items-center gap-2", children: [_jsx(CheckCircle, { className: "w-4 h-4" }), "Online Devices"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "text-2xl font-bold text-green-900", children: filteredDevices.filter((d) => d.status === "online").length }) })] }), _jsxs(Card, { className: "border-red-200 bg-red-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium text-red-800 flex items-center gap-2", children: [_jsx(WifiOff, { className: "w-4 h-4" }), "Offline Devices"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "text-2xl font-bold text-red-900", children: filteredDevices.filter((d) => d.status === "offline").length }) })] }), _jsxs(Card, { className: "border-orange-200 bg-orange-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium text-orange-800 flex items-center gap-2", children: [_jsx(AlertTriangle, { className: "w-4 h-4" }), "Active Alerts"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "text-2xl font-bold text-orange-900", children: filteredAlerts.filter((a) => !a.resolvedAt).length }) })] }), _jsxs(Card, { className: "border-blue-200 bg-blue-50", children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs(CardTitle, { className: "text-sm font-medium text-blue-800 flex items-center gap-2", children: [_jsx(LineChart, { className: "w-4 h-4" }), "Data Pipelines"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "text-2xl font-bold text-blue-900", children: pipelines.filter((p) => p.status === "active").length }) })] })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "space-y-6", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-5", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "devices", children: "Devices" }), _jsx(TabsTrigger, { value: "alerts", children: "Alerts" }), _jsx(TabsTrigger, { value: "analytics", children: "Analytics" }), _jsx(TabsTrigger, { value: "pipelines", children: "Data Pipelines" })] }), _jsx(TabsContent, { value: "overview", className: "space-y-6", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Device Status Distribution" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: ["online", "offline", "maintenance", "error"].map((status) => {
                                                        const count = filteredDevices.filter((d) => d.status === status).length;
                                                        const percentage = filteredDevices.length > 0
                                                            ? (count / filteredDevices.length) * 100
                                                            : 0;
                                                        return (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: `w-3 h-3 rounded-full ${status === "online"
                                                                                ? "bg-green-500"
                                                                                : status === "offline"
                                                                                    ? "bg-red-500"
                                                                                    : status === "maintenance"
                                                                                        ? "bg-yellow-500"
                                                                                        : "bg-red-600"}` }), _jsx("span", { className: "capitalize", children: status })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm font-medium", children: count }), _jsx(Progress, { value: percentage, className: "w-20 h-2" })] })] }, status));
                                                    }) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Recent Alerts" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: filteredAlerts.slice(0, 5).map((alert) => (_jsxs("div", { className: "flex items-center justify-between p-3 border rounded", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(AlertTriangle, { className: `w-4 h-4 ${alert.severity === "critical"
                                                                            ? "text-red-500"
                                                                            : alert.severity === "high"
                                                                                ? "text-orange-500"
                                                                                : alert.severity === "medium"
                                                                                    ? "text-yellow-500"
                                                                                    : "text-blue-500"}` }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium", children: alert.message }), _jsx("p", { className: "text-xs text-gray-500", children: format(new Date(alert.timestamp), "MMM dd, HH:mm") })] })] }), _jsx(Badge, { className: getSeverityColor(alert.severity), children: alert.severity })] }, alert.id))) }) })] })] }) }), _jsx(TabsContent, { value: "devices", className: "space-y-6", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Connected Devices" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: filteredDevices.map((device) => (_jsxs("div", { className: `p-4 border rounded cursor-pointer transition-colors ${selectedDevice?.id === device.id
                                                            ? "border-blue-500 bg-blue-50"
                                                            : "hover:bg-gray-50"}`, onClick: () => handleDeviceSelect(device), children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [getDeviceIcon(device.type), _jsxs("div", { children: [_jsx("h4", { className: "font-medium", children: device.name }), _jsx("p", { className: "text-sm text-gray-500", children: device.location })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { className: getStatusColor(device.status), children: device.status }), device.batteryLevel && (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Battery, { className: "w-3 h-3" }), _jsxs("span", { className: "text-xs", children: [Math.round(device.batteryLevel), "%"] })] }))] })] }), _jsxs("div", { className: "mt-2 text-xs text-gray-500", children: ["Last seen:", " ", format(new Date(device.lastSeen), "MMM dd, HH:mm")] })] }, device.id))) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center justify-between", children: ["Device Readings", refreshing && (_jsx(RefreshCw, { className: "w-4 h-4 animate-spin" }))] }) }), _jsx(CardContent, { children: renderDeviceReadings() })] })] }) }), _jsx(TabsContent, { value: "alerts", className: "space-y-6", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Device Alerts" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: filteredAlerts.map((alert) => {
                                                const device = devices.find((d) => d.id === alert.deviceId);
                                                return (_jsx("div", { className: `p-4 border rounded ${getSeverityColor(alert.severity)}`, children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(AlertTriangle, { className: "w-5 h-5" }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium", children: alert.message }), _jsxs("p", { className: "text-sm opacity-75", children: [device?.name, " \u2022", " ", format(new Date(alert.timestamp), "MMM dd, HH:mm")] })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [!alert.acknowledged && (_jsxs(Button, { size: "sm", variant: "outline", onClick: () => handleAlertAction(alert.id, "acknowledge"), children: [_jsx(Bell, { className: "w-3 h-3 mr-1" }), "Acknowledge"] })), alert.acknowledged && !alert.resolvedAt && (_jsxs(Button, { size: "sm", variant: "outline", onClick: () => handleAlertAction(alert.id, "resolve"), children: [_jsx(CheckCircle, { className: "w-3 h-3 mr-1" }), "Resolve"] })), _jsx(Badge, { className: getSeverityColor(alert.severity), children: alert.severity })] })] }) }, alert.id));
                                            }) }) })] }) }), _jsx(TabsContent, { value: "analytics", className: "space-y-6", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Device Performance" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: filteredDevices.slice(0, 5).map((device) => (_jsxs("div", { className: "flex items-center justify-between p-3 border rounded", children: [_jsxs("div", { className: "flex items-center gap-2", children: [getDeviceIcon(device.type), _jsx("span", { className: "font-medium", children: device.name })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm", children: "98.5% uptime" }), _jsx(Progress, { value: 98.5, className: "w-20 h-2" })] })] }, device.id))) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Predictive Insights" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [_jsxs(Alert, { className: "bg-blue-50 border-blue-200", children: [_jsx(Brain, { className: "h-4 w-4 text-blue-600" }), _jsx(AlertTitle, { className: "text-blue-800", children: "Maintenance Prediction" }), _jsx(AlertDescription, { className: "text-blue-700", children: "Device VSM-2024-001 may require calibration within 48 hours based on drift patterns." })] }), _jsxs(Alert, { className: "bg-yellow-50 border-yellow-200", children: [_jsx(TrendingUp, { className: "h-4 w-4 text-yellow-600" }), _jsx(AlertTitle, { className: "text-yellow-800", children: "Usage Trend" }), _jsx(AlertDescription, { className: "text-yellow-700", children: "Medication dispenser usage increased 15% this week. Consider inventory check." })] })] }) })] })] }) }), _jsx(TabsContent, { value: "pipelines", className: "space-y-6", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Data Processing Pipelines" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: pipelines.map((pipeline) => (_jsxs("div", { className: "p-4 border rounded", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium", children: pipeline.name }), _jsxs("p", { className: "text-sm text-gray-500", children: ["Processing ", pipeline.deviceTypes.join(", "), " data"] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { className: pipeline.status === "active"
                                                                            ? "bg-green-100 text-green-800"
                                                                            : "bg-red-100 text-red-800", children: pipeline.status }), _jsxs("span", { className: "text-sm text-gray-500", children: [pipeline.throughput, " records/min"] })] })] }), _jsxs("div", { className: "mt-3 flex items-center gap-4 text-sm text-gray-500", children: [_jsxs("span", { children: [pipeline.processors.length, " processors"] }), _jsxs("span", { children: [pipeline.destinations.length, " destinations"] }), _jsxs("span", { children: ["Last processed:", " ", format(new Date(pipeline.lastProcessed), "HH:mm")] })] })] }, pipeline.id))) }) })] }) })] })] }) }));
}
