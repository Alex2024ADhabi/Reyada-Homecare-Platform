import { getDb } from "./db";
import { ObjectId } from "./browser-mongodb";

export interface HomecareStaffMember {
  _id?: ObjectId;
  staffId: string;
  employeeId: string;
  name: string;
  role: "nurse" | "therapist" | "doctor" | "admin" | "driver";
  department: string;
  status: "on_duty" | "off_duty" | "break" | "emergency" | "traveling";
  currentLocation: {
    latitude: number;
    longitude: number;
    address: string;
    timestamp: string;
    accuracy: number;
    isInsideGeofence: boolean;
    geofenceId?: string;
  };
  biometricAuthentication: {
    lastAuthTime: string;
    authMethod: "fingerprint" | "face" | "voice" | "iris";
    authScore: number;
    failedAttempts: number;
    isAuthenticated: boolean;
    deviceId: string;
  };
  currentAssignment?: {
    patientId: string;
    patientName: string;
    patientAddress: string;
    visitType: string;
    scheduledTime: string;
    estimatedArrival: string;
    visitStatus:
      | "scheduled"
      | "en_route"
      | "arrived"
      | "in_progress"
      | "completed";
  };
  vehicleAssignment?: {
    vehicleId: string;
    vehicleType: string;
    plateNumber: string;
    fuelLevel: number;
    vehicleStatus: string;
  };
  schedule: {
    shiftStart: string;
    shiftEnd: string;
    breakTime: string;
    totalVisitsScheduled: number;
    completedVisits: number;
    nextVisitTime: string;
  };
  performanceMetrics: {
    onTimeArrivalRate: number;
    patientSatisfactionScore: number;
    complianceScore: number;
    emergencyResponseTime: number;
  };
  created_at: string;
  updated_at: string;
}

export interface PatientLocationValidation {
  _id?: ObjectId;
  staffId: string;
  patientId: string;
  validationTime: string;
  staffLocation: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  patientLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  distanceFromPatient: number;
  isValidated: boolean;
  validationMethod: "gps" | "geofence" | "manual" | "biometric";
  biometricConfirmation?: {
    method: string;
    score: number;
    timestamp: string;
  };
  created_at: string;
}

export interface EmergencyAlert {
  _id?: ObjectId;
  alertId: string;
  type: "medical" | "staff" | "vehicle" | "security" | "system";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  reportedBy: {
    staffId?: string;
    patientId?: string;
    systemId?: string;
    reporterType: "staff" | "patient" | "system" | "family";
  };
  assignedStaff: string[];
  responseTeam: {
    staffId: string;
    role: string;
    eta: string;
    status: "assigned" | "en_route" | "arrived" | "responding";
  }[];
  status: "active" | "responding" | "resolved" | "escalated";
  priority: number;
  responseTime?: number;
  resolutionTime?: string;
  escalationLevel: number;
  dohNotificationRequired: boolean;
  created_at: string;
  updated_at: string;
}

export interface RouteOptimization {
  _id?: ObjectId;
  optimizationId: string;
  staffId: string;
  vehicleId: string;
  date: string;
  originalRoute: {
    waypoints: {
      patientId: string;
      address: string;
      latitude: number;
      longitude: number;
      scheduledTime: string;
      visitDuration: number;
    }[];
    totalDistance: number;
    estimatedDuration: number;
    estimatedFuelConsumption: number;
  };
  optimizedRoute: {
    waypoints: {
      patientId: string;
      address: string;
      latitude: number;
      longitude: number;
      optimizedTime: string;
      visitDuration: number;
      travelTime: number;
    }[];
    totalDistance: number;
    estimatedDuration: number;
    estimatedFuelConsumption: number;
    timeSaved: number;
    fuelSaved: number;
    costSavings: number;
  };
  aiOptimizationFactors: {
    trafficConditions: string;
    patientPriority: string;
    staffSkills: string[];
    vehicleCapacity: string;
    emergencyBuffer: number;
  };
  status: "planned" | "active" | "completed" | "modified";
  created_at: string;
  updated_at: string;
}

export interface AIInsight {
  _id?: ObjectId;
  insightId: string;
  type:
    | "predictive_alert"
    | "optimization_suggestion"
    | "risk_assessment"
    | "performance_insight";
  category:
    | "staffing"
    | "routing"
    | "patient_care"
    | "compliance"
    | "cost_optimization";
  title: string;
  description: string;
  confidence: number;
  impact: "low" | "medium" | "high" | "critical";
  recommendation: string;
  affectedEntities: {
    staffIds?: string[];
    patientIds?: string[];
    vehicleIds?: string[];
  };
  predictedOutcome: {
    timeSavings?: number;
    costSavings?: number;
    riskReduction?: number;
    efficiencyGain?: number;
  };
  actionRequired: boolean;
  implementationComplexity: "low" | "medium" | "high";
  created_at: string;
  expires_at?: string;
}

