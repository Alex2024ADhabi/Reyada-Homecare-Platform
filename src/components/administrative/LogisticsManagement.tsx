import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Truck,
  MapPin,
  Fuel,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Navigation,
  Activity,
  Search,
  RefreshCw,
  Route,
} from "lucide-react";
import {
  logisticsManagementService,
  type Vehicle,
  type LogisticsMetrics,
} from "@/services/logistics-management.service";
import websocketService from "@/services/websocket.service";
import { errorHandlerService } from "@/services/error-handler.service";

interface LogisticsManagementProps {
  organizationId?: string;
  onVehicleSelect?: (vehicle: Vehicle) => void;
  className?: string;
}

export default function LogisticsManagement({
  organizationId = "default-org",
  onVehicleSelect,
  className = "",
}: LogisticsManagementProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [metrics, setMetrics] = useState<LogisticsMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState<string | null>(
    null,
  );
  const [isOptimizingRoute, setIsOptimizingRoute] = useState<string | null>(
    null,
  );
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Load logistics data
  const loadLogisticsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: any = {};
      if (statusFilter !== "all") filters.status = statusFilter;
      if (typeFilter !== "all") filters.type = typeFilter;

      const data = await logisticsManagementService.getVehicleFleetData({
        organizationId,
        filters,
      });

      setVehicles(data.vehicles);
      setMetrics(data.metrics);
      setLastUpdate(new Date());
    } catch (err) {
      const error = errorHandlerService.handleError(err, {
        context: "LogisticsManagement.loadLogisticsData",
        organizationId,
        filters: { statusFilter, typeFilter },
      });
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [organizationId, statusFilter, typeFilter]);

  // Handle vehicle location update
  const handleLocationUpdate = async (vehicleId: string) => {
    try {
      setIsUpdatingLocation(vehicleId);
      setError(null);

      const result = await logisticsManagementService.updateVehicleLocation(
        vehicleId,
        {
          // Simulate GPS coordinates (in production, get from actual GPS)
          latitude: 25.2048 + (Math.random() - 0.5) * 0.1,
          longitude: 55.2708 + (Math.random() - 0.5) * 0.1,
          address: "Dubai Healthcare City",
          accuracy: 10,
          speed: Math.random() * 60,
          heading: Math.random() * 360,
        },
      );

      if (result.success) {
        // Update vehicle in the list
        setVehicles((prev) =>
          prev.map((vehicle) =>
            vehicle.id === vehicleId
              ? {
                  ...vehicle,
                  currentLocation: {
                    ...vehicle.currentLocation,
                    timestamp: new Date().toISOString(),
                  },
                }
              : vehicle,
          ),
        );
      }
    } catch (err) {
      errorHandlerService.handleError(err, {
        context: "LogisticsManagement.handleLocationUpdate",
        vehicleId,
      });
      setError("Location update failed");
    } finally {
      setIsUpdatingLocation(null);
    }
  };

  // Handle route optimization
  const handleRouteOptimization = async (vehicleId: string) => {
    try {
      setIsOptimizingRoute(vehicleId);
      setError(null);

      const result = await logisticsManagementService.optimizeVehicleRoute(
        vehicleId,
        {
          waypoints: [
            {
              latitude: 25.2048,
              longitude: 55.2708,
              address: "Dubai Healthcare City",
              priority: 1,
              visitType: "patient_visit",
              estimatedDuration: 30,
            },
            {
              latitude: 25.1972,
              longitude: 55.2744,
              address: "Dubai Mall Area",
              priority: 2,
              visitType: "patient_visit",
              estimatedDuration: 45,
            },
          ],
          optimizationCriteria: ["time", "fuel", "traffic"],
        },
      );

      if (result.success) {
        // Update vehicle route in the list
        setVehicles((prev) =>
          prev.map((vehicle) =>
            vehicle.id === vehicleId
              ? {
                  ...vehicle,
                  currentRoute: {
                    ...vehicle.currentRoute,
                    isOptimized: true,
                    optimizedAt: new Date().toISOString(),
                  },
                }
              : vehicle,
          ),
        );
      }
    } catch (err) {
      errorHandlerService.handleError(err, {
        context: "LogisticsManagement.handleRouteOptimization",
        vehicleId,
      });
      setError("Route optimization failed");
    } finally {
      setIsOptimizingRoute(null);
    }
  };

  // Filter vehicles
  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.driverName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: React.ReactNode }> = {
      active: {
        variant: "default",
        icon: <CheckCircle className="w-3 h-3" />,
      },
      idle: { variant: "secondary", icon: <Clock className="w-3 h-3" /> },
      maintenance: {
        variant: "destructive",
        icon: <Settings className="w-3 h-3" />,
      },
      assigned: {
        variant: "outline",
        icon: <Navigation className="w-3 h-3" />,
      },
      out_of_service: {
        variant: "destructive",
        icon: <XCircle className="w-3 h-3" />,
      },
    };

    const config = variants[status] || variants.idle;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  // WebSocket event handlers
  useEffect(() => {
    const handleVehicleUpdate = (data: any) => {
      setVehicles((prev) =>
        prev.map((vehicle) =>
          vehicle.id === data.vehicleId
            ? { ...vehicle, ...data.updates }
            : vehicle,
        ),
      );
      setLastUpdate(new Date());
    };

    const handleLocationUpdate = (data: any) => {
      setVehicles((prev) =>
        prev.map((vehicle) =>
          vehicle.id === data.vehicleId
            ? {
                ...vehicle,
                currentLocation: {
                  ...vehicle.currentLocation,
                  ...data.location,
                },
              }
            : vehicle,
        ),
      );
    };

    const handleRouteUpdate = (data: any) => {
      setVehicles((prev) =>
        prev.map((vehicle) =>
          vehicle.id === data.vehicleId
            ? { ...vehicle, currentRoute: data.route }
            : vehicle,
        ),
      );
    };

    websocketService.on("vehicle-update", handleVehicleUpdate);
    websocketService.on("vehicle-location-update", handleLocationUpdate);
    websocketService.on("vehicle-route-update", handleRouteUpdate);

    return () => {
      websocketService.off("vehicle-update", handleVehicleUpdate);
      websocketService.off("vehicle-location-update", handleLocationUpdate);
      websocketService.off("vehicle-route-update", handleRouteUpdate);
    };
  }, []);

  // Initial load and periodic refresh
  useEffect(() => {
    loadLogisticsData();

    // Set up periodic refresh
    const interval = setInterval(loadLogisticsData, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [loadLogisticsData]);

  return (
    <div className={`space-y-6 bg-white ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Fleet Management</h2>
          <p className="text-gray-600">
            Real-time vehicle tracking and route optimization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </span>
          <Button
            onClick={loadLogisticsData}
            disabled={loading}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Vehicles</p>
                  <p className="text-2xl font-bold">{metrics.totalVehicles}</p>
                </div>
                <Truck className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Vehicles</p>
                  <p className="text-2xl font-bold text-green-600">
                    {metrics.activeVehicles}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Utilization Rate</p>
                  <p className="text-2xl font-bold">
                    {metrics.utilizationRate}%
                  </p>
                </div>
                <Route className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Fuel Efficiency</p>
                  <p className="text-2xl font-bold">
                    {metrics.averageFuelEfficiency} km/L
                  </p>
                </div>
                <Fuel className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search vehicles by plate number, type, or driver..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="idle">Idle</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="out_of_service">Out of Service</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="ambulance">Ambulance</SelectItem>
                <SelectItem value="van">Van</SelectItem>
                <SelectItem value="car">Car</SelectItem>
                <SelectItem value="truck">Truck</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredVehicles.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              No vehicles found matching your criteria
            </p>
          </div>
        ) : (
          filteredVehicles.map((vehicle) => (
            <Card
              key={vehicle.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedVehicle?.id === vehicle.id ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => {
                setSelectedVehicle(vehicle);
                onVehicleSelect?.(vehicle);
              }}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {vehicle.plateNumber}
                  </CardTitle>
                  {getStatusBadge(vehicle.status)}
                </div>
                <p className="text-sm text-gray-600 capitalize">
                  {vehicle.type}
                </p>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Driver */}
                {vehicle.driverName && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Driver:</span>
                    <span>{vehicle.driverName}</span>
                  </div>
                )}

                {/* Location */}
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="truncate">
                    {vehicle.currentLocation?.address || "Location unknown"}
                  </span>
                </div>

                {/* Fuel Level */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Fuel className="w-4 h-4 text-gray-400" />
                      Fuel Level
                    </span>
                    <span>{vehicle.fuelLevel}%</span>
                  </div>
                  <Progress value={vehicle.fuelLevel} className="h-2" />
                </div>

                {/* Current Route */}
                {vehicle.currentRoute && (
                  <div className="bg-blue-50 p-2 rounded text-sm">
                    <p className="font-medium">Current Route:</p>
                    <p className="text-gray-600">
                      {vehicle.currentRoute.destination}
                    </p>
                    <p className="text-xs text-gray-500">
                      ETA: {vehicle.currentRoute.eta}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLocationUpdate(vehicle.id);
                    }}
                    disabled={isUpdatingLocation === vehicle.id}
                  >
                    {isUpdatingLocation === vehicle.id ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <MapPin className="w-3 h-3" />
                    )}
                    Update
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRouteOptimization(vehicle.id);
                    }}
                    disabled={isOptimizingRoute === vehicle.id}
                  >
                    {isOptimizingRoute === vehicle.id ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Route className="w-3 h-3" />
                    )}
                    Optimize
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
