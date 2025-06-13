import { useState, useEffect } from "react";
export const useNotificationSettings = (patientId) => {
    const [preferences, setPreferences] = useState({
        email: true,
        sms: true,
        push: true,
        appointmentReminders: true,
        medicationReminders: true,
        careUpdates: true,
        educationalContent: false,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        fetchPreferences();
    }, [patientId]);
    const fetchPreferences = async () => {
        try {
            setIsLoading(true);
            setError(null);
            // TODO: Replace with actual API call
            const response = await fetch(`/api/patient/${patientId}/notification-preferences`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("patient_token")}`,
                },
            });
            if (!response.ok) {
                throw new Error("Failed to fetch notification preferences");
            }
            const data = await response.json();
            setPreferences(data);
        }
        catch (err) {
            console.error("Failed to fetch notification preferences:", err);
            setError(err instanceof Error ? err.message : "An error occurred");
            // Use default preferences on error
            setPreferences({
                email: true,
                sms: true,
                push: true,
                appointmentReminders: true,
                medicationReminders: true,
                careUpdates: true,
                educationalContent: false,
            });
            setError(null);
        }
        finally {
            setIsLoading(false);
        }
    };
    const updatePreferences = async (newPreferences) => {
        try {
            setIsLoading(true);
            setError(null);
            // TODO: Replace with actual API call
            const response = await fetch(`/api/patient/${patientId}/notification-preferences`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("patient_token")}`,
                },
                body: JSON.stringify(newPreferences),
            });
            if (!response.ok) {
                throw new Error("Failed to update notification preferences");
            }
            const updatedPreferences = await response.json();
            setPreferences(updatedPreferences);
        }
        catch (err) {
            console.error("Failed to update notification preferences:", err);
            setError(err instanceof Error ? err.message : "An error occurred");
            throw err;
        }
        finally {
            setIsLoading(false);
        }
    };
    const testNotification = async (type) => {
        try {
            setIsLoading(true);
            setError(null);
            // TODO: Replace with actual API call
            const response = await fetch(`/api/patient/${patientId}/test-notification`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("patient_token")}`,
                },
                body: JSON.stringify({ type }),
            });
            if (!response.ok) {
                throw new Error("Failed to send test notification");
            }
        }
        catch (err) {
            console.error("Failed to send test notification:", err);
            setError(err instanceof Error ? err.message : "An error occurred");
            throw err;
        }
        finally {
            setIsLoading(false);
        }
    };
    return {
        preferences,
        isLoading,
        error,
        updatePreferences,
        testNotification,
    };
};
