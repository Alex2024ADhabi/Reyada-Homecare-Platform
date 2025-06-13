import React from "react";
import { useToastContext } from "@/components/ui/toast-provider";
export class ErrorHandlerService {
    constructor() {
        Object.defineProperty(this, "toastContext", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    static getInstance() {
        if (!ErrorHandlerService.instance) {
            ErrorHandlerService.instance = new ErrorHandlerService();
        }
        return ErrorHandlerService.instance;
    }
    setToastContext(context) {
        this.toastContext = context;
    }
    handleApiError(error, context) {
        const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        console.error(`API Error${context ? ` in ${context}` : ""} [${errorId}]:`, error);
        let apiError;
        // Quality control: Enhanced error categorization
        if (error.response) {
            // Server responded with error status
            const status = error.response.status;
            let message = error.response.data?.message || "Server error occurred";
            let code = error.response.data?.code || "SERVER_ERROR";
            // Quality control: Provide user-friendly messages based on status
            if (status === 400) {
                message = "Invalid request. Please check your input and try again.";
                code = "BAD_REQUEST";
            }
            else if (status === 401) {
                message = "Authentication required. Please log in and try again.";
                code = "UNAUTHORIZED";
            }
            else if (status === 403) {
                message = "Access denied. You don't have permission for this action.";
                code = "FORBIDDEN";
            }
            else if (status === 404) {
                message = "The requested resource was not found.";
                code = "NOT_FOUND";
            }
            else if (status === 429) {
                message = "Too many requests. Please wait a moment and try again.";
                code = "RATE_LIMITED";
            }
            else if (status >= 500) {
                message = "Server error. Please try again later.";
                code = "SERVER_ERROR";
            }
            apiError = {
                message,
                code,
                status,
                details: error.response.data,
            };
        }
        else if (error.request) {
            // Network error
            apiError = {
                message: "Network error - please check your connection and try again",
                code: "NETWORK_ERROR",
                status: 0,
            };
        }
        else {
            // Other error
            apiError = {
                message: error.message || "An unexpected error occurred",
                code: "UNKNOWN_ERROR",
            };
        }
        // Quality control: Sanitize error message for user display
        apiError.message = this.sanitizeErrorMessage(apiError.message);
        // Store error for offline reporting
        try {
            const errorData = {
                id: errorId,
                timestamp: new Date().toISOString(),
                context,
                error: {
                    message: error?.message,
                    status: error?.response?.status,
                    data: error?.response?.data,
                    stack: error?.stack,
                },
                userAgent: navigator.userAgent,
                url: window.location.href,
            };
            const existingErrors = JSON.parse(localStorage.getItem("api_errors") || "[]");
            existingErrors.push(errorData);
            // Keep only last 50 errors
            if (existingErrors.length > 50) {
                existingErrors.splice(0, existingErrors.length - 50);
            }
            localStorage.setItem("api_errors", JSON.stringify(existingErrors));
        }
        catch (storageError) {
            console.error("Failed to store error data:", storageError);
        }
        // Show toast notification if context is available
        if (this.toastContext) {
            this.toastContext.toast({
                title: "Error",
                description: `${apiError.message} (ID: ${errorId.substr(-8)})`,
                variant: "destructive",
            });
        }
        // Quality control: Log error for monitoring
        this.logError(error, context);
        return apiError;
    }
    sanitizeErrorMessage(message) {
        // Quality control: Remove sensitive information from error messages
        const sensitivePatterns = [
            /password/gi,
            /token/gi,
            /key/gi,
            /secret/gi,
            /auth/gi,
        ];
        let sanitized = message;
        sensitivePatterns.forEach((pattern) => {
            sanitized = sanitized.replace(pattern, "[REDACTED]");
        });
        // Limit message length
        if (sanitized.length > 200) {
            sanitized = sanitized.substring(0, 197) + "...";
        }
        return sanitized;
    }
    handleValidationErrors(errors) {
        console.error("Validation Errors:", errors);
        if (this.toastContext && errors.length > 0) {
            const firstError = errors[0];
            this.toastContext.toast({
                title: "Validation Error",
                description: `${firstError.field}: ${firstError.message}`,
                variant: "destructive",
            });
        }
    }
    handleOfflineError(operation) {
        console.warn(`Operation attempted while offline: ${operation}`);
        if (this.toastContext) {
            this.toastContext.toast({
                title: "Offline Mode",
                description: `${operation} will be processed when you're back online`,
                variant: "warning",
            });
        }
    }
    handleSuccess(message, description) {
        if (this.toastContext) {
            this.toastContext.toast({
                title: message,
                description,
                variant: "success",
            });
        }
    }
    handleInfo(message, description) {
        if (this.toastContext) {
            this.toastContext.toast({
                title: message,
                description,
                variant: "info",
            });
        }
    }
    logError(error, context) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            context,
            error: {
                message: error.message,
                stack: error.stack,
                name: error.name,
            },
        };
        // In production, this would send to logging service
        console.error("Error Log:", logEntry);
        // Store in localStorage for debugging (limit to last 100 entries)
        try {
            const logs = JSON.parse(localStorage.getItem("error_logs") || "[]");
            logs.push(logEntry);
            if (logs.length > 100) {
                logs.shift();
            }
            localStorage.setItem("error_logs", JSON.stringify(logs));
        }
        catch (e) {
            console.warn("Failed to store error log:", e);
        }
    }
    getErrorLogs() {
        try {
            return JSON.parse(localStorage.getItem("error_logs") || "[]");
        }
        catch (e) {
            console.warn("Failed to retrieve error logs:", e);
            return [];
        }
    }
    clearErrorLogs() {
        try {
            localStorage.removeItem("error_logs");
        }
        catch (e) {
            console.warn("Failed to clear error logs:", e);
        }
    }
}
export const errorHandler = ErrorHandlerService.getInstance();
// Hook for using error handler in components
export const useErrorHandler = () => {
    const toastContext = useToastContext();
    React.useEffect(() => {
        errorHandler.setToastContext(toastContext);
    }, [toastContext]);
    const handleSuccess = React.useCallback((title, description) => {
        toastContext.toast({
            title,
            description,
            variant: "success",
            duration: 3000,
        });
    }, [toastContext]);
    const handleApiError = React.useCallback((error, context) => {
        return errorHandler.handleApiError(error, context);
    }, []);
    const handleValidationError = React.useCallback((errors) => {
        const errorMessages = Object.values(errors).join(", ");
        toastContext.toast({
            title: "Validation Error",
            description: errorMessages,
            variant: "destructive",
            duration: 4000,
        });
    }, [toastContext]);
    const handleWarning = React.useCallback((title, description) => {
        toastContext.toast({
            title,
            description,
            variant: "warning",
            duration: 4000,
        });
    }, [toastContext]);
    const handleInfo = React.useCallback((title, description) => {
        toastContext.toast({
            title,
            description,
            variant: "info",
            duration: 3000,
        });
    }, [toastContext]);
    const reportError = React.useCallback((error, context) => {
        errorHandler.logError(error, context);
    }, []);
    return {
        handleSuccess,
        handleApiError,
        handleValidationError,
        handleWarning,
        handleInfo,
        reportError,
    };
};
