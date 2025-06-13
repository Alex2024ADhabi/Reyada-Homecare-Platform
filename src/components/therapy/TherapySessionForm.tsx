import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  createTherapySession,
  updateTherapySession,
  TherapySession,
} from "@/api/therapy.api";
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

interface TherapySessionFormProps {
  initialData?: TherapySession;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function TherapySessionForm({
  initialData,
  onSuccess,
  onCancel,
}: TherapySessionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!initialData?._id;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patient_id: initialData?.patient_id?.toString() || "",
      therapy_type: initialData?.therapy_type || "PT",
      therapist: initialData?.therapist || "",
      session_date:
        initialData?.session_date || new Date().toISOString().split("T")[0],
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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);

      if (isEditing && initialData?._id) {
        await updateTherapySession(initialData._id.toString(), values);
        toast({
          title: "Therapy session updated",
          description: `Therapy session for patient ${values.patient_id} has been updated successfully.`,
        });
      } else {
        await createTherapySession(values);
        toast({
          title: "Therapy session created",
          description: `New therapy session for patient ${values.patient_id} has been scheduled.`,
        });
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error saving therapy session:", error);
      toast({
        title: "Error",
        description:
          "There was a problem saving the therapy session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">
        {isEditing ? "Edit Therapy Session" : "Schedule New Therapy Session"}
      </h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="patient_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter patient ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="therapy_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Therapy Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select therapy type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PT">Physical Therapy (PT)</SelectItem>
                      <SelectItem value="OT">
                        Occupational Therapy (OT)
                      </SelectItem>
                      <SelectItem value="ST">Speech Therapy (ST)</SelectItem>
                      <SelectItem value="RT">
                        Respiratory Therapy (RT)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="therapist"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Therapist</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter therapist name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="session_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="session_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration_minutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                      <SelectItem value="90">90 minutes</SelectItem>
                      <SelectItem value="120">120 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isEditing && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
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
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="no-show">No Show</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {(isEditing || form.watch("status") === "completed") && (
              <FormField
                control={form.control}
                name="progress_rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Progress Rating (1-10)</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="session_notes"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Session Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter session notes, observations, or special instructions"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="goals_addressed"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Goals Addressed</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="E.g., Improve mobility, reduce pain"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="home_exercises_assigned"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Home Exercises Assigned</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter details of home exercises assigned to the patient"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="next_session_scheduled"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Next Session Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
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
                  ? "Update Session"
                  : "Schedule Session"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
