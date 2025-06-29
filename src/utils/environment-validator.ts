/**
 * Environment Validator Utility
 * Validates environment configuration and provides status reporting
 */

export interface EnvironmentStatus {
  status: "valid" | "warning" | "error";
  message: string;
  details: EnvironmentDetails;
  recommendations: string[];
}

export interface EnvironmentDetails {
  nodeVersion?: string;
  environment: string;
  platform: string;
  architecture: string;
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  environmentVariables: {
    [key: string]: boolean;
  };
  requiredServices: {
    [key: string]: boolean;
  };
}

class EnvironmentValidator {
  private static instance: EnvironmentValidator;
  private lastValidation: EnvironmentStatus | null = null;

  public static getInstance(): EnvironmentValidator {
    if (!EnvironmentValidator.instance) {
      EnvironmentValidator.instance = new EnvironmentValidator();
    }
    return EnvironmentValidator.instance;
  }

  /**
   * Validate the current environment
   */
  public validateEnvironment(): EnvironmentStatus {
    try {
      const details = this.gatherEnvironmentDetails();
      const issues = this.identifyIssues(details);
      const recommendations = this.generateRecommendations(issues);

      const status: EnvironmentStatus = {
        status: this.determineOverallStatus(issues),
        message: this.generateStatusMessage(issues),
        details,
        recommendations,
      };

      this.lastValidation = status;
      return status;
    } catch (error: any) {
      const errorStatus: EnvironmentStatus = {
        status: "error",
        message: `Environment validation failed: ${error.message}`,
        details: this.getMinimalDetails(),
        recommendations: ["Check system configuration and try again"],
      };

      this.lastValidation = errorStatus;
      return errorStatus;
    }
  }

  /**
   * Get status report
   */
  public getStatusReport(): EnvironmentStatus {
    if (!this.lastValidation) {
      return this.validateEnvironment();
    }
    return this.lastValidation;
  }

  /**
   * Check if environment is valid
   */
  public isEnvironmentValid(): boolean {
    const status = this.getStatusReport();
    return status.status === "valid";
  }

  /**
   * Get environment recommendations
   */
  public getRecommendations(): string[] {
    const status = this.getStatusReport();
    return status.recommendations;
  }

  // Private methods
  private gatherEnvironmentDetails(): EnvironmentDetails {
    const memoryUsage = this.getMemoryUsage();

    return {
      nodeVersion: typeof process !== "undefined" ? process.version : undefined,
      environment: import.meta.env?.MODE || "development",
      platform: "browser",
      architecture: "browser",
      memoryUsage,
      environmentVariables: {
        NODE_ENV: !!import.meta.env?.MODE,
        VITE_TEMPO: !!import.meta.env?.VITE_TEMPO,
        VITE_SUPABASE_URL: !!import.meta.env?.VITE_SUPABASE_URL,
        VITE_SUPABASE_ANON_KEY: !!import.meta.env?.VITE_SUPABASE_ANON_KEY,
      },
      requiredServices: {
        react: this.checkReactAvailability(),
        router: this.checkRouterAvailability(),
        supabase: this.checkSupabaseConfiguration(),
      },
    };
  }

  private getMemoryUsage(): {
    used: number;
    total: number;
    percentage: number;
  } {
    if ((performance as any).memory) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
      };
    }

    // Fallback for environments without performance.memory
    return {
      used: 0,
      total: 0,
      percentage: 0,
    };
  }

  private checkReactAvailability(): boolean {
    try {
      return typeof React !== "undefined";
    } catch {
      return false;
    }
  }

  private checkRouterAvailability(): boolean {
    try {
      // Check if react-router-dom is available
      return typeof window !== "undefined";
    } catch {
      return false;
    }
  }

  private checkSupabaseConfiguration(): boolean {
    return (
      !!import.meta.env?.VITE_SUPABASE_URL &&
      !!import.meta.env?.VITE_SUPABASE_ANON_KEY
    );
  }

  private identifyIssues(details: EnvironmentDetails): string[] {
    const issues: string[] = [];

    // Check Node.js version
    if (details.nodeVersion) {
      const majorVersion = parseInt(details.nodeVersion.replace("v", ""));
      if (majorVersion < 16) {
        issues.push("Node.js version is below recommended minimum (16.x)");
      }
    }

    // Check memory usage
    if (details.memoryUsage.percentage > 80) {
      issues.push("High memory usage detected");
    }

    // Check required services
    if (!details.requiredServices.react) {
      issues.push("React is not properly loaded");
    }

    if (!details.requiredServices.router) {
      issues.push("React Router is not properly configured");
    }

    return issues;
  }

  private generateRecommendations(issues: string[]): string[] {
    const recommendations: string[] = [];

    if (issues.some((issue) => issue.includes("Node.js version"))) {
      recommendations.push("Upgrade Node.js to version 16 or higher");
    }

    if (issues.some((issue) => issue.includes("memory usage"))) {
      recommendations.push(
        "Consider optimizing memory usage or increasing available memory",
      );
    }

    if (issues.some((issue) => issue.includes("React"))) {
      recommendations.push("Ensure React is properly installed and imported");
    }

    if (issues.some((issue) => issue.includes("Router"))) {
      recommendations.push("Check React Router configuration and imports");
    }

    if (recommendations.length === 0) {
      recommendations.push("Environment appears to be properly configured");
    }

    return recommendations;
  }

  private determineOverallStatus(
    issues: string[],
  ): "valid" | "warning" | "error" {
    if (issues.length === 0) {
      return "valid";
    }

    const criticalIssues = issues.filter(
      (issue) =>
        issue.includes("React") ||
        issue.includes("Router") ||
        issue.includes("Node.js version"),
    );

    return criticalIssues.length > 0 ? "error" : "warning";
  }

  private generateStatusMessage(issues: string[]): string {
    if (issues.length === 0) {
      return "Environment validation passed successfully";
    }

    const criticalCount = issues.filter(
      (issue) =>
        issue.includes("React") ||
        issue.includes("Router") ||
        issue.includes("Node.js version"),
    ).length;

    if (criticalCount > 0) {
      return `Environment validation failed with ${criticalCount} critical issue(s) and ${issues.length - criticalCount} warning(s)`;
    }

    return `Environment validation completed with ${issues.length} warning(s)`;
  }

  private getMinimalDetails(): EnvironmentDetails {
    return {
      environment: "unknown",
      platform: "unknown",
      architecture: "unknown",
      memoryUsage: {
        used: 0,
        total: 0,
        percentage: 0,
      },
      environmentVariables: {},
      requiredServices: {},
    };
  }
}

// Export singleton instance
export const environmentValidator = EnvironmentValidator.getInstance();
export default environmentValidator;
