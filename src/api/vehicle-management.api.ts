import { getDb } from "./db";
import { ObjectId } from "./browser-mongodb";
import { validationService } from "@/services/validation.service";
import { securityService } from "@/services/security.service";
import { errorHandlerService } from "@/services/error-handler.service";

export interface VehicleCreateRequest {
  plateNumber: string;
  type: string;
  capacity: number;
  fuelType: string;
  organizationId: string;
  driverId?: string;
  specifications: {
    make: string;
    model: string;
    year: number;
    color: string;
    engineSize: string;
  };
  insurance: {
    provider: string;
    policyNumber: string;
    expiryDate: string;
  };
  registration: {
    registrationNumber: string;
    expiryDate: string;
    emirate: string;
  };
}

export interface VehicleUpdateRequest {
  plateNumber?: string;
  type?: string;
  status?: string;
  driverId?: string;
  currentLocation?: {
    latitude: number;
    longitude: number;
    address: string;
    accuracy: number;
  };
  maintenance?: {
    lastService: string;
    nextService: string;
    mileage: number;
    fuelLevel: number;
  };
}

export interface RouteCreateRequest {
  vehicleId: string;
  driverId: string;
  waypoints: {
    latitude: number;
    longitude: number;
    address: string;
    priority: number;
    estimatedArrival?: string;
    visitType: string;
    patientId?: string;
  }[];
  scheduledDate: string;
  estimatedDuration: number;
  organizationId: string;
}

export interface MaintenanceScheduleRequest {
  vehicleId: string;
  serviceType: string;
  scheduledDate: string;
  description: string;
  estimatedCost: number;
  serviceProvider: string;
  organizationId: string;
}

class VehicleManagementAPI {
  private readonly COLLECTION_VEHICLES = "fleet_vehicles";
  private readonly COLLECTION_ROUTES = "vehicle_routes";
  private readonly COLLECTION_MAINTENANCE = "vehicle_maintenance";
  private readonly COLLECTION_TRACKING = "vehicle_tracking";

  // Vehicle Management
  async createVehicle(data: VehicleCreateRequest): Promise<{
    success: boolean;
    vehicleId?: string;
    message: string;
  }> {
    try {
      // Security validation - rate limiting
      const rateLimitCheck = await securityService.checkRateLimit(
        `create-vehicle-${data.organizationId}`,
        10, // max 10 vehicles per hour
        3600000,
      );

      if (!rateLimitCheck.allowed) {
        throw new Error(
          `Rate limit exceeded. Try again in ${rateLimitCheck.resetTime} seconds`,
        );
      }

      // Input validation
      const validationResult =
        await validationService.validateVehicleData(data);
      if (!validationResult.isValid) {
        throw new Error(
          `Validation failed: ${validationResult.errors.join(", ")}`,
        );
      }

      const db = getDb();
      const collection = db.collection(this.COLLECTION_VEHICLES);

      // Check for duplicate plate number
      const existingVehicle = await collection.findOne({
        plateNumber: data.plateNumber,
        organizationId: data.organizationId,
      });

      if (existingVehicle) {
        throw new Error("Vehicle with this plate number already exists");
      }

      const vehicleId = new ObjectId().toString();
      const timestamp = new Date().toISOString();

      const vehicleDocument = {
        vehicleId,
        ...data,
        status: "idle",
        currentLocation: null,
        currentRoute: null,
        maintenance: {
          lastService: null,
          nextService: new Date(
            Date.now() + 90 * 24 * 60 * 60 * 1000,
          ).toISOString(), // 90 days from now
          mileage: 0,
          fuelLevel: 100,
        },
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      await collection.insertOne(vehicleDocument);

      return {
        success: true,
        vehicleId,
        message: "Vehicle created successfully",
      };
    } catch (error) {
      return errorHandlerService.handleError(error, {
        context: "createVehicle",
        data,
      });
    }
  }

  async updateVehicle(
    vehicleId: string,
    data: VehicleUpdateRequest,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // Security validation - rate limiting
      const rateLimitCheck = await securityService.checkRateLimit(
        `update-vehicle-${vehicleId}`,
        20, // max 20 updates per hour
        3600000,
      );

      if (!rateLimitCheck.allowed) {
        throw new Error(
          `Rate limit exceeded. Try again in ${rateLimitCheck.resetTime} seconds`,
        );
      }

      // Validate location data if provided
      if (data.currentLocation) {
        const locationValidation =
          await validationService.validateGPSCoordinates({
            lat: data.currentLocation.latitude,
            lng: data.currentLocation.longitude,
          });

        if (!locationValidation.isValid) {
          throw new Error("Invalid GPS coordinates");
        }
      }

      const db = getDb();
      const collection = db.collection(this.COLLECTION_VEHICLES);

      const updateData = {
        ...data,
        updatedAt: new Date().toISOString(),
      };

      const result = await collection.updateOne(
        { vehicleId },
        { $set: updateData },
      );

      if (result.matchedCount === 0) {
        throw new Error("Vehicle not found");
      }

      return {
        success: true,
        message: "Vehicle updated successfully",
      };
    } catch (error) {
      return errorHandlerService.handleError(error, {
        context: "updateVehicle",
        vehicleId,
        data,
      });
    }
  }

