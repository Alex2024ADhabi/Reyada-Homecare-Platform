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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Clock,
  Users,
  UserCheck,
  Shield,
  Stethoscope,
  Rocket,
  CheckCircle,
  AlertCircle,
  Save,
  Upload,
} from "lucide-react";

interface StartOfServiceProps {
  patientId?: string;
  episodeId?: string;
  isOffline?: boolean;
}

const StartOfService: React.FC<StartOfServiceProps> = ({
  patientId = "P12345",
  episodeId = "EP789",
  isOffline = false,
}) => {
  const [activeProcess, setActiveProcess] = useState("manpower-preparation");
  const [serviceStatus, setServiceStatus] = useState("Preparing");
  const [completionProgress, setCompletionProgress] = useState(15);

  // Mock data for staff
  const nurses = [
    {
      id: "N001",
      name: "Fatima Al Zaabi",
      specialization: "Critical Care",
      experience: "8 years",
      zone: "Abu Dhabi Central",
    },
    {
      id: "N002",
      name: "Ahmed Al Mansoori",
      specialization: "Wound Care",
      experience: "5 years",
      zone: "Abu Dhabi West",
    },
    {
      id: "N003",
      name: "Sarah Johnson",
      specialization: "Geriatric Care",
      experience: "10 years",
      zone: "Abu Dhabi East",
    },
    {
      id: "N004",
      name: "Mohammed Al Hashimi",
      specialization: "Respiratory",
      experience: "7 years",
      zone: "Al Ain",
    },
    {
      id: "N005",
      name: "Aisha Al Dhaheri",
      specialization: "Pediatric",
      experience: "6 years",
      zone: "Abu Dhabi Central",
    },
  ];

  const supervisors = [
    {
      id: "S001",
      name: "Dr. Khalid Al Mazrouei",
      role: "Nurse Supervisor",
      zone: "Abu Dhabi Central",
    },
    {
      id: "S002",
      name: "Dr. Layla Al Shamsi",
      role: "Charge Nurse",
      zone: "Abu Dhabi West",
    },
    {
      id: "S003",
      name: "Dr. Noura Al Kaabi",
      role: "Infection Control Officer",
      zone: "Abu Dhabi East",
    },
    {
      id: "S004",
      name: "Dr. Hamad Al Suwaidi",
      role: "Head Nurse",
      zone: "Al Ain",
    },
  ];

  // Mock data for zones
  const zones = [
    "Abu Dhabi Central",
    "Abu Dhabi West",
    "Abu Dhabi East",
    "Al Ain",
    "Western Region",
  ];

  // Mock data for skills and equipment
  const requiredSkills = [
    "Wound Care",
    "IV Management",
    "Respiratory Care",
    "Medication Administration",
    "Vital Signs Monitoring",
    "Mobility Assistance",
    "Catheter Care",
    "Diabetes Management",
  ];

  const equipmentList = [
    "Hospital Bed",
    "Oxygen Concentrator",
    "Wheelchair",
    "Walker",
    "Suction Machine",
    "Blood Pressure Monitor",
    "Glucometer",
    "Pulse Oximeter",
    "Nebulizer",
    "Wound Care Kit",
  ];

  const handleSave = () => {
    if (isOffline) {
      alert(
        "Data saved locally. Will sync when online connection is restored.",
      );
    } else {
      alert("Service initiation data saved successfully.");
    }
    // Increment progress for demo purposes
    setCompletionProgress(Math.min(100, completionProgress + 15));
  };

  const handleStatusChange = (status: string) => {
    setServiceStatus(status);
    if (status === "Ready to Start") {
      setCompletionProgress(Math.min(100, completionProgress + 20));
    } else if (status === "Active") {
      setCompletionProgress(100);
    }
  };

  return (
    <div className="w-full h-full bg-background p-4 md:p-6">
      {/* Header with Service Status */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold">Start of Service</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">Episode: {episodeId}</Badge>
            <Badge variant="outline">Patient ID: {patientId}</Badge>
            <Badge
              className={`${
                serviceStatus === "Active"
                  ? "bg-green-100 text-green-800"
                  : serviceStatus === "Ready to Start"
                    ? "bg-blue-100 text-blue-800"
                    : serviceStatus === "On Hold"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-gray-100 text-gray-800"
              }`}
            >
              {serviceStatus}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={serviceStatus} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Service Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Preparing">Preparing</SelectItem>
              <SelectItem value="Ready to Start">Ready to Start</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="On Hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
          <Badge
            variant={isOffline ? "destructive" : "secondary"}
            className="text-xs"
          >
            {isOffline ? "Offline Mode" : "Online"}
          </Badge>
        </div>
      </div>

      {/* Progress Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                Service Initiation Progress
              </span>
              <span className="text-sm font-medium">{completionProgress}%</span>
            </div>
            <Progress value={completionProgress} className="h-2" />
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs text-muted-foreground mt-2">
              <div
                className={`flex items-center gap-1 ${completionProgress >= 20 ? "text-green-600" : ""}`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${completionProgress >= 20 ? "bg-green-600" : "bg-gray-300"}`}
                ></div>
                <span>Manpower</span>
              </div>
              <div
                className={`flex items-center gap-1 ${completionProgress >= 40 ? "text-green-600" : ""}`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${completionProgress >= 40 ? "bg-green-600" : "bg-gray-300"}`}
                ></div>
                <span>Planning</span>
              </div>
              <div
                className={`flex items-center gap-1 ${completionProgress >= 60 ? "text-green-600" : ""}`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${completionProgress >= 60 ? "bg-green-600" : "bg-gray-300"}`}
                ></div>
                <span>Infection Control</span>
              </div>
              <div
                className={`flex items-center gap-1 ${completionProgress >= 80 ? "text-green-600" : ""}`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${completionProgress >= 80 ? "bg-green-600" : "bg-gray-300"}`}
                ></div>
                <span>Coordination</span>
              </div>
              <div
                className={`flex items-center gap-1 ${completionProgress >= 100 ? "text-green-600" : ""}`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${completionProgress >= 100 ? "bg-green-600" : "bg-gray-300"}`}
                ></div>
                <span>Launch</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Process Tabs */}
      <Tabs
        value={activeProcess}
        onValueChange={setActiveProcess}
        className="mb-6"
      >
        <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-6">
          <TabsTrigger value="manpower-preparation">
            <Users className="h-4 w-4 mr-2 hidden md:inline" />
            <span className="truncate">Manpower Preparation</span>
          </TabsTrigger>
          <TabsTrigger value="advanced-planning">
            <UserCheck className="h-4 w-4 mr-2 hidden md:inline" />
            <span className="truncate">Advanced Planning</span>
          </TabsTrigger>
          <TabsTrigger value="infection-control">
            <Shield className="h-4 w-4 mr-2 hidden md:inline" />
            <span className="truncate">Infection Control</span>
          </TabsTrigger>
          <TabsTrigger value="service-coordination">
            <Stethoscope className="h-4 w-4 mr-2 hidden md:inline" />
            <span className="truncate">Service Coordination</span>
          </TabsTrigger>
          <TabsTrigger value="service-launch">
            <Rocket className="h-4 w-4 mr-2 hidden md:inline" />
            <span className="truncate">Service Launch</span>
          </TabsTrigger>
        </TabsList>

        {/* Process 1: Manpower Preparation */}
        <TabsContent value="manpower-preparation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Manpower Preparation
              </CardTitle>
              <CardDescription>
                Prepare the manpower (Nurses & Assistant Nurses) in the team as
                per the required number of manpower needed for the patient and
                as per the Plan of Care.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nurse-supervisor">Nurse Supervisor</Label>
                    <Select defaultValue="S001">
                      <SelectTrigger id="nurse-supervisor">
                        <SelectValue placeholder="Select supervisor" />
                      </SelectTrigger>
                      <SelectContent>
                        {supervisors
                          .filter((s) => s.role === "Nurse Supervisor")
                          .map((supervisor) => (
                            <SelectItem
                              key={supervisor.id}
                              value={supervisor.id}
                            >
                              {supervisor.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="primary-nurse">
                      Primary Nurse Assignment
                    </Label>
                    <Select defaultValue="N001">
                      <SelectTrigger id="primary-nurse">
                        <SelectValue placeholder="Select primary nurse" />
                      </SelectTrigger>
                      <SelectContent>
                        {nurses.map((nurse) => (
                          <SelectItem key={nurse.id} value={nurse.id}>
                            {nurse.name} - {nurse.specialization}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="backup-nurse">
                      Backup Nurse Assignment
                    </Label>
                    <Select defaultValue="N003">
                      <SelectTrigger id="backup-nurse">
                        <SelectValue placeholder="Select backup nurse" />
                      </SelectTrigger>
                      <SelectContent>
                        {nurses.map((nurse) => (
                          <SelectItem key={nurse.id} value={nurse.id}>
                            {nurse.name} - {nurse.specialization}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="required-skills">Required Skills</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {requiredSkills.map((skill, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`skill-${index}`}
                            defaultChecked={index < 3}
                          />
                          <Label htmlFor={`skill-${index}`} className="text-sm">
                            {skill}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="experience-level">
                      Experience Level Match
                    </Label>
                    <Select defaultValue="advanced">
                      <SelectTrigger id="experience-level">
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic (1-2 years)</SelectItem>
                        <SelectItem value="intermediate">
                          Intermediate (3-5 years)
                        </SelectItem>
                        <SelectItem value="advanced">
                          Advanced (6+ years)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="special-training">
                      Special Training Required
                    </Label>
                    <Textarea
                      id="special-training"
                      placeholder="Enter any special training requirements"
                      defaultValue="Advanced wound care certification, Ventilator management experience"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Certification Verification</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="cert-verified" defaultChecked />
                        <Label htmlFor="cert-verified" className="text-sm">
                          Nurse certifications verified
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="license-verified" defaultChecked />
                        <Label htmlFor="license-verified" className="text-sm">
                          Nursing licenses current
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="doh-verified" defaultChecked />
                        <Label htmlFor="doh-verified" className="text-sm">
                          DOH registration verified
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline">Reset</Button>
              <Button onClick={handleSave}>Save & Continue</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Process 2: Advanced Manpower Planning */}
        <TabsContent value="advanced-planning" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Advanced Manpower Planning
              </CardTitle>
              <CardDescription>
                Execute detailed manpower allocation considering
                patient-to-nurse ratios, geographic clustering, travel time
                optimization, and backup coverage.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="charge-nurse">Charge Nurse</Label>
                    <Select defaultValue="S002">
                      <SelectTrigger id="charge-nurse">
                        <SelectValue placeholder="Select charge nurse" />
                      </SelectTrigger>
                      <SelectContent>
                        {supervisors
                          .filter((s) => s.role === "Charge Nurse")
                          .map((supervisor) => (
                            <SelectItem
                              key={supervisor.id}
                              value={supervisor.id}
                            >
                              {supervisor.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="patient-zone">Patient Zone</Label>
                    <Select defaultValue="Abu Dhabi Central">
                      <SelectTrigger id="patient-zone">
                        <SelectValue placeholder="Select patient zone" />
                      </SelectTrigger>
                      <SelectContent>
                        {zones.map((zone, index) => (
                          <SelectItem key={index} value={zone}>
                            {zone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="staff-zone">Assigned Staff Zone</Label>
                    <Select defaultValue="Abu Dhabi Central">
                      <SelectTrigger id="staff-zone">
                        <SelectValue placeholder="Select staff zone" />
                      </SelectTrigger>
                      <SelectContent>
                        {zones.map((zone, index) => (
                          <SelectItem key={index} value={zone}>
                            {zone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="travel-time">
                      Estimated Travel Time (minutes)
                    </Label>
                    <Input id="travel-time" type="number" defaultValue="15" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Geographic Optimization</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="route-optimized" defaultChecked />
                        <Label htmlFor="route-optimized" className="text-sm">
                          Route optimization completed
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="cluster-optimized" defaultChecked />
                        <Label htmlFor="cluster-optimized" className="text-sm">
                          Patient clustering optimized
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Patient-to-Nurse Ratio</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <Label htmlFor="patient-count" className="text-sm">
                          Patients
                        </Label>
                        <Input
                          id="patient-count"
                          type="number"
                          defaultValue="8"
                        />
                      </div>
                      <div>
                        <Label htmlFor="nurse-count" className="text-sm">
                          Nurses
                        </Label>
                        <Input
                          id="nurse-count"
                          type="number"
                          defaultValue="2"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Current ratio: 4:1 (Recommended: 4:1 or lower)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="backup-plan">Backup Coverage Plan</Label>
                    <Textarea
                      id="backup-plan"
                      placeholder="Describe backup coverage plan"
                      defaultValue="Nurse Sarah Johnson on standby for emergency coverage. Charge nurse available for escalation."
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline">Reset</Button>
              <Button onClick={handleSave}>Save & Continue</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Process 3: Infection Control Staffing */}
        <TabsContent value="infection-control" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Infection Control Staffing
              </CardTitle>
              <CardDescription>
                Ensure infection control compliance in staff assignments
                including verification of vaccination status, health screening,
                PPE availability, and specialized training.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="infection-officer">
                      Infection Control Officer
                    </Label>
                    <Select defaultValue="S003">
                      <SelectTrigger id="infection-officer">
                        <SelectValue placeholder="Select infection control officer" />
                      </SelectTrigger>
                      <SelectContent>
                        {supervisors
                          .filter((s) => s.role === "Infection Control Officer")
                          .map((supervisor) => (
                            <SelectItem
                              key={supervisor.id}
                              value={supervisor.id}
                            >
                              {supervisor.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Health & Vaccination Status</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="health-cleared" defaultChecked />
                        <Label htmlFor="health-cleared" className="text-sm">
                          Staff health cleared
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="vaccination-verified" defaultChecked />
                        <Label
                          htmlFor="vaccination-verified"
                          className="text-sm"
                        >
                          Vaccination status verified
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="covid-screened" defaultChecked />
                        <Label htmlFor="covid-screened" className="text-sm">
                          COVID-19 screening completed
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="ppe-requirements">PPE Requirements</Label>
                    <Textarea
                      id="ppe-requirements"
                      placeholder="List required PPE"
                      defaultValue="N95 masks, face shields, disposable gowns, gloves, hand sanitizer"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>PPE Allocation</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="ppe-allocated" defaultChecked />
                        <Label htmlFor="ppe-allocated" className="text-sm">
                          PPE allocated to staff
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="ppe-training" defaultChecked />
                        <Label htmlFor="ppe-training" className="text-sm">
                          PPE usage training completed
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="infection-training">
                      Specialized Infection Control Training
                    </Label>
                    <Textarea
                      id="infection-training"
                      placeholder="Describe specialized training requirements"
                      defaultValue="Staff completed advanced infection control protocols for immunocompromised patients. Isolation procedures training completed."
                    />
                  </div>

                  <div>
                    <Label htmlFor="infection-notes">
                      Additional Infection Control Notes
                    </Label>
                    <Textarea
                      id="infection-notes"
                      placeholder="Enter additional notes"
                      defaultValue="Patient requires contact precautions. Family members trained on hand hygiene and PPE usage."
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline">Reset</Button>
              <Button onClick={handleSave}>Save & Continue</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Process 4: Clinical Service Coordination */}
        <TabsContent value="service-coordination" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Clinical Service Coordination
              </CardTitle>
              <CardDescription>
                Coordinate clinical service initiation including initial visit
                scheduling, patient/family orientation, equipment delivery, and
                emergency contact establishment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="head-nurse">Head Nurse</Label>
                    <Select defaultValue="S004">
                      <SelectTrigger id="head-nurse">
                        <SelectValue placeholder="Select head nurse" />
                      </SelectTrigger>
                      <SelectContent>
                        {supervisors
                          .filter((s) => s.role === "Head Nurse")
                          .map((supervisor) => (
                            <SelectItem
                              key={supervisor.id}
                              value={supervisor.id}
                            >
                              {supervisor.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="service-start-date">
                      Service Start Date
                    </Label>
                    <Input
                      id="service-start-date"
                      type="date"
                      defaultValue={new Date().toISOString().split("T")[0]}
                    />
                  </div>

                  <div>
                    <Label htmlFor="first-visit-date">First Visit Date</Label>
                    <Input
                      id="first-visit-date"
                      type="date"
                      defaultValue={new Date().toISOString().split("T")[0]}
                    />
                  </div>

                  <div>
                    <Label htmlFor="first-visit-time">First Visit Time</Label>
                    <Input
                      id="first-visit-time"
                      type="time"
                      defaultValue="10:00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Initial Visit Status</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="visit-scheduled" defaultChecked />
                        <Label htmlFor="visit-scheduled" className="text-sm">
                          First visit scheduled
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="patient-notified" defaultChecked />
                        <Label htmlFor="patient-notified" className="text-sm">
                          Patient/family notified
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Equipment & Supplies</Label>
                    <ScrollArea className="h-[150px] border rounded-md p-2">
                      <div className="space-y-2">
                        {equipmentList.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`equipment-${index}`}
                              defaultChecked={index < 5}
                            />
                            <Label
                              htmlFor={`equipment-${index}`}
                              className="text-sm"
                            >
                              {item}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>

                  <div>
                    <Label htmlFor="equipment-delivery-date">
                      Equipment Delivery Date
                    </Label>
                    <Input
                      id="equipment-delivery-date"
                      type="date"
                      defaultValue={new Date().toISOString().split("T")[0]}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Documentation Setup</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="initial-docs" defaultChecked />
                        <Label htmlFor="initial-docs" className="text-sm">
                          Initial documentation prepared
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="emr-setup" defaultChecked />
                        <Label htmlFor="emr-setup" className="text-sm">
                          EMR setup completed
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="patient-file" defaultChecked />
                        <Label htmlFor="patient-file" className="text-sm">
                          Patient file created
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline">Reset</Button>
              <Button onClick={handleSave}>Save & Continue</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Process 5: Comprehensive Service Launch */}
        <TabsContent value="service-launch" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5" />
                Comprehensive Service Launch
              </CardTitle>
              <CardDescription>
                Execute comprehensive service launch including family education,
                care plan review, emergency procedures training, and quality
                assurance protocols establishment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="family-orientation-date">
                      Family Orientation Date
                    </Label>
                    <Input
                      id="family-orientation-date"
                      type="date"
                      defaultValue={new Date().toISOString().split("T")[0]}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Patient/Family Preparation</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="orientation-scheduled" defaultChecked />
                        <Label
                          htmlFor="orientation-scheduled"
                          className="text-sm"
                        >
                          Family orientation scheduled
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="orientation-completed" />
                        <Label
                          htmlFor="orientation-completed"
                          className="text-sm"
                        >
                          Family orientation completed
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="care-plan-reviewed" />
                        <Label htmlFor="care-plan-reviewed" className="text-sm">
                          Care plan reviewed with family
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="emergency-trained" />
                        <Label htmlFor="emergency-trained" className="text-sm">
                          Emergency procedures trained
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Communication Setup</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="whatsapp-created" defaultChecked />
                        <Label htmlFor="whatsapp-created" className="text-sm">
                          WhatsApp group created
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="emergency-contacts" defaultChecked />
                        <Label htmlFor="emergency-contacts" className="text-sm">
                          Emergency contacts established
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="communication-preferences">
                      Family Communication Preferences
                    </Label>
                    <Textarea
                      id="communication-preferences"
                      placeholder="Enter communication preferences"
                      defaultValue="Primary contact: Son (Mohammed) - Prefers WhatsApp. Secondary contact: Daughter (Fatima) - Prefers phone calls. Best time to contact: Evenings after 6pm."
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Quality Protocols</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="quality-monitoring" defaultChecked />
                        <Label htmlFor="quality-monitoring" className="text-sm">
                          Quality monitoring established
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="feedback-mechanisms" defaultChecked />
                        <Label
                          htmlFor="feedback-mechanisms"
                          className="text-sm"
                        >
                          Feedback mechanisms setup
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="escalation-procedures" defaultChecked />
                        <Label
                          htmlFor="escalation-procedures"
                          className="text-sm"
                        >
                          Escalation procedures communicated
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="quality-notes">
                      Quality Assurance Notes
                    </Label>
                    <Textarea
                      id="quality-notes"
                      placeholder="Enter quality assurance notes"
                      defaultValue="Weekly quality checks scheduled. Patient satisfaction survey to be conducted after first week. 24/7 emergency line established."
                    />
                  </div>

                  <div>
                    <Label htmlFor="launch-notes">Service Launch Notes</Label>
                    <Textarea
                      id="launch-notes"
                      placeholder="Enter service launch notes"
                      defaultValue="All preparations completed. Service ready to launch. Initial focus on wound care and medication management. Follow-up assessment scheduled for one week after service start."
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline">Reset</Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" /> Save Draft
                </Button>
                <Button onClick={() => handleStatusChange("Ready to Start")}>
                  <Upload className="h-4 w-4 mr-2" /> Complete & Launch
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StartOfService;
