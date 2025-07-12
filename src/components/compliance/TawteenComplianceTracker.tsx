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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  FileText,
  Calendar,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TawteenTarget {
  facilityType: string;
  licensedWorkforceRange: string;
  minimumNationals: number;
  currentNationals: number;
  compliancePercentage: number;
  status: "compliant" | "non-compliant" | "at-risk";
  region: "Abu Dhabi" | "Al Ain" | "Al Dhafra";
  networkType: "Thiqa" | "Basic" | "Non-Network";
}

interface TawteenReport {
  facilityId: string;
  reportingPeriod: string;
  totalLicensedStaff: number;
  totalNationalStaff: number;
  administrativeStaff: {
    total: number;
    nationals: number;
    percentage: number;
  };
  healthcareStaff: {
    total: number;
    nationals: number;
    percentage: number;
  };
  tamm_integration: {
    connected: boolean;
    lastSync: string;
    dataAccuracy: number;
  };
  complianceStatus: "Phase 1" | "Phase 2" | "Non-Compliant";
  penalties: {
    financial: number;
    networkExclusion: boolean;
  };
}

interface TawteenComplianceTrackerProps {
  facilityId?: string;
  region?: "Abu Dhabi" | "Al Ain" | "Al Dhafra";
  networkType?: "Thiqa" | "Basic" | "Non-Network";
}

