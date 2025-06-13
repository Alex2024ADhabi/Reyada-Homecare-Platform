import { z } from "zod";

/**
 * Enhanced JSON validation utility with comprehensive error prevention
 * and DOH 2025 compliance features
 */
export class JsonValidator {
  private static readonly MAX_DEPTH = 50;
  private static readonly MAX_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly SAFE_VALIDATION_TIMEOUT = 5000;

  /**
   * Comprehensive JSON validation with enhanced error prevention and security
   */
  static validate(jsonString: string): {
    isValid: boolean;
    data?: any;
    error?: string;
    errors?: string[];
    warnings?: string[];
    sanitized?: boolean;
    memoryUsage?: number;
    performanceMetrics?: {
      validationTime: number;
      objectDepth: number;
      objectSize: number;
    };
    securityThreats?: string[];
    complianceScore?: number;
  } {
    const startTime = performance.now();
    const initialMemory = this.getMemoryUsage();

    try {
      // Input validation
      if (!jsonString || typeof jsonString !== "string") {
        return {
          isValid: false,
          error: "Invalid input: JSON string is required",
          errors: ["Invalid input: JSON string is required"],
          warnings: [],
          sanitized: false,
          memoryUsage: 0,
          performanceMetrics: {
            validationTime: performance.now() - startTime,
            objectDepth: 0,
            objectSize: 0,
          },
        };
      }

      // Size check
      if (jsonString.length > this.MAX_SIZE) {
        return {
          isValid: false,
          error: "JSON string exceeds maximum size limit",
          errors: ["JSON string exceeds maximum size limit"],
          warnings: ["Consider breaking down large JSON objects"],
          sanitized: false,
          memoryUsage: 0,
          performanceMetrics: {
            validationTime: performance.now() - startTime,
            objectDepth: 0,
            objectSize: jsonString.length,
          },
        };
      }

      // Parse JSON
      let data: any;
      try {
        data = JSON.parse(jsonString);
      } catch (parseError) {
        return {
          isValid: false,
          error: `JSON parsing failed: ${parseError instanceof Error ? parseError.message : "Unknown error"}`,
          errors: [
            `JSON parsing failed: ${parseError instanceof Error ? parseError.message : "Unknown error"}`,
          ],
          warnings: [],
          sanitized: false,
          memoryUsage: this.getMemoryUsage() - initialMemory,
          performanceMetrics: {
            validationTime: performance.now() - startTime,
            objectDepth: 0,
            objectSize: jsonString.length,
          },
        };
      }

      // Validate structure
      const structureValidation = this.validateStructure(data);
      if (!structureValidation.isValid) {
        return {
          isValid: false,
          error: structureValidation.error,
          errors: structureValidation.errors,
          warnings: structureValidation.warnings,
          sanitized: false,
          memoryUsage: this.getMemoryUsage() - initialMemory,
          performanceMetrics: {
            validationTime: performance.now() - startTime,
            objectDepth: structureValidation.depth || 0,
            objectSize: jsonString.length,
          },
        };
      }

      // Security validation
      const securityValidation = this.performSecurityScan(data);

      // DOH compliance validation
      const complianceValidation = this.validateDOHComplianceData(data);

      // Calculate compliance score
      const complianceScore = this.calculateComplianceScore({
        structureValid: structureValidation.isValid,
        securityValid: securityValidation.threats.length === 0,
        dohCompliant: complianceValidation.isValid,
        performanceOptimal: performance.now() - startTime < 100,
      });

      const endTime = performance.now();
      const finalMemory = this.getMemoryUsage();

      return {
        isValid: true,
        data,
        errors: [
          ...(structureValidation.errors || []),
          ...complianceValidation.errors,
        ],
        warnings: [
          ...(structureValidation.warnings || []),
          ...securityValidation.warnings,
        ],
        sanitized: securityValidation.sanitized,
        memoryUsage: finalMemory - initialMemory,
        performanceMetrics: {
          validationTime: endTime - startTime,
          objectDepth: structureValidation.depth || 0,
          objectSize: jsonString.length,
        },
        securityThreats: securityValidation.threats,
        complianceScore,
      };
    } catch (error) {
      const endTime = performance.now();
      const errorMessage =
        error instanceof Error ? error.message : "Unknown validation error";

      return {
        isValid: false,
        error: errorMessage,
        errors: [errorMessage],
        warnings: [],
        sanitized: false,
        memoryUsage: this.getMemoryUsage() - initialMemory,
        performanceMetrics: {
          validationTime: endTime - startTime,
          objectDepth: 0,
          objectSize: 0,
        },
        securityThreats: [],
        complianceScore: 0,
      };
    }
  }

