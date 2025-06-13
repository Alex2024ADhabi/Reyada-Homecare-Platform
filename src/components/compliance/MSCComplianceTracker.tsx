import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  User,
  Activity,
  TrendingUp,
  Bell,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MSCPlan {
  id: string;
  patientId: string;
  patientName: string;
  planType: "MSC" | "Extended_MSC";
  startDate: string;
  endDate: string;
  initialVisitDate?: string;
  atcNumber: string;
  atcValidityPeriod: string;
  status: "active" | "expired" | "pending_renewal" | "extended";
  extensionCount: number;
  maxExtensions: number;
  complianceScore: number;
  lastReviewDate: string;
  nextReviewDate: string;
  treatmentPeriodDays: number;
  remainingDays: number;
  documents: {
    initialAssessment: boolean;
    treatmentPlan: boolean;
    progressNotes: boolean;
    faceToFaceAssessment: boolean;
  };
  alerts: string[];
}

interface MSCComplianceTrackerProps {
  className?: string;
}

const MSCComplianceTracker: React.FC<MSCComplianceTrackerProps> = ({
  className = "",
}) => {
  const [mscPlans, setMscPlans] = useState<MSCPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<MSCPlan | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMSCPlans();
  }, []);

  const loadMSCPlans = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockPlans: MSCPlan[] = [
        {
          id: "msc-001",
          patientId: "pat-001",
          patientName: "Ahmed Al Mansouri",
          planType: "MSC",
          startDate: "2024-01-15",
          endDate: "2024-04-15",
          initialVisitDate: "2024-01-18",
          atcNumber: "ATC-2024-001",
          atcValidityPeriod: "90 days",
          status: "active",
          extensionCount: 0,
          maxExtensions: 2,
          complianceScore: 92,
          lastReviewDate: "2024-03-01",
          nextReviewDate: "2024-04-01",
          treatmentPeriodDays: 90,
          remainingDays: 25,
          documents: {
            initialAssessment: true,
            treatmentPlan: true,
            progressNotes: true,
            faceToFaceAssessment: true,
          },
          alerts: [],
        },
        {
          id: "msc-002",
          patientId: "pat-002",
          patientName: "Fatima Al Zahra",
          planType: "Extended_MSC",
          startDate: "2023-12-01",
          endDate: "2024-05-14",
          initialVisitDate: "2023-12-05",
          atcNumber: "ATC-2023-045",
          atcValidityPeriod: "Extended to May 14, 2025",
          status: "extended",
          extensionCount: 1,
          maxExtensions: 2,
          complianceScore: 87,
          lastReviewDate: "2024-02-15",
          nextReviewDate: "2024-04-15",
          treatmentPeriodDays: 165,
          remainingDays: 45,
          documents: {
            initialAssessment: true,
            treatmentPlan: true,
            progressNotes: false,
            faceToFaceAssessment: true,
          },
          alerts: ["Progress notes overdue", "Review date approaching"],
        },
        {
          id: "msc-003",
          patientId: "pat-003",
          patientName: "Mohammed Hassan",
          planType: "MSC",
          startDate: "2024-02-01",
          endDate: "2024-05-01",
          atcNumber: "ATC-2024-012",
          atcValidityPeriod: "90 days",
          status: "pending_renewal",
          extensionCount: 0,
          maxExtensions: 2,
          complianceScore: 65,
          lastReviewDate: "2024-03-15",
          nextReviewDate: "2024-04-20",
          treatmentPeriodDays: 89,
          remainingDays: 5,
          documents: {
            initialAssessment: true,
            treatmentPlan: false,
            progressNotes: false,
            faceToFaceAssessment: false,
          },
          alerts: [
            "Initial visit not recorded",
            "Treatment plan missing",
            "Face-to-face assessment required",
          ],
        },
      ];
      setMscPlans(mockPlans);
    } catch (error) {
      console.error("Error loading MSC plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadMSCPlans();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "extended":
        return "bg-blue-100 text-blue-800";
      case "pending_renewal":
        return "bg-yellow-100 text-yellow-800";
      case "expired":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const calculateDaysUntilExpiry = (endDate: string) => {
    const today = new Date();
    const expiry = new Date(endDate);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const validate90DayRule = (plan: MSCPlan) => {
    const violations = [];
    if (plan.treatmentPeriodDays > 90) {
      violations.push("Treatment period exceeds 90-day limit");
    }
    if (!plan.initialVisitDate) {
      violations.push("Initial visit date not recorded");
    }
    if (!plan.documents.faceToFaceAssessment) {
      violations.push("Face-to-face assessment missing");
    }
    return violations;
  };

  const criticalPlans = mscPlans.filter(
    (plan) => plan.remainingDays <= 7 || plan.complianceScore < 70,
  );
  const extensionEligible = mscPlans.filter(
    (plan) => plan.extensionCount < plan.maxExtensions && plan.remainingDays <= 30,
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading MSC compliance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6 bg-gray-50 min-h-screen p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Activity className="h-6 w-6 mr-3 text-blue-600" />
            MSC Compliance Tracker
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor MSC plan extensions, 90-day rule compliance, and ATC validity
          </p>
        </div>
        <Button
          onClick={refreshData}
          disabled={refreshing}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <RefreshCw
            className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")}
          />
          Refresh
        </Button>
      </div>

      {/* Critical Alerts */}
      {criticalPlans.length > 0 && (
        <Alert variant="compliance-critical">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Critical MSC Plans Require Attention</AlertTitle>
          <AlertDescription>
            {criticalPlans.length} MSC plan(s) have critical compliance issues or
            are expiring soon.
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total MSC Plans</p>
                <p className="text-2xl font-bold">{mscPlans.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Extension Eligible</p>
                <p className="text-2xl font-bold text-orange-600">
                  {extensionEligible.length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical Issues</p>
                <p className="text-2xl font-bold text-red-600">
                  {criticalPlans.length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Compliance</p>
                <p
                  className={cn(
                    "text-2xl font-bold",
                    getComplianceColor(
                      Math.round(
                        mscPlans.reduce((sum, plan) => sum + plan.complianceScore, 0) /
                          mscPlans.length,
                      ),
                    ),
                  )}
                >
                  {Math.round(
                    mscPlans.reduce((sum, plan) => sum + plan.complianceScore, 0) /
                      mscPlans.length,
                  )}
                  %
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plans">MSC Plans</TabsTrigger>
          <TabsTrigger value="extensions">Extensions</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Plan Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { status: "active", count: mscPlans.filter(p => p.status === "active").length },
                    { status: "extended", count: mscPlans.filter(p => p.status === "extended").length },
                    { status: "pending_renewal", count: mscPlans.filter(p => p.status === "pending_renewal").length },
                    { status: "expired", count: mscPlans.filter(p => p.status === "expired").length },
                  ].map((item) => (
                    <div key={item.status} className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">
                        {item.status.replace("_", " ")}
                      </span>
                      <div className="flex items-center space-x-2">
                        <Progress
                          value={(item.count / mscPlans.length) * 100}
                          className="w-20 h-2"
                        />
                        <span className="text-sm text-gray-600">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Renewals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mscPlans
                    .filter((plan) => plan.remainingDays <= 30)
                    .sort((a, b) => a.remainingDays - b.remainingDays)
                    .slice(0, 5)
                    .map((plan) => (
                      <div
                        key={plan.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div>
                          <p className="font-medium">{plan.patientName}</p>
                          <p className="text-sm text-gray-600">{plan.atcNumber}</p>
                        </div>
                        <Badge
                          className={cn(
                            plan.remainingDays <= 7
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800",
                          )}
                        >
                          {plan.remainingDays} days
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="plans">
          <Card>
            <CardHeader>
              <CardTitle>MSC Plans Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mscPlans.map((plan) => (
                  <Card
                    key={plan.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      plan.alerts.length > 0 && "border-l-4 border-l-red-500",
                    )}
                    onClick={() => setSelectedPlan(plan)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold">{plan.patientName}</h3>
                            <Badge className={getStatusColor(plan.status)}>
                              {plan.status.replace("_", " ")}
                            </Badge>
                            <Badge variant="outline">{plan.planType}</Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">ATC Number:</span>
                              <p className="font-medium">{plan.atcNumber}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Remaining Days:</span>
                              <p
                                className={cn(
                                  "font-medium",
                                  plan.remainingDays <= 7
                                    ? "text-red-600"
                                    : plan.remainingDays <= 30
                                      ? "text-yellow-600"
                                      : "text-green-600",
                                )}
                              >
                                {plan.remainingDays}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600">Compliance Score:</span>
                              <p
                                className={cn(
                                  "font-medium",
                                  getComplianceColor(plan.complianceScore),
                                )}
                              >
                                {plan.complianceScore}%
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600">Extensions:</span>
                              <p className="font-medium">
                                {plan.extensionCount}/{plan.maxExtensions}
                              </p>
                            </div>
                          </div>
                          {plan.alerts.length > 0 && (
                            <div className="mt-3">
                              <div className="flex items-center space-x-1 mb-1">
                                <Bell className="h-4 w-4 text-red-500" />
                                <span className="text-sm font-medium text-red-600">
                                  Alerts ({plan.alerts.length})
                                </span>
                              </div>
                              <ul className="text-sm text-red-600 space-y-1">
                                {plan.alerts.map((alert, index) => (
                                  <li key={index}>• {alert}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <Progress
                            value={plan.complianceScore}
                            className="w-20 h-2"
                          />
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="extensions">
          <Card>
            <CardHeader>
              <CardTitle>Extension Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert variant="doh-requirement">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>MSC Extension Guidelines</AlertTitle>
                  <AlertDescription>
                    MSC plans can be extended until May 14, 2025. Maximum 2
                    extensions per plan. Each extension requires updated ATC
                    validity revision.
                  </AlertDescription>
                </Alert>

                {extensionEligible.map((plan) => (
                  <Card key={plan.id} className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{plan.patientName}</h3>
                          <p className="text-sm text-gray-600">
                            ATC: {plan.atcNumber} | Expires in {plan.remainingDays}{" }
                            days
                          </p>
                          <p className="text-sm text-orange-600">
                            Extensions used: {plan.extensionCount}/
                            {plan.maxExtensions}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            className="bg-orange-600 hover:bg-orange-700"
                          >
                            Request Extension
                          </Button>
                          <Button size="sm" variant="outline">
                            View Plan
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {extensionEligible.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>No plans currently eligible for extension</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle>90-Day Rule Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mscPlans.map((plan) => {
                  const violations = validate90DayRule(plan);
                  return (
                    <Card
                      key={plan.id}
                      className={cn(
                        violations.length > 0 && "border-l-4 border-l-red-500",
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold">{plan.patientName}</h3>
                              {violations.length === 0 ? (
                                <Badge className="bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Compliant
                                </Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-800">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Non-Compliant
                                </Badge>
                              )}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-3">
                              <div>
                                <span className="text-gray-600">
                                  Treatment Period:
                                </span>
                                <p
                                  className={cn(
                                    "font-medium",
                                    plan.treatmentPeriodDays > 90
                                      ? "text-red-600"
                                      : "text-green-600",
                                  )}
                                >
                                  {plan.treatmentPeriodDays} days
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-600">
                                  Initial Visit:
                                </span>
                                <p
                                  className={cn(
                                    "font-medium",
                                    plan.initialVisitDate
                                      ? "text-green-600"
                                      : "text-red-600",
                                  )}
                                >
                                  {plan.initialVisitDate || "Not recorded"}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-600">ATC Validity:</span>
                                <p className="font-medium">
                                  {plan.atcValidityPeriod}
                                </p>
                              </div>
                            </div>
                            {violations.length > 0 && (
                              <div className="bg-red-50 p-3 rounded">
                                <h4 className="font-medium text-red-800 mb-2">
                                  Compliance Violations:
                                </h4>
                                <ul className="text-sm text-red-700 space-y-1">
                                  {violations.map((violation, index) => (
                                    <li key={index}>• {violation}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <div className="text-right">
                              <p className="text-sm text-gray-600">
                                Compliance Score
                              </p>
                              <p
                                className={cn(
                                  "text-lg font-bold",
                                  getComplianceColor(plan.complianceScore),
                                )}
                              >
                                {plan.complianceScore}%
                              </p>
                            </div>
                            <Button size="sm" variant="outline">
                              Fix Issues
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MSCComplianceTracker;
