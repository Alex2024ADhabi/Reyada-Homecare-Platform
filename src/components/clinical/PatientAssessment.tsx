import React, { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  FileText,
  Users,
  Clipboard,
  Shield,
  Activity,
  Stethoscope,
  MapPin,
  Plus,
  Check,
  AlertCircle,
  Save,
} from "lucide-react";

interface AssessmentStaff {
  id: string;
  name: string;
  role: string;
  specialty?: string;
  available: boolean;
}

interface PatientAssessment {
  id: string;
  patientId: string;
  referralId: string;

  // Assessment Scheduling
  assessmentDate?: string;
  assessmentTime?: string;
  estimatedDuration?: number; // minutes
  assignedStaff: AssessmentStaff[];

  // Pre-Assessment Requirements
  medicalRecordsCollected: boolean;
  medicalRecordsCollectionDate?: string;
  medicalRecordsCollectedBy?: string;
  dischargeSummaryAvailable: boolean;
  labResultsAvailable: boolean;
  imagingReportsAvailable: boolean;
  medicationListAvailable: boolean;
  specialistNotesAvailable: boolean;
  insuranceAuthorizationAvailable?: boolean; // Added as per spec

  // Assessment Components
  nursingAssessmentCompleted: boolean;
  nursingAssessmentDate?: string;
  nursingAssessor?: string;

  infectionControlAssessmentCompleted: boolean;
  infectionControlDate?: string;
  infectionControlOfficer?: string;
  infectionControlRiskLevel?: "Low" | "Medium" | "High";
  ppeRequirements?: string[];

  ptAssessmentRequired: boolean;
  ptAssessmentCompleted: boolean;
  ptAssessmentDate?: string;
  ptAssessor?: string;

  otAssessmentRequired: boolean;
  otAssessmentCompleted: boolean;
  otAssessmentDate?: string;
  otAssessor?: string;

  stAssessmentRequired: boolean;
  stAssessmentCompleted: boolean;
  stAssessmentDate?: string;
  stAssessor?: string;

  rtAssessmentRequired: boolean;
  rtAssessmentCompleted: boolean;
  rtAssessmentDate?: string;
  rtAssessor?: string;

  // Assessment Results
  recommendedLevelOfCare?: string;
  recommendedServices?: string[];
  functionalStatusScore?: number;
  bradenScaleScore?: number;
  morseFallScaleScore?: number;
  familyCaregiverCapability?: "Low" | "Medium" | "High";

  // Geographic and Logistics
  patientAddress?: string;
  geographicZone?: string;
  travelTimeEstimate?: number; // minutes
  parkingAvailability?: string;
  homeAccessNotes?: string;

  // Resource Planning
  recommendedVisitFrequency?: string;
  estimatedVisitDuration?: number;
  specialEquipmentNeeded?: string[];
  staffingRequirements?: string;

  // Status and Follow-up
  assessmentStatus: "Scheduled" | "In Progress" | "Completed" | "Cancelled";
  assessmentOutcome?: "Accepted" | "Declined" | "Referred";
  followUpRequired: boolean;
  followUpNotes?: string;

  createdAt: string;
  updatedAt: string;
}

interface PatientAssessmentProps {
  patientId?: string;
  referralId?: string;
  isOffline?: boolean;
}

