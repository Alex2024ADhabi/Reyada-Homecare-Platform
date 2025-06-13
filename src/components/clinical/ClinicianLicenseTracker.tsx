import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Calendar,
  Clock,
  RefreshCw,
  Filter,
  Download,
  Bell,
  AlertTriangle,
  CheckSquare,
  XSquare,
} from "lucide-react";
import { useOfflineSync } from "@/hooks/useOfflineSync";

interface ClinicianLicense {
  id: string;
  clinician_name: string;
  employee_id: string;
  role: string;
  department: string;
  license_number: string;
  license_type: string;
  issuing_authority: string;
  issue_date: string;
  expiry_date: string;
  license_status: string;
  renewal_notification_date: string | null;
  renewal_initiated: boolean;
  renewal_completed: boolean;
  renewal_completion_date: string | null;
  continuing_education_completed: boolean;
  continuing_education_hours: number;
  compliance_status: string;
  currently_active_for_claims: boolean;
  last_used_for_claim: string | null;
  total_claims_associated: number;
  created_at: string;
  updated_at: string;
}

interface ClinicianLicenseTrackerProps {
  isOffline?: boolean;
}

const ClinicianLicenseTracker = ({
  isOffline = false,
}: ClinicianLicenseTrackerProps) => {
  const { isOnline } = useOfflineSync();
  const [activeTab, setActiveTab] = useState("active");
  const [licenses, setLicenses] = useState<ClinicianLicense[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLicense, setSelectedLicense] =
    useState<ClinicianLicense | null>(null);
  const [showNewLicenseDialog, setShowNewLicenseDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form states for new license
  const [newLicense, setNewLicense] = useState({
    clinician_name: "",
    employee_id: "",
    role: "",
    department: "",
    license_number: "",
    license_type: "",
    issuing_authority: "",
    issue_date: "",
    expiry_date: "",
  });

  // Mock data for licenses
  const mockLicenses: ClinicianLicense[] = [
    {
      id: "1",
      clinician_name: "Dr. Sarah Ahmed",
      employee_id: "EMP001",
      role: "Physician",
      department: "Internal Medicine",
      license_number: "DOH-MD-12345",
      license_type: "Medical Doctor",
      issuing_authority: "DOH Abu Dhabi",
      issue_date: "2023-01-15",
      expiry_date: "2024-01-14",
      license_status: "Active",
      renewal_notification_date: "2023-12-15",
      renewal_initiated: false,
      renewal_completed: false,
      renewal_completion_date: null,
      continuing_education_completed: true,
      continuing_education_hours: 50,
      compliance_status: "Compliant",
      currently_active_for_claims: true,
      last_used_for_claim: "2023-10-15",
      total_claims_associated: 45,
      created_at: "2023-01-10",
      updated_at: "2023-10-15",
    },
    {
      id: "2",
      clinician_name: "Fatima Al Hashemi",
      employee_id: "EMP002",
      role: "Nurse",
      department: "Home Care",
      license_number: "DOH-RN-67890",
      license_type: "Registered Nurse",
      issuing_authority: "DOH Abu Dhabi",
      issue_date: "2023-03-20",
      expiry_date: "2023-11-30",
      license_status: "Expired",
      renewal_notification_date: "2023-10-30",
      renewal_initiated: true,
      renewal_completed: false,
      renewal_completion_date: null,
      continuing_education_completed: false,
      continuing_education_hours: 20,
      compliance_status: "Non-Compliant",
      currently_active_for_claims: false,
      last_used_for_claim: "2023-11-25",
      total_claims_associated: 78,
      created_at: "2023-03-15",
      updated_at: "2023-11-26",
    },
    {
      id: "3",
      clinician_name: "Mohammed Al Zaabi",
      employee_id: "EMP003",
      role: "Physical Therapist",
      department: "Rehabilitation",
      license_number: "DOH-PT-54321",
      license_type: "Physical Therapist",
      issuing_authority: "DOH Abu Dhabi",
      issue_date: "2023-05-10",
      expiry_date: "2024-05-09",
      license_status: "Active",
      renewal_notification_date: null,
      renewal_initiated: false,
      renewal_completed: false,
      renewal_completion_date: null,
      continuing_education_completed: true,
      continuing_education_hours: 40,
      compliance_status: "Compliant",
      currently_active_for_claims: true,
      last_used_for_claim: "2023-10-20",
      total_claims_associated: 32,
      created_at: "2023-05-05",
      updated_at: "2023-10-20",
    },
    {
      id: "4",
      clinician_name: "Aisha Al Dhaheri",
      employee_id: "EMP004",
      role: "Occupational Therapist",
      department: "Rehabilitation",
      license_number: "DOH-OT-98765",
      license_type: "Occupational Therapist",
      issuing_authority: "DOH Abu Dhabi",
      issue_date: "2023-02-15",
      expiry_date: "2023-12-15",
      license_status: "Pending Renewal",
      renewal_notification_date: "2023-11-15",
      renewal_initiated: true,
      renewal_completed: false,
      renewal_completion_date: null,
      continuing_education_completed: true,
      continuing_education_hours: 35,
      compliance_status: "Under Review",
      currently_active_for_claims: true,
      last_used_for_claim: "2023-11-10",
      total_claims_associated: 28,
      created_at: "2023-02-10",
      updated_at: "2023-11-15",
    },
  ];

  // Load licenses on component mount
  useEffect(() => {
    const fetchLicenses = async () => {
      try {
        // In a real implementation, this would be an API call
        // For now, we'll use mock data
        setLicenses(mockLicenses);
      } catch (error) {
        console.error("Error fetching clinician licenses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLicenses();
  }, []);

  // Handle input change for new license form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewLicense({
      ...newLicense,
      [name]: value,
    });
  };

  // Create new license
  const handleCreateLicense = () => {
    const newLicenseData: ClinicianLicense = {
      id: `${Date.now()}`,
      ...newLicense,
      license_status: "Active",
      renewal_notification_date: null,
      renewal_initiated: false,
      renewal_completed: false,
      renewal_completion_date: null,
      continuing_education_completed: false,
      continuing_education_hours: 0,
      compliance_status: "Compliant",
      currently_active_for_claims: true,
      last_used_for_claim: null,
      total_claims_associated: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setLicenses([...licenses, newLicenseData]);
    setShowNewLicenseDialog(false);
    setNewLicense({
      clinician_name: "",
      employee_id: "",
      role: "",
      department: "",
      license_number: "",
      license_type: "",
      issuing_authority: "",
      issue_date: "",
      expiry_date: "",
    });
  };

  // Delete license
  const handleDeleteLicense = (id: string) => {
    if (!confirm("Are you sure you want to delete this license?")) return;
    setLicenses(licenses.filter((license) => license.id !== id));
    if (selectedLicense?.id === id) {
      setSelectedLicense(null);
    }
  };

  // Initiate license renewal
  const handleInitiateRenewal = (id: string) => {
    setLicenses(
      licenses.map((license) =>
        license.id === id
          ? {
              ...license,
              renewal_initiated: true,
              renewal_notification_date: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          : license,
      ),
    );
    if (selectedLicense?.id === id) {
      setSelectedLicense({
        ...selectedLicense,
        renewal_initiated: true,
        renewal_notification_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  };

  // Complete license renewal
  const handleCompleteRenewal = (id: string) => {
    const today = new Date();
    const nextYear = new Date(today);
    nextYear.setFullYear(today.getFullYear() + 1);

    setLicenses(
      licenses.map((license) =>
        license.id === id
          ? {
              ...license,
              renewal_initiated: true,
              renewal_completed: true,
              renewal_completion_date: today.toISOString(),
              license_status: "Active",
              issue_date: today.toISOString().split("T")[0],
              expiry_date: nextYear.toISOString().split("T")[0],
              updated_at: today.toISOString(),
            }
          : license,
      ),
    );
    if (selectedLicense?.id === id) {
      setSelectedLicense({
        ...selectedLicense,
        renewal_initiated: true,
        renewal_completed: true,
        renewal_completion_date: today.toISOString(),
        license_status: "Active",
        issue_date: today.toISOString().split("T")[0],
        expiry_date: nextYear.toISOString().split("T")[0],
        updated_at: today.toISOString(),
      });
    }
  };

  // Filter licenses based on active tab and search query
  const filteredLicenses = licenses.filter((license) => {
    const matchesSearch =
      license.clinician_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      license.license_number
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      license.role.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "active") {
      return license.license_status === "Active" && matchesSearch;
    } else if (activeTab === "pending") {
      return license.license_status === "Pending Renewal" && matchesSearch;
    } else if (activeTab === "expired") {
      return license.license_status === "Expired" && matchesSearch;
    } else {
      return matchesSearch;
    }
  });

  // Calculate days until expiration
  const getDaysUntilExpiration = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get badge variant based on license status
  const getLicenseStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Active":
        return "default";
      case "Pending Renewal":
        return "warning";
      case "Expired":
        return "destructive";
      case "Suspended":
        return "destructive";
      default:
        return "secondary";
    }
  };

  // Get badge variant based on compliance status
  const getComplianceStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Compliant":
        return "default";
      case "Non-Compliant":
        return "destructive";
      case "Under Review":
        return "warning";
      default:
        return "secondary";
    }
  };

  return (
    <div className="w-full h-full bg-background p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Clinician License Tracker</h1>
          <p className="text-muted-foreground">
            Manage and monitor clinician licenses and compliance status
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={isOffline ? "destructive" : "secondary"}
            className="text-xs"
          >
            {isOffline ? "Offline Mode" : "Online"}
          </Badge>
          <Button onClick={() => setShowNewLicenseDialog(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add New License
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Licenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{licenses.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all departments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Active Licenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {licenses.filter((l) => l.license_status === "Active").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Valid and compliant
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Renewal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                licenses.filter((l) => l.license_status === "Pending Renewal")
                  .length
              }
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Renewal in progress
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Expired Licenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {licenses.filter((l) => l.license_status === "Expired").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search licenses..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full md:w-auto"
        >
          <TabsList>
            <TabsTrigger value="active">
              <CheckCircle className="h-4 w-4 mr-2" /> Active
            </TabsTrigger>
            <TabsTrigger value="pending">
              <Clock className="h-4 w-4 mr-2" /> Pending
            </TabsTrigger>
            <TabsTrigger value="expired">
              <AlertCircle className="h-4 w-4 mr-2" /> Expired
            </TabsTrigger>
            <TabsTrigger value="all">
              <FileText className="h-4 w-4 mr-2" /> All
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>License Registry</CardTitle>
            <CardDescription>
              View and manage all clinician licenses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-[400px]">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredLicenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Licenses Found</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  {searchQuery
                    ? "No licenses match your search criteria."
                    : "No licenses found in this category."}
                </p>
                <Button
                  onClick={() => setShowNewLicenseDialog(true)}
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add New License
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Clinician</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>License Number</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLicenses.map((license) => {
                      const daysUntilExpiry = getDaysUntilExpiration(
                        license.expiry_date,
                      );
                      return (
                        <TableRow key={license.id}>
                          <TableCell className="font-medium">
                            {license.clinician_name}
                          </TableCell>
                          <TableCell>{license.role}</TableCell>
                          <TableCell>{license.license_number}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>
                                {new Date(
                                  license.expiry_date,
                                ).toLocaleDateString()}
                              </span>
                              {daysUntilExpiry > 0 && daysUntilExpiry <= 30 && (
                                <span className="text-xs text-amber-500">
                                  {daysUntilExpiry} days remaining
                                </span>
                              )}
                              {daysUntilExpiry <= 0 && (
                                <span className="text-xs text-destructive">
                                  Expired
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={getLicenseStatusBadgeVariant(
                                license.license_status,
                              )}
                            >
                              {license.license_status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedLicense(license)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteLicense(license.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <div className="text-sm text-muted-foreground">
              Showing {filteredLicenses.length} of {licenses.length} licenses
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
          </CardFooter>
        </Card>

        <Card>
          {selectedLicense ? (
            <>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedLicense.clinician_name}</CardTitle>
                    <CardDescription>
                      {selectedLicense.role} • {selectedLicense.department}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={getLicenseStatusBadgeVariant(
                      selectedLicense.license_status,
                    )}
                  >
                    {selectedLicense.license_status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">
                      License Details
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          License Number:
                        </span>
                        <span className="font-medium">
                          {selectedLicense.license_number}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          License Type:
                        </span>
                        <span>{selectedLicense.license_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Issuing Authority:
                        </span>
                        <span>{selectedLicense.issuing_authority}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Issue Date:
                        </span>
                        <span>
                          {new Date(
                            selectedLicense.issue_date,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Expiry Date:
                        </span>
                        <span
                          className={
                            getDaysUntilExpiration(
                              selectedLicense.expiry_date,
                            ) <= 0
                              ? "text-destructive font-medium"
                              : ""
                          }
                        >
                          {new Date(
                            selectedLicense.expiry_date,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-2">
                      Compliance Status
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Status:
                        </span>
                        <Badge
                          variant={getComplianceStatusBadgeVariant(
                            selectedLicense.compliance_status,
                          )}
                        >
                          {selectedLicense.compliance_status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          CE Completed:
                        </span>
                        <span>
                          {selectedLicense.continuing_education_completed ? (
                            <CheckSquare className="h-4 w-4 text-green-500" />
                          ) : (
                            <XSquare className="h-4 w-4 text-red-500" />
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          CE Hours:
                        </span>
                        <span>
                          {selectedLicense.continuing_education_hours}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Active for Claims:
                        </span>
                        <span>
                          {selectedLicense.currently_active_for_claims ? (
                            <CheckSquare className="h-4 w-4 text-green-500" />
                          ) : (
                            <XSquare className="h-4 w-4 text-red-500" />
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Claims Associated:
                        </span>
                        <span>{selectedLicense.total_claims_associated}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-2">Renewal Status</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Renewal Initiated:
                        </span>
                        <span>
                          {selectedLicense.renewal_initiated ? (
                            <CheckSquare className="h-4 w-4 text-green-500" />
                          ) : (
                            <XSquare className="h-4 w-4 text-red-500" />
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Renewal Completed:
                        </span>
                        <span>
                          {selectedLicense.renewal_completed ? (
                            <CheckSquare className="h-4 w-4 text-green-500" />
                          ) : (
                            <XSquare className="h-4 w-4 text-red-500" />
                          )}
                        </span>
                      </div>
                      {selectedLicense.renewal_notification_date && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Notification Date:
                          </span>
                          <span>
                            {new Date(
                              selectedLicense.renewal_notification_date,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {selectedLicense.renewal_completion_date && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Completion Date:
                          </span>
                          <span>
                            {new Date(
                              selectedLicense.renewal_completion_date,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2 border-t pt-4">
                {selectedLicense.license_status === "Active" &&
                  getDaysUntilExpiration(selectedLicense.expiry_date) <= 30 && (
                    <Button
                      className="w-full"
                      onClick={() => handleInitiateRenewal(selectedLicense.id)}
                      disabled={selectedLicense.renewal_initiated}
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      {selectedLicense.renewal_initiated
                        ? "Renewal In Progress"
                        : "Initiate Renewal"}
                    </Button>
                  )}
                {(selectedLicense.license_status === "Expired" ||
                  selectedLicense.license_status === "Pending Renewal") && (
                  <Button
                    className="w-full"
                    onClick={() => handleCompleteRenewal(selectedLicense.id)}
                    disabled={selectedLicense.renewal_completed}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {selectedLicense.renewal_completed
                      ? "Renewal Completed"
                      : "Complete Renewal"}
                  </Button>
                )}
                {selectedLicense.license_status === "Expired" &&
                  !selectedLicense.renewal_initiated && (
                    <Button
                      className="w-full"
                      variant="destructive"
                      onClick={() => handleInitiateRenewal(selectedLicense.id)}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Urgent: Initiate Renewal
                    </Button>
                  )}
              </CardFooter>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[500px] text-center p-4">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No License Selected</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Select a license from the list to view details and manage
                renewals.
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* New License Dialog */}
      <Dialog
        open={showNewLicenseDialog}
        onOpenChange={setShowNewLicenseDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New License</DialogTitle>
            <DialogDescription>
              Enter the details for the new clinician license
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clinician_name">Clinician Name</Label>
                <Input
                  id="clinician_name"
                  name="clinician_name"
                  value={newLicense.clinician_name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employee_id">Employee ID</Label>
                <Input
                  id="employee_id"
                  name="employee_id"
                  value={newLicense.employee_id}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  name="role"
                  value={newLicense.role}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  name="department"
                  value={newLicense.department}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="license_number">License Number</Label>
              <Input
                id="license_number"
                name="license_number"
                value={newLicense.license_number}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="license_type">License Type</Label>
                <Input
                  id="license_type"
                  name="license_type"
                  value={newLicense.license_type}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="issuing_authority">Issuing Authority</Label>
                <Input
                  id="issuing_authority"
                  name="issuing_authority"
                  value={newLicense.issuing_authority}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="issue_date">Issue Date</Label>
                <Input
                  id="issue_date"
                  name="issue_date"
                  type="date"
                  value={newLicense.issue_date}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiry_date">Expiry Date</Label>
                <Input
                  id="expiry_date"
                  name="expiry_date"
                  type="date"
                  value={newLicense.expiry_date}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewLicenseDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateLicense}>Add License</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClinicianLicenseTracker;