  /**
   * Validate JSON structure and depth
   */
  private static validateStructure(
    data: any,
    depth = 0,
  ): {
    isValid: boolean;
    error?: string;
    errors: string[];
    warnings: string[];
    depth: number;
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    let maxDepth = depth;

    try {
      if (depth > this.MAX_DEPTH) {
        errors.push(`Maximum nesting depth exceeded: ${depth}`);
        return {
          isValid: false,
          error: `Maximum nesting depth exceeded: ${depth}`,
          errors,
          warnings,
          depth: maxDepth,
        };
      }

      if (data === null || data === undefined) {
        return {
          isValid: true,
          errors: [],
          warnings: [],
          depth: maxDepth,
        };
      }

      if (typeof data === "object") {
        if (Array.isArray(data)) {
          // Validate array elements
          for (let i = 0; i < data.length; i++) {
            const elementValidation = this.validateStructure(
              data[i],
              depth + 1,
            );
            maxDepth = Math.max(maxDepth, elementValidation.depth);
            errors.push(...elementValidation.errors);
            warnings.push(...elementValidation.warnings);

            if (!elementValidation.isValid) {
              return {
                isValid: false,
                error: elementValidation.error,
                errors,
                warnings,
                depth: maxDepth,
              };
            }
          }

          if (data.length > 1000) {
            warnings.push(`Large array detected: ${data.length} elements`);
          }
        } else {
          // Validate object properties
          const keys = Object.keys(data);

          if (keys.length > 100) {
            warnings.push(`Object has many properties: ${keys.length}`);
          }

          for (const key of keys) {
            const propertyValidation = this.validateStructure(
              data[key],
              depth + 1,
            );
            maxDepth = Math.max(maxDepth, propertyValidation.depth);
            errors.push(...propertyValidation.errors);
            warnings.push(...propertyValidation.warnings);

            if (!propertyValidation.isValid) {
              return {
                isValid: false,
                error: propertyValidation.error,
                errors,
                warnings,
                depth: maxDepth,
              };
            }
          }
        }
      }

      return {
        isValid: errors.length === 0,
        error: errors.length > 0 ? errors[0] : undefined,
        errors,
        warnings,
        depth: maxDepth,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Structure validation failed";
      return {
        isValid: false,
        error: errorMessage,
        errors: [errorMessage],
        warnings,
        depth: maxDepth,
      };
    }
  }

  /**
   * Perform comprehensive security scanning
   */
  private static performSecurityScan(data: any): {
    threats: string[];
    warnings: string[];
    sanitized: boolean;
  } {
    const threats: string[] = [];
    const warnings: string[] = [];
    let sanitized = false;

    try {
      const jsonString = JSON.stringify(data);

      // Check for script injection
      if (
        jsonString.includes("<script>") ||
        jsonString.includes("javascript:")
      ) {
        threats.push("Potential XSS attack detected");
      }

      // Check for SQL injection patterns
      const sqlPatterns = [
        /('|(\-\-)|(;)|(\||\|)|(\*|\*))/i,
        /(exec(\s|\+)+(s|x)p\w+)/i,
        /union.*select/i,
        /insert.*into/i,
        /delete.*from/i,
        /update.*set/i,
        /drop.*table/i,
      ];

      for (const pattern of sqlPatterns) {
        if (pattern.test(jsonString)) {
          threats.push("Potential SQL injection detected");
          break;
        }
      }

      // Check for command injection
      const commandPatterns = [
        /\b(rm|del|format|shutdown|reboot)\b/i,
        /[;&|`$(){}\[\]]/,
        /\.\.[\/\\]/,
      ];

      for (const pattern of commandPatterns) {
        if (pattern.test(jsonString)) {
          threats.push("Potential command injection detected");
          break;
        }
      }

      // Check for path traversal
      if (jsonString.includes("../") || jsonString.includes("..\\")) {
        threats.push("Potential path traversal detected");
      }

      // Check for sensitive data exposure
      const sensitivePatterns = [
        /password/i,
        /secret/i,
        /token/i,
        /api[_-]?key/i,
        /private[_-]?key/i,
      ];

      for (const pattern of sensitivePatterns) {
        if (pattern.test(jsonString)) {
          warnings.push(
            "Potential sensitive data detected - ensure proper encryption",
          );
          break;
        }
      }

      return { threats, warnings, sanitized };
    } catch (error) {
      warnings.push("Security scan failed - manual review recommended");
      return { threats, warnings, sanitized };
    }
  }

  /**
   * Calculate compliance score based on various factors
   */
  private static calculateComplianceScore(factors: {
    structureValid: boolean;
    securityValid: boolean;
    dohCompliant: boolean;
    performanceOptimal: boolean;
  }): number {
    let score = 100;

    if (!factors.structureValid) score -= 25;
    if (!factors.securityValid) score -= 30;
    if (!factors.dohCompliant) score -= 25;
    if (!factors.performanceOptimal) score -= 10;

    return Math.max(0, score);
  }

  /**
   * Get memory usage (approximation)
   */
  private static getMemoryUsage(): number {
    if (typeof performance !== "undefined" && performance.memory) {
      return performance.memory.usedJSHeapSize;
    }
    return 0;
  }

  /**
   * Sanitize JSON data by removing potentially dangerous content
   */
  static sanitize(data: any): any {
    try {
      if (data === null || data === undefined) {
        return data;
      }

      if (typeof data === "string") {
        // Remove potentially dangerous content
        return data
          .replace(/<script[^>]*>.*?<\/script>/gi, "")
          .replace(/javascript:/gi, "")
          .replace(/on\w+\s*=/gi, "");
      }

      if (Array.isArray(data)) {
        return data.map((item) => this.sanitize(item));
      }

      if (typeof data === "object") {
        const sanitized: any = {};
        for (const key in data) {
          if (data.hasOwnProperty(key)) {
            sanitized[key] = this.sanitize(data[key]);
          }
        }
        return sanitized;
      }

      return data;
    } catch (error) {
      console.warn("JSON sanitization failed:", error);
      return data;
    }
  }

  /**
   * Comprehensive ADHICS V2 compliance validation for JSON data
   */
  static validateDOHComplianceData(data: any): {
    isValid: boolean;
    errors: string[];
    complianceScore: number;
    adhicsCompliance: {
      sectionA: { score: number; violations: string[] };
      sectionB: { score: number; violations: string[] };
      overall: { score: number; level: string };
    };
  } {
    const errors: string[] = [];
    let complianceScore = 100;
    const adhicsCompliance = {
      sectionA: { score: 100, violations: [] as string[] },
      sectionB: { score: 100, violations: [] as string[] },
      overall: { score: 100, level: "Compliant" },
    };

    // ADHICS Section A - Governance and Framework
    this.validateADHICSGovernance(data, adhicsCompliance.sectionA, errors);

    // ADHICS Section B - Control Requirements
    this.validateADHICSControls(data, adhicsCompliance.sectionB, errors);

    // Required DOH 2025 fields with ADHICS mapping
    const requiredFields = [
      { field: "patientId", adhicsRef: "HR 2.1", weight: 5 },
      { field: "emiratesId", adhicsRef: "DP 1.4", weight: 10 },
      { field: "serviceType", adhicsRef: "AM 2.1", weight: 5 },
      { field: "providerLicense", adhicsRef: "HR 2.1", weight: 10 },
      { field: "clinicalJustification", adhicsRef: "DP 1.3", weight: 15 },
      { field: "serviceDate", adhicsRef: "CO 6.3", weight: 5 },
      { field: "priorAuthorizationNumber", adhicsRef: "AC 2.1", weight: 10 },
      { field: "membershipNumber", adhicsRef: "DP 1.4", weight: 10 },
      { field: "serviceCode", adhicsRef: "AM 3.1", weight: 10 },
      { field: "diagnosisCode", adhicsRef: "DP 1.4", weight: 10 },
      { field: "providerSignature", adhicsRef: "SA 3.1", weight: 10 },
      { field: "patientSignature", adhicsRef: "SA 3.1", weight: 10 },
      { field: "letterOfAppointment", adhicsRef: "TP 2.1", weight: 10 },
      { field: "contactPersonDetails", adhicsRef: "HR 2.2", weight: 5 },
      { field: "faceToFaceAssessment", adhicsRef: "CO 7.1", weight: 15 },
    ];

    requiredFields.forEach(({ field, adhicsRef, weight }) => {
      if (!data[field] && data[field] !== 0) {
        const error = `Missing required field: ${field} (ADHICS ${adhicsRef})`;
        errors.push(error);
        complianceScore -= weight;
        if (
          adhicsRef.startsWith("HR") ||
          adhicsRef.startsWith("AM") ||
          adhicsRef.startsWith("PE")
        ) {
          adhicsCompliance.sectionA.violations.push(error);
          adhicsCompliance.sectionA.score -= weight;
        } else {
          adhicsCompliance.sectionB.violations.push(error);
          adhicsCompliance.sectionB.score -= weight;
        }
      }
    });

    // Enhanced service code validation with ADHICS AM 3.1 compliance
    if (data.serviceCode) {
      const validCodes = [
        "17-25-1",
        "17-25-2",
        "17-25-3",
        "17-25-4",
        "17-25-5",
      ];
      const deprecatedCodes = ["17-26-1", "17-26-2", "17-26-3", "17-26-4"];

      if (deprecatedCodes.includes(data.serviceCode)) {
        const error = `Deprecated service code: ${data.serviceCode} (ADHICS AM 3.1 violation)`;
        errors.push(error);
        complianceScore -= 20;
        adhicsCompliance.sectionA.violations.push(error);
        adhicsCompliance.sectionA.score -= 20;
      } else if (!validCodes.includes(data.serviceCode)) {
        const error = `Invalid service code: ${data.serviceCode} (ADHICS AM 3.1 violation)`;
        errors.push(error);
        complianceScore -= 15;
        adhicsCompliance.sectionA.violations.push(error);
        adhicsCompliance.sectionA.score -= 15;
      }
    }

    // MSC compliance with ADHICS TP 2.1 validation
    if (data.mscPlanExtension) {
      const mscDeadline = new Date("2025-05-14");
      const currentDate = new Date();

      if (currentDate > mscDeadline) {
        const error = "MSC plan extension deadline exceeded (ADHICS TP 2.1)";
        errors.push(error);
        complianceScore -= 25;
        adhicsCompliance.sectionB.violations.push(error);
        adhicsCompliance.sectionB.score -= 25;
      }

      if (data.requestedDuration > 90) {
        const error = "MSC duration exceeds 90-day limit (ADHICS TP 2.1)";
        errors.push(error);
        complianceScore -= 20;
        adhicsCompliance.sectionB.violations.push(error);
        adhicsCompliance.sectionB.score -= 20;
      }
    }

    // Document validation with ADHICS AM 5.1 compliance
    if (data.wheelchairRequest) {
      const wheelchairEffectiveDate = new Date("2025-05-01");
      const currentDate = new Date();

      if (currentDate >= wheelchairEffectiveDate) {
        if (!data.documents?.includes("Wheelchair Pre-approval Form")) {
          const error = "Missing wheelchair pre-approval form (ADHICS AM 5.1)";
          errors.push(error);
          complianceScore -= 15;
          adhicsCompliance.sectionA.violations.push(error);
          adhicsCompliance.sectionA.score -= 15;
        }
      }
    }

    if (data.homecareAllocation) {
      const faceToFaceEffectiveDate = new Date("2025-02-24");
      const currentDate = new Date();

      if (currentDate >= faceToFaceEffectiveDate) {
        if (!data.documents?.includes("Face-to-Face Assessment (OpenJet)")) {
          const error = "Missing face-to-face assessment (ADHICS CO 7.1)";
          errors.push(error);
          complianceScore -= 15;
          adhicsCompliance.sectionB.violations.push(error);
          adhicsCompliance.sectionB.score -= 15;
        }
      }
    }

    // Calculate overall ADHICS compliance
    adhicsCompliance.overall.score = Math.round(
      (adhicsCompliance.sectionA.score + adhicsCompliance.sectionB.score) / 2,
    );

    if (adhicsCompliance.overall.score >= 95) {
      adhicsCompliance.overall.level = "Excellent";
    } else if (adhicsCompliance.overall.score >= 85) {
      adhicsCompliance.overall.level = "Good";
    } else if (adhicsCompliance.overall.score >= 75) {
      adhicsCompliance.overall.level = "Acceptable";
    } else {
      adhicsCompliance.overall.level = "Needs Improvement";
    }

    return {
      isValid: errors.length === 0,
      errors,
      complianceScore: Math.max(0, complianceScore),
      adhicsCompliance,
    };
  }

  /**
   * Validate ADHICS Section A - Governance and Framework
   */
  private static validateADHICSGovernance(
    data: any,
    sectionA: any,
    errors: string[],
  ): void {
    // HR 1 - Human Resources Security Policy
    if (!data.hrSecurityPolicy) {
      const error = "Missing HR Security Policy (ADHICS HR 1.1)";
      errors.push(error);
      sectionA.violations.push(error);
      sectionA.score -= 10;
    }

    // AM 1 - Asset Management Policy
    if (!data.assetManagementPolicy) {
      const error = "Missing Asset Management Policy (ADHICS AM 1.1)";
      errors.push(error);
      sectionA.violations.push(error);
      sectionA.score -= 10;
    }

    // PE 1 - Physical and Environmental Security Policy
    if (!data.physicalSecurityPolicy) {
      const error = "Missing Physical Security Policy (ADHICS PE 1.1)";
      errors.push(error);
      sectionA.violations.push(error);
      sectionA.score -= 10;
    }

    // Asset Classification (AM 3.1)
    if (!data.assetClassification) {
      const error = "Missing asset classification (ADHICS AM 3.1)";
      errors.push(error);
      sectionA.violations.push(error);
      sectionA.score -= 10;
    }
  }

  /**
   * Validate ADHICS Section B - Control Requirements
   */
  private static validateADHICSControls(
    data: any,
    sectionB: any,
    errors: string[],
  ): void {
    // AC 1 - Access Control Policy
    if (!data.accessControlPolicy) {
      const error = "Missing Access Control Policy (ADHICS AC 1.1)";
      errors.push(error);
      sectionB.violations.push(error);
      sectionB.score -= 10;
    }

    // CO 1 - Communications and Operations Management Policy
    if (!data.operationsPolicy) {
      const error = "Missing Operations Management Policy (ADHICS CO 1.1)";
      errors.push(error);
      sectionB.violations.push(error);
      sectionB.score -= 10;
    }

    // DP 1 - Data Privacy Policy
    if (!data.dataPrivacyPolicy) {
      const error = "Missing Data Privacy Policy (ADHICS DP 1.1)";
      errors.push(error);
      sectionB.violations.push(error);
      sectionB.score -= 15;
    }

    // IM 1 - Incident Management Policy
    if (!data.incidentManagementPolicy) {
      const error = "Missing Incident Management Policy (ADHICS IM 1.1)";
      errors.push(error);
      sectionB.violations.push(error);
      sectionB.score -= 10;
    }

    // SA 1 - System Acquisition Policy
    if (!data.systemAcquisitionPolicy) {
      const error = "Missing System Acquisition Policy (ADHICS SA 1.1)";
      errors.push(error);
      sectionB.violations.push(error);
      sectionB.score -= 10;
    }

    // TP 1 - Third Party Security Policy
    if (!data.thirdPartySecurityPolicy) {
      const error = "Missing Third Party Security Policy (ADHICS TP 1.1)";
      errors.push(error);
      sectionB.violations.push(error);
      sectionB.score -= 10;
    }

    // CS 1 - Cloud Security Policy
    if (!data.cloudSecurityPolicy) {
      const error = "Missing Cloud Security Policy (ADHICS CS 1.1)";
      errors.push(error);
      sectionB.violations.push(error);
      sectionB.score -= 10;
    }

    // SC 1 - System Continuity Policy
    if (!data.systemContinuityPolicy) {
      const error = "Missing System Continuity Policy (ADHICS SC 1.1)";
      errors.push(error);
      sectionB.violations.push(error);
      sectionB.score -= 10;
    }
  }

  /**
   * Create a safe JSON string with validation
   */
  static createSafeJson(data: any): string | null {
    try {
      // Sanitize the data first
      const sanitizedData = this.sanitize(data);

      // Convert to JSON string
      const jsonString = JSON.stringify(sanitizedData, null, 2);

      // Validate the created JSON
      const validation = this.validate(jsonString);

      if (!validation.isValid) {
        console.warn("Created JSON failed validation:", validation.errors);
        return null;
      }

      return jsonString;
    } catch (error) {
      console.error("Failed to create safe JSON:", error);
      return null;
    }
  }

  /**
   * Safe JSON stringify with enhanced error handling
   */
  static safeStringify(data: any, space?: number): string {
    try {
      return JSON.stringify(
        data,
        (key, value) => {
          // Handle circular references
          if (typeof value === "object" && value !== null) {
            if (this.circularRefs.has(value)) {
              return "[Circular Reference]";
            }
            this.circularRefs.add(value);
          }

          // Handle functions
          if (typeof value === "function") {
            return "[Function]";
          }

          // Handle undefined
          if (value === undefined) {
            return null;
          }

          // Handle BigInt
          if (typeof value === "bigint") {
            return value.toString();
          }

          // Handle Symbol
          if (typeof value === "symbol") {
            return value.toString();
          }

          return value;
        },
        space,
      );
    } catch (error) {
      console.error("JSON stringify failed:", error);
      return '{"error": "Failed to stringify data"}';
    } finally {
      this.circularRefs.clear();
    }
  }

  private static circularRefs = new WeakSet();

  /**
   * Attempt to auto-fix common JSON issues
   */
  static attemptAutoFix(jsonString: string): string | null {
    try {
      let fixed = jsonString;

      // Fix common JSON issues
      fixed = fixed
        .replace(/,\s*}/g, "}") // Remove trailing commas in objects
        .replace(/,\s*]/g, "]") // Remove trailing commas in arrays
        .replace(/'/g, '"') // Replace single quotes with double quotes
        .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":') // Quote unquoted keys
        .replace(/:\s*undefined/g, ": null") // Replace undefined with null
        .replace(/NaN/g, "null") // Replace NaN with null
        .replace(/Infinity/g, "null"); // Replace Infinity with null

      // Test if the fixed JSON is valid
      JSON.parse(fixed);
      return fixed;
    } catch (error) {
      console.warn("Auto-fix failed:", error);
      return null;
    }
  }
}

// Zod schemas for JSON validation
export const JsonValidationResultSchema = z.object({
  isValid: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  errors: z.array(z.string()).optional(),
  warnings: z.array(z.string()).optional(),
  sanitized: z.boolean().optional(),
  memoryUsage: z.number().optional(),
  performanceMetrics: z
    .object({
      validationTime: z.number(),
      objectDepth: z.number(),
      objectSize: z.number(),
    })
    .optional(),
  securityThreats: z.array(z.string()).optional(),
  complianceScore: z.number().optional(),
});

export default JsonValidator;
