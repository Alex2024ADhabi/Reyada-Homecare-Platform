import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Truck,
  MapPin,
  Route,
  Fuel,
  Settings,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  Navigation,
  Activity,
  TrendingUp,
  Shield,
} from "lucide-react";
import LogisticsManagement from "./LogisticsManagement";
import { logisticsManagementService } from "@/services/logistics-management.service";

interface LogisticsAnalytics {
  fleetMetrics: {
    totalVehicles: number;
    activeVehicles: number;
    utilizationRate: number;
    maintenanceDue: number;
  };
  routeMetrics: {
    totalRoutes: number;
    completedRoutes: number;
    completionRate: number;
    averageDelay: number;
  };
  fuelMetrics: {
    totalConsumption: number;
    averageEfficiency: number;
    costSavings: number;
  };
  maintenanceMetrics: {
    scheduledServices: number;
    completedServices: number;
    totalCost: number;
    upcomingServices: number;
  };
}

interface LogisticsManagementDashboardProps {
  organizationId?: string;
}

export default function LogisticsManagementDashboard({
  organizationId = "RHHCS",
}: LogisticsManagementDashboardProps) {
  const [analytics, setAnalytics] = useState<LogisticsAnalytics>({
    fleetMetrics: {
      totalVehicles: 15,
      activeVehicles: 12,
      utilizationRate: 80.0,
      maintenanceDue: 3,
    },
    routeMetrics: {
      totalRoutes: 45,
      completedRoutes: 42,
      completionRate: 93.3,
      averageDelay: 8.5,
    },
    fuelMetrics: {
      totalConsumption: 1250.5,
      averageEfficiency: 12.8,
      costSavings: 15.2,
    },
    maintenanceMetrics: {
      scheduledServices: 8,
      completedServices: 6,
      totalCost: 12500,
      upcomingServices: 4,
    },
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [organizationId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await logisticsManagementService.getLogisticsAnalytics({
        organizationId,
        dateRange: {
          from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          to: new Date().toISOString(),
        },
      });
      setAnalytics(data);
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Truck className="w-8 h-8 text-blue-600" />
              Logistics Management Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Comprehensive fleet management and route optimization
            </p>
          </div>
        </div>

        <Tabs defaultValue="fleet-overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="fleet-overview">Fleet Overview</TabsTrigger>
            <TabsTrigger value="route-management">Route Management</TabsTrigger>
            <TabsTrigger value="vehicle-tracking">Vehicle Tracking</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="fuel-management">Fuel Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Fleet Overview Tab */}
          <TabsContent value="fleet-overview">
            <LogisticsManagement organizationId={organizationId} />
          </TabsContent>

          {/* Route Management Tab */}
          <TabsContent value="route-management" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Route className="w-5 h-5" />
                    Route Performance
                  </CardTitle>
                  <CardDescription>
                    Daily route completion and efficiency metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {analytics.routeMetrics.completedRoutes}
                        </div>
                        <div className="text-sm text-gray-600">
                          Completed Routes
                        </div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {analytics.routeMetrics.completionRate}%
                        </div>
                        <div className="text-sm text-gray-600">
                          Completion Rate
                        </div>
                      </div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-lg font-semibold text-yellow-700">
                        Average Delay: {analytics.routeMetrics.averageDelay} min
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Navigation className="w-5 h-5" />
                    Route Optimization
                  </CardTitle>
                  <CardDescription>
                    AI-powered route optimization insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm font-medium">Time Savings</span>
                      <span className="text-green-600 font-bold">18.5%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm font-medium">Fuel Savings</span>
                      <span className="text-green-600 font-bold">15.2%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm font-medium">
                        Cost Reduction
                      </span>
                      <span className="text-green-600 font-bold">
                        AED 2,450
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Vehicle Tracking Tab */}
          <TabsContent value="vehicle-tracking" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Real-Time Vehicle Tracking
                </CardTitle>
                <CardDescription>
                  Live vehicle locations and status monitoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Real-time vehicle tracking interface</p>
                  <p className="text-sm">
                    GPS tracking, geofencing, and live location updates
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Maintenance Tab */}
          <TabsContent value="maintenance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Maintenance Schedule
                  </CardTitle>
                  <CardDescription>
                    Upcoming and overdue maintenance services
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {analytics.maintenanceMetrics.upcomingServices}
                        </div>
                        <div className="text-sm text-gray-600">
                          Upcoming Services
                        </div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {analytics.fleetMetrics.maintenanceDue}
                        </div>
                        <div className="text-sm text-gray-600">
                          Overdue Services
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Maintenance Costs
                  </CardTitle>
                  <CardDescription>
                    Monthly maintenance expenditure tracking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-4">
                    <div className="text-3xl font-bold text-blue-600">
                      AED{" "}
                      {analytics.maintenanceMetrics.totalCost.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      Total Monthly Cost
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Fuel Management Tab */}
          <TabsContent value="fuel-management" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Fuel className="w-5 h-5" />
                    Fuel Consumption
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {analytics.fuelMetrics.totalConsumption}L
                    </div>
                    <div className="text-sm text-gray-600">This Month</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Efficiency
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {analytics.fuelMetrics.averageEfficiency} km/L
                    </div>
                    <div className="text-sm text-gray-600">Average</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Cost Savings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {analytics.fuelMetrics.costSavings}%
                    </div>
                    <div className="text-sm text-gray-600">vs Last Month</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Fleet Utilization
                  </CardTitle>
                  <CardDescription>
                    Vehicle utilization and efficiency metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Total Vehicles
                      </span>
                      <span className="font-bold">
                        {analytics.fleetMetrics.totalVehicles}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Active Vehicles
                      </span>
                      <span className="font-bold text-green-600">
                        {analytics.fleetMetrics.activeVehicles}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Utilization Rate
                      </span>
                      <span className="font-bold text-blue-600">
                        {analytics.fleetMetrics.utilizationRate}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Compliance Status
                  </CardTitle>
                  <CardDescription>
                    DOH compliance and regulatory status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">Vehicle Registration</span>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">Insurance Coverage</span>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">Safety Inspections</span>
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
