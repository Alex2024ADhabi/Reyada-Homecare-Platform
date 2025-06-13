import { useState, useCallback } from "react";
let toastState = { toasts: [] };
let listeners = [];
const addToast = (toast) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = {
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
const removeToast = (id) => {
    toastState.toasts = toastState.toasts.filter((toast) => toast.id !== id);
    listeners.forEach((listener) => listener(toastState));
};
const clearAllToasts = () => {
    toastState.toasts = [];
    listeners.forEach((listener) => listener(toastState));
};
export const useToast = () => {
    const [state, setState] = useState(toastState);
    const subscribe = useCallback((listener) => {
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
    const toast = useCallback((options) => {
        return addToast(options);
    }, []);
    const dismiss = useCallback((id) => {
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
