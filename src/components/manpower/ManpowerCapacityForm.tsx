import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  createManpowerCapacity,
  updateManpowerCapacity,
  ManpowerCapacity,
} from "@/api/manpower.api";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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

interface ManpowerCapacityFormProps {
  initialData?: ManpowerCapacity;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ManpowerCapacityForm({
  initialData,
  onSuccess,
  onCancel,
}: ManpowerCapacityFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!initialData?._id;

  const form = useForm<z.infer<typeof formSchema>>({
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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);

      if (isEditing && initialData?._id) {
        await updateManpowerCapacity(initialData._id.toString(), values);
        const { toast } = useToast();
        toast({
          title: "Staff record updated",
          description: `${values.staff_member}'s record has been updated successfully.`,
        });
      } else {
        await createManpowerCapacity(values);
        const { toast } = useToast();
        toast({
          title: "Staff record created",
          description: `${values.staff_member} has been added to the system.`,
        });
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error saving staff record:", error);
      const { toast } = useToast();
      toast({
        title: "Error",
        description:
          "There was a problem saving the staff record. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">
        {isEditing ? "Edit Staff Record" : "Add New Staff Member"}
      </h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="staff_member"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Staff Member Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Head Nurse">Head Nurse</SelectItem>
                      <SelectItem value="Nurse Supervisor">
                        Nurse Supervisor
                      </SelectItem>
                      <SelectItem value="Registered Nurse">
                        Registered Nurse
                      </SelectItem>
                      <SelectItem value="SMO">
                        SMO (Senior Medical Officer)
                      </SelectItem>
                      <SelectItem value="Physical Therapist">
                        Physical Therapist
                      </SelectItem>
                      <SelectItem value="Occupational Therapist">
                        Occupational Therapist
                      </SelectItem>
                      <SelectItem value="Speech Therapist">
                        Speech Therapist
                      </SelectItem>
                      <SelectItem value="Respiratory Therapist">
                        Respiratory Therapist
                      </SelectItem>
                      <SelectItem value="Driver">Driver</SelectItem>
                      <SelectItem value="ICON">
                        ICON (Infection Control Officer)
                      </SelectItem>
                      <SelectItem value="Vaccination Specialist">
                        Vaccination Specialist
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="certification_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Certification Level</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select certification level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Basic">Basic</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                      <SelectItem value="Specialist">Specialist</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="geographic_zones"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Geographic Zone</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select zone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Abu Dhabi Central">
                        Abu Dhabi Central
                      </SelectItem>
                      <SelectItem value="Abu Dhabi West">
                        Abu Dhabi West
                      </SelectItem>
                      <SelectItem value="Abu Dhabi East">
                        Abu Dhabi East
                      </SelectItem>
                      <SelectItem value="Al Ain">Al Ain</SelectItem>
                      <SelectItem value="Western Region">
                        Western Region
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="max_daily_patients"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Daily Patients</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="current_daily_patients"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Daily Patients</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="available_hours_per_day"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Available Hours Per Day</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="24"
                      step="0.5"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="committed_hours_per_day"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Committed Hours Per Day</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="24"
                      step="0.5"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="specializations"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Specializations</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="E.g., Critical Care, Wound Care"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter specializations separated by commas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="equipment_certifications"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Equipment Certifications</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., Ventilator, IV Pump" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter equipment certifications separated by commas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shift"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shift</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select shift" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Morning">Morning</SelectItem>
                      <SelectItem value="Afternoon">Afternoon</SelectItem>
                      <SelectItem value="Evening">Evening</SelectItem>
                      <SelectItem value="Night">Night</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="availability_status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Availability Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Unavailable">Unavailable</SelectItem>
                      <SelectItem value="On Leave">On Leave</SelectItem>
                      <SelectItem value="Training">Training</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : isEditing
                  ? "Update Record"
                  : "Add Staff Member"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
