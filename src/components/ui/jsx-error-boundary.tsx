import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw, Code, Wrench } from "lucide-react";
import { jsxErrorHandler } from "@/services/jsx-error-handler.service";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  jsxErrorHandled: boolean;
  autoFixSuggestion?: string;
}

export class JSXErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      jsxErrorHandled: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `jsx-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("JSX Error caught by boundary:", error, errorInfo);

    // Handle JSX-specific errors
    const jsxHandling = jsxErrorHandler.handleJSXError(
      error,
      this.props.componentName,
    );

    this.setState({
      errorInfo,
      jsxErrorHandled: jsxHandling.handled,
      autoFixSuggestion: jsxHandling.suggestion,
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      jsxErrorHandled: false,
      autoFixSuggestion: undefined,
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private copyErrorDetails = () => {
    const { error, errorInfo, errorId } = this.state;
    const errorDetails = {
      errorId,
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      componentName: this.props.componentName,
    };

    navigator.clipboard
      .writeText(JSON.stringify(errorDetails, null, 2))
      .then(() => {
        alert("Error details copied to clipboard");
      })
      .catch(() => {
        console.error("Failed to copy error details");
      });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isJSXError =
        this.state.error?.message.toLowerCase().includes("jsx") ||
        this.state.error?.message.toLowerCase().includes("unexpected token") ||
        this.state.error?.message
          .toLowerCase()
          .includes("expected jsx identifier");

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="max-w-3xl w-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                {isJSXError ? (
                  <Code className="h-6 w-6 text-red-600" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                )}
              </div>
              <CardTitle className="text-xl text-red-600">
                {isJSXError ? "JSX Parsing Error" : "Component Error"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Error ID */}
              {this.state.errorId && (
                <div className="bg-gray-100 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Error ID:</strong> {this.state.errorId}
                  </p>
                  {this.props.componentName && (
                    <p className="text-sm text-gray-600">
                      <strong>Component:</strong> {this.props.componentName}
                    </p>
                  )}
                </div>
              )}

              {/* JSX Error Handling */}
              {this.state.jsxErrorHandled && this.state.autoFixSuggestion && (
                <Alert>
                  <Wrench className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Auto-Fix Suggestion:</strong>
                    <br />
                    {this.state.autoFixSuggestion}
                  </AlertDescription>
                </Alert>
              )}

              {/* Error Message */}
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error:</strong> {this.state.error?.message}
                </AlertDescription>
              </Alert>

              {/* JSX-Specific Help */}
              {isJSXError && (
                <Alert>
                  <Code className="h-4 w-4" />
                  <AlertDescription>
                    <strong>JSX Error Help:</strong>
                    <br />
                    This appears to be a JSX parsing error. Common causes
                    include:
                    <ul className="list-disc list-inside mt-2 text-sm">
                      <li>Missing React import</li>
                      <li>
                        Incorrect component naming (must start with uppercase)
                      </li>
                      <li>Malformed JSX elements</li>
                      <li>Missing closing tags</li>
                      <li>Incorrect prop syntax</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Development Error Details */}
              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="bg-red-50 p-3 rounded-lg">
                  <summary className="cursor-pointer text-sm font-medium text-red-800 mb-2">
                    Error Details (Development)
                  </summary>
                  <div className="text-xs text-red-700 space-y-2">
                    <div>
                      <strong>Message:</strong>
                      <pre className="mt-1 whitespace-pre-wrap">
                        {this.state.error.message}
                      </pre>
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <strong>Stack Trace:</strong>
                        <pre className="mt-1 whitespace-pre-wrap text-xs overflow-x-auto max-h-32">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="mt-1 whitespace-pre-wrap text-xs overflow-x-auto max-h-32">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={this.handleRetry} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={this.handleReload}
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Page
                </Button>
                <Button
                  variant="outline"
                  onClick={this.copyErrorDetails}
                  className="flex-1"
                >
                  <Code className="h-4 w-4 mr-2" />
                  Copy Details
                </Button>
              </div>

              {/* Support Information */}
              <div className="text-center text-sm text-gray-500 pt-4 border-t">
                <p>
                  If this JSX error persists, check your component structure and
                  imports. For additional help, contact{" "}
                  <a
                    href="mailto:support@reyada.com"
                    className="text-blue-600 hover:underline"
                  >
                    support@reyada.com
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default JSXErrorBoundary;
