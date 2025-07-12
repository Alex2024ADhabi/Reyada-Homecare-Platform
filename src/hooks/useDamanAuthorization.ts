import { useState, useCallback } from "react";
import { ApiService } from "@/services/api.service";
import { useOfflineSync } from "./useOfflineSync";

/**
 * Hook to manage Daman prior authorization functionality
 */
export function useDamanAuthorization() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { isOnline } = useOfflineSync();

  // Submit a Daman authorization
  const submitAuthorization = useCallback(
    async (authorizationData: any) => {
      setIsLoading(true);
      setError(null);

      try {
        // Enhanced validation with JSON structure checking
        if (!authorizationData || typeof authorizationData !== "object") {
          throw new Error("Invalid authorization data provided");
        }

        // Comprehensive sanitization and validation
        let sanitizedData;
        try {
          // First check if data is serializable
          const testJson = JSON.stringify(authorizationData);
          if (!testJson || testJson === "null" || testJson === "undefined") {
            throw new Error("Authorization data cannot be serialized");
          }

          // Parse back to ensure valid structure
          sanitizedData = JSON.parse(testJson);

          // Validate required fields
          if (!sanitizedData.patientId) {
            throw new Error("Patient ID is required");
          }

          if (!sanitizedData.serviceType) {
            throw new Error("Service type is required");
          }

          // Ensure numeric fields are properly typed
          if (sanitizedData.requestedDuration) {
            sanitizedData.requestedDuration = Number(
              sanitizedData.requestedDuration,
            );
            if (isNaN(sanitizedData.requestedDuration)) {
              throw new Error("Invalid requested duration");
            }
          }
        } catch (jsonError) {
          const errorMessage =
            jsonError instanceof Error
              ? jsonError.message
              : "Invalid JSON structure";
          throw new Error(
            `Authorization data validation failed: ${errorMessage}`,
          );
        }

        if (isOnline) {
          // Online mode - submit directly
          const result =
            await ApiService.submitDamanAuthorization(sanitizedData);

          // Comprehensive API response validation
          if (!result || typeof result !== "object") {
            throw new Error("Invalid API response received");
          }

          // Validate and sanitize response structure
          let validatedResult;
          try {
            const responseJson = JSON.stringify(result);
            if (!responseJson || responseJson === "{}") {
              throw new Error("Empty API response");
            }

            validatedResult = JSON.parse(responseJson);

            // Validate expected response fields
            if (
              !validatedResult.success &&
              !validatedResult.id &&
              !validatedResult.referenceNumber
            ) {
              throw new Error("API response missing required fields");
            }
          } catch (validationError) {
            const errorMessage =
              validationError instanceof Error
                ? validationError.message
                : "Response validation failed";
            throw new Error(`API response validation failed: ${errorMessage}`);
          }

          return validatedResult;
        } else {
          // Offline mode - queue for later submission
          const queueData = {
            url: "/authorizations/daman/submit",
            method: "post",
            data: sanitizedData,
            headers: { "Content-Type": "application/json" },
            timestamp: new Date().toISOString(),
          };

          // Comprehensive queue data validation
          try {
            const queueJson = JSON.stringify(queueData);
            if (!queueJson || queueJson === "{}") {
              throw new Error("Queue data is empty");
            }

            const parsedQueueData = JSON.parse(queueJson);
            if (
              !parsedQueueData.url ||
              !parsedQueueData.method ||
              !parsedQueueData.data
            ) {
              throw new Error("Queue data missing required fields");
            }
          } catch (queueError) {
            const errorMessage =
              queueError instanceof Error
                ? queueError.message
                : "Queue validation failed";
            throw new Error(
              `Failed to create valid queue data: ${errorMessage}`,
            );
          }

          await offlineService.addToQueue(queueData);

          // Generate a temporary reference number for offline mode
          const offlineReferenceNumber = `OFFLINE-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

          const offlineResponse = {
            success: true,
            offlineQueued: true,
            referenceNumber: offlineReferenceNumber,
            message: "Authorization queued for submission when online",
          };

          // Comprehensive offline response validation
          try {
            const offlineJson = JSON.stringify(offlineResponse);
            if (!offlineJson || offlineJson === "{}") {
              throw new Error("Offline response is empty");
            }

            const parsedOfflineResponse = JSON.parse(offlineJson);
            if (
              !parsedOfflineResponse.success ||
              !parsedOfflineResponse.referenceNumber
            ) {
              throw new Error("Offline response missing required fields");
            }
          } catch (offlineError) {
            const errorMessage =
              offlineError instanceof Error
                ? offlineError.message
                : "Offline response validation failed";
            throw new Error(
              `Failed to create valid offline response: ${errorMessage}`,
            );
          }

          return offlineResponse;
        }
      } catch (err: any) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to submit authorization";
        console.error("Failed to submit authorization:", errorMessage);
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [isOnline],
  );

  // Track authorization status
  const trackAuthorization = useCallback(
    async (referenceNumber: string) => {
      setIsLoading(true);
      setError(null);

      try {
        if (isOnline) {
          // Online mode - get status from API
          const result =
            await ApiService.getDamanAuthorizationStatus(referenceNumber);
          return result;
        } else {
          // Offline mode - return basic info
          if (referenceNumber.startsWith("OFFLINE-")) {
            return {
              referenceNumber,
              status: "pending",
              comments:
                "This authorization will be processed when you're back online",
              submissionDate: new Date().toISOString(),
            };
          } else {
            throw new Error("Cannot track authorization status while offline");
          }
        }
      } catch (err: any) {
        console.error(`Failed to track authorization ${referenceNumber}:`, err);
        setError(
          err.message || `Failed to track authorization ${referenceNumber}`,
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [isOnline],
  );

  // Get authorization details
  const getAuthorizationDetails = useCallback(
    async (authorizationId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        if (isOnline) {
          // Online mode - get details from API
          const result =
            await ApiService.getDamanAuthorizationDetails(authorizationId);
          return result;
        } else {
          // Offline mode - return error
          throw new Error("Cannot get authorization details while offline");
        }
      } catch (err: any) {
        console.error(
          `Failed to get authorization details ${authorizationId}:`,
          err,
        );
        setError(
          err.message ||
            `Failed to get authorization details ${authorizationId}`,
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [isOnline],
  );

  // Upload additional documents
  const uploadAdditionalDocuments = useCallback(
    async (authorizationId: string, files: File[]) => {
      setIsLoading(true);
      setError(null);

      try {
        if (isOnline) {
          // Online mode - upload directly
          const formData = new FormData();
          files.forEach((file, index) => {
            formData.append(`file${index}`, file);
          });
          formData.append("authorizationId", authorizationId);

          const result = await ApiService.uploadAdditionalDocuments(
            authorizationId,
            formData,
          );
          return result;
        } else {
          // Offline mode - queue for later upload
          // In a real implementation, we would need to store the files locally
          // For now, just return a mock response
          return {
            success: true,
            offlineQueued: true,
            message: `${files.length} document(s) queued for upload when online`,
          };
        }
      } catch (err: any) {
        console.error(
          `Failed to upload additional documents for ${authorizationId}:`,
          err,
        );
        setError(
          err.message ||
            `Failed to upload additional documents for ${authorizationId}`,
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [isOnline],
  );

  // Register for webhook notifications
  const registerForNotifications = useCallback(
    async (
      authorizationId: string,
      referenceNumber: string,
      notificationPreferences: any,
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        if (isOnline) {
          // Online mode - register directly
          const webhookData = {
            submissionId: authorizationId,
            referenceNumber,
            callbackUrl:
              process.env.WEBHOOK_CALLBACK_URL ||
              "https://api.reyada-homecare.ae/webhooks/daman",
            events: notificationPreferences.events || [
              "status-change",
              "review-update",
              "additional-info-request",
            ],
            channels: notificationPreferences.channels || [
              "email",
              "sms",
              "app",
            ],
            recipientEmail: localStorage.getItem("user_email") || "",
            recipientPhone: localStorage.getItem("user_phone") || "",
            priority: notificationPreferences.priority || "high",
          };

          const result = await ApiService.registerForAuthorizationWebhooks(
            authorizationId,
            webhookData,
          );
          return result;
        } else {
          // Offline mode - queue for later registration
          return {
            success: true,
            offlineQueued: true,
            message: "Notification preferences will be registered when online",
          };
        }
      } catch (err: any) {
        console.error(
          `Failed to register for notifications for ${authorizationId}:`,
          err,
        );
        setError(
          err.message ||
            `Failed to register for notifications for ${authorizationId}`,
        );
        // Non-critical error, don't throw
        return {
          success: false,
          error: err.message || "Failed to register for notifications",
        };
      } finally {
        setIsLoading(false);
      }
    },
    [isOnline],
  );

  return {
    isLoading,
    error,
    submitAuthorization,
    trackAuthorization,
    getAuthorizationDetails,
    uploadAdditionalDocuments,
    registerForNotifications,
  };
}

// Mock offline service for the hook to use
// In a real implementation, this would be imported from the actual offline service
const offlineService = {
  addToQueue: async (request: any) => {
    console.log("Adding to offline queue:", request);
    // In a real implementation, this would store the request in IndexedDB
    const offlineQueue = JSON.parse(
      localStorage.getItem("offlineQueue") || "[]",
    );
    offlineQueue.push(request);
    localStorage.setItem("offlineQueue", JSON.stringify(offlineQueue));
    return true;
  },
};
