/**
 * JSX Error Handler Service
 * Handles JSX-related errors and provides recovery mechanisms
 */

import { JSXValidator } from "@/utils/jsx-validator";

export class JSXErrorHandlerService {
  private static instance: JSXErrorHandlerService;
  private errorLog: Array<{
    timestamp: string;
    error: string;
    component?: string;
    fixed?: boolean;
  }> = [];

  static getInstance(): JSXErrorHandlerService {
    if (!JSXErrorHandlerService.instance) {
      JSXErrorHandlerService.instance = new JSXErrorHandlerService();
    }
    return JSXErrorHandlerService.instance;
  }

  /**
   * Handle JSX parsing errors
   */
  handleJSXError(
    error: Error,
    componentName?: string,
  ): {
    handled: boolean;
    suggestion?: string;
    autoFix?: string;
  } {
    const errorMessage = error.message.toLowerCase();

    // Log the error
    this.errorLog.push({
      timestamp: new Date().toISOString(),
      error: error.message,
      component: componentName,
      fixed: false,
    });

    // Handle specific JSX errors
    if (errorMessage.includes("unexpected token")) {
      return this.handleUnexpectedTokenError(error, componentName);
    }

    if (errorMessage.includes("jsx identifier")) {
      return this.handleJSXIdentifierError(error, componentName);
    }

    if (errorMessage.includes("expected jsx")) {
      return this.handleExpectedJSXError(error, componentName);
    }

    return { handled: false };
  }

  /**
   * Handle "Unexpected token" errors
   */
  private handleUnexpectedTokenError(
    error: Error,
    componentName?: string,
  ): {
    handled: boolean;
    suggestion?: string;
    autoFix?: string;
  } {
    const message = error.message;

    if (message.includes("div")) {
      return {
        handled: true,
        suggestion:
          'JSX element "div" is not properly structured. Check for missing imports or incorrect syntax.',
        autoFix:
          "Ensure React is imported and JSX elements are properly formatted",
      };
    }

    if (message.includes("EnhancedErrorBoundary")) {
      return {
        handled: true,
        suggestion:
          "EnhancedErrorBoundary component is not properly imported or defined.",
        autoFix:
          'Check import statement: import { EnhancedErrorBoundary } from "@/components/ui/enhanced-error-boundary"',
      };
    }

    return {
      handled: true,
      suggestion: "Check JSX syntax, imports, and component structure",
      autoFix:
        "Validate all JSX elements are properly closed and React is imported",
    };
  }

  /**
   * Handle "Expected jsx identifier" errors
   */
  private handleJSXIdentifierError(
    error: Error,
    componentName?: string,
  ): {
    handled: boolean;
    suggestion?: string;
    autoFix?: string;
  } {
    return {
      handled: true,
      suggestion:
        "JSX element name is invalid. Component names must start with uppercase letter.",
      autoFix:
        "Ensure component names start with uppercase and are properly imported",
    };
  }

  /**
   * Handle "Expected JSX" errors
   */
  private handleExpectedJSXError(
    error: Error,
    componentName?: string,
  ): {
    handled: boolean;
    suggestion?: string;
    autoFix?: string;
  } {
    return {
      handled: true,
      suggestion:
        "JSX syntax error. Check for missing closing tags or malformed elements.",
      autoFix:
        "Validate JSX structure and ensure all elements are properly closed",
    };
  }

  /**
   * Validate and fix component code
   */
  validateAndFixComponent(
    code: string,
    componentName: string,
  ): {
    isValid: boolean;
    fixedCode?: string;
    errors: string[];
    warnings: string[];
  } {
    const validation = JSXValidator.validateJSXStructure(code);
    const exportValidation = JSXValidator.validateComponentExport(code);

    let fixedCode = code;

    if (!validation.isValid && validation.correctedCode) {
      fixedCode = validation.correctedCode;
    }

    // Apply additional fixes
    fixedCode = JSXValidator.fixCommonJSXIssues(fixedCode);

    return {
      isValid: validation.isValid && exportValidation.errors.length === 0,
      fixedCode: fixedCode !== code ? fixedCode : undefined,
      errors: [...validation.errors, ...exportValidation.errors],
      warnings: validation.warnings,
    };
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    totalErrors: number;
    recentErrors: number;
    commonErrors: Record<string, number>;
    fixedErrors: number;
  } {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const recentErrors = this.errorLog.filter(
      (log) => new Date(log.timestamp) > oneHourAgo,
    ).length;

    const commonErrors: Record<string, number> = {};
    this.errorLog.forEach((log) => {
      const errorType = this.categorizeError(log.error);
      commonErrors[errorType] = (commonErrors[errorType] || 0) + 1;
    });

    const fixedErrors = this.errorLog.filter((log) => log.fixed).length;

    return {
      totalErrors: this.errorLog.length,
      recentErrors,
      commonErrors,
      fixedErrors,
    };
  }

  /**
   * Categorize error types
   */
  private categorizeError(errorMessage: string): string {
    const message = errorMessage.toLowerCase();

    if (message.includes("unexpected token")) return "Unexpected Token";
    if (message.includes("jsx identifier")) return "JSX Identifier";
    if (message.includes("expected jsx")) return "Expected JSX";
    if (message.includes("import")) return "Import Error";
    if (message.includes("export")) return "Export Error";

    return "Other";
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * Get recent errors
   */
  getRecentErrors(limit: number = 10): Array<{
    timestamp: string;
    error: string;
    component?: string;
    fixed?: boolean;
  }> {
    return this.errorLog
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(0, limit);
  }

  /**
   * Mark error as fixed
   */
  markErrorAsFixed(timestamp: string): void {
    const errorIndex = this.errorLog.findIndex(
      (log) => log.timestamp === timestamp,
    );
    if (errorIndex !== -1) {
      this.errorLog[errorIndex].fixed = true;
    }
  }

  /**
   * Generate component health report
   */
  generateHealthReport(): {
    status: "healthy" | "warning" | "critical";
    score: number;
    issues: string[];
    recommendations: string[];
  } {
    const stats = this.getErrorStats();
    const issues: string[] = [];
    const recommendations: string[] = [];

    let score = 100;

    // Deduct points for errors
    score -= Math.min(stats.totalErrors * 2, 50);
    score -= Math.min(stats.recentErrors * 5, 30);

    // Add points for fixed errors
    score += Math.min(stats.fixedErrors, 20);

    // Determine status
    let status: "healthy" | "warning" | "critical";
    if (score >= 80) {
      status = "healthy";
    } else if (score >= 60) {
      status = "warning";
      issues.push("Multiple JSX errors detected");
      recommendations.push("Review component structure and imports");
    } else {
      status = "critical";
      issues.push("Critical JSX parsing issues");
      recommendations.push("Immediate attention required for JSX syntax");
    }

    // Add specific recommendations based on common errors
    Object.entries(stats.commonErrors).forEach(([errorType, count]) => {
      if (count > 3) {
        issues.push(`Frequent ${errorType} errors (${count} occurrences)`);
        recommendations.push(`Focus on fixing ${errorType} issues`);
      }
    });

    return {
      status,
      score: Math.max(0, Math.min(100, score)),
      issues,
      recommendations,
    };
  }
}

export const jsxErrorHandler = JSXErrorHandlerService.getInstance();
export default jsxErrorHandler;
