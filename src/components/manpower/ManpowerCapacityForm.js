import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createManpowerCapacity, updateManpowerCapacity, } from "@/api/manpower.api";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
const formSchema = z.object({
    staff_member: z.string().min(2, { message: "Staff member name is required" }),
    role: z.string().min(1, { message: "Role is required" }),
    certification_level: z
        .string()
        .min(1, { message: "Certification level is required" }),
    geographic_zones: z
        .string()
        .min(1, { message: "Geographic zone is required" }),
    max_daily_patients: z.coerce
        .number()
        .min(1, { message: "Maximum daily patients must be at least 1" }),
    current_daily_patients: z.coerce
        .number()
        .min(0, { message: "Current daily patients must be at least 0" }),
    available_hours_per_day: z.coerce
        .number()
        .min(0, { message: "Available hours must be at least 0" }),
    committed_hours_per_day: z.coerce
        .number()
        .min(0, { message: "Committed hours must be at least 0" }),
    specializations: z.string(),
    equipment_certifications: z.string(),
    date: z.string().min(1, { message: "Date is required" }),
    shift: z.string().min(1, { message: "Shift is required" }),
    availability_status: z
        .string()
        .min(1, { message: "Availability status is required" }),
});
export default function ManpowerCapacityForm({ initialData, onSuccess, onCancel, }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditing = !!initialData?._id;
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            staff_member: initialData?.staff_member || "",
            role: initialData?.role || "Registered Nurse",
            certification_level: initialData?.certification_level || "Basic",
            geographic_zones: initialData?.geographic_zones || "Abu Dhabi Central",
            max_daily_patients: initialData?.max_daily_patients || 8,
            current_daily_patients: initialData?.current_daily_patients || 0,
            available_hours_per_day: initialData?.available_hours_per_day || 8,
            committed_hours_per_day: initialData?.committed_hours_per_day || 0,
            specializations: initialData?.specializations || "",
            equipment_certifications: initialData?.equipment_certifications || "",
            date: initialData?.date || new Date().toISOString().split("T")[0],
            shift: initialData?.shift || "Morning",
            availability_status: initialData?.availability_status || "Available",
        },
    });
    async function onSubmit(values) {
        try {
            setIsSubmitting(true);
            if (isEditing && initialData?._id) {
                await updateManpowerCapacity(initialData._id.toString(), values);
                const { toast } = useToast();
                toast({
                    title: "Staff record updated",
                    description: `${values.staff_member}'s record has been updated successfully.`,
                });
            }
            else {
                await createManpowerCapacity(values);
                const { toast } = useToast();
                toast({
                    title: "Staff record created",
                    description: `${values.staff_member} has been added to the system.`,
                });
            }
            if (onSuccess)
                onSuccess();
        }
        catch (error) {
            console.error("Error saving staff record:", error);
            const { toast } = useToast();
            toast({
                title: "Error",
                description: "There was a problem saving the staff record. Please try again.",
                variant: "destructive",
            });
        }
        finally {
            setIsSubmitting(false);
        }
    }
    return (_jsxs("div", { className: "p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto", children: [_jsx("h2", { className: "text-2xl font-bold mb-6", children: isEditing ? "Edit Staff Record" : "Add New Staff Member" }), _jsx(Form, { ...form, children: _jsxs("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsx(FormField, { control: form.control, name: "staff_member", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Staff Member Name" }), _jsx(FormControl, { children: _jsx(Input, { placeholder: "Enter full name", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "role", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Role" }), _jsxs(Select, { onValueChange: field.onChange, defaultValue: field.value, children: [_jsx(FormControl, { children: _jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select role" }) }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "Admin", children: "Admin" }), _jsx(SelectItem, { value: "Head Nurse", children: "Head Nurse" }), _jsx(SelectItem, { value: "Nurse Supervisor", children: "Nurse Supervisor" }), _jsx(SelectItem, { value: "Registered Nurse", children: "Registered Nurse" }), _jsx(SelectItem, { value: "SMO", children: "SMO (Senior Medical Officer)" }), _jsx(SelectItem, { value: "Physical Therapist", children: "Physical Therapist" }), _jsx(SelectItem, { value: "Occupational Therapist", children: "Occupational Therapist" }), _jsx(SelectItem, { value: "Speech Therapist", children: "Speech Therapist" }), _jsx(SelectItem, { value: "Respiratory Therapist", children: "Respiratory Therapist" }), _jsx(SelectItem, { value: "Driver", children: "Driver" }), _jsx(SelectItem, { value: "ICON", children: "ICON (Infection Control Officer)" }), _jsx(SelectItem, { value: "Vaccination Specialist", children: "Vaccination Specialist" })] })] }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "certification_level", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Certification Level" }), _jsxs(Select, { onValueChange: field.onChange, defaultValue: field.value, children: [_jsx(FormControl, { children: _jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select certification level" }) }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "Basic", children: "Basic" }), _jsx(SelectItem, { value: "Intermediate", children: "Intermediate" }), _jsx(SelectItem, { value: "Advanced", children: "Advanced" }), _jsx(SelectItem, { value: "Specialist", children: "Specialist" })] })] }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "geographic_zones", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Geographic Zone" }), _jsxs(Select, { onValueChange: field.onChange, defaultValue: field.value, children: [_jsx(FormControl, { children: _jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select zone" }) }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "Abu Dhabi Central", children: "Abu Dhabi Central" }), _jsx(SelectItem, { value: "Abu Dhabi West", children: "Abu Dhabi West" }), _jsx(SelectItem, { value: "Abu Dhabi East", children: "Abu Dhabi East" }), _jsx(SelectItem, { value: "Al Ain", children: "Al Ain" }), _jsx(SelectItem, { value: "Western Region", children: "Western Region" })] })] }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "max_daily_patients", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Maximum Daily Patients" }), _jsx(FormControl, { children: _jsx(Input, { type: "number", min: "1", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "current_daily_patients", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Current Daily Patients" }), _jsx(FormControl, { children: _jsx(Input, { type: "number", min: "0", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "available_hours_per_day", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Available Hours Per Day" }), _jsx(FormControl, { children: _jsx(Input, { type: "number", min: "0", max: "24", step: "0.5", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "committed_hours_per_day", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Committed Hours Per Day" }), _jsx(FormControl, { children: _jsx(Input, { type: "number", min: "0", max: "24", step: "0.5", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "specializations", render: ({ field }) => (_jsxs(FormItem, { className: "col-span-2", children: [_jsx(FormLabel, { children: "Specializations" }), _jsx(FormControl, { children: _jsx(Input, { placeholder: "E.g., Critical Care, Wound Care", ...field }) }), _jsx(FormDescription, { children: "Enter specializations separated by commas" }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "equipment_certifications", render: ({ field }) => (_jsxs(FormItem, { className: "col-span-2", children: [_jsx(FormLabel, { children: "Equipment Certifications" }), _jsx(FormControl, { children: _jsx(Input, { placeholder: "E.g., Ventilator, IV Pump", ...field }) }), _jsx(FormDescription, { children: "Enter equipment certifications separated by commas" }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "date", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Date" }), _jsx(FormControl, { children: _jsx(Input, { type: "date", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "shift", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Shift" }), _jsxs(Select, { onValueChange: field.onChange, defaultValue: field.value, children: [_jsx(FormControl, { children: _jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select shift" }) }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "Morning", children: "Morning" }), _jsx(SelectItem, { value: "Afternoon", children: "Afternoon" }), _jsx(SelectItem, { value: "Evening", children: "Evening" }), _jsx(SelectItem, { value: "Night", children: "Night" })] })] }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "availability_status", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Availability Status" }), _jsxs(Select, { onValueChange: field.onChange, defaultValue: field.value, children: [_jsx(FormControl, { children: _jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select status" }) }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "Available", children: "Available" }), _jsx(SelectItem, { value: "Unavailable", children: "Unavailable" }), _jsx(SelectItem, { value: "On Leave", children: "On Leave" }), _jsx(SelectItem, { value: "Training", children: "Training" })] })] }), _jsx(FormMessage, {})] })) })] }), _jsxs("div", { className: "flex justify-end space-x-4 pt-4", children: [onCancel && (_jsx(Button, { type: "button", variant: "outline", onClick: onCancel, children: "Cancel" })), _jsx(Button, { type: "submit", disabled: isSubmitting, children: isSubmitting
                                        ? "Saving..."
                                        : isEditing
                                            ? "Update Record"
                                            : "Add Staff Member" })] })] }) })] }));
}
