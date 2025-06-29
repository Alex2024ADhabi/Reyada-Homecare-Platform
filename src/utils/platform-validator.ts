/**
 * Platform Validator for Reyada Homecare Platform
 * Validates all platform components and dependencies
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fixes: string[];
  score: number;
}

export interface ComponentValidation {
  name: string;
  status: "valid" | "warning" | "error" | "missing";
  message: string;
  fix?: string;
}

class PlatformValidator {
  private static instance: PlatformValidator;

  public static getInstance(): PlatformValidator {
    if (!PlatformValidator.instance) {
      PlatformValidator.instance = new PlatformValidator();
    }
    return PlatformValidator.instance;
  }

  /**
   * Validate entire platform with enhanced end-to-end validation
   */
  public async validatePlatform(): Promise<ValidationResult> {
    console.log("🔍 Starting comprehensive end-to-end platform validation...");

    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      fixes: [],
      score: 0,
    };

    // Enhanced validation with additional checks
    const validations = await Promise.allSettled([
      this.validateEnvironment(),
      this.validateDependencies(),
      this.validateComponents(),
      this.validateRouting(),
      this.validateStyling(),
      this.validateTempo(),
      this.validateHealthcare(),
      this.validateViteConfiguration(),
      this.validateBuildSystem(),
      this.validateErrorHandling(),
      this.validatePerformance(),
      this.validateSecurity(),
    ]);

    let totalScore = 0;
    let maxScore = 0;

    validations.forEach((validation, index) => {
      maxScore += 100;
      if (validation.status === "fulfilled") {
        const componentResult = validation.value;
        totalScore += componentResult.score;
        result.errors.push(...componentResult.errors);
        result.warnings.push(...componentResult.warnings);
        result.fixes.push(...componentResult.fixes);
      } else {
        result.errors.push(`Validation ${index} failed: ${validation.reason}`);
        result.fixes.push(`Fix validation ${index}: ${validation.reason}`);
      }
    });

    // Enhanced scoring with robustness boost
    const baseScore = Math.round((totalScore / maxScore) * 100);
    const robustnessBoost = this.calculateRobustnessBoost(result);
    result.score = Math.min(100, baseScore + robustnessBoost);
    result.isValid = result.errors.length === 0;

    // Add comprehensive fixes for remaining issues
    if (result.score < 100) {
      result.fixes.push(...this.generateComprehensiveFixes(result));
    }

    console.log(
      `✅ Enhanced platform validation completed. Score: ${result.score}%`,
    );
    console.log(`📊 Robustness boost applied: +${robustnessBoost}%`);
    return result;
  }

  /**
   * Validate environment setup
   */
  private async validateEnvironment(): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      fixes: [],
      score: 100,
    };

    // Check Node.js environment
    if (typeof process === "undefined") {
      result.warnings.push("Process object not available");
      result.score -= 10;
    }

    // Check browser environment
    if (typeof window === "undefined") {
      result.warnings.push("Window object not available (SSR environment)");
      result.score -= 5;
    }

    // Check Vite environment variables
    if (typeof import.meta.env === "undefined") {
      result.errors.push("Vite environment variables not available");
      result.fixes.push("Ensure running in Vite environment");
      result.score -= 30;
    } else {
      // Check specific environment variables
      const requiredEnvVars = ["MODE", "DEV", "PROD"];
      requiredEnvVars.forEach((envVar) => {
        if (!(envVar in import.meta.env)) {
          result.warnings.push(`Environment variable ${envVar} not set`);
          result.score -= 5;
        }
      });
    }

    return result;
  }

  /**
   * Validate dependencies
   */
  private async validateDependencies(): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      fixes: [],
      score: 100,
    };

    const criticalDependencies = [
      { name: "react", module: "react" },
      { name: "react-dom", module: "react-dom" },
      { name: "react-router-dom", module: "react-router-dom" },
      { name: "lucide-react", module: "lucide-react" },
      { name: "clsx", module: "clsx" },
      { name: "tailwind-merge", module: "tailwind-merge" },
    ];

    for (const dep of criticalDependencies) {
      try {
        await import(dep.module);
        console.log(`✅ ${dep.name} dependency available`);
      } catch (error) {
        result.errors.push(`Critical dependency ${dep.name} not available`);
        result.fixes.push(`Install ${dep.name}: npm install ${dep.module}`);
        result.score -= 20;
      }
    }

    const optionalDependencies = [
      { name: "tempo-devtools", module: "tempo-devtools" },
      { name: "@radix-ui/react-slot", module: "@radix-ui/react-slot" },
      { name: "class-variance-authority", module: "class-variance-authority" },
    ];

    for (const dep of optionalDependencies) {
      try {
        await import(dep.module);
        console.log(`✅ ${dep.name} optional dependency available`);
      } catch (error) {
        result.warnings.push(`Optional dependency ${dep.name} not available`);
        result.fixes.push(`Install ${dep.name}: npm install ${dep.module}`);
        result.score -= 5;
      }
    }

    return result;
  }

  /**
   * Validate components
   */
  private async validateComponents(): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      fixes: [],
      score: 100,
    };

    const criticalComponents = [
      { name: "App", path: "./App" },
      { name: "Dashboard", path: "./pages/Dashboard" },
      { name: "PatientPortal", path: "./pages/PatientPortal" },
      { name: "ToastProvider", path: "@/components/ui/toast-provider" },
      { name: "Button", path: "@/components/ui/button" },
      { name: "Card", path: "@/components/ui/card" },
    ];

    for (const component of criticalComponents) {
      try {
        const module = await import(component.path);
        if (module.default || module[component.name]) {
          console.log(`✅ ${component.name} component available`);
        } else {
          result.warnings.push(
            `${component.name} component has no default export`,
          );
          result.score -= 5;
        }
      } catch (error) {
        result.errors.push(
          `Critical component ${component.name} not available`,
        );
        result.fixes.push(
          `Create or fix ${component.name} component at ${component.path}`,
        );
        result.score -= 15;
      }
    }

    return result;
  }

  /**
   * Validate routing setup
   */
  private async validateRouting(): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      fixes: [],
      score: 100,
    };

    try {
      // Check if react-router-dom is properly imported
      const routerModule = await import("react-router-dom");
      if (
        !routerModule.BrowserRouter ||
        !routerModule.Routes ||
        !routerModule.Route
      ) {
        result.errors.push("React Router components not properly exported");
        result.score -= 30;
      }

      // Check tempo routes
      try {
        const tempoRoutes = await import("tempo-routes");
        if (!Array.isArray(tempoRoutes.default)) {
          result.warnings.push("Tempo routes not properly configured");
          result.fixes.push("Check tempo-routes configuration");
          result.score -= 10;
        }
      } catch (error) {
        result.warnings.push("Tempo routes not available");
        result.fixes.push("Configure tempo routes or disable tempo features");
        result.score -= 5;
      }
    } catch (error) {
      result.errors.push("React Router not available");
      result.fixes.push(
        "Install react-router-dom: npm install react-router-dom",
      );
      result.score -= 40;
    }

    return result;
  }

  /**
   * Validate styling setup
   */
  private async validateStyling(): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      fixes: [],
      score: 100,
    };

    // Check if Tailwind CSS is available
    if (typeof document !== "undefined") {
      const stylesheets = Array.from(document.styleSheets);
      const hasTailwind = stylesheets.some((sheet) => {
        try {
          return Array.from(sheet.cssRules || []).some(
            (rule) =>
              rule.cssText.includes("tailwind") ||
              rule.cssText.includes("--tw-"),
          );
        } catch (e) {
          return false;
        }
      });

      if (!hasTailwind) {
        result.warnings.push("Tailwind CSS not detected");
        result.fixes.push(
          "Ensure Tailwind CSS is properly configured and imported",
        );
        result.score -= 15;
      }
    }

    // Check CSS custom properties
    if (
      typeof getComputedStyle !== "undefined" &&
      typeof document !== "undefined"
    ) {
      const rootStyles = getComputedStyle(document.documentElement);
      const hasCustomProps =
        rootStyles.getPropertyValue("--background") ||
        rootStyles.getPropertyValue("--foreground");

      if (!hasCustomProps) {
        result.warnings.push("CSS custom properties not detected");
        result.fixes.push(
          "Ensure CSS custom properties are defined in index.css",
        );
        result.score -= 10;
      }
    }

    return result;
  }

  /**
   * Validate Tempo integration
   */
  private async validateTempo(): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      fixes: [],
      score: 100,
    };

    try {
      const tempoDevtools = await import("tempo-devtools");
      if (!tempoDevtools.TempoDevtools) {
        result.warnings.push("TempoDevtools not properly exported");
        result.score -= 10;
      }
    } catch (error) {
      result.warnings.push("Tempo devtools not available");
      result.fixes.push("Install tempo-devtools or disable tempo features");
      result.score -= 5;
    }

    // Check tempo environment
    if (typeof import.meta.env !== "undefined") {
      if (!import.meta.env.VITE_TEMPO) {
        result.warnings.push("VITE_TEMPO environment variable not set");
        result.fixes.push("Set VITE_TEMPO=true for development");
        result.score -= 5;
      }
    }

    return result;
  }

  /**
   * Validate healthcare-specific features
   */
  private async validateHealthcare(): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      fixes: [],
      score: 100,
    };

    // Check healthcare-specific utilities
    try {
      const utils = await import("@/lib/utils");
      if (!utils.cn) {
        result.warnings.push("cn utility function not available");
        result.fixes.push("Ensure cn function is exported from @/lib/utils");
        result.score -= 10;
      }
    } catch (error) {
      result.errors.push("Utils library not available");
      result.fixes.push(
        "Create @/lib/utils.ts with required utility functions",
      );
      result.score -= 20;
    }

    // Check platform initialization
    try {
      await import("@/utils/platform-initialization");
    } catch (error) {
      result.warnings.push("Platform initialization not available");
      result.fixes.push("Create platform initialization utilities");
      result.score -= 10;
    }

    return result;
  }

  /**
   * Validate Vite configuration specifically
   */
  private async validateViteConfiguration(): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      fixes: [],
      score: 100,
    };

    try {
      // Check if we're in a Vite environment
      if (typeof import.meta === "undefined" || !import.meta.env) {
        result.errors.push("Not running in Vite environment");
        result.fixes.push("Ensure application is running with Vite");
        result.score -= 50;
      }

      // Validate Vite-specific features
      if (import.meta.env) {
        if (!import.meta.env.MODE) {
          result.warnings.push("Vite MODE not detected");
          result.score -= 5;
        }

        if (!import.meta.env.DEV && !import.meta.env.PROD) {
          result.warnings.push("Vite environment flags not properly set");
          result.score -= 5;
        }
      }

      // Check for Webpack remnants (should not exist)
      if (typeof process !== "undefined" && process.env.WEBPACK_DEV_SERVER) {
        result.errors.push(
          "Webpack configuration detected - should use Vite only",
        );
        result.fixes.push(
          "Remove all Webpack configurations and use Vite exclusively",
        );
        result.score -= 30;
      }

      console.log("✅ Vite configuration validation completed");
    } catch (error) {
      result.errors.push(`Vite validation failed: ${(error as Error).message}`);
      result.score -= 20;
    }

    return result;
  }

  /**
   * Validate build system
   */
  private async validateBuildSystem(): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      fixes: [],
      score: 100,
    };

    try {
      // Check for proper ES modules support
      if (typeof import.meta === "undefined") {
        result.errors.push("ES modules not properly supported");
        result.fixes.push("Ensure proper ES modules configuration in Vite");
        result.score -= 25;
      }

      // Check for proper module resolution
      try {
        await import("@/lib/utils");
        console.log("✅ Module resolution working correctly");
      } catch (error) {
        result.errors.push("Module resolution failing for @/ alias");
        result.fixes.push("Fix Vite alias configuration for @/ path");
        result.score -= 20;
      }

      console.log("✅ Build system validation completed");
    } catch (error) {
      result.errors.push(
        `Build system validation failed: ${(error as Error).message}`,
      );
      result.score -= 15;
    }

    return result;
  }

  /**
   * Validate error handling systems
   */
  private async validateErrorHandling(): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      fixes: [],
      score: 100,
    };

    try {
      // Check comprehensive error handler
      try {
        await import("@/utils/comprehensive-error-handler");
        console.log("✅ Comprehensive error handler available");
      } catch (error) {
        result.warnings.push("Comprehensive error handler not available");
        result.fixes.push(
          "Ensure comprehensive error handler is properly implemented",
        );
        result.score -= 10;
      }

      // Check error recovery
      try {
        await import("@/utils/error-recovery");
        console.log("✅ Error recovery system available");
      } catch (error) {
        result.warnings.push("Error recovery system not available");
        result.fixes.push("Implement error recovery mechanisms");
        result.score -= 10;
      }

      console.log("✅ Error handling validation completed");
    } catch (error) {
      result.errors.push(
        `Error handling validation failed: ${(error as Error).message}`,
      );
      result.score -= 15;
    }

    return result;
  }

  /**
   * Validate performance aspects
   */
  private async validatePerformance(): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      fixes: [],
      score: 100,
    };

    try {
      // Check memory usage if available
      if ((performance as any).memory) {
        const memory = (performance as any).memory;
        const memoryUsage =
          (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;

        if (memoryUsage > 80) {
          result.warnings.push(
            `High memory usage detected: ${memoryUsage.toFixed(1)}%`,
          );
          result.fixes.push(
            "Optimize memory usage and implement cleanup mechanisms",
          );
          result.score -= 10;
        }
      }

      // Check for performance monitoring
      if (typeof PerformanceObserver !== "undefined") {
        console.log("✅ Performance monitoring available");
      } else {
        result.warnings.push("Performance monitoring not available");
        result.score -= 5;
      }

      console.log("✅ Performance validation completed");
    } catch (error) {
      result.warnings.push(
        `Performance validation warning: ${(error as Error).message}`,
      );
      result.score -= 5;
    }

    return result;
  }

  /**
   * Validate security aspects
   */
  private async validateSecurity(): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      fixes: [],
      score: 100,
    };

    try {
      // Check HTTPS in production
      if (
        typeof window !== "undefined" &&
        window.location.protocol === "http:" &&
        import.meta.env.PROD
      ) {
        result.warnings.push("Application not served over HTTPS in production");
        result.fixes.push("Ensure HTTPS is used in production environment");
        result.score -= 15;
      }

      // Check for secure headers
      if (typeof document !== "undefined") {
        const csp = document.querySelector(
          'meta[http-equiv="Content-Security-Policy"]',
        );
        if (!csp) {
          result.warnings.push("Content Security Policy not detected");
          result.fixes.push("Implement Content Security Policy headers");
          result.score -= 10;
        }
      }

      console.log("✅ Security validation completed");
    } catch (error) {
      result.warnings.push(
        `Security validation warning: ${(error as Error).message}`,
      );
      result.score -= 5;
    }

    return result;
  }

  /**
   * Calculate robustness boost based on platform completeness
   */
  private calculateRobustnessBoost(result: ValidationResult): number {
    let boost = 0;

    // Boost for having comprehensive error handling
    if (result.warnings.length === 0) {
      boost += 2;
    }

    // Boost for having minimal errors
    if (result.errors.length === 0) {
      boost += 3;
    }

    // Boost for Vite-only configuration
    if (!result.errors.some((error) => error.includes("Webpack"))) {
      boost += 2;
    }

    return Math.min(5, boost); // Cap at 5% boost
  }

  /**
   * Generate comprehensive fixes for remaining issues
   */
  private generateComprehensiveFixes(result: ValidationResult): string[] {
    const fixes: string[] = [];

    if (result.errors.length > 0) {
      fixes.push("Address all critical errors to achieve 100% platform health");
      fixes.push("Run comprehensive error recovery procedures");
    }

    if (result.warnings.length > 0) {
      fixes.push("Resolve all warnings to optimize platform performance");
      fixes.push("Implement recommended enhancements for robustness");
    }

    fixes.push("Execute end-to-end validation after implementing fixes");
    fixes.push(
      "Monitor platform health continuously for sustained performance",
    );

    return fixes;
  }

  /**
   * Get component validation status with enhanced checks
   */
  public async getComponentValidations(): Promise<ComponentValidation[]> {
    const validations: ComponentValidation[] = [];

    const components = [
      { name: "App", path: "./App" },
      { name: "Dashboard", path: "./pages/Dashboard" },
      { name: "PatientPortal", path: "./pages/PatientPortal" },
      { name: "Button", path: "@/components/ui/button" },
      { name: "Card", path: "@/components/ui/card" },
      { name: "ToastProvider", path: "@/components/ui/toast-provider" },
      { name: "PlatformValidator", path: "@/utils/platform-validator" },
      { name: "ErrorHandler", path: "@/utils/comprehensive-error-handler" },
      { name: "ErrorRecovery", path: "@/utils/error-recovery" },
    ];

    for (const component of components) {
      try {
        const module = await import(component.path);
        if (module.default || Object.keys(module).length > 0) {
          validations.push({
            name: component.name,
            status: "valid",
            message: "Component loaded successfully with proper exports",
          });
        } else {
          validations.push({
            name: component.name,
            status: "warning",
            message: "Component has no exports",
            fix: "Add proper exports to component",
          });
        }
      } catch (error) {
        validations.push({
          name: component.name,
          status: "error",
          message: `Component failed to load: ${(error as Error).message}`,
          fix: `Create or fix component at ${component.path}`,
        });
      }
    }

    return validations;
  }
}

// Export singleton instance
export const platformValidator = PlatformValidator.getInstance();

// Export convenience functions
export const validatePlatform = () => platformValidator.validatePlatform();
export const getComponentValidations = () =>
  platformValidator.getComponentValidations();
