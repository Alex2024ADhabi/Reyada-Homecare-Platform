/**
 * Compliance Engine Service
 * Phase 1: Core Foundation - Basic compliance checking and rule management
 */

import {
  governanceRegulationsAPI,
  ComplianceRule,
  ComplianceCheck,
  ComplianceFramework,
  ComplianceCondition,
  ComplianceAction,
} from "@/api/governance-regulations.api";
import { documentManagementService } from "./document-management.service";

export interface ComplianceEngineService {
  checkCompliance(
    documentId: string,
    frameworks?: ComplianceFramework[],
  ): Promise<ComplianceResult>;
  createRule(
    rule: Omit<ComplianceRule, "id" | "createdAt" | "updatedAt">,
  ): Promise<ComplianceRule>;
  updateRule(
    id: string,
    updates: Partial<ComplianceRule>,
  ): Promise<ComplianceRule>;
  getRules(framework?: ComplianceFramework): Promise<ComplianceRule[]>;
  evaluateRule(
    rule: ComplianceRule,
    document: any,
  ): Promise<RuleEvaluationResult>;
  getComplianceStatus(documentId?: string): Promise<ComplianceStatus>;
}

export interface ComplianceResult {
  documentId: string;
  overallScore: number;
  overallStatus: "compliant" | "non_compliant" | "warning" | "pending";
  checks: ComplianceCheck[];
  recommendations: string[];
  criticalIssues: string[];
  frameworkScores: Record<ComplianceFramework, number>;
  checkedAt: string;
}

export interface RuleEvaluationResult {
  ruleId: string;
  passed: boolean;
  score: number;
  details: string;
  recommendations: string[];
  severity: "low" | "medium" | "high" | "critical";
  actions: ComplianceAction[];
}

export interface ComplianceStatus {
  overall: {
    score: number;
    status: "compliant" | "non_compliant" | "warning";
    trend: "improving" | "stable" | "declining";
  };
  byFramework: Record<
    ComplianceFramework,
    {
      score: number;
      status: "compliant" | "non_compliant" | "warning";
      activeRules: number;
      passedRules: number;
      failedRules: number;
    }
  >;
  recentChecks: ComplianceCheck[];
  criticalIssues: Array<{
    documentId: string;
    documentTitle: string;
    issue: string;
    severity: string;
    framework: ComplianceFramework;
  }>;
  statistics: {
    totalDocuments: number;
    compliantDocuments: number;
    nonCompliantDocuments: number;
    pendingReview: number;
  };
}

export class ComplianceEngineService implements ComplianceEngineService {
  private ruleCache = new Map<string, ComplianceRule[]>();
  private cacheTimeout = 10 * 60 * 1000; // 10 minutes
  private lastCacheUpdate = 0;

  constructor() {
    this.initializeDefaultRules();
  }

