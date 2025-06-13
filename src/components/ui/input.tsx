import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  dohField?: boolean;
  complianceValidation?: boolean;
  realTimeCheck?: boolean;
  helpText?: string;
  complianceError?: string;
  validationStatus?: "valid" | "invalid" | "pending";
  dohRequirement?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      dohField = false,
      complianceValidation = false,
      realTimeCheck = false,
      helpText,
      complianceError,
      validationStatus,
      dohRequirement,
      ...props
    },
    ref,
  ) => {
    const [isValidating, setIsValidating] = React.useState(false);
    const [localValue, setLocalValue] = React.useState(props.value || "");

    React.useEffect(() => {
      if (realTimeCheck && localValue && complianceValidation) {
        setIsValidating(true);
        const timer = setTimeout(() => {
          setIsValidating(false);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }, [localValue, realTimeCheck, complianceValidation]);

    const getValidationStyles = () => {
      if (complianceError) {
        return "border-red-500 focus-visible:ring-red-500";
      }
      if (validationStatus === "valid") {
        return "border-emerald-500 focus-visible:ring-emerald-500";
      }
      if (validationStatus === "pending" || isValidating) {
        return "border-blue-500 focus-visible:ring-blue-500";
      }
      return "";
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalValue(e.target.value);
      if (props.onChange) {
        props.onChange(e);
      }
    };

    return (
      <div className="space-y-1">
        <div className="relative">
          <input
            type={type}
            className={cn(
              "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
              dohField && "border-l-4 border-l-indigo-500",
              getValidationStyles(),
              className,
            )}
            ref={ref}
            onChange={handleChange}
            data-doh-field={dohField}
            data-doh-requirement={dohRequirement}
            data-compliance-validation={complianceValidation}
            aria-describedby={helpText ? `${props.id}-help` : undefined}
            {...props}
          />

          {/* Validation status indicator */}
          {(validationStatus || isValidating) && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              {isValidating && (
                <svg
                  className="animate-spin h-4 w-4 text-blue-500"
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
              {validationStatus === "valid" && (
                <svg
                  className="h-4 w-4 text-emerald-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
              {validationStatus === "invalid" && (
                <svg
                  className="h-4 w-4 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </div>
          )}
        </div>

        {/* Help text */}
        {helpText && (
          <p id={`${props.id}-help`} className="text-xs text-gray-600">
            {helpText}
          </p>
        )}

        {/* DOH requirement */}
        {dohRequirement && (
          <p className="text-xs text-indigo-600 font-medium">
            DOH Requirement: {dohRequirement}
          </p>
        )}

        {/* Compliance error */}
        {complianceError && (
          <p className="text-xs text-red-600 flex items-center gap-1">
            <svg
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {complianceError}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
