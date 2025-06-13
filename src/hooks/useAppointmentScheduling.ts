import { useState, useEffect } from "react";
import { Appointment, AppointmentSlot } from "@/types/patient-portal";

interface UseAppointmentSchedulingReturn {
  availableSlots: AppointmentSlot[];
  isLoading: boolean;
  error: string | null;
  bookAppointment: (appointmentData: {
    slotId: string;
    type: string;
    reason: string;
    date: Date;
  }) => Promise<void>;
  cancelAppointment: (appointmentId: string) => Promise<void>;
  rescheduleAppointment: (
    appointmentId: string,
    newSlotId: string,
  ) => Promise<void>;
  fetchAvailableSlots: (date: Date, providerId?: string) => Promise<void>;
}

export const useAppointmentScheduling = (
  patientId: string,
): UseAppointmentSchedulingReturn => {
  const [availableSlots, setAvailableSlots] = useState<AppointmentSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailableSlots = async (date: Date, providerId?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        date: date.toISOString().split("T")[0],
        ...(providerId && { providerId }),
      });

      // TODO: Replace with actual API call
      const response = await fetch(`/api/appointments/slots?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("patient_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch available slots");
      }

      const slots = await response.json();
      setAvailableSlots(slots);
    } catch (err) {
      console.error("Failed to fetch available slots:", err);
      setError(err instanceof Error ? err.message : "An error occurred");

      // Mock data for development
      const mockSlots: AppointmentSlot[] = [
        {
          id: "slot-1",
          providerId: "provider-1",
          providerName: "Dr. Sarah Johnson",
          date: date.toISOString().split("T")[0],
          startTime: "09:00",
          endTime: "09:30",
          duration: 30,
          type: ["consultation", "follow-up"],
          available: true,
          location: {
            type: "home",
            address: "Patient's home",
          },
        },
        {
          id: "slot-2",
          providerId: "provider-1",
          providerName: "Dr. Sarah Johnson",
          date: date.toISOString().split("T")[0],
          startTime: "10:00",
          endTime: "10:30",
          duration: 30,
          type: ["consultation", "assessment"],
          available: true,
          location: {
            type: "virtual",
          },
        },
        {
          id: "slot-3",
          providerId: "provider-2",
          providerName: "Dr. Ahmed Hassan",
          date: date.toISOString().split("T")[0],
          startTime: "14:00",
          endTime: "14:45",
          duration: 45,
          type: ["therapy", "procedure"],
          available: true,
          location: {
            type: "clinic",
            address: "Dubai Healthcare City, Building 27",
          },
        },
      ];
      setAvailableSlots(mockSlots);
      setError(null);
    } finally {
      setIsLoading(false);
    }
  };

  const bookAppointment = async (appointmentData: {
    slotId: string;
    type: string;
    reason: string;
    date: Date;
  }) => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("patient_token")}`,
        },
        body: JSON.stringify({
          patientId,
          ...appointmentData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to book appointment");
      }

      // Remove the booked slot from available slots
      setAvailableSlots((prev) =>
        prev.filter((slot) => slot.id !== appointmentData.slotId),
      );
    } catch (err) {
      console.error("Failed to book appointment:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelAppointment = async (appointmentId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      const response = await fetch(
        `/api/appointments/${appointmentId}/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("patient_token")}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to cancel appointment");
      }
    } catch (err) {
      console.error("Failed to cancel appointment:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const rescheduleAppointment = async (
    appointmentId: string,
    newSlotId: string,
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      const response = await fetch(
        `/api/appointments/${appointmentId}/reschedule`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("patient_token")}`,
          },
          body: JSON.stringify({ newSlotId }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to reschedule appointment");
      }

      // Remove the new slot from available slots
      setAvailableSlots((prev) => prev.filter((slot) => slot.id !== newSlotId));
    } catch (err) {
      console.error("Failed to reschedule appointment:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    availableSlots,
    isLoading,
    error,
    bookAppointment,
    cancelAppointment,
    rescheduleAppointment,
    fetchAvailableSlots,
  };
};
