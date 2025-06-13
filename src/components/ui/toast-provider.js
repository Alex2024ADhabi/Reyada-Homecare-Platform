import { jsx as _jsx } from "react/jsx-runtime";
import React, { createContext, useContext, useState, useCallback, } from "react";
const ToastContext = createContext(undefined);
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const toast = useCallback((newToast) => {
        const id = Math.random().toString(36).substr(2, 9);
        const toastWithId = { ...newToast, id };
        setToasts((prev) => [...prev, toastWithId]);
        // Auto remove after 5 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, []);
    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);
    const contextValue = React.useMemo(() => ({
        toast,
        toasts,
        removeToast,
    }), [toast, toasts, removeToast]);
    return (_jsx(ToastContext.Provider, { value: contextValue, children: children }));
};
export const useToastContext = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToastContext must be used within a ToastProvider");
    }
    return context;
};
export default ToastProvider;