export default function TawteenComplianceTracker({
  facilityId = "facility-001",
  region = "Abu Dhabi",
  networkType = "Basic",
}: TawteenComplianceTrackerProps) {
  const [targets, setTargets] = useState<TawteenTarget[]>([]);
  const [currentReport, setCurrentReport] = useState<TawteenReport | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [showTAMMDialog, setShowTAMMDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [complianceAlerts, setComplianceAlerts] = useState<string[]>([]);

  // CN_13_2025 Tawteen Targets based on region and network type
  const getTawteenTargets = (): TawteenTarget[] => {
    const baseTargets: TawteenTarget[] = [];

    if (region === "Al Ain" && networkType === "Thiqa") {
      // Enhanced targets for Al Ain Thiqa network
      baseTargets.push(
        {
          facilityType: "All Licensed Health Facilities",
          licensedWorkforceRange: "1-50",
          minimumNationals: 1,
          currentNationals: 0,
          compliancePercentage: 0,
          status: "non-compliant",
          region,
          networkType,
        },
        {
          facilityType: "All Licensed Health Facilities",
          licensedWorkforceRange: "51-100",
          minimumNationals: 2,
          currentNationals: 1,
          compliancePercentage: 50,
          status: "at-risk",
          region,
          networkType,
        },
        {
          facilityType: "All Licensed Health Facilities",
          licensedWorkforceRange: "101-150",
          minimumNationals: 3,
          currentNationals: 3,
          compliancePercentage: 100,
          status: "compliant",
          region,
          networkType,
        },
        {
          facilityType: "All Licensed Health Facilities",
          licensedWorkforceRange: "151+",
          minimumNationals: 2, // 2 per 100 or part thereof
          currentNationals: 4,
          compliancePercentage: 100,
          status: "compliant",
          region,
          networkType,
        },
      );
    } else {
      // Standard targets for Abu Dhabi, Al Dhafra, and Al Ain non-Thiqa
      baseTargets.push(
        {
          facilityType: "IVF Centers / Pharmacies",
          licensedWorkforceRange: "10+",
          minimumNationals: 1,
          currentNationals: 1,
          compliancePercentage: 100,
          status: "compliant",
          region,
          networkType,
        },
        {
          facilityType: "School Clinics",
          licensedWorkforceRange: "5+",
          minimumNationals: 1,
          currentNationals: 0,
          compliancePercentage: 0,
          status: "non-compliant",
          region,
          networkType,
        },
        {
          facilityType: "All Licensed Health Facilities",
          licensedWorkforceRange: "20-100",
          minimumNationals: 1,
          currentNationals: 2,
          compliancePercentage: 200,
          status: "compliant",
          region,
          networkType,
        },
        {
          facilityType: "All Licensed Health Facilities",
          licensedWorkforceRange: "101-200",
          minimumNationals: 2,
          currentNationals: 1,
          compliancePercentage: 50,
          status: "at-risk",
          region,
          networkType,
        },
        {
          facilityType: "All Licensed Health Facilities",
          licensedWorkforceRange: "201+",
          minimumNationals: 1, // 1 per 100 or part thereof
          currentNationals: 3,
          compliancePercentage: 100,
          status: "compliant",
          region,
          networkType,
        },
      );
    }

    return baseTargets;
  };

  const generateMockReport = (): TawteenReport => {
    return {
      facilityId,
      reportingPeriod: "2025-Q1",
      totalLicensedStaff: 150,
      totalNationalStaff: 12,
      administrativeStaff: {
        total: 25,
        nationals: 5,
        percentage: 20,
      },
      healthcareStaff: {
        total: 125,
        nationals: 7,
        percentage: 5.6,
      },
      tamm_integration: {
        connected: true,
        lastSync: new Date().toISOString(),
        dataAccuracy: 98.5,
      },
      complianceStatus: "Phase 1",
      penalties: {
        financial: 0,
        networkExclusion: false,
      },
    };
  };

  useEffect(() => {
    setTargets(getTawteenTargets());
    setCurrentReport(generateMockReport());
  }, [region, networkType]);

  const handleTAMMSync = async () => {
    setLoading(true);
    try {
      // Simulate TAMM platform integration
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const updatedReport = {
        ...currentReport!,
        tamm_integration: {
          connected: true,
          lastSync: new Date().toISOString(),
          dataAccuracy: 99.2,
        },
      };

      setCurrentReport(updatedReport);
      setShowTAMMDialog(false);

      toast({
        title: "TAMM Integration Successful",
        description: "Workforce data synchronized with TAMM platform",
      });
    } catch (error) {
      toast({
        title: "TAMM Integration Failed",
        description: "Failed to sync with TAMM platform. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      compliant: "default",
      "at-risk": "secondary",
      "non-compliant": "destructive",
    };
    return (
      <Badge variant={variants[status] || "secondary"}>
        {status === "compliant" && <CheckCircle className="w-3 h-3 mr-1" />}
        {status === "at-risk" && <AlertTriangle className="w-3 h-3 mr-1" />}
        {status === "non-compliant" && (
          <AlertTriangle className="w-3 h-3 mr-1" />
        )}
        {status.toUpperCase()}
      </Badge>
    );
  };

  const overallComplianceRate =
    targets.length > 0
      ? (targets.filter((t) => t.status === "compliant").length /
          targets.length) *
        100
      : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Tawteen Initiative Compliance Tracker
            </h1>
            <p className="text-gray-600 mt-1">
              CN_13_2025 - Healthcare Workforce Sustainability & Emiratization
              Tracking
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {region} Region - {networkType} Network
            </Badge>
          </div>
        </div>

        {/* Compliance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-800">
                Overall Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">
                {Math.round(overallComplianceRate)}%
              </div>
              <p className="text-xs text-green-600">
                {targets.filter((t) => t.status === "compliant").length} of{" "}
                {targets.length} targets met
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">
                Total Nationals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                {currentReport?.totalNationalStaff || 0}
              </div>
              <p className="text-xs text-blue-600">
                of {currentReport?.totalLicensedStaff || 0} licensed staff
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">
                TAMM Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                {currentReport?.tamm_integration.connected ? "✓" : "✗"}
              </div>
              <p className="text-xs text-purple-600">
                {currentReport?.tamm_integration.dataAccuracy || 0}% accuracy
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-800">
                Compliance Phase
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">
                {currentReport?.complianceStatus || "N/A"}
              </div>
              <p className="text-xs text-orange-600">2025 Implementation</p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Compliance Alerts */}
        {targets.some((t) => t.status === "non-compliant") && (
          <Alert className="bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">
              Critical Tawteen Compliance Issues - CN_13_2025
            </AlertTitle>
            <AlertDescription className="text-red-700">
              {targets.filter((t) => t.status === "non-compliant").length}{" "}
              facility types are non-compliant with Tawteen targets. Immediate
              action required to avoid:
              <ul className="list-disc list-inside mt-2">
                <li>Financial penalties up to AED 50,000 per violation</li>
                <li>Network exclusion from Thiqa and Basic networks</li>
                <li>License suspension for repeated violations</li>
                <li>Mandatory workforce restructuring requirements</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* TAMM Integration Alert */}
        {!currentReport?.tamm_integration.connected && (
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800">
              TAMM Platform Integration Required
            </AlertTitle>
            <AlertDescription className="text-yellow-700">
              Connection to TAMM platform is mandatory for automated workforce
              reporting and compliance validation. Click "TAMM Integration" to
              connect.
            </AlertDescription>
          </Alert>
        )}

        {/* Enhanced Tawteen Compliance Dashboard */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="targets">Targets</TabsTrigger>
            <TabsTrigger value="workforce">Workforce</TabsTrigger>
            <TabsTrigger value="reporting">Reporting</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Overall Compliance Rate</span>
                      <span className="text-2xl font-bold text-green-600">
                        {Math.round(overallComplianceRate)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-500 h-3 rounded-full"
                        style={{ width: `${overallComplianceRate}%` }}
                      ></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-600">
                          {
                            targets.filter((t) => t.status === "compliant")
                              .length
                          }
                        </div>
                        <div className="text-sm text-gray-600">Compliant</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-yellow-600">
                          {targets.filter((t) => t.status === "at-risk").length}
                        </div>
                        <div className="text-sm text-gray-600">At Risk</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-red-600">
                          {
                            targets.filter((t) => t.status === "non-compliant")
                              .length
                          }
                        </div>
                        <div className="text-sm text-gray-600">
                          Non-Compliant
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Regional Requirements</CardTitle>
                  <CardDescription>
                    {region} region specific Tawteen requirements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {region === "Al Ain" && networkType === "Thiqa" ? (
                      <>
                        <div className="p-3 bg-blue-50 rounded border">
                          <div className="font-medium text-blue-900">
                            Enhanced Al Ain Thiqa Requirements
                          </div>
                          <div className="text-sm text-blue-700 mt-1">
                            • Graduated targets based on workforce size • 1
                            national per 50 staff (1-50 range) • 2 nationals per
                            100 staff (51-100 range) • Enhanced monitoring and
                            reporting
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-3 bg-gray-50 rounded border">
                          <div className="font-medium text-gray-900">
                            Standard Requirements
                          </div>
                          <div className="text-sm text-gray-700 mt-1">
                            • IVF Centers/Pharmacies: 1 national per 10+ staff •
                            School Clinics: 1 national per 5+ staff • General
                            Facilities: Graduated based on size
                          </div>
                        </div>
                      </>
                    )}
                    <div className="p-3 bg-green-50 rounded border">
                      <div className="font-medium text-green-900">
                        Network Benefits
                      </div>
                      <div className="text-sm text-green-700 mt-1">
                        • {networkType} network participation • Priority in
                        government contracts • Enhanced reimbursement rates
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="targets">
            <Card>
              <CardHeader>
                <CardTitle>Tawteen Targets by Facility Type</CardTitle>
                <CardDescription>
                  CN_13_2025 requirements based on {region} region and{" "}
                  {networkType} network classification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Facility Type</TableHead>
                        <TableHead>Workforce Range</TableHead>
                        <TableHead>Minimum Nationals</TableHead>
                        <TableHead>Current Nationals</TableHead>
                        <TableHead>Compliance %</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {targets.map((target, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {target.facilityType}
                          </TableCell>
                          <TableCell>{target.licensedWorkforceRange}</TableCell>
                          <TableCell>{target.minimumNationals}</TableCell>
                          <TableCell>{target.currentNationals}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    target.compliancePercentage >= 100
                                      ? "bg-green-500"
                                      : target.compliancePercentage >= 50
                                        ? "bg-yellow-500"
                                        : "bg-red-500"
                                  }`}
                                  style={{
                                    width: `${Math.min(target.compliancePercentage, 100)}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm">
                                {target.compliancePercentage}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(target.status)}</TableCell>
                          <TableCell>
                            {target.status === "non-compliant" && (
                              <Button size="sm" variant="outline">
                                Action Plan
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workforce">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Workforce Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  {currentReport && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 rounded">
                          <div className="text-sm text-blue-600">
                            Total Licensed Staff
                          </div>
                          <div className="text-2xl font-bold text-blue-900">
                            {currentReport.totalLicensedStaff}
                          </div>
                        </div>
                        <div className="p-4 bg-green-50 rounded">
                          <div className="text-sm text-green-600">
                            UAE Nationals
                          </div>
                          <div className="text-2xl font-bold text-green-900">
                            {currentReport.totalNationalStaff}
                          </div>
                          <div className="text-sm text-green-600">
                            {(
                              (currentReport.totalNationalStaff /
                                currentReport.totalLicensedStaff) *
                              100
                            ).toFixed(1)}
                            %
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 border rounded">
                          <div>
                            <div className="font-medium">Healthcare Staff</div>
                            <div className="text-sm text-gray-600">
                              {currentReport.healthcareStaff.nationals} of{" "}
                              {currentReport.healthcareStaff.total} nationals
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">
                              {currentReport.healthcareStaff.percentage.toFixed(
                                1,
                              )}
                              %
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center p-3 border rounded">
                          <div>
                            <div className="font-medium">
                              Administrative Staff
                            </div>
                            <div className="text-sm text-gray-600">
                              {currentReport.administrativeStaff.nationals} of{" "}
                              {currentReport.administrativeStaff.total}{" "}
                              nationals
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">
                              {currentReport.administrativeStaff.percentage.toFixed(
                                1,
                              )}
                              %
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Hiring Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {targets
                      .filter((t) => t.status === "non-compliant")
                      .map((target, index) => (
                        <div
                          key={index}
                          className="p-3 bg-red-50 border border-red-200 rounded"
                        >
                          <div className="font-medium text-red-900">
                            {target.facilityType}
                          </div>
                          <div className="text-sm text-red-700 mt-1">
                            Need to hire{" "}
                            {target.minimumNationals - target.currentNationals}{" "}
                            more UAE nationals
                          </div>
                          <div className="text-xs text-red-600 mt-1">
                            Priority: High - Risk of penalties
                          </div>
                        </div>
                      ))}

                    {targets
                      .filter((t) => t.status === "at-risk")
                      .map((target, index) => (
                        <div
                          key={index}
                          className="p-3 bg-yellow-50 border border-yellow-200 rounded"
                        >
                          <div className="font-medium text-yellow-900">
                            {target.facilityType}
                          </div>
                          <div className="text-sm text-yellow-700 mt-1">
                            Consider hiring{" "}
                            {target.minimumNationals - target.currentNationals}{" "}
                            more UAE nationals
                          </div>
                          <div className="text-xs text-yellow-600 mt-1">
                            Priority: Medium - Preventive measure
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reporting">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>TAMM Platform Integration Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Connection Status
                        </span>
                        <Badge
                          variant={
                            currentReport?.tamm_integration.connected
                              ? "default"
                              : "destructive"
                          }
                        >
                          {currentReport?.tamm_integration.connected
                            ? "Connected"
                            : "Disconnected"}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4 border rounded">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Data Accuracy
                        </span>
                        <span className="font-semibold">
                          {currentReport?.tamm_integration.dataAccuracy}%
                        </span>
                      </div>
                    </div>
                    <div className="p-4 border rounded">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Last Sync</span>
                        <span className="text-sm">
                          {currentReport?.tamm_integration.lastSync
                            ? new Date(
                                currentReport.tamm_integration.lastSync,
                              ).toLocaleDateString()
                            : "Never"}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Compliance Reporting Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <div className="font-medium">
                          Monthly Workforce Report
                        </div>
                        <div className="text-sm text-gray-600">
                          Due: End of each month
                        </div>
                      </div>
                      <Badge variant="outline">Automated</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <div className="font-medium">
                          Quarterly Compliance Review
                        </div>
                        <div className="text-sm text-gray-600">
                          Due: 15th of following month
                        </div>
                      </div>
                      <Badge variant="outline">Manual</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <div className="font-medium">
                          Annual Tawteen Assessment
                        </div>
                        <div className="text-sm text-gray-600">
                          Due: January 31st
                        </div>
                      </div>
                      <Badge variant="outline">Required</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Dialog open={showTAMMDialog} onOpenChange={setShowTAMMDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <ExternalLink className="w-4 h-4 mr-2" />
                TAMM Integration
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>TAMM Platform Integration</DialogTitle>
                <DialogDescription>
                  Sync workforce data with the TAMM platform for official
                  reporting
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded border">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Integration Status
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Connection:</span>
                      <Badge
                        variant={
                          currentReport?.tamm_integration.connected
                            ? "default"
                            : "destructive"
                        }
                      >
                        {currentReport?.tamm_integration.connected
                          ? "Connected"
                          : "Disconnected"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Sync:</span>
                      <span>
                        {new Date(
                          currentReport?.tamm_integration.lastSync || "",
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Data Accuracy:</span>
                      <span>
                        {currentReport?.tamm_integration.dataAccuracy}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowTAMMDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleTAMMSync} disabled={loading}>
                  {loading ? "Syncing..." : "Sync with TAMM"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
            <DialogTrigger asChild>
              <Button>
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Tawteen Compliance Report</DialogTitle>
                <DialogDescription>
                  Comprehensive workforce compliance report for{" "}
                  {currentReport?.reportingPeriod}
                </DialogDescription>
              </DialogHeader>
              {currentReport && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded">
                      <div className="text-sm text-gray-600">
                        Healthcare Staff
                      </div>
                      <div className="text-lg font-semibold">
                        {currentReport.healthcareStaff.nationals}/
                        {currentReport.healthcareStaff.total}
                      </div>
                      <div className="text-sm text-gray-500">
                        {currentReport.healthcareStaff.percentage.toFixed(1)}%
                        Nationals
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                      <div className="text-sm text-gray-600">
                        Administrative Staff
                      </div>
                      <div className="text-lg font-semibold">
                        {currentReport.administrativeStaff.nationals}/
                        {currentReport.administrativeStaff.total}
                      </div>
                      <div className="text-sm text-gray-500">
                        {currentReport.administrativeStaff.percentage.toFixed(
                          1,
                        )}
                        % Nationals
                      </div>
                    </div>
                  </div>

                  {currentReport.penalties.financial > 0 && (
                    <Alert className="bg-red-50 border-red-200">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertTitle className="text-red-800">
                        Penalties Applied
                      </AlertTitle>
                      <AlertDescription className="text-red-700">
                        Financial penalty: AED{" "}
                        {currentReport.penalties.financial.toLocaleString()}
                        {currentReport.penalties.networkExclusion &&
                          " | Network exclusion pending"}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowReportDialog(false)}
                >
                  Close
                </Button>
                <Button>
                  <FileText className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
