import React, { Component, ErrorInfo, ReactNode } from "react";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
  autoRecover?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  recoveryAttempts: number;
  isRecovering: boolean;
}

export class JSXErrorRecovery extends Component<Props, State> {
  private maxRecoveryAttempts = 3;
  private recoveryTimeout: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      recoveryAttempts: 0,
      isRecovering: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `jsx-recovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("JSX Error Recovery caught:", error, errorInfo);

    // Handle JSX-specific errors
    const jsxHandling = jsxErrorHandler.handleJSXError(
      error,
      this.props.componentName,
    );

    this.setState({
      errorInfo,
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Attempt auto-recovery if enabled
    if (
      this.props.autoRecover &&
      this.state.recoveryAttempts < this.maxRecoveryAttempts
    ) {
      this.attemptRecovery();
    }
  }

  private attemptRecovery = () => {
    this.setState({ isRecovering: true });

    this.recoveryTimeout = setTimeout(() => {
      this.setState((prevState) => ({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null,
        recoveryAttempts: prevState.recoveryAttempts + 1,
        isRecovering: false,
      }));
    }, 2000);
  };

  private handleManualRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      recoveryAttempts: 0,
      isRecovering: false,
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  componentWillUnmount() {
    if (this.recoveryTimeout) {
      clearTimeout(this.recoveryTimeout);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.state.isRecovering) {
        return (
          <div className="min-h-32 bg-yellow-50 flex items-center justify-center p-4 border border-yellow-200 rounded-lg">
            <div className="text-center">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                Attempting to recover from JSX error...
              </p>
            </div>
          </div>
        );
      }

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
        <div className="min-h-32 bg-red-50 border border-red-200 rounded-lg p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mb-3">
                {isJSXError ? (
                  <Code className="h-5 w-5 text-red-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                )}
              </div>
              <CardTitle className="text-lg text-red-600">
                {isJSXError ? "JSX Parsing Error" : "Component Error"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Error ID */}
              {this.state.errorId && (
                <div className="bg-gray-100 p-2 rounded text-xs">
                  <strong>Error ID:</strong> {this.state.errorId}
                  {this.props.componentName && (
                    <div>
                      <strong>Component:</strong> {this.props.componentName}
                    </div>
                  )}
                </div>
              )}

              {/* Recovery Status */}
              {this.state.recoveryAttempts > 0 && (
                <Alert>
                  <Wrench className="h-4 w-4" />
                  <AlertDescription>
                    Recovery attempts: {this.state.recoveryAttempts}/
                    {this.maxRecoveryAttempts}
                  </AlertDescription>
                </Alert>
              )}

              {/* Error Message */}
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {this.state.error?.message || "Unknown JSX error occurred"}
                </AlertDescription>
              </Alert>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={this.handleManualRetry}
                  size="sm"
                  className="flex-1"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry
                </Button>
                <Button
                  variant="outline"
                  onClick={this.handleReload}
                  size="sm"
                  className="flex-1"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Reload
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default JSXErrorRecovery;
