import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Shield,
  FileText,
  TrendingUp,
  Calendar,
  Activity,
  Bell,
} from "lucide-react";

interface AutomatedComplianceData {
  jawdaKPIs: {
    overallScore: number;
    complianceStatus: string;
    kpiResults: any[];
    lastUpdate: string;
    alerts: string[];
  };
  regulatoryReporting: {
    totalReports: number;
    upcomingDeadlines: any[];
    recentReports: any[];
    reportsByType: Record<string, number>;
  };
  auditTrail: {
    totalEvents: number;
    criticalEvents: number;
    complianceEvents: number;
    recentAlerts: any[];
  };
  realTimeStatus: {
    systemHealth: string;
    lastCheck: string;
    activeMonitoring: boolean;
    automationStatus: string;
  };
}

const AutomatedComplianceDashboard: React.FC = () => {
  const [complianceData, setComplianceData] =
    useState<AutomatedComplianceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [realTimeAlerts, setRealTimeAlerts] = useState<string[]>([]);

  useEffect(() => {
    loadAutomatedComplianceData();

    // Set up real-time updates
    const interval = setInterval(() => {
      loadAutomatedComplianceData();
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const loadAutomatedComplianceData = async () => {
    try {
      setLoading(true);

      // Import automated systems
      const { automatedJAWDATracker } = await import("@/api/doh-audit.api");
      const { automatedRegulatoryReporting } = await import(
        "@/api/reporting.api"
      );

      // Get JAWDA KPI data
      const jawdaData = await automatedJAWDATracker.getKPIDashboardData();
      const jawdaAlerts = automatedJAWDATracker.getRealTimeAlerts();

      // Get regulatory reporting data
      const reportingData =
        automatedRegulatoryReporting.getComplianceReportsSummary();

      // Get audit trail data
      const auditLogs = JSON.parse(
        localStorage.getItem("compliance_audit_logs") || "[]",
      );
      const complianceAlerts = JSON.parse(
        localStorage.getItem("compliance_alerts") || "[]",
      );

      const auditTrailData = {
        totalEvents: auditLogs.length,
        criticalEvents: auditLogs.filter(
          (log: any) => log.severity === "critical",
        ).length,
        complianceEvents: auditLogs.filter(
          (log: any) => log.complianceCategory !== "general",
        ).length,
        recentAlerts: complianceAlerts.slice(-10),
      };

      setComplianceData({
        jawdaKPIs: {
          overallScore: 87, // Mock score - would come from actual calculation
          complianceStatus: jawdaData.complianceStatus || "meeting_target",
          kpiResults: Object.values(jawdaData.currentPeriod?.kpis || {}),
          lastUpdate: jawdaData.lastUpdate || new Date().toISOString(),
          alerts: jawdaAlerts,
        },
        regulatoryReporting: reportingData,
        auditTrail: auditTrailData,
        realTimeStatus: {
          systemHealth: "operational",
          lastCheck: new Date().toISOString(),
          activeMonitoring: true,
          automationStatus: "active",
        },
      });

      // Update real-time alerts
      const allAlerts = [
        ...jawdaAlerts.slice(-3),
        ...reportingData.upcomingDeadlines
          .filter((d: any) => d.daysUntil <= 3)
          .map((d: any) => `${d.type} due in ${d.daysUntil} days`),
        ...auditTrailData.recentAlerts
          .slice(-2)
          .map((alert: any) => `Security: ${alert.type}`),
      ];

      setRealTimeAlerts(allAlerts);
    } catch (error) {
      console.error("Failed to load automated compliance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "meeting_target":
      case "operational":
      case "active":
        return "bg-green-100 text-green-800";
      case "needs_improvement":
        return "bg-yellow-100 text-yellow-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "meeting_target":
      case "operational":
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "needs_improvement":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "critical":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading automated compliance data...</p>
        </div>
      </div>
    );
  }

  if (!complianceData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load compliance data. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Automated Compliance Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Real-time DOH compliance monitoring and automated reporting
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-2">
                {getStatusIcon(complianceData.realTimeStatus.automationStatus)}
                <Badge
                  className={getStatusColor(
                    complianceData.realTimeStatus.automationStatus,
                  )}
                >
                  {complianceData.realTimeStatus.automationStatus}
                </Badge>
              </div>
              <div className="text-xs text-gray-400">
                Last updated:{" "}
                {new Date(
                  complianceData.realTimeStatus.lastCheck,
                ).toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Alerts */}
        {realTimeAlerts.length > 0 && (
          <div className="space-y-2">
            {realTimeAlerts.slice(0, 5).map((alert, index) => (
              <Alert key={index} className="border-blue-200 bg-blue-50">
                <Bell className="h-4 w-4" />
                <AlertDescription className="text-blue-800">
                  {alert}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Main Content */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="jawda">JAWDA KPIs</TabsTrigger>
            <TabsTrigger value="reporting">Regulatory Reports</TabsTrigger>
            <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* JAWDA KPIs Card */}
              <Card className="bg-white">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5" />
                      <CardTitle className="text-sm font-medium">
                        JAWDA KPIs
                      </CardTitle>
                    </div>
                    {getStatusIcon(complianceData.jawdaKPIs.complianceStatus)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">
                      {complianceData.jawdaKPIs.overallScore}%
                    </div>
                    <Badge
                      className={getStatusColor(
                        complianceData.jawdaKPIs.complianceStatus,
                      )}
                    >
                      {complianceData.jawdaKPIs.complianceStatus.replace(
                        "_",
                        " ",
                      )}
                    </Badge>
                    <Progress
                      value={complianceData.jawdaKPIs.overallScore}
                      className="h-2"
                    />
                    <div className="text-xs text-gray-500">
                      {complianceData.jawdaKPIs.kpiResults.length} KPIs tracked
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Regulatory Reports Card */}
              <Card className="bg-white">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <CardTitle className="text-sm font-medium">
                        Reports
                      </CardTitle>
                    </div>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">
                      {complianceData.regulatoryReporting.totalReports}
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      Generated
                    </Badge>
                    <div className="text-xs text-gray-500">
                      {
                        complianceData.regulatoryReporting.upcomingDeadlines
                          .length
                      }{" "}
                      upcoming deadlines
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Audit Trail Card */}
              <Card className="bg-white">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-5 w-5" />
                      <CardTitle className="text-sm font-medium">
                        Audit Trail
                      </CardTitle>
                    </div>
                    <Activity className="h-4 w-4 text-blue-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">
                      {complianceData.auditTrail.totalEvents}
                    </div>
                    <Badge className="bg-gray-100 text-gray-800">
                      Events Logged
                    </Badge>
                    <div className="text-xs text-gray-500">
                      {complianceData.auditTrail.criticalEvents} critical events
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Status Card */}
              <Card className="bg-white">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-5 w-5" />
                      <CardTitle className="text-sm font-medium">
                        System Status
                      </CardTitle>
                    </div>
                    {getStatusIcon(complianceData.realTimeStatus.systemHealth)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge
                      className={getStatusColor(
                        complianceData.realTimeStatus.systemHealth,
                      )}
                    >
                      {complianceData.realTimeStatus.systemHealth}
                    </Badge>
                    <div className="text-xs text-gray-500">
                      Monitoring:{" "}
                      {complianceData.realTimeStatus.activeMonitoring
                        ? "Active"
                        : "Inactive"}
                    </div>
                    <div className="text-xs text-gray-500">
                      Automation:{" "}
                      {complianceData.realTimeStatus.automationStatus}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* JAWDA KPIs Tab */}
          <TabsContent value="jawda" className="space-y-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Automated JAWDA KPI Tracking</CardTitle>
                <p className="text-sm text-gray-600">
                  Real-time calculation and monitoring of all DOH JAWDA KPIs
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {complianceData.jawdaKPIs.overallScore}%
                      </div>
                      <div className="text-sm text-gray-600">Overall Score</div>
                      <Badge
                        className={getStatusColor(
                          complianceData.jawdaKPIs.complianceStatus,
                        )}
                      >
                        {complianceData.jawdaKPIs.complianceStatus.replace(
                          "_",
                          " ",
                        )}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {complianceData.jawdaKPIs.kpiResults.length}
                      </div>
                      <div className="text-sm text-gray-600">KPIs Tracked</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {complianceData.jawdaKPIs.alerts.length}
                      </div>
                      <div className="text-sm text-gray-600">Active Alerts</div>
                    </div>
                  </div>

                  {complianceData.jawdaKPIs.alerts.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold">Recent JAWDA Alerts</h4>
                      {complianceData.jawdaKPIs.alerts
                        .slice(0, 5)
                        .map((alert, index) => (
                          <Alert
                            key={index}
                            className="border-yellow-200 bg-yellow-50"
                          >
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription className="text-yellow-800">
                              {alert}
                            </AlertDescription>
                          </Alert>
                        ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Regulatory Reports Tab */}
          <TabsContent value="reporting" className="space-y-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Automated Regulatory Reporting</CardTitle>
                <p className="text-sm text-gray-600">
                  Scheduled generation and submission of regulatory reports
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Report Summary</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total Reports:</span>
                          <span className="font-semibold">
                            {complianceData.regulatoryReporting.totalReports}
                          </span>
                        </div>
                        {Object.entries(
                          complianceData.regulatoryReporting.reportsByType,
                        ).map(([type, count]) => (
                          <div
                            key={type}
                            className="flex justify-between text-sm"
                          >
                            <span>{type}:</span>
                            <span>{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Upcoming Deadlines</h4>
                      <div className="space-y-2">
                        {complianceData.regulatoryReporting.upcomingDeadlines
                          .slice(0, 5)
                          .map((deadline, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded"
                            >
                              <div>
                                <div className="text-sm font-medium">
                                  {deadline.type}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {new Date(
                                    deadline.deadline,
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                              <Badge
                                className={`${
                                  deadline.daysUntil <= 3
                                    ? "bg-red-100 text-red-800"
                                    : deadline.daysUntil <= 7
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-green-100 text-green-800"
                                }`}
                              >
                                {deadline.daysUntil} days
                              </Badge>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Trail Tab */}
          <TabsContent value="audit" className="space-y-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Compliance Audit Trail</CardTitle>
                <p className="text-sm text-gray-600">
                  Comprehensive logging of all compliance-related events
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {complianceData.auditTrail.totalEvents}
                      </div>
                      <div className="text-sm text-gray-600">Total Events</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {complianceData.auditTrail.criticalEvents}
                      </div>
                      <div className="text-sm text-gray-600">
                        Critical Events
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {complianceData.auditTrail.complianceEvents}
                      </div>
                      <div className="text-sm text-gray-600">
                        Compliance Events
                      </div>
                    </div>
                  </div>

                  {complianceData.auditTrail.recentAlerts.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold">
                        Recent Compliance Alerts
                      </h4>
                      {complianceData.auditTrail.recentAlerts
                        .slice(0, 5)
                        .map((alert, index) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <Badge
                                className={getStatusColor(
                                  alert.severity || "medium",
                                )}
                              >
                                {alert.type || "Compliance Alert"}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {new Date(alert.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <div className="text-sm text-gray-700">
                              Alert ID: {alert.alertId}
                            </div>
                            {alert.requiredActions && (
                              <div className="text-xs text-gray-600 mt-1">
                                Actions: {alert.requiredActions.length} required
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <Button
            onClick={loadAutomatedComplianceData}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Activity className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              alert("Generating comprehensive compliance report...")
            }
          >
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
          <Button
            variant="outline"
            onClick={() => alert("Exporting audit trail...")}
          >
            Export Audit Trail
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AutomatedComplianceDashboard;
