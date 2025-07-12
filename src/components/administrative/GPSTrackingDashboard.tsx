import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MapPin,
  Navigation,
  Car,
  Truck,
  Route,
  Fuel,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle,
  Settings,
  BarChart3,
  TrendingUp,
  Shield,
  Zap,
  Users,
  Calendar,
  Phone,
  Radio,
  Satellite,
  Gauge,
  Thermometer,
  Battery,
  Wrench,
} from "lucide-react";

interface Vehicle {
  id: string;
  plateNumber: string;
  type: "ambulance" | "van" | "car" | "motorcycle" | "truck";
  driver: {
    id: string;
    name: string;
    phone: string;
    license: string;
  };
  status: "active" | "parked" | "maintenance" | "offline" | "emergency";
  location: {
    address: string;
    coordinates: { lat: number; lng: number };
    accuracy: number;
    timestamp: string;
  };
  telemetry: {
    speed: number;
    heading: number;
    altitude: number;
    fuel: number;
    engineTemp: number;
    batteryVoltage: number;
    mileage: number;
    engineHours: number;
  };
  route?: {
    id: string;
    destination: string;
    eta: string;
    distance: number;
    progress: number;
  };
  alerts: {
    id: string;
    type: "speed" | "fuel" | "maintenance" | "route" | "emergency";
    message: string;
    severity: "low" | "medium" | "high" | "critical";
    timestamp: string;
  }[];
}

interface GPSTrackingDashboardProps {
  organizationId?: string;
}

