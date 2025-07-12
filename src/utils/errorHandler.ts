// Centralized error handling utility
export class CommunicationError extends Error {
  public code: string;
  public context?: any;

  constructor(message: string, code: string, context?: any) {
    super(message);
    this.name = "CommunicationError";
    this.code = code;
    this.context = context;
  }
}

export const ERROR_CODES = {
  // Chat errors
  CHAT_GROUP_NOT_FOUND: "CHAT_GROUP_NOT_FOUND",
  MESSAGE_SEND_FAILED: "MESSAGE_SEND_FAILED",
  INVALID_PARTICIPANT: "INVALID_PARTICIPANT",

  // Email errors
  EMAIL_TEMPLATE_NOT_FOUND: "EMAIL_TEMPLATE_NOT_FOUND",
  EMAIL_SEND_FAILED: "EMAIL_SEND_FAILED",
  INVALID_RECIPIENT: "INVALID_RECIPIENT",

  // Committee errors
  COMMITTEE_NOT_FOUND: "COMMITTEE_NOT_FOUND",
  MEETING_SCHEDULE_CONFLICT: "MEETING_SCHEDULE_CONFLICT",
  INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",

  // Governance errors
  DOCUMENT_NOT_FOUND: "DOCUMENT_NOT_FOUND",
  APPROVAL_REQUIRED: "APPROVAL_REQUIRED",
  ACKNOWLEDGMENT_EXPIRED: "ACKNOWLEDGMENT_EXPIRED",

  // System errors
  NETWORK_ERROR: "NETWORK_ERROR",
  AUTHENTICATION_FAILED: "AUTHENTICATION_FAILED",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",

  // Integration Intelligence errors
  INTEGRATION_HEALTH_CHECK_FAILED: "INTEGRATION_HEALTH_CHECK_FAILED",
  PERFORMANCE_ANALYSIS_FAILED: "PERFORMANCE_ANALYSIS_FAILED",
  OPTIMIZATION_PLAN_FAILED: "OPTIMIZATION_PLAN_FAILED",
  PREDICTIVE_MODEL_ERROR: "PREDICTIVE_MODEL_ERROR",
};

export const handleError = (error: any, context?: string): string => {
  console.error(`Error in ${context || "unknown context"}:`, error);

  // Log to external service in production
  if (process.env.NODE_ENV === "production") {
    // Send to logging service
    // logToService(error, context);
  }

  // Show user-friendly message
  const userMessage = getUserFriendlyMessage(error);

  // You could integrate with a toast notification system here
  console.warn("User message:", userMessage);

  // Return the user message for potential use
  return userMessage;
};

const getUserFriendlyMessage = (error: any): string => {
  if (error instanceof CommunicationError) {
    switch (error.code) {
      case ERROR_CODES.CHAT_GROUP_NOT_FOUND:
        return "Chat group not found. Please refresh and try again.";
      case ERROR_CODES.MESSAGE_SEND_FAILED:
        return "Failed to send message. Please check your connection.";
      case ERROR_CODES.EMAIL_SEND_FAILED:
        return "Failed to send email. Please try again later.";
      case ERROR_CODES.COMMITTEE_NOT_FOUND:
        return "Committee not found. Please contact your administrator.";
      case ERROR_CODES.DOCUMENT_NOT_FOUND:
        return "Document not found. It may have been moved or deleted.";
      case ERROR_CODES.NETWORK_ERROR:
        return "Network connection error. Please check your internet connection.";
      case ERROR_CODES.INTEGRATION_HEALTH_CHECK_FAILED:
        return "Integration health check failed. Please verify system connectivity.";
      case ERROR_CODES.PERFORMANCE_ANALYSIS_FAILED:
        return "Performance analysis failed. Please try again later.";
      case ERROR_CODES.OPTIMIZATION_PLAN_FAILED:
        return "Optimization plan generation failed. Please check system parameters.";
      case ERROR_CODES.PREDICTIVE_MODEL_ERROR:
        return "Predictive model error. Please contact system administrator.";
      default:
        return "An unexpected error occurred. Please try again.";
    }
  }

  return "An unexpected error occurred. Please try again.";
};

export const withErrorHandling = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: string,
) => {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, context);
      return null;
    }
  };
};

// Export errorHandler object for compatibility
export const errorHandler = {
  logError: (error: Error, context?: string) => {
    handleError(error, context);
  },
  handleError,
  withErrorHandling,
};

export default {
  CommunicationError,
  ERROR_CODES,
  handleError,
  withErrorHandling,
  errorHandler,
};
