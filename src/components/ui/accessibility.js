import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
export const SkipLink = ({ href, children }) => {
    return (_jsx("a", { href: href, className: "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-blue-500", children: children }));
};
export const FocusTrap = ({ children, active = true, restoreFocus = true, }) => {
    const containerRef = useRef(null);
    const previousActiveElement = useRef(null);
    useEffect(() => {
        if (!active)
            return;
        // Store the previously focused element
        previousActiveElement.current = document.activeElement;
        const container = containerRef.current;
        if (!container)
            return;
        // Get all focusable elements
        const getFocusableElements = () => {
            return container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        };
        const handleKeyDown = (e) => {
            if (e.key !== "Tab")
                return;
            const focusableElements = getFocusableElements();
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement?.focus();
                }
            }
            else {
                // Tab
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement?.focus();
                }
            }
        };
        // Focus the first focusable element
        const focusableElements = getFocusableElements();
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            // Restore focus to the previously active element
            if (restoreFocus && previousActiveElement.current) {
                previousActiveElement.current.focus();
            }
        };
    }, [active, restoreFocus]);
    return (_jsx("div", { ref: containerRef, className: "focus-trap", children: children }));
};
export const ScreenReaderOnly = ({ children, className, }) => {
    return _jsx("span", { className: cn("sr-only", className), children: children });
};
export const LiveRegion = ({ children, politeness = "polite", atomic = false, className, }) => {
    return (_jsx("div", { "aria-live": politeness, "aria-atomic": atomic, className: cn("sr-only", className), children: children }));
};
export const AccessibleButton = ({ children, variant = "primary", size = "md", loading = false, loadingText = "Loading...", disabled, className, ...props }) => {
    const getVariantStyles = () => {
        switch (variant) {
            case "primary":
                return "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500";
            case "secondary":
                return "bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500";
            case "danger":
                return "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500";
            default:
                return "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500";
        }
    };
    const getSizeStyles = () => {
        switch (size) {
            case "sm":
                return "px-3 py-1.5 text-sm";
            case "md":
                return "px-4 py-2 text-base";
            case "lg":
                return "px-6 py-3 text-lg";
            default:
                return "px-4 py-2 text-base";
        }
    };
    return (_jsx("button", { ...props, disabled: disabled || loading, "aria-disabled": disabled || loading, "aria-busy": loading, className: cn("inline-flex items-center justify-center rounded-md font-medium transition-colors", "focus:outline-none focus:ring-2 focus:ring-offset-2", "disabled:opacity-50 disabled:cursor-not-allowed", getVariantStyles(), getSizeStyles(), className), children: loading ? (_jsxs(_Fragment, { children: [_jsxs("svg", { className: "animate-spin -ml-1 mr-2 h-4 w-4", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", "aria-hidden": "true", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] }), _jsx(ScreenReaderOnly, { children: loadingText }), _jsx("span", { "aria-hidden": "true", children: children })] })) : (children) }));
};
export const AccessibleField = ({ label, children, error, description, required = false, className, }) => {
    const fieldId = React.useId();
    const errorId = error ? `${fieldId}-error` : undefined;
    const descriptionId = description ? `${fieldId}-description` : undefined;
    return (_jsxs("div", { className: cn("space-y-2", className), children: [_jsxs("label", { htmlFor: fieldId, className: "block text-sm font-medium text-gray-700", children: [label, required && (_jsx("span", { className: "text-red-500 ml-1", "aria-label": "required", children: "*" }))] }), description && (_jsx("p", { id: descriptionId, className: "text-sm text-gray-600", children: description })), _jsx("div", { children: React.cloneElement(children, {
                    id: fieldId,
                    "aria-describedby": [descriptionId, errorId].filter(Boolean).join(" ") || undefined,
                    "aria-invalid": error ? "true" : undefined,
                    "aria-required": required,
                }) }), error && (_jsx("p", { id: errorId, className: "text-sm text-red-600", role: "alert", children: error }))] }));
};
// Hook for managing focus
export const useFocusManagement = () => {
    const [focusedElement, setFocusedElement] = useState(null);
    const saveFocus = () => {
        setFocusedElement(document.activeElement);
    };
    const restoreFocus = () => {
        if (focusedElement) {
            focusedElement.focus();
        }
    };
    const focusElement = (selector) => {
        const element = document.querySelector(selector);
        if (element) {
            element.focus();
        }
    };
    const trapFocus = (containerSelector) => {
        const container = document.querySelector(containerSelector);
        if (!container)
            return;
        const focusableElements = container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    };
    return {
        saveFocus,
        restoreFocus,
        focusElement,
        trapFocus,
        focusedElement,
    };
};
// Hook for keyboard navigation
export const useKeyboardNavigation = (onEscape, onEnter) => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            switch (e.key) {
                case "Escape":
                    if (onEscape) {
                        e.preventDefault();
                        onEscape();
                    }
                    break;
                case "Enter":
                    if (onEnter && e.target === document.activeElement) {
                        e.preventDefault();
                        onEnter();
                    }
                    break;
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onEscape, onEnter]);
};
export default {
    SkipLink,
    FocusTrap,
    ScreenReaderOnly,
    LiveRegion,
    AccessibleButton,
    AccessibleField,
    useFocusManagement,
    useKeyboardNavigation,
};
