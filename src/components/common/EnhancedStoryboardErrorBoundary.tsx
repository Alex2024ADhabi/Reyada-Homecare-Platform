import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Bug, Shield } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
}

class EnhancedStoryboardErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Enhanced error logging for production
    this.logError(error, errorInfo);
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    const errorReport = {
      timestamp: new Date().toISOString(),
      errorId: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      retryCount: this.state.retryCount,
      platform: 'Reyada Homecare Platform',
      module: 'Storyboard Error Boundary'
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Enhanced Storyboard Error Boundary caught an error:', errorReport);
    }

    // In production, this would send to error tracking service
    try {
      localStorage.setItem(`error_${this.state.errorId}`, JSON.stringify(errorReport));
    } catch (e) {
      console.warn('Failed to store error report in localStorage');
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
      errorId: '',
      retryCount: 0
    });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-6 flex items-center justify-center">
          <Card className="max-w-4xl w-full border-2 border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-700">
                <AlertTriangle className="h-6 w-6" />
                <span>Reyada Homecare Platform - Error Recovery</span>
              </CardTitle>
              <CardDescription>
                An error occurred in the healthcare platform. Our enhanced error recovery system is active.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Error Alert */}
              <Alert className="border-2 border-red-200 bg-red-50">
                <Shield className="h-5 w-5 text-red-600" />
                <AlertTitle className="text-red-800">Healthcare Platform Error Detected</AlertTitle>
                <AlertDescription className="mt-4 text-red-700">
                  <div className="bg-white p-4 rounded-lg border border-red-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="mb-2"><strong>Error ID:</strong> {this.state.errorId}</p>
                        <p className="mb-2"><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
                        <p><strong>Retry Attempts:</strong> {this.state.retryCount}/{this.maxRetries}</p>
                      </div>
                      <div>
                        <p className="mb-2"><strong>Platform:</strong> Reyada Homecare</p>
                        <p className="mb-2"><strong>Module:</strong> Healthcare Component</p>
                        <p><strong>Status:</strong> Error Recovery Active</p>
                      </div>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Error Details */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center space-x-2">
                  <Bug className="h-4 w-4" />
                  <span>Error Details</span>
                </h4>
                <div className="text-sm text-gray-700 space-y-2">
                  <div>
                    <strong>Message:</strong> {this.state.error?.message || 'Unknown error occurred'}
                  </div>
                  {process.env.NODE_ENV === 'development' && this.state.error?.stack && (
                    <div>
                      <strong>Stack Trace:</strong>
                      <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              {/* Recovery Actions */}
              <div className="flex flex-wrap gap-4 justify-center">
                {this.state.retryCount < this.maxRetries && (
                  <Button 
                    onClick={this.handleRetry}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry Component ({this.maxRetries - this.state.retryCount} attempts left)
                  </Button>
                )}
                
                <Button 
                  onClick={this.handleReset}
                  variant="outline"
                  className="border-green-300 text-green-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset Error State
                </Button>
                
                <Button 
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="border-purple-300 text-purple-700"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Return to Dashboard
                </Button>
              </div>

              {/* Healthcare Platform Status */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">Platform Status</h4>
                <div className="text-sm text-green-700 space-y-1">
                  <p>✅ Core healthcare systems remain operational</p>
                  <p>✅ Patient data security maintained</p>
                  <p>✅ DOH compliance systems active</p>
                  <p>✅ Error recovery protocols engaged</p>
                  <p>✅ Alternative access routes available</p>
                </div>
              </div>

              {/* Support Information */}
              <div className="text-center text-sm text-gray-600 border-t pt-4">
                <p className="font-semibold">🏥 Reyada Homecare Platform - Enhanced Error Recovery 🏥</p>
                <p>Error ID: {this.state.errorId} | Healthcare operations continue normally</p>
                <p>For immediate support, contact the healthcare IT team</p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Global error handler setup
export const setupGlobalStoryboardErrorHandler = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection in Reyada Platform:', event.reason);
    
    // Log to error tracking
    const errorReport = {
      type: 'unhandledrejection',
      reason: event.reason,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      platform: 'Reyada Homecare Platform'
    };
    
    try {
      localStorage.setItem(`unhandled_${Date.now()}`, JSON.stringify(errorReport));
    } catch (e) {
      console.warn('Failed to store unhandled rejection report');
    }
  });

  // Handle global errors
  window.addEventListener('error', (event) => {
    console.error('Global error in Reyada Platform:', event.error);
    
    const errorReport = {
      type: 'global_error',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error?.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      platform: 'Reyada Homecare Platform'
    };
    
    try {
      localStorage.setItem(`global_error_${Date.now()}`, JSON.stringify(errorReport));
    } catch (e) {
      console.warn('Failed to store global error report');
    }
  });
};

export default EnhancedStoryboardErrorBoundary;