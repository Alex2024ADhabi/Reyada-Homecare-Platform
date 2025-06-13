import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        "compliance-critical":
          "border-red-200 bg-red-100 text-red-800 shadow-red-100 animate-pulse",
        "compliance-high":
          "border-orange-200 bg-orange-100 text-orange-800 shadow-orange-100",
        "compliance-medium":
          "border-yellow-200 bg-yellow-100 text-yellow-800 shadow-yellow-100",
        "compliance-low":
          "border-blue-200 bg-blue-100 text-blue-800 shadow-blue-100",
        "compliance-passed":
          "border-emerald-200 bg-emerald-100 text-emerald-800 shadow-emerald-100",
        "doh-compliant":
          "border-indigo-200 bg-indigo-100 text-indigo-800 shadow-indigo-100",
        "authorization-pending":
          "border-purple-200 bg-purple-100 text-purple-800 shadow-purple-100 animate-bounce",
        "validation-in-progress":
          "border-cyan-200 bg-cyan-100 text-cyan-800 shadow-cyan-100 animate-pulse",
        "real-time-update":
          "border-green-200 bg-green-100 text-green-800 shadow-green-100 animate-ping",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  complianceLevel?: "critical" | "high" | "medium" | "low" | "passed";
  animated?: boolean;
  tooltip?: string;
  statusIcon?: boolean;
  realTimeUpdate?: boolean;
}

function Badge({
  className,
  variant,
  complianceLevel,
  animated = false,
  tooltip,
  statusIcon = false,
  realTimeUpdate = false,
  children,
  ...props
}: BadgeProps) {
  const getComplianceVariant = () => {
    if (complianceLevel) {
      return `compliance-${complianceLevel}` as const;
    }
    return variant;
  };

  const getStatusIcon = () => {
    if (!statusIcon) return null;

    switch (complianceLevel) {
      case "critical":
        return (
          <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
        );
      case "high":
        return <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />;
      case "medium":
        return <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />;
      case "low":
        return <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />;
      case "passed":
        return <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        badgeVariants({ variant: getComplianceVariant() }),
        animated && "animate-bounce",
        realTimeUpdate && "animate-pulse",
        className,
      )}
      title={tooltip}
      data-compliance-level={complianceLevel}
      role="status"
      aria-label={tooltip || `${complianceLevel || variant} status`}
      {...props}
    >
      {getStatusIcon()}
      {statusIcon && children && <span className="ml-1">{children}</span>}
      {!statusIcon && children}
    </div>
  );
}

export { Badge, badgeVariants };
