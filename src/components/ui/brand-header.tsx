import React from "react";
import { cn } from "@/lib/utils";

interface BrandHeaderProps {
  className?: string;
  showTagline?: boolean;
  showCopyright?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "light" | "dark";
}

const BrandHeader: React.FC<BrandHeaderProps> = ({
  className,
  showTagline = false,
  showCopyright = false,
  size = "md",
  variant = "default",
}) => {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-4xl",
  };

  const variantClasses = {
    default: "text-reyada-primary",
    light: "text-white",
    dark: "text-reyada-neutral-900",
  };

  const taglineClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg",
  };

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="flex items-center gap-3">
        {/* Arabic Logo Text */}
        <div
          className={cn(
            "font-arabic font-bold tracking-wide",
            sizeClasses[size],
            variantClasses[variant],
          )}
          style={{
            fontWeight: 700,
            letterSpacing: "0.02em",
          }}
        >
          ريادة
        </div>

        {/* Separator */}
        <div
          className={cn(
            "w-px bg-current opacity-30",
            size === "sm"
              ? "h-4"
              : size === "md"
                ? "h-6"
                : size === "lg"
                  ? "h-8"
                  : "h-10",
            variantClasses[variant],
          )}
        />

        {/* English Brand Name */}
        <div
          className={cn(
            "font-english font-bold tracking-tight",
            sizeClasses[size],
            variantClasses[variant],
          )}
          style={{
            fontWeight: 600,
          }}
        >
          Reyada
        </div>
      </div>

      {showTagline && (
        <div
          className={cn(
            "mt-1 opacity-75 text-center font-medium font-english",
            taglineClasses[size],
            variantClasses[variant],
          )}
        >
          Homecare Platform
        </div>
      )}

      {showCopyright && (
        <div
          className={cn(
            "mt-2 opacity-60 text-center font-english",
            size === "sm" ? "text-2xs" : "text-xs",
            variantClasses[variant],
          )}
        >
          © 2024 Reyada Home Health Care Services L.L.C.
        </div>
      )}

      {/* Subtle brand accent */}
      <div className="mt-2 flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-reyada-primary opacity-60" />
        <div className="w-1 h-1 rounded-full bg-reyada-secondary opacity-40" />
        <div className="w-1 h-1 rounded-full bg-reyada-accent opacity-30" />
      </div>
    </div>
  );
};

export default BrandHeader;