const PatientAssessment: React.FC<PatientAssessmentProps> = ({
  patientId = "P12345",
  referralId = "REF789",
  isOffline = false,
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [activeProcess, setActiveProcess] = useState("medical-records");

  // Mock assessment data
  const [assessment, setAssessment] = useState<PatientAssessment>({
    id: "ASS001",
    patientId: patientId,
    referralId: referralId,
    assignedStaff: [],
    medicalRecordsCollected: false,
    dischargeSummaryAvailable: false,
    labResultsAvailable: false,
    imagingReportsAvailable: false,
    medicationListAvailable: false,
    specialistNotesAvailable: false,
    insuranceAuthorizationAvailable: false,
    nursingAssessmentCompleted: false,
    infectionControlAssessmentCompleted: false,
    ptAssessmentRequired: false,
    ptAssessmentCompleted: false,
    otAssessmentRequired: false,
    otAssessmentCompleted: false,
    stAssessmentRequired: false,
    stAssessmentCompleted: false,
    rtAssessmentRequired: false,
    rtAssessmentCompleted: false,
    followUpRequired: false,
    assessmentStatus: "Scheduled",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Mock staff data
  const availableStaff: AssessmentStaff[] = [
    {
      id: "S001",
      name: "Dr. Sarah Ahmed",
      role: "Head Nurse",
      available: true,
    },
    {
      id: "S002",
      name: "Fatima Al Hashemi",
      role: "Nurse Supervisor",
      available: true,
    },
    {
      id: "S003",
      name: "Mohammed Al Zaabi",
      role: "Charge Nurse",
      available: false,
    },
    {
      id: "S004",
      name: "Aisha Al Suwaidi",
      role: "Infection Control Officer",
      available: true,
    },
    {
      id: "S005",
      name: "Khalid Al Mansouri",
      role: "Therapist Supervisor",
      available: true,
    },
    {
      id: "S006",
      name: "Noura Al Marzouqi",
      role: "Physical Therapist",
      specialty: "Neurological",
      available: true,
    },
    {
      id: "S007",
      name: "Ahmed Al Dhaheri",
      role: "Occupational Therapist",
      available: false,
    },
    {
      id: "S008",
      name: "Maryam Al Shamsi",
      role: "Speech Therapist",
      available: true,
    },
    {
      id: "S009",
      name: "Omar Al Nuaimi",
      role: "Respiratory Therapist",
      available: true,
    },
  ];

  const [isSchedulingDialogOpen, setIsSchedulingDialogOpen] = useState(false);
  const [isStaffAssignmentDialogOpen, setIsStaffAssignmentDialogOpen] =
    useState(false);

  const calculateCompletionPercentage = () => {
    let totalFields = 0;
    let completedFields = 0;

    // Pre-Assessment Requirements
    if (assessment.medicalRecordsCollected) completedFields++;
    totalFields++;

    // Required documents
    if (assessment.dischargeSummaryAvailable) completedFields++;
    if (assessment.labResultsAvailable) completedFields++;
    if (assessment.imagingReportsAvailable) completedFields++;
    if (assessment.medicationListAvailable) completedFields++;
    if (assessment.specialistNotesAvailable) completedFields++;
    if (assessment.insuranceAuthorizationAvailable) completedFields++;
    totalFields += 6;

    // Assessment Components
    if (assessment.nursingAssessmentCompleted) completedFields++;
    totalFields++;

    if (assessment.infectionControlAssessmentCompleted) completedFields++;
    totalFields++;

    if (assessment.ptAssessmentRequired) {
      totalFields++;
      if (assessment.ptAssessmentCompleted) completedFields++;
    }

    if (assessment.otAssessmentRequired) {
      totalFields++;
      if (assessment.otAssessmentCompleted) completedFields++;
    }

    if (assessment.stAssessmentRequired) {
      totalFields++;
      if (assessment.stAssessmentCompleted) completedFields++;
    }

    if (assessment.rtAssessmentRequired) {
      totalFields++;
      if (assessment.rtAssessmentCompleted) completedFields++;
    }

    // Assessment Results
    if (assessment.recommendedLevelOfCare) completedFields++;
    if (
      assessment.recommendedServices &&
      assessment.recommendedServices.length > 0
    )
      completedFields++;
    if (assessment.functionalStatusScore) completedFields++;
    if (assessment.bradenScaleScore) completedFields++;
    if (assessment.morseFallScaleScore) completedFields++;
    if (assessment.familyCaregiverCapability) completedFields++;
    totalFields += 6;

    // Geographic and Logistics
    if (assessment.patientAddress) completedFields++;
    if (assessment.geographicZone) completedFields++;
    if (assessment.travelTimeEstimate) completedFields++;
    totalFields += 3;

    return Math.round((completedFields / totalFields) * 100);
  };

  const completionPercentage = calculateCompletionPercentage();

  const handleScheduleAssessment = () => {
    // In a real implementation, this would save the assessment date and time
    setIsSchedulingDialogOpen(false);

    // Update the assessment with the new date and time
    setAssessment((prev) => ({
      ...prev,
      assessmentDate: "2023-07-15",
      assessmentTime: "10:00",
      estimatedDuration: 120,
      assessmentStatus: "Scheduled",
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleAssignStaff = () => {
    // In a real implementation, this would save the assigned staff
    setIsStaffAssignmentDialogOpen(false);

    // Update the assessment with the assigned staff
    setAssessment((prev) => ({
      ...prev,
      assignedStaff: [
        availableStaff[0], // Head Nurse
        availableStaff[3], // Infection Control Officer
        availableStaff[5], // Physical Therapist
      ],
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleSaveAssessment = () => {
    // In a real implementation, this would save the assessment to the database
    if (isOffline) {
      alert(
        "Assessment saved locally. Will sync when online connection is restored.",
      );
    } else {
      alert("Assessment saved successfully.");
    }
  };

  const handleToggleRequirement = (
    field: keyof PatientAssessment,
    value: boolean,
  ) => {
    setAssessment((prev) => ({
      ...prev,
      [field]: value,
      updatedAt: new Date().toISOString(),
    }));
  };

  return (
    <div className="w-full h-full bg-background p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold">Patient Assessment</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">Patient ID: {patientId}</Badge>
            <Badge variant="outline">Referral ID: {referralId}</Badge>
            <Badge
              variant={
                assessment.assessmentStatus === "Completed"
                  ? "success"
                  : assessment.assessmentStatus === "In Progress"
                    ? "default"
                    : assessment.assessmentStatus === "Cancelled"
                      ? "destructive"
                      : "outline"
              }
            >
              {assessment.assessmentStatus}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog
            open={isSchedulingDialogOpen}
            onOpenChange={setIsSchedulingDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Assessment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule Patient Assessment</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="assessment-date">Assessment Date</Label>
                    <Input id="assessment-date" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assessment-time">Assessment Time</Label>
                    <Input id="assessment-time" type="time" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimated-duration">
                    Estimated Duration (minutes)
                  </Label>
                  <Input
                    id="estimated-duration"
                    type="number"
                    defaultValue="120"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assessment-notes">Notes</Label>
                  <Textarea
                    id="assessment-notes"
                    placeholder="Enter any special instructions or notes for this assessment"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsSchedulingDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleScheduleAssessment}>Schedule</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isStaffAssignmentDialogOpen}
            onOpenChange={setIsStaffAssignmentDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Assign Staff
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Assign Staff to Assessment</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Select</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Specialty</TableHead>
                      <TableHead>Availability</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {availableStaff.map((staff) => (
                      <TableRow key={staff.id}>
                        <TableCell>
                          <Checkbox id={`staff-${staff.id}`} />
                        </TableCell>
                        <TableCell>{staff.name}</TableCell>
                        <TableCell>{staff.role}</TableCell>
                        <TableCell>{staff.specialty || "-"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              staff.available ? "outline" : "destructive"
                            }
                          >
                            {staff.available ? "Available" : "Unavailable"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsStaffAssignmentDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAssignStaff}>
                  Assign Selected Staff
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button onClick={handleSaveAssessment}>
            <Save className="mr-2 h-4 w-4" />
            Save Assessment
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assessment Processes - Takes 2/3 of space on large screens */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Processes</CardTitle>
              <CardDescription>
                Complete the 5 assessment processes as required by DOH standards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeProcess} onValueChange={setActiveProcess}>
                <TabsList className="grid grid-cols-5 mb-4">
                  <TabsTrigger value="medical-records">
                    <Clipboard className="h-4 w-4 mr-2" />
                    Medical Records
                  </TabsTrigger>
                  <TabsTrigger value="home-assessment">
                    <MapPin className="h-4 w-4 mr-2" />
                    Home Assessment
                  </TabsTrigger>
                  <TabsTrigger value="infection-control">
                    <Shield className="h-4 w-4 mr-2" />
                    Infection Control
                  </TabsTrigger>
                  <TabsTrigger value="clinical-assessment">
                    <Stethoscope className="h-4 w-4 mr-2" />
                    Clinical Assessment
                  </TabsTrigger>
                  <TabsTrigger value="therapy-assessment">
                    <Activity className="h-4 w-4 mr-2" />
                    Therapy Assessment
                  </TabsTrigger>
                </TabsList>

                {/* Medical Records Collection Process */}
                <TabsContent value="medical-records" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">
                      Medical Records Collection
                    </h3>
                    <Badge
                      variant={
                        assessment.medicalRecordsCollected
                          ? "success"
                          : "outline"
                      }
                    >
                      {assessment.medicalRecordsCollected
                        ? "Collected"
                        : "Pending"}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Ensure to collect the updated Medical Reports of the patient
                    before the assessment for any new referral. This includes
                    discharge summaries, laboratory results, imaging reports,
                    medication lists, and any specialist consultations from the
                    past 30 days.
                  </p>

                  <div className="bg-muted/50 p-4 rounded-md">
                    <h4 className="font-medium mb-2">Required Documents</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="discharge-summary"
                          checked={assessment.dischargeSummaryAvailable}
                          onCheckedChange={(checked) =>
                            handleToggleRequirement(
                              "dischargeSummaryAvailable",
                              checked === true,
                            )
                          }
                        />
                        <Label htmlFor="discharge-summary">
                          Discharge summary from referring hospital
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="lab-results"
                          checked={assessment.labResultsAvailable}
                          onCheckedChange={(checked) =>
                            handleToggleRequirement(
                              "labResultsAvailable",
                              checked === true,
                            )
                          }
                        />
                        <Label htmlFor="lab-results">
                          Laboratory results (last 30 days)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="imaging-reports"
                          checked={assessment.imagingReportsAvailable}
                          onCheckedChange={(checked) =>
                            handleToggleRequirement(
                              "imagingReportsAvailable",
                              checked === true,
                            )
                          }
                        />
                        <Label htmlFor="imaging-reports">
                          Imaging reports and studies
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="medication-list"
                          checked={assessment.medicationListAvailable}
                          onCheckedChange={(checked) =>
                            handleToggleRequirement(
                              "medicationListAvailable",
                              checked === true,
                            )
                          }
                        />
                        <Label htmlFor="medication-list">
                          Current medication list with dosages
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="specialist-notes"
                          checked={assessment.specialistNotesAvailable}
                          onCheckedChange={(checked) =>
                            handleToggleRequirement(
                              "specialistNotesAvailable",
                              checked === true,
                            )
                          }
                        />
                        <Label htmlFor="specialist-notes">
                          Specialist consultation notes
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="insurance-authorization"
                          checked={assessment.insuranceAuthorizationAvailable}
                          onCheckedChange={(checked) =>
                            handleToggleRequirement(
                              "insuranceAuthorizationAvailable",
                              checked === true,
                            )
                          }
                        />
                        <Label htmlFor="insurance-authorization">
                          Insurance authorization documents
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 mt-4">
                    <Checkbox
                      id="medical-records-collected"
                      checked={assessment.medicalRecordsCollected}
                      onCheckedChange={(checked) =>
                        handleToggleRequirement(
                          "medicalRecordsCollected",
                          checked === true,
                        )
                      }
                    />
                    <Label
                      htmlFor="medical-records-collected"
                      className="font-medium"
                    >
                      I confirm all required medical records have been collected
                    </Label>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="collection-date">Collection Date</Label>
                      <Input
                        id="collection-date"
                        type="date"
                        value={assessment.medicalRecordsCollectionDate || ""}
                        onChange={(e) =>
                          setAssessment((prev) => ({
                            ...prev,
                            medicalRecordsCollectionDate: e.target.value,
                            updatedAt: new Date().toISOString(),
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="collected-by">Collected By</Label>
                      <Select
                        value={assessment.medicalRecordsCollectedBy || ""}
                        onValueChange={(value) =>
                          setAssessment((prev) => ({
                            ...prev,
                            medicalRecordsCollectedBy: value,
                            updatedAt: new Date().toISOString(),
                          }))
                        }
                      >
                        <SelectTrigger id="collected-by">
                          <SelectValue placeholder="Select staff member" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableStaff
                            .filter(
                              (staff) =>
                                staff.role === "Head Nurse" ||
                                staff.role === "Nurse Supervisor",
                            )
                            .map((staff) => (
                              <SelectItem key={staff.id} value={staff.id}>
                                {staff.name} ({staff.role})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                {/* Home Assessment Coordination Process */}
                <TabsContent value="home-assessment" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">
                      Home Assessment Coordination
                    </h3>
                    <Badge variant="outline">
                      {assessment.assessmentDate
                        ? "Scheduled"
                        : "Not Scheduled"}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Coordinate and schedule face-to-face home assessment visits
                    ensuring appropriate clinical staff assignment based on
                    patient needs and geographic location. Manage assessment
                    logistics including transportation, equipment requirements,
                    and family availability.
                  </p>

                  <div className="bg-muted/50 p-4 rounded-md">
                    <h4 className="font-medium mb-2">Scheduling Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Assessment Date</Label>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {assessment.assessmentDate || "Not scheduled"}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Assessment Time</Label>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {assessment.assessmentTime || "Not scheduled"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-md">
                    <h4 className="font-medium mb-2">Geographic Information</h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="patient-address">Patient Address</Label>
                        <Textarea
                          id="patient-address"
                          placeholder="Enter patient's full address"
                          value={assessment.patientAddress || ""}
                          onChange={(e) =>
                            setAssessment((prev) => ({
                              ...prev,
                              patientAddress: e.target.value,
                              updatedAt: new Date().toISOString(),
                            }))
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="geographic-zone">
                            Geographic Zone
                          </Label>
                          <Select
                            value={assessment.geographicZone || ""}
                            onValueChange={(value) =>
                              setAssessment((prev) => ({
                                ...prev,
                                geographicZone: value,
                                updatedAt: new Date().toISOString(),
                              }))
                            }
                          >
                            <SelectTrigger id="geographic-zone">
                              <SelectValue placeholder="Select zone" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="north">North Zone</SelectItem>
                              <SelectItem value="south">South Zone</SelectItem>
                              <SelectItem value="east">East Zone</SelectItem>
                              <SelectItem value="west">West Zone</SelectItem>
                              <SelectItem value="central">
                                Central Zone
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="travel-time">
                            Estimated Travel Time (minutes)
                          </Label>
                          <Input
                            id="travel-time"
                            type="number"
                            placeholder="30"
                            value={assessment.travelTimeEstimate || ""}
                            onChange={(e) =>
                              setAssessment((prev) => ({
                                ...prev,
                                travelTimeEstimate: parseInt(e.target.value),
                                updatedAt: new Date().toISOString(),
                              }))
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="parking-availability">
                          Parking Availability
                        </Label>
                        <Select
                          value={assessment.parkingAvailability || ""}
                          onValueChange={(value) =>
                            setAssessment((prev) => ({
                              ...prev,
                              parkingAvailability: value,
                              updatedAt: new Date().toISOString(),
                            }))
                          }
                        >
                          <SelectTrigger id="parking-availability">
                            <SelectValue placeholder="Select parking option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ample">Ample Parking</SelectItem>
                            <SelectItem value="limited">
                              Limited Parking
                            </SelectItem>
                            <SelectItem value="street">
                              Street Parking Only
                            </SelectItem>
                            <SelectItem value="none">
                              No Parking Available
                            </SelectItem>
                            <SelectItem value="paid">Paid Parking</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="home-access-notes">
                          Home Access Notes
                        </Label>
                        <Textarea
                          id="home-access-notes"
                          placeholder="Enter any special instructions for accessing the home"
                          value={assessment.homeAccessNotes || ""}
                          onChange={(e) =>
                            setAssessment((prev) => ({
                              ...prev,
                              homeAccessNotes: e.target.value,
                              updatedAt: new Date().toISOString(),
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-md">
                    <h4 className="font-medium mb-2">Assigned Staff</h4>
                    {assessment.assignedStaff.length > 0 ? (
                      <div className="space-y-2">
                        {assessment.assignedStaff.map((staff) => (
                          <div
                            key={staff.id}
                            className="flex items-center justify-between p-2 bg-background rounded-md"
                          >
                            <div>
                              <p className="font-medium">{staff.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {staff.role}
                              </p>
                            </div>
                            <Badge variant="outline">
                              {staff.specialty || staff.role}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No staff assigned yet. Use the "Assign Staff" button to
                        assign staff members.
                      </p>
                    )}
                  </div>

                  <div className="bg-muted/50 p-4 rounded-md">
                    <h4 className="font-medium mb-2">Equipment Preparation</h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="special-equipment">
                          Special Equipment Needed
                        </Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="equipment-wheelchair" />
                            <Label htmlFor="equipment-wheelchair">
                              Wheelchair
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="equipment-oxygen" />
                            <Label htmlFor="equipment-oxygen">
                              Oxygen Equipment
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="equipment-vitals" />
                            <Label htmlFor="equipment-vitals">
                              Vital Signs Equipment
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="equipment-wound" />
                            <Label htmlFor="equipment-wound">
                              Wound Care Kit
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="equipment-assessment" />
                            <Label htmlFor="equipment-assessment">
                              Assessment Forms
                            </Label>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="visit-frequency">
                          Recommended Visit Frequency
                        </Label>
                        <Select
                          value={assessment.recommendedVisitFrequency || ""}
                          onValueChange={(value) =>
                            setAssessment((prev) => ({
                              ...prev,
                              recommendedVisitFrequency: value,
                              updatedAt: new Date().toISOString(),
                            }))
                          }
                        >
                          <SelectTrigger id="visit-frequency">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="twice-weekly">
                              Twice Weekly
                            </SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="biweekly">Bi-weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="visit-duration">
                          Estimated Visit Duration (minutes)
                        </Label>
                        <Input
                          id="visit-duration"
                          type="number"
                          placeholder="60"
                          value={assessment.estimatedVisitDuration || ""}
                          onChange={(e) =>
                            setAssessment((prev) => ({
                              ...prev,
                              estimatedVisitDuration: parseInt(e.target.value),
                              updatedAt: new Date().toISOString(),
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Infection Control Assessment Process */}
                <TabsContent value="infection-control" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">
                      Infection Control Assessment
                    </h3>
                    <Badge
                      variant={
                        assessment.infectionControlAssessmentCompleted
                          ? "success"
                          : "outline"
                      }
                    >
                      {assessment.infectionControlAssessmentCompleted
                        ? "Completed"
                        : "Pending"}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Conduct infection control risk assessment for all new
                    patients including review of infectious disease history,
                    current isolation requirements, and home environment safety
                    for healthcare workers.
                  </p>

                  <div className="bg-muted/50 p-4 rounded-md">
                    <h4 className="font-medium mb-2">
                      Infection Control Risk Assessment
                    </h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="infection-risk-level">Risk Level</Label>
                        <Select
                          value={assessment.infectionControlRiskLevel || ""}
                          onValueChange={(value) =>
                            setAssessment((prev) => ({
                              ...prev,
                              infectionControlRiskLevel: value as
                                | "Low"
                                | "Medium"
                                | "High",
                              updatedAt: new Date().toISOString(),
                            }))
                          }
                        >
                          <SelectTrigger id="infection-risk-level">
                            <SelectValue placeholder="Select risk level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Low">Low Risk</SelectItem>
                            <SelectItem value="Medium">Medium Risk</SelectItem>
                            <SelectItem value="High">High Risk</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>PPE Requirements</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="ppe-gloves"
                              onCheckedChange={(checked) => {
                                const currentPPE =
                                  assessment.ppeRequirements || [];
                                if (checked) {
                                  setAssessment((prev) => ({
                                    ...prev,
                                    ppeRequirements: [...currentPPE, "Gloves"],
                                    updatedAt: new Date().toISOString(),
                                  }));
                                } else {
                                  setAssessment((prev) => ({
                                    ...prev,
                                    ppeRequirements: currentPPE.filter(
                                      (item) => item !== "Gloves",
                                    ),
                                    updatedAt: new Date().toISOString(),
                                  }));
                                }
                              }}
                              checked={(
                                assessment.ppeRequirements || []
                              ).includes("Gloves")}
                            />
                            <Label htmlFor="ppe-gloves">Gloves</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="ppe-mask"
                              onCheckedChange={(checked) => {
                                const currentPPE =
                                  assessment.ppeRequirements || [];
                                if (checked) {
                                  setAssessment((prev) => ({
                                    ...prev,
                                    ppeRequirements: [
                                      ...currentPPE,
                                      "Surgical Mask",
                                    ],
                                    updatedAt: new Date().toISOString(),
                                  }));
                                } else {
                                  setAssessment((prev) => ({
                                    ...prev,
                                    ppeRequirements: currentPPE.filter(
                                      (item) => item !== "Surgical Mask",
                                    ),
                                    updatedAt: new Date().toISOString(),
                                  }));
                                }
                              }}
                              checked={(
                                assessment.ppeRequirements || []
                              ).includes("Surgical Mask")}
                            />
                            <Label htmlFor="ppe-mask">Surgical Mask</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="ppe-n95"
                              onCheckedChange={(checked) => {
                                const currentPPE =
                                  assessment.ppeRequirements || [];
                                if (checked) {
                                  setAssessment((prev) => ({
                                    ...prev,
                                    ppeRequirements: [
                                      ...currentPPE,
                                      "N95 Respirator",
                                    ],
                                    updatedAt: new Date().toISOString(),
                                  }));
                                } else {
                                  setAssessment((prev) => ({
                                    ...prev,
                                    ppeRequirements: currentPPE.filter(
                                      (item) => item !== "N95 Respirator",
                                    ),
                                    updatedAt: new Date().toISOString(),
                                  }));
                                }
                              }}
                              checked={(
                                assessment.ppeRequirements || []
                              ).includes("N95 Respirator")}
                            />
                            <Label htmlFor="ppe-n95">N95 Respirator</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="ppe-gown"
                              onCheckedChange={(checked) => {
                                const currentPPE =
                                  assessment.ppeRequirements || [];
                                if (checked) {
                                  setAssessment((prev) => ({
                                    ...prev,
                                    ppeRequirements: [
                                      ...currentPPE,
                                      "Isolation Gown",
                                    ],
                                    updatedAt: new Date().toISOString(),
                                  }));
                                } else {
                                  setAssessment((prev) => ({
                                    ...prev,
                                    ppeRequirements: currentPPE.filter(
                                      (item) => item !== "Isolation Gown",
                                    ),
                                    updatedAt: new Date().toISOString(),
                                  }));
                                }
                              }}
                              checked={(
                                assessment.ppeRequirements || []
                              ).includes("Isolation Gown")}
                            />
                            <Label htmlFor="ppe-gown">Isolation Gown</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="ppe-eye"
                              onCheckedChange={(checked) => {
                                const currentPPE =
                                  assessment.ppeRequirements || [];
                                if (checked) {
                                  setAssessment((prev) => ({
                                    ...prev,
                                    ppeRequirements: [
                                      ...currentPPE,
                                      "Eye Protection",
                                    ],
                                    updatedAt: new Date().toISOString(),
                                  }));
                                } else {
                                  setAssessment((prev) => ({
                                    ...prev,
                                    ppeRequirements: currentPPE.filter(
                                      (item) => item !== "Eye Protection",
                                    ),
                                    updatedAt: new Date().toISOString(),
                                  }));
                                }
                              }}
                              checked={(
                                assessment.ppeRequirements || []
                              ).includes("Eye Protection")}
                            />
                            <Label htmlFor="ppe-eye">Eye Protection</Label>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="infection-control-notes">
                          Infection Control Notes
                        </Label>
                        <Textarea
                          id="infection-control-notes"
                          placeholder="Enter any specific infection control notes or concerns"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 mt-4">
                    <Checkbox
                      id="infection-control-completed"
                      checked={assessment.infectionControlAssessmentCompleted}
                      onCheckedChange={(checked) =>
                        handleToggleRequirement(
                          "infectionControlAssessmentCompleted",
                          checked === true,
                        )
                      }
                    />
                    <Label
                      htmlFor="infection-control-completed"
                      className="font-medium"
                    >
                      I confirm the infection control assessment has been
                      completed
                    </Label>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="infection-control-date">
                        Assessment Date
                      </Label>
                      <Input
                        id="infection-control-date"
                        type="date"
                        value={assessment.infectionControlDate || ""}
                        onChange={(e) =>
                          setAssessment((prev) => ({
                            ...prev,
                            infectionControlDate: e.target.value,
                            updatedAt: new Date().toISOString(),
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="infection-control-officer">
                        Infection Control Officer
                      </Label>
                      <Select
                        value={assessment.infectionControlOfficer || ""}
                        onValueChange={(value) =>
                          setAssessment((prev) => ({
                            ...prev,
                            infectionControlOfficer: value,
                            updatedAt: new Date().toISOString(),
                          }))
                        }
                      >
                        <SelectTrigger id="infection-control-officer">
                          <SelectValue placeholder="Select officer" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableStaff
                            .filter(
                              (staff) =>
                                staff.role === "Infection Control Officer",
                            )
                            .map((staff) => (
                              <SelectItem key={staff.id} value={staff.id}>
                                {staff.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                {/* Clinical Assessment Execution Process */}
                <TabsContent value="clinical-assessment" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">
                      Clinical Assessment Execution
                    </h3>
                    <Badge
                      variant={
                        assessment.nursingAssessmentCompleted
                          ? "success"
                          : "outline"
                      }
                    >
                      {assessment.nursingAssessmentCompleted
                        ? "Completed"
                        : "Pending"}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Execute comprehensive clinical assessment including physical
                    examination, functional assessment, psychosocial evaluation,
                    and family/caregiver assessment to determine appropriate
                    level of care and service requirements.
                  </p>

                  <div className="bg-muted/50 p-4 rounded-md">
                    <h4 className="font-medium mb-2">
                      Clinical Assessment Components
                    </h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="braden-scale">
                            Braden Scale Score
                          </Label>
                          <Input
                            id="braden-scale"
                            type="number"
                            min="6"
                            max="23"
                            placeholder="6-23"
                            value={assessment.bradenScaleScore || ""}
                            onChange={(e) =>
                              setAssessment((prev) => ({
                                ...prev,
                                bradenScaleScore: parseInt(e.target.value),
                                updatedAt: new Date().toISOString(),
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="morse-fall">
                            Morse Fall Scale Score
                          </Label>
                          <Input
                            id="morse-fall"
                            type="number"
                            min="0"
                            max="125"
                            placeholder="0-125"
                            value={assessment.morseFallScaleScore || ""}
                            onChange={(e) =>
                              setAssessment((prev) => ({
                                ...prev,
                                morseFallScaleScore: parseInt(e.target.value),
                                updatedAt: new Date().toISOString(),
                              }))
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="functional-status">
                          Functional Status Score
                        </Label>
                        <Input
                          id="functional-status"
                          type="number"
                          min="0"
                          max="100"
                          placeholder="0-100"
                          value={assessment.functionalStatusScore || ""}
                          onChange={(e) =>
                            setAssessment((prev) => ({
                              ...prev,
                              functionalStatusScore: parseInt(e.target.value),
                              updatedAt: new Date().toISOString(),
                            }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="caregiver-capability">
                          Family/Caregiver Capability
                        </Label>
                        <Select
                          value={assessment.familyCaregiverCapability || ""}
                          onValueChange={(value) =>
                            setAssessment((prev) => ({
                              ...prev,
                              familyCaregiverCapability: value as
                                | "Low"
                                | "Medium"
                                | "High",
                              updatedAt: new Date().toISOString(),
                            }))
                          }
                        >
                          <SelectTrigger id="caregiver-capability">
                            <SelectValue placeholder="Select capability level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Low">Low Capability</SelectItem>
                            <SelectItem value="Medium">
                              Medium Capability
                            </SelectItem>
                            <SelectItem value="High">
                              High Capability
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="recommended-care">
                          Recommended Level of Care
                        </Label>
                        <Select
                          value={assessment.recommendedLevelOfCare || ""}
                          onValueChange={(value) =>
                            setAssessment((prev) => ({
                              ...prev,
                              recommendedLevelOfCare: value,
                              updatedAt: new Date().toISOString(),
                            }))
                          }
                        >
                          <SelectTrigger id="recommended-care">
                            <SelectValue placeholder="Select care level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low-intensity">
                              Low Intensity
                            </SelectItem>
                            <SelectItem value="medium-intensity">
                              Medium Intensity
                            </SelectItem>
                            <SelectItem value="high-intensity">
                              High Intensity
                            </SelectItem>
                            <SelectItem value="specialized">
                              Specialized Care
                            </SelectItem>
                            <SelectItem value="palliative">
                              Palliative Care
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Recommended Services</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="service-nursing"
                              onCheckedChange={(checked) => {
                                const currentServices =
                                  assessment.recommendedServices || [];
                                if (checked) {
                                  setAssessment((prev) => ({
                                    ...prev,
                                    recommendedServices: [
                                      ...currentServices,
                                      "Nursing Care",
                                    ],
                                    updatedAt: new Date().toISOString(),
                                  }));
                                } else {
                                  setAssessment((prev) => ({
                                    ...prev,
                                    recommendedServices: currentServices.filter(
                                      (item) => item !== "Nursing Care",
                                    ),
                                    updatedAt: new Date().toISOString(),
                                  }));
                                }
                              }}
                              checked={(
                                assessment.recommendedServices || []
                              ).includes("Nursing Care")}
                            />
                            <Label htmlFor="service-nursing">
                              Nursing Care
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="service-pt"
                              onCheckedChange={(checked) => {
                                const currentServices =
                                  assessment.recommendedServices || [];
                                if (checked) {
                                  setAssessment((prev) => ({
                                    ...prev,
                                    recommendedServices: [
                                      ...currentServices,
                                      "Physical Therapy",
                                    ],
                                    updatedAt: new Date().toISOString(),
                                  }));
                                } else {
                                  setAssessment((prev) => ({
                                    ...prev,
                                    recommendedServices: currentServices.filter(
                                      (item) => item !== "Physical Therapy",
                                    ),
                                    updatedAt: new Date().toISOString(),
                                  }));
                                }
                              }}
                              checked={(
                                assessment.recommendedServices || []
                              ).includes("Physical Therapy")}
                            />
                            <Label htmlFor="service-pt">Physical Therapy</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="service-ot"
                              onCheckedChange={(checked) => {
                                const currentServices =
                                  assessment.recommendedServices || [];
                                if (checked) {
                                  setAssessment((prev) => ({
                                    ...prev,
                                    recommendedServices: [
                                      ...currentServices,
                                      "Occupational Therapy",
                                    ],
                                    updatedAt: new Date().toISOString(),
                                  }));
                                } else {
                                  setAssessment((prev) => ({
                                    ...prev,
                                    recommendedServices: currentServices.filter(
                                      (item) => item !== "Occupational Therapy",
                                    ),
                                    updatedAt: new Date().toISOString(),
                                  }));
                                }
                              }}
                              checked={(
                                assessment.recommendedServices || []
                              ).includes("Occupational Therapy")}
                            />
                            <Label htmlFor="service-ot">
                              Occupational Therapy
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="service-st"
                              onCheckedChange={(checked) => {
                                const currentServices =
                                  assessment.recommendedServices || [];
                                if (checked) {
                                  setAssessment((prev) => ({
                                    ...prev,
                                    recommendedServices: [
                                      ...currentServices,
                                      "Speech Therapy",
                                    ],
                                    updatedAt: new Date().toISOString(),
                                  }));
                                } else {
                                  setAssessment((prev) => ({
                                    ...prev,
                                    recommendedServices: currentServices.filter(
                                      (item) => item !== "Speech Therapy",
                                    ),
                                    updatedAt: new Date().toISOString(),
                                  }));
                                }
                              }}
                              checked={(
                                assessment.recommendedServices || []
                              ).includes("Speech Therapy")}
                            />
                            <Label htmlFor="service-st">Speech Therapy</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="service-rt"
                              onCheckedChange={(checked) => {
                                const currentServices =
                                  assessment.recommendedServices || [];
                                if (checked) {
                                  setAssessment((prev) => ({
                                    ...prev,
                                    recommendedServices: [
                                      ...currentServices,
                                      "Respiratory Therapy",
                                    ],
                                    updatedAt: new Date().toISOString(),
                                  }));
                                } else {
                                  setAssessment((prev) => ({
                                    ...prev,
                                    recommendedServices: currentServices.filter(
                                      (item) => item !== "Respiratory Therapy",
                                    ),
                                    updatedAt: new Date().toISOString(),
                                  }));
                                }
                              }}
                              checked={(
                                assessment.recommendedServices || []
                              ).includes("Respiratory Therapy")}
                            />
                            <Label htmlFor="service-rt">
                              Respiratory Therapy
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 mt-4">
                    <Checkbox
                      id="nursing-assessment-completed"
                      checked={assessment.nursingAssessmentCompleted}
                      onCheckedChange={(checked) =>
                        handleToggleRequirement(
                          "nursingAssessmentCompleted",
                          checked === true,
                        )
                      }
                    />
                    <Label
                      htmlFor="nursing-assessment-completed"
                      className="font-medium"
                    >
                      I confirm the clinical assessment has been completed
                    </Label>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="nursing-assessment-date">
                        Assessment Date
                      </Label>
                      <Input
                        id="nursing-assessment-date"
                        type="date"
                        value={assessment.nursingAssessmentDate || ""}
                        onChange={(e) =>
                          setAssessment((prev) => ({
                            ...prev,
                            nursingAssessmentDate: e.target.value,
                            updatedAt: new Date().toISOString(),
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nursing-assessor">Assessor</Label>
                      <Select
                        value={assessment.nursingAssessor || ""}
                        onValueChange={(value) =>
                          setAssessment((prev) => ({
                            ...prev,
                            nursingAssessor: value,
                            updatedAt: new Date().toISOString(),
                          }))
                        }
                      >
                        <SelectTrigger id="nursing-assessor">
                          <SelectValue placeholder="Select assessor" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableStaff
                            .filter(
                              (staff) =>
                                staff.role === "Head Nurse" ||
                                staff.role === "Nurse Supervisor",
                            )
                            .map((staff) => (
                              <SelectItem key={staff.id} value={staff.id}>
                                {staff.name} ({staff.role})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                {/* Therapy Assessment Coordination Process */}
                <TabsContent value="therapy-assessment" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">
                      Therapy Assessment Coordination
                    </h3>
                    <Badge variant="outline">
                      {assessment.ptAssessmentRequired ||
                      assessment.otAssessmentRequired ||
                      assessment.stAssessmentRequired ||
                      assessment.rtAssessmentRequired
                        ? "Required"
                        : "Not Required"}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Coordinate therapy-specific assessments (PT/OT/ST/RT) based
                    on physician orders and clinical needs identified during
                    nursing assessment. Ensure appropriate therapist assignment
                    and scheduling.
                  </p>

                  <div className="bg-muted/50 p-4 rounded-md">
                    <h4 className="font-medium mb-2">
                      Required Therapy Assessments
                    </h4>
                    <div className="space-y-4">
                      {/* Physical Therapy */}
                      <div className="border-b pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="pt-required"
                              checked={assessment.ptAssessmentRequired}
                              onCheckedChange={(checked) =>
                                handleToggleRequirement(
                                  "ptAssessmentRequired",
                                  checked === true,
                                )
                              }
                            />
                            <Label
                              htmlFor="pt-required"
                              className="font-medium"
                            >
                              Physical Therapy Assessment
                            </Label>
                          </div>
                          {assessment.ptAssessmentRequired && (
                            <Badge
                              variant={
                                assessment.ptAssessmentCompleted
                                  ? "success"
                                  : "outline"
                              }
                            >
                              {assessment.ptAssessmentCompleted
                                ? "Completed"
                                : "Pending"}
                            </Badge>
                          )}
                        </div>

                        {assessment.ptAssessmentRequired && (
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="space-y-2">
                              <Label htmlFor="pt-date">Assessment Date</Label>
                              <Input
                                id="pt-date"
                                type="date"
                                value={assessment.ptAssessmentDate || ""}
                                onChange={(e) =>
                                  setAssessment((prev) => ({
                                    ...prev,
                                    ptAssessmentDate: e.target.value,
                                    updatedAt: new Date().toISOString(),
                                  }))
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="pt-assessor">PT Assessor</Label>
                              <Select
                                value={assessment.ptAssessor || ""}
                                onValueChange={(value) =>
                                  setAssessment((prev) => ({
                                    ...prev,
                                    ptAssessor: value,
                                    updatedAt: new Date().toISOString(),
                                  }))
                                }
                              >
                                <SelectTrigger id="pt-assessor">
                                  <SelectValue placeholder="Select therapist" />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableStaff
                                    .filter(
                                      (staff) =>
                                        staff.role === "Physical Therapist",
                                    )
                                    .map((staff) => (
                                      <SelectItem
                                        key={staff.id}
                                        value={staff.id}
                                      >
                                        {staff.name}{" "}
                                        {staff.specialty
                                          ? `(${staff.specialty})`
                                          : ""}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="col-span-2">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="pt-completed"
                                  checked={assessment.ptAssessmentCompleted}
                                  onCheckedChange={(checked) =>
                                    handleToggleRequirement(
                                      "ptAssessmentCompleted",
                                      checked === true,
                                    )
                                  }
                                />
                                <Label htmlFor="pt-completed">
                                  Assessment Completed
                                </Label>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Occupational Therapy */}
                      <div className="border-b pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="ot-required"
                              checked={assessment.otAssessmentRequired}
                              onCheckedChange={(checked) =>
                                handleToggleRequirement(
                                  "otAssessmentRequired",
                                  checked === true,
                                )
                              }
                            />
                            <Label
                              htmlFor="ot-required"
                              className="font-medium"
                            >
                              Occupational Therapy Assessment
                            </Label>
                          </div>
                          {assessment.otAssessmentRequired && (
                            <Badge
                              variant={
                                assessment.otAssessmentCompleted
                                  ? "success"
                                  : "outline"
                              }
                            >
                              {assessment.otAssessmentCompleted
                                ? "Completed"
                                : "Pending"}
                            </Badge>
                          )}
                        </div>

                        {assessment.otAssessmentRequired && (
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="space-y-2">
                              <Label htmlFor="ot-date">Assessment Date</Label>
                              <Input
                                id="ot-date"
                                type="date"
                                value={assessment.otAssessmentDate || ""}
                                onChange={(e) =>
                                  setAssessment((prev) => ({
                                    ...prev,
                                    otAssessmentDate: e.target.value,
                                    updatedAt: new Date().toISOString(),
                                  }))
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="ot-assessor">OT Assessor</Label>
                              <Select
                                value={assessment.otAssessor || ""}
                                onValueChange={(value) =>
                                  setAssessment((prev) => ({
                                    ...prev,
                                    otAssessor: value,
                                    updatedAt: new Date().toISOString(),
                                  }))
                                }
                              >
                                <SelectTrigger id="ot-assessor">
                                  <SelectValue placeholder="Select therapist" />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableStaff
                                    .filter(
                                      (staff) =>
                                        staff.role === "Occupational Therapist",
                                    )
                                    .map((staff) => (
                                      <SelectItem
                                        key={staff.id}
                                        value={staff.id}
                                      >
                                        {staff.name}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="col-span-2">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="ot-completed"
                                  checked={assessment.otAssessmentCompleted}
                                  onCheckedChange={(checked) =>
                                    handleToggleRequirement(
                                      "otAssessmentCompleted",
                                      checked === true,
                                    )
                                  }
                                />
                                <Label htmlFor="ot-completed">
                                  Assessment Completed
                                </Label>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Speech Therapy */}
                      <div className="border-b pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="st-required"
                              checked={assessment.stAssessmentRequired}
                              onCheckedChange={(checked) =>
                                handleToggleRequirement(
                                  "stAssessmentRequired",
                                  checked === true,
                                )
                              }
                            />
                            <Label
                              htmlFor="st-required"
                              className="font-medium"
                            >
                              Speech Therapy Assessment
                            </Label>
                          </div>
                          {assessment.stAssessmentRequired && (
                            <Badge
                              variant={
                                assessment.stAssessmentCompleted
                                  ? "success"
                                  : "outline"
                              }
                            >
                              {assessment.stAssessmentCompleted
                                ? "Completed"
                                : "Pending"}
                            </Badge>
                          )}
                        </div>

                        {assessment.stAssessmentRequired && (
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="space-y-2">
                              <Label htmlFor="st-date">Assessment Date</Label>
                              <Input
                                id="st-date"
                                type="date"
                                value={assessment.stAssessmentDate || ""}
                                onChange={(e) =>
                                  setAssessment((prev) => ({
                                    ...prev,
                                    stAssessmentDate: e.target.value,
                                    updatedAt: new Date().toISOString(),
                                  }))
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="st-assessor">ST Assessor</Label>
                              <Select
                                value={assessment.stAssessor || ""}
                                onValueChange={(value) =>
                                  setAssessment((prev) => ({
                                    ...prev,
                                    stAssessor: value,
                                    updatedAt: new Date().toISOString(),
                                  }))
                                }
                              >
                                <SelectTrigger id="st-assessor">
                                  <SelectValue placeholder="Select therapist" />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableStaff
                                    .filter(
                                      (staff) =>
                                        staff.role === "Speech Therapist",
                                    )
                                    .map((staff) => (
                                      <SelectItem
                                        key={staff.id}
                                        value={staff.id}
                                      >
                                        {staff.name}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="col-span-2">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="st-completed"
                                  checked={assessment.stAssessmentCompleted}
                                  onCheckedChange={(checked) =>
                                    handleToggleRequirement(
                                      "stAssessmentCompleted",
                                      checked === true,
                                    )
                                  }
                                />
                                <Label htmlFor="st-completed">
                                  Assessment Completed
                                </Label>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Respiratory Therapy */}
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="rt-required"
                              checked={assessment.rtAssessmentRequired}
                              onCheckedChange={(checked) =>
                                handleToggleRequirement(
                                  "rtAssessmentRequired",
                                  checked === true,
                                )
                              }
                            />
                            <Label
                              htmlFor="rt-required"
                              className="font-medium"
                            >
                              Respiratory Therapy Assessment
                            </Label>
                          </div>
                          {assessment.rtAssessmentRequired && (
                            <Badge
                              variant={
                                assessment.rtAssessmentCompleted
                                  ? "success"
                                  : "outline"
                              }
                            >
                              {assessment.rtAssessmentCompleted
                                ? "Completed"
                                : "Pending"}
                            </Badge>
                          )}
                        </div>

                        {assessment.rtAssessmentRequired && (
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="space-y-2">
                              <Label htmlFor="rt-date">Assessment Date</Label>
                              <Input
                                id="rt-date"
                                type="date"
                                value={assessment.rtAssessmentDate || ""}
                                onChange={(e) =>
                                  setAssessment((prev) => ({
                                    ...prev,
                                    rtAssessmentDate: e.target.value,
                                    updatedAt: new Date().toISOString(),
                                  }))
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="rt-assessor">RT Assessor</Label>
                              <Select
                                value={assessment.rtAssessor || ""}
                                onValueChange={(value) =>
                                  setAssessment((prev) => ({
                                    ...prev,
                                    rtAssessor: value,
                                    updatedAt: new Date().toISOString(),
                                  }))
                                }
                              >
                                <SelectTrigger id="rt-assessor">
                                  <SelectValue placeholder="Select therapist" />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableStaff
                                    .filter(
                                      (staff) =>
                                        staff.role === "Respiratory Therapist",
                                    )
                                    .map((staff) => (
                                      <SelectItem
                                        key={staff.id}
                                        value={staff.id}
                                      >
                                        {staff.name}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="col-span-2">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="rt-completed"
                                  checked={assessment.rtAssessmentCompleted}
                                  onCheckedChange={(checked) =>
                                    handleToggleRequirement(
                                      "rtAssessmentCompleted",
                                      checked === true,
                                    )
                                  }
                                />
                                <Label htmlFor="rt-completed">
                                  Assessment Completed
                                </Label>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Takes 1/3 of space on large screens */}
        <div className="space-y-6">
          {/* Assessment Progress */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Assessment Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={completionPercentage} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{completionPercentage}% Complete</span>
                  <span>{100 - completionPercentage}% Remaining</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {assessment.medicalRecordsCollected ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                    )}
                    <span className="text-sm">Medical Records Collection</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {assessment.assessmentDate ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                    )}
                    <span className="text-sm">Home Assessment Scheduling</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {assessment.infectionControlAssessmentCompleted ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                    )}
                    <span className="text-sm">
                      Infection Control Assessment
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {assessment.nursingAssessmentCompleted ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                    )}
                    <span className="text-sm">Clinical Assessment</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {(assessment.ptAssessmentRequired &&
                      assessment.ptAssessmentCompleted) ||
                    (assessment.otAssessmentRequired &&
                      assessment.otAssessmentCompleted) ||
                    (assessment.stAssessmentRequired &&
                      assessment.stAssessmentCompleted) ||
                    (assessment.rtAssessmentRequired &&
                      assessment.rtAssessmentCompleted) ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                    )}
                    <span className="text-sm">Therapy Assessment</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assessment Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Assessment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Assessment Date</h4>
                  <p className="text-sm">
                    {assessment.assessmentDate
                      ? assessment.assessmentDate
                      : "Not scheduled"}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Assigned Staff</h4>
                  {assessment.assignedStaff.length > 0 ? (
                    <div className="text-sm">
                      {assessment.assignedStaff.map((staff, index) => (
                        <div key={staff.id}>
                          {staff.name} ({staff.role})
                          {index < assessment.assignedStaff.length - 1 && ", "}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No staff assigned
                    </p>
                  )}
                </div>

                {assessment.recommendedLevelOfCare && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">
                      Recommended Level of Care
                    </h4>
                    <p className="text-sm capitalize">
                      {assessment.recommendedLevelOfCare.replace(/-/g, " ")}
                    </p>
                  </div>
                )}

                {assessment.infectionControlRiskLevel && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">
                      Infection Control Risk
                    </h4>
                    <Badge
                      variant={
                        assessment.infectionControlRiskLevel === "High"
                          ? "destructive"
                          : assessment.infectionControlRiskLevel === "Medium"
                            ? "default"
                            : "outline"
                      }
                    >
                      {assessment.infectionControlRiskLevel} Risk
                    </Badge>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Required Therapy</h4>
                  <div className="flex flex-wrap gap-2">
                    {assessment.ptAssessmentRequired && (
                      <Badge variant="outline">Physical Therapy</Badge>
                    )}
                    {assessment.otAssessmentRequired && (
                      <Badge variant="outline">Occupational Therapy</Badge>
                    )}
                    {assessment.stAssessmentRequired && (
                      <Badge variant="outline">Speech Therapy</Badge>
                    )}
                    {assessment.rtAssessmentRequired && (
                      <Badge variant="outline">Respiratory Therapy</Badge>
                    )}
                    {!assessment.ptAssessmentRequired &&
                      !assessment.otAssessmentRequired &&
                      !assessment.stAssessmentRequired &&
                      !assessment.rtAssessmentRequired && (
                        <p className="text-sm text-muted-foreground">
                          No therapy required
                        </p>
                      )}
                  </div>
                </div>

                {assessment.recommendedServices &&
                  assessment.recommendedServices.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">
                        Recommended Services
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {assessment.recommendedServices.map(
                          (service, index) => (
                            <Badge key={index} variant="outline">
                              {service}
                            </Badge>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                {assessment.ppeRequirements &&
                  assessment.ppeRequirements.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">PPE Requirements</h4>
                      <div className="flex flex-wrap gap-2">
                        {assessment.ppeRequirements.map((ppe, index) => (
                          <Badge key={index} variant="outline">
                            {ppe}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>

          {/* Assessment Status */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Assessment Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="assessment-status">Status</Label>
                  <Select
                    value={assessment.assessmentStatus}
                    onValueChange={(value) =>
                      setAssessment((prev) => ({
                        ...prev,
                        assessmentStatus: value as
                          | "Scheduled"
                          | "In Progress"
                          | "Completed"
                          | "Cancelled",
                        updatedAt: new Date().toISOString(),
                      }))
                    }
                  >
                    <SelectTrigger id="assessment-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Scheduled">Scheduled</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {assessment.assessmentStatus === "Completed" && (
                  <div className="space-y-2">
                    <Label htmlFor="assessment-outcome">Outcome</Label>
                    <Select
                      value={assessment.assessmentOutcome || ""}
                      onValueChange={(value) =>
                        setAssessment((prev) => ({
                          ...prev,
                          assessmentOutcome: value as
                            | "Accepted"
                            | "Declined"
                            | "Referred",
                          updatedAt: new Date().toISOString(),
                        }))
                      }
                    >
                      <SelectTrigger id="assessment-outcome">
                        <SelectValue placeholder="Select outcome" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Accepted">Accepted</SelectItem>
                        <SelectItem value="Declined">Declined</SelectItem>
                        <SelectItem value="Referred">Referred</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="follow-up-required"
                    checked={assessment.followUpRequired}
                    onCheckedChange={(checked) =>
                      handleToggleRequirement(
                        "followUpRequired",
                        checked === true,
                      )
                    }
                  />
                  <Label htmlFor="follow-up-required">Follow-up Required</Label>
                </div>

                {assessment.followUpRequired && (
                  <div className="space-y-2">
                    <Label htmlFor="follow-up-notes">Follow-up Notes</Label>
                    <Textarea
                      id="follow-up-notes"
                      placeholder="Enter follow-up notes"
                      value={assessment.followUpNotes || ""}
                      onChange={(e) =>
                        setAssessment((prev) => ({
                          ...prev,
                          followUpNotes: e.target.value,
                          updatedAt: new Date().toISOString(),
                        }))
                      }
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PatientAssessment;
