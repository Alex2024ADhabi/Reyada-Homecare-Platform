import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  Plus,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Settings,
  UserPlus,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
} from "lucide-react";
import { communicationAPI } from "@/api/communication.api";

interface Committee {
  _id: string;
  committee_id: string;
  committee_name: string;
  committee_type: string;
  description: string;
  purpose: string;
  scope: string;
  authority_level: string;
  reporting_to: string;
  meeting_frequency: string;
  members: Array<{
    member_id: string;
    name: string;
    role: string;
    committee_role: string;
    department: string;
    joined_date: string;
    status: string;
    voting_rights: boolean;
  }>;
  responsibilities: string[];
  meeting_schedule: {
    day_of_month: number;
    time: string;
    duration_minutes: number;
    location: string;
    virtual_option: boolean;
  };
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface CommitteeMeeting {
  _id: string;
  meeting_id: string;
  committee_id: string;
  committee_name: string;
  meeting_title: string;
  meeting_type: string;
  meeting_date: string;
  meeting_time: string;
  duration_minutes: number;
  location: string;
  meeting_format: string;
  chairperson: {
    member_id: string;
    name: string;
    role: string;
  };
  secretary: {
    member_id: string;
    name: string;
    role: string;
  };
  attendees: Array<{
    member_id: string;
    name: string;
    attendance_status: string;
    attendance_type: string;
  }>;
  agenda_items: Array<{
    item_id: string;
    item_number: number;
    title: string;
    description: string;
    presenter: string;
    time_allocated: number;
    item_type: string;
    supporting_documents: string[];
  }>;
  decisions_made: Array<{
    decision_id: string;
    agenda_item_id: string;
    decision_text: string;
    decision_type: string;
    voting_result: {
      in_favor: number;
      against: number;
      abstained: number;
    };
    responsible_party: string;
    deadline: string;
  }>;
  action_items: Array<{
    action_id: string;
    description: string;
    assigned_to: string;
    due_date: string;
    priority: string;
    status: string;
  }>;
  meeting_notes: string;
  next_meeting: {
    scheduled_date: string;
    scheduled_time: string;
    location: string;
  };
  meeting_status: string;
  minutes_approved: boolean;
  minutes_approved_by?: string;
  minutes_approved_date?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

const CommitteeManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState("committees");
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [meetings, setMeetings] = useState<CommitteeMeeting[]>([]);
  const [selectedCommittee, setSelectedCommittee] = useState<Committee | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCommitteeDialog, setShowCommitteeDialog] = useState(false);
  const [showMeetingDialog, setShowMeetingDialog] = useState(false);

  // Committee Form State
  const [committeeForm, setCommitteeForm] = useState({
    committee_name: "",
    committee_type: "quality_management",
    description: "",
    purpose: "",
    scope: "",
    authority_level: "advisory",
    reporting_to: "",
    meeting_frequency: "monthly",
    members: [] as any[],
    responsibilities: [] as string[],
    meeting_schedule: {
      day_of_month: 15,
      time: "14:00",
      duration_minutes: 120,
      location: "Conference Room A",
      virtual_option: true,
    },
  });

  // Meeting Form State
  const [meetingForm, setMeetingForm] = useState({
    committee_id: "",
    meeting_title: "",
    meeting_type: "regular",
    meeting_date: "",
    meeting_time: "14:00",
    duration_minutes: 120,
    location: "Conference Room A",
    meeting_format: "hybrid",
    agenda_items: [] as any[],
  });

  useEffect(() => {
    loadCommittees();
    loadMeetings();
  }, []);

  const loadCommittees = async () => {
    try {
      setIsLoading(true);
      const committeeData = await communicationAPI.committee.getCommittees();
      setCommittees(committeeData);
    } catch (error) {
      console.error("Error loading committees:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMeetings = async () => {
    try {
      const meetingData = await communicationAPI.committee.getMeetings();
      setMeetings(meetingData);
    } catch (error) {
      console.error("Error loading meetings:", error);
    }
  };

  const createCommittee = async () => {
    try {
      await communicationAPI.committee.createCommittee({
        ...committeeForm,
        created_by: "Dr. Sarah Ahmed",
      });
      setShowCommitteeDialog(false);
      resetCommitteeForm();
      loadCommittees();
    } catch (error) {
      console.error("Error creating committee:", error);
    }
  };

  const scheduleMeeting = async () => {
    try {
      await communicationAPI.committee.scheduleMeeting({
        ...meetingForm,
        chairperson: {
          member_id: "EMP001",
          name: "Dr. Sarah Ahmed",
          role: "Head Nurse",
        },
        secretary: {
          member_id: "EMP006",
          name: "Layla Al Zahra",
          role: "Quality Manager",
        },
        attendees: [],
        decisions_made: [],
        action_items: [],
        meeting_notes: "",
        next_meeting: {
          scheduled_date: "",
          scheduled_time: "",
          location: "",
        },
        minutes_approved: false,
        created_by: "Dr. Sarah Ahmed",
      });
      setShowMeetingDialog(false);
      resetMeetingForm();
      loadMeetings();
    } catch (error) {
      console.error("Error scheduling meeting:", error);
    }
  };

  const resetCommitteeForm = () => {
    setCommitteeForm({
      committee_name: "",
      committee_type: "quality_management",
      description: "",
      purpose: "",
      scope: "",
      authority_level: "advisory",
      reporting_to: "",
      meeting_frequency: "monthly",
      members: [],
      responsibilities: [],
      meeting_schedule: {
        day_of_month: 15,
        time: "14:00",
        duration_minutes: 120,
        location: "Conference Room A",
        virtual_option: true,
      },
    });
  };

  const resetMeetingForm = () => {
    setMeetingForm({
      committee_id: "",
      meeting_title: "",
      meeting_type: "regular",
      meeting_date: "",
      meeting_time: "14:00",
      duration_minutes: 120,
      location: "Conference Room A",
      meeting_format: "hybrid",
      agenda_items: [],
    });
  };

  const addResponsibility = () => {
    setCommitteeForm({
      ...committeeForm,
      responsibilities: [...committeeForm.responsibilities, ""],
    });
  };

  const removeResponsibility = (index: number) => {
    const newResponsibilities = committeeForm.responsibilities.filter(
      (_, i) => i !== index,
    );
    setCommitteeForm({
      ...committeeForm,
      responsibilities: newResponsibilities,
    });
  };

  const updateResponsibility = (index: number, value: string) => {
    const newResponsibilities = [...committeeForm.responsibilities];
    newResponsibilities[index] = value;
    setCommitteeForm({
      ...committeeForm,
      responsibilities: newResponsibilities,
    });
  };

  const addAgendaItem = () => {
    setMeetingForm({
      ...meetingForm,
      agenda_items: [
        ...meetingForm.agenda_items,
        {
          item_number: meetingForm.agenda_items.length + 1,
          title: "",
          description: "",
          presenter: "",
          time_allocated: 30,
          item_type: "discussion",
          supporting_documents: [],
        },
      ],
    });
  };

  const removeAgendaItem = (index: number) => {
    const newItems = meetingForm.agenda_items.filter((_, i) => i !== index);
    setMeetingForm({ ...meetingForm, agenda_items: newItems });
  };

  const updateAgendaItem = (index: number, field: string, value: any) => {
    const newItems = [...meetingForm.agenda_items];
    newItems[index] = { ...newItems[index], [field]: value };
    setMeetingForm({ ...meetingForm, agenda_items: newItems });
  };

  const filteredCommittees = committees.filter(
    (committee) =>
      committee.committee_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      committee.committee_type.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredMeetings = meetings.filter(
    (meeting) =>
      meeting.meeting_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.committee_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading committee management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Users className="h-6 w-6 mr-3 text-blue-600" />
              Committee Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage committees, schedule meetings, and track action items
            </p>
          </div>
          <div className="flex space-x-2">
            <Dialog
              open={showCommitteeDialog}
              onOpenChange={setShowCommitteeDialog}
            >
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Committee
                </Button>
              </DialogTrigger>
            </Dialog>
            <Dialog
              open={showMeetingDialog}
              onOpenChange={setShowMeetingDialog}
            >
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search committees and meetings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="committees">Committees</TabsTrigger>
          <TabsTrigger value="meetings">Meetings</TabsTrigger>
          <TabsTrigger value="actions">Action Items</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Committees Tab */}
        <TabsContent value="committees">
          <div className="grid gap-6">
            {filteredCommittees.map((committee) => (
              <Card
                key={committee.committee_id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {committee.committee_name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {committee.committee_type.replace("_", " ")} •{" "}
                        {committee.meeting_frequency}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(committee.status)}>
                        {committee.status}
                      </Badge>
                      <Badge variant="outline">
                        {committee.members.length} members
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Purpose
                      </Label>
                      <p className="text-sm text-gray-900 mt-1">
                        {committee.purpose}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Key Responsibilities
                      </Label>
                      <div className="mt-1">
                        {committee.responsibilities
                          .slice(0, 3)
                          .map((resp, index) => (
                            <p key={index} className="text-sm text-gray-900">
                              • {resp}
                            </p>
                          ))}
                        {committee.responsibilities.length > 3 && (
                          <p className="text-sm text-gray-500">
                            +{committee.responsibilities.length - 3} more
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Next: {committee.meeting_schedule.day_of_month}th at{" "}
                          {committee.meeting_schedule.time}
                        </span>
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {committee.created_by}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setMeetingForm({
                              ...meetingForm,
                              committee_id: committee.committee_id,
                            });
                            setShowMeetingDialog(true);
                          }}
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Meetings Tab */}
        <TabsContent value="meetings">
          <div className="space-y-4">
            {filteredMeetings.map((meeting) => (
              <Card
                key={meeting.meeting_id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {meeting.meeting_title}
                        </h3>
                        <Badge
                          className={getStatusColor(meeting.meeting_status)}
                        >
                          {meeting.meeting_status}
                        </Badge>
                        <Badge variant="outline">
                          {meeting.meeting_format}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Committee:</span>{" "}
                          {meeting.committee_name}
                        </div>
                        <div>
                          <span className="font-medium">Date:</span>{" "}
                          {formatDate(meeting.meeting_date)} at{" "}
                          {meeting.meeting_time}
                        </div>
                        <div>
                          <span className="font-medium">Duration:</span>{" "}
                          {meeting.duration_minutes} minutes
                        </div>
                        <div>
                          <span className="font-medium">Location:</span>{" "}
                          {meeting.location}
                        </div>
                        <div>
                          <span className="font-medium">Chairperson:</span>{" "}
                          {meeting.chairperson.name}
                        </div>
                        <div>
                          <span className="font-medium">Attendees:</span>{" "}
                          {meeting.attendees.length} participants
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex space-x-4 text-sm">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-blue-600">
                            {meeting.agenda_items.length}
                          </div>
                          <div className="text-xs text-gray-500">
                            Agenda Items
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-green-600">
                            {meeting.decisions_made.length}
                          </div>
                          <div className="text-xs text-gray-500">Decisions</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-orange-600">
                            {meeting.action_items.length}
                          </div>
                          <div className="text-xs text-gray-500">Actions</div>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Action Items Tab */}
        <TabsContent value="actions">
          <div className="grid gap-4">
            {meetings
              .flatMap((meeting) => meeting.action_items)
              .map((action, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {action.description}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span>Assigned to: {action.assigned_to}</span>
                          <span>Due: {formatDate(action.due_date)}</span>
                          <Badge
                            variant={
                              action.priority === "high"
                                ? "destructive"
                                : action.priority === "medium"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {action.priority}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(action.status)}>
                          {action.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Active Committees
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {committees.filter((c) => c.status === "active").length}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Meetings This Month
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {meetings.length}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Pending Actions
                    </p>
                    <p className="text-2xl font-bold text-orange-600">
                      {
                        meetings
                          .flatMap((m) => m.action_items)
                          .filter((a) => a.status === "pending").length
                      }
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Completion Rate
                    </p>
                    <p className="text-2xl font-bold text-purple-600">87.5%</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Committee Dialog */}
      <Dialog open={showCommitteeDialog} onOpenChange={setShowCommitteeDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Committee</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="committee_name">Committee Name</Label>
                <Input
                  id="committee_name"
                  value={committeeForm.committee_name}
                  onChange={(e) =>
                    setCommitteeForm({
                      ...committeeForm,
                      committee_name: e.target.value,
                    })
                  }
                  placeholder="Enter committee name"
                />
              </div>
              <div>
                <Label htmlFor="committee_type">Committee Type</Label>
                <Select
                  value={committeeForm.committee_type}
                  onValueChange={(value) =>
                    setCommitteeForm({
                      ...committeeForm,
                      committee_type: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quality_management">
                      Quality Management
                    </SelectItem>
                    <SelectItem value="infection_control">
                      Infection Control
                    </SelectItem>
                    <SelectItem value="patient_safety">
                      Patient Safety
                    </SelectItem>
                    <SelectItem value="ethics">Ethics</SelectItem>
                    <SelectItem value="governance">Governance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={committeeForm.description}
                onChange={(e) =>
                  setCommitteeForm({
                    ...committeeForm,
                    description: e.target.value,
                  })
                }
                placeholder="Enter committee description"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="purpose">Purpose</Label>
              <Textarea
                id="purpose"
                value={committeeForm.purpose}
                onChange={(e) =>
                  setCommitteeForm({
                    ...committeeForm,
                    purpose: e.target.value,
                  })
                }
                placeholder="Enter committee purpose"
                rows={3}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Responsibilities</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addResponsibility}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Responsibility
                </Button>
              </div>
              <div className="space-y-2">
                {committeeForm.responsibilities.map((responsibility, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      placeholder="Enter responsibility"
                      value={responsibility}
                      onChange={(e) =>
                        updateResponsibility(index, e.target.value)
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeResponsibility(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowCommitteeDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={createCommittee}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Create Committee
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Meeting Dialog */}
      <Dialog open={showMeetingDialog} onOpenChange={setShowMeetingDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schedule Meeting</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="committee_select">Select Committee</Label>
              <Select
                value={meetingForm.committee_id}
                onValueChange={(value) =>
                  setMeetingForm({ ...meetingForm, committee_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a committee" />
                </SelectTrigger>
                <SelectContent>
                  {committees.map((committee) => (
                    <SelectItem
                      key={committee.committee_id}
                      value={committee.committee_id}
                    >
                      {committee.committee_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="meeting_title">Meeting Title</Label>
              <Input
                id="meeting_title"
                value={meetingForm.meeting_title}
                onChange={(e) =>
                  setMeetingForm({
                    ...meetingForm,
                    meeting_title: e.target.value,
                  })
                }
                placeholder="Enter meeting title"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="meeting_date">Meeting Date</Label>
                <Input
                  id="meeting_date"
                  type="date"
                  value={meetingForm.meeting_date}
                  onChange={(e) =>
                    setMeetingForm({
                      ...meetingForm,
                      meeting_date: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="meeting_time">Meeting Time</Label>
                <Input
                  id="meeting_time"
                  type="time"
                  value={meetingForm.meeting_time}
                  onChange={(e) =>
                    setMeetingForm({
                      ...meetingForm,
                      meeting_time: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Agenda Items</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAgendaItem}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>
              <div className="space-y-2">
                {meetingForm.agenda_items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 p-2 border rounded"
                  >
                    <Input
                      placeholder="Agenda item title"
                      value={item.title}
                      onChange={(e) =>
                        updateAgendaItem(index, "title", e.target.value)
                      }
                    />
                    <Input
                      placeholder="Presenter"
                      value={item.presenter}
                      onChange={(e) =>
                        updateAgendaItem(index, "presenter", e.target.value)
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Minutes"
                      value={item.time_allocated}
                      onChange={(e) =>
                        updateAgendaItem(
                          index,
                          "time_allocated",
                          parseInt(e.target.value),
                        )
                      }
                      className="w-20"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAgendaItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowMeetingDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={scheduleMeeting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Meeting
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommitteeManagement;
