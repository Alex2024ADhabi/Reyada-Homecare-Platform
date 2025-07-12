import React, { useState, useCallback } from "react";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive" | "success" | "warning";
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
}

let toastState: ToastState = { toasts: [] };
let listeners: Array<(state: ToastState) => void> = [];

const addToast = (toast: Omit<Toast, "id">) => {
  const id = Math.random().toString(36).substr(2, 9);
  const newToast: Toast = {
    id,
    duration: 5000,
    ...toast,
  };

  toastState.toasts.push(newToast);
  listeners.forEach((listener) => listener(toastState));

  // Auto remove toast after duration
  if (newToast.duration && newToast.duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, newToast.duration);
  }

  return id;
};

const removeToast = (id: string) => {
  toastState.toasts = toastState.toasts.filter((toast) => toast.id !== id);
  listeners.forEach((listener) => listener(toastState));
};

const clearAllToasts = () => {
  toastState.toasts = [];
  listeners.forEach((listener) => listener(toastState));
};

export const useToast = () => {
  const [state, setState] = useState<ToastState>(toastState);

  const subscribe = useCallback((listener: (state: ToastState) => void) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  // Subscribe to state changes
  React.useEffect(() => {
    const unsubscribe = subscribe(setState);
    return unsubscribe;
  }, [subscribe]);

  const toast = useCallback((options: Omit<Toast, "id">) => {
    return addToast(options);
  }, []);

  const dismiss = useCallback((id: string) => {
    removeToast(id);
  }, []);

  const dismissAll = useCallback(() => {
    clearAllToasts();
  }, []);

  return {
    toast,
    dismiss,
    dismissAll,
    toasts: state.toasts,
  };
};

// Export for backward compatibility
export { useToast as toast };
