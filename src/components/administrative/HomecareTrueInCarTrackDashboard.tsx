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
import { Progress } from "@/components/ui/progress";
import {
  MapPin,
  Clock,
  Users,
  Car,
  Truck,
  Route,
  Fuel,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  BarChart3,
  Navigation,
  Shield,
  Fingerprint,
  Camera,
  Smartphone,
  Wifi,
  WifiOff,
  Calendar,
  TrendingUp,
  DollarSign,
  Wrench,
  Bell,
  Phone,
  MessageSquare,
  UserCheck,
  MapIcon,
  Zap,
  Brain,
  Target,
  Gauge,
  RefreshCw,
  AlertCircle,
  Eye,
  Loader2,
} from "lucide-react";

interface StaffMember {
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
  currentPatient?: {
    id: string;
    name: string;
    address: string;
    visitType: string;
    eta: string;
  };
  biometricAuth: {
    lastAuth: string;
    authScore: number;
    method: string;
  };
  vehicle?: {
    id: string;
    type: string;
    fuel: number;
    status: string;
  };
  schedule: {
    shift: string;
    nextVisit: string;
    totalVisits: number;
    completedVisits: number;
  };
}

interface EmergencyAlert {
  id: string;
  type: "medical" | "staff" | "vehicle" | "security";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  location: string;
  timestamp: string;
  assignedStaff?: string[];
  status: "active" | "responding" | "resolved";
  responseTime?: number;
}

interface HomecareTrueInCarTrackDashboardProps {
  organizationId?: string;
}

