import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, Clock, MapPin, Video, Home, User, Plus, Edit, Trash2, CheckCircle, AlertCircle, } from "lucide-react";
import { format, isToday, isTomorrow, addDays } from "date-fns";
import { useAppointmentScheduling } from "@/hooks/useAppointmentScheduling";
import { useToast } from "@/hooks/useToast";
export const AppointmentScheduler = ({ patientId, upcomingAppointments, className = "", }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [appointmentType, setAppointmentType] = useState("");
    const [appointmentReason, setAppointmentReason] = useState("");
    const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("upcoming");
    const { availableSlots, isLoading, bookAppointment, cancelAppointment, rescheduleAppointment, } = useAppointmentScheduling(patientId);
    const { toast } = useToast();
    const getStatusColor = (status) => {
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
    const getLocationIcon = (type) => {
        switch (type) {
            case "home":
                return _jsx(Home, { className: "h-4 w-4" });
            case "virtual":
                return _jsx(Video, { className: "h-4 w-4" });
            case "clinic":
                return _jsx(MapPin, { className: "h-4 w-4" });
            default:
                return _jsx(MapPin, { className: "h-4 w-4" });
        }
    };
    const getAppointmentDateLabel = (date) => {
        const appointmentDate = new Date(date);
        if (isToday(appointmentDate))
            return "Today";
        if (isTomorrow(appointmentDate))
            return "Tomorrow";
        return format(appointmentDate, "MMM dd, yyyy");
    };
    const handleBookAppointment = async () => {
        if (!selectedSlot || !appointmentType || !appointmentReason) {
            toast({
                title: "Missing Information",
                description: "Please select a time slot, appointment type, and provide a reason for your visit.",
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
        }
        catch (error) {
            console.error("Failed to book appointment:", error);
            // Enhanced error handling with specific error types
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            const isNetworkError = errorMessage.includes("network") || errorMessage.includes("fetch");
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
    const validateAppointmentData = async (data) => {
        const errors = [];
        // Check for scheduling conflicts
        const conflicts = upcomingAppointments.filter((apt) => format(new Date(apt.scheduledDate), "yyyy-MM-dd") ===
            format(data.date, "yyyy-MM-dd") && apt.status !== "cancelled");
        if (conflicts.length > 0) {
            errors.push("You already have an appointment scheduled for this date");
        }
        // Validate appointment type and reason
        if (data.reason.length < 10) {
            errors.push("Please provide a more detailed reason for your visit (minimum 10 characters)");
        }
        // Check provider availability
        const providerAvailable = await checkProviderAvailability(data.slotId, data.date);
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
    const sendAppointmentConfirmation = async (appointmentId) => {
        try {
            await fetch("/api/appointments/send-confirmation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ appointmentId }),
            });
        }
        catch (error) {
            console.warn("Failed to send confirmation:", error);
        }
    };
    const checkProviderAvailability = async (slotId, date) => {
        try {
            const response = await fetch(`/api/appointments/check-availability?slotId=${slotId}&date=${date.toISOString()}`);
            const result = await response.json();
            return result.available;
        }
        catch (error) {
            console.warn("Failed to check availability:", error);
            return true; // Assume available if check fails
        }
    };
    const generateValidationToken = () => {
        return `val_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    };
    const handleCancelAppointment = async (appointmentId) => {
        try {
            await cancelAppointment(appointmentId);
            toast({
                title: "Appointment Cancelled",
                description: "Your appointment has been cancelled successfully. You may reschedule at any time.",
            });
        }
        catch (error) {
            console.error("Failed to cancel appointment:", error);
            toast({
                title: "Cancellation Failed",
                description: "Unable to cancel your appointment. Please contact support for assistance.",
                variant: "destructive",
            });
        }
    };
    const upcomingAppointmentsList = upcomingAppointments.filter((app) => ["scheduled", "confirmed"].includes(app.status));
    const pastAppointments = upcomingAppointments.filter((app) => ["completed", "cancelled", "no-show"].includes(app.status));
    return (_jsxs("div", { className: `space-y-6 ${className}`, children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Appointments" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Schedule new appointments and manage your existing ones" })] }), _jsxs(Dialog, { open: isBookingDialogOpen, onOpenChange: setIsBookingDialogOpen, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { className: "mt-4 sm:mt-0", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Schedule Appointment"] }) }), _jsxs(DialogContent, { className: "max-w-4xl max-h-[90vh] overflow-y-auto", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Schedule New Appointment" }) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-medium text-gray-900 mb-3", children: "Select Date" }), _jsx(Calendar, { mode: "single", selected: selectedDate, onSelect: (date) => date && setSelectedDate(date), disabled: (date) => date < new Date() || date > addDays(new Date(), 90), className: "rounded-md border" })] }), _jsxs("div", { children: [_jsxs("h3", { className: "font-medium text-gray-900 mb-3", children: ["Available Times - ", format(selectedDate, "MMM dd, yyyy")] }), isLoading ? (_jsx("div", { className: "flex items-center justify-center h-32", children: _jsx("div", { className: "animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" }) })) : availableSlots.length > 0 ? (_jsx("div", { className: "space-y-2 max-h-64 overflow-y-auto", children: availableSlots.map((slot) => (_jsx("button", { onClick: () => setSelectedSlot(slot), className: `w-full p-3 text-left rounded-lg border transition-colors ${selectedSlot?.id === slot.id
                                                                ? "bg-blue-50 border-blue-200"
                                                                : "hover:bg-gray-50 border-gray-200"}`, children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Clock, { className: "h-4 w-4 text-gray-500" }), _jsxs("span", { className: "font-medium", children: [slot.startTime, " - ", slot.endTime] })] }), _jsxs("div", { className: "flex items-center space-x-2 mt-1", children: [getLocationIcon(slot.location.type), _jsxs("span", { className: "text-sm text-gray-600", children: [slot.providerName, " \u2022 ", slot.location.type] })] })] }), _jsxs("div", { className: "text-sm text-gray-500", children: [slot.duration, " min"] })] }) }, slot.id))) })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(CalendarIcon, { className: "h-12 w-12 text-gray-400 mx-auto mb-2" }), _jsx("p", { className: "text-gray-500", children: "No available slots for this date" })] }))] })] }), selectedSlot && (_jsxs("div", { className: "space-y-4 mt-6 pt-6 border-t", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Appointment Type" }), _jsxs(Select, { value: appointmentType, onValueChange: setAppointmentType, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select appointment type" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "consultation", children: "Consultation" }), _jsx(SelectItem, { value: "follow-up", children: "Follow-up" }), _jsx(SelectItem, { value: "therapy", children: "Therapy Session" }), _jsx(SelectItem, { value: "assessment", children: "Assessment" }), _jsx(SelectItem, { value: "procedure", children: "Procedure" })] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Reason for Visit" }), _jsx(Textarea, { value: appointmentReason, onChange: (e) => setAppointmentReason(e.target.value), placeholder: "Please describe the reason for your appointment...", rows: 3 })] }), _jsxs("div", { className: "flex justify-end space-x-3", children: [_jsx(Button, { variant: "outline", onClick: () => setIsBookingDialogOpen(false), children: "Cancel" }), _jsx(Button, { onClick: handleBookAppointment, disabled: !appointmentType || !appointmentReason, children: "Book Appointment" })] })] }))] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(Tabs, { value: activeTab, onValueChange: setActiveTab, children: _jsxs(TabsList, { children: [_jsxs(TabsTrigger, { value: "upcoming", children: ["Upcoming (", upcomingAppointmentsList.length, ")"] }), _jsxs(TabsTrigger, { value: "past", children: ["Past (", pastAppointments.length, ")"] })] }) }) }), _jsxs(CardContent, { children: [_jsx(TabsContent, { value: "upcoming", children: upcomingAppointmentsList.length > 0 ? (_jsx("div", { className: "space-y-4", children: upcomingAppointmentsList.map((appointment) => (_jsxs("div", { className: "p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [getLocationIcon(appointment.location.type), _jsx("h3", { className: "font-medium text-gray-900", children: appointment.title })] }), _jsx(Badge, { className: getStatusColor(appointment.status), children: appointment.status })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Edit, { className: "h-4 w-4 mr-1" }), "Reschedule"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => handleCancelAppointment(appointment.id), className: "text-red-600 hover:text-red-700", children: [_jsx(Trash2, { className: "h-4 w-4 mr-1" }), "Cancel"] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 text-sm", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(CalendarIcon, { className: "h-4 w-4 text-gray-500" }), _jsxs("span", { children: [getAppointmentDateLabel(appointment.scheduledDate), " ", "at", " ", format(new Date(appointment.scheduledDate), "HH:mm")] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(User, { className: "h-4 w-4 text-gray-500" }), _jsx("span", { children: appointment.providerName })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Clock, { className: "h-4 w-4 text-gray-500" }), _jsxs("span", { children: [appointment.duration, " minutes"] })] })] }), appointment.description && (_jsx("p", { className: "text-sm text-gray-600 mt-2", children: appointment.description })), _jsxs("div", { className: "flex items-center justify-between mt-3 pt-3 border-t", children: [_jsxs("div", { className: "flex items-center space-x-2 text-sm text-gray-600", children: [getLocationIcon(appointment.location.type), _jsx("span", { className: "capitalize", children: appointment.location.type }), appointment.location.address && (_jsxs("span", { children: ["\u2022 ", appointment.location.address] }))] }), appointment.location.type === "virtual" &&
                                                        appointment.location.meetingLink && (_jsxs(Button, { size: "sm", variant: "outline", children: [_jsx(Video, { className: "h-4 w-4 mr-1" }), "Join Meeting"] }))] })] }, appointment.id))) })) : (_jsxs("div", { className: "text-center py-12", children: [_jsx(CalendarIcon, { className: "h-16 w-16 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No Upcoming Appointments" }), _jsx("p", { className: "text-gray-500 mb-6", children: "You don't have any upcoming appointments scheduled." }), _jsxs(Button, { onClick: () => setIsBookingDialogOpen(true), children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Schedule Your First Appointment"] })] })) }), _jsx(TabsContent, { value: "past", children: pastAppointments.length > 0 ? (_jsx("div", { className: "space-y-4", children: pastAppointments.map((appointment) => (_jsxs("div", { className: "p-4 border rounded-lg bg-gray-50", children: [_jsx("div", { className: "flex items-center justify-between mb-3", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [appointment.status === "completed" ? (_jsx(CheckCircle, { className: "h-4 w-4 text-green-600" })) : (_jsx(AlertCircle, { className: "h-4 w-4 text-red-600" })), _jsx("h3", { className: "font-medium text-gray-900", children: appointment.title })] }), _jsx(Badge, { className: getStatusColor(appointment.status), children: appointment.status })] }) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(CalendarIcon, { className: "h-4 w-4" }), _jsxs("span", { children: [format(new Date(appointment.scheduledDate), "MMM dd, yyyy"), " ", "at", " ", format(new Date(appointment.scheduledDate), "HH:mm")] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(User, { className: "h-4 w-4" }), _jsx("span", { children: appointment.providerName })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Clock, { className: "h-4 w-4" }), _jsxs("span", { children: [appointment.duration, " minutes"] })] })] }), appointment.notes && (_jsxs("div", { className: "mt-3 p-3 bg-white rounded border", children: [_jsx("h4", { className: "text-sm font-medium text-gray-900 mb-1", children: "Notes" }), _jsx("p", { className: "text-sm text-gray-600", children: appointment.notes })] }))] }, appointment.id))) })) : (_jsxs("div", { className: "text-center py-12", children: [_jsx(CalendarIcon, { className: "h-16 w-16 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No Past Appointments" }), _jsx("p", { className: "text-gray-500", children: "Your appointment history will appear here." })] })) })] })] })] }));
};
export default AppointmentScheduler;
