import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Plus,
  User,
} from "lucide-react";

interface EpisodeEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type:
    | "assessment"
    | "visit"
    | "document"
    | "compliance"
    | "safety_incident"
    | "medication_admin"
    | "vital_signs";
  status: "completed" | "pending" | "overdue" | "scheduled";
  // Enhanced fields for medical records integration
  clinician?: string;
  location?: string;
  duration?: number;
  outcomes?: string;
  complications?: string;
  followUpRequired?: boolean;
  // DOH Patient Safety Integration
  safetyClassification?: {
    riskLevel: "low" | "medium" | "high" | "critical";
    preventable: boolean;
    reportedToDOH: boolean;
    taxonomyClassified: boolean;
  };
  // Medical Records Compliance
  documentationComplete: boolean;
  signedBy?: string;
  witnessedBy?: string;
  electronicSignature?: {
    timestamp: string;
    ipAddress: string;
    deviceId: string;
  };
}

interface ClinicalForm {
  id: string;
  name: string;
  lastUpdated: string;
  status: "completed" | "pending" | "draft";
  compliance: number;
}

interface PatientEpisodeProps {
  episodeId?: string;
  patientId?: string;
  episodeData?: {
    id: string;
    startDate: string;
    endDate?: string;
    status: "active" | "completed" | "pending";
    careType: string;
    primaryDiagnosis: string;
    complianceScore: number;
    events: EpisodeEvent[];
    clinicalForms: ClinicalForm[];
  };
}

const PatientEpisode: React.FC<PatientEpisodeProps> = ({
  episodeId = "EP12345",
  patientId = "PT67890",
  episodeData = {
    id: "EP12345",
    startDate: "2023-06-15",
    endDate: "2023-09-15",
    status: "active" as const,
    careType: "Post-Hospital Transitional Care",
    primaryDiagnosis: "Congestive Heart Failure",
    complianceScore: 85,
    events: [
      {
        id: "EV001",
        date: "2023-06-15",
        title: "Initial Assessment",
        description: "Complete 9-domain DOH assessment",
        type: "assessment" as const,
        status: "completed" as const,
      },
      {
        id: "EV002",
        date: "2023-06-18",
        title: "Nursing Visit",
        description: "Vital signs monitoring and medication review",
        type: "visit" as const,
        status: "completed" as const,
      },
      {
        id: "EV003",
        date: "2023-06-22",
        title: "Physiotherapy Session",
        description: "Mobility exercises and gait training",
        type: "visit" as const,
        status: "completed" as const,
      },
      {
        id: "EV004",
        date: "2023-06-25",
        title: "Wound Care Documentation",
        description: "Wound measurement and treatment plan",
        type: "document" as const,
        status: "pending" as const,
      },
      {
        id: "EV005",
        date: "2023-06-28",
        title: "DOH Compliance Check",
        description: "Verification of documentation standards",
        type: "compliance" as const,
        status: "scheduled" as const,
      },
    ],
    clinicalForms: [
      {
        id: "CF001",
        name: "DOH Healthcare Assessment",
        lastUpdated: "2023-06-15",
        status: "completed" as const,
        compliance: 100,
      },
      {
        id: "CF002",
        name: "Nursing Progress Note",
        lastUpdated: "2023-06-18",
        status: "completed" as const,
        compliance: 95,
      },
      {
        id: "CF003",
        name: "Physiotherapy Assessment",
        lastUpdated: "2023-06-22",
        status: "completed" as const,
        compliance: 90,
      },
      {
        id: "CF004",
        name: "Wound Assessment",
        lastUpdated: "2023-06-25",
        status: "draft" as const,
        compliance: 60,
      },
      {
        id: "CF005",
        name: "Medication Administration Record",
        lastUpdated: "",
        status: "pending" as const,
        compliance: 0,
      },
    ],
  },
}) => {
  const [activeTab, setActiveTab] = useState("overview");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "active":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "assessment":
        return <FileText className="h-4 w-4" />;
      case "visit":
        return <User className="h-4 w-4" />;
      case "document":
        return <FileText className="h-4 w-4" />;
      case "compliance":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Episode of Care</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">{episodeData.id}</Badge>
            <Badge className={getStatusColor(episodeData.status)}>
              {episodeData.status.charAt(0).toUpperCase() +
                episodeData.status.slice(1)}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Edit Episode</Button>
          <Button>Create Document</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Care Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{episodeData.careType}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Primary Diagnosis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">
              {episodeData.primaryDiagnosis}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              DOH Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Progress value={episodeData.complianceScore} className="h-2" />
              <span className="text-lg font-medium">
                {episodeData.complianceScore}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Start Date: {episodeData.startDate}
          </span>
        </div>
        {episodeData.endDate && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              End Date: {episodeData.endDate}
            </span>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="documents">Clinical Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Episode Summary</CardTitle>
              <CardDescription>
                Key information about this episode of care
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Care Plan Goals</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      Improve mobility and independence in activities of daily
                      living
                    </li>
                    <li>
                      Stabilize vital signs and manage heart failure symptoms
                    </li>
                    <li>
                      Prevent hospital readmission within 30 days of discharge
                    </li>
                    <li>
                      Educate patient and caregiver on medication management
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Recent Vital Signs</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-muted-foreground">
                        Blood Pressure
                      </p>
                      <p className="font-medium">130/85 mmHg</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-muted-foreground">
                        Heart Rate
                      </p>
                      <p className="font-medium">78 bpm</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-muted-foreground">
                        Oxygen Saturation
                      </p>
                      <p className="font-medium">96%</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-muted-foreground">
                        Temperature
                      </p>
                      <p className="font-medium">36.7°C</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Visits</CardTitle>
              <CardDescription>Scheduled care team visits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Nursing Visit</p>
                      <p className="text-sm text-muted-foreground">
                        June 30, 2023 - 10:00 AM
                      </p>
                    </div>
                  </div>
                  <Badge>Scheduled</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Physiotherapy Session</p>
                      <p className="text-sm text-muted-foreground">
                        July 2, 2023 - 2:00 PM
                      </p>
                    </div>
                  </div>
                  <Badge>Scheduled</Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" /> Schedule New Visit
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Care Journey Timeline</CardTitle>
              <CardDescription>
                Chronological view of patient care activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {episodeData.events.map((event, index) => (
                  <div key={event.id} className="relative pl-6 pb-6">
                    {index < episodeData.events.length - 1 && (
                      <div className="absolute left-2 top-2 bottom-0 w-0.5 bg-gray-200" />
                    )}
                    <div className="absolute left-0 top-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      {getEventIcon(event.type)}
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{event.title}</h4>
                        <Badge className={getStatusColor(event.status)}>
                          {event.status.charAt(0).toUpperCase() +
                            event.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {event.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{event.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" /> Add Timeline Event
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Clinical Documentation</CardTitle>
              <CardDescription>
                Forms and clinical notes for this episode
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {episodeData.clinicalForms.map((form) => (
                  <div
                    key={form.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{form.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {form.lastUpdated
                            ? `Last updated: ${form.lastUpdated}`
                            : "Not started"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(form.status)}>
                        {form.status.charAt(0).toUpperCase() +
                          form.status.slice(1)}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <span className="text-sm">{form.compliance}%</span>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" /> Create New Document
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientEpisode;
