import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createTherapySession, updateTherapySession, } from "@/api/therapy.api";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
const formSchema = z.object({
    patient_id: z.string().min(1, { message: "Patient ID is required" }),
    therapy_type: z.string().min(1, { message: "Therapy type is required" }),
    therapist: z.string().min(2, { message: "Therapist name is required" }),
    session_date: z.string().min(1, { message: "Session date is required" }),
    session_time: z.string().min(1, { message: "Session time is required" }),
    duration_minutes: z.coerce
        .number()
        .min(15, { message: "Duration must be at least 15 minutes" }),
    session_notes: z.string().optional(),
    progress_rating: z.coerce.number().min(1).max(10).optional(),
    goals_addressed: z.string().optional(),
    home_exercises_assigned: z.string().optional(),
    next_session_scheduled: z.string().optional(),
    status: z
        .enum(["scheduled", "completed", "cancelled", "no-show"])
        .default("scheduled"),
});
export default function TherapySessionForm({ initialData, onSuccess, onCancel, }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditing = !!initialData?._id;
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            patient_id: initialData?.patient_id?.toString() || "",
            therapy_type: initialData?.therapy_type || "PT",
            therapist: initialData?.therapist || "",
            session_date: initialData?.session_date || new Date().toISOString().split("T")[0],
            session_time: initialData?.session_time || "09:00",
            duration_minutes: initialData?.duration_minutes || 60,
            session_notes: initialData?.session_notes || "",
            progress_rating: initialData?.progress_rating || 5,
            goals_addressed: initialData?.goals_addressed || "",
            home_exercises_assigned: initialData?.home_exercises_assigned || "",
            next_session_scheduled: initialData?.next_session_scheduled || "",
            status: initialData?.status || "scheduled",
        },
    });
    async function onSubmit(values) {
        try {
            setIsSubmitting(true);
            if (isEditing && initialData?._id) {
                await updateTherapySession(initialData._id.toString(), values);
                toast({
                    title: "Therapy session updated",
                    description: `Therapy session for patient ${values.patient_id} has been updated successfully.`,
                });
            }
            else {
                await createTherapySession(values);
                toast({
                    title: "Therapy session created",
                    description: `New therapy session for patient ${values.patient_id} has been scheduled.`,
                });
            }
            if (onSuccess)
                onSuccess();
        }
        catch (error) {
            console.error("Error saving therapy session:", error);
            toast({
                title: "Error",
                description: "There was a problem saving the therapy session. Please try again.",
                variant: "destructive",
            });
        }
        finally {
            setIsSubmitting(false);
        }
    }
    return (_jsxs("div", { className: "p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto", children: [_jsx("h2", { className: "text-2xl font-bold mb-6", children: isEditing ? "Edit Therapy Session" : "Schedule New Therapy Session" }), _jsx(Form, { ...form, children: _jsxs("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsx(FormField, { control: form.control, name: "patient_id", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Patient ID" }), _jsx(FormControl, { children: _jsx(Input, { placeholder: "Enter patient ID", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "therapy_type", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Therapy Type" }), _jsxs(Select, { onValueChange: field.onChange, defaultValue: field.value, children: [_jsx(FormControl, { children: _jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select therapy type" }) }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "PT", children: "Physical Therapy (PT)" }), _jsx(SelectItem, { value: "OT", children: "Occupational Therapy (OT)" }), _jsx(SelectItem, { value: "ST", children: "Speech Therapy (ST)" }), _jsx(SelectItem, { value: "RT", children: "Respiratory Therapy (RT)" })] })] }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "therapist", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Therapist" }), _jsx(FormControl, { children: _jsx(Input, { placeholder: "Enter therapist name", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "session_date", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Session Date" }), _jsx(FormControl, { children: _jsx(Input, { type: "date", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "session_time", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Session Time" }), _jsx(FormControl, { children: _jsx(Input, { type: "time", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "duration_minutes", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Duration (minutes)" }), _jsxs(Select, { onValueChange: (value) => field.onChange(parseInt(value)), defaultValue: field.value.toString(), children: [_jsx(FormControl, { children: _jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select duration" }) }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "15", children: "15 minutes" }), _jsx(SelectItem, { value: "30", children: "30 minutes" }), _jsx(SelectItem, { value: "45", children: "45 minutes" }), _jsx(SelectItem, { value: "60", children: "60 minutes" }), _jsx(SelectItem, { value: "90", children: "90 minutes" }), _jsx(SelectItem, { value: "120", children: "120 minutes" })] })] }), _jsx(FormMessage, {})] })) }), isEditing && (_jsx(FormField, { control: form.control, name: "status", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Status" }), _jsxs(Select, { onValueChange: field.onChange, defaultValue: field.value, children: [_jsx(FormControl, { children: _jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select status" }) }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "scheduled", children: "Scheduled" }), _jsx(SelectItem, { value: "completed", children: "Completed" }), _jsx(SelectItem, { value: "cancelled", children: "Cancelled" }), _jsx(SelectItem, { value: "no-show", children: "No Show" })] })] }), _jsx(FormMessage, {})] })) })), (isEditing || form.watch("status") === "completed") && (_jsx(FormField, { control: form.control, name: "progress_rating", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Progress Rating (1-10)" }), _jsx(FormControl, { children: _jsx(Input, { type: "number", min: "1", max: "10", ...field }) }), _jsx(FormMessage, {})] })) })), _jsx(FormField, { control: form.control, name: "session_notes", render: ({ field }) => (_jsxs(FormItem, { className: "col-span-2", children: [_jsx(FormLabel, { children: "Session Notes" }), _jsx(FormControl, { children: _jsx(Textarea, { placeholder: "Enter session notes, observations, or special instructions", className: "min-h-[100px]", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "goals_addressed", render: ({ field }) => (_jsxs(FormItem, { className: "col-span-2", children: [_jsx(FormLabel, { children: "Goals Addressed" }), _jsx(FormControl, { children: _jsx(Input, { placeholder: "E.g., Improve mobility, reduce pain", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "home_exercises_assigned", render: ({ field }) => (_jsxs(FormItem, { className: "col-span-2", children: [_jsx(FormLabel, { children: "Home Exercises Assigned" }), _jsx(FormControl, { children: _jsx(Textarea, { placeholder: "Enter details of home exercises assigned to the patient", className: "min-h-[80px]", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "next_session_scheduled", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Next Session Date" }), _jsx(FormControl, { children: _jsx(Input, { type: "date", ...field }) }), _jsx(FormMessage, {})] })) })] }), _jsxs("div", { className: "flex justify-end space-x-4 pt-4", children: [onCancel && (_jsx(Button, { type: "button", variant: "outline", onClick: onCancel, children: "Cancel" })), _jsx(Button, { type: "submit", disabled: isSubmitting, children: isSubmitting
                                        ? "Saving..."
                                        : isEditing
                                            ? "Update Session"
                                            : "Schedule Session" })] })] }) })] }));
}
