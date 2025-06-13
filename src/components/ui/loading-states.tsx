import React from "react";
import { cn } from "@/lib/utils";
import { Loader2, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className,
  text,
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Loader2 className={cn("animate-spin", sizeClasses[size])} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
};

interface SkeletonProps {
  className?: string;
  lines?: number;
  avatar?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  lines = 1,
  avatar = false,
}) => {
  return (
    <div className={cn("animate-pulse", className)}>
      {avatar && (
        <div className="flex items-center space-x-4 mb-4">
          <div className="rounded-full bg-gray-300 h-10 w-10"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      )}
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-4 bg-gray-300 rounded",
              index === lines - 1 ? "w-3/4" : "w-full",
            )}
          ></div>
        ))}
      </div>
    </div>
  );
};

interface ProgressBarProps {
  progress: number;
  className?: string;
  showPercentage?: boolean;
  color?: "blue" | "green" | "yellow" | "red";
  size?: "sm" | "md" | "lg";
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className,
  showPercentage = true,
  color = "blue",
  size = "md",
}) => {
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

  return (
    <div className={cn("w-full", className)}>
      <div className={cn("w-full bg-gray-200 rounded-full", sizeClasses[size])}>
        <div
          className={cn(
            "rounded-full transition-all duration-300 ease-out",
            colorClasses[color],
            sizeClasses[size],
          )}
          style={{ width: `${clampedProgress}%` }}
        ></div>
      </div>
      {showPercentage && (
        <div className="text-sm text-gray-600 mt-1 text-center">
          {clampedProgress.toFixed(0)}%
        </div>
      )}
    </div>
  );
};

interface LoadingCardProps {
  title?: string;
  description?: string;
  progress?: number;
  className?: string;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({
  title = "Loading...",
  description,
  progress,
  className,
}) => {
  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <LoadingSpinner size="lg" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            )}
            {progress !== undefined && (
              <div className="mt-3">
                <ProgressBar progress={progress} />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center",
        className,
      )}
    >
      {icon && <div className="mb-4 text-gray-400">{icon}</div>}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 mb-4 max-w-sm">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} variant="outline">
          {action.label}
        </Button>
      )}
    </div>
  );
};

interface ErrorStateProps {
  title?: string;
  description?: string;
  retry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  description = "An error occurred while loading the data. Please try again.",
  retry,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center",
        className,
      )}
    >
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-4 max-w-sm">{description}</p>
      {retry && (
        <Button
          onClick={retry}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
};

interface SuccessStateProps {
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const SuccessState: React.FC<SuccessStateProps> = ({
  title = "Success!",
  description = "The operation completed successfully.",
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center",
        className,
      )}
    >
      <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-4 max-w-sm">{description}</p>
      {action && (
        <Button onClick={action.onClick} variant="default">
          {action.label}
        </Button>
      )}
    </div>
  );
};

interface AsyncStateProps<T> {
  loading: boolean;
  error: Error | null;
  data: T | null;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  children: (data: T) => React.ReactNode;
  isEmpty?: (data: T) => boolean;
}

export function AsyncState<T>({
  loading,
  error,
  data,
  loadingComponent,
  errorComponent,
  emptyComponent,
  children,
  isEmpty,
}: AsyncStateProps<T>) {
  if (loading) {
    return (
      loadingComponent || (
        <LoadingCard title="Loading data..." description="Please wait" />
      )
    );
  }

  if (error) {
    return (
      errorComponent || (
        <ErrorState title="Failed to load data" description={error.message} />
      )
    );
  }

  if (!data || (isEmpty && isEmpty(data))) {
    return (
      emptyComponent || (
        <EmptyState
          title="No data available"
          description="There is no data to display at the moment."
        />
      )
    );
  }

  return <>{children(data)}</>;
}

// Higher-order component for loading states
export function withLoadingState<P extends object>(
  Component: React.ComponentType<P>,
  loadingProps?: Partial<LoadingCardProps>,
) {
  return function WithLoadingStateComponent(props: P & { loading?: boolean }) {
    if (props.loading) {
      return <LoadingCard {...loadingProps} />;
    }
    return <Component {...props} />;
  };
}

// Hook for managing async states
export function useAsyncState<T>() {
  const [state, setState] = React.useState<{
    loading: boolean;
    error: Error | null;
    data: T | null;
  }>({
    loading: false,
    error: null,
    data: null,
  });

  const execute = React.useCallback(async (asyncFunction: () => Promise<T>) => {
    setState({ loading: true, error: null, data: null });
    try {
      const result = await asyncFunction();
      setState({ loading: false, error: null, data: result });
      return result;
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
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
