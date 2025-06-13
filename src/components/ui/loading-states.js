import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from "react";
import { cn } from "@/lib/utils";
import { Loader2, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
export const LoadingSpinner = ({ size = "md", className, text, }) => {
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-6 w-6",
        lg: "h-8 w-8",
    };
    return (_jsxs("div", { className: cn("flex items-center justify-center gap-2", className), children: [_jsx(Loader2, { className: cn("animate-spin", sizeClasses[size]) }), text && _jsx("span", { className: "text-sm text-muted-foreground", children: text })] }));
};
export const Skeleton = ({ className, lines = 1, avatar = false, }) => {
    return (_jsxs("div", { className: cn("animate-pulse", className), children: [avatar && (_jsxs("div", { className: "flex items-center space-x-4 mb-4", children: [_jsx("div", { className: "rounded-full bg-gray-300 h-10 w-10" }), _jsxs("div", { className: "flex-1 space-y-2", children: [_jsx("div", { className: "h-4 bg-gray-300 rounded w-3/4" }), _jsx("div", { className: "h-3 bg-gray-300 rounded w-1/2" })] })] })), _jsx("div", { className: "space-y-2", children: Array.from({ length: lines }).map((_, index) => (_jsx("div", { className: cn("h-4 bg-gray-300 rounded", index === lines - 1 ? "w-3/4" : "w-full") }, index))) })] }));
};
export const ProgressBar = ({ progress, className, showPercentage = true, color = "blue", size = "md", }) => {
    const colorClasses = {
        blue: "bg-blue-500",
        green: "bg-green-500",
        yellow: "bg-yellow-500",
        red: "bg-red-500",
    };
    const sizeClasses = {
        sm: "h-2",
        md: "h-3",
        lg: "h-4",
    };
    const clampedProgress = Math.min(100, Math.max(0, progress));
    return (_jsxs("div", { className: cn("w-full", className), children: [_jsx("div", { className: cn("w-full bg-gray-200 rounded-full", sizeClasses[size]), children: _jsx("div", { className: cn("rounded-full transition-all duration-300 ease-out", colorClasses[color], sizeClasses[size]), style: { width: `${clampedProgress}%` } }) }), showPercentage && (_jsxs("div", { className: "text-sm text-gray-600 mt-1 text-center", children: [clampedProgress.toFixed(0), "%"] }))] }));
};
export const LoadingCard = ({ title = "Loading...", description, progress, className, }) => {
    return (_jsx(Card, { className: cn("w-full", className), children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center space-x-4", children: [_jsx(LoadingSpinner, { size: "lg" }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "text-lg font-semibold", children: title }), description && (_jsx("p", { className: "text-sm text-muted-foreground mt-1", children: description })), progress !== undefined && (_jsx("div", { className: "mt-3", children: _jsx(ProgressBar, { progress: progress }) }))] })] }) }) }));
};
export const EmptyState = ({ icon, title, description, action, className, }) => {
    return (_jsxs("div", { className: cn("flex flex-col items-center justify-center p-8 text-center", className), children: [icon && _jsx("div", { className: "mb-4 text-gray-400", children: icon }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: title }), description && (_jsx("p", { className: "text-sm text-gray-500 mb-4 max-w-sm", children: description })), action && (_jsx(Button, { onClick: action.onClick, variant: "outline", children: action.label }))] }));
};
export const ErrorState = ({ title = "Something went wrong", description = "An error occurred while loading the data. Please try again.", retry, className, }) => {
    return (_jsxs("div", { className: cn("flex flex-col items-center justify-center p-8 text-center", className), children: [_jsx(AlertCircle, { className: "h-12 w-12 text-red-500 mb-4" }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: title }), _jsx("p", { className: "text-sm text-gray-500 mb-4 max-w-sm", children: description }), retry && (_jsxs(Button, { onClick: retry, variant: "outline", className: "flex items-center gap-2", children: [_jsx(RefreshCw, { className: "h-4 w-4" }), "Try Again"] }))] }));
};
export const SuccessState = ({ title = "Success!", description = "The operation completed successfully.", action, className, }) => {
    return (_jsxs("div", { className: cn("flex flex-col items-center justify-center p-8 text-center", className), children: [_jsx(CheckCircle, { className: "h-12 w-12 text-green-500 mb-4" }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: title }), _jsx("p", { className: "text-sm text-gray-500 mb-4 max-w-sm", children: description }), action && (_jsx(Button, { onClick: action.onClick, variant: "default", children: action.label }))] }));
};
export function AsyncState({ loading, error, data, loadingComponent, errorComponent, emptyComponent, children, isEmpty, }) {
    if (loading) {
        return (loadingComponent || (_jsx(LoadingCard, { title: "Loading data...", description: "Please wait" })));
    }
    if (error) {
        return (errorComponent || (_jsx(ErrorState, { title: "Failed to load data", description: error.message })));
    }
    if (!data || (isEmpty && isEmpty(data))) {
        return (emptyComponent || (_jsx(EmptyState, { title: "No data available", description: "There is no data to display at the moment." })));
    }
    return _jsx(_Fragment, { children: children(data) });
}
// Higher-order component for loading states
export function withLoadingState(Component, loadingProps) {
    return function WithLoadingStateComponent(props) {
        if (props.loading) {
            return _jsx(LoadingCard, { ...loadingProps });
        }
        return _jsx(Component, { ...props });
    };
}
// Hook for managing async states
export function useAsyncState() {
    const [state, setState] = React.useState({
        loading: false,
        error: null,
        data: null,
    });
    const execute = React.useCallback(async (asyncFunction) => {
        setState({ loading: true, error: null, data: null });
        try {
            const result = await asyncFunction();
            setState({ loading: false, error: null, data: result });
            return result;
        }
        catch (error) {
            const errorObj = error instanceof Error ? error : new Error(String(error));
            setState({ loading: false, error: errorObj, data: null });
            throw error;
        }
    }, []);
    const reset = React.useCallback(() => {
        setState({ loading: false, error: null, data: null });
    }, []);
    return {
        ...state,
        execute,
        reset,
    };
}