  async getVehicles(params: {
    organizationId: string;
    status?: string;
    type?: string;
    driverId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    success: boolean;
    vehicles?: any[];
    total?: number;
    message: string;
  }> {
    try {
      const db = getDb();
      const collection = db.collection(this.COLLECTION_VEHICLES);

      // Build query
      const query: any = { organizationId: params.organizationId };
      if (params.status) query.status = params.status;
      if (params.type) query.type = params.type;
      if (params.driverId) query.driverId = params.driverId;

      // Get total count
      const total = await collection.countDocuments(query);

      // Get vehicles with pagination
      const vehicles = await collection
        .find(query)
        .limit(params.limit || 50)
        .skip(params.offset || 0)
        .sort({ createdAt: -1 })
        .toArray();

      return {
        success: true,
        vehicles,
        total,
        message: "Vehicles retrieved successfully",
      };
    } catch (error) {
      return errorHandlerService.handleError(error, {
        context: "getVehicles",
        params,
      });
    }
  }

  async getVehicleById(vehicleId: string): Promise<{
    success: boolean;
    vehicle?: any;
    message: string;
  }> {
    try {
      const db = getDb();
      const collection = db.collection(this.COLLECTION_VEHICLES);

      const vehicle = await collection.findOne({ vehicleId });

      if (!vehicle) {
        throw new Error("Vehicle not found");
      }

      return {
        success: true,
        vehicle,
        message: "Vehicle retrieved successfully",
      };
    } catch (error) {
      return errorHandlerService.handleError(error, {
        context: "getVehicleById",
        vehicleId,
      });
    }
  }

  // Route Management
  async createRoute(data: RouteCreateRequest): Promise<{
    success: boolean;
    routeId?: string;
    message: string;
  }> {
    try {
      // Security validation
      const securityCheck = await securityService.validateRequest({
        action: "create_route",
        resource: "fleet_management",
        data,
      });

      if (!securityCheck.allowed) {
        throw new Error(securityCheck.reason);
      }

      // Validate waypoints
      for (const waypoint of data.waypoints) {
        const locationValidation =
          await validationService.validateGPSCoordinates({
            lat: waypoint.latitude,
            lng: waypoint.longitude,
          });

        if (!locationValidation.isValid) {
          throw new Error(
            `Invalid coordinates for waypoint: ${waypoint.address}`,
          );
        }
      }

      const db = getDb();
      const collection = db.collection(this.COLLECTION_ROUTES);

      const routeId = new ObjectId().toString();
      const timestamp = new Date().toISOString();

      const routeDocument = {
        routeId,
        ...data,
        status: "planned",
        actualStartTime: null,
        actualEndTime: null,
        actualDuration: null,
        completedWaypoints: [],
        isOptimized: false,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      await collection.insertOne(routeDocument);

      // Update vehicle with current route
      const vehiclesCollection = db.collection(this.COLLECTION_VEHICLES);
      await vehiclesCollection.updateOne(
        { vehicleId: data.vehicleId },
        {
          $set: {
            currentRoute: {
              id: routeId,
              destination:
                data.waypoints[data.waypoints.length - 1]?.address ||
                "Multiple stops",
              eta: data.waypoints[0]?.estimatedArrival || "TBD",
              progress: 0,
            },
            status: "assigned",
            updatedAt: timestamp,
          },
        },
      );

      return {
        success: true,
        routeId,
        message: "Route created successfully",
      };
    } catch (error) {
      return errorHandlerService.handleError(error, {
        context: "createRoute",
        data,
      });
    }
  }

  async updateRouteProgress(
    routeId: string,
    data: {
      completedWaypointIndex: number;
      actualArrivalTime: string;
      notes?: string;
    },
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const db = getDb();
      const collection = db.collection(this.COLLECTION_ROUTES);

      const route = await collection.findOne({ routeId });
      if (!route) {
        throw new Error("Route not found");
      }

      const completedWaypoints = route.completedWaypoints || [];
      completedWaypoints.push({
        waypointIndex: data.completedWaypointIndex,
        actualArrivalTime: data.actualArrivalTime,
        notes: data.notes,
      });

      const progress =
        (completedWaypoints.length / route.waypoints.length) * 100;
      const status = progress === 100 ? "completed" : "in_progress";

      await collection.updateOne(
        { routeId },
        {
          $set: {
            completedWaypoints,
            progress,
            status,
            updatedAt: new Date().toISOString(),
          },
        },
      );

      // Update vehicle progress
      const vehiclesCollection = db.collection(this.COLLECTION_VEHICLES);
      await vehiclesCollection.updateOne(
        { vehicleId: route.vehicleId },
        {
          $set: {
            "currentRoute.progress": progress,
            status: status === "completed" ? "idle" : "active",
            updatedAt: new Date().toISOString(),
          },
        },
      );

      return {
        success: true,
        message: "Route progress updated successfully",
      };
    } catch (error) {
      return errorHandlerService.handleError(error, {
        context: "updateRouteProgress",
        routeId,
        data,
      });
    }
  }

  // Maintenance Management
  async scheduleMaintenanceService(data: MaintenanceScheduleRequest): Promise<{
    success: boolean;
    maintenanceId?: string;
    message: string;
  }> {
    try {
      // Security validation
      const securityCheck = await securityService.validateRequest({
        action: "schedule_maintenance",
        resource: "fleet_management",
        data,
      });

      if (!securityCheck.allowed) {
        throw new Error(securityCheck.reason);
      }

      const db = getDb();
      const collection = db.collection(this.COLLECTION_MAINTENANCE);

      const maintenanceId = new ObjectId().toString();
      const timestamp = new Date().toISOString();

      const maintenanceDocument = {
        maintenanceId,
        ...data,
        status: "scheduled",
        actualDate: null,
        actualCost: null,
        completionNotes: null,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      await collection.insertOne(maintenanceDocument);

      // Update vehicle maintenance info
      const vehiclesCollection = db.collection(this.COLLECTION_VEHICLES);
      await vehiclesCollection.updateOne(
        { vehicleId: data.vehicleId },
        {
          $set: {
            "maintenance.nextService": data.scheduledDate,
            updatedAt: timestamp,
          },
        },
      );

      return {
        success: true,
        maintenanceId,
        message: "Maintenance service scheduled successfully",
      };
    } catch (error) {
      return errorHandlerService.handleError(error, {
        context: "scheduleMaintenanceService",
        data,
      });
    }
  }

  // Vehicle Tracking
  async updateVehicleLocation(
    vehicleId: string,
    locationData: {
      latitude: number;
      longitude: number;
      address: string;
      accuracy: number;
      speed?: number;
      heading?: number;
    },
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // Validate GPS coordinates
      const locationValidation = await validationService.validateGPSCoordinates(
        {
          lat: locationData.latitude,
          lng: locationData.longitude,
        },
      );

      if (!locationValidation.isValid) {
        throw new Error("Invalid GPS coordinates");
      }

      const db = getDb();
      const timestamp = new Date().toISOString();

      // Update vehicle location
      const vehiclesCollection = db.collection(this.COLLECTION_VEHICLES);
      await vehiclesCollection.updateOne(
        { vehicleId },
        {
          $set: {
            currentLocation: {
              latitude: locationData.latitude,
              longitude: locationData.longitude,
              address: locationData.address,
              accuracy: locationData.accuracy,
              speed: locationData.speed || 0,
              heading: locationData.heading || 0,
              timestamp,
            },
            updatedAt: timestamp,
          },
        },
      );

      // Log tracking data
      const trackingCollection = db.collection(this.COLLECTION_TRACKING);
      await trackingCollection.insertOne({
        trackingId: new ObjectId().toString(),
        vehicleId,
        location: {
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          address: locationData.address,
          accuracy: locationData.accuracy,
          speed: locationData.speed || 0,
          heading: locationData.heading || 0,
        },
        timestamp,
      });

      return {
        success: true,
        message: "Vehicle location updated successfully",
      };
    } catch (error) {
      return errorHandlerService.handleError(error, {
        context: "updateVehicleLocation",
        vehicleId,
        locationData,
      });
    }
  }

  async getVehicleTrackingHistory(
    vehicleId: string,
    params: {
      startDate: string;
      endDate: string;
      limit?: number;
    },
  ): Promise<{
    success: boolean;
    trackingData?: any[];
    message: string;
  }> {
    try {
      const db = getDb();
      const collection = db.collection(this.COLLECTION_TRACKING);

      const trackingData = await collection
        .find({
          vehicleId,
          timestamp: {
            $gte: params.startDate,
            $lte: params.endDate,
          },
        })
        .limit(params.limit || 1000)
        .sort({ timestamp: -1 })
        .toArray();

      return {
        success: true,
        trackingData,
        message: "Tracking history retrieved successfully",
      };
    } catch (error) {
      return errorHandlerService.handleError(error, {
        context: "getVehicleTrackingHistory",
        vehicleId,
        params,
      });
    }
  }

  // Fleet Analytics
  async getFleetAnalytics(params: {
    organizationId: string;
    startDate: string;
    endDate: string;
  }): Promise<{
    success: boolean;
    analytics?: any;
    message: string;
  }> {
    try {
      const db = getDb();
      const vehiclesCollection = db.collection(this.COLLECTION_VEHICLES);
      const routesCollection = db.collection(this.COLLECTION_ROUTES);
      const maintenanceCollection = db.collection(this.COLLECTION_MAINTENANCE);

      // Get fleet metrics
      const totalVehicles = await vehiclesCollection.countDocuments({
        organizationId: params.organizationId,
      });

      const activeVehicles = await vehiclesCollection.countDocuments({
        organizationId: params.organizationId,
        status: { $in: ["active", "assigned"] },
      });

      const maintenanceDue = await vehiclesCollection.countDocuments({
        organizationId: params.organizationId,
        "maintenance.nextService": {
          $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      });

      // Get route metrics
      const totalRoutes = await routesCollection.countDocuments({
        organizationId: params.organizationId,
        createdAt: {
          $gte: params.startDate,
          $lte: params.endDate,
        },
      });

      const completedRoutes = await routesCollection.countDocuments({
        organizationId: params.organizationId,
        status: "completed",
        createdAt: {
          $gte: params.startDate,
          $lte: params.endDate,
        },
      });

      // Get maintenance metrics
      const maintenanceCosts = await maintenanceCollection
        .aggregate([
          {
            $match: {
              organizationId: params.organizationId,
              actualDate: {
                $gte: params.startDate,
                $lte: params.endDate,
              },
            },
          },
          {
            $group: {
              _id: null,
              totalCost: { $sum: "$actualCost" },
            },
          },
        ])
        .toArray();

      const analytics = {
        fleetMetrics: {
          totalVehicles,
          activeVehicles,
          utilizationRate:
            totalVehicles > 0 ? (activeVehicles / totalVehicles) * 100 : 0,
          maintenanceDue,
        },
        routeMetrics: {
          totalRoutes,
          completedRoutes,
          completionRate:
            totalRoutes > 0 ? (completedRoutes / totalRoutes) * 100 : 0,
        },
        maintenanceMetrics: {
          totalCost: maintenanceCosts[0]?.totalCost || 0,
        },
      };

      return {
        success: true,
        analytics,
        message: "Fleet analytics retrieved successfully",
      };
    } catch (error) {
      return errorHandlerService.handleError(error, {
        context: "getFleetAnalytics",
        params,
      });
    }
  }
}

export const vehicleManagementAPI = new VehicleManagementAPI();
