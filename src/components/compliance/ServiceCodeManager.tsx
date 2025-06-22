import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Code,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowRight,
  Calendar,
  TrendingUp,
  RefreshCw,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Archive,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceCode {
  id: string;
  code: string;
  description: string;
  category: "nursing" | "supportive" | "consultation" | "routine" | "advanced";
  price: number;
  currency: string;
  status: "active" | "deprecated" | "pending" | "inactive";
  effectiveDate: string;
  deprecationDate?: string;
  replacementCode?: string;
  usageCount: number;
  lastUsed: string;
  complianceNotes: string[];
  dohApproved: boolean;
  damanApproved: boolean;
}

interface CodeMapping {
  oldCode: string;
  newCode: string;
  mappingType: "direct" | "split" | "merge" | "conditional";
  effectiveDate: string;
  conversionRules: string[];
  status: "active" | "pending" | "completed";
}

interface ServiceCodeManagerProps {
  className?: string;
}

const ServiceCodeManager: React.FC<ServiceCodeManagerProps> = ({
  className = "",
}) => {
  const [serviceCodes, setServiceCodes] = useState<ServiceCode[]>([]);
  const [codeMappings, setCodeMappings] = useState<CodeMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("codes");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newServiceCode, setNewServiceCode] = useState({
    code: "",
    description: "",
    category: "nursing" as ServiceCode["category"],
    price: 0,
    currency: "AED",
    effectiveDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    loadServiceCodes();
    loadCodeMappings();
  }, []);

  const loadServiceCodes = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/daman-authorization/service-codes");
      if (!response.ok) {
        throw new Error("Failed to fetch service codes");
      }
      const codes = await response.json();
      setServiceCodes(codes);
    } catch (error) {
      console.error("Error loading service codes:", error);
      // Initialize with default codes if none exist
      try {
        const initResponse = await fetch(
          "/api/daman-authorization/service-codes/initialize",
          {
            method: "POST",
          },
        );
        if (initResponse.ok) {
          // Retry loading after initialization
          const retryResponse = await fetch(
            "/api/daman-authorization/service-codes",
          );
          if (retryResponse.ok) {
            const codes = await retryResponse.json();
            setServiceCodes(codes);
          }
        }
      } catch (initError) {
        console.error("Error initializing service codes:", initError);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadCodeMappings = async () => {
    try {
      const mockMappings: CodeMapping[] = [
        {
          oldCode: "17-26-1",
          newCode: "17-25-1",
          mappingType: "direct",
          effectiveDate: "2024-06-01",
          conversionRules: [
            "Direct 1:1 mapping",
            "Price updated from 250 to 300 AED",
            "Same service category maintained",
          ],
          status: "completed",
        },
        {
          oldCode: "17-26-2",
          newCode: "17-25-2",
          mappingType: "direct",
          effectiveDate: "2024-06-01",
          conversionRules: [
            "Direct 1:1 mapping",
            "Price updated from 350 to 300 AED",
            "Service standardization applied",
          ],
          status: "completed",
        },
        {
          oldCode: "17-26-3",
          newCode: "17-25-3",
          mappingType: "conditional",
          effectiveDate: "2024-06-01",
          conversionRules: [
            "Map to 17-25-3 for consultation services",
            "Map to 17-25-4 for routine care",
            "Requires manual review for complex cases",
          ],
          status: "pending",
        },
      ];
      setCodeMappings(mockMappings);
    } catch (error) {
      console.error("Error loading code mappings:", error);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await Promise.all([loadServiceCodes(), loadCodeMappings()]);
    setRefreshing(false);
  };

  const handleAddServiceCode = async () => {
    try {
      const response = await fetch("/api/daman-authorization/service-codes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newServiceCode,
          createdBy: "admin", // In real app, get from auth context
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || "Failed to create service code");
      }

      const result = await response.json();
      console.log("Service code created:", result);

      // Reset form and close
      setNewServiceCode({
        code: "",
        description: "",
        category: "nursing",
        price: 0,
        currency: "AED",
        effectiveDate: new Date().toISOString().split("T")[0],
      });
      setShowAddForm(false);

      // Reload service codes
      await loadServiceCodes();
    } catch (error) {
      console.error("Error creating service code:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleApproveServiceCode = async (
    codeId: string,
    approvalType: "doh" | "daman",
    status: "approved" | "rejected",
  ) => {
    try {
      const response = await fetch(
        `/api/daman-authorization/service-codes/${codeId}/approval`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            approvalType,
            status,
            approvedBy: "admin", // In real app, get from auth context
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || "Failed to update approval status");
      }

      const result = await response.json();
      console.log("Approval updated:", result);

      // Reload service codes
      await loadServiceCodes();
    } catch (error) {
      console.error("Error updating approval:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleDeprecateServiceCode = async (
    codeId: string,
    replacementCode?: string,
  ) => {
    try {
      const response = await fetch(
        `/api/daman-authorization/service-codes/${codeId}/deprecate`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            replacementCode,
            deprecationReason: "Manual deprecation",
            deprecatedBy: "admin", // In real app, get from auth context
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || "Failed to deprecate service code");
      }

      const result = await response.json();
      console.log("Service code deprecated:", result);

      // Reload service codes
      await loadServiceCodes();
    } catch (error) {
      console.error("Error deprecating service code:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "deprecated":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "nursing":
        return "bg-blue-100 text-blue-800";
      case "supportive":
        return "bg-purple-100 text-purple-800";
      case "consultation":
        return "bg-indigo-100 text-indigo-800";
      case "routine":
        return "bg-green-100 text-green-800";
      case "advanced":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const validatePricing = (code: ServiceCode) => {
    const warnings = [];
    if (code.price < 200) {
      warnings.push("Price below minimum threshold");
    }
    if (code.price > 2000) {
      warnings.push("Price above standard range");
    }
    if (!code.dohApproved) {
      warnings.push("DOH approval pending");
    }
    if (!code.damanApproved) {
      warnings.push("Daman approval pending");
    }
    return warnings;
  };

  const filteredCodes = serviceCodes.filter((code) => {
    const matchesStatus =
      filterStatus === "all" || code.status === filterStatus;
    const matchesSearch =
      searchTerm === "" ||
      code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const activeCodes = serviceCodes.filter((code) => code.status === "active");
  const deprecatedCodes = serviceCodes.filter(
    (code) => code.status === "deprecated",
  );
  const pendingCodes = serviceCodes.filter((code) => code.status === "pending");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading service codes...</p>
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
            <Code className="h-6 w-6 mr-3 text-blue-600" />
            Service Code Manager
          </h1>
          <p className="text-gray-600 mt-1">
            Manage service codes (17-25-x), detect deprecated codes, and
            validate pricing
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Service Code
          </Button>
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
      </div>

      {/* Deprecated Codes Alert */}
      {deprecatedCodes.length > 0 && (
        <Alert variant="compliance-high">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Deprecated Service Codes Detected</AlertTitle>
          <AlertDescription>
            {deprecatedCodes.length} deprecated service code(s) found. Please
            update to use the new 17-25-x series codes.
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Codes</p>
                <p className="text-2xl font-bold text-green-600">
                  {activeCodes.length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Deprecated</p>
                <p className="text-2xl font-bold text-red-600">
                  {deprecatedCodes.length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {pendingCodes.length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Price</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(
                    activeCodes.reduce((sum, code) => sum + code.price, 0) /
                      activeCodes.length,
                  )}{" "}
                  AED
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Service Code Form */}
      {showAddForm && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">
              Add New Service Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Code *
                </label>
                <input
                  type="text"
                  placeholder="17-25-X"
                  value={newServiceCode.code}
                  onChange={(e) =>
                    setNewServiceCode({
                      ...newServiceCode,
                      code: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <Select
                  value={newServiceCode.category}
                  onValueChange={(value: ServiceCode["category"]) =>
                    setNewServiceCode({ ...newServiceCode, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nursing">Nursing</SelectItem>
                    <SelectItem value="supportive">Supportive</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="routine">Routine</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  placeholder="Service description"
                  value={newServiceCode.description}
                  onChange={(e) =>
                    setNewServiceCode({
                      ...newServiceCode,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (AED) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newServiceCode.price}
                  onChange={(e) =>
                    setNewServiceCode({
                      ...newServiceCode,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Effective Date *
                </label>
                <input
                  type="date"
                  value={newServiceCode.effectiveDate}
                  onChange={(e) =>
                    setNewServiceCode({
                      ...newServiceCode,
                      effectiveDate: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddServiceCode}
                className="bg-green-600 hover:bg-green-700"
                disabled={
                  !newServiceCode.code ||
                  !newServiceCode.description ||
                  newServiceCode.price <= 0
                }
              >
                Create Service Code
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="codes">Service Codes</TabsTrigger>
          <TabsTrigger value="mappings">Code Mappings</TabsTrigger>
          <TabsTrigger value="pricing">Pricing Validation</TabsTrigger>
          <TabsTrigger value="analytics">Usage Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="codes">
          <Card>
            <CardHeader>
              <CardTitle>Service Codes Management</CardTitle>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search codes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-1 border rounded-md text-sm"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="deprecated">Deprecated</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredCodes.map((code) => {
                  const warnings = validatePricing(code);
                  return (
                    <Card
                      key={code.id}
                      className={cn(
                        "transition-all hover:shadow-md",
                        code.status === "deprecated" &&
                          "border-l-4 border-l-red-500",
                        warnings.length > 0 && "border-l-4 border-l-yellow-500",
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold text-lg">
                                {code.code}
                              </h3>
                              <Badge className={getStatusColor(code.status)}>
                                {code.status}
                              </Badge>
                              <Badge
                                className={getCategoryColor(code.category)}
                              >
                                {code.category}
                              </Badge>
                              {code.dohApproved && (
                                <Badge className="bg-indigo-100 text-indigo-800">
                                  DOH
                                </Badge>
                              )}
                              {code.damanApproved && (
                                <Badge className="bg-green-100 text-green-800">
                                  Daman
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-700 mb-3">
                              {code.description}
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Price:</span>
                                <p className="font-medium">
                                  {code.price} {code.currency}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-600">
                                  Usage Count:
                                </span>
                                <p className="font-medium">{code.usageCount}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">
                                  Last Used:
                                </span>
                                <p className="font-medium">
                                  {new Date(code.lastUsed).toLocaleDateString()}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-600">
                                  Effective:
                                </span>
                                <p className="font-medium">
                                  {new Date(
                                    code.effectiveDate,
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            {code.replacementCode && (
                              <div className="mt-3 p-2 bg-yellow-50 rounded">
                                <div className="flex items-center space-x-2">
                                  <ArrowRight className="h-4 w-4 text-yellow-600" />
                                  <span className="text-sm text-yellow-800">
                                    Use {code.replacementCode} instead
                                  </span>
                                </div>
                              </div>
                            )}
                            {warnings.length > 0 && (
                              <div className="mt-3 p-2 bg-yellow-50 rounded">
                                <h4 className="font-medium text-yellow-800 mb-1">
                                  Validation Warnings:
                                </h4>
                                <ul className="text-sm text-yellow-700 space-y-1">
                                  {warnings.map((warning, index) => (
                                    <li key={index}>• {warning}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {code.complianceNotes.length > 0 && (
                              <div className="mt-3">
                                <h4 className="font-medium text-gray-800 mb-1">
                                  Compliance Notes:
                                </h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                  {code.complianceNotes.map((note, index) => (
                                    <li key={index}>• {note}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col space-y-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            {code.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() =>
                                    handleApproveServiceCode(
                                      code.id,
                                      "doh",
                                      "approved",
                                    )
                                  }
                                >
                                  DOH Approve
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700"
                                  onClick={() =>
                                    handleApproveServiceCode(
                                      code.id,
                                      "daman",
                                      "approved",
                                    )
                                  }
                                >
                                  Daman Approve
                                </Button>
                              </>
                            )}
                            {code.status === "active" && (
                              <Button
                                size="sm"
                                className="bg-orange-600 hover:bg-orange-700"
                                onClick={() =>
                                  handleDeprecateServiceCode(code.id)
                                }
                              >
                                <Archive className="h-3 w-3 mr-1" />
                                Deprecate
                              </Button>
                            )}
                            {code.status === "deprecated" && (
                              <Button
                                size="sm"
                                className="bg-orange-600 hover:bg-orange-700"
                              >
                                Convert
                              </Button>
                            )}
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

        <TabsContent value="mappings">
          <Card>
            <CardHeader>
              <CardTitle>Code Mapping & Conversion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert variant="doh-requirement">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Code Migration Guidelines</AlertTitle>
                  <AlertDescription>
                    All 17-26-x codes have been deprecated as of June 1, 2024.
                    Use the mapping table below to convert to new 17-25-x codes.
                  </AlertDescription>
                </Alert>

                {codeMappings.map((mapping, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <p className="font-mono font-bold text-red-600">
                              {mapping.oldCode}
                            </p>
                            <p className="text-xs text-gray-500">Deprecated</p>
                          </div>
                          <ArrowRight className="h-6 w-6 text-gray-400" />
                          <div className="text-center">
                            <p className="font-mono font-bold text-green-600">
                              {mapping.newCode}
                            </p>
                            <p className="text-xs text-gray-500">Active</p>
                          </div>
                          <Badge
                            className={cn(
                              mapping.mappingType === "direct"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800",
                            )}
                          >
                            {mapping.mappingType}
                          </Badge>
                          <Badge
                            className={cn(
                              mapping.status === "completed"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-orange-100 text-orange-800",
                            )}
                          >
                            {mapping.status}
                          </Badge>
                        </div>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                      <div className="mt-3">
                        <h4 className="font-medium text-gray-800 mb-2">
                          Conversion Rules:
                        </h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {mapping.conversionRules.map((rule, ruleIndex) => (
                            <li key={ruleIndex}>• {rule}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Validation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeCodes.map((code) => {
                  const warnings = validatePricing(code);
                  return (
                    <Card
                      key={code.id}
                      className={cn(
                        warnings.length > 0 && "border-l-4 border-l-yellow-500",
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold">
                                {code.code} - {code.description}
                              </h3>
                              {warnings.length === 0 ? (
                                <Badge className="bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Valid
                                </Badge>
                              ) : (
                                <Badge className="bg-yellow-100 text-yellow-800">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Warnings
                                </Badge>
                              )}
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">
                                  Current Price:
                                </span>
                                <p className="font-medium text-lg">
                                  {code.price} {code.currency}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-600">
                                  DOH Status:
                                </span>
                                <p
                                  className={cn(
                                    "font-medium",
                                    code.dohApproved
                                      ? "text-green-600"
                                      : "text-red-600",
                                  )}
                                >
                                  {code.dohApproved ? "Approved" : "Pending"}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-600">
                                  Daman Status:
                                </span>
                                <p
                                  className={cn(
                                    "font-medium",
                                    code.damanApproved
                                      ? "text-green-600"
                                      : "text-red-600",
                                  )}
                                >
                                  {code.damanApproved ? "Approved" : "Pending"}
                                </p>
                              </div>
                            </div>
                            {warnings.length > 0 && (
                              <div className="mt-3 p-2 bg-yellow-50 rounded">
                                <h4 className="font-medium text-yellow-800 mb-1">
                                  Pricing Issues:
                                </h4>
                                <ul className="text-sm text-yellow-700 space-y-1">
                                  {warnings.map((warning, index) => (
                                    <li key={index}>• {warning}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col space-y-2">
                            <Button size="sm" variant="outline">
                              Update Price
                            </Button>
                            {warnings.length > 0 && (
                              <Button
                                size="sm"
                                className="bg-yellow-600 hover:bg-yellow-700"
                              >
                                Fix Issues
                              </Button>
                            )}
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

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Usage Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeCodes
                    .sort((a, b) => b.usageCount - a.usageCount)
                    .slice(0, 5)
                    .map((code) => (
                      <div
                        key={code.id}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">{code.code}</p>
                          <p className="text-sm text-gray-600">
                            {code.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{code.usageCount}</p>
                          <p className="text-sm text-gray-600">uses</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    "nursing",
                    "supportive",
                    "consultation",
                    "routine",
                    "advanced",
                  ].map((category) => {
                    const categoryCodes = activeCodes.filter(
                      (code) => code.category === category,
                    );
                    const totalRevenue = categoryCodes.reduce(
                      (sum, code) => sum + code.price * code.usageCount,
                      0,
                    );
                    return (
                      <div
                        key={category}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium capitalize">{category}</p>
                          <p className="text-sm text-gray-600">
                            {categoryCodes.length} codes
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">
                            {totalRevenue.toLocaleString()} AED
                          </p>
                          <p className="text-sm text-gray-600">revenue</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ServiceCodeManager;