  async checkCompliance(
    documentId: string,
    frameworks?: ComplianceFramework[],
  ): Promise<ComplianceResult> {
    try {
      const document = await documentManagementService.getDocument(documentId);
      const applicableFrameworks =
        frameworks || this.getApplicableFrameworks(document);

      const checks: ComplianceCheck[] = [];
      const frameworkScores: Record<ComplianceFramework, number> = {} as Record<
        ComplianceFramework,
        number
      >;
      const recommendations: string[] = [];
      const criticalIssues: string[] = [];

      for (const framework of applicableFrameworks) {
        const rules = await this.getRules(framework);
        const frameworkChecks: ComplianceCheck[] = [];

        for (const rule of rules.filter((r) => r.isActive)) {
          const evaluation = await this.evaluateRule(rule, document);

          const check: ComplianceCheck = {
            id: `${documentId}_${rule.id}_${Date.now()}`,
            documentId,
            ruleId: rule.id,
            status: evaluation.passed ? "passed" : "failed",
            score: evaluation.score,
            details: evaluation.details,
            recommendations: evaluation.recommendations,
            checkedAt: new Date().toISOString(),
            checkedBy: "system",
          };

          checks.push(check);
          frameworkChecks.push(check);

          if (!evaluation.passed) {
            recommendations.push(...evaluation.recommendations);

            if (
              evaluation.severity === "critical" ||
              evaluation.severity === "high"
            ) {
              criticalIssues.push(`${rule.name}: ${evaluation.details}`);
            }
          }
        }

        // Calculate framework score
        const frameworkScore =
          frameworkChecks.length > 0
            ? frameworkChecks.reduce((sum, check) => sum + check.score, 0) /
              frameworkChecks.length
            : 100;

        frameworkScores[framework] = frameworkScore;
      }

      // Calculate overall score
      const overallScore =
        Object.values(frameworkScores).length > 0
          ? Object.values(frameworkScores).reduce(
              (sum, score) => sum + score,
              0,
            ) / Object.values(frameworkScores).length
          : 100;

      // Determine overall status
      let overallStatus: "compliant" | "non_compliant" | "warning" | "pending";
      if (overallScore >= 90) {
        overallStatus = "compliant";
      } else if (overallScore >= 70) {
        overallStatus = "warning";
      } else {
        overallStatus = "non_compliant";
      }

      return {
        documentId,
        overallScore,
        overallStatus,
        checks,
        recommendations: [...new Set(recommendations)], // Remove duplicates
        criticalIssues,
        frameworkScores,
        checkedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Compliance check failed:", error);
      throw new Error(`Compliance check failed: ${error.message}`);
    }
  }

  async createRule(
    rule: Omit<ComplianceRule, "id" | "createdAt" | "updatedAt">,
  ): Promise<ComplianceRule> {
    try {
      const newRule = await governanceRegulationsAPI.createComplianceRule(rule);

      // Clear cache to ensure fresh data
      this.ruleCache.clear();

      return newRule;
    } catch (error) {
      console.error("Failed to create compliance rule:", error);
      throw new Error(`Failed to create compliance rule: ${error.message}`);
    }
  }

  async updateRule(
    id: string,
    updates: Partial<ComplianceRule>,
  ): Promise<ComplianceRule> {
    try {
      const updatedRule = await governanceRegulationsAPI.updateComplianceRule(
        id,
        updates,
      );

      // Clear cache to ensure fresh data
      this.ruleCache.clear();

      return updatedRule;
    } catch (error) {
      console.error("Failed to update compliance rule:", error);
      throw new Error(`Failed to update compliance rule: ${error.message}`);
    }
  }

  async getRules(framework?: ComplianceFramework): Promise<ComplianceRule[]> {
    try {
      const cacheKey = framework || "all";
      const now = Date.now();

      // Check cache
      if (
        this.ruleCache.has(cacheKey) &&
        now - this.lastCacheUpdate < this.cacheTimeout
      ) {
        return this.ruleCache.get(cacheKey)!;
      }

      // Fetch from API
      const rules =
        await governanceRegulationsAPI.getComplianceRules(framework);

      // Update cache
      this.ruleCache.set(cacheKey, rules);
      this.lastCacheUpdate = now;

      return rules;
    } catch (error) {
      console.error("Failed to get compliance rules:", error);
      throw new Error(`Failed to retrieve compliance rules: ${error.message}`);
    }
  }

  async evaluateRule(
    rule: ComplianceRule,
    document: any,
  ): Promise<RuleEvaluationResult> {
    try {
      let passed = true;
      let score = 100;
      const details: string[] = [];
      const recommendations: string[] = [];

      // Evaluate each condition
      for (const condition of rule.conditions) {
        const conditionResult = this.evaluateCondition(condition, document);

        if (!conditionResult.passed) {
          passed = false;
          score = Math.max(0, score - 20); // Deduct points for failed conditions
          details.push(conditionResult.message);

          if (conditionResult.recommendation) {
            recommendations.push(conditionResult.recommendation);
          }
        }
      }

      // Adjust score based on severity
      if (!passed) {
        switch (rule.severity) {
          case "critical":
            score = 0;
            break;
          case "high":
            score = Math.min(score, 30);
            break;
          case "medium":
            score = Math.min(score, 60);
            break;
          case "low":
            score = Math.min(score, 80);
            break;
        }
      }

      return {
        ruleId: rule.id,
        passed,
        score,
        details: details.join("; "),
        recommendations,
        severity: rule.severity,
        actions: passed ? [] : rule.actions,
      };
    } catch (error) {
      console.error("Rule evaluation failed:", error);
      return {
        ruleId: rule.id,
        passed: false,
        score: 0,
        details: `Evaluation failed: ${error.message}`,
        recommendations: ["Review rule configuration"],
        severity: rule.severity,
        actions: [],
      };
    }
  }

  async getComplianceStatus(documentId?: string): Promise<ComplianceStatus> {
    try {
      const apiStatus =
        await governanceRegulationsAPI.getComplianceStatus(documentId);

      // Enhance with additional statistics
      const stats = await documentManagementService.getDocumentStats();

      return {
        overall: apiStatus.overall,
        byFramework: apiStatus.byFramework,
        recentChecks: apiStatus.recentChecks,
        criticalIssues: [], // Would be populated from recent checks
        statistics: {
          totalDocuments: stats.total,
          compliantDocuments: Math.floor(stats.total * 0.8), // Mock calculation
          nonCompliantDocuments: Math.floor(stats.total * 0.15), // Mock calculation
          pendingReview: Math.floor(stats.total * 0.05), // Mock calculation
        },
      };
    } catch (error) {
      console.error("Failed to get compliance status:", error);

      // Return default status on error
      return {
        overall: {
          score: 0,
          status: "non_compliant",
          trend: "stable",
        },
        byFramework: {} as Record<ComplianceFramework, any>,
        recentChecks: [],
        criticalIssues: [],
        statistics: {
          totalDocuments: 0,
          compliantDocuments: 0,
          nonCompliantDocuments: 0,
          pendingReview: 0,
        },
      };
    }
  }

  // Private helper methods
  private evaluateCondition(
    condition: ComplianceCondition,
    document: any,
  ): {
    passed: boolean;
    message: string;
    recommendation?: string;
  } {
    try {
      const fieldValue = this.getFieldValue(condition.field, document);
      let passed = false;
      let message = "";
      let recommendation = "";

      switch (condition.operator) {
        case "equals":
          passed = fieldValue === condition.value;
          message = passed
            ? `${condition.field} equals expected value`
            : `${condition.field} does not equal expected value`;
          recommendation = passed
            ? ""
            : `Set ${condition.field} to ${condition.value}`;
          break;

        case "not_equals":
          passed = fieldValue !== condition.value;
          message = passed
            ? `${condition.field} is not equal to restricted value`
            : `${condition.field} equals restricted value`;
          recommendation = passed
            ? ""
            : `Change ${condition.field} from ${condition.value}`;
          break;

        case "contains":
          passed = String(fieldValue)
            .toLowerCase()
            .includes(String(condition.value).toLowerCase());
          message = passed
            ? `${condition.field} contains required text`
            : `${condition.field} does not contain required text`;
          recommendation = passed
            ? ""
            : `Include '${condition.value}' in ${condition.field}`;
          break;

        case "not_contains":
          passed = !String(fieldValue)
            .toLowerCase()
            .includes(String(condition.value).toLowerCase());
          message = passed
            ? `${condition.field} does not contain restricted text`
            : `${condition.field} contains restricted text`;
          recommendation = passed
            ? ""
            : `Remove '${condition.value}' from ${condition.field}`;
          break;

        case "exists":
          passed =
            fieldValue !== undefined &&
            fieldValue !== null &&
            fieldValue !== "";
          message = passed
            ? `${condition.field} exists`
            : `${condition.field} is missing`;
          recommendation = passed
            ? ""
            : `Provide a value for ${condition.field}`;
          break;

        case "not_exists":
          passed =
            fieldValue === undefined ||
            fieldValue === null ||
            fieldValue === "";
          message = passed
            ? `${condition.field} is properly empty`
            : `${condition.field} should not exist`;
          recommendation = passed ? "" : `Remove or clear ${condition.field}`;
          break;

        case "greater_than":
          const numValue = Number(fieldValue);
          const numCondition = Number(condition.value);
          passed =
            !isNaN(numValue) && !isNaN(numCondition) && numValue > numCondition;
          message = passed
            ? `${condition.field} is greater than minimum`
            : `${condition.field} is not greater than minimum`;
          recommendation = passed
            ? ""
            : `Increase ${condition.field} to be greater than ${condition.value}`;
          break;

        case "less_than":
          const numValue2 = Number(fieldValue);
          const numCondition2 = Number(condition.value);
          passed =
            !isNaN(numValue2) &&
            !isNaN(numCondition2) &&
            numValue2 < numCondition2;
          message = passed
            ? `${condition.field} is less than maximum`
            : `${condition.field} is not less than maximum`;
          recommendation = passed
            ? ""
            : `Decrease ${condition.field} to be less than ${condition.value}`;
          break;

        default:
          passed = false;
          message = `Unknown operator: ${condition.operator}`;
          recommendation = "Review rule configuration";
      }

      return { passed, message, recommendation };
    } catch (error) {
      return {
        passed: false,
        message: `Condition evaluation failed: ${error.message}`,
        recommendation: "Review condition configuration",
      };
    }
  }

  private getFieldValue(fieldPath: string, document: any): any {
    try {
      const keys = fieldPath.split(".");
      let value = document;

      for (const key of keys) {
        if (value && typeof value === "object" && key in value) {
          value = value[key];
        } else {
          return undefined;
        }
      }

      return value;
    } catch {
      return undefined;
    }
  }

  private getApplicableFrameworks(document: any): ComplianceFramework[] {
    const frameworks: ComplianceFramework[] = ["DOH"]; // Default framework

    // Add frameworks based on document content or metadata
    if (document.classification?.complianceFrameworks) {
      frameworks.push(...document.classification.complianceFrameworks);
    }

    // Add frameworks based on document category
    if (
      document.category === "healthcare" ||
      document.category === "clinical"
    ) {
      if (!frameworks.includes("ADHICS")) frameworks.push("ADHICS");
      if (!frameworks.includes("JAWDA")) frameworks.push("JAWDA");
    }

    return [...new Set(frameworks)]; // Remove duplicates
  }

  private async initializeDefaultRules(): Promise<void> {
    // This would typically load default rules from configuration
    // For now, we'll just ensure the service is ready
    console.log("Compliance Engine Service initialized");
  }

  // Public utility methods
  async validateRule(rule: Partial<ComplianceRule>): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!rule.name?.trim()) {
      errors.push("Rule name is required");
    }

