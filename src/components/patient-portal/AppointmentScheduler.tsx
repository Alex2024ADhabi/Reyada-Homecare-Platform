import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Video,
  Home,
  User,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Appointment, AppointmentSlot } from "@/types/patient-portal";
import { format, isToday, isTomorrow, addDays } from "date-fns";
import { useAppointmentScheduling } from "@/hooks/useAppointmentScheduling";
import { useToast } from "@/hooks/useToast";

interface AppointmentSchedulerProps {
  patientId: string;
  upcomingAppointments: Appointment[];
  className?: string;
}

export const AppointmentScheduler: React.FC<AppointmentSchedulerProps> = ({
  patientId,
  upcomingAppointments,
  className = "",
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlot | null>(
    null,
  );
  const [appointmentType, setAppointmentType] = useState("");
  const [appointmentReason, setAppointmentReason] = useState("");
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");

  const {
    availableSlots,
    isLoading,
    bookAppointment,
    cancelAppointment,
    rescheduleAppointment,
  } = useAppointmentScheduling(patientId);
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "in-progress":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "no-show":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLocationIcon = (type: string) => {
    switch (type) {
      case "home":
        return <Home className="h-4 w-4" />;
      case "virtual":
        return <Video className="h-4 w-4" />;
      case "clinic":
        return <MapPin className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  const getAppointmentDateLabel = (date: string) => {
    const appointmentDate = new Date(date);
    if (isToday(appointmentDate)) return "Today";
    if (isTomorrow(appointmentDate)) return "Tomorrow";
    return format(appointmentDate, "MMM dd, yyyy");
  };

  const handleBookAppointment = async () => {
    if (!selectedSlot || !appointmentType || !appointmentReason) {
      toast({
        title: "Missing Information",
        description:
          "Please select a time slot, appointment type, and provide a reason for your visit.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Enhanced validation before booking
      const validationResult = await validateAppointmentData({
        slotId: selectedSlot.id,
        type: appointmentType,
        reason: appointmentReason,
        date: selectedDate,
        patientId,
      });

      if (!validationResult.isValid) {
        toast({
          title: "Validation Error",
          description: validationResult.errors.join(", "),
          variant: "destructive",
        });
        return;
      }

      const result = await bookAppointment({
        slotId: selectedSlot.id,
        type: appointmentType,
        reason: appointmentReason,
        date: selectedDate,
        patientId,
        validationToken: validationResult.token,
      });

      // Enhanced success notification with more details
      toast({
        title: "Appointment Booked Successfully",
        description: `Your ${appointmentType} appointment is confirmed for ${format(selectedDate, "MMM dd, yyyy")} at ${selectedSlot.startTime}. Confirmation: ${result.confirmationCode || "N/A"}`,
      });

      // Send confirmation email/SMS
      await sendAppointmentConfirmation(result.appointmentId);

      // Reset form
      setIsBookingDialogOpen(false);
      setSelectedSlot(null);
      setAppointmentType("");
      setAppointmentReason("");

      // Refresh appointments list
      window.location.reload();
    } catch (error) {
      console.error("Failed to book appointment:", error);

      // Enhanced error handling with specific error types
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      const isNetworkError =
        errorMessage.includes("network") || errorMessage.includes("fetch");

      toast({
        title: "Booking Failed",
        description: isNetworkError
          ? "Network error. Please check your connection and try again."
          : `Unable to book your appointment: ${errorMessage}. Please contact support if the issue persists.`,
        variant: "destructive",
      });
    }
  };

  // Helper function for appointment validation
  const validateAppointmentData = async (data: any) => {
    const errors = [];

    // Check for scheduling conflicts
    const conflicts = upcomingAppointments.filter(
      (apt) =>
        format(new Date(apt.scheduledDate), "yyyy-MM-dd") ===
          format(data.date, "yyyy-MM-dd") && apt.status !== "cancelled",
    );

    if (conflicts.length > 0) {
      errors.push("You already have an appointment scheduled for this date");
    }

    // Validate appointment type and reason
    if (data.reason.length < 10) {
      errors.push(
        "Please provide a more detailed reason for your visit (minimum 10 characters)",
      );
    }

    // Check provider availability
    const providerAvailable = await checkProviderAvailability(
      data.slotId,
      data.date,
    );
    if (!providerAvailable) {
      errors.push("Selected time slot is no longer available");
    }

    return {
      isValid: errors.length === 0,
      errors,
      token: errors.length === 0 ? generateValidationToken() : null,
    };
  };

  // Helper functions
  const sendAppointmentConfirmation = async (appointmentId: string) => {
    try {
      await fetch("/api/appointments/send-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId }),
      });
    } catch (error) {
      console.warn("Failed to send confirmation:", error);
    }
  };

  const checkProviderAvailability = async (slotId: string, date: Date) => {
    try {
      const response = await fetch(
        `/api/appointments/check-availability?slotId=${slotId}&date=${date.toISOString()}`,
      );
      const result = await response.json();
      return result.available;
    } catch (error) {
      console.warn("Failed to check availability:", error);
      return true; // Assume available if check fails
    }
  };

  const generateValidationToken = () => {
    return `val_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      await cancelAppointment(appointmentId);
      toast({
        title: "Appointment Cancelled",
        description:
          "Your appointment has been cancelled successfully. You may reschedule at any time.",
      });
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
      toast({
        title: "Cancellation Failed",
        description:
          "Unable to cancel your appointment. Please contact support for assistance.",
        variant: "destructive",
      });
    }
  };

  const upcomingAppointmentsList = upcomingAppointments.filter((app) =>
    ["scheduled", "confirmed"].includes(app.status),
  );

  const pastAppointments = upcomingAppointments.filter((app) =>
    ["completed", "cancelled", "no-show"].includes(app.status),
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Appointments</h2>
          <p className="text-gray-600 mt-1">
            Schedule new appointments and manage your existing ones
          </p>
        </div>
        <Dialog
          open={isBookingDialogOpen}
          onOpenChange={setIsBookingDialogOpen}
        >
          <DialogTrigger asChild>
            <Button className="mt-4 sm:mt-0">
              <Plus className="h-4 w-4 mr-2" />
              Schedule Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Schedule New Appointment</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Calendar */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Select Date</h3>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  disabled={(date) =>
                    date < new Date() || date > addDays(new Date(), 90)
                  }
                  className="rounded-md border"
                />
              </div>

              {/* Available Slots */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">
                  Available Times - {format(selectedDate, "MMM dd, yyyy")}
                </h3>

                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedSlot(slot)}
                        className={`w-full p-3 text-left rounded-lg border transition-colors ${
                          selectedSlot?.id === slot.id
                            ? "bg-blue-50 border-blue-200"
                            : "hover:bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">
                                {slot.startTime} - {slot.endTime}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              {getLocationIcon(slot.location.type)}
                              <span className="text-sm text-gray-600">
                                {slot.providerName} • {slot.location.type}
                              </span>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {slot.duration} min
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">
                      No available slots for this date
                    </p>
                  </div>
                )}
              </div>
            </div>

            {selectedSlot && (
              <div className="space-y-4 mt-6 pt-6 border-t">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment Type
                  </label>
                  <Select
                    value={appointmentType}
                    onValueChange={setAppointmentType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select appointment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="follow-up">Follow-up</SelectItem>
                      <SelectItem value="therapy">Therapy Session</SelectItem>
                      <SelectItem value="assessment">Assessment</SelectItem>
                      <SelectItem value="procedure">Procedure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Visit
                  </label>
                  <Textarea
                    value={appointmentReason}
                    onChange={(e) => setAppointmentReason(e.target.value)}
                    placeholder="Please describe the reason for your appointment..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsBookingDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleBookAppointment}
                    disabled={!appointmentType || !appointmentReason}
                  >
                    Book Appointment
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Appointments List */}
      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="upcoming">
                Upcoming ({upcomingAppointmentsList.length})
              </TabsTrigger>
              <TabsTrigger value="past">
                Past ({pastAppointments.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent>
          <TabsContent value="upcoming">
            {upcomingAppointmentsList.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointmentsList.map((appointment) => (
                  <div key={appointment.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          {getLocationIcon(appointment.location.type)}
                          <h3 className="font-medium text-gray-900">
                            {appointment.title}
                          </h3>
                        </div>
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Reschedule
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleCancelAppointment(appointment.id)
                          }
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="h-4 w-4 text-gray-500" />
                        <span>
                          {getAppointmentDateLabel(appointment.scheduledDate)}{" "}
                          at{" "}
                          {format(new Date(appointment.scheduledDate), "HH:mm")}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span>{appointment.providerName}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{appointment.duration} minutes</span>
                      </div>
                    </div>

                    {appointment.description && (
                      <p className="text-sm text-gray-600 mt-2">
                        {appointment.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        {getLocationIcon(appointment.location.type)}
                        <span className="capitalize">
                          {appointment.location.type}
                        </span>
                        {appointment.location.address && (
                          <span>• {appointment.location.address}</span>
                        )}
                      </div>

                      {appointment.location.type === "virtual" &&
                        appointment.location.meetingLink && (
                          <Button size="sm" variant="outline">
                            <Video className="h-4 w-4 mr-1" />
                            Join Meeting
                          </Button>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Upcoming Appointments
                </h3>
                <p className="text-gray-500 mb-6">
                  You don't have any upcoming appointments scheduled.
                </p>
                <Button onClick={() => setIsBookingDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Your First Appointment
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {pastAppointments.length > 0 ? (
              <div className="space-y-4">
                {pastAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-4 border rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          {appointment.status === "completed" ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          )}
                          <h3 className="font-medium text-gray-900">
                            {appointment.title}
                          </h3>
                        </div>
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="h-4 w-4" />
                        <span>
                          {format(
                            new Date(appointment.scheduledDate),
                            "MMM dd, yyyy",
                          )}{" "}
                          at{" "}
                          {format(new Date(appointment.scheduledDate), "HH:mm")}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>{appointment.providerName}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>{appointment.duration} minutes</span>
                      </div>
                    </div>

                    {appointment.notes && (
                      <div className="mt-3 p-3 bg-white rounded border">
                        <h4 className="text-sm font-medium text-gray-900 mb-1">
                          Notes
                        </h4>
                        <p className="text-sm text-gray-600">
                          {appointment.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Past Appointments
                </h3>
                <p className="text-gray-500">
                  Your appointment history will appear here.
                </p>
              </div>
            )}
          </TabsContent>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentScheduler;
