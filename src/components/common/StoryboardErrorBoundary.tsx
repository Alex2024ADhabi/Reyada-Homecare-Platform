import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

/**
 * Comprehensive Error Boundary for Storyboard Loading
 * Provides fallback UI and recovery mechanisms for failed storyboards
 */
export class StoryboardErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Storyboard Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error for monitoring
    this.logError(error, errorInfo);
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    // Log to console for development
    console.group('🚨 Storyboard Error Details');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();

    // In production, you would send this to your error monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error monitoring service
      // errorMonitoringService.captureException(error, { extra: errorInfo });
    }
  };

  private handleRetry = () => {
    const { retryCount } = this.state;
    
    if (retryCount < 3) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: retryCount + 1
      });

      // Auto-retry with exponential backoff
      this.retryTimeoutId = setTimeout(() => {
        window.location.reload();
      }, Math.pow(2, retryCount) * 1000);
    }
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReportBug = () => {
    const { error, errorInfo } = this.state;
    const bugReport = {
      error: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };

    // Copy to clipboard for easy reporting
    navigator.clipboard.writeText(JSON.stringify(bugReport, null, 2));
    alert('Bug report copied to clipboard. Please share with the development team.');
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, retryCount } = this.state;
      const canRetry = retryCount < 3;

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-6 flex items-center justify-center">
          <Card className="max-w-2xl w-full border-2 border-red-200">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-16 w-16 text-red-500" />
              </div>
              <CardTitle className="text-2xl text-red-700">
                Storyboard Loading Error
              </CardTitle>
              <CardDescription className="text-lg">
                We encountered an issue loading this storyboard component
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error Details</AlertTitle>
                <AlertDescription className="mt-2">
                  <div className="font-mono text-sm bg-red-100 p-3 rounded border">
                    {error?.message || 'Unknown error occurred'}
                  </div>
                  {retryCount > 0 && (
                    <div className="mt-2 text-sm text-red-600">
                      Retry attempts: {retryCount}/3
                    </div>
                  )}
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={this.handleRetry}
                  disabled={!canRetry}
                  className="flex items-center space-x-2"
                  variant={canRetry ? "default" : "secondary"}
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>{canRetry ? 'Retry Loading' : 'Max Retries Reached'}</span>
                </Button>

                <Button 
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Home className="h-4 w-4" />
                  <span>Go to Dashboard</span>
                </Button>

                <Button 
                  onClick={this.handleReportBug}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Bug className="h-4 w-4" />
                  <span>Report Bug</span>
                </Button>
              </div>

              <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded">
                <h4 className="font-semibold mb-2">Troubleshooting Tips:</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Check your internet connection</li>
                  <li>Clear browser cache and cookies</li>
                  <li>Try refreshing the page</li>
                  <li>Contact support if the issue persists</li>
                </ul>
              </div>

              <div className="text-xs text-gray-500 text-center border-t pt-4">
                <p>Reyada Homecare Platform - Storyboard Error Recovery System</p>
                <p>Error ID: {Date.now().toString(36)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component to wrap storyboards with error boundary
 */
export function withStoryboardErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <StoryboardErrorBoundary fallback={fallback}>
        <Component {...props} />
      </StoryboardErrorBoundary>
    );
  };
}

/**
 * Hook for handling storyboard errors in functional components
 */
export function useStoryboardErrorHandler() {
  const handleError = React.useCallback((error: Error, errorInfo?: ErrorInfo) => {
    console.error('Storyboard error handled:', error);
    
    // Log error details
    if (errorInfo) {
      console.error('Component stack:', errorInfo.componentStack);
    }
    
    // In production, send to error monitoring
    if (process.env.NODE_ENV === 'production') {
      // Send to monitoring service
    }
  }, []);

  return { handleError };
}

export default StoryboardErrorBoundary;