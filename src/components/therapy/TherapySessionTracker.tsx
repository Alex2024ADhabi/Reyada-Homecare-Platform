import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Edit,
  Trash2,
  Calendar,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  getAllTherapySessions,
  deleteTherapySession,
  TherapySession,
} from "@/api/therapy.api";
import TherapySessionForm from "./TherapySessionForm";
import TherapySessionReport from "./TherapySessionReport";
import TherapySessionCalendar from "./TherapySessionCalendar";

export default function TherapySessionTracker() {
  const [therapySessions, setTherapySessions] = useState<TherapySession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<TherapySession[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [therapyTypeFilter, setTherapyTypeFilter] = useState("all-types");
  const [statusFilter, setStatusFilter] = useState("all-statuses");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSession, setEditingSession] = useState<TherapySession | null>(
    null,
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState("list");

  // Get unique values for filters
  const therapyTypes = [
    ...new Set(therapySessions.map((session) => session.therapy_type)),
  ];
  const statuses = [
    ...new Set(therapySessions.map((session) => session.status)),
  ];

  useEffect(() => {
    fetchTherapySessions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, therapyTypeFilter, statusFilter, therapySessions]);

  async function fetchTherapySessions() {
    setIsLoading(true);
    try {
      const data = await getAllTherapySessions();
      setTherapySessions(data);
      setFilteredSessions(data);
    } catch (error) {
      console.error("Error fetching therapy sessions:", error);
      toast({
        title: "Error",
        description: "Failed to load therapy sessions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function applyFilters() {
    let filtered = [...therapySessions];

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (session) =>
          session.patient_id
            .toString()
            .toLowerCase()
            .includes(lowerSearchTerm) ||
          session.therapist.toLowerCase().includes(lowerSearchTerm) ||
          session.session_notes?.toLowerCase().includes(lowerSearchTerm),
      );
    }

    if (therapyTypeFilter && therapyTypeFilter !== "all-types") {
      filtered = filtered.filter(
        (session) => session.therapy_type === therapyTypeFilter,
      );
    }

    if (statusFilter && statusFilter !== "all-statuses") {
      filtered = filtered.filter((session) => session.status === statusFilter);
    }

    setFilteredSessions(filtered);
  }

  function resetFilters() {
    setSearchTerm("");
    setTherapyTypeFilter("all-types");
    setStatusFilter("all-statuses");
  }

  async function handleDelete(id: string) {
    try {
      await deleteTherapySession(id);
      toast({
        title: "Session deleted",
        description: "The therapy session has been deleted successfully.",
      });
      fetchTherapySessions();
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting session:", error);
      toast({
        title: "Error",
        description: "Failed to delete the session. Please try again.",
        variant: "destructive",
      });
    }
  }

  function handleFormSuccess() {
    setShowAddForm(false);
    setEditingSession(null);
    fetchTherapySessions();
  }

  function handleEditClick(session: TherapySession) {
    setEditingSession(session);
  }

  function handleCancelEdit() {
    setEditingSession(null);
  }

  function getStatusBadgeVariant(
    status?: string,
  ): "default" | "secondary" | "destructive" | "outline" {
    switch (status) {
      case "completed":
        return "default";
      case "scheduled":
        return "default";
      case "cancelled":
        return "destructive";
      case "no-show":
        return "secondary";
      default:
        return "secondary";
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Therapy Session Tracker</h1>
          <p className="text-gray-500">
            Manage therapy sessions and patient outcomes
          </p>
        </div>
        <div className="flex space-x-2 mt-4 md:mt-0">
          <Button
            onClick={() => fetchTherapySessions()}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Session
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <TherapySessionForm
                onSuccess={handleFormSuccess}
                onCancel={() => setShowAddForm(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="list">Session List</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="reports">Reports & Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>
                Filter therapy sessions by various criteria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search patient ID or therapist"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>

                <Select
                  value={therapyTypeFilter}
                  onValueChange={setTherapyTypeFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by therapy type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-types">All Types</SelectItem>
                    {therapyTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type === "PT"
                          ? "Physical Therapy"
                          : type === "OT"
                            ? "Occupational Therapy"
                            : type === "ST"
                              ? "Speech Therapy"
                              : type === "RT"
                                ? "Respiratory Therapy"
                                : type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-statuses">All Statuses</SelectItem>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status?.charAt(0).toUpperCase() + status?.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end mt-4">
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  <Filter className="h-4 w-4 mr-2" />
                  Reset Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-500">
                  Loading therapy sessions...
                </p>
              </div>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto" />
                <h3 className="mt-4 text-lg font-medium">
                  No therapy sessions found
                </h3>
                <p className="mt-2 text-gray-500">
                  {searchTerm ||
                  (therapyTypeFilter && therapyTypeFilter !== "all-types") ||
                  (statusFilter && statusFilter !== "all-statuses")
                    ? "Try adjusting your filters"
                    : "Schedule a therapy session to get started"}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSessions.map((session) => (
                <Card key={session._id?.toString()}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div>
                        <CardTitle>Patient ID: {session.patient_id}</CardTitle>
                        <CardDescription>{session.therapist}</CardDescription>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(session)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setShowDeleteConfirm(session._id?.toString() || "")
                          }
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          Therapy Type:
                        </span>
                        <span className="text-sm">
                          {session.therapy_type === "PT"
                            ? "Physical Therapy"
                            : session.therapy_type === "OT"
                              ? "Occupational Therapy"
                              : session.therapy_type === "ST"
                                ? "Speech Therapy"
                                : session.therapy_type === "RT"
                                  ? "Respiratory Therapy"
                                  : session.therapy_type}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          Date & Time:
                        </span>
                        <span className="text-sm">
                          {session.session_date} at {session.session_time}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Duration:</span>
                        <span className="text-sm">
                          {session.duration_minutes} minutes
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Status:</span>
                        <Badge variant={getStatusBadgeVariant(session.status)}>
                          {session.status?.charAt(0).toUpperCase() +
                            session.status?.slice(1)}
                        </Badge>
                      </div>
                      {session.progress_rating && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            Progress Rating:
                          </span>
                          <div className="flex items-center">
                            <span className="text-sm mr-2">
                              {session.progress_rating}/10
                            </span>
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{
                                  width: `${(session.progress_rating / 10) * 100}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )}
                      {session.goals_addressed && (
                        <div>
                          <span className="text-sm font-medium">Goals:</span>
                          <p className="text-sm mt-1">
                            {session.goals_addressed}
                          </p>
                        </div>
                      )}
                      {session.next_session_scheduled && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            Next Session:
                          </span>
                          <span className="text-sm">
                            {session.next_session_scheduled}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar">
          <TherapySessionCalendar
            sessions={therapySessions}
            onEditSession={handleEditClick}
          />
        </TabsContent>

        <TabsContent value="reports">
          <TherapySessionReport data={therapySessions} />
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      {editingSession && (
        <Dialog
          open={!!editingSession}
          onOpenChange={(open) => !open && setEditingSession(null)}
        >
          <DialogContent className="max-w-4xl">
            <TherapySessionForm
              initialData={editingSession}
              onSuccess={handleFormSuccess}
              onCancel={handleCancelEdit}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <Dialog
          open={!!showDeleteConfirm}
          onOpenChange={(open) => !open && setShowDeleteConfirm(null)}
        >
          <DialogContent>
            <div className="p-4">
              <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
              <p className="mb-6">
                Are you sure you want to delete this therapy session? This
                action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(showDeleteConfirm)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
