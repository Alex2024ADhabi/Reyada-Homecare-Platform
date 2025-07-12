import { useState, useEffect } from "react";
import { PatientDashboardData } from "@/types/patient-portal";

interface UsePatientDataReturn {
  dashboardData: PatientDashboardData | null;
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

export const usePatientData = (patientId?: string): UsePatientDataReturn => {
  const [dashboardData, setDashboardData] =
    useState<PatientDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (patientId) {
      fetchDashboardData();
    }
  }, [patientId]);

  const fetchDashboardData = async () => {
    if (!patientId) return;

    try {
      setIsLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      const response = await fetch(`/api/patient/${patientId}/dashboard`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("patient_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError(err instanceof Error ? err.message : "An error occurred");

      // Mock data for development
      const mockData: PatientDashboardData = {
        patient: {
          id: patientId,
          emiratesId: "784-1234-5678901-2",
          firstName: "Ahmed",
          lastName: "Al-Mansouri",
          email: "ahmed.almansouri@email.com",
          phone: "+971-50-123-4567",
          dateOfBirth: "1985-03-15",
          gender: "male",
          address: {
            street: "123 Sheikh Zayed Road",
            city: "Dubai",
            emirate: "Dubai",
            postalCode: "12345",
          },
          emergencyContact: {
            name: "Fatima Al-Mansouri",
            relationship: "spouse",
            phone: "+971-50-987-6543",
          },
          insuranceInfo: {
            provider: "Daman",
            policyNumber: "DM-123456789",
            membershipNumber: "789456123",
            expiryDate: "2024-12-31",
          },
          preferences: {
            language: "en",
            notifications: {
              email: true,
              sms: true,
              push: true,
              appointmentReminders: true,
              medicationReminders: true,
              careUpdates: true,
              educationalContent: false,
            },
          },
          createdAt: "2023-01-15T10:00:00Z",
          updatedAt: "2024-01-15T10:00:00Z",
        },
        upcomingAppointments: [
          {
            id: "apt-1",
            patientId,
            providerId: "provider-1",
            providerName: "Dr. Sarah Johnson",
            type: "consultation",
            title: "Follow-up Consultation",
            description: "Regular check-up and medication review",
            scheduledDate: "2024-01-20T10:00:00Z",
            duration: 30,
            location: {
              type: "home",
              address: "123 Sheikh Zayed Road, Dubai",
            },
            status: "confirmed",
            createdAt: "2024-01-15T10:00:00Z",
            updatedAt: "2024-01-15T10:00:00Z",
          },
        ],
        activeCarePlans: [
          {
            id: "cp-1",
            patientId,
            title: "Diabetes Management Plan",
            description: "Comprehensive diabetes care and monitoring",
            startDate: "2024-01-01T00:00:00Z",
            endDate: "2024-06-30T23:59:59Z",
            status: "active",
            goals: [
              {
                id: "goal-1",
                title: "Blood Sugar Control",
                description: "Maintain HbA1c below 7%",
                targetDate: "2024-06-30T23:59:59Z",
                status: "in-progress",
                progress: 75,
                metrics: [
                  {
                    name: "HbA1c",
                    target: "<7%",
                    current: "6.8%",
                    unit: "%",
                  },
                ],
              },
            ],
            interventions: [
              {
                id: "int-1",
                type: "medication",
                title: "Metformin Administration",
                description: "Daily medication for blood sugar control",
                frequency: "Twice daily",
                duration: "6 months",
                instructions: "Take with meals",
                status: "in-progress",
              },
            ],
            medications: [
              {
                id: "med-1",
                name: "Metformin",
                dosage: "500mg",
                frequency: "Twice daily",
                route: "Oral",
                startDate: "2024-01-01T00:00:00Z",
                instructions: "Take with meals to reduce stomach upset",
                sideEffects: ["Nausea", "Diarrhea", "Stomach upset"],
                interactions: ["Alcohol", "Contrast dye"],
                status: "active",
              },
            ],
            appointments: [],
            progress: [
              {
                id: "prog-1",
                date: "2024-01-15T10:00:00Z",
                type: "assessment",
                title: "Blood Sugar Monitoring",
                content:
                  "Patient showing good compliance with medication. Blood sugar levels stable.",
                author: "Dr. Sarah Johnson",
              },
            ],
            createdBy: "Dr. Sarah Johnson",
            createdAt: "2024-01-01T10:00:00Z",
            updatedAt: "2024-01-15T10:00:00Z",
          },
        ],
        recentMessages: [
          {
            id: "msg-1",
            conversationId: "conv-1",
            senderId: "provider-1",
            senderName: "Dr. Sarah Johnson",
            senderType: "provider",
            recipientId: patientId,
            recipientName: "Ahmed Al-Mansouri",
            recipientType: "patient",
            subject: "Medication Reminder",
            content:
              "Please remember to take your evening medication and record your blood sugar levels.",
            priority: "normal",
            status: "delivered",
            sentAt: "2024-01-18T18:00:00Z",
          },
        ],
        pendingSurveys: [
          {
            id: "survey-1",
            patientId,
            type: "post-appointment",
            title: "Appointment Satisfaction Survey",
            questions: [
              {
                id: "q1",
                type: "rating",
                question: "How satisfied were you with your appointment?",
                required: true,
                scale: {
                  min: 1,
                  max: 5,
                  labels: [
                    "Very Dissatisfied",
                    "Dissatisfied",
                    "Neutral",
                    "Satisfied",
                    "Very Satisfied",
                  ],
                },
              },
            ],
            status: "pending",
            createdAt: "2024-01-16T10:00:00Z",
            expiresAt: "2024-01-23T23:59:59Z",
          },
        ],
        healthMetrics: {
          recent: [
            {
              id: "metric-1",
              patientId,
              type: "blood-sugar",
              value: "120",
              unit: "mg/dL",
              recordedAt: "2024-01-18T08:00:00Z",
              recordedBy: "patient",
              notes: "Fasting blood sugar",
            },
          ],
          trends: [
            {
              type: "blood-sugar",
              trend: "improving",
              change: 5,
            },
          ],
        },
        notifications: {
          unread: 2,
          recent: [
            {
              id: "notif-1",
              type: "appointment",
              title: "Upcoming Appointment",
              message: "You have an appointment tomorrow at 10:00 AM",
              createdAt: "2024-01-18T20:00:00Z",
              read: false,
            },
          ],
        },
        educationalRecommendations: [
          {
            id: "edu-1",
            type: "article",
            title: "Managing Diabetes Through Diet",
            description: "Learn about the best foods for diabetes management",
            category: "Nutrition",
            tags: ["diabetes", "diet", "nutrition"],
            difficulty: "beginner",
            language: "en",
            personalizedFor: ["diabetes"],
            createdAt: "2024-01-01T10:00:00Z",
            updatedAt: "2024-01-01T10:00:00Z",
          },
        ],
      };
      setDashboardData(mockData);
      setError(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    await fetchDashboardData();
  };

  return {
    dashboardData,
    isLoading,
    error,
    refreshData,
  };
};
