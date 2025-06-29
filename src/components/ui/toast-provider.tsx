import React, { createContext, useContext, useState, ReactNode } from "react";

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success" | "warning";
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const success = (title: string, description?: string) => {
    addToast({ title, description, variant: "success" });
  };

  const error = (title: string, description?: string) => {
    addToast({ title, description, variant: "destructive" });
  };

  const warning = (title: string, description?: string) => {
    addToast({ title, description, variant: "warning" });
  };

  const getToastStyles = (variant: Toast["variant"]) => {
    switch (variant) {
      case "destructive":
        return "bg-red-500 text-white border-red-600";
      case "success":
        return "bg-green-500 text-white border-green-600";
      case "warning":
        return "bg-yellow-500 text-white border-yellow-600";
      default:
        return "bg-white border-gray-200 text-gray-900";
    }
  };

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, removeToast, success, error, warning }}
    >
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-lg shadow-lg max-w-sm border relative animate-in slide-in-from-right-full ${getToastStyles(
              toast.variant,
            )}`}
          >
            {toast.title && (
              <div className="font-semibold mb-1">{toast.title}</div>
            )}
            {toast.description && (
              <div className="text-sm opacity-90">{toast.description}</div>
            )}
            <button
              onClick={() => removeToast(toast.id)}
              className="absolute top-2 right-2 text-xs opacity-70 hover:opacity-100 w-4 h-4 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