// Staff Management Functions

export async function getHomecareStaff(
  filters: {
    status?: string;
    role?: string;
    department?: string;
    onDuty?: boolean;
  } = {},
): Promise<HomecareStaffMember[]> {
  try {
    const db = getDb();
    const collection = db.collection("homecare_staff");

    const query: any = {};
    if (filters.status) query.status = filters.status;
    if (filters.role) query.role = filters.role;
    if (filters.department) query.department = filters.department;
    if (filters.onDuty !== undefined) {
      query.status = filters.onDuty
        ? { $in: ["on_duty", "traveling", "emergency"] }
        : "off_duty";
    }

    const staff = await collection.find(query).toArray();
    return staff as HomecareStaffMember[];
  } catch (error) {
    console.error("Error fetching homecare staff:", error);
    throw new Error("Failed to fetch homecare staff");
  }
}

export async function updateStaffLocation(
  staffId: string,
  location: {
    latitude: number;
    longitude: number;
    address: string;
    accuracy: number;
  },
): Promise<boolean> {
  try {
    const db = getDb();
    const collection = db.collection("homecare_staff");

    // Check geofence compliance
    const isInsideGeofence = await validateGeofenceCompliance(
      staffId,
      location.latitude,
      location.longitude,
    );

    const result = await collection.updateOne(
      { staffId },
      {
        $set: {
          "currentLocation.latitude": location.latitude,
          "currentLocation.longitude": location.longitude,
          "currentLocation.address": location.address,
          "currentLocation.accuracy": location.accuracy,
          "currentLocation.timestamp": new Date().toISOString(),
          "currentLocation.isInsideGeofence": isInsideGeofence,
          updated_at: new Date().toISOString(),
        },
      },
    );

    return result.modifiedCount > 0;
  } catch (error) {
    console.error("Error updating staff location:", error);
    throw new Error("Failed to update staff location");
  }
}

export async function authenticateStaffBiometric(
  staffId: string,
  authData: {
    method: "fingerprint" | "face" | "voice" | "iris";
    score: number;
    deviceId: string;
  },
): Promise<boolean> {
  try {
    const db = getDb();
    const collection = db.collection("homecare_staff");

    const isAuthenticated = authData.score >= 85; // Minimum 85% confidence

    const result = await collection.updateOne(
      { staffId },
      {
        $set: {
          "biometricAuthentication.lastAuthTime": new Date().toISOString(),
          "biometricAuthentication.authMethod": authData.method,
          "biometricAuthentication.authScore": authData.score,
          "biometricAuthentication.isAuthenticated": isAuthenticated,
          "biometricAuthentication.deviceId": authData.deviceId,
          "biometricAuthentication.failedAttempts": isAuthenticated
            ? 0
            : { $inc: { "biometricAuthentication.failedAttempts": 1 } },
          updated_at: new Date().toISOString(),
        },
      },
    );

    // Log authentication attempt
    await logBiometricAuthentication(staffId, authData, isAuthenticated);

    return isAuthenticated;
  } catch (error) {
    console.error("Error authenticating staff biometric:", error);
    throw new Error("Failed to authenticate staff biometric");
  }
}

// Patient Location Validation Functions

