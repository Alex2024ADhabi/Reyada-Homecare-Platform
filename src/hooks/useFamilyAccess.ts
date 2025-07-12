import { useState, useEffect } from "react";
import { FamilyMember } from "@/types/patient-portal";

interface UseFamilyAccessReturn {
  familyMembers: FamilyMember[];
  isLoading: boolean;
  error: string | null;
  inviteFamilyMember: (memberData: {
    name: string;
    email: string;
    phone: string;
    relationship: string;
    accessLevel: "view" | "limited" | "full";
    permissions: {
      viewCarePlan: boolean;
      viewAppointments: boolean;
      viewMedications: boolean;
      viewProgress: boolean;
      receiveNotifications: boolean;
      communicateWithProviders: boolean;
    };
  }) => Promise<void>;
  updateFamilyMember: (
    memberId: string,
    updates: {
      accessLevel?: "view" | "limited" | "full";
      permissions?: {
        viewCarePlan: boolean;
        viewAppointments: boolean;
        viewMedications: boolean;
        viewProgress: boolean;
        receiveNotifications: boolean;
        communicateWithProviders: boolean;
      };
    },
  ) => Promise<void>;
  removeFamilyMember: (memberId: string) => Promise<void>;
  suspendFamilyMember: (memberId: string) => Promise<void>;
  reactivateFamilyMember: (memberId: string) => Promise<void>;
}

export const useFamilyAccess = (patientId: string): UseFamilyAccessReturn => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFamilyMembers();
  }, [patientId]);

  const fetchFamilyMembers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      const response = await fetch(`/api/patient/${patientId}/family-members`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("patient_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch family members");
      }

      const data = await response.json();
      setFamilyMembers(data);
    } catch (err) {
      console.error("Failed to fetch family members:", err);
      setError(err instanceof Error ? err.message : "An error occurred");

      // Mock data for development
      const mockFamilyMembers: FamilyMember[] = [
        {
          id: "family-1",
          patientId,
          name: "Fatima Al-Mansouri",
          email: "fatima.almansouri@email.com",
          phone: "+971-50-987-6543",
          relationship: "spouse",
          accessLevel: "full",
          permissions: {
            viewCarePlan: true,
            viewAppointments: true,
            viewMedications: true,
            viewProgress: true,
            receiveNotifications: true,
            communicateWithProviders: true,
          },
          status: "active",
          invitedAt: "2024-01-10T10:00:00Z",
          activatedAt: "2024-01-10T14:30:00Z",
          lastAccessAt: "2024-01-18T16:45:00Z",
        },
        {
          id: "family-2",
          patientId,
          name: "Omar Al-Mansouri",
          email: "omar.almansouri@email.com",
          phone: "+971-55-123-4567",
          relationship: "child",
          accessLevel: "limited",
          permissions: {
            viewCarePlan: true,
            viewAppointments: true,
            viewMedications: false,
            viewProgress: true,
            receiveNotifications: true,
            communicateWithProviders: false,
          },
          status: "pending",
          invitedAt: "2024-01-15T09:00:00Z",
        },
      ];
      setFamilyMembers(mockFamilyMembers);
      setError(null);
    } finally {
      setIsLoading(false);
    }
  };

  const inviteFamilyMember = async (memberData: {
    name: string;
    email: string;
    phone: string;
    relationship: string;
    accessLevel: "view" | "limited" | "full";
    permissions: {
      viewCarePlan: boolean;
      viewAppointments: boolean;
      viewMedications: boolean;
      viewProgress: boolean;
      receiveNotifications: boolean;
      communicateWithProviders: boolean;
    };
  }) => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      const response = await fetch(`/api/patient/${patientId}/family-members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("patient_token")}`,
        },
        body: JSON.stringify(memberData),
      });

      if (!response.ok) {
        throw new Error("Failed to invite family member");
      }

      const newMember = await response.json();
      setFamilyMembers((prev) => [newMember, ...prev]);
    } catch (err) {
      console.error("Failed to invite family member:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateFamilyMember = async (
    memberId: string,
    updates: {
      accessLevel?: "view" | "limited" | "full";
      permissions?: {
        viewCarePlan: boolean;
        viewAppointments: boolean;
        viewMedications: boolean;
        viewProgress: boolean;
        receiveNotifications: boolean;
        communicateWithProviders: boolean;
      };
    },
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      const response = await fetch(
        `/api/patient/${patientId}/family-members/${memberId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("patient_token")}`,
          },
          body: JSON.stringify(updates),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update family member");
      }

      const updatedMember = await response.json();
      setFamilyMembers((prev) =>
        prev.map((member) => (member.id === memberId ? updatedMember : member)),
      );
    } catch (err) {
      console.error("Failed to update family member:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFamilyMember = async (memberId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      const response = await fetch(
        `/api/patient/${patientId}/family-members/${memberId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("patient_token")}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to remove family member");
      }

      setFamilyMembers((prev) =>
        prev.filter((member) => member.id !== memberId),
      );
    } catch (err) {
      console.error("Failed to remove family member:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const suspendFamilyMember = async (memberId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      const response = await fetch(
        `/api/patient/${patientId}/family-members/${memberId}/suspend`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("patient_token")}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to suspend family member");
      }

      setFamilyMembers((prev) =>
        prev.map((member) =>
          member.id === memberId ? { ...member, status: "suspended" } : member,
        ),
      );
    } catch (err) {
      console.error("Failed to suspend family member:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const reactivateFamilyMember = async (memberId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      const response = await fetch(
        `/api/patient/${patientId}/family-members/${memberId}/reactivate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("patient_token")}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to reactivate family member");
      }

      setFamilyMembers((prev) =>
        prev.map((member) =>
          member.id === memberId ? { ...member, status: "active" } : member,
        ),
      );
    } catch (err) {
      console.error("Failed to reactivate family member:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    familyMembers,
    isLoading,
    error,
    inviteFamilyMember,
    updateFamilyMember,
    removeFamilyMember,
    suspendFamilyMember,
    reactivateFamilyMember,
  };
};
