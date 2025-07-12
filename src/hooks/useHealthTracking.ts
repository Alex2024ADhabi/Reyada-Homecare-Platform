import { useState, useEffect } from "react";
import { HealthMetric } from "@/types/patient-portal";

interface HealthGoal {
  id: string;
  type: string;
  target: string;
  current: string;
  unit: string;
  deadline: string;
  status: "on-track" | "behind" | "achieved";
}

interface UseHealthTrackingReturn {
  metrics: HealthMetric[];
  goals: HealthGoal[];
  isLoading: boolean;
  error: string | null;
  recordMetric: (
    metricData: Omit<HealthMetric, "id" | "patientId">,
  ) => Promise<void>;
  updateGoal: (goalId: string, updates: Partial<HealthGoal>) => Promise<void>;
  getMetricTrends: (type: string, days: number) => Promise<any[]>;
  deleteMetric: (metricId: string) => Promise<void>;
}

export const useHealthTracking = (
  patientId: string,
): UseHealthTrackingReturn => {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [goals, setGoals] = useState<HealthGoal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics();
    fetchGoals();
  }, [patientId]);

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      const response = await fetch(`/api/patient/${patientId}/health-metrics`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("patient_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch health metrics");
      }

      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      console.error("Failed to fetch health metrics:", err);
      setError(err instanceof Error ? err.message : "An error occurred");

      // Mock data for development
      const mockMetrics: HealthMetric[] = [
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
        {
          id: "metric-2",
          patientId,
          type: "blood-pressure",
          value: "130/80",
          unit: "mmHg",
          recordedAt: "2024-01-18T09:00:00Z",
          recordedBy: "patient",
          notes: "Morning reading",
        },
        {
          id: "metric-3",
          patientId,
          type: "weight",
          value: "75.5",
          unit: "kg",
          recordedAt: "2024-01-17T07:00:00Z",
          recordedBy: "patient",
        },
        {
          id: "metric-4",
          patientId,
          type: "heart-rate",
          value: "72",
          unit: "bpm",
          recordedAt: "2024-01-17T08:30:00Z",
          recordedBy: "device",
          deviceId: "fitbit-123",
        },
      ];
      setMetrics(mockMetrics);
      setError(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGoals = async () => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/patient/${patientId}/health-goals`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("patient_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch health goals");
      }

      const data = await response.json();
      setGoals(data);
    } catch (err) {
      console.error("Failed to fetch health goals:", err);

      // Mock data for development
      const mockGoals: HealthGoal[] = [
        {
          id: "goal-1",
          type: "blood-sugar",
          target: "<140",
          current: "120",
          unit: "mg/dL",
          deadline: "2024-06-30T23:59:59Z",
          status: "on-track",
        },
        {
          id: "goal-2",
          type: "weight",
          target: "70",
          current: "75.5",
          unit: "kg",
          deadline: "2024-12-31T23:59:59Z",
          status: "behind",
        },
      ];
      setGoals(mockGoals);
    }
  };

  const recordMetric = async (
    metricData: Omit<HealthMetric, "id" | "patientId">,
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      const response = await fetch("/api/health-metrics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("patient_token")}`,
        },
        body: JSON.stringify({
          ...metricData,
          patientId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to record health metric");
      }

      const newMetric = await response.json();
      setMetrics((prev) => [newMetric, ...prev]);
    } catch (err) {
      console.error("Failed to record health metric:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateGoal = async (goalId: string, updates: Partial<HealthGoal>) => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      const response = await fetch(`/api/health-goals/${goalId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("patient_token")}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Failed to update health goal");
      }

      const updatedGoal = await response.json();
      setGoals((prev) =>
        prev.map((goal) => (goal.id === goalId ? updatedGoal : goal)),
      );
    } catch (err) {
      console.error("Failed to update health goal:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getMetricTrends = async (type: string, days: number) => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch(
        `/api/patient/${patientId}/health-metrics/trends?type=${type}&days=${days}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("patient_token")}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch metric trends");
      }

      return await response.json();
    } catch (err) {
      console.error("Failed to fetch metric trends:", err);
      // Return mock trend data
      return [
        { date: "2024-01-15", value: 125 },
        { date: "2024-01-16", value: 118 },
        { date: "2024-01-17", value: 122 },
        { date: "2024-01-18", value: 120 },
      ];
    }
  };

  const deleteMetric = async (metricId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      const response = await fetch(`/api/health-metrics/${metricId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("patient_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete health metric");
      }

      setMetrics((prev) => prev.filter((metric) => metric.id !== metricId));
    } catch (err) {
      console.error("Failed to delete health metric:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    metrics,
    goals,
    isLoading,
    error,
    recordMetric,
    updateGoal,
    getMetricTrends,
    deleteMetric,
  };
};