    if (!rule.framework) {
      errors.push("Compliance framework is required");
    }

    if (!rule.conditions || rule.conditions.length === 0) {
      errors.push("At least one condition is required");
    }

    if (!rule.actions || rule.actions.length === 0) {
      warnings.push("No actions defined for rule violations");
    }

    // Validate conditions
    if (rule.conditions) {
      for (let i = 0; i < rule.conditions.length; i++) {
        const condition = rule.conditions[i];
        if (!condition.field) {
          errors.push(`Condition ${i + 1}: Field is required`);
        }
        if (!condition.operator) {
          errors.push(`Condition ${i + 1}: Operator is required`);
        }
        if (condition.value === undefined || condition.value === null) {
          warnings.push(`Condition ${i + 1}: Value is not set`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  clearCache(): void {
    this.ruleCache.clear();
    this.lastCacheUpdate = 0;
  }

  async getFrameworkStatistics(framework: ComplianceFramework): Promise<{
    totalRules: number;
    activeRules: number;
    averageScore: number;
    commonIssues: string[];
  }> {
    try {
      const rules = await this.getRules(framework);
      const status = await this.getComplianceStatus();

      return {
        totalRules: rules.length,
        activeRules: rules.filter((r) => r.isActive).length,
        averageScore: status.byFramework[framework]?.score || 0,
        commonIssues: [], // Would be calculated from recent checks
      };
    } catch (error) {
      console.error("Failed to get framework statistics:", error);
      return {
        totalRules: 0,
        activeRules: 0,
        averageScore: 0,
        commonIssues: [],
      };
    }
  }
}

// Export singleton instance
export const complianceEngineService = new ComplianceEngineService();
export default complianceEngineService;