export default function HomecareTrueInCarTrackDashboard({
  organizationId = "RHHCS",
}: HomecareTrueInCarTrackDashboardProps) {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([
    {
      id: "STAFF-001",
      name: "Dr. Sarah Ahmed",
      role: "Senior Nurse",
      status: "on_duty",
      location: {
        lat: 25.2048,
        lng: 55.2708,
        address: "Dubai Healthcare City",
        timestamp: new Date().toISOString(),
      },
      currentPatient: {
        id: "PAT-001",
        name: "Ahmed Al Mansouri",
        address: "Al Barsha, Dubai",
        visitType: "Wound Care",
        eta: "15 min",
      },
      biometricAuth: {
        lastAuth: new Date(Date.now() - 300000).toLocaleTimeString(),
        authScore: 98.5,
        method: "Fingerprint",
      },
      vehicle: {
        id: "HC-001",
        type: "ambulance",
        fuel: 85,
        status: "active",
      },
      schedule: {
        shift: "Morning",
        nextVisit: "10:30 AM",
        totalVisits: 8,
        completedVisits: 3,
      },
    },
    {
      id: "STAFF-002",
      name: "Ahmed Al Mansouri",
      role: "Physical Therapist",
      status: "traveling",
      location: {
        lat: 25.1972,
        lng: 55.2796,
        address: "Dubai Mall Area",
        timestamp: new Date().toISOString(),
      },
      currentPatient: {
        id: "PAT-002",
        name: "Maria Garcia",
        address: "Jumeirah, Dubai",
        visitType: "Physical Therapy",
        eta: "8 min",
      },
      biometricAuth: {
        lastAuth: new Date(Date.now() - 600000).toLocaleTimeString(),
        authScore: 96.8,
        method: "Face Recognition",
      },
      vehicle: {
        id: "HC-002",
        type: "van",
        fuel: 92,
        status: "active",
      },
      schedule: {
        shift: "Morning",
        nextVisit: "11:00 AM",
        totalVisits: 6,
        completedVisits: 2,
      },
    },
    {
      id: "STAFF-003",
      name: "Maria Garcia",
      role: "Occupational Therapist",
      status: "break",
      location: {
        lat: 25.2854,
        lng: 55.3644,
        address: "Al Qusais, Dubai",
        timestamp: new Date().toISOString(),
      },
      biometricAuth: {
        lastAuth: new Date(Date.now() - 900000).toLocaleTimeString(),
        authScore: 94.2,
        method: "Fingerprint",
      },
      schedule: {
        shift: "Morning",
        nextVisit: "12:00 PM",
        totalVisits: 5,
        completedVisits: 2,
      },
    },
  ]);

  const [emergencyAlerts, setEmergencyAlerts] = useState<EmergencyAlert[]>([
    {
      id: "EMR-001",
      type: "medical",
      severity: "critical",
      description: "Patient experiencing respiratory distress",
      location: "Al Barsha, Dubai",
      timestamp: new Date(Date.now() - 300000).toISOString(),
      assignedStaff: ["STAFF-001"],
      status: "responding",
      responseTime: 12,
    },
    {
      id: "EMR-002",
      type: "vehicle",
      severity: "medium",
      description: "Vehicle HC-003 breakdown reported",
      location: "Sheikh Zayed Road",
      timestamp: new Date(Date.now() - 600000).toISOString(),
      status: "active",
    },
  ]);

  const [operationalMetrics, setOperationalMetrics] = useState({
    totalStaff: 24,
    activeStaff: 18,
    onTimeArrivals: 94.5,
    patientSatisfaction: 96.8,
    emergencyResponseTime: 8.5,
    fuelEfficiency: 12.3,
    routeOptimization: 18.7,
    biometricCompliance: 98.2,
    geofenceCompliance: 96.5,
    vehicleUtilization: 87.3,
    costSavings: 15420,
    aiOptimizationScore: 92.4,
  });

  const [aiInsights, setAiInsights] = useState({
    predictiveAlerts: [
      "Staff member STAFF-003 likely to be late for next appointment based on current location",
      "Vehicle HC-002 due for maintenance in 3 days based on usage patterns",
      "High patient demand expected in Al Barsha area between 2-4 PM",
    ],
    optimizationSuggestions: [
      "Reassign 2 visits from STAFF-001 to STAFF-004 to balance workload",
      "Optimize route for STAFF-002 to save 15 minutes travel time",
      "Deploy backup staff to Jumeirah area for emergency coverage",
    ],
    riskAssessments: [
      {
        type: "Staff Fatigue",
        level: "Medium",
        affected: 3,
        recommendation: "Schedule additional breaks",
      },
      {
        type: "Vehicle Maintenance",
        level: "High",
        affected: 2,
        recommendation: "Schedule immediate inspection",
      },
    ],
  });

  const [realTimeUpdates, setRealTimeUpdates] = useState({
    lastUpdate: new Date().toLocaleTimeString(),
    activeConnections: 24,
    dataLatency: 1.2,
    systemHealth: 98.7,
  });

  const getStatusBadge = (status: StaffMember["status"]) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      on_duty: "default",
      traveling: "secondary",
      break: "outline",
      emergency: "destructive",
      off_duty: "secondary",
    };
    return (
      <Badge variant={variants[status] || "outline"}>
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  const getSeverityBadge = (severity: EmergencyAlert["severity"]) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      low: "secondary",
      medium: "default",
      high: "destructive",
      critical: "destructive",
    };
    return (
      <Badge variant={variants[severity] || "secondary"}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const handleEmergencyResponse = (alertId: string, staffId: string) => {
    setEmergencyAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId
          ? {
              ...alert,
              status: "responding",
              assignedStaff: [...(alert.assignedStaff || []), staffId],
            }
          : alert,
      ),
    );

    setStaffMembers((prev) =>
      prev.map((staff) =>
        staff.id === staffId ? { ...staff, status: "emergency" } : staff,
      ),
    );
  };

  const optimizeRoutes = () => {
    // AI-powered route optimization simulation
    setOperationalMetrics((prev) => ({
      ...prev,
      routeOptimization: prev.routeOptimization + 2.5,
      costSavings: prev.costSavings + 500,
    }));
  };

  const validateStaffLocation = (staffId: string) => {
    const staff = staffMembers.find((s) => s.id === staffId);
    if (staff?.currentPatient) {
      // Simulate geofence validation
      const isAtPatientLocation = Math.random() > 0.2; // 80% success rate
      return isAtPatientLocation;
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-8 h-8 text-blue-600" />
              Reyada Homecare Operations Center
            </h1>
            <p className="text-gray-600 mt-1">
              Integrated TrueIn & CarTrack Platform - Real-time Staff & Asset Management
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              Live Tracking: {realTimeUpdates.activeConnections} Connected
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              AI Optimization: {operationalMetrics.aiOptimizationScore}%
            </Badge>
          </div>
        </div>

        {/* Real-time Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Active Staff
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                {operationalMetrics.activeStaff}
              </div>
              <p className="text-xs text-blue-600">
                Out of {operationalMetrics.totalStaff} total
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                On-Time Arrivals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">
                {operationalMetrics.onTimeArrivals}%
              </div>
              <p className="text-xs text-green-600">This week</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-800 flex items-center gap-2">
                <Fingerprint className="w-4 h-4" />
                Biometric Auth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                {operationalMetrics.biometricCompliance}%
              </div>
              <p className="text-xs text-purple-600">Compliance</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Emergency Response
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">
                {operationalMetrics.emergencyResponseTime}m
              </div>
              <p className="text-xs text-orange-600">Avg Response</p>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-800 flex items-center gap-2">
                <Route className="w-4 h-4" />
                Route Efficiency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900">
                +{operationalMetrics.routeOptimization}%
              </div>
              <p className="text-xs text-red-600">Optimization</p>
            </CardContent>
          </Card>

          <Card className="border-indigo-200 bg-indigo-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-indigo-800 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Cost Savings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-900">
                AED {operationalMetrics.costSavings.toLocaleString()}
              </div>
              <p className="text-xs text-indigo-600">This month</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="live-operations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="live-operations">Live Operations</TabsTrigger>
            <TabsTrigger value="staff-tracking">Staff Tracking</TabsTrigger>
            <TabsTrigger value="emergency-center">Emergency Center</TabsTrigger>
            <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
            <TabsTrigger value="fleet-management">Fleet Management</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Live Operations Tab */}
          <TabsContent value="live-operations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Real-Time Staff Locations
                  </CardTitle>
                  <CardDescription>
                    Live tracking with patient location validation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {staffMembers.map((staff) => (
                      <div key={staff.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <UserCheck className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium">{staff.name}</div>
                              <div className="text-sm text-gray-600">
                                {staff.role}
                              </div>
                            </div>
                          </div>
                          {getStatusBadge(staff.status)}
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Location:</span>
                            <div className="font-medium">
                              {staff.location.address}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Last Auth:</span>
                            <div className="font-medium">
                              {staff.biometricAuth.lastAuth} ({staff.biometricAuth.authScore}%)
                            </div>
                          </div>
                        </div>

                        {staff.currentPatient && (
                          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="text-sm font-medium text-green-800">
                              Current Patient: {staff.currentPatient.name}
                            </div>
                            <div className="text-xs text-green-600">
                              {staff.currentPatient.visitType} • ETA: {staff.currentPatient.eta}
                            </div>
                          </div>
                        )}

                        <div className="mt-3 flex gap-2">
                          <Button size="sm" variant="outline">
                            <MapIcon className="w-3 h-3 mr-1" />
                            Track
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => validateStaffLocation(staff.id)}
                          >
                            <Target className="w-3 h-3 mr-1" />
                            Validate Location
                          </Button>
                          <Button size="sm" variant="outline">
                            <Phone className="w-3 h-3 mr-1" />
                            Contact
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Today's Schedule Overview
                  </CardTitle>
                  <CardDescription>
                    Real-time schedule tracking and optimization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {staffMembers.map((staff) => (
                      <div key={staff.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="font-medium">{staff.name}</div>
                          <Badge variant="outline">{staff.schedule.shift}</Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress:</span>
                            <span>
                              {staff.schedule.completedVisits}/{staff.schedule.totalVisits} visits
                            </span>
                          </div>
                          <Progress 
                            value={(staff.schedule.completedVisits / staff.schedule.totalVisits) * 100} 
                            className="h-2"
                          />
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Next Visit:</span>
                            <span>{staff.schedule.nextVisit}</span>
                          </div>
                        </div>

                        {staff.vehicle && (
                          <div className="mt-3 flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Car className="w-3 h-3" />
                              {staff.vehicle.id}
                            </div>
                            <div className="flex items-center gap-1">
                              <Fuel className="w-3 h-3" />
                              {staff.vehicle.fuel}%
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Staff Tracking Tab */}
          <TabsContent value="staff-tracking" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fingerprint className="w-5 h-5" />
                  Advanced Staff Tracking & Authentication
                </CardTitle>
                <CardDescription>
                  TrueIn biometric authentication with geofencing validation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Staff Member</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Biometric Auth</TableHead>
                        <TableHead>Geofence Status</TableHead>
                        <TableHead>Patient Validation</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {staffMembers.map((staff) => (
                        <TableRow key={staff.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{staff.name}</div>
                              <div className="text-sm text-gray-500">{staff.role}</div>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(staff.status)}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{staff.location.address}</div>
                              <div className="text-gray-500">
                                {staff.location.lat.toFixed(4)}, {staff.location.lng.toFixed(4)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-green-600" />
                                {staff.biometricAuth.authScore}%
                              </div>
                              <div className="text-gray-500">
                                {staff.biometricAuth.method} • {staff.biometricAuth.lastAuth}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="default">
                              <MapPin className="w-3 h-3 mr-1" />
                              Inside Zone
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {staff.currentPatient ? (
                              <Badge variant="default">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Validated
                              </Badge>
                            ) : (
                              <Badge variant="secondary">N/A</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline">
                                <Eye className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <MessageSquare className="w-3 h-3" />
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

          {/* Emergency Center Tab */}
          <TabsContent value="emergency-center" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Active Emergency Alerts
                  </CardTitle>
                  <CardDescription>
                    Real-time emergency response coordination
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {emergencyAlerts.map((alert) => (
                      <div key={alert.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            <span className="font-medium">{alert.type.toUpperCase()}</span>
                          </div>
                          {getSeverityBadge(alert.severity)}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-sm font-medium">{alert.description}</div>
                          <div className="text-sm text-gray-600">
                            <MapPin className="w-3 h-3 inline mr-1" />
                            {alert.location}
                          </div>
                          <div className="text-sm text-gray-600">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {new Date(alert.timestamp).toLocaleTimeString()}
                          </div>
                        </div>

                        {alert.assignedStaff && alert.assignedStaff.length > 0 && (
                          <div className="mt-3">
                            <div className="text-sm font-medium mb-1">Assigned Staff:</div>
                            <div className="flex gap-1">
                              {alert.assignedStaff.map((staffId) => {
                                const staff = staffMembers.find(s => s.id === staffId);
                                return (
                                  <Badge key={staffId} variant="outline">
                                    {staff?.name || staffId}
                                  </Badge>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div className="mt-3 flex gap-2">
                          <Button size="sm" variant="destructive">
                            <Bell className="w-3 h-3 mr-1" />
                            Escalate
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEmergencyResponse(alert.id, "STAFF-001")}
                          >
                            <Users className="w-3 h-3 mr-1" />
                            Assign Staff
                          </Button>
                          <Button size="sm" variant="outline">
                            <Phone className="w-3 h-3 mr-1" />
                            Contact
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Emergency Response Protocols
                  </CardTitle>
                  <CardDescription>
                    Automated response procedures and escalation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="font-medium text-red-800 mb-2">Critical Response (< 15 min)</div>
                      <ul className="text-sm text-red-700 space-y-1">
                        <li>• Immediate staff dispatch</li>
                        <li>• Supervisor notification</li>
                        <li>• Emergency services alert</li>
                        <li>• Family notification</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="font-medium text-orange-800 mb-2">High Priority (< 30 min)</div>
                      <ul className="text-sm text-orange-700 space-y-1">
                        <li>• Nearest staff assignment</li>
                        <li>• Route optimization</li>
                        <li>• Backup staff alert</li>
                        <li>• Progress monitoring</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="font-medium text-yellow-800 mb-2">Standard Response (< 2 hours)</div>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Schedule adjustment</li>
                        <li>• Resource allocation</li>
                        <li>• Patient communication</li>
                        <li>• Documentation update</li>
                      </ul>
                    </div>

                    <div className="mt-4">
                      <Button className="w-full" variant="destructive">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Trigger Emergency Protocol
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="ai-insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    AI-Powered Predictive Insights
                  </CardTitle>
                  <CardDescription>
                    Machine learning predictions and recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Predictive Alerts</h4>
                      <div className="space-y-2">
                        {aiInsights.predictiveAlerts.map((alert, index) => (
                          <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                              <span className="text-sm text-blue-800">{alert}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Optimization Suggestions</h4>
                      <div className="space-y-2">
                        {aiInsights.optimizationSuggestions.map((suggestion, index) => (
                          <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-start gap-2">
                              <TrendingUp className="w-4 h-4 text-green-600 mt-0.5" />
                              <span className="text-sm text-green-800">{suggestion}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gauge className="w-5 h-5" />
                    Risk Assessment Dashboard
                  </CardTitle>
                  <CardDescription>
                    Real-time risk monitoring and mitigation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {aiInsights.riskAssessments.map((risk, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{risk.type}</span>
                          <Badge 
                            variant={risk.level === "High" ? "destructive" : risk.level === "Medium" ? "secondary" : "default"}
                          >
                            {risk.level}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          Affected: {risk.affected} staff members
                        </div>
                        <div className="text-sm font-medium text-blue-600">
                          Recommendation: {risk.recommendation}
                        </div>
                      </div>
                    ))}

                    <div className="mt-4">
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={optimizeRoutes}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Apply AI Optimizations
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Fleet Management Tab */}
          <TabsContent value="fleet-management" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  CarTrack Fleet Management Integration
                </CardTitle>
                <CardDescription>
                  Real-time vehicle tracking and optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-blue-800">
                        Active Vehicles
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-900">12</div>
                      <p className="text-xs text-blue-600">Out of 15 total</p>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200 bg-green-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-green-800">
                        Fuel Efficiency
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-900">
                        {operationalMetrics.fuelEfficiency}L
                      </div>
                      <p className="text-xs text-green-600">Per 100km avg</p>
                    </CardContent>
                  </Card>

                  <Card className="border-orange-200 bg-orange-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-orange-800">
                        Vehicle Utilization
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-900">
                        {operationalMetrics.vehicleUtilization}%
                      </div>
                      <p className="text-xs text-orange-600">Fleet average</p>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-200 bg-purple-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-purple-800">
                        Maintenance Due
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-900">3</div>
                      <p className="text-xs text-purple-600">Vehicles</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="text-center py-8 text-gray-500">
                  <Car className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Detailed fleet management features integrated with CarTrack system</p>
                  <p className="text-sm">Real-time GPS tracking, route optimization, and predictive maintenance</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  DOH Compliance & Regulatory Monitoring
                </CardTitle>
                <CardDescription>
                  Real-time compliance tracking and automated reporting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-green-800">
                        Staff Authentication
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-900">
                        {operationalMetrics.biometricCompliance}%
                      </div>
                      <p className="text-xs text-green-600">Biometric compliance</p>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-blue-800">
                        Location Validation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-900">
                        {operationalMetrics.geofenceCompliance}%
                      </div>
                      <p className="text-xs text-blue-600">Geofence compliance</p>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-200 bg-purple-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-purple-800">
                        Patient Satisfaction
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-900">
                        {operationalMetrics.patientSatisfaction}%
                      </div>
                      <p className="text-xs text-purple-600">Overall rating</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Comprehensive Analytics Dashboard
                </CardTitle>
                <CardDescription>
                  Advanced analytics and performance insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">System Health</CardTitle>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{realTimeUpdates.systemHealth}%</div>
                      <p className="text-xs text-muted-foreground">Overall system performance</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Data Latency</CardTitle>
                      <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{realTimeUpdates.dataLatency}s</div>
                      <p className="text-xs text-muted-foreground">Average response time</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">AI Optimization</CardTitle>
                      <Brain className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{operationalMetrics.aiOptimizationScore}%</div>
                      <p className="text-xs text-muted-foreground">ML model accuracy</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Cost Efficiency</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">+{operationalMetrics.routeOptimization}%</div>
                      <p className="text-xs text-muted-foreground">Operational savings</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
