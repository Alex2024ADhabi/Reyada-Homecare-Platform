import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Car,
  Truck,
  Route,
  Fuel,
  Settings,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  Activity,
  BarChart3,
  Navigation,
  Shield,
  Wrench,
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
} from "lucide-react";

interface Vehicle {
  id: string;
  plateNumber: string;
  type: "ambulance" | "van" | "car" | "motorcycle";
  driver: string;
  status: "active" | "parked" | "maintenance" | "offline";
  location: string;
  fuel: number;
  mileage: number;
  lastService: string;
  nextService: string;
  gpsCoordinates: { lat: number; lng: number };
  speed: number;
  route?: string;
  eta?: string;
}

interface VehicleManagementDashboardProps {
  organizationId?: string;
}

export default function VehicleManagementDashboard({
  organizationId = "RHHCS",
}: VehicleManagementDashboardProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: "HC-001",
      plateNumber: "DXB-A-12345",
      type: "ambulance",
      driver: "Ahmed Al Mansouri",
      status: "active",
      location: "Dubai Healthcare City",
      fuel: 85,
      mileage: 45230,
      lastService: "2024-01-15",
      nextService: "2024-04-15",
      gpsCoordinates: { lat: 25.2048, lng: 55.2708 },
      speed: 45,
      route: "Patient Visit - Al Barsha",
      eta: "15 min",
    },
    {
      id: "HC-002",
      plateNumber: "DXB-B-67890",
      type: "van",
      driver: "Sarah Johnson",
      status: "parked",
      location: "Dubai Mall Parking",
      fuel: 92,
      mileage: 32100,
      lastService: "2024-02-01",
      nextService: "2024-05-01",
      gpsCoordinates: { lat: 25.1972, lng: 55.2796 },
      speed: 0,
    },
    {
      id: "HC-003",
      plateNumber: "DXB-C-11111",
      type: "car",
      driver: "Maria Garcia",
      status: "maintenance",
      location: "Service Center - Al Qusais",
      fuel: 45,
      mileage: 67890,
      lastService: "2024-01-20",
      nextService: "2024-03-20",
      gpsCoordinates: { lat: 25.2854, lng: 55.3644 },
      speed: 0,
    },
  ]);

  const [fleetAnalytics, setFleetAnalytics] = useState({
    totalVehicles: 15,
    activeVehicles: 12,
    totalDistance: 1247,
    averageSpeed: 45,
    fuelConsumption: 106,
    maintenanceDue: 3,
    driverScore: 92,
    routeEfficiency: 12,
    costSavings: 2340,
    emergencyResponse: 8.5,
    realTimeTracking: true,
    geofenceViolations: 2,
    speedingIncidents: 5,
    idleTime: 45, // minutes
    carbonFootprint: 125.5, // kg CO2
    predictiveMaintenance: {
      vehiclesAtRisk: 4,
      potentialSavings: 8500,
      accuracyRate: 94.2,
    },
  });

  const [routeOptimization, setRouteOptimization] = useState({
    optimizedRoutes: 8,
    timeSaved: 45,
    fuelSaved: 12.5,
    distanceReduced: 85,
    co2Reduced: 28.3,
  });

  const [maintenanceSchedule, setMaintenanceSchedule] = useState([
    {
      vehicleId: "HC-003",
      type: "Regular Service",
      dueDate: "2024-03-20",
      priority: "high",
      estimatedCost: 850,
    },
    {
      vehicleId: "HC-007",
      type: "Tire Replacement",
      dueDate: "2024-03-25",
      priority: "medium",
      estimatedCost: 1200,
    },
    {
      vehicleId: "HC-012",
      type: "Oil Change",
      dueDate: "2024-03-30",
      priority: "low",
      estimatedCost: 150,
    },
  ]);

  const getStatusBadge = (status: Vehicle["status"]) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      active: "default",
      parked: "secondary",
      maintenance: "destructive",
      offline: "outline",
    };
    return (
      <Badge variant={variants[status] || "outline"}>
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
    };
    return icons[type] || <Car className="w-5 h-5" />;
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      high: "destructive",
      medium: "secondary",
      low: "default",
    };
    return (
      <Badge variant={variants[priority] || "default"}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              CarTrack Fleet Management
            </h1>
            <p className="text-gray-600 mt-1">
              Real-time vehicle tracking, route optimization, and asset
              management
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              Live Tracking Active
            </Badge>
          </div>
        </div>

        {/* Fleet Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
                <Car className="w-4 h-4" />
                Active Vehicles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                {fleetAnalytics.activeVehicles}
              </div>
              <p className="text-xs text-blue-600">
                Out of {fleetAnalytics.totalVehicles} total
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
                {fleetAnalytics.totalDistance} km
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
                8.5L/100km
              </div>
              <p className="text-xs text-orange-600">Fleet average</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-800 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Maintenance Due
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                {fleetAnalytics.maintenanceDue}
              </div>
              <p className="text-xs text-purple-600">Vehicles</p>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-800 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Cost Savings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900">
                AED {fleetAnalytics.costSavings.toLocaleString()}
              </div>
              <p className="text-xs text-red-600">This month</p>
            </CardContent>
          </Card>

          <Card className="border-indigo-200 bg-indigo-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-indigo-800 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Security Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-900">
                {fleetAnalytics.geofenceViolations}
              </div>
              <p className="text-xs text-indigo-600">Geofence violations</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="tracking" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="tracking">Live Tracking</TabsTrigger>
            <TabsTrigger value="routes">Route Optimization</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="drivers">Driver Management</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Live Tracking Tab */}
          <TabsContent value="tracking" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Real-Time Vehicle Tracking
                </CardTitle>
                <CardDescription>
                  Monitor all vehicles in real-time with GPS tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                        <TableHead>Route/ETA</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vehicles.map((vehicle) => (
                        <TableRow key={vehicle.id}>
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
                          <TableCell>{vehicle.driver}</TableCell>
                          <TableCell>
                            {getStatusBadge(vehicle.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {vehicle.location}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Activity className="w-3 h-3" />
                              {vehicle.speed} km/h
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Fuel className="w-3 h-3" />
                              {vehicle.fuel}%
                            </div>
                          </TableCell>
                          <TableCell>
                            {vehicle.route && (
                              <div>
                                <div className="text-sm font-medium">
                                  {vehicle.route}
                                </div>
                                {vehicle.eta && (
                                  <div className="text-xs text-gray-500">
                                    ETA: {vehicle.eta}
                                  </div>
                                )}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline">
                                <Navigation className="w-3 h-3" />
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
          </TabsContent>

          {/* Route Optimization Tab */}
          <TabsContent value="routes" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-800">
                    Routes Optimized
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900">
                    {routeOptimization.optimizedRoutes}
                  </div>
                  <p className="text-xs text-blue-600">Today</p>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-800">
                    Time Saved
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-900">
                    {routeOptimization.timeSaved} min
                  </div>
                  <p className="text-xs text-green-600">Per route avg</p>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-orange-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-orange-800">
                    Fuel Saved
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-900">
                    {routeOptimization.fuelSaved}L
                  </div>
                  <p className="text-xs text-orange-600">This week</p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-purple-800">
                    Distance Reduced
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900">
                    {routeOptimization.distanceReduced} km
                  </div>
                  <p className="text-xs text-purple-600">This week</p>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-red-800">
                    CO₂ Reduced
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-900">
                    {routeOptimization.co2Reduced} kg
                  </div>
                  <p className="text-xs text-red-600">This week</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Route Optimization Engine</CardTitle>
                <CardDescription>
                  AI-powered route optimization for maximum efficiency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Optimization Factors</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Traffic Conditions:</span>
                        <Badge variant="default">Real-time</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Fuel Efficiency:</span>
                        <Badge variant="default">Optimized</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Patient Priority:</span>
                        <Badge variant="default">High</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Driver Preferences:</span>
                        <Badge variant="secondary">Considered</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold">Today's Optimizations</h3>
                    <div className="space-y-2">
                      <div className="p-3 border rounded-lg">
                        <div className="font-medium text-sm">Route HC-001</div>
                        <div className="text-xs text-gray-600">
                          Saved 12 min, 3.2L fuel
                        </div>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="font-medium text-sm">Route HC-005</div>
                        <div className="text-xs text-gray-600">
                          Saved 8 min, 2.1L fuel
                        </div>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="font-medium text-sm">Route HC-008</div>
                        <div className="text-xs text-gray-600">
                          Saved 15 min, 4.5L fuel
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Maintenance Tab */}
          <TabsContent value="maintenance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="w-5 h-5" />
                  Maintenance Schedule
                </CardTitle>
                <CardDescription>
                  Proactive maintenance scheduling and tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vehicle ID</TableHead>
                        <TableHead>Maintenance Type</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Estimated Cost</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {maintenanceSchedule.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {item.vehicleId}
                          </TableCell>
                          <TableCell>{item.type}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {item.dueDate}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getPriorityBadge(item.priority)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              AED {item.estimatedCost}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline">
                                Schedule
                              </Button>
                              <Button size="sm" variant="outline">
                                Details
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
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Driver Score
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {fleetAnalytics.driverScore}/100
                  </div>
                  <p className="text-xs text-muted-foreground">Fleet average</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Route Efficiency
                  </CardTitle>
                  <Route className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    +{fleetAnalytics.routeEfficiency}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Improvement this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Emergency Response
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {fleetAnalytics.emergencyResponse} min
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Average response time
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Fuel Consumption
                  </CardTitle>
                  <Fuel className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {fleetAnalytics.fuelConsumption}L
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Today's consumption
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Driver Management Tab */}
          <TabsContent value="drivers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Driver Management
                </CardTitle>
                <CardDescription>
                  Monitor driver performance and manage assignments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Driver management features coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Fleet Reports</CardTitle>
                <CardDescription>
                  Generate comprehensive fleet management reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center gap-2"
                  >
                    <BarChart3 className="w-6 h-6" />
                    <span>Fleet Analytics</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center gap-2"
                  >
                    <Fuel className="w-6 h-6" />
                    <span>Fuel Report</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center gap-2"
                  >
                    <Wrench className="w-6 h-6" />
                    <span>Maintenance Report</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
