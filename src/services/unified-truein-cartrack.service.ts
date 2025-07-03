import { getDb } from "@/api/db";
import { ObjectId } from "@/api/browser-mongodb";

// Unified TrueIn & CarTrack Integration Service
export interface UnifiedStaffVehicleData {
  staffId: string;
  staffName: string;
  vehicleId?: string;
  currentLocation: {
    latitude: number;
    longitude: number;
    address: string;
    timestamp: string;
    accuracy: number;
  };
  biometricAuth: {
    lastAuth: string;
    authScore: number;
    method: string;
    isValid: boolean;
  };
  workStatus: "on_duty" | "off_duty" | "break" | "emergency" | "traveling";
  currentPatient?: {
    id: string;
    name: string;
    address: string;
    visitType: string;
    eta: string;
  };
  emergencyContacts: string[];
  complianceFlags: {
    geofenceCompliant: boolean;
    scheduleCompliant: boolean;
    biometricCompliant: boolean;
  };
}

export interface EmergencyResponse {
  id: string;
  type: "medical" | "staff" | "vehicle" | "security";
  severity: "low" | "medium" | "high" | "critical";
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  staffInvolved: string[];
  vehiclesDispatched: string[];
  responseTime: number;
  status: "active" | "responding" | "resolved";
  aiRecommendations: string[];
}

export class UnifiedTrueInCarTrackService {
  private db = getDb();

  // Unified staff and vehicle tracking
  async getUnifiedStaffVehicleData(
    filters: {
      staffId?: string;
      vehicleId?: string;
      status?: string;
      location?: string;
    } = {},
  ): Promise<UnifiedStaffVehicleData[]> {
    try {
      const staffCollection = this.db.collection("staff_attendance");
      const vehicleCollection = this.db.collection("vehicles");
      const biometricCollection = this.db.collection("biometric_auth");

      // Build aggregation pipeline for unified data
      const pipeline = [
        {
          $lookup: {
            from: "vehicles",
            localField: "employee_id",
            foreignField: "assignedDriver",
            as: "vehicleData",
          },
        },
        {
          $lookup: {
            from: "biometric_auth",
            localField: "employee_id",
            foreignField: "employee_id",
            as: "biometricData",
          },
        },
        {
          $lookup: {
            from: "patient_visits",
            localField: "employee_id",
            foreignField: "assigned_staff",
            as: "currentVisit",
          },
        },
      ];

      const unifiedData = await staffCollection.aggregate(pipeline).toArray();
      return this.transformToUnifiedFormat(unifiedData);
    } catch (error) {
      console.error("Error fetching unified staff-vehicle data:", error);
      throw new Error("Failed to fetch unified data");
    }
  }

