/**
 * REYADA HOMECARE PLATFORM - COMPREHENSIVE STORYBOARD ERROR RECOVERY SYSTEM
 * Max Mode implementation for robust storyboard loading and error handling
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, FileX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

export class StoryboardErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

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
    console.error('🚨 Storyboard Error Boundary Caught:', error);
    console.error('📍 Error Info:', errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to healthcare error monitoring system
    this.logToHealthcareMonitoring(error, errorInfo);
  }

  private logToHealthcareMonitoring = (error: Error, errorInfo: ErrorInfo) => {
    try {
      // Healthcare-specific error logging
      const errorData = {
        timestamp: new Date().toISOString(),
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        },
        errorInfo: {
          componentStack: errorInfo.componentStack
        },
        platform: 'Reyada Homecare Platform',
        module: 'Storyboard System',
        severity: 'HIGH',
        retryCount: this.state.retryCount
      };

      // Send to monitoring service (implement based on your monitoring setup)
      console.log('📊 Healthcare Error Log:', errorData);
      
      // Store in local storage for offline analysis
      const existingErrors = JSON.parse(localStorage.getItem('reyada-error-logs') || '[]');
      existingErrors.push(errorData);
      localStorage.setItem('reyada-error-logs', JSON.stringify(existingErrors.slice(-50))); // Keep last 50 errors
      
    } catch (loggingError) {
      console.error('❌ Failed to log error:', loggingError);
    }
  };

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }));
    }
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default comprehensive error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl shadow-xl border-red-200">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-red-800">
                🏥 Reyada Homecare Platform
              </CardTitle>
              <CardDescription className="text-lg text-red-600">
                Storyboard Loading Error Detected
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <Alert className="border-red-200 bg-red-50">
                <FileX className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Error:</strong> {this.state.error?.message || 'Unknown storyboard error'}
                </AlertDescription>
              </Alert>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">🔧 Recovery Options:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button
                    onClick={this.handleRetry}
                    disabled={this.state.retryCount >= this.maxRetries}
                    className="flex items-center gap-2"
                    variant="outline"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Retry ({this.state.retryCount}/{this.maxRetries})
                  </Button>
                  
                  <Button
                    onClick={this.handleReset}
                    className="flex items-center gap-2"
                    variant="outline"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reset Component
                  </Button>
                  
                  <Button
                    onClick={this.handleGoHome}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Home className="w-4 h-4" />
                    Go to Dashboard
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">📋 Healthcare Platform Status:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-600">Platform:</span>
                    <span className="ml-2 font-medium">Reyada Homecare v1.0.0</span>
                  </div>
                  <div>
                    <span className="text-blue-600">Module:</span>
                    <span className="ml-2 font-medium">Storyboard System</span>
                  </div>
                  <div>
                    <span className="text-blue-600">Status:</span>
                    <span className="ml-2 font-medium text-red-600">Error Recovery Mode</span>
                  </div>
                  <div>
                    <span className="text-blue-600">Retry Count:</span>
                    <span className="ml-2 font-medium">{this.state.retryCount}/{this.maxRetries}</span>
                  </div>
                </div>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="bg-gray-100 p-4 rounded-lg">
                  <summary className="cursor-pointer font-semibold text-gray-700 mb-2">
                    🔍 Developer Information
                  </summary>
                  <div className="text-xs font-mono bg-white p-3 rounded border overflow-auto max-h-40">
                    <div className="mb-2">
                      <strong>Error Stack:</strong>
                      <pre className="whitespace-pre-wrap">{this.state.error?.stack}</pre>
                    </div>
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                    </div>
                  </div>
                </details>
              )}

              <div className="text-center text-sm text-gray-600">
                <p>If this error persists, please contact the Reyada Healthcare IT Support team.</p>
                <p className="mt-1">Error logged at: {new Date().toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for wrapping storyboards
export const withStoryboardErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  customFallback?: ReactNode
) => {
  const WrappedComponent = (props: P) => (
    <StoryboardErrorBoundary fallback={customFallback}>
      <Component {...props} />
    </StoryboardErrorBoundary>
  );

  WrappedComponent.displayName = `withStoryboardErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Storyboard loading wrapper with dependency pre-resolution
export const StoryboardLoader: React.FC<{
  children: ReactNode;
  dependencies?: string[];
  fallbackComponent?: ReactNode;
}> = ({ children, dependencies = [], fallbackComponent }) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const preloadDependencies = async () => {
      try {
        // Pre-resolve dependencies
        for (const dep of dependencies) {
          try {
            await import(dep);
          } catch (depError) {
            console.warn(`⚠️ Failed to preload dependency: ${dep}`, depError);
          }
        }
        setIsLoading(false);
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : 'Unknown loading error');
        setIsLoading(false);
      }
    };

    preloadDependencies();
  }, [dependencies]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading Reyada Healthcare Component...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <StoryboardErrorBoundary>
        {fallbackComponent || (
          <div className="text-center p-8">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Loading Error</h3>
            <p className="text-red-600">{loadError}</p>
          </div>
        )}
      </StoryboardErrorBoundary>
    );
  }

  return (
    <StoryboardErrorBoundary>
      {children}
    </StoryboardErrorBoundary>
  );
};

export default StoryboardErrorBoundary;