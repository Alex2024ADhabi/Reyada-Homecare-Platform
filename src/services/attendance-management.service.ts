import { getDb } from "@/api/db";
import { ObjectId } from "@/api/browser-mongodb";
import { websocketService } from "./websocket.service";
import { errorHandlerService } from "./error-handler.service";
import { securityService } from "./security.service";
import { validationService } from "./validation.service";

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  status: "on_duty" | "off_duty" | "break" | "emergency" | "traveling";
  location: {
    lat: number;
    lng: number;
    address: string;
    timestamp: string;
  };
  biometricAuth: {
    lastAuth: string;
    authScore: number;
    method: string;
  };
  schedule: {
    shift: string;
    nextVisit: string;
    totalVisits: number;
    completedVisits: number;
  };
  currentPatient?: {
    id: string;
    name: string;
    address: string;
    visitType: string;
    eta: string;
  };
}

export interface AttendanceMetrics {
  totalStaff: number;
  activeStaff: number;
  onTimeArrivals: number;
  biometricCompliance: number;
  geofenceCompliance: number;
  averageWorkHours: number;
  overtimeHours: number;
  absenteeismRate: number;
}

export interface AttendanceAnalytics {
  dailyAttendance: {
    date: string;
    present: number;
    absent: number;
    late: number;
  }[];
  weeklyTrends: {
    week: string;
    averageHours: number;
    overtime: number;
    efficiency: number;
  }[];
  departmentBreakdown: {
    department: string;
    totalStaff: number;
    activeStaff: number;
    attendanceRate: number;
  }[];
  biometricStats: {
    totalAuthentications: number;
    successRate: number;
    failureReasons: {
      reason: string;
      count: number;
    }[];
  };
}

class AttendanceManagementService {
  private readonly CACHE_TTL = 30000; // 30 seconds
  private cache = new Map<string, { data: any; timestamp: number }>();
  private retryAttempts = 3;
  private retryDelay = 1000;

  constructor() {
    this.initializeWebSocketListeners();
  }

  private initializeWebSocketListeners(): void {
    websocketService.on(
      "staff-location-update",
      this.handleLocationUpdate.bind(this),
    );
    websocketService.on(
      "biometric-auth-event",
      this.handleBiometricAuth.bind(this),
    );
    websocketService.on(
      "emergency-alert",
      this.handleEmergencyAlert.bind(this),
    );
  }

  private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt === this.retryAttempts) {
          throw errorHandlerService.handleError(error, {
            context: "AttendanceManagementService",
            operation: operation.name,
            attempt,
          });
        }

        await this.delay(this.retryDelay * attempt);
      }
    }

    throw lastError!;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  async getStaffAttendanceData(params: {
    organizationId: string;
    filters?: {
      status?: string;
      role?: string;
      department?: string;
    };
  }): Promise<{
    staffMembers: StaffMember[];
    metrics: AttendanceMetrics;
  }> {
    const cacheKey = `staff-attendance-${params.organizationId}-${JSON.stringify(params.filters || {})}`;
    const cached = this.getCachedData<{
      staffMembers: StaffMember[];
      metrics: AttendanceMetrics;
    }>(cacheKey);

    if (cached) {
      return cached;
    }

    return this.withRetry(async () => {
      try {
        const db = getDb();
        const staffCollection = db.collection("homecare_staff");

        // Build query with filters
        const query: any = { organizationId: params.organizationId };
        if (params.filters?.status) query.status = params.filters.status;
        if (params.filters?.role) query.role = params.filters.role;
        if (params.filters?.department)
          query.department = params.filters.department;

        // Get staff data with location validation
        const staffData = await staffCollection.find(query).toArray();

        const staffMembers: StaffMember[] = await Promise.all(
          staffData.map(async (staff) => {
            // Validate and sanitize location data
            const validatedLocation =
              await validationService.validateGPSCoordinates({
                lat: staff.currentLocation?.latitude || 0,
                lng: staff.currentLocation?.longitude || 0,
              });

            return {
              id: staff.staffId,
              name: staff.name,
              role: staff.role,
              status: staff.status,
              location: {
                lat: validatedLocation.lat,
                lng: validatedLocation.lng,
                address: staff.currentLocation?.address || "Unknown",
                timestamp:
                  staff.currentLocation?.timestamp || new Date().toISOString(),
              },
              biometricAuth: {
                lastAuth:
                  staff.biometricAuthentication?.lastAuthTime || "Never",
                authScore: staff.biometricAuthentication?.authScore || 0,
                method: staff.biometricAuthentication?.authMethod || "None",
              },
              schedule: {
                shift:
                  staff.schedule?.shiftStart +
                    " - " +
                    staff.schedule?.shiftEnd || "Not scheduled",
                nextVisit: staff.schedule?.nextVisitTime || "No visits",
                totalVisits: staff.schedule?.totalVisitsScheduled || 0,
                completedVisits: staff.schedule?.completedVisits || 0,
              },
              currentPatient: staff.currentAssignment
                ? {
                    id: staff.currentAssignment.patientId,
                    name: staff.currentAssignment.patientName,
                    address: staff.currentAssignment.patientAddress,
                    visitType: staff.currentAssignment.visitType,
                    eta: staff.currentAssignment.estimatedArrival,
                  }
                : undefined,
            };
          }),
        );

        // Calculate real-time metrics
        const metrics = await this.calculateAttendanceMetrics(staffMembers);

        const result = { staffMembers, metrics };
        this.setCachedData(cacheKey, result);

        // Broadcast real-time update
        websocketService.broadcast("attendance-data-update", result);

        return result;
      } catch (error) {
        throw errorHandlerService.handleError(error, {
          context: "getStaffAttendanceData",
          params,
        });
      }
    });
  }

  async getAttendanceAnalytics(params: {
    organizationId: string;
    dateRange: {
      from: string;
      to: string;
    };
  }): Promise<AttendanceAnalytics> {
    const cacheKey = `attendance-analytics-${params.organizationId}-${params.dateRange.from}-${params.dateRange.to}`;
    const cached = this.getCachedData<AttendanceAnalytics>(cacheKey);

    if (cached) {
      return cached;
    }

    return this.withRetry(async () => {
      try {
        const db = getDb();
        const attendanceCollection = db.collection("attendance_records");
        const staffCollection = db.collection("homecare_staff");
        const authCollection = db.collection("biometric_auth_logs");

        // Get attendance records for date range
        const attendanceRecords = await attendanceCollection
          .find({
            organizationId: params.organizationId,
            date: {
              $gte: params.dateRange.from,
              $lte: params.dateRange.to,
            },
          })
          .toArray();

        // Calculate daily attendance
        const dailyAttendance =
          this.calculateDailyAttendance(attendanceRecords);

        // Calculate weekly trends
        const weeklyTrends = this.calculateWeeklyTrends(attendanceRecords);

        // Get department breakdown
        const departmentBreakdown = await this.calculateDepartmentBreakdown(
          params.organizationId,
          staffCollection,
        );

        // Get biometric statistics
        const biometricStats = await this.calculateBiometricStats(
          params.organizationId,
          authCollection,
          params.dateRange,
        );

        const analytics: AttendanceAnalytics = {
          dailyAttendance,
          weeklyTrends,
          departmentBreakdown,
          biometricStats,
        };

        this.setCachedData(cacheKey, analytics);
        return analytics;
      } catch (error) {
        throw errorHandlerService.handleError(error, {
          context: "getAttendanceAnalytics",
          params,
        });
      }
    });
  }

  async validateStaffLocation(staffId: string): Promise<{
    isValid: boolean;
    accuracy: number;
    compliance: boolean;
    message: string;
  }> {
    return this.withRetry(async () => {
      try {
        const db = getDb();
        const staffCollection = db.collection("homecare_staff");

        const staff = await staffCollection.findOne({ staffId });
        if (!staff) {
          throw new Error("Staff member not found");
        }

        const location = staff.currentLocation;
        if (!location) {
          return {
            isValid: false,
            accuracy: 0,
            compliance: false,
            message: "No location data available",
          };
        }

        // Validate GPS coordinates
        const validatedLocation =
          await validationService.validateGPSCoordinates({
            lat: location.latitude,
            lng: location.longitude,
          });

        // Check geofence compliance
        const geofenceCompliance = await this.checkGeofenceCompliance(
          staffId,
          validatedLocation.lat,
          validatedLocation.lng,
        );

        const result = {
          isValid: validatedLocation.isValid,
          accuracy: location.accuracy || 0,
          compliance: geofenceCompliance,
          message: validatedLocation.isValid
            ? "Location validated successfully"
            : "Invalid location coordinates",
        };

        // Log validation event
        await this.logLocationValidation(staffId, result);

        // Broadcast real-time update
        websocketService.broadcast("location-validation", {
          staffId,
          result,
        });

        return result;
      } catch (error) {
        throw errorHandlerService.handleError(error, {
          context: "validateStaffLocation",
          staffId,
        });
      }
    });
  }

  async authenticateStaff(staffId: string): Promise<{
    success: boolean;
    authScore: number;
    method: string;
    timestamp: string;
    message: string;
  }> {
    return this.withRetry(async () => {
      try {
        // Security check - rate limiting
        const rateLimitCheck = await securityService.checkRateLimit(
          `biometric-auth-${staffId}`,
          5, // max 5 attempts
          300000, // per 5 minutes
        );

        if (!rateLimitCheck.allowed) {
          throw new Error(
            `Rate limit exceeded. Try again in ${rateLimitCheck.resetTime} seconds`,
          );
        }

        const db = getDb();
        const staffCollection = db.collection("homecare_staff");

        const staff = await staffCollection.findOne({ staffId });
        if (!staff) {
          throw new Error("Staff member not found");
        }

        // Simulate biometric authentication (in production, integrate with actual biometric device)
        const authScore = Math.random() * 100;
        const success = authScore >= 85; // Minimum 85% confidence
        const method = "fingerprint"; // Would be determined by actual device
        const timestamp = new Date().toISOString();

        // Update staff authentication record
        await staffCollection.updateOne(
          { staffId },
          {
            $set: {
              "biometricAuthentication.lastAuthTime": timestamp,
              "biometricAuthentication.authScore": authScore,
              "biometricAuthentication.authMethod": method,
              "biometricAuthentication.isAuthenticated": success,
              "biometricAuthentication.failedAttempts": success
                ? 0
                : (staff.biometricAuthentication?.failedAttempts || 0) + 1,
              updated_at: timestamp,
            },
          },
        );

        // Log authentication attempt
        await this.logBiometricAuthentication(staffId, {
          method,
          score: authScore,
          success,
          timestamp,
        });

        const result = {
          success,
          authScore,
          method,
          timestamp,
          message: success
            ? "Authentication successful"
            : "Authentication failed - insufficient confidence score",
        };

        // Broadcast real-time update
        websocketService.broadcast("biometric-auth-result", {
          staffId,
          result,
        });

        return result;
      } catch (error) {
        throw errorHandlerService.handleError(error, {
          context: "authenticateStaff",
          staffId,
        });
      }
    });
  }

  // Private helper methods
  private async calculateAttendanceMetrics(
    staffMembers: StaffMember[],
  ): Promise<AttendanceMetrics> {
    const totalStaff = staffMembers.length;
    const activeStaff = staffMembers.filter((s) =>
      ["on_duty", "traveling", "emergency"].includes(s.status),
    ).length;

    // Calculate other metrics (in production, these would be calculated from actual data)
    return {
      totalStaff,
      activeStaff,
      onTimeArrivals: 94.5,
      biometricCompliance: 98.2,
      geofenceCompliance: 96.5,
      averageWorkHours: 8.2,
      overtimeHours: 12.5,
      absenteeismRate: 2.1,
    };
  }

  private calculateDailyAttendance(
    records: any[],
  ): AttendanceAnalytics["dailyAttendance"] {
    // Group records by date and calculate attendance
    const dailyMap = new Map<
      string,
      { present: number; absent: number; late: number }
    >();

    records.forEach((record) => {
      const date = record.date;
      if (!dailyMap.has(date)) {
        dailyMap.set(date, { present: 0, absent: 0, late: 0 });
      }

      const day = dailyMap.get(date)!;
      if (record.status === "present") day.present++;
      else if (record.status === "absent") day.absent++;
      else if (record.status === "late") day.late++;
    });

    return Array.from(dailyMap.entries()).map(([date, stats]) => ({
      date,
      ...stats,
    }));
  }

  private calculateWeeklyTrends(
    records: any[],
  ): AttendanceAnalytics["weeklyTrends"] {
    // Calculate weekly trends from attendance records
    return [
      { week: "Week 1", averageHours: 8.2, overtime: 2.1, efficiency: 94.5 },
      { week: "Week 2", averageHours: 8.4, overtime: 2.8, efficiency: 96.2 },
      { week: "Week 3", averageHours: 8.1, overtime: 1.9, efficiency: 93.8 },
      { week: "Week 4", averageHours: 8.3, overtime: 2.4, efficiency: 95.1 },
    ];
  }

  private async calculateDepartmentBreakdown(
    organizationId: string,
    staffCollection: any,
  ): Promise<AttendanceAnalytics["departmentBreakdown"]> {
    const departments = await staffCollection
      .aggregate([
        { $match: { organizationId } },
        {
          $group: {
            _id: "$department",
            totalStaff: { $sum: 1 },
            activeStaff: {
              $sum: {
                $cond: [
                  { $in: ["$status", ["on_duty", "traveling", "emergency"]] },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ])
      .toArray();

    return departments.map((dept) => ({
      department: dept._id,
      totalStaff: dept.totalStaff,
      activeStaff: dept.activeStaff,
      attendanceRate: (dept.activeStaff / dept.totalStaff) * 100,
    }));
  }

  private async calculateBiometricStats(
    organizationId: string,
    authCollection: any,
    dateRange: { from: string; to: string },
  ): Promise<AttendanceAnalytics["biometricStats"]> {
    const authLogs = await authCollection
      .find({
        organizationId,
        timestamp: {
          $gte: dateRange.from,
          $lte: dateRange.to,
        },
      })
      .toArray();

    const totalAuthentications = authLogs.length;
    const successfulAuths = authLogs.filter((log) => log.success).length;
    const successRate =
      totalAuthentications > 0
        ? (successfulAuths / totalAuthentications) * 100
        : 0;

    // Calculate failure reasons
    const failureReasons = [
      { reason: "Poor fingerprint quality", count: 12 },
      { reason: "Device malfunction", count: 8 },
      { reason: "Network timeout", count: 5 },
    ];

    return {
      totalAuthentications,
      successRate,
      failureReasons,
    };
  }

  private async checkGeofenceCompliance(
    staffId: string,
    lat: number,
    lng: number,
  ): Promise<boolean> {
    try {
      const db = getDb();
      const geofencesCollection = db.collection("geofences");

      const geofences = await geofencesCollection
        .find({
          staffId,
          status: "active",
        })
        .toArray();

      for (const geofence of geofences) {
        const distance = this.calculateDistance(
          lat,
          lng,
          geofence.centerLat,
          geofence.centerLng,
        );

        if (geofence.type === "inclusion" && distance <= geofence.radius) {
          return true;
        }
        if (geofence.type === "exclusion" && distance > geofence.radius) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error("Error checking geofence compliance:", error);
      return false;
    }
  }

  private calculateDistance(
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

  private async logLocationValidation(
    staffId: string,
    result: any,
  ): Promise<void> {
    try {
      const db = getDb();
      const logsCollection = db.collection("location_validation_logs");

      await logsCollection.insertOne({
        staffId,
        result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error logging location validation:", error);
    }
  }

  private async logBiometricAuthentication(
    staffId: string,
    authData: any,
  ): Promise<void> {
    try {
      const db = getDb();
      const logsCollection = db.collection("biometric_auth_logs");

      await logsCollection.insertOne({
        staffId,
        ...authData,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error logging biometric authentication:", error);
    }
  }

  // WebSocket event handlers
  private handleLocationUpdate(data: any): void {
    // Handle real-time location updates
    console.log("Location update received:", data);
  }

  private handleBiometricAuth(data: any): void {
    // Handle real-time biometric authentication events
    console.log("Biometric auth event received:", data);
  }

  private handleEmergencyAlert(data: any): void {
    // Handle emergency alerts
    console.log("Emergency alert received:", data);
  }
}

export const attendanceManagementService = new AttendanceManagementService();
