/**
 * Error Recovery System
 * Comprehensive error handling and recovery mechanisms
 * Prevents application crashes and provides graceful degradation
 */

import { EventEmitter } from 'eventemitter3';

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  timestamp: string;
  url?: string;
  userAgent?: string;
  stack?: string;
  props?: Record<string, any>;
}

export interface ErrorRecoveryOptions {
  maxRetries?: number;
  retryDelay?: number;
  fallbackComponent?: React.ComponentType;
  onError?: (error: Error, context: ErrorContext) => void;
  onRecovery?: (context: ErrorContext) => void;
}

class ErrorRecoverySystem extends EventEmitter {
  private errorCounts = new Map<string, number>();
  private recoveryAttempts = new Map<string, number>();
  private errorHistory: Array<{ error: Error; context: ErrorContext }> = [];
  private readonly maxHistorySize = 100;

  constructor() {
    super();
    this.setupGlobalErrorHandlers();
  }

  private setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(new Error(event.reason), {
        component: 'Global',
        action: 'unhandledrejection',
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      });
    });

    // Handle global errors
    window.addEventListener('error', (event) => {
      this.handleError(event.error || new Error(event.message), {
        component: 'Global',
        action: 'error',
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        stack: event.error?.stack,
      });
    });
  }

  handleError(error: Error, context: ErrorContext, options: ErrorRecoveryOptions = {}): boolean {
    const errorKey = this.generateErrorKey(error, context);
    const currentCount = this.errorCounts.get(errorKey) || 0;
    const maxRetries = options.maxRetries || 3;

    // Increment error count
    this.errorCounts.set(errorKey, currentCount + 1);

    // Add to history
    this.errorHistory.push({ error, context });
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory.shift();
    }

    // Log error
    console.error('Error Recovery System:', error, context);

    // Emit error event
    this.emit('error', { error, context, count: currentCount + 1 });

    // Call custom error handler
    if (options.onError) {
      try {
        options.onError(error, context);
      } catch (handlerError) {
        console.error('Error in custom error handler:', handlerError);
      }
    }

    // Attempt recovery if under retry limit
    if (currentCount < maxRetries) {
      return this.attemptRecovery(error, context, options);
    }

    // Max retries exceeded
    this.emit('maxRetriesExceeded', { error, context, count: currentCount + 1 });
    return false;
  }

  private attemptRecovery(error: Error, context: ErrorContext, options: ErrorRecoveryOptions): boolean {
    const recoveryKey = this.generateErrorKey(error, context);
    const attempts = this.recoveryAttempts.get(recoveryKey) || 0;
    
    this.recoveryAttempts.set(recoveryKey, attempts + 1);

    try {
      // Clear relevant caches
      this.clearCaches(context);

      // Reset component state if applicable
      this.resetComponentState(context);

      // Reload resources if needed
      this.reloadResources(context);

      // Call custom recovery handler
      if (options.onRecovery) {
        options.onRecovery(context);
      }

      this.emit('recovery', { context, attempt: attempts + 1 });
      return true;
    } catch (recoveryError) {
      console.error('Recovery attempt failed:', recoveryError);
      this.emit('recoveryFailed', { error: recoveryError, context, attempt: attempts + 1 });
      return false;
    }
  }

  private clearCaches(context: ErrorContext): void {
    try {
      // Clear localStorage items that might be corrupted
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('cache') || key.includes('temp'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

      // Clear sessionStorage
      if (context.component) {
        const sessionKey = `${context.component}_state`;
        sessionStorage.removeItem(sessionKey);
      }
    } catch (error) {
      console.warn('Failed to clear caches:', error);
    }
  }

  private resetComponentState(context: ErrorContext): void {
    try {
      // Emit state reset event for components to listen to
      this.emit('resetState', { component: context.component });
    } catch (error) {
      console.warn('Failed to reset component state:', error);
    }
  }

  private reloadResources(context: ErrorContext): void {
    try {
      // Reload critical resources if needed
      if (context.component === 'Dashboard' || context.component === 'App') {
        // Force reload of critical modules
        this.emit('reloadResources', { context });
      }
    } catch (error) {
      console.warn('Failed to reload resources:', error);
    }
  }

  private generateErrorKey(error: Error, context: ErrorContext): string {
    return `${context.component || 'unknown'}_${error.name}_${error.message.slice(0, 50)}`;
  }

  getErrorStatistics(): any {
    const stats = {
      totalErrors: this.errorHistory.length,
      errorsByComponent: {} as Record<string, number>,
      errorsByType: {} as Record<string, number>,
      recentErrors: this.errorHistory.slice(-10),
      topErrors: [] as Array<{ key: string; count: number }>,
    };

    // Count errors by component
    this.errorHistory.forEach(({ error, context }) => {
      const component = context.component || 'unknown';
      stats.errorsByComponent[component] = (stats.errorsByComponent[component] || 0) + 1;
      stats.errorsByType[error.name] = (stats.errorsByType[error.name] || 0) + 1;
    });

    // Get top errors
    stats.topErrors = Array.from(this.errorCounts.entries())
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return stats;
  }

  clearErrorHistory(): void {
    this.errorHistory = [];
    this.errorCounts.clear();
    this.recoveryAttempts.clear();
    this.emit('historyCleared');
  }

  isHealthy(): boolean {
    const recentErrors = this.errorHistory.filter(
      ({ context }) => Date.now() - new Date(context.timestamp).getTime() < 300000 // 5 minutes
    );
    return recentErrors.length < 10; // Less than 10 errors in 5 minutes
  }
}

// React Error Boundary Hook
export function useErrorRecovery(options: ErrorRecoveryOptions = {}) {
  const [error, setError] = React.useState<Error | null>(null);
  const [isRecovering, setIsRecovering] = React.useState(false);

  const handleError = React.useCallback((error: Error, errorInfo?: any) => {
    const context: ErrorContext = {
      component: options.component || 'Unknown',
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      stack: error.stack,
      props: errorInfo,
    };

    setError(error);
    setIsRecovering(true);

    const recovered = errorRecoverySystem.handleError(error, context, options);
    
    if (recovered) {
      setTimeout(() => {
        setError(null);
        setIsRecovering(false);
      }, options.retryDelay || 1000);
    } else {
      setIsRecovering(false);
    }
  }, [options]);

  const retry = React.useCallback(() => {
    setError(null);
    setIsRecovering(false);
  }, []);

  return { error, isRecovering, handleError, retry };
}

// React Error Boundary Component
export class ErrorBoundary extends React.Component<
  {
    children: React.ReactNode;
    fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const context: ErrorContext = {
      component: 'ErrorBoundary',
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      stack: error.stack,
      props: errorInfo,
    };

    errorRecoverySystem.handleError(error, context);

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  retry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} retry={this.retry} />;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 max-w-md">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-4">
              {this.state.error.message}
            </p>
            <button
              onClick={this.retry}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
            >
              🔄 Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              🔄 Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Global error recovery system instance
export const errorRecoverySystem = new ErrorRecoverySystem();

// Export React for the component
import React from 'react';