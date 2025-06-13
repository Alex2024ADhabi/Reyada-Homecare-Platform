import { useState, useEffect, useCallback } from "react";
export function useIoTDevices() {
    const [devices, setDevices] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [analytics, setAnalytics] = useState([]);
    const [pipelines, setPipelines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [subscriptions, setSubscriptions] = useState(new Set());
    // Initialize mock data and real-time connections
    useEffect(() => {
        initializeDevices();
        initializePipelines();
        startRealTimeUpdates();
        return () => {
            stopRealTimeUpdates();
        };
    }, []);
    const initializeDevices = async () => {
        try {
            setLoading(true);
            // Mock IoT devices data
            const mockDevices = [
                {
                    id: "device-001",
                    name: "Vital Signs Monitor - Room 101",
                    type: "vital_signs_monitor",
                    status: "online",
                    location: "Patient Room 101",
                    lastSeen: new Date(),
                    batteryLevel: 85,
                    firmwareVersion: "2.1.3",
                    serialNumber: "VSM-2024-001",
                    patientId: "patient-001",
                    configuration: {
                        measurementInterval: 5,
                        alertThresholds: {
                            heartRate: { min: 60, max: 100, critical: true },
                            bloodPressure: { min: 90, max: 140, critical: true },
                            oxygenSaturation: { min: 95, max: 100, critical: true },
                        },
                        dataRetention: 30,
                        autoCalibration: true,
                        emergencyContacts: ["nurse-001", "doctor-001"],
                    },
                },
                {
                    id: "device-002",
                    name: "Medication Dispenser - Room 102",
                    type: "medication_dispenser",
                    status: "online",
                    location: "Patient Room 102",
                    lastSeen: new Date(Date.now() - 2 * 60 * 1000),
                    batteryLevel: 92,
                    firmwareVersion: "1.8.2",
                    serialNumber: "MD-2024-002",
                    patientId: "patient-002",
                    configuration: {
                        measurementInterval: 60,
                        alertThresholds: {
                            missedDose: { max: 1, critical: true },
                        },
                        dataRetention: 90,
                        autoCalibration: false,
                        emergencyContacts: ["nurse-002", "pharmacist-001"],
                    },
                },
                {
                    id: "device-003",
                    name: "Fall Detection Sensor - Room 103",
                    type: "fall_detection",
                    status: "online",
                    location: "Patient Room 103",
                    lastSeen: new Date(Date.now() - 30 * 1000),
                    batteryLevel: 78,
                    firmwareVersion: "3.0.1",
                    serialNumber: "FD-2024-003",
                    patientId: "patient-003",
                    configuration: {
                        measurementInterval: 1,
                        alertThresholds: {
                            fallConfidence: { min: 0.8, critical: true },
                        },
                        dataRetention: 60,
                        autoCalibration: true,
                        emergencyContacts: ["nurse-003", "emergency-001"],
                    },
                },
                {
                    id: "device-004",
                    name: "Environmental Sensor - Common Area",
                    type: "environmental_sensor",
                    status: "online",
                    location: "Common Area Floor 1",
                    lastSeen: new Date(Date.now() - 5 * 60 * 1000),
                    batteryLevel: 95,
                    firmwareVersion: "2.3.0",
                    serialNumber: "ES-2024-004",
                    configuration: {
                        measurementInterval: 10,
                        alertThresholds: {
                            temperature: { min: 18, max: 26, critical: false },
                            humidity: { min: 30, max: 70, critical: false },
                            airQuality: { max: 50, critical: true },
                        },
                        dataRetention: 365,
                        autoCalibration: true,
                        emergencyContacts: ["facility-manager-001"],
                    },
                },
            ];
            // Mock alerts
            const mockAlerts = [
                {
                    id: "alert-001",
                    deviceId: "device-001",
                    type: "vital_signs_abnormal",
                    severity: "high",
                    message: "Heart rate elevated: 115 BPM (Normal: 60-100)",
                    timestamp: new Date(Date.now() - 10 * 60 * 1000),
                    acknowledged: false,
                    actionRequired: true,
                },
                {
                    id: "alert-002",
                    deviceId: "device-002",
                    type: "medication_missed",
                    severity: "medium",
                    message: "Medication dose missed: Metformin 500mg at 14:00",
                    timestamp: new Date(Date.now() - 30 * 60 * 1000),
                    acknowledged: true,
                    actionRequired: true,
                },
                {
                    id: "alert-003",
                    deviceId: "device-003",
                    type: "low_battery",
                    severity: "low",
                    message: "Battery level low: 78% remaining",
                    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                    acknowledged: false,
                    actionRequired: false,
                },
            ];
            setDevices(mockDevices);
            setAlerts(mockAlerts);
            setError(null);
        }
        catch (err) {
            setError("Failed to initialize IoT devices");
            console.error("Error initializing devices:", err);
        }
        finally {
            setLoading(false);
        }
    };
    const initializePipelines = async () => {
        const mockPipelines = [
            {
                id: "pipeline-001",
                name: "Vital Signs Processing Pipeline",
                deviceTypes: ["vital_signs_monitor"],
                processors: [
                    {
                        id: "proc-001",
                        type: "validate",
                        configuration: { schema: "vital_signs_v1" },
                        order: 1,
                    },
                    {
                        id: "proc-002",
                        type: "transform",
                        configuration: { format: "standardized" },
                        order: 2,
                    },
                    {
                        id: "proc-003",
                        type: "aggregate",
                        configuration: { interval: "5m" },
                        order: 3,
                    },
                ],
                destinations: [
                    {
                        id: "dest-001",
                        type: "database",
                        configuration: { table: "vital_signs_readings" },
                        enabled: true,
                    },
                    {
                        id: "dest-002",
                        type: "stream",
                        configuration: { topic: "real_time_vitals" },
                        enabled: true,
                    },
                ],
                status: "active",
                throughput: 1250,
                lastProcessed: new Date(),
            },
        ];
        setPipelines(mockPipelines);
    };
    const startRealTimeUpdates = () => {
        // Simulate real-time device status updates
        const interval = setInterval(() => {
            setDevices((prevDevices) => prevDevices.map((device) => ({
                ...device,
                lastSeen: Math.random() > 0.1 ? new Date() : device.lastSeen,
                status: Math.random() > 0.05 ? device.status : "offline",
                batteryLevel: device.batteryLevel
                    ? Math.max(0, device.batteryLevel - Math.random() * 0.1)
                    : undefined,
            })));
        }, 30000); // Update every 30 seconds
        return () => clearInterval(interval);
    };
    const stopRealTimeUpdates = () => {
        // Cleanup real-time connections
    };
    const addDevice = useCallback(async (deviceData) => {
        try {
            const newDevice = {
                ...deviceData,
                id: `device-${Date.now()}`,
                lastSeen: new Date(),
            };
            setDevices((prev) => [...prev, newDevice]);
            // In a real implementation, this would call an API
            // await api.addDevice(newDevice);
        }
        catch (err) {
            setError("Failed to add device");
            throw err;
        }
    }, []);
    const updateDevice = useCallback(async (id, updates) => {
        try {
            setDevices((prev) => prev.map((device) => device.id === id ? { ...device, ...updates } : device));
            // In a real implementation, this would call an API
            // await api.updateDevice(id, updates);
        }
        catch (err) {
            setError("Failed to update device");
            throw err;
        }
    }, []);
    const removeDevice = useCallback(async (id) => {
        try {
            setDevices((prev) => prev.filter((device) => device.id !== id));
            // In a real implementation, this would call an API
            // await api.removeDevice(id);
        }
        catch (err) {
            setError("Failed to remove device");
            throw err;
        }
    }, []);
    const executeAction = useCallback(async (action) => {
        try {
            // Simulate action execution
            console.log("Executing action:", action);
            // In a real implementation, this would call an API
            // await api.executeDeviceAction(action);
        }
        catch (err) {
            setError("Failed to execute device action");
            throw err;
        }
    }, []);
    const getVitalSigns = useCallback(async (deviceId, timeRange) => {
        // Mock vital signs data
        const mockReadings = Array.from({ length: 24 }, (_, i) => ({
            id: `reading-${deviceId}-${i}`,
            deviceId,
            patientId: "patient-001",
            timestamp: new Date(Date.now() - i * 60 * 60 * 1000),
            heartRate: 70 + Math.random() * 30,
            bloodPressure: {
                systolic: 120 + Math.random() * 20,
                diastolic: 80 + Math.random() * 10,
            },
            oxygenSaturation: 95 + Math.random() * 5,
            temperature: 36.5 + Math.random() * 1.5,
            respiratoryRate: 16 + Math.random() * 8,
            alerts: [],
        }));
        return mockReadings;
    }, []);
    const getMedicationData = useCallback(async (deviceId, timeRange) => {
        // Mock medication data
        const mockReadings = Array.from({ length: 10 }, (_, i) => ({
            id: `med-reading-${deviceId}-${i}`,
            deviceId,
            patientId: "patient-002",
            timestamp: new Date(Date.now() - i * 8 * 60 * 60 * 1000),
            medicationId: `med-${(i % 3) + 1}`,
            medicationName: ["Metformin", "Lisinopril", "Atorvastatin"][i % 3],
            dosage: ["500mg", "10mg", "20mg"][i % 3],
            dispensed: Math.random() > 0.1,
            scheduledTime: new Date(Date.now() - i * 8 * 60 * 60 * 1000),
            actualTime: Math.random() > 0.1
                ? new Date(Date.now() -
                    i * 8 * 60 * 60 * 1000 +
                    Math.random() * 30 * 60 * 1000)
                : undefined,
            missed: Math.random() < 0.1,
            alerts: [],
        }));
        return mockReadings;
    }, []);
    const getFallDetectionData = useCallback(async (deviceId, timeRange) => {
        // Mock fall detection data
        const mockReadings = Array.from({ length: 5 }, (_, i) => ({
            id: `fall-reading-${deviceId}-${i}`,
            deviceId,
            patientId: "patient-003",
            timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
            fallDetected: i === 0, // Only the most recent has a fall
            confidence: i === 0 ? 0.95 : 0.1 + Math.random() * 0.3,
            location: {
                x: Math.random() * 10,
                y: Math.random() * 10,
                z: 1.5 + Math.random() * 0.5,
            },
            acceleration: {
                x: Math.random() * 2 - 1,
                y: Math.random() * 2 - 1,
                z: -9.8 + Math.random() * 0.5,
            },
            emergencyTriggered: i === 0,
            alerts: [],
        }));
        return mockReadings;
    }, []);
    const getEnvironmentalData = useCallback(async (deviceId, timeRange) => {
        // Mock environmental data
        const mockReadings = Array.from({ length: 144 }, (_, i) => ({
            id: `env-reading-${deviceId}-${i}`,
            deviceId,
            location: "Common Area Floor 1",
            timestamp: new Date(Date.now() - i * 10 * 60 * 1000),
            temperature: 22 + Math.random() * 4,
            humidity: 45 + Math.random() * 20,
            airQuality: {
                pm25: Math.random() * 50,
                pm10: Math.random() * 100,
                co2: 400 + Math.random() * 600,
                voc: Math.random() * 300,
            },
            lightLevel: Math.random() * 1000,
            noiseLevel: 30 + Math.random() * 40,
            alerts: [],
        }));
        return mockReadings;
    }, []);
    const acknowledgeAlert = useCallback(async (alertId) => {
        setAlerts((prev) => prev.map((alert) => alert.id === alertId ? { ...alert, acknowledged: true } : alert));
    }, []);
    const resolveAlert = useCallback(async (alertId) => {
        setAlerts((prev) => prev.map((alert) => alert.id === alertId ? { ...alert, resolvedAt: new Date() } : alert));
    }, []);
    const getDeviceAnalytics = useCallback(async (deviceId, timeRange) => {
        // Mock analytics data
        return {
            deviceId,
            timeRange,
            uptime: 98.5,
            dataPoints: 2880,
            alertsGenerated: 12,
            trends: [
                {
                    metric: "heartRate",
                    trend: "stable",
                    confidence: 0.85,
                    slope: 0.02,
                    correlation: 0.12,
                },
            ],
            anomalies: [
                {
                    id: "anomaly-001",
                    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                    metric: "heartRate",
                    value: 115,
                    expectedValue: 75,
                    deviation: 2.5,
                    severity: "high",
                    description: "Heart rate significantly elevated",
                },
            ],
            predictions: [
                {
                    id: "prediction-001",
                    type: "health_deterioration",
                    probability: 0.25,
                    timeframe: "24-48 hours",
                    description: "Potential health decline based on vital signs trends",
                    recommendedActions: [
                        "Increase monitoring frequency",
                        "Schedule physician consultation",
                    ],
                    patientId: "patient-001",
                },
            ],
        };
    }, []);
    const subscribeToDevice = useCallback((deviceId) => {
        setSubscriptions((prev) => new Set([...prev, deviceId]));
        // In a real implementation, establish WebSocket or SSE connection
    }, []);
    const unsubscribeFromDevice = useCallback((deviceId) => {
        setSubscriptions((prev) => {
            const newSet = new Set(prev);
            newSet.delete(deviceId);
            return newSet;
        });
        // In a real implementation, close WebSocket or SSE connection
    }, []);
    return {
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
    };
}
