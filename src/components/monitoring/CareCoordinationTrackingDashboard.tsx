import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  MessageSquare,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Bell,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Heart,
  Shield,
  FileText,
  Calendar,
  Phone,
  Mail,
  Video,
  UserCheck,
  ArrowRight,
  Star,
} from "lucide-react";

interface CareCoordinationPlan {
  id: string;
  patientId: string;
  patientName: string;
  patientMRN: string;
  primaryDiagnosis: string;
  careLevel: "low" | "moderate" | "high" | "complex";
  coordinationStatus: "active" | "transitioning" | "completed" | "suspended";
  assignedCoordinator: {
    name: string;
    role: string;
    contactInfo: {
      phone: string;
      email: string;
    };
  };
  careTeam: {
    id: string;
    name: string;
    role: string;
    specialty?: string;
    lastContact: Date;
  }[];
  careGoals: {
    id: string;
    description: string;
    status: "not_started" | "in_progress" | "achieved" | "modified" | "discontinued";
    priority: "low" | "medium" | "high" | "critical";
    targetDate: Date;
  }[];
  qualityMetrics: {
    coordinationScore: number;
    communicationEffectiveness: number;
    transitionSuccess: number;
    patientSatisfaction: number;
    outcomeAchievement: number;
  };
  dohCompliance: {
    reportingStatus: "compliant" | "at_risk" | "non_compliant";
    complianceScore: number;
  };
  lastUpdated: Date;
}

interface CoordinationAlert {
  id: string;
  timestamp: Date;
  type: "communication_gap" | "transition_delay" | "goal_deviation" | "compliance_risk" | "quality_concern";
  severity: "low" | "medium" | "high" | "critical";
  patientName: string;
  description: string;
  status: "active" | "acknowledged" | "resolved" | "escalated";
  assignedTo: string[];
}

interface CoordinationMetrics {
  totalActivePlans: number;
  averageCoordinationScore: number;
  communicationEffectiveness: number;
  goalAchievementRate: number;
  patientSatisfactionScore: number;
  dohComplianceRate: number;
  jawdaAlignmentScore: number;
  alertResolutionTime: number;
}

const CareCoordinationTrackingDashboard: React.FC<{
  className?: string;
}> = ({ className = "" }) => {
  const [coordinationPlans, setCoordinationPlans] = useState<CareCoordinationPlan[]>([]);
  const [alerts, setAlerts] = useState<CoordinationAlert[]>([]);
  const [metrics, setMetrics] = useState<CoordinationMetrics | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const refreshData = async () => {
    setIsRefreshing(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mockPlans: CareCoordinationPlan[] = [
      {
        id: "coord_001",
        patientId: "patient_001",
        patientName: "Ahmed Al-Rashid",
        patientMRN: "MRN001234",
        primaryDiagnosis: "Diabetes Mellitus Type 2 with complications",
        careLevel: "high",
        coordinationStatus: "active",
        assignedCoordinator: {
          name: "Fatima Al-Zahra",
          role: "Care Coordinator",
          contactInfo: {
            phone: "+971-50-123-4567",
            email: "fatima.alzahra@facility.ae",
          },
        },
        careTeam: [
          {
            id: "physician_001",
            name: "Dr. Mohammed Hassan",
            role: "Primary Physician",
            specialty: "Internal Medicine",
            lastContact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          },
          {
            id: "endocrinologist_001",
            name: "Dr. Aisha Al-Mansoori",
            role: "Specialist",
            specialty: "Endocrinology",
            lastContact: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
          {
            id: "nurse_001",
            name: "Mariam Al-Qasimi",
            role: "Registered Nurse",
            lastContact: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          },
        ],
        careGoals: [
          {
            id: "goal_001",
            description: "Achieve HbA1c level below 7%",
            status: "in_progress",
            priority: "high",
            targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          },
          {
            id: "goal_002",
            description: "Maintain blood pressure below 130/80",
            status: "achieved",
            priority: "medium",
            targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          },
        ],
        qualityMetrics: {
          coordinationScore: 85,
          communicationEffectiveness: 90,
          transitionSuccess: 100,
          patientSatisfaction: 88,
          outcomeAchievement: 75,
        },
        dohCompliance: {
          reportingStatus: "compliant",
          complianceScore: 95,
        },
        lastUpdated: new Date(),
      },
      {
        id: "coord_002",
        patientId: "patient_002",
        patientName: "Sarah Al-Mahmoud",
        patientMRN: "MRN002345",
        primaryDiagnosis: "Chronic Heart Failure",
        careLevel: "complex",
        coordinationStatus: "active",
        assignedCoordinator: {
          name: "Omar Al-Rashid",
          role: "Senior Care Coordinator",
          contactInfo: {
            phone: "+971-50-234-5678",
            email: "omar.alrashid@facility.ae",
          },
        },
        careTeam: [
          {
            id: "cardiologist_001",
            name: "Dr. Khalid Al-Zaabi",
            role: "Specialist",
            specialty: "Cardiology",
            lastContact: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          },
          {
            id: "nurse_002",
            name: "Layla Al-Hashimi",
            role: "Cardiac Nurse",
            lastContact: new Date(Date.now() - 12 * 60 * 60 * 1000),
          },
        ],
        careGoals: [
          {
            id: "goal_003",
            description: "Improve ejection fraction to >40%",
            status: "in_progress",
            priority: "critical",
            targetDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
          },
        ],
        qualityMetrics: {
          coordinationScore: 92,
          communicationEffectiveness: 95,
          transitionSuccess: 88,
          patientSatisfaction: 91,
          outcomeAchievement: 82,
        },
        dohCompliance: {
          reportingStatus: "compliant",
          complianceScore: 98,
        },
        lastUpdated: new Date(),
      },
      {
        id: "coord_003",
        patientId: "patient_003",
        patientName: "Hassan Al-Nouri",
        patientMRN: "MRN003456",
        primaryDiagnosis: "Post-surgical rehabilitation",
        careLevel: "moderate",
        coordinationStatus: "transitioning",
        assignedCoordinator: {
          name: "Amal Al-Suwaidi",
          role: "Care Coordinator",
          contactInfo: {
            phone: "+971-50-345-6789",
            email: "amal.alsuwaidi@facility.ae",
          },
        },
        careTeam: [
          {
            id: "surgeon_001",
            name: "Dr. Rashid Al-Maktoum",
            role: "Surgeon",
            specialty: "Orthopedic Surgery",
            lastContact: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          },
          {
            id: "physiotherapist_001",
            name: "Nadia Al-Falasi",
            role: "Physiotherapist",
            lastContact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          },
        ],
        careGoals: [
          {
            id: "goal_004",
            description: "Achieve full range of motion",
            status: "in_progress",
            priority: "high",
            targetDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
          },
        ],
        qualityMetrics: {
          coordinationScore: 78,
          communicationEffectiveness: 82,
          transitionSuccess: 95,
          patientSatisfaction: 85,
          outcomeAchievement: 68,
        },
        dohCompliance: {
          reportingStatus: "at_risk",
          complianceScore: 72,
        },
        lastUpdated: new Date(),
      },
    ];

    const mockAlerts: CoordinationAlert[] = [
      {
        id: "alert_001",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        type: "communication_gap",
        severity: "medium",
        patientName: "Hassan Al-Nouri",
        description: "No communication recorded with orthopedic surgeon in the last 5 days. Follow-up required.",
        status: "active",
        assignedTo: ["Amal Al-Suwaidi"],
      },
      {
        id: "alert_002",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        type: "compliance_risk",
        severity: "high",
        patientName: "Hassan Al-Nouri",
        description: "DOH compliance score below threshold (72%). Immediate review required.",
        status: "acknowledged",
        assignedTo: ["Amal Al-Suwaidi", "Quality Team"],
      },
    ];

    const mockMetrics: CoordinationMetrics = {
      totalActivePlans: 3,
      averageCoordinationScore: 85,
      communicationEffectiveness: 89,
      goalAchievementRate: 75,
      patientSatisfactionScore: 88,
      dohComplianceRate: 89,
      jawdaAlignmentScore: 87,
      alertResolutionTime: 4.2,
    };

    setCoordinationPlans(mockPlans);
    setAlerts(mockAlerts);
    setMetrics(mockMetrics);
    setLastUpdate(new Date());
    setIsRefreshing(false);
  };

  useEffect(() => {
    refreshData();

    // Auto-refresh every 2 minutes
    const interval = setInterval(refreshData, 120000);
    return () => clearInterval(interval);
  }, []);

  const getCareLevel Color = (level: string) => {
    switch (level) {
      case "complex":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "moderate":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-green-100 text-green-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "transitioning":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case "compliant":
        return "bg-green-100 text-green-800";
      case "at_risk":
        return "bg-yellow-100 text-yellow-800";
      case "non_compliant":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getAlertStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-red-100 text-red-800";
      case "acknowledged":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "escalated":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getGoalStatusIcon = (status: string) => {
    switch (status) {
      case "achieved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "not_started":
        return <Target className="h-4 w-4 text-gray-500" />;
      case "modified":
        return <RefreshCw className="h-4 w-4 text-orange-500" />;
      case "discontinued":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredPlans = selectedFilter === "all" 
    ? coordinationPlans 
    : coordinationPlans.filter(plan => plan.coordinationStatus === selectedFilter);

  const activeAlerts = alerts.filter(alert => alert.status === "active");
  const criticalAlerts = alerts.filter(alert => alert.severity === "critical");
  const compliantPlans = coordinationPlans.filter(plan => plan.dohCompliance.reportingStatus === "compliant");

  if (!metrics) {
    return (
      <div className={`bg-white p-8 ${className}`}>
        <div className="flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-lg">Loading care coordination data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-8 w-8 text-blue-600" />
            Care Coordination Tracking
          </h1>
          <p className="text-gray-600 mt-2">
            Comprehensive care coordination monitoring with real-time tracking and DOH compliance
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
          <Button
            onClick={refreshData}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalActivePlans}</div>
            <p className="text-xs text-muted-foreground">
              Coordination plans in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coordination Score</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageCoordinationScore}%</div>
            <p className="text-xs text-muted-foreground">
              Average coordination effectiveness
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {activeAlerts.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Requiring immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DOH Compliance</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics.dohComplianceRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              Plans meeting DOH standards
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-red-500" />
              Active Care Coordination Alerts
            </CardTitle>
            <CardDescription>
              Care coordination issues requiring immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeAlerts.map((alert) => (
                <Alert
                  key={alert.id}
                  className={getSeverityColor(alert.severity)}
                >
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{alert.patientName}</div>
                        <div className="text-sm">{alert.description}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {alert.timestamp.toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <Badge className={getAlertStatusColor(alert.status)}>
                          {alert.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="plans">Coordination Plans</TabsTrigger>
          <TabsTrigger value="metrics">Quality Metrics</TabsTrigger>
          <TabsTrigger value="compliance">DOH Compliance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-6">
          {/* Status Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">Filter by status:</span>
            <Button
              variant={selectedFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter("all")}
            >
              All
            </Button>
            {["active", "transitioning", "completed", "suspended"].map((status) => (
              <Button
                key={status}
                variant={selectedFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter(status)}
                className="capitalize"
              >
                {status}
              </Button>
            ))}
          </div>

          {/* Coordination Plans Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPlans.map((plan) => (
              <Card key={plan.id} className="relative">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-semibold">{plan.patientName}</div>
                      <div className="text-sm text-gray-500">{plan.patientMRN}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getCareLevel Color(plan.careLevel)}>
                        {plan.careLevel.toUpperCase()}
                      </Badge>
                      <Badge className={getStatusColor(plan.coordinationStatus)}>
                        {plan.coordinationStatus.toUpperCase()}
                      </Badge>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    {plan.primaryDiagnosis}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Coordinator Info */}
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <UserCheck className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium text-sm">{plan.assignedCoordinator.name}</div>
                        <div className="text-xs text-gray-600">{plan.assignedCoordinator.role}</div>
                      </div>
                      <div className="ml-auto flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <Mail className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>

                    {/* Care Team */}
                    <div>
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Care Team ({plan.careTeam.length})
                      </h4>
                      <div className="space-y-2">
                        {plan.careTeam.slice(0, 3).map((member) => {
                          const daysSinceContact = Math.floor(
                            (Date.now() - member.lastContact.getTime()) / (24 * 60 * 60 * 1000)
                          );
                          return (
                            <div key={member.id} className="flex items-center justify-between text-sm">
                              <div>
                                <span className="font-medium">{member.name}</span>
                                <span className="text-gray-500 ml-2">({member.role})</span>
                                {member.specialty && (
                                  <span className="text-gray-400 ml-1">- {member.specialty}</span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500">
                                {daysSinceContact === 0 ? "Today" : `${daysSinceContact}d ago`}
                              </div>
                            </div>
                          );
                        })}
                        {plan.careTeam.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{plan.careTeam.length - 3} more team members
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Care Goals */}
                    <div>
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Care Goals ({plan.careGoals.length})
                      </h4>
                      <div className="space-y-2">
                        {plan.careGoals.map((goal) => (
                          <div key={goal.id} className="flex items-center gap-2 text-sm">
                            {getGoalStatusIcon(goal.status)}
                            <span className="flex-1">{goal.description}</span>
                            <Badge 
                              className={`text-xs ${
                                goal.priority === "critical" ? "bg-red-100 text-red-800" :
                                goal.priority === "high" ? "bg-orange-100 text-orange-800" :
                                goal.priority === "medium" ? "bg-yellow-100 text-yellow-800" :
                                "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {goal.priority}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quality Metrics */}
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {plan.qualityMetrics.coordinationScore}%
                        </div>
                        <div className="text-xs text-gray-500">Coordination</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {plan.qualityMetrics.patientSatisfaction}%
                        </div>
                        <div className="text-xs text-gray-500">Satisfaction</div>
                      </div>
                    </div>

                    {/* DOH Compliance */}
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium">DOH Compliance</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{plan.dohCompliance.complianceScore}%</span>
                        <Badge className={getComplianceColor(plan.dohCompliance.reportingStatus)}>
                          {plan.dohCompliance.reportingStatus.replace("_", " ").toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    {/* Last Updated */}
                    <div className="text-xs text-gray-500 text-center">
                      Last updated: {plan.lastUpdated.toLocaleString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Communication Effectiveness
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{metrics.communicationEffectiveness}%</div>
                <Progress value={metrics.communicationEffectiveness} className="mb-2" />
                <p className="text-sm text-gray-600">
                  Average effectiveness of care team communications
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Goal Achievement Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{metrics.goalAchievementRate}%</div>
                <Progress value={metrics.goalAchievementRate} className="mb-2" />
                <p className="text-sm text-gray-600">
                  Percentage of care goals achieved on time
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Patient Satisfaction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{metrics.patientSatisfactionScore}%</div>
                <Progress value={metrics.patientSatisfactionScore} className="mb-2" />
                <p className="text-sm text-gray-600">
                  Overall patient satisfaction with care coordination
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Alert Resolution Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{metrics.alertResolutionTime}h</div>
                <p className="text-sm text-gray-600">
                  Average time to resolve coordination alerts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  JAWDA Alignment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{metrics.jawdaAlignmentScore}%</div>
                <Progress value={metrics.jawdaAlignmentScore} className="mb-2" />
                <p className="text-sm text-gray-600">
                  Alignment with JAWDA quality standards
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>DOH Compliance Overview</CardTitle>
              <CardDescription>
                Care coordination compliance with DOH standards and requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">{compliantPlans.length}</div>
                    <div className="text-sm text-green-700">Compliant Plans</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-yellow-600">
                      {coordinationPlans.filter(p => p.dohCompliance.reportingStatus === "at_risk").length}
                    </div>
                    <div className="text-sm text-yellow-700">At Risk</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-red-600">
                      {coordinationPlans.filter(p => p.dohCompliance.reportingStatus === "non_compliant").length}
                    </div>
                    <div className="text-sm text-red-700">Non-Compliant</div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium mb-3">DOH Care Coordination Standards</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span>Care Plan Documentation</span>
                      <Badge className="bg-green-100 text-green-800">Compliant</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span>Care Team Communication</span>
                      <Badge className="bg-green-100 text-green-800">Compliant</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span>Patient Safety Integration</span>
                      <Badge className="bg-green-100 text-green-800">Compliant</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span>Quality Metrics Tracking</span>
                      <Badge className="bg-yellow-100 text-yellow-800">Monitoring</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Care Coordination Analytics</CardTitle>
              <CardDescription>
                Advanced analytics and insights for care coordination performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  Advanced analytics dashboard coming soon...
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Predictive analytics, trend analysis, and performance insights
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CareCoordinationTrackingDashboard;
