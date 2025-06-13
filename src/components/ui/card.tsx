import * as React from "react";

import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  complianceSummary?: boolean;
  expandable?: boolean;
  progress?: number;
  complianceLevel?: "critical" | "high" | "medium" | "low" | "passed";
  dohRequirement?: string;
  actionRequired?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      complianceSummary = false,
      expandable = false,
      progress,
      complianceLevel,
      dohRequirement,
      actionRequired = false,
      children,
      ...props
    },
    ref,
  ) => {
    const [isExpanded, setIsExpanded] = React.useState(false);

    const getComplianceBorder = () => {
      if (!complianceLevel) return "";

      const colors = {
        critical: "border-l-4 border-l-red-600",
        high: "border-l-4 border-l-orange-500",
        medium: "border-l-4 border-l-yellow-500",
        low: "border-l-4 border-l-blue-500",
        passed: "border-l-4 border-l-emerald-500",
      };

      return colors[complianceLevel];
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border bg-card text-card-foreground shadow transition-all duration-200",
          complianceSummary && "hover:shadow-lg",
          getComplianceBorder(),
          actionRequired && "ring-2 ring-orange-200 ring-offset-2",
          className,
        )}
        data-compliance-level={complianceLevel}
        data-doh-requirement={dohRequirement}
        data-action-required={actionRequired}
        {...props}
      >
        {/* Progress indicator */}
        {progress !== undefined && (
          <div className="h-1 bg-gray-200 rounded-t-xl overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-300",
                complianceLevel === "critical" && "bg-red-600",
                complianceLevel === "high" && "bg-orange-500",
                complianceLevel === "medium" && "bg-yellow-500",
                complianceLevel === "low" && "bg-blue-500",
                complianceLevel === "passed" && "bg-emerald-500",
                !complianceLevel && "bg-blue-500",
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Expandable toggle */}
        {expandable && (
          <button
            className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            <svg
              className={cn(
                "w-4 h-4 transition-transform",
                isExpanded && "rotate-180",
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        )}

        <div
          className={cn(
            expandable && !isExpanded && "max-h-32 overflow-hidden",
          )}
        >
          {children}
        </div>
      </div>
    );
  },
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