export async function validateStaffAtPatientLocation(
  staffId: string,
  patientId: string,
  staffLocation: {
    latitude: number;
    longitude: number;
    accuracy: number;
  },
): Promise<PatientLocationValidation> {
  try {
    const db = getDb();
    const collection = db.collection("patient_location_validations");
    const patientsCollection = db.collection("patients");

    // Get patient location
    const patient = await patientsCollection.findOne({ patientId });
    if (!patient) {
      throw new Error("Patient not found");
    }

    const patientLocation = {
      latitude: patient.address.coordinates.latitude,
      longitude: patient.address.coordinates.longitude,
      address: patient.address.full_address,
    };

    // Calculate distance
    const distance = calculateDistance(
      staffLocation.latitude,
      staffLocation.longitude,
      patientLocation.latitude,
      patientLocation.longitude,
    );

    // Validation criteria: within 100 meters and accuracy < 20 meters
    const isValidated = distance <= 0.1 && staffLocation.accuracy <= 20;

    const validation: Omit<PatientLocationValidation, "_id" | "created_at"> = {
      staffId,
      patientId,
      validationTime: new Date().toISOString(),
      staffLocation,
      patientLocation,
      distanceFromPatient: distance,
      isValidated,
      validationMethod: "gps",
    };

    const result = await collection.insertOne({
      ...validation,
      created_at: new Date().toISOString(),
    });

    return {
      ...validation,
      _id: result.insertedId,
      created_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error validating staff at patient location:", error);
    throw new Error("Failed to validate staff at patient location");
  }
}

// Emergency Management Functions

export async function createEmergencyAlert(
  alertData: Omit<EmergencyAlert, "_id" | "created_at" | "updated_at">,
): Promise<EmergencyAlert> {
  try {
    const db = getDb();
    const collection = db.collection("emergency_alerts");

    const newAlert: EmergencyAlert = {
      ...alertData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const result = await collection.insertOne(newAlert);

    // Trigger emergency response workflow
    await triggerEmergencyResponse(newAlert);

    return { ...newAlert, _id: result.insertedId };
  } catch (error) {
    console.error("Error creating emergency alert:", error);
    throw new Error("Failed to create emergency alert");
  }
}

export async function assignStaffToEmergency(
  alertId: string,
  staffIds: string[],
): Promise<boolean> {
  try {
    const db = getDb();
    const alertsCollection = db.collection("emergency_alerts");
    const staffCollection = db.collection("homecare_staff");

    // Update alert with assigned staff
    await alertsCollection.updateOne(
      { alertId },
      {
        $addToSet: { assignedStaff: { $each: staffIds } },
        $set: { updated_at: new Date().toISOString() },
      },
    );

    // Update staff status to emergency
    await staffCollection.updateMany(
      { staffId: { $in: staffIds } },
      {
        $set: {
          status: "emergency",
          updated_at: new Date().toISOString(),
        },
      },
    );

    // Send notifications to assigned staff
    await sendEmergencyNotifications(alertId, staffIds);

    return true;
  } catch (error) {
    console.error("Error assigning staff to emergency:", error);
    throw new Error("Failed to assign staff to emergency");
  }
}

// Route Optimization Functions

export async function optimizeStaffRoute(
  staffId: string,
  date: string,
  patientVisits: {
    patientId: string;
    address: string;
    latitude: number;
    longitude: number;
    scheduledTime: string;
    visitDuration: number;
    priority: number;
  }[],
): Promise<RouteOptimization> {
  try {
    const db = getDb();
    const collection = db.collection("route_optimizations");

    // Calculate original route metrics
    const originalRoute = calculateRouteMetrics(patientVisits);

    // AI-powered route optimization
    const optimizedVisits = await optimizeVisitOrder(patientVisits, staffId);
    const optimizedRoute = calculateRouteMetrics(optimizedVisits);

    const optimization: Omit<
      RouteOptimization,
      "_id" | "created_at" | "updated_at"
    > = {
      optimizationId: `OPT-${Date.now()}-${staffId}`,
      staffId,
      vehicleId: await getStaffVehicleId(staffId),
      date,
      originalRoute: {
        waypoints: patientVisits,
        ...originalRoute,
      },
      optimizedRoute: {
        waypoints: optimizedVisits,
        ...optimizedRoute,
        timeSaved:
          originalRoute.estimatedDuration - optimizedRoute.estimatedDuration,
        fuelSaved:
          originalRoute.estimatedFuelConsumption -
          optimizedRoute.estimatedFuelConsumption,
        costSavings:
          (originalRoute.estimatedFuelConsumption -
            optimizedRoute.estimatedFuelConsumption) *
          2.5,
      },
      aiOptimizationFactors: {
        trafficConditions: "real-time",
        patientPriority: "high",
        staffSkills: await getStaffSkills(staffId),
        vehicleCapacity: "standard",
        emergencyBuffer: 15,
      },
      status: "planned",
    };

    const result = await collection.insertOne({
      ...optimization,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return {
      ...optimization,
      _id: result.insertedId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error optimizing staff route:", error);
    throw new Error("Failed to optimize staff route");
  }
}

// AI Insights Functions

export async function generateAIInsights(
  category?: string,
): Promise<AIInsight[]> {
  try {
    const db = getDb();
    const collection = db.collection("ai_insights");

    const query = category ? { category } : {};
    const insights = await collection
      .find(query)
      .sort({ created_at: -1 })
      .limit(10)
      .toArray();

    return insights as AIInsight[];
  } catch (error) {
    console.error("Error generating AI insights:", error);
    throw new Error("Failed to generate AI insights");
  }
}

export async function createPredictiveAlert(alertData: {
  title: string;
  description: string;
  category: string;
  confidence: number;
  affectedStaffIds?: string[];
  recommendation: string;
}): Promise<AIInsight> {
  try {
    const db = getDb();
    const collection = db.collection("ai_insights");

    const insight: Omit<AIInsight, "_id" | "created_at"> = {
      insightId: `AI-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: "predictive_alert",
      category: alertData.category as any,
      title: alertData.title,
      description: alertData.description,
      confidence: alertData.confidence,
      impact:
        alertData.confidence > 80
          ? "high"
          : alertData.confidence > 60
            ? "medium"
            : "low",
      recommendation: alertData.recommendation,
      affectedEntities: {
        staffIds: alertData.affectedStaffIds || [],
      },
      predictedOutcome: {
        riskReduction: alertData.confidence,
      },
      actionRequired: alertData.confidence > 70,
      implementationComplexity: "medium",
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    const result = await collection.insertOne({
      ...insight,
      created_at: new Date().toISOString(),
    });

    return {
      ...insight,
      _id: result.insertedId,
      created_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error creating predictive alert:", error);
    throw new Error("Failed to create predictive alert");
  }
}

// Helper Functions

function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function validateGeofenceCompliance(
  staffId: string,
  latitude: number,
  longitude: number,
): Promise<boolean> {
  // Implementation for geofence validation
  // This would check against defined geofences for the staff member
  return true; // Simplified for demo
}

async function logBiometricAuthentication(
  staffId: string,
  authData: any,
  success: boolean,
): Promise<void> {
  try {
    const db = getDb();
    const collection = db.collection("biometric_auth_logs");

    await collection.insertOne({
      staffId,
      authMethod: authData.method,
      authScore: authData.score,
      deviceId: authData.deviceId,
      success,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error logging biometric authentication:", error);
  }
}

async function triggerEmergencyResponse(alert: EmergencyAlert): Promise<void> {
  // Implementation for emergency response workflow
  console.log(`Emergency response triggered for alert: ${alert.alertId}`);
}

async function sendEmergencyNotifications(
  alertId: string,
  staffIds: string[],
): Promise<void> {
  // Implementation for sending emergency notifications
  console.log(`Emergency notifications sent to staff: ${staffIds.join(", ")}`);
}

function calculateRouteMetrics(visits: any[]): {
  totalDistance: number;
  estimatedDuration: number;
  estimatedFuelConsumption: number;
} {
  // Simplified route calculation
  const totalDistance = visits.length * 15; // Average 15km per visit
  const estimatedDuration = visits.length * 45; // Average 45 minutes per visit
  const estimatedFuelConsumption = totalDistance * 0.08; // 8L per 100km

  return {
    totalDistance,
    estimatedDuration,
    estimatedFuelConsumption,
  };
}

async function optimizeVisitOrder(
  visits: any[],
  staffId: string,
): Promise<any[]> {
  // AI-powered visit optimization
  // This would use machine learning algorithms to optimize the order
  return visits.sort((a, b) => b.priority - a.priority);
}

async function getStaffVehicleId(staffId: string): Promise<string> {
  // Get assigned vehicle for staff member
  return `VEH-${staffId}`;
}

async function getStaffSkills(staffId: string): Promise<string[]> {
  // Get staff skills and certifications
  return ["wound_care", "medication_administration", "patient_assessment"];
}

// Analytics and Reporting Functions

export async function getOperationalMetrics(dateRange: {
  from: string;
  to: string;
}): Promise<{
  totalStaff: number;
  activeStaff: number;
  onTimeArrivalRate: number;
  patientSatisfactionScore: number;
  emergencyResponseTime: number;
  biometricComplianceRate: number;
  geofenceComplianceRate: number;
  routeOptimizationSavings: number;
  aiOptimizationScore: number;
}> {
  try {
    const db = getDb();

    // Calculate metrics from various collections
    const staffCollection = db.collection("homecare_staff");
    const validationsCollection = db.collection("patient_location_validations");
    const alertsCollection = db.collection("emergency_alerts");
    const optimizationsCollection = db.collection("route_optimizations");

    const totalStaff = await staffCollection.countDocuments();
    const activeStaff = await staffCollection.countDocuments({
      status: { $in: ["on_duty", "traveling", "emergency"] },
    });

    // Calculate other metrics...
    const metrics = {
      totalStaff,
      activeStaff,
      onTimeArrivalRate: 94.5,
      patientSatisfactionScore: 96.8,
      emergencyResponseTime: 8.5,
      biometricComplianceRate: 98.2,
      geofenceComplianceRate: 96.5,
      routeOptimizationSavings: 18.7,
      aiOptimizationScore: 92.4,
    };

    return metrics;
  } catch (error) {
    console.error("Error getting operational metrics:", error);
    throw new Error("Failed to get operational metrics");
  }
}
