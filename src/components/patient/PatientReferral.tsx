import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon,
  CheckCircle,
  Clock,
  Filter,
  MoreVertical,
  Plus,
  Search,
  UserPlus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import ReferralService, { ReferralData } from "@/services/referral.service";

// Using the ReferralData interface from the service

const PatientReferral = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewReferralDialogOpen, setIsNewReferralDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState<ReferralData | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [referrals, setReferrals] = useState<ReferralData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state for new referral
  const [newReferral, setNewReferral] = useState<Partial<ReferralData>>({
    referralDate: new Date(),
    referralSource: "daman",
    referralSourceContact: "",
    patientName: "",
    patientContact: "",
    preliminaryNeeds: "",
    insuranceInfo: "",
    geographicLocation: "",
    acknowledgmentStatus: "Pending",
    initialContactCompleted: false,
    documentationPrepared: false,
    referralStatus: "New",
  });

  // Form state for staff assignment
  const [staffAssignment, setStaffAssignment] = useState({
    nurseSupervisor: "",
    chargeNurse: "",
    caseCoordinator: "",
    assessmentDate: new Date(),
    initialContactCompleted: false,
    documentationPrepared: false,
  });

  // Fetch referrals on component mount
  useEffect(() => {
    fetchReferrals();
  }, []);

  // Fetch all referrals from the API
  const fetchReferrals = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ReferralService.getAllReferrals();
      setReferrals(data);
    } catch (err) {
      console.error("Error fetching referrals:", err);
      setError("Failed to load referrals. Please try again later.");
      // Use mock data as fallback during development
      setReferrals([
        {
          id: "REF001",
          referralDate: new Date(2023, 5, 15),
          referralSource: "Daman",
          referralSourceContact: "Dr. Ahmed Al Zaabi, +971 50 123 4567",
          patientName: "Fatima Al Hashemi",
          patientContact: "+971 55 765 4321",
          preliminaryNeeds: "Post-surgical wound care and mobility assistance",
          insuranceInfo: "Daman Enhanced, Policy #DHA-12345",
          geographicLocation: "Abu Dhabi, Khalidiya",
          acknowledgmentStatus: "Acknowledged",
          acknowledgmentDate: new Date(2023, 5, 15),
          acknowledgedBy: "Nurse Sarah",
          assignedNurseSupervisor: "Mariam Al Ali",
          assignedChargeNurse: "Fatima Hassan",
          initialContactCompleted: true,
          documentationPrepared: true,
          referralStatus: "In Progress",
          statusNotes: "Initial assessment scheduled",
        },
        {
          id: "REF002",
          referralDate: new Date(2023, 5, 18),
          referralSource: "SEHA",
          referralSourceContact: "Dr. Mohammed Al Mansoori, +971 50 987 6543",
          patientName: "Ahmed Al Suwaidi",
          patientContact: "+971 54 321 7654",
          preliminaryNeeds: "Diabetes management and education",
          insuranceInfo: "Thiqa, Policy #THQ-56789",
          geographicLocation: "Abu Dhabi, Al Reem Island",
          acknowledgmentStatus: "Pending",
          initialContactCompleted: false,
          documentationPrepared: false,
          referralStatus: "New",
        },
        {
          id: "REF003",
          referralDate: new Date(2023, 5, 10),
          referralSource: "DOH",
          referralSourceContact: "Dr. Aisha Al Zaabi, +971 56 543 2109",
          patientName: "Khalid Al Mazrouei",
          patientContact: "+971 52 876 5432",
          preliminaryNeeds: "Respiratory therapy and oxygen management",
          insuranceInfo: "Daman Basic, Policy #DHA-67890",
          geographicLocation: "Abu Dhabi, Al Bateen",
          acknowledgmentStatus: "Processed",
          acknowledgmentDate: new Date(2023, 5, 10),
          acknowledgedBy: "Nurse Ahmed",
          assignedNurseSupervisor: "Noura Al Shamsi",
          assignedChargeNurse: "Hamad Al Dhaheri",
          assignedCaseCoordinator: "Latifa Al Nuaimi",
          assessmentScheduledDate: new Date(2023, 5, 12),
          initialContactCompleted: true,
          documentationPrepared: true,
          referralStatus: "Accepted",
          statusNotes: "Care plan initiated",
        },
        {
          id: "REF004",
          referralDate: new Date(2023, 5, 17),
          referralSource: "ZHO",
          referralSourceContact: "Dr. Saeed Al Neyadi, +971 50 345 6789",
          patientName: "Maryam Al Dhaheri",
          patientContact: "+971 55 432 1098",
          preliminaryNeeds: "Pediatric home care for chronic condition",
          insuranceInfo: "Daman Premium, Policy #DHA-24680",
          geographicLocation: "Abu Dhabi, Yas Island",
          acknowledgmentStatus: "Acknowledged",
          acknowledgmentDate: new Date(2023, 5, 17),
          acknowledgedBy: "Nurse Fatima",
          assignedNurseSupervisor: "Hessa Al Falasi",
          initialContactCompleted: true,
          documentationPrepared: false,
          referralStatus: "In Progress",
          statusNotes: "Awaiting insurance approval",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReferralSelect = (referral: ReferralData) => {
    setSelectedReferral(referral);
  };

  const handleAssignStaff = (referral: ReferralData) => {
    setSelectedReferral(referral);
    // Reset staff assignment form
    setStaffAssignment({
      nurseSupervisor: referral.assignedNurseSupervisor || "",
      chargeNurse: referral.assignedChargeNurse || "",
      caseCoordinator: referral.assignedCaseCoordinator || "",
      assessmentDate: referral.assessmentScheduledDate
        ? new Date(referral.assessmentScheduledDate)
        : new Date(),
      initialContactCompleted: referral.initialContactCompleted || false,
      documentationPrepared: referral.documentationPrepared || false,
    });
    setIsAssignDialogOpen(true);
  };

  // Handle form input changes for new referral
  const handleNewReferralChange = (field: string, value: any) => {
    setNewReferral((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle form input changes for staff assignment
  const handleStaffAssignmentChange = (field: string, value: any) => {
    setStaffAssignment((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Submit new referral
  const handleSubmitReferral = async () => {
    try {
      setIsLoading(true);
      const response = await ReferralService.createReferral(
        newReferral as Omit<ReferralData, "id">,
      );
      setReferrals((prev) => [response, ...prev]);
      setIsNewReferralDialogOpen(false);
      toast({
        title: "Success",
        description: "Referral created successfully",
        variant: "default",
      });
      // Reset form
      setNewReferral({
        referralDate: new Date(),
        referralSource: "daman",
        referralSourceContact: "",
        patientName: "",
        patientContact: "",
        preliminaryNeeds: "",
        insuranceInfo: "",
        geographicLocation: "",
        acknowledgmentStatus: "Pending",
        initialContactCompleted: false,
        documentationPrepared: false,
        referralStatus: "New",
      });
    } catch (err) {
      console.error("Error creating referral:", err);
      toast({
        title: "Error",
        description: "Failed to create referral. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Submit staff assignment
  const handleSubmitStaffAssignment = async () => {
    if (!selectedReferral?.id) return;

    try {
      setIsLoading(true);

      // Prepare assignment data
      const assignmentData = {
        nurseSupervisor: staffAssignment.nurseSupervisor,
        chargeNurse: staffAssignment.chargeNurse,
        caseCoordinator: staffAssignment.caseCoordinator,
        assessmentDate: staffAssignment.assessmentDate,
      };

      // Assign staff
      const updatedReferral = await ReferralService.assignStaff(
        selectedReferral.id,
        assignmentData,
      );

      // Update contact status if changed
      if (
        staffAssignment.initialContactCompleted !==
        selectedReferral.initialContactCompleted
      ) {
        await ReferralService.markInitialContact(
          selectedReferral.id,
          staffAssignment.initialContactCompleted,
        );
      }

      // Update documentation status if changed
      if (
        staffAssignment.documentationPrepared !==
        selectedReferral.documentationPrepared
      ) {
        await ReferralService.markDocumentationPrepared(
          selectedReferral.id,
          staffAssignment.documentationPrepared,
        );
      }

      // Update referrals list
      setReferrals((prev) =>
        prev.map((ref) =>
          ref.id === selectedReferral.id
            ? {
                ...ref,
                assignedNurseSupervisor: staffAssignment.nurseSupervisor,
                assignedChargeNurse: staffAssignment.chargeNurse,
                assignedCaseCoordinator: staffAssignment.caseCoordinator,
                assessmentScheduledDate: staffAssignment.assessmentDate,
                initialContactCompleted:
                  staffAssignment.initialContactCompleted,
                documentationPrepared: staffAssignment.documentationPrepared,
              }
            : ref,
        ),
      );

      setIsAssignDialogOpen(false);
      toast({
        title: "Success",
        description: "Staff assigned successfully",
        variant: "default",
      });
    } catch (err) {
      console.error("Error assigning staff:", err);
      toast({
        title: "Error",
        description: "Failed to assign staff. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update referral status
  const handleUpdateStatus = async (
    id: string,
    status: "New" | "In Progress" | "Accepted" | "Declined",
    notes?: string,
  ) => {
    try {
      setIsLoading(true);
      const updatedReferral = await ReferralService.updateStatus(
        id,
        status,
        notes,
      );

      // Update referrals list
      setReferrals((prev) =>
        prev.map((ref) =>
          ref.id === id
            ? {
                ...ref,
                referralStatus: status,
                statusNotes: notes || ref.statusNotes,
              }
            : ref,
        ),
      );

      toast({
        title: "Success",
        description: `Referral status updated to ${status}`,
        variant: "default",
      });
    } catch (err) {
      console.error("Error updating status:", err);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Acknowledge referral
  const handleAcknowledgeReferral = async (
    id: string,
    acknowledgedBy: string,
  ) => {
    try {
      setIsLoading(true);
      const updatedReferral = await ReferralService.acknowledgeReferral(
        id,
        acknowledgedBy,
      );

      // Update referrals list
      setReferrals((prev) =>
        prev.map((ref) =>
          ref.id === id
            ? {
                ...ref,
                acknowledgmentStatus: "Acknowledged",
                acknowledgedBy,
                acknowledgmentDate: new Date(),
              }
            : ref,
        ),
      );

      toast({
        title: "Success",
        description: "Referral acknowledged successfully",
        variant: "default",
      });
    } catch (err) {
      console.error("Error acknowledging referral:", err);
      toast({
        title: "Error",
        description: "Failed to acknowledge referral. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New":
        return "bg-blue-100 text-blue-800";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800";
      case "Accepted":
        return "bg-green-100 text-green-800";
      case "Declined":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAcknowledgmentStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Acknowledged":
        return "bg-blue-100 text-blue-800";
      case "Processed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filter referrals based on search query and active tab
  const filteredReferrals = referrals.filter((referral) => {
    const matchesSearch =
      referral.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      referral.referralSource.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "new")
      return matchesSearch && referral.referralStatus === "New";
    if (activeTab === "in-progress")
      return matchesSearch && referral.referralStatus === "In Progress";
    if (activeTab === "accepted")
      return matchesSearch && referral.referralStatus === "Accepted";
    if (activeTab === "declined")
      return matchesSearch && referral.referralStatus === "Declined";

    return matchesSearch;
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Patient Referral Management</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchReferrals}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Refresh"}
          </Button>
          <Button onClick={() => setIsNewReferralDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Referral
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-800 p-4 mb-6 rounded-md">
          {error}
        </div>
      )}

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by patient name or referral source"
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" /> Filter
              </Button>
              <Select
                defaultValue="all"
                onValueChange={(value) => setActiveTab(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Referrals</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Referral List</CardTitle>
          <CardDescription>
            Manage patient referrals from various healthcare providers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Referral Source</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Acknowledgment</TableHead>
                <TableHead>Assignment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReferrals.length > 0 ? (
                filteredReferrals.map((referral) => (
                  <TableRow key={referral.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {referral.patientName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {referral.patientContact}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{referral.referralSource}</div>
                        <div className="text-sm text-muted-foreground">
                          {referral.referralSourceContact.split(",")[0]}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {referral.referralDate.toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusColor(referral.referralStatus)}
                      >
                        {referral.referralStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getAcknowledgmentStatusColor(
                          referral.acknowledgmentStatus,
                        )}
                      >
                        {referral.acknowledgmentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {referral.assignedNurseSupervisor ? (
                        <div className="text-sm">
                          <div className="font-medium">
                            {referral.assignedNurseSupervisor}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Nurse Supervisor
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAssignStaff(referral)}
                        >
                          <UserPlus className="h-3 w-3 mr-1" /> Assign
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleReferralSelect(referral)}
                          >
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleAssignStaff(referral)}
                          >
                            Assign Staff
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              if (referral.referralStatus === "New") {
                                handleUpdateStatus(referral.id!, "In Progress");
                              } else if (
                                referral.referralStatus === "In Progress"
                              ) {
                                handleUpdateStatus(referral.id!, "Accepted");
                              }
                            }}
                          >
                            {referral.referralStatus === "New"
                              ? "Mark In Progress"
                              : referral.referralStatus === "In Progress"
                                ? "Mark Accepted"
                                : "Update Status"}
                          </DropdownMenuItem>
                          {referral.acknowledgmentStatus === "Pending" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleAcknowledgeReferral(
                                  referral.id!,
                                  "Current User",
                                )
                              }
                            >
                              Acknowledge Referral
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No referrals found matching your search criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* New Referral Dialog */}
      <Dialog
        open={isNewReferralDialogOpen}
        onOpenChange={setIsNewReferralDialogOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>New Patient Referral</DialogTitle>
            <DialogDescription>
              Enter the details of the new patient referral
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="referralSource">Referral Source</Label>
                <Select
                  value={newReferral.referralSource}
                  onValueChange={(value) =>
                    handleNewReferralChange("referralSource", value)
                  }
                >
                  <SelectTrigger id="referralSource">
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daman">Daman</SelectItem>
                    <SelectItem value="seha">SEHA</SelectItem>
                    <SelectItem value="doh">DOH</SelectItem>
                    <SelectItem value="zho">ZHO</SelectItem>
                    <SelectItem value="hhd">HHD</SelectItem>
                    <SelectItem value="salma">Salma Hospital</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="referralDate">Referral Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={"w-full justify-start text-left font-normal"}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? (
                        format(selectedDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="referralSourceContact">
                Referral Source Contact
              </Label>
              <Input
                id="referralSourceContact"
                placeholder="Name, Phone Number, Email"
                value={newReferral.referralSourceContact || ""}
                onChange={(e) =>
                  handleNewReferralChange(
                    "referralSourceContact",
                    e.target.value,
                  )
                }
              />
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patientName">Patient Name</Label>
                <Input
                  id="patientName"
                  placeholder="Full Name"
                  value={newReferral.patientName || ""}
                  onChange={(e) =>
                    handleNewReferralChange("patientName", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patientContact">Patient Contact</Label>
                <Input
                  id="patientContact"
                  placeholder="Phone Number"
                  value={newReferral.patientContact || ""}
                  onChange={(e) =>
                    handleNewReferralChange("patientContact", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preliminaryNeeds">Preliminary Needs</Label>
              <Textarea
                id="preliminaryNeeds"
                placeholder="Brief description of patient's medical needs"
                className="min-h-[80px]"
                value={newReferral.preliminaryNeeds || ""}
                onChange={(e) =>
                  handleNewReferralChange("preliminaryNeeds", e.target.value)
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="insuranceInfo">Insurance Information</Label>
                <Input
                  id="insuranceInfo"
                  placeholder="Provider, Policy Number"
                  value={newReferral.insuranceInfo || ""}
                  onChange={(e) =>
                    handleNewReferralChange("insuranceInfo", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="geographicLocation">Geographic Location</Label>
                <Input
                  id="geographicLocation"
                  placeholder="City, Area/District"
                  value={newReferral.geographicLocation || ""}
                  onChange={(e) =>
                    handleNewReferralChange(
                      "geographicLocation",
                      e.target.value,
                    )
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNewReferralDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitReferral} disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit Referral"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Staff Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Staff to Referral</DialogTitle>
            <DialogDescription>
              {selectedReferral && (
                <span>
                  Assign staff to referral for{" "}
                  <strong>{selectedReferral.patientName}</strong>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nurseSupervisor">Nurse Supervisor</Label>
              <Select
                value={staffAssignment.nurseSupervisor}
                onValueChange={(value) =>
                  handleStaffAssignmentChange("nurseSupervisor", value)
                }
              >
                <SelectTrigger id="nurseSupervisor">
                  <SelectValue placeholder="Select nurse supervisor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mariam">Mariam Al Ali</SelectItem>
                  <SelectItem value="noura">Noura Al Shamsi</SelectItem>
                  <SelectItem value="hessa">Hessa Al Falasi</SelectItem>
                  <SelectItem value="aisha">Aisha Al Zaabi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="chargeNurse">Charge Nurse</Label>
              <Select
                value={staffAssignment.chargeNurse}
                onValueChange={(value) =>
                  handleStaffAssignmentChange("chargeNurse", value)
                }
              >
                <SelectTrigger id="chargeNurse">
                  <SelectValue placeholder="Select charge nurse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fatima">Fatima Hassan</SelectItem>
                  <SelectItem value="hamad">Hamad Al Dhaheri</SelectItem>
                  <SelectItem value="sara">Sara Al Marzouqi</SelectItem>
                  <SelectItem value="ahmed">Ahmed Al Suwaidi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="caseCoordinator">Case Coordinator</Label>
              <Select
                value={staffAssignment.caseCoordinator}
                onValueChange={(value) =>
                  handleStaffAssignmentChange("caseCoordinator", value)
                }
              >
                <SelectTrigger id="caseCoordinator">
                  <SelectValue placeholder="Select case coordinator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latifa">Latifa Al Nuaimi</SelectItem>
                  <SelectItem value="khalid">Khalid Al Mazrouei</SelectItem>
                  <SelectItem value="mona">Mona Al Hashemi</SelectItem>
                  <SelectItem value="saeed">Saeed Al Neyadi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assessmentDate">Assessment Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={"w-full justify-start text-left font-normal"}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, "PPP")
                    ) : (
                      <span>Schedule assessment</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="initialContact"
                  checked={staffAssignment.initialContactCompleted}
                  onCheckedChange={(checked) =>
                    handleStaffAssignmentChange(
                      "initialContactCompleted",
                      checked === true,
                    )
                  }
                />
                <Label htmlFor="initialContact">
                  Initial contact with patient/family completed
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="documentation"
                  checked={staffAssignment.documentationPrepared}
                  onCheckedChange={(checked) =>
                    handleStaffAssignmentChange(
                      "documentationPrepared",
                      checked === true,
                    )
                  }
                />
                <Label htmlFor="documentation">
                  Initial documentation prepared
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAssignDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitStaffAssignment} disabled={isLoading}>
              <CheckCircle className="mr-2 h-4 w-4" />{" "}
              {isLoading ? "Saving..." : "Confirm Assignment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientReferral;
