/**
 * Laboratory System Integration Component
 * Real-time laboratory results and test ordering interface
 */

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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  TestTube,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Download,
  Upload,
  RefreshCw,
  Search,
  Filter,
  TrendingUp,
  Activity,
} from "lucide-react";

import { healthcareIntegrationService } from "@/services/healthcare-integration.service";

interface LaboratorySystemIntegrationProps {
  patientId?: string;
  className?: string;
}

const LaboratorySystemIntegration: React.FC<
  LaboratorySystemIntegrationProps
> = ({ patientId = "PAT-001", className = "" }) => {
  const [labResults, setLabResults] = useState<any[]>([]);
  const [criticalAlerts, setCriticalAlerts] = useState<any[]>([]);
  const [testOrders, setTestOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [orderForm, setOrderForm] = useState({
    testType: "",
    testCode: "",
    priority: "routine" as "routine" | "urgent" | "stat",
    orderedBy: "",
    specialInstructions: "",
    preferredLab: "",
    collectionMethod: "home" as "home" | "lab" | "hospital",
    scheduledDate: "",
  });
  const [filterOptions, setFilterOptions] = useState({
    startDate: "",
    endDate: "",
    testType: "",
    laboratoryId: "",
  });

  useEffect(() => {
    loadLaboratoryData();
    loadCriticalAlerts();
  }, [patientId]);

  const loadLaboratoryData = async () => {
    setLoading(true);
    try {
      const results = await healthcareIntegrationService.getLabResults(
        patientId,
        {
          includeImages: true,
          ...filterOptions,
        },
      );

      if (results) {
        setLabResults(results.results || []);
        setTestOrders(results.testOrders || []);
      }
    } catch (error) {
      console.error("Error loading laboratory data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCriticalAlerts = async () => {
    try {
      const alerts =
        await healthcareIntegrationService.getCriticalLabAlerts(patientId);
      setCriticalAlerts(alerts);
    } catch (error) {
      console.error("Error loading critical alerts:", error);
    }
  };

  const handleOrderTest = async () => {
    if (!orderForm.testType || !orderForm.orderedBy) {
      alert("Please fill in required fields");
      return;
    }

    setLoading(true);
    try {
      const result = await healthcareIntegrationService.orderLabTest(
        patientId,
        orderForm,
      );

      if (result.success) {
        alert(`Test ordered successfully. Order ID: ${result.orderId}`);
        setOrderForm({
          testType: "",
          testCode: "",
          priority: "routine",
          orderedBy: "",
          specialInstructions: "",
          preferredLab: "",
          collectionMethod: "home",
          scheduledDate: "",
        });
        await loadLaboratoryData();
      } else {
        alert("Failed to order test. Please try again.");
      }
    } catch (error) {
      console.error("Error ordering test:", error);
      alert("Error ordering test. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getResultStatusColor = (status: string) => {
    switch (status) {
      case "final":
        return "text-green-600 bg-green-100";
      case "preliminary":
        return "text-blue-600 bg-blue-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "stat":
        return "text-red-600 bg-red-100";
      case "urgent":
        return "text-orange-600 bg-orange-100";
      case "routine":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className={`bg-white min-h-screen p-6 ${className}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <TestTube className="h-8 w-8 text-blue-600" />
              Laboratory System Integration
            </h1>
            <p className="text-gray-600 mt-2">
              Real-time laboratory results and test ordering for Patient{" "}
              {patientId}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={loadLaboratoryData}
              disabled={loading}
              variant="outline"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button onClick={loadCriticalAlerts} variant="outline">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Check Alerts
            </Button>
          </div>
        </div>

        {/* Critical Alerts */}
        {criticalAlerts.length > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Critical Lab Alerts ({criticalAlerts.length}):</strong>
              <ul className="mt-2 space-y-1">
                {criticalAlerts.slice(0, 3).map((alert, index) => (
                  <li key={index} className="text-sm">
                    • {alert.testName}: {alert.criticalValue} (Ref:{" "}
                    {alert.referenceRange})
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Results
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {labResults.length}
                  </p>
                </div>
                <TestTube className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Pending Orders
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {
                      testOrders.filter((order) => order.status === "pending")
                        .length
                    }
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Critical Alerts
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {criticalAlerts.length}
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
                  <p className="text-sm font-medium text-gray-600">
                    This Month
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {
                      labResults.filter(
                        (result) =>
                          new Date(result.resultDate).getMonth() ===
                          new Date().getMonth(),
                      ).length
                    }
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="results" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="results">Lab Results</TabsTrigger>
            <TabsTrigger value="order">Order Tests</TabsTrigger>
            <TabsTrigger value="tracking">Order Tracking</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Lab Results Tab */}
          <TabsContent value="results" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Laboratory Results</CardTitle>
                    <CardDescription>
                      Real-time laboratory results from connected facilities
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {labResults.map((result, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              {result.testType}
                            </CardTitle>
                            <CardDescription>
                              {result.laboratory?.name} | Collection:{" "}
                              {new Date(
                                result.collectionDate,
                              ).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={getResultStatusColor(result.status)}
                            >
                              {result.status}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {new Date(result.resultDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {result.results?.map(
                            (param: any, paramIndex: number) => (
                              <div
                                key={paramIndex}
                                className="p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-sm">
                                    {param.parameter}
                                  </span>
                                  <Badge
                                    variant={
                                      param.status === "normal"
                                        ? "default"
                                        : "destructive"
                                    }
                                    className="text-xs"
                                  >
                                    {param.status}
                                  </Badge>
                                </div>
                                <div className="text-lg font-bold">
                                  {param.value} {param.unit}
                                </div>
                                <div className="text-xs text-gray-600">
                                  Ref: {param.referenceRange}
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                        {result.clinicalNotes && (
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-blue-900 mb-2">
                              Clinical Notes
                            </h4>
                            <p className="text-sm text-blue-800">
                              {result.clinicalNotes}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Order Tests Tab */}
          <TabsContent value="order" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Laboratory Tests</CardTitle>
                <CardDescription>
                  Request new laboratory tests for the patient
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="test-type">Test Type *</Label>
                      <Select
                        value={orderForm.testType}
                        onValueChange={(value) =>
                          setOrderForm((prev) => ({ ...prev, testType: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select test type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="complete-blood-count">
                            Complete Blood Count (CBC)
                          </SelectItem>
                          <SelectItem value="basic-metabolic-panel">
                            Basic Metabolic Panel
                          </SelectItem>
                          <SelectItem value="lipid-panel">
                            Lipid Panel
                          </SelectItem>
                          <SelectItem value="liver-function">
                            Liver Function Tests
                          </SelectItem>
                          <SelectItem value="thyroid-function">
                            Thyroid Function Tests
                          </SelectItem>
                          <SelectItem value="hba1c">
                            HbA1c (Diabetes)
                          </SelectItem>
                          <SelectItem value="urinalysis">Urinalysis</SelectItem>
                          <SelectItem value="blood-culture">
                            Blood Culture
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="test-code">Test Code</Label>
                      <Input
                        id="test-code"
                        value={orderForm.testCode}
                        onChange={(e) =>
                          setOrderForm((prev) => ({
                            ...prev,
                            testCode: e.target.value,
                          }))
                        }
                        placeholder="LAB001"
                      />
                    </div>

                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={orderForm.priority}
                        onValueChange={(value: "routine" | "urgent" | "stat") =>
                          setOrderForm((prev) => ({ ...prev, priority: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="routine">Routine</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                          <SelectItem value="stat">STAT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="ordered-by">Ordered By *</Label>
                      <Input
                        id="ordered-by"
                        value={orderForm.orderedBy}
                        onChange={(e) =>
                          setOrderForm((prev) => ({
                            ...prev,
                            orderedBy: e.target.value,
                          }))
                        }
                        placeholder="Dr. Smith"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="preferred-lab">
                        Preferred Laboratory
                      </Label>
                      <Select
                        value={orderForm.preferredLab}
                        onValueChange={(value) =>
                          setOrderForm((prev) => ({
                            ...prev,
                            preferredLab: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select laboratory" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dubai-hospital-lab">
                            Dubai Hospital Laboratory
                          </SelectItem>
                          <SelectItem value="american-hospital-lab">
                            American Hospital Laboratory
                          </SelectItem>
                          <SelectItem value="mediclinic-lab">
                            Mediclinic Laboratory
                          </SelectItem>
                          <SelectItem value="nmc-lab">
                            NMC Healthcare Laboratory
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="collection-method">
                        Collection Method
                      </Label>
                      <Select
                        value={orderForm.collectionMethod}
                        onValueChange={(value: "home" | "lab" | "hospital") =>
                          setOrderForm((prev) => ({
                            ...prev,
                            collectionMethod: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="home">Home Collection</SelectItem>
                          <SelectItem value="lab">Laboratory Visit</SelectItem>
                          <SelectItem value="hospital">
                            Hospital Collection
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="scheduled-date">Scheduled Date</Label>
                      <Input
                        id="scheduled-date"
                        type="datetime-local"
                        value={orderForm.scheduledDate}
                        onChange={(e) =>
                          setOrderForm((prev) => ({
                            ...prev,
                            scheduledDate: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="special-instructions">
                        Special Instructions
                      </Label>
                      <Textarea
                        id="special-instructions"
                        value={orderForm.specialInstructions}
                        onChange={(e) =>
                          setOrderForm((prev) => ({
                            ...prev,
                            specialInstructions: e.target.value,
                          }))
                        }
                        placeholder="Any special instructions for sample collection..."
                        rows={3}
                      />
                    </div>

                    <Button
                      onClick={handleOrderTest}
                      disabled={
                        loading || !orderForm.testType || !orderForm.orderedBy
                      }
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Order Test
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Order Tracking Tab */}
          <TabsContent value="tracking" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Order Tracking</CardTitle>
                <CardDescription>
                  Track the status of ordered laboratory tests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testOrders.map((order, index) => (
                    <Card
                      key={index}
                      className="border-l-4 border-l-yellow-500"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-medium">{order.testType}</h3>
                            <p className="text-sm text-gray-600">
                              Order ID: {order.orderId} | Ordered:{" "}
                              {new Date(order.orderDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getPriorityColor(order.priority)}>
                              {order.priority}
                            </Badge>
                            <Badge
                              className={getResultStatusColor(order.status)}
                            >
                              {order.status}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Laboratory:</span>
                            <p>{order.laboratory?.name || "Not assigned"}</p>
                          </div>
                          <div>
                            <span className="font-medium">Collection:</span>
                            <p>
                              {order.collectionMethod} |{" "}
                              {order.scheduledDate
                                ? new Date(
                                    order.scheduledDate,
                                  ).toLocaleDateString()
                                : "Not scheduled"}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium">
                              Estimated Result:
                            </span>
                            <p>
                              {order.estimatedResultDate
                                ? new Date(
                                    order.estimatedResultDate,
                                  ).toLocaleDateString()
                                : "TBD"}
                            </p>
                          </div>
                        </div>

                        {order.trackingNumber && (
                          <div className="mt-3 p-2 bg-blue-50 rounded">
                            <span className="text-sm font-medium text-blue-900">
                              Tracking: {order.trackingNumber}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Test Frequency</CardTitle>
                  <CardDescription>
                    Most frequently ordered tests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        test: "Complete Blood Count",
                        count: 12,
                        percentage: 35,
                      },
                      {
                        test: "Basic Metabolic Panel",
                        count: 8,
                        percentage: 24,
                      },
                      { test: "Lipid Panel", count: 6, percentage: 18 },
                      {
                        test: "Liver Function Tests",
                        count: 4,
                        percentage: 12,
                      },
                      { test: "Thyroid Function", count: 4, percentage: 11 },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">
                              {item.test}
                            </span>
                            <span className="text-sm text-gray-600">
                              {item.count} tests
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Result Trends</CardTitle>
                  <CardDescription>
                    Key parameter trends over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        parameter: "Glucose",
                        current: "95 mg/dL",
                        trend: "stable",
                        change: "0%",
                      },
                      {
                        parameter: "Cholesterol",
                        current: "180 mg/dL",
                        trend: "improving",
                        change: "-5%",
                      },
                      {
                        parameter: "Hemoglobin",
                        current: "14.2 g/dL",
                        trend: "stable",
                        change: "+1%",
                      },
                      {
                        parameter: "Creatinine",
                        current: "1.0 mg/dL",
                        trend: "stable",
                        change: "0%",
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded"
                      >
                        <div>
                          <div className="font-medium">{item.parameter}</div>
                          <div className="text-sm text-gray-600">
                            {item.current}
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-sm font-medium ${
                              item.trend === "improving"
                                ? "text-green-600"
                                : item.trend === "worsening"
                                  ? "text-red-600"
                                  : "text-gray-600"
                            }`}
                          >
                            {item.trend}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.change}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LaboratorySystemIntegration;