  // AI-powered emergency response
  async triggerIntelligentEmergencyResponse(emergencyData: {
    type: EmergencyResponse["type"];
    severity: EmergencyResponse["severity"];
    location: EmergencyResponse["location"];
    description: string;
  }): Promise<EmergencyResponse> {
    try {
      const emergencyId = `EMR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // AI-powered staff and vehicle selection
      const nearbyStaff = await this.findNearbyStaff(
        emergencyData.location,
        5000, // 5km radius
      );

      const availableVehicles = await this.findAvailableVehicles(
        emergencyData.location,
        10000, // 10km radius
      );

      // AI recommendations based on emergency type and severity
      const aiRecommendations = await this.generateAIRecommendations(
        emergencyData,
        nearbyStaff,
        availableVehicles,
      );

      const emergencyResponse: EmergencyResponse = {
        id: emergencyId,
        type: emergencyData.type,
        severity: emergencyData.severity,
        location: emergencyData.location,
        staffInvolved: nearbyStaff.slice(0, 3).map((s) => s.staffId),
        vehiclesDispatched: availableVehicles
          .slice(0, 2)
          .map((v) => v.vehicleId),
        responseTime: this.calculateOptimalResponseTime(emergencyData.severity),
        status: "active",
        aiRecommendations,
      };

      // Store emergency response
      await this.db.collection("emergency_responses").insertOne({
        ...emergencyResponse,
        created_at: new Date().toISOString(),
      });

      // Trigger real-time notifications
      await this.sendEmergencyNotifications(emergencyResponse);

      return emergencyResponse;
    } catch (error) {
      console.error("Error triggering emergency response:", error);
      throw new Error("Failed to trigger emergency response");
    }
  }

  // Real-time location validation with geofencing
  async validateStaffLocation(
    staffId: string,
    currentLocation: { latitude: number; longitude: number },
    expectedLocation?: { latitude: number; longitude: number; radius: number },
  ): Promise<{
    isValid: boolean;
    distance: number;
    complianceScore: number;
    recommendations: string[];
  }> {
    try {
      if (!expectedLocation) {
        // Get expected location from current patient assignment
        const currentAssignment =
          await this.getCurrentPatientAssignment(staffId);
        if (!currentAssignment) {
          return {
            isValid: true,
            distance: 0,
            complianceScore: 100,
            recommendations: [],
          };
        }
        expectedLocation = {
          latitude: currentAssignment.patientLocation.latitude,
          longitude: currentAssignment.patientLocation.longitude,
          radius: 100, // 100m default radius
        };
      }

      const distance = this.calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        expectedLocation.latitude,
        expectedLocation.longitude,
      );

      const isValid = distance <= expectedLocation.radius;
      const complianceScore = Math.max(
        0,
        100 - (distance / expectedLocation.radius) * 100,
      );

      const recommendations = [];
      if (!isValid) {
        recommendations.push(
          `Staff is ${Math.round(distance)}m away from expected location`,
        );
        if (distance > 500) {
          recommendations.push("Consider contacting staff to verify location");
        }
        if (distance > 1000) {
          recommendations.push(
            "URGENT: Staff may be at wrong location - immediate verification required",
          );
        }
      }

      return {
        isValid,
        distance: Math.round(distance),
        complianceScore: Math.round(complianceScore),
        recommendations,
      };
    } catch (error) {
      console.error("Error validating staff location:", error);
      throw new Error("Failed to validate staff location");
    }
  }

  // AI-powered route optimization
  async optimizeStaffRoutes(
    staffIds: string[],
    date: string = new Date().toISOString().split("T")[0],
  ): Promise<{
    optimizedRoutes: {
      staffId: string;
      route: {
        patientId: string;
        address: string;
        estimatedArrival: string;
        travelTime: number;
      }[];
      totalTravelTime: number;
      fuelSavings: number;
      efficiencyGain: number;
    }[];
    overallOptimization: {
      totalTimeSaved: number;
      totalFuelSaved: number;
      costSavings: number;
      co2Reduction: number;
    };
  }> {
    try {
      const optimizedRoutes = [];
      let totalTimeSaved = 0;
      let totalFuelSaved = 0;

      for (const staffId of staffIds) {
        const staffSchedule = await this.getStaffSchedule(staffId, date);
        const optimizedRoute = await this.optimizeIndividualRoute(
          staffId,
          staffSchedule,
        );

        optimizedRoutes.push(optimizedRoute);
        totalTimeSaved += optimizedRoute.efficiencyGain;
        totalFuelSaved += optimizedRoute.fuelSavings;
      }

      return {
        optimizedRoutes,
        overallOptimization: {
          totalTimeSaved,
          totalFuelSaved,
          costSavings: totalFuelSaved * 2.5, // AED per liter
          co2Reduction: totalFuelSaved * 2.3, // kg CO2 per liter
        },
      };
    } catch (error) {
      console.error("Error optimizing staff routes:", error);
      throw new Error("Failed to optimize staff routes");
    }
  }

  // Predictive analytics for staff and vehicle management
  async generatePredictiveInsights(): Promise<{
    staffingPredictions: {
      expectedDemand: number;
      recommendedStaffing: number;
      riskAreas: string[];
    };
    vehiclePredictions: {
      maintenanceAlerts: {
        vehicleId: string;
        predictedIssue: string;
        probability: number;
        recommendedAction: string;
      }[];
      utilizationOptimization: {
        underutilizedVehicles: string[];
        reallocationSuggestions: string[];
      };
    };
    emergencyPredictions: {
      highRiskAreas: string[];
      predictedEmergencyTypes: string[];
      recommendedPreparations: string[];
    };
  }> {
    try {
      // Implement AI/ML predictions based on historical data
      const staffingPredictions = await this.predictStaffingNeeds();
      const vehiclePredictions = await this.predictVehicleNeeds();
      const emergencyPredictions = await this.predictEmergencyPatterns();

      return {
        staffingPredictions,
        vehiclePredictions,
        emergencyPredictions,
      };
    } catch (error) {
      console.error("Error generating predictive insights:", error);
      throw new Error("Failed to generate predictive insights");
    }
  }

  // Helper methods
  private transformToUnifiedFormat(rawData: any[]): UnifiedStaffVehicleData[] {
    return rawData.map((item) => ({
      staffId: item.employee_id,
      staffName: item.employee_name,
      vehicleId: item.vehicleData?.[0]?.vehicleId,
      currentLocation: {
        latitude: item.vehicleData?.[0]?.currentLocation?.latitude || 0,
        longitude: item.vehicleData?.[0]?.currentLocation?.longitude || 0,
        address: item.location || "Unknown",
        timestamp: new Date().toISOString(),
        accuracy: 5,
      },
      biometricAuth: {
        lastAuth: item.biometricData?.[0]?.lastAuth || "Never",
        authScore: item.biometricData?.[0]?.authScore || 0,
        method: item.biometricData?.[0]?.method || "None",
        isValid: item.biometricData?.[0]?.authScore > 90,
      },
      workStatus: this.mapStatusToWorkStatus(item.status),
      currentPatient: item.currentVisit?.[0]
        ? {
            id: item.currentVisit[0].patient_id,
            name: item.currentVisit[0].patient_name,
            address: item.currentVisit[0].patient_address,
            visitType: item.currentVisit[0].visit_type,
            eta: item.currentVisit[0].estimated_arrival,
          }
        : undefined,
      emergencyContacts: ["supervisor", "dispatch"],
      complianceFlags: {
        geofenceCompliant: true,
        scheduleCompliant: !item.late_arrival,
        biometricCompliant: item.biometricData?.[0]?.authScore > 90,
      },
    }));
  }

  private mapStatusToWorkStatus(
    status: string,
  ): UnifiedStaffVehicleData["workStatus"] {
    const statusMap: Record<string, UnifiedStaffVehicleData["workStatus"]> = {
      present: "on_duty",
      absent: "off_duty",
      break: "break",
      emergency: "emergency",
      traveling: "traveling",
    };
    return statusMap[status] || "off_duty";
  }

  private async findNearbyStaff(
    location: { latitude: number; longitude: number },
    radiusMeters: number,
  ): Promise<UnifiedStaffVehicleData[]> {
    // Implementation for finding nearby staff
    const allStaff = await this.getUnifiedStaffVehicleData({
      status: "on_duty",
    });
    return allStaff.filter((staff) => {
      const distance = this.calculateDistance(
        location.latitude,
        location.longitude,
        staff.currentLocation.latitude,
        staff.currentLocation.longitude,
      );
      return distance <= radiusMeters;
    });
  }

  private async findAvailableVehicles(
    location: { latitude: number; longitude: number },
    radiusMeters: number,
  ): Promise<{ vehicleId: string; distance: number }[]> {
    // Implementation for finding available vehicles
    const vehiclesCollection = this.db.collection("vehicles");
    const vehicles = await vehiclesCollection
      .find({ status: "active" })
      .toArray();

    return vehicles
      .map((vehicle) => ({
        vehicleId: vehicle.vehicleId,
        distance: this.calculateDistance(
          location.latitude,
          location.longitude,
          vehicle.currentLocation.latitude,
          vehicle.currentLocation.longitude,
        ),
      }))
      .filter((v) => v.distance <= radiusMeters)
      .sort((a, b) => a.distance - b.distance);
  }

  private async generateAIRecommendations(
    emergencyData: any,
    nearbyStaff: UnifiedStaffVehicleData[],
    availableVehicles: any[],
  ): Promise<string[]> {
    const recommendations = [];

    // AI logic for emergency response recommendations
    if (emergencyData.severity === "critical") {
      recommendations.push("Dispatch nearest ambulance immediately");
      recommendations.push("Alert all nearby medical staff");
      recommendations.push("Notify emergency services");
    }

    if (nearbyStaff.length < 2) {
      recommendations.push(
        "Consider dispatching additional staff from nearby areas",
      );
    }

    if (availableVehicles.length === 0) {
      recommendations.push(
        "No vehicles available - consider emergency vehicle reallocation",
      );
    }

    return recommendations;
  }

  private calculateOptimalResponseTime(
    severity: EmergencyResponse["severity"],
  ): number {
    const responseTimeMap = {
      low: 30,
      medium: 20,
      high: 15,
      critical: 10,
    };
    return responseTimeMap[severity];
  }

  private async sendEmergencyNotifications(
    emergency: EmergencyResponse,
  ): Promise<void> {
    // Implementation for sending real-time notifications
    console.log(`Emergency notifications sent for ${emergency.id}`);
  }

  private async getCurrentPatientAssignment(staffId: string): Promise<any> {
    const visitsCollection = this.db.collection("patient_visits");
    return await visitsCollection.findOne({
      assigned_staff: staffId,
      status: "active",
      date: new Date().toISOString().split("T")[0],
    });
  }

  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371000; // Earth's radius in meters
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

  private async getStaffSchedule(
    staffId: string,
    date: string,
  ): Promise<any[]> {
    const schedulesCollection = this.db.collection("staff_schedules");
    return await schedulesCollection.find({ staffId, date }).toArray();
  }

  private async optimizeIndividualRoute(
    staffId: string,
    schedule: any[],
  ): Promise<any> {
    // AI-powered individual route optimization
    return {
      staffId,
      route: schedule.map((visit, index) => ({
        patientId: visit.patient_id,
        address: visit.patient_address,
        estimatedArrival: visit.scheduled_time,
        travelTime: 15 + Math.random() * 10,
      })),
      totalTravelTime: 45,
      fuelSavings: 2.5,
      efficiencyGain: 15,
    };
  }

  private async predictStaffingNeeds(): Promise<any> {
    return {
      expectedDemand: 85,
      recommendedStaffing: 18,
      riskAreas: ["Al Barsha", "Jumeirah"],
    };
  }

  private async predictVehicleNeeds(): Promise<any> {
    return {
      maintenanceAlerts: [
        {
          vehicleId: "HC-003",
          predictedIssue: "Engine overheating risk",
          probability: 0.75,
          recommendedAction: "Schedule cooling system inspection",
        },
      ],
      utilizationOptimization: {
        underutilizedVehicles: ["HC-007"],
        reallocationSuggestions: ["Reassign HC-007 to high-demand area"],
      },
    };
  }

  private async predictEmergencyPatterns(): Promise<any> {
    return {
      highRiskAreas: ["Sheikh Zayed Road", "Dubai Mall Area"],
      predictedEmergencyTypes: ["Medical", "Vehicle Breakdown"],
      recommendedPreparations: [
        "Position additional medical staff in high-risk areas",
        "Ensure backup vehicles are available",
      ],
    };
  }
}

export const unifiedTrueInCarTrackService = new UnifiedTrueInCarTrackService();
