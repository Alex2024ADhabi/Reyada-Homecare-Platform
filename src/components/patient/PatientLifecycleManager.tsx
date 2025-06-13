import React, { useState } from "react";
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineHeader,
  TimelineTitle,
  TimelineIcon,
  TimelineDescription,
  TimelineContent,
} from "@/components/ui/timeline";
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  CheckCircle,
  Users,
  Home,
  Hospital,
  Activity,
  Shield,
  Target,
  TrendingUp,
  Save,
} from "lucide-react";

interface PatientLifecycleManagerProps {
  patientId: string;
  patientName: string;
  onBack: () => void;
}

interface LifecycleEvent {
  id: string;
  type:
    | "referral"
    | "assessment"
    | "admission"
    | "care_plan"
    | "service_start"
    | "status_change"
    | "discharge_planning"
    | "discharge"
    | "readmission";
  date: string;
  description: string;
  performedBy: string;
  status: "completed" | "in_progress" | "pending";
}

interface DischargeReadiness {
  medicalStability: boolean;
  functionalStatus: "improved" | "stable" | "declined";
  caregiverSupport: boolean;
  homeEnvironment: boolean;
  equipmentAvailable: boolean;
  followUpArranged: boolean;
}

const PatientLifecycleManager: React.FC<PatientLifecycleManagerProps> = ({
  patientId,
  patientName,
  onBack,
}) => {
  const [currentStatus, setCurrentStatus] = useState<string>("active_care");
  const [isDischargeDialogOpen, setIsDischargeDialogOpen] = useState(false);
  const [dischargeReadiness, setDischargeReadiness] =
    useState<DischargeReadiness>({
      medicalStability: false,
      functionalStatus: "stable",
      caregiverSupport: false,
      homeEnvironment: false,
      equipmentAvailable: false,
      followUpArranged: false,
    });

  // Mock lifecycle events
  const lifecycleEvents: LifecycleEvent[] = [
    {
      id: "1",
      type: "referral",
      date: "2024-01-15",
      description:
        "Referral received from Al Ain Hospital for post-surgical care",
      performedBy: "Dr. Ahmed Al Mansouri",
      status: "completed",
    },
    {
      id: "2",
      type: "assessment",
      date: "2024-01-18",
      description: "Initial assessment completed - 9-domain DOH assessment",
      performedBy: "Nurse Sarah Johnson",
      status: "completed",
    },
    {
      id: "3",
      type: "admission",
      date: "2024-01-20",
      description: "Patient admitted to homecare services",
      performedBy: "Care Coordinator",
      status: "completed",
    },
    {
      id: "4",
      type: "care_plan",
      date: "2024-01-22",
      description: "Care plan developed and approved by physician",
      performedBy: "Dr. Khalid Al Mazrouei",
      status: "completed",
    },
    {
      id: "5",
      type: "service_start",
      date: "2024-01-25",
      description: "Homecare services initiated",
      performedBy: "Primary Nurse Team",
      status: "completed",
    },
    {
      id: "6",
      type: "discharge_planning",
      date: "2024-02-15",
      description: "Discharge planning initiated",
      performedBy: "Discharge Coordinator",
      status: "in_progress",
    },
  ];

  const getStatusIcon = (type: string) => {
    switch (type) {
      case "referral":
        return <FileText className="h-4 w-4" />;
      case "assessment":
        return <Activity className="h-4 w-4" />;
      case "admission":
        return <Home className="h-4 w-4" />;
      case "care_plan":
        return <Target className="h-4 w-4" />;
      case "service_start":
        return <CheckCircle className="h-4 w-4" />;
      case "discharge_planning":
        return <Calendar className="h-4 w-4" />;
      case "discharge":
        return <Hospital className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "in_progress":
        return "text-blue-600";
      case "pending":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  const calculateDischargeReadiness = () => {
    const criteria = Object.values(dischargeReadiness);
    const completedCriteria = criteria.filter((criterion) =>
      typeof criterion === "boolean" ? criterion : true,
    ).length;
    return Math.round((completedCriteria / criteria.length) * 100);
  };

  const handleStatusChange = (newStatus: string) => {
    setCurrentStatus(newStatus);
    // In a real implementation, this would update the patient's status in the database
  };

  const handleDischargeAssessment = () => {
    // In a real implementation, this would save the discharge assessment
    setIsDischargeDialogOpen(false);
    alert("Discharge assessment saved successfully");
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Patient Lifecycle Management</h2>
            <p className="text-muted-foreground">
              {patientName} - ID: {patientId}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            Current Status:{" "}
            {currentStatus.replace("_", " ").charAt(0).toUpperCase() +
              currentStatus.replace("_", " ").slice(1)}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lifecycle Timeline */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Patient Journey Timeline
              </CardTitle>
              <CardDescription>
                Complete lifecycle from referral to discharge
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {lifecycleEvents.map((event, index) => (
                  <div key={event.id} className="relative">
                    {index < lifecycleEvents.length - 1 && (
                      <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200" />
                    )}
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-2 rounded-full bg-gray-100 ${getStatusColor(event.status)}`}
                      >
                        {getStatusIcon(event.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">
                            {event.type
                              .replace("_", " ")
                              .charAt(0)
                              .toUpperCase() +
                              event.type.replace("_", " ").slice(1)}
                          </h4>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getStatusColor(event.status)}`}
                          >
                            {event.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {event.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(event.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {event.performedBy}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Add Lifecycle Event
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Status Management & Discharge Planning */}
        <div className="space-y-6">
          {/* Current Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="lifecycle-status">Lifecycle Status</Label>
                <Select
                  value={currentStatus}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger id="lifecycle-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="assessment">Assessment</SelectItem>
                    <SelectItem value="admission">Admission</SelectItem>
                    <SelectItem value="active_care">Active Care</SelectItem>
                    <SelectItem value="discharge_planning">
                      Discharge Planning
                    </SelectItem>
                    <SelectItem value="discharged">Discharged</SelectItem>
                    <SelectItem value="readmission">Readmission</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Quick Actions</Label>
                <div className="grid grid-cols-1 gap-2">
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Update Care Plan
                  </Button>
                  <Button variant="outline" size="sm">
                    <Activity className="h-4 w-4 mr-2" />
                    Schedule Assessment
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDischargeDialogOpen(true)}
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Discharge Planning
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Discharge Readiness */}
          {currentStatus === "discharge_planning" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Discharge Readiness
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Overall Readiness
                    </span>
                    <span className="text-sm font-medium">
                      {calculateDischargeReadiness()}%
                    </span>
                  </div>
                  <Progress
                    value={calculateDischargeReadiness()}
                    className="h-2"
                  />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Medical Stability</span>
                      {dischargeReadiness.medicalStability ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Caregiver Support</span>
                      {dischargeReadiness.caregiverSupport ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Home Environment</span>
                      {dischargeReadiness.homeEnvironment ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Equipment Available</span>
                      {dischargeReadiness.equipmentAvailable ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Follow-up Arranged</span>
                      {dischargeReadiness.followUpArranged ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Key Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Key Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Days in Care
                  </span>
                  <span className="font-medium">28</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Total Visits
                  </span>
                  <span className="font-medium">15</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Care Team Size
                  </span>
                  <span className="font-medium">4</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Goal Achievement
                  </span>
                  <span className="font-medium">75%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Discharge Planning Dialog */}
      <Dialog
        open={isDischargeDialogOpen}
        onOpenChange={setIsDischargeDialogOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Discharge Planning Assessment</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <h4 className="font-medium">Discharge Readiness Criteria</h4>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="medical-stability"
                    checked={dischargeReadiness.medicalStability}
                    onCheckedChange={(checked) =>
                      setDischargeReadiness((prev) => ({
                        ...prev,
                        medicalStability: checked === true,
                      }))
                    }
                  />
                  <Label htmlFor="medical-stability">
                    Medical Stability Achieved
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="functional-status">Functional Status</Label>
                  <Select
                    value={dischargeReadiness.functionalStatus}
                    onValueChange={(value) =>
                      setDischargeReadiness((prev) => ({
                        ...prev,
                        functionalStatus: value as
                          | "improved"
                          | "stable"
                          | "declined",
                      }))
                    }
                  >
                    <SelectTrigger id="functional-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="improved">Improved</SelectItem>
                      <SelectItem value="stable">Stable</SelectItem>
                      <SelectItem value="declined">Declined</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="caregiver-support"
                    checked={dischargeReadiness.caregiverSupport}
                    onCheckedChange={(checked) =>
                      setDischargeReadiness((prev) => ({
                        ...prev,
                        caregiverSupport: checked === true,
                      }))
                    }
                  />
                  <Label htmlFor="caregiver-support">
                    Adequate Caregiver Support
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="home-environment"
                    checked={dischargeReadiness.homeEnvironment}
                    onCheckedChange={(checked) =>
                      setDischargeReadiness((prev) => ({
                        ...prev,
                        homeEnvironment: checked === true,
                      }))
                    }
                  />
                  <Label htmlFor="home-environment">
                    Safe Home Environment
                  </Label>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Support Systems</h4>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="equipment-available"
                    checked={dischargeReadiness.equipmentAvailable}
                    onCheckedChange={(checked) =>
                      setDischargeReadiness((prev) => ({
                        ...prev,
                        equipmentAvailable: checked === true,
                      }))
                    }
                  />
                  <Label htmlFor="equipment-available">
                    Required Equipment Available
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="follow-up-arranged"
                    checked={dischargeReadiness.followUpArranged}
                    onCheckedChange={(checked) =>
                      setDischargeReadiness((prev) => ({
                        ...prev,
                        followUpArranged: checked === true,
                      }))
                    }
                  />
                  <Label htmlFor="follow-up-arranged">
                    Follow-up Care Arranged
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discharge-date">Planned Discharge Date</Label>
                  <Input id="discharge-date" type="date" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discharge-destination">
                    Discharge Destination
                  </Label>
                  <Select>
                    <SelectTrigger id="discharge-destination">
                      <SelectValue placeholder="Select destination" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">Home</SelectItem>
                      <SelectItem value="hospital">Hospital</SelectItem>
                      <SelectItem value="ltc_facility">
                        Long-term Care Facility
                      </SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discharge-notes">Discharge Planning Notes</Label>
              <Textarea
                id="discharge-notes"
                placeholder="Enter discharge planning notes, barriers, and recommendations"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDischargeDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleDischargeAssessment}>
              <Save className="h-4 w-4 mr-2" />
              Save Assessment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientLifecycleManager;
