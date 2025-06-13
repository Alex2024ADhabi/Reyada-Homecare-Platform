// IoT Device Integration Types

export interface IoTDevice {
  id: string;
  name: string;
  type: DeviceType;
  status: DeviceStatus;
  location: string;
  lastSeen: Date;
  batteryLevel?: number;
  firmwareVersion: string;
  serialNumber: string;
  patientId?: string;
  configuration: DeviceConfiguration;
}

export type DeviceType =
  | "vital_signs_monitor"
  | "medication_dispenser"
  | "fall_detection"
  | "environmental_sensor"
  | "glucose_monitor"
  | "blood_pressure_monitor"
  | "pulse_oximeter"
  | "weight_scale"
  | "temperature_sensor"
  | "air_quality_sensor";

export type DeviceStatus =
  | "online"
  | "offline"
  | "maintenance"
  | "error"
  | "low_battery"
  | "calibrating";

export interface DeviceConfiguration {
  measurementInterval: number; // minutes
  alertThresholds: AlertThresholds;
  dataRetention: number; // days
  autoCalibration: boolean;
  emergencyContacts: string[];
}

export interface AlertThresholds {
  [key: string]: {
    min?: number;
    max?: number;
    critical?: boolean;
  };
}

// Device Reading Types
export interface VitalSignsReading {
  id: string;
  deviceId: string;
  patientId: string;
  timestamp: Date;
  heartRate: number;
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
  oxygenSaturation: number;
  temperature: number;
  respiratoryRate: number;
  alerts: DeviceAlert[];
}

export interface MedicationDispenserReading {
  id: string;
  deviceId: string;
  patientId: string;
  timestamp: Date;
  medicationId: string;
  medicationName: string;
  dosage: string;
  dispensed: boolean;
  scheduledTime: Date;
  actualTime?: Date;
  missed: boolean;
  alerts: DeviceAlert[];
}

export interface FallDetectionReading {
  id: string;
  deviceId: string;
  patientId: string;
  timestamp: Date;
  fallDetected: boolean;
  confidence: number;
  location: {
    x: number;
    y: number;
    z: number;
  };
  acceleration: {
    x: number;
    y: number;
    z: number;
  };
  emergencyTriggered: boolean;
  alerts: DeviceAlert[];
}

export interface EnvironmentalReading {
  id: string;
  deviceId: string;
  location: string;
  timestamp: Date;
  temperature: number;
  humidity: number;
  airQuality: {
    pm25: number;
    pm10: number;
    co2: number;
    voc: number;
  };
  lightLevel: number;
  noiseLevel: number;
  alerts: DeviceAlert[];
}

export interface DeviceAlert {
  id: string;
  deviceId: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  resolvedAt?: Date;
  actionRequired: boolean;
}

export type AlertType =
  | "vital_signs_abnormal"
  | "medication_missed"
  | "fall_detected"
  | "device_offline"
  | "low_battery"
  | "environmental_hazard"
  | "calibration_required"
  | "maintenance_due";

export type AlertSeverity = "low" | "medium" | "high" | "critical";

// Analytics and Monitoring Types
export interface DeviceAnalytics {
  deviceId: string;
  timeRange: {
    start: Date;
    end: Date;
  };
  uptime: number;
  dataPoints: number;
  alertsGenerated: number;
  trends: TrendAnalysis[];
  anomalies: AnomalyDetection[];
  predictions: PredictiveAlert[];
}

export interface TrendAnalysis {
  metric: string;
  trend: "increasing" | "decreasing" | "stable";
  confidence: number;
  slope: number;
  correlation: number;
}

export interface AnomalyDetection {
  id: string;
  timestamp: Date;
  metric: string;
  value: number;
  expectedValue: number;
  deviation: number;
  severity: AlertSeverity;
  description: string;
}

export interface PredictiveAlert {
  id: string;
  type: string;
  probability: number;
  timeframe: string;
  description: string;
  recommendedActions: string[];
  patientId?: string;
}

// Device Management Types
export interface DeviceManagementAction {
  id: string;
  deviceId: string;
  action: DeviceAction;
  parameters?: Record<string, any>;
  scheduledAt?: Date;
  executedAt?: Date;
  status: "pending" | "executing" | "completed" | "failed";
  result?: string;
}

export type DeviceAction =
  | "restart"
  | "calibrate"
  | "update_firmware"
  | "change_configuration"
  | "run_diagnostics"
  | "reset_alerts"
  | "sync_data";

// Data Pipeline Types
export interface DataPipeline {
  id: string;
  name: string;
  deviceTypes: DeviceType[];
  processors: DataProcessor[];
  destinations: DataDestination[];
  status: "active" | "paused" | "error";
  throughput: number;
  lastProcessed: Date;
}

export interface DataProcessor {
  id: string;
  type: "filter" | "transform" | "validate" | "aggregate";
  configuration: Record<string, any>;
  order: number;
}

export interface DataDestination {
  id: string;
  type: "database" | "api" | "file" | "stream";
  configuration: Record<string, any>;
  enabled: boolean;
}
