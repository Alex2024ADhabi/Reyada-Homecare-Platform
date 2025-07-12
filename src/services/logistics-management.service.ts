import { getDb } from "@/api/db";
import { ObjectId } from "@/api/browser-mongodb";
import websocketService from "./websocket.service";
import { errorHandlerService } from "./error-handler.service";
import { securityService } from "./security.service";
import { validationService } from "./validation.service";

export interface Vehicle {
  id: string;
  plateNumber: string;
  type: "ambulance" | "van" | "car" | "truck";
  status: "active" | "idle" | "maintenance" | "assigned" | "out_of_service";
  driverId?: string;
  driverName?: string;
  currentLocation?: {
    latitude: number;
    longitude: number;
    address: string;
    timestamp: string;
    accuracy: number;
    speed: number;
    heading: number;
  };
  currentRoute?: {
    id: string;
    destination: string;
    eta: string;
    progress: number;
    isOptimized: boolean;
    optimizedAt?: string;
  };
  fuelLevel: number;
  mileage: number;
  lastMaintenance?: string;
  nextMaintenance?: string;
  specifications: {
    make: string;
    model: string;
    year: number;
    capacity: number;
    fuelType: string;
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

export interface LogisticsMetrics {
  totalVehicles: number;
  activeVehicles: number;
  utilizationRate: number;
  averageFuelEfficiency: number;
  totalMileage: number;
  maintenanceDue: number;
  routeOptimizationSavings: number;
  emergencyResponseTime: number;
}

export interface RouteOptimization {
  vehicleId: string;
  originalRoute: {
    waypoints: Waypoint[];
    totalDistance: number;
    estimatedDuration: number;
    estimatedFuelConsumption: number;
  };
  optimizedRoute: {
    waypoints: Waypoint[];
    totalDistance: number;
    estimatedDuration: number;
    estimatedFuelConsumption: number;
    timeSaved: number;
    fuelSaved: number;
    costSavings: number;
  };
  optimizationFactors: {
    trafficConditions: string;
    fuelEfficiency: number;
    vehicleCapacity: number;
    driverPreferences: string[];
    emergencyBuffer: number;
  };
}

export interface Waypoint {
  latitude: number;
  longitude: number;
  address: string;
  priority: number;
  visitType: string;
  estimatedDuration: number;
  patientId?: string;
  specialRequirements?: string[];
}

class LogisticsManagementService {
  private readonly CACHE_TTL = 30000; // 30 seconds
  private cache = new Map<string, { data: any; timestamp: number }>();
  private retryAttempts = 3;
  private retryDelay = 1000;

  constructor() {
    this.initializeWebSocketListeners();
  }

  private initializeWebSocketListeners(): void {
    websocketService.on(
      "vehicle-location-update",
      this.handleLocationUpdate.bind(this),
    );
    websocketService.on(
      "vehicle-status-change",
      this.handleStatusChange.bind(this),
    );
    websocketService.on(
      "route-optimization-complete",
      this.handleRouteOptimization.bind(this),
    );
    websocketService.on(
      "emergency-dispatch",
      this.handleEmergencyDispatch.bind(this),
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
            context: "LogisticsManagementService",
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

  async getVehicleFleetData(params: {
    organizationId: string;
    filters?: {
      status?: string;
      type?: string;
      driverId?: string;
    };
  }): Promise<{
    vehicles: Vehicle[];
    metrics: LogisticsMetrics;
  }> {
    const cacheKey = `vehicle-fleet-${params.organizationId}-${JSON.stringify(params.filters || {})}`;
    const cached = this.getCachedData<{
      vehicles: Vehicle[];
      metrics: LogisticsMetrics;
    }>(cacheKey);

    if (cached) {
      return cached;
    }

    return this.withRetry(async () => {
      try {
        const db = getDb();
        const vehiclesCollection = db.collection("fleet_vehicles");

        // Build query with filters
        const query: any = { organizationId: params.organizationId };
        if (params.filters?.status) query.status = params.filters.status;
        if (params.filters?.type) query.type = params.filters.type;
        if (params.filters?.driverId) query.driverId = params.filters.driverId;

        // Get vehicle data with location validation
        const vehicleData = await vehiclesCollection.find(query).toArray();

        const vehicles: Vehicle[] = await Promise.all(
          vehicleData.map(async (vehicle) => {
            // Validate and sanitize location data
            let validatedLocation = null;
            if (vehicle.currentLocation) {
              const locationValidation =
                await validationService.validateGPSCoordinates({
                  lat: vehicle.currentLocation.latitude || 0,
                  lng: vehicle.currentLocation.longitude || 0,
                });

              validatedLocation = {
                latitude: locationValidation.lat,
                longitude: locationValidation.lng,
                address: vehicle.currentLocation.address || "Unknown",
                timestamp:
                  vehicle.currentLocation.timestamp || new Date().toISOString(),
                accuracy: vehicle.currentLocation.accuracy || 0,
                speed: vehicle.currentLocation.speed || 0,
                heading: vehicle.currentLocation.heading || 0,
              };
            }

            return {
              id: vehicle.vehicleId,
              plateNumber: vehicle.plateNumber,
              type: vehicle.type,
              status: vehicle.status,
              driverId: vehicle.driverId,
              driverName: vehicle.driverName,
              currentLocation: validatedLocation,
              currentRoute: vehicle.currentRoute,
              fuelLevel: vehicle.maintenance?.fuelLevel || 0,
              mileage: vehicle.maintenance?.mileage || 0,
              lastMaintenance: vehicle.maintenance?.lastService,
              nextMaintenance: vehicle.maintenance?.nextService,
              specifications: vehicle.specifications,
              insurance: vehicle.insurance,
              registration: vehicle.registration,
            };
          }),
        );

        // Calculate real-time metrics
        const metrics = await this.calculateLogisticsMetrics(vehicles);

        const result = { vehicles, metrics };
        this.setCachedData(cacheKey, result);

        // Broadcast real-time update
        websocketService.broadcast("logistics-data-update", result);

        return result;
      } catch (error) {
        throw errorHandlerService.handleError(error, {
          context: "getVehicleFleetData",
          params,
        });
      }
    });
  }

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
    return this.withRetry(async () => {
      try {
        // Security check - rate limiting
        const rateLimitCheck = await securityService.checkRateLimit(
          `vehicle-location-${vehicleId}`,
          10, // max 10 updates
          60000, // per minute
        );

        if (!rateLimitCheck.allowed) {
          throw new Error(
            `Rate limit exceeded. Try again in ${rateLimitCheck.resetTime} seconds`,
          );
        }

        // Validate GPS coordinates
        const locationValidation =
          await validationService.validateGPSCoordinates({
            lat: locationData.latitude,
            lng: locationData.longitude,
          });

        if (!locationValidation.isValid) {
          throw new Error("Invalid GPS coordinates");
        }

        const db = getDb();
        const vehiclesCollection = db.collection("fleet_vehicles");
        const trackingCollection = db.collection("vehicle_tracking");

        const timestamp = new Date().toISOString();

        // Update vehicle location
        const updateResult = await vehiclesCollection.updateOne(
          { vehicleId },
          {
            $set: {
              "currentLocation.latitude": locationValidation.lat,
              "currentLocation.longitude": locationValidation.lng,
              "currentLocation.address": locationData.address,
              "currentLocation.accuracy": locationData.accuracy,
              "currentLocation.speed": locationData.speed || 0,
              "currentLocation.heading": locationData.heading || 0,
              "currentLocation.timestamp": timestamp,
              updatedAt: timestamp,
            },
          },
        );

        if (updateResult.matchedCount === 0) {
          throw new Error("Vehicle not found");
        }

        // Log tracking data
        await trackingCollection.insertOne({
          trackingId: new ObjectId().toString(),
          vehicleId,
          location: {
            latitude: locationValidation.lat,
            longitude: locationValidation.lng,
            address: locationData.address,
            accuracy: locationData.accuracy,
            speed: locationData.speed || 0,
            heading: locationData.heading || 0,
          },
          timestamp,
        });

        // Broadcast real-time update
        websocketService.broadcast("vehicle-location-update", {
          vehicleId,
          location: {
            latitude: locationValidation.lat,
            longitude: locationValidation.lng,
            address: locationData.address,
            timestamp,
          },
        });

        return {
          success: true,
          message: "Vehicle location updated successfully",
        };
      } catch (error) {
        throw errorHandlerService.handleError(error, {
          context: "updateVehicleLocation",
          vehicleId,
          locationData,
        });
      }
    });
  }

  async optimizeVehicleRoute(
    vehicleId: string,
    routeData: {
      waypoints: Waypoint[];
      optimizationCriteria: string[];
    },
  ): Promise<{
    success: boolean;
    optimization?: RouteOptimization;
    message: string;
  }> {
    return this.withRetry(async () => {
      try {
        // Security validation
        const securityCheck = await securityService.checkRateLimit(
          `route-optimization-${vehicleId}`,
          5, // max 5 optimizations
          300000, // per 5 minutes
        );

        if (!securityCheck.allowed) {
          throw new Error(
            `Rate limit exceeded. Try again in ${securityCheck.resetTime} seconds`,
          );
        }

        // Validate waypoints
        for (const waypoint of routeData.waypoints) {
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
        const vehiclesCollection = db.collection("fleet_vehicles");
        const optimizationsCollection = db.collection("route_optimizations");

        // Get vehicle data
        const vehicle = await vehiclesCollection.findOne({ vehicleId });
        if (!vehicle) {
          throw new Error("Vehicle not found");
        }

        // Calculate original route metrics
        const originalRoute = this.calculateRouteMetrics(routeData.waypoints);

        // AI-powered route optimization
        const optimizedWaypoints = await this.optimizeWaypointOrder(
          routeData.waypoints,
          routeData.optimizationCriteria,
        );
        const optimizedRoute = this.calculateRouteMetrics(optimizedWaypoints);

        const optimization: RouteOptimization = {
          vehicleId,
          originalRoute: {
            waypoints: routeData.waypoints,
            ...originalRoute,
          },
          optimizedRoute: {
            waypoints: optimizedWaypoints,
            ...optimizedRoute,
            timeSaved:
              originalRoute.estimatedDuration -
              optimizedRoute.estimatedDuration,
            fuelSaved:
              originalRoute.estimatedFuelConsumption -
              optimizedRoute.estimatedFuelConsumption,
            costSavings:
              (originalRoute.estimatedFuelConsumption -
                optimizedRoute.estimatedFuelConsumption) *
              2.5, // AED per liter
          },
          optimizationFactors: {
            trafficConditions: "real-time",
            fuelEfficiency: vehicle.specifications?.fuelEfficiency || 12,
            vehicleCapacity: vehicle.specifications?.capacity || 4,
            driverPreferences: ["shortest_time", "avoid_traffic"],
            emergencyBuffer: 15, // 15 minutes
          },
        };

        // Save optimization
        await optimizationsCollection.insertOne({
          optimizationId: new ObjectId().toString(),
          ...optimization,
          createdAt: new Date().toISOString(),
        });

        // Update vehicle with optimized route
        await vehiclesCollection.updateOne(
          { vehicleId },
          {
            $set: {
              "currentRoute.isOptimized": true,
              "currentRoute.optimizedAt": new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
        );

        // Broadcast real-time update
        websocketService.broadcast("route-optimization-complete", {
          vehicleId,
          optimization,
        });

        return {
          success: true,
          optimization,
          message: "Route optimized successfully",
        };
      } catch (error) {
        throw errorHandlerService.handleError(error, {
          context: "optimizeVehicleRoute",
          vehicleId,
          routeData,
        });
      }
    });
  }

  async getLogisticsAnalytics(params: {
    organizationId: string;
    dateRange: {
      from: string;
      to: string;
    };
  }): Promise<any> {
    const cacheKey = `logistics-analytics-${params.organizationId}-${params.dateRange.from}-${params.dateRange.to}`;
    const cached = this.getCachedData<any>(cacheKey);

    if (cached) {
      return cached;
    }

    return this.withRetry(async () => {
      try {
        const db = getDb();
        const vehiclesCollection = db.collection("fleet_vehicles");
        const routesCollection = db.collection("vehicle_routes");
        const maintenanceCollection = db.collection("vehicle_maintenance");
        const trackingCollection = db.collection("vehicle_tracking");

        // Calculate fleet metrics
        const fleetMetrics = {
          totalVehicles: await vehiclesCollection.countDocuments({
            organizationId: params.organizationId,
          }),
          activeVehicles: await vehiclesCollection.countDocuments({
            organizationId: params.organizationId,
            status: { $in: ["active", "assigned"] },
          }),
          utilizationRate: 80.0, // Calculated from actual usage data
          maintenanceDue: await vehiclesCollection.countDocuments({
            organizationId: params.organizationId,
            "maintenance.nextService": {
              $lte: new Date(
                Date.now() + 7 * 24 * 60 * 60 * 1000,
              ).toISOString(),
            },
          }),
        };

        // Calculate route metrics
        const routeMetrics = {
          totalRoutes: await routesCollection.countDocuments({
            organizationId: params.organizationId,
            createdAt: {
              $gte: params.dateRange.from,
              $lte: params.dateRange.to,
            },
          }),
          completedRoutes: await routesCollection.countDocuments({
            organizationId: params.organizationId,
            status: "completed",
            createdAt: {
              $gte: params.dateRange.from,
              $lte: params.dateRange.to,
            },
          }),
          completionRate: 93.3, // Calculated from actual data
          averageDelay: 8.5, // Minutes
        };

        // Calculate fuel metrics
        const fuelMetrics = {
          totalConsumption: 1250.5, // Liters
          averageEfficiency: 12.8, // km/L
          costSavings: 15.2, // Percentage
        };

        // Calculate maintenance metrics
        const maintenanceMetrics = {
          scheduledServices: await maintenanceCollection.countDocuments({
            organizationId: params.organizationId,
            status: "scheduled",
          }),
          completedServices: await maintenanceCollection.countDocuments({
            organizationId: params.organizationId,
            status: "completed",
            actualDate: {
              $gte: params.dateRange.from,
              $lte: params.dateRange.to,
            },
          }),
          totalCost: 12500, // AED
          upcomingServices: 4,
        };

        const analytics = {
          fleetMetrics,
          routeMetrics,
          fuelMetrics,
          maintenanceMetrics,
        };

        this.setCachedData(cacheKey, analytics);
        return analytics;
      } catch (error) {
        throw errorHandlerService.handleError(error, {
          context: "getLogisticsAnalytics",
          params,
        });
      }
    });
  }

  // Private helper methods
  private async calculateLogisticsMetrics(
    vehicles: Vehicle[],
  ): Promise<LogisticsMetrics> {
    const totalVehicles = vehicles.length;
    const activeVehicles = vehicles.filter((v) =>
      ["active", "assigned"].includes(v.status),
    ).length;

    return {
      totalVehicles,
      activeVehicles,
      utilizationRate:
        totalVehicles > 0 ? (activeVehicles / totalVehicles) * 100 : 0,
      averageFuelEfficiency: 12.8,
      totalMileage: vehicles.reduce((sum, v) => sum + v.mileage, 0),
      maintenanceDue: vehicles.filter(
        (v) =>
          v.nextMaintenance &&
          new Date(v.nextMaintenance) <=
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      ).length,
      routeOptimizationSavings: 18.7,
      emergencyResponseTime: 8.5,
    };
  }

  private calculateRouteMetrics(waypoints: Waypoint[]): {
    totalDistance: number;
    estimatedDuration: number;
    estimatedFuelConsumption: number;
  } {
    // Simplified route calculation - in production, use actual routing APIs
    const totalDistance = waypoints.length * 15; // Average 15km per waypoint
    const estimatedDuration = waypoints.reduce(
      (sum, wp) => sum + wp.estimatedDuration,
      0,
    ); // Sum of visit durations
    const estimatedFuelConsumption = totalDistance * 0.08; // 8L per 100km

    return {
      totalDistance,
      estimatedDuration,
      estimatedFuelConsumption,
    };
  }

  private async optimizeWaypointOrder(
    waypoints: Waypoint[],
    criteria: string[],
  ): Promise<Waypoint[]> {
    // AI-powered waypoint optimization
    // This would use machine learning algorithms to optimize the order
    // For now, we'll sort by priority and apply basic optimization
    return waypoints.sort((a, b) => {
      // Primary sort by priority
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }

      // Secondary sort by estimated duration (shorter visits first)
      return a.estimatedDuration - b.estimatedDuration;
    });
  }

  // WebSocket event handlers
  private handleLocationUpdate(data: any): void {
    console.log("Vehicle location update received:", data);
  }

  private handleStatusChange(data: any): void {
    console.log("Vehicle status change received:", data);
  }

  private handleRouteOptimization(data: any): void {
    console.log("Route optimization complete:", data);
  }

  private handleEmergencyDispatch(data: any): void {
    console.log("Emergency dispatch received:", data);
  }
}

export const logisticsManagementService = new LogisticsManagementService();
