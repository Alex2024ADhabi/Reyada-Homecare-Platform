import { useEffect, useRef, useCallback } from "react";
import { memoryLeakDetector } from "@/services/memory-leak-detector.service";
/**
 * Hook to prevent memory leaks in React components
 * Automatically tracks and cleans up resources
 */
export const useMemoryLeakPrevention = (componentName) => {
    const cleanupFunctions = useRef([]);
    const timers = useRef(new Set());
    const eventListeners = useRef([]);
    const subscriptions = useRef([]);
    // Track component with memory leak detector
    useEffect(() => {
        memoryLeakDetector.trackComponent(componentName);
        return () => {
            memoryLeakDetector.untrackComponent(componentName);
        };
    }, [componentName]);
    // Safe setTimeout that auto-cleans up
    const safeSetTimeout = useCallback((callback, delay) => {
        const id = setTimeout(() => {
            callback();
            timers.current.delete(id);
        }, delay);
        timers.current.add(id);
        return id;
    }, []);
    // Safe setInterval that auto-cleans up
    const safeSetInterval = useCallback((callback, delay) => {
        const id = setInterval(callback, delay);
        timers.current.add(id);
        return id;
    }, []);
    // Safe event listener that auto-cleans up
    const safeAddEventListener = useCallback((element, event, handler, options) => {
        element.addEventListener(event, handler, options);
        eventListeners.current.push({ element, event, handler, options });
    }, []);
    // Add cleanup function
    const addCleanupFunction = useCallback((cleanup) => {
        cleanupFunctions.current.push(cleanup);
    }, []);
    // Add subscription that will be auto-cleaned
    const addSubscription = useCallback((subscription) => {
        subscriptions.current.push(subscription);
    }, []);
    // Manual cleanup function
    const cleanup = useCallback(() => {
        // Clear all timers
        timers.current.forEach((id) => {
            clearTimeout(id);
            clearInterval(id);
        });
        timers.current.clear();
        // Remove all event listeners
        eventListeners.current.forEach(({ element, event, handler, options }) => {
            element.removeEventListener(event, handler, options);
        });
        eventListeners.current.length = 0;
        // Unsubscribe from all subscriptions
        subscriptions.current.forEach((subscription) => {
            try {
                subscription.unsubscribe();
            }
            catch (error) {
                console.warn("Error unsubscribing:", error);
            }
        });
        subscriptions.current.length = 0;
        // Run all cleanup functions
        cleanupFunctions.current.forEach((cleanup) => {
            try {
                cleanup();
            }
            catch (error) {
                console.warn("Error in cleanup function:", error);
            }
        });
        cleanupFunctions.current.length = 0;
    }, []);
    // Auto-cleanup on unmount
    useEffect(() => {
        return cleanup;
    }, [cleanup]);
    return {
        safeSetTimeout,
        safeSetInterval,
        safeAddEventListener,
        addCleanupFunction,
        addSubscription,
        cleanup,
    };
};
/**
 * Hook for detecting memory leaks in development
 */
export const useMemoryLeakDetection = () => {
    const checkLeaks = useCallback(() => {
        const leaks = memoryLeakDetector.detectLeaks();
        if (leaks.length > 0) {
            console.group("🚨 Memory Leaks Detected");
            leaks.forEach((leak) => {
                console.warn(`${leak.componentName}: ${leak.description}`);
                console.info(`Recommendation: ${leak.recommendation}`);
            });
            console.groupEnd();
        }
        return leaks;
    }, []);
    const getMemoryUsage = useCallback(() => {
        return memoryLeakDetector.getMemoryUsage();
    }, []);
    // Check for leaks periodically in development
    useEffect(() => {
        if (process.env.NODE_ENV === "development") {
            const interval = setInterval(() => {
                checkLeaks();
            }, 30000); // Check every 30 seconds
            return () => clearInterval(interval);
        }
    }, [checkLeaks]);
    return {
        checkLeaks,
        getMemoryUsage,
    };
};
export default useMemoryLeakPrevention;