export default function GPSTrackingDashboard({
  organizationId = "RHHCS",
}: GPSTrackingDashboardProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: "HC-001",
      plateNumber: "DXB-A-12345",
      type: "ambulance",
      driver: {
        id: "DRV-001",
        name: "Ahmed Al Mansouri",
        phone: "+971-50-123-4567",
        license: "DL-12345",
      },
      status: "active",
      location: {
        address: "Sheikh Zayed Road, Dubai",
        coordinates: { lat: 25.2048, lng: 55.2708 },
        accuracy: 3.2,
        timestamp: new Date().toISOString(),
      },
      telemetry: {
        speed: 65,
        heading: 45,
        altitude: 12.5,
        fuel: 85,
        engineTemp: 92,
        batteryVoltage: 12.8,
        mileage: 45230,
        engineHours: 2340,
      },
      route: {
        id: "RT-001",
        destination: "Dubai Healthcare City",
        eta: "15 min",
        distance: 12.5,
        progress: 65,
      },
      alerts: [
        {
          id: "ALT-001",
          type: "speed",
          message: "Speed limit exceeded: 65 km/h in 50 km/h zone",
          severity: "medium",
          timestamp: new Date(Date.now() - 300000).toISOString(),
        },
      ],
    },
    {
      id: "HC-002",
      plateNumber: "DXB-B-67890",
      type: "van",
      driver: {
        id: "DRV-002",
        name: "Sarah Johnson",
        phone: "+971-50-987-6543",
        license: "DL-67890",
      },
      status: "parked",
      location: {
        address: "Dubai Mall Parking",
        coordinates: { lat: 25.1972, lng: 55.2796 },
        accuracy: 2.1,
        timestamp: new Date(Date.now() - 600000).toISOString(),
      },
      telemetry: {
        speed: 0,
        heading: 0,
        altitude: 8.2,
        fuel: 92,
        engineTemp: 75,
        batteryVoltage: 12.6,
        mileage: 32100,
        engineHours: 1890,
      },
      alerts: [],
    },
    {
      id: "HC-003",
      plateNumber: "DXB-C-11111",
      type: "car",
      driver: {
        id: "DRV-003",
        name: "Maria Garcia",
        phone: "+971-50-555-0123",
        license: "DL-11111",
      },
      status: "maintenance",
      location: {
        address: "Service Center - Al Qusais",
        coordinates: { lat: 25.2854, lng: 55.3644 },
        accuracy: 1.5,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      telemetry: {
        speed: 0,
        heading: 0,
        altitude: 15.3,
        fuel: 45,
        engineTemp: 0,
        batteryVoltage: 12.2,
        mileage: 67890,
        engineHours: 3456,
      },
      alerts: [
        {
          id: "ALT-002",
          type: "maintenance",
          message: "Scheduled maintenance due in 2 days",
          severity: "medium",
          timestamp: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "ALT-003",
          type: "fuel",
          message: "Low fuel level: 45%",
          severity: "low",
          timestamp: new Date(Date.now() - 1800000).toISOString(),
        },
      ],
    },
  ]);

  const [fleetMetrics, setFleetMetrics] = useState({
    totalVehicles: 15,
    activeVehicles: 12,
    totalDistance: 1247,
    averageSpeed: 45,
    fuelEfficiency: 8.5,
    maintenanceDue: 3,
    alertsCount: 8,
    driverScore: 92,
    routeOptimization: 18,
    costSavings: 2340,
    emergencyResponse: 8.5,
    uptime: 98.5,
  });

  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [trackingInterval, setTrackingInterval] = useState(30); // seconds
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);

  // Simulate real-time updates
  useEffect(() => {
    if (!isRealTimeEnabled) return;

    const interval = setInterval(() => {
      setVehicles((prev) =>
        prev.map((vehicle) => {
          if (vehicle.status === "active") {
            // Simulate movement and telemetry updates
            const speedVariation = (Math.random() - 0.5) * 10;
            const fuelConsumption = Math.random() * 0.1;

            return {
              ...vehicle,
              telemetry: {
                ...vehicle.telemetry,
                speed: Math.max(
                  0,
                  Math.min(120, vehicle.telemetry.speed + speedVariation),
                ),
                fuel: Math.max(0, vehicle.telemetry.fuel - fuelConsumption),
                engineTemp: 85 + Math.random() * 15,
                batteryVoltage: 12.4 + Math.random() * 0.8,
              },
              location: {
                ...vehicle.location,
                timestamp: new Date().toISOString(),
              },
            };
          }
          return vehicle;
        }),
      );
    }, trackingInterval * 1000);

    return () => clearInterval(interval);
  }, [trackingInterval, isRealTimeEnabled]);

  const getStatusBadge = (status: Vehicle["status"]) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      active: "default",
      parked: "secondary",
      maintenance: "destructive",
      offline: "outline",
      emergency: "destructive",
    };

    const icons = {
      active: <Activity className="w-3 h-3" />,
      parked: <CheckCircle className="w-3 h-3" />,
      maintenance: <Wrench className="w-3 h-3" />,
      offline: <AlertTriangle className="w-3 h-3" />,
      emergency: <AlertTriangle className="w-3 h-3" />,
    };

    return (
      <Badge variant={variants[status]} className="flex items-center gap-1">
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getVehicleIcon = (type: Vehicle["type"]) => {
    const icons = {
      ambulance: <Car className="w-5 h-5 text-red-600" />,
      van: <Truck className="w-5 h-5 text-blue-600" />,
      car: <Car className="w-5 h-5 text-green-600" />,
      motorcycle: <Car className="w-5 h-5 text-orange-600" />,
      truck: <Truck className="w-5 h-5 text-purple-600" />,
    };
    return icons[type] || <Car className="w-5 h-5" />;
  };

  const getAlertSeverityBadge = (severity: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      low: "outline",
      medium: "secondary",
      high: "destructive",
      critical: "destructive",
    };
    return (
      <Badge variant={variants[severity]}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </Badge>
    );
  };

  const handleEmergencyAlert = (vehicleId: string) => {
    setVehicles((prev) =>
      prev.map((vehicle) =>
        vehicle.id === vehicleId
          ? {
              ...vehicle,
              status: "emergency",
              alerts: [
                {
                  id: `EMR-${Date.now()}`,
                  type: "emergency",
                  message: "Emergency button activated",
                  severity: "critical",
                  timestamp: new Date().toISOString(),
                },
                ...vehicle.alerts,
              ],
            }
          : vehicle,
      ),
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Satellite className="w-8 h-8 text-blue-600" />
              CarTrack GPS Fleet Management
            </h1>
            <p className="text-gray-600 mt-1">
              Real-time vehicle tracking, route optimization, and fleet
              analytics
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={isRealTimeEnabled ? "default" : "secondary"}
              className="flex items-center gap-1"
            >
              <Activity className="w-3 h-3" />
              {isRealTimeEnabled ? "Live Tracking" : "Paused"}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRealTimeEnabled(!isRealTimeEnabled)}
            >
              {isRealTimeEnabled ? "Pause" : "Resume"}
            </Button>
          </div>
        </div>

        {/* Fleet Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
                <Car className="w-4 h-4" />
                Active Vehicles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                {fleetMetrics.activeVehicles}
              </div>
              <p className="text-xs text-blue-600">
                Out of {fleetMetrics.totalVehicles}
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
                <Route className="w-4 h-4" />
                Distance Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">
                {fleetMetrics.totalDistance} km
              </div>
              <p className="text-xs text-green-600">+8% from yesterday</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-800 flex items-center gap-2">
                <Fuel className="w-4 h-4" />
                Fuel Efficiency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">
                {fleetMetrics.fuelEfficiency}L/100km
              </div>
              <p className="text-xs text-orange-600">Fleet average</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Active Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                {fleetMetrics.alertsCount}
              </div>
              <p className="text-xs text-purple-600">Require attention</p>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Driver Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900">
                {fleetMetrics.driverScore}/100
              </div>
              <p className="text-xs text-red-600">Fleet average</p>
            </CardContent>
          </Card>

          <Card className="border-indigo-200 bg-indigo-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-indigo-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Uptime
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-900">
                {fleetMetrics.uptime}%
              </div>
              <p className="text-xs text-indigo-600">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Vehicle Tracking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Real-Time Vehicle Tracking
            </CardTitle>
            <CardDescription>
              Live GPS tracking with telemetry data and alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="tracking-interval">Update Interval:</Label>
                <Select
                  value={trackingInterval.toString()}
                  onValueChange={(value) => setTrackingInterval(Number(value))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 seconds</SelectItem>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="60">1 minute</SelectItem>
                    <SelectItem value="300">5 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Speed</TableHead>
                    <TableHead>Fuel</TableHead>
                    <TableHead>Engine</TableHead>
                    <TableHead>Route/ETA</TableHead>
                    <TableHead>Alerts</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map((vehicle) => (
                    <TableRow
                      key={vehicle.id}
                      className={
                        selectedVehicle === vehicle.id ? "bg-blue-50" : ""
                      }
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getVehicleIcon(vehicle.type)}
                          <div>
                            <div className="font-medium">{vehicle.id}</div>
                            <div className="text-sm text-gray-500">
                              {vehicle.plateNumber}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {vehicle.driver.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {vehicle.driver.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm font-medium">
                            {vehicle.location.address}
                          </div>
                          <div className="text-xs text-gray-500">
                            {vehicle.location.coordinates.lat.toFixed(4)},{" "}
                            {vehicle.location.coordinates.lng.toFixed(4)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Accuracy: ±{vehicle.location.accuracy}m
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Gauge className="w-3 h-3" />
                          <span
                            className={
                              vehicle.telemetry.speed > 80
                                ? "text-red-600 font-bold"
                                : ""
                            }
                          >
                            {vehicle.telemetry.speed} km/h
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Fuel className="w-3 h-3" />
                          <span
                            className={
                              vehicle.telemetry.fuel < 20
                                ? "text-red-600 font-bold"
                                : ""
                            }
                          >
                            {vehicle.telemetry.fuel.toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs">
                            <Thermometer className="w-3 h-3" />
                            <span
                              className={
                                vehicle.telemetry.engineTemp > 100
                                  ? "text-red-600"
                                  : ""
                              }
                            >
                              {vehicle.telemetry.engineTemp}°C
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            <Battery className="w-3 h-3" />
                            {vehicle.telemetry.batteryVoltage.toFixed(1)}V
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {vehicle.route ? (
                          <div>
                            <div className="text-sm font-medium">
                              {vehicle.route.destination}
                            </div>
                            <div className="text-xs text-gray-500">
                              ETA: {vehicle.route.eta}
                            </div>
                            <div className="text-xs text-gray-500">
                              {vehicle.route.distance} km
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">No active route</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {vehicle.alerts.length > 0 ? (
                          <div className="space-y-1">
                            {vehicle.alerts.slice(0, 2).map((alert) => (
                              <div key={alert.id} className="text-xs">
                                {getAlertSeverityBadge(alert.severity)}
                              </div>
                            ))}
                            {vehicle.alerts.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{vehicle.alerts.length - 2} more
                              </div>
                            )}
                          </div>
                        ) : (
                          <Badge variant="outline">No alerts</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setSelectedVehicle(
                                vehicle.id === selectedVehicle
                                  ? null
                                  : vehicle.id,
                              )
                            }
                          >
                            <MapPin className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEmergencyAlert(vehicle.id)}
                          >
                            <Phone className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Settings className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Selected Vehicle Details */}
        {selectedVehicle && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Vehicle Details: {selectedVehicle}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const vehicle = vehicles.find((v) => v.id === selectedVehicle);
                if (!vehicle) return null;

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold">Vehicle Information</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Type:</span>
                          <span className="font-medium">{vehicle.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Plate Number:</span>
                          <span className="font-medium">
                            {vehicle.plateNumber}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Mileage:</span>
                          <span className="font-medium">
                            {vehicle.telemetry.mileage.toLocaleString()} km
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Engine Hours:</span>
                          <span className="font-medium">
                            {vehicle.telemetry.engineHours.toLocaleString()} h
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold">Driver Information</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Name:</span>
                          <span className="font-medium">
                            {vehicle.driver.name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Phone:</span>
                          <span className="font-medium">
                            {vehicle.driver.phone}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>License:</span>
                          <span className="font-medium">
                            {vehicle.driver.license}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold">Current Telemetry</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Speed:</span>
                          <span className="font-medium">
                            {vehicle.telemetry.speed} km/h
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Heading:</span>
                          <span className="font-medium">
                            {vehicle.telemetry.heading}°
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Altitude:</span>
                          <span className="font-medium">
                            {vehicle.telemetry.altitude} m
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Update:</span>
                          <span className="font-medium">
                            {new Date(
                              vehicle.location.timestamp,
                            ).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
