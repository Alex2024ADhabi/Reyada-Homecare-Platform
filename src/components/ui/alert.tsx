import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        "compliance-critical":
          "bg-red-50 border-red-300 text-red-900 [&>svg]:text-red-600 shadow-red-100 ring-1 ring-red-200",
        "compliance-high":
          "bg-orange-50 border-orange-300 text-orange-900 [&>svg]:text-orange-600 shadow-orange-100",
        "compliance-medium":
          "bg-yellow-50 border-yellow-300 text-yellow-900 [&>svg]:text-yellow-600 shadow-yellow-100",
        "compliance-low":
          "bg-blue-50 border-blue-300 text-blue-900 [&>svg]:text-blue-600 shadow-blue-100",
        "doh-requirement":
          "bg-indigo-50 border-indigo-300 text-indigo-900 [&>svg]:text-indigo-600 shadow-indigo-100 border-l-4 border-l-indigo-600",
        "authorization-error":
          "bg-purple-50 border-purple-300 text-purple-900 [&>svg]:text-purple-600 shadow-purple-100",
        "validation-success":
          "bg-emerald-50 border-emerald-300 text-emerald-900 [&>svg]:text-emerald-600 shadow-emerald-100",
        "data-quality":
          "bg-cyan-50 border-cyan-300 text-cyan-900 [&>svg]:text-cyan-600 shadow-cyan-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  severity?: "critical" | "high" | "medium" | "low";
  dohRequirement?: string;
  complianceCode?: string;
  actionRequired?: boolean;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant,
      severity,
      dohRequirement,
      complianceCode,
      actionRequired,
      ...props
    },
    ref,
  ) => {
    const isComplianceAlert =
      variant?.startsWith("compliance-") || variant === "doh-requirement";

    return (
      <div
        ref={ref}
        role="alert"
        aria-live={severity === "critical" ? "assertive" : "polite"}
        data-severity={severity}
        data-doh-requirement={dohRequirement}
        data-compliance-code={complianceCode}
        data-action-required={actionRequired}
        className={cn(
          alertVariants({ variant }),
          isComplianceAlert &&
            "animate-in fade-in-0 slide-in-from-left-1 duration-300",
          severity === "critical" && "animate-pulse",
          className,
        )}
        {...props}
      />
    );
  },
);
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
