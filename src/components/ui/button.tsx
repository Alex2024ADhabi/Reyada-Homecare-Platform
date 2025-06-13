import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        "compliance-validate":
          "bg-blue-600 text-white shadow hover:bg-blue-700 focus:ring-blue-500",
        "compliance-remediate":
          "bg-orange-600 text-white shadow hover:bg-orange-700 focus:ring-orange-500",
        "compliance-authorize":
          "bg-purple-600 text-white shadow hover:bg-purple-700 focus:ring-purple-500",
        "compliance-submit":
          "bg-emerald-600 text-white shadow hover:bg-emerald-700 focus:ring-emerald-500",
        "compliance-review":
          "bg-indigo-600 text-white shadow hover:bg-indigo-700 focus:ring-indigo-500",
        "doh-critical":
          "bg-red-600 text-white shadow hover:bg-red-700 focus:ring-red-500 animate-pulse",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  complianceAction?:
    | "validate"
    | "remediate"
    | "authorize"
    | "submit"
    | "review";
  confirmationRequired?: boolean;
  confirmationMessage?: string;
  validationInProgress?: boolean;
  accessibilityLabel?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      complianceAction,
      confirmationRequired = false,
      confirmationMessage,
      validationInProgress = false,
      accessibilityLabel,
      children,
      onClick,
      ...props
    },
    ref,
  ) => {
    const [showConfirmation, setShowConfirmation] = React.useState(false);

    const getComplianceVariant = () => {
      if (complianceAction) {
        return `compliance-${complianceAction}` as const;
      }
      return variant;
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (confirmationRequired && !showConfirmation) {
        e.preventDefault();
        setShowConfirmation(true);
        return;
      }

      if (onClick) {
        onClick(e);
      }

      if (showConfirmation) {
        setShowConfirmation(false);
      }
    };

    const Comp = asChild ? Slot : "button";
    const isLoading = loading || validationInProgress;

    return (
      <>
        <Comp
          className={cn(
            buttonVariants({ variant: getComplianceVariant(), size }),
            isLoading && "cursor-not-allowed",
            className,
          )}
          ref={ref}
          disabled={isLoading || props.disabled}
          onClick={handleClick}
          aria-label={
            accessibilityLabel ||
            (typeof children === "string" ? children : undefined)
          }
          data-compliance-action={complianceAction}
          data-validation-in-progress={validationInProgress}
          {...props}
        >
          {isLoading && (
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          )}
          {children}
        </Comp>

        {showConfirmation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-2">Confirm Action</h3>
              <p className="text-gray-600 mb-4">
                {confirmationMessage ||
                  "Are you sure you want to proceed with this action?"}
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                  onClick={() => setShowConfirmation(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded"
                  onClick={handleClick}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
