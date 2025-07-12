import { useState, useEffect } from "react";
import { SatisfactionSurvey } from "@/types/patient-portal";

interface UseSatisfactionSurveysReturn {
  surveys: SatisfactionSurvey[];
  pendingSurveys: SatisfactionSurvey[];
  completedSurveys: SatisfactionSurvey[];
  isLoading: boolean;
  error: string | null;
  submitSurvey: (
    surveyId: string,
    responses: Record<string, any>,
  ) => Promise<void>;
  getSurveyById: (surveyId: string) => SatisfactionSurvey | null;
  markSurveyAsViewed: (surveyId: string) => Promise<void>;
  dismissSurvey: (surveyId: string) => Promise<void>;
}

export const useSatisfactionSurveys = (
  patientId: string,
): UseSatisfactionSurveysReturn => {
  const [surveys, setSurveys] = useState<SatisfactionSurvey[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSurveys();
  }, [patientId]);

  const fetchSurveys = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      const response = await fetch(`/api/patient/${patientId}/surveys`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("patient_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch satisfaction surveys");
      }

      const data = await response.json();
      setSurveys(data);
    } catch (err) {
      console.error("Failed to fetch satisfaction surveys:", err);
      setError(err instanceof Error ? err.message : "An error occurred");

      // Mock data for development
      const mockSurveys: SatisfactionSurvey[] = [
        {
          id: "survey-1",
          patientId,
          type: "post-appointment",
          title: "Appointment Satisfaction Survey",
          description:
            "Please help us improve by sharing your feedback about your recent appointment.",
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
            {
              id: "q2",
              type: "multiple-choice",
              question: "How would you rate the quality of care you received?",
              required: true,
              options: ["Excellent", "Very Good", "Good", "Fair", "Poor"],
            },
            {
              id: "q3",
              type: "text",
              question: "What did you like most about your appointment?",
              required: false,
              maxLength: 500,
            },
            {
              id: "q4",
              type: "text",
              question: "How can we improve your experience?",
              required: false,
              maxLength: 500,
            },
            {
              id: "q5",
              type: "yes-no",
              question: "Would you recommend our services to others?",
              required: true,
            },
          ],
          status: "pending",
          createdAt: "2024-01-16T10:00:00Z",
          expiresAt: "2024-01-23T23:59:59Z",
          relatedAppointmentId: "apt-1",
        },
        {
          id: "survey-2",
          patientId,
          type: "care-plan-feedback",
          title: "Care Plan Feedback",
          description:
            "Your feedback helps us tailor your care plan to better meet your needs.",
          questions: [
            {
              id: "q1",
              type: "rating",
              question:
                "How well is your current care plan meeting your needs?",
              required: true,
              scale: {
                min: 1,
                max: 10,
                labels: ["Not at all", "Completely"],
              },
            },
            {
              id: "q2",
              type: "multiple-choice",
              question: "Which aspect of your care plan is most helpful?",
              required: false,
              options: [
                "Medication management",
                "Regular check-ups",
                "Educational resources",
                "Family involvement",
                "Emergency support",
              ],
            },
            {
              id: "q3",
              type: "text",
              question: "What changes would you like to see in your care plan?",
              required: false,
              maxLength: 1000,
            },
          ],
          status: "pending",
          createdAt: "2024-01-18T14:00:00Z",
          expiresAt: "2024-01-25T23:59:59Z",
          relatedCarePlanId: "cp-1",
        },
        {
          id: "survey-3",
          patientId,
          type: "general-satisfaction",
          title: "Overall Service Satisfaction",
          description:
            "Thank you for completing this survey. Your responses were submitted successfully.",
          questions: [
            {
              id: "q1",
              type: "rating",
              question:
                "Overall, how satisfied are you with our homecare services?",
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
          status: "completed",
          createdAt: "2024-01-10T09:00:00Z",
          completedAt: "2024-01-12T16:30:00Z",
          responses: {
            q1: 5,
          },
        },
      ];
      setSurveys(mockSurveys);
      setError(null);
    } finally {
      setIsLoading(false);
    }
  };

  const submitSurvey = async (
    surveyId: string,
    responses: Record<string, any>,
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      const response = await fetch(`/api/surveys/${surveyId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("patient_token")}`,
        },
        body: JSON.stringify({
          patientId,
          responses,
          completedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit survey");
      }

      const updatedSurvey = await response.json();
      setSurveys((prev) =>
        prev.map((survey) => (survey.id === surveyId ? updatedSurvey : survey)),
      );
    } catch (err) {
      console.error("Failed to submit survey:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getSurveyById = (surveyId: string): SatisfactionSurvey | null => {
    return surveys.find((survey) => survey.id === surveyId) || null;
  };

  const markSurveyAsViewed = async (surveyId: string) => {
    try {
      // TODO: Replace with actual API call
      await fetch(`/api/surveys/${surveyId}/viewed`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("patient_token")}`,
        },
      });

      setSurveys((prev) =>
        prev.map((survey) =>
          survey.id === surveyId
            ? { ...survey, viewedAt: new Date().toISOString() }
            : survey,
        ),
      );
    } catch (err) {
      console.error("Failed to mark survey as viewed:", err);
    }
  };

  const dismissSurvey = async (surveyId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      const response = await fetch(`/api/surveys/${surveyId}/dismiss`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("patient_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to dismiss survey");
      }

      setSurveys((prev) =>
        prev.map((survey) =>
          survey.id === surveyId
            ? {
                ...survey,
                status: "dismissed",
                dismissedAt: new Date().toISOString(),
              }
            : survey,
        ),
      );
    } catch (err) {
      console.error("Failed to dismiss survey:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const pendingSurveys = surveys.filter(
    (survey) => survey.status === "pending",
  );
  const completedSurveys = surveys.filter(
    (survey) => survey.status === "completed",
  );

  return {
    surveys,
    pendingSurveys,
    completedSurveys,
    isLoading,
    error,
    submitSurvey,
    getSurveyById,
    markSurveyAsViewed,
    dismissSurvey,
  };
};
