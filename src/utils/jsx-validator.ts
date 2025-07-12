import React from "react";
import { z } from "zod";

/**
 * Enhanced JSX validation utility with comprehensive error prevention
 * and ADHICS V2 compliance features
 */
export class JSXValidator {
  private static readonly MAX_COMPONENT_DEPTH = 50;
  private static readonly MAX_PROPS_COUNT = 100;
  private static readonly SAFE_VALIDATION_TIMEOUT = 3000;
  private static readonly MEMORY_THRESHOLD = 100 * 1024 * 1024; // 100MB

  /**
   * Comprehensive JSX validation with enhanced error prevention and ADHICS V2 compliance
   */
  static validate(jsxElement: any): {
    isValid: boolean;
    component?: React.ComponentType<any>;
    error?: string;
    errors?: string[];
    warnings?: string[];
    sanitized?: boolean;
    memoryUsage?: number;
    performanceMetrics?: {
      validationTime: number;
      componentCount: number;
      propsCount: number;
    };
    securityIssues?: string[];
    performanceScore?: number;
    complianceScore?: number;
    adhicsCompliance?: {
      sectionA: { score: number; violations: string[] };
      sectionB: { score: number; violations: string[] };
      overall: { score: number; level: string };
    };
  } {
    const startTime = performance.now();
    const initialMemory = this.getMemoryUsage();

    try {
      // Input validation
      if (!jsxElement) {
        return {
          isValid: false,
          error: "JSX element is null or undefined",
          errors: ["JSX element is null or undefined"],
          warnings: [],
          sanitized: false,
          memoryUsage: 0,
          performanceMetrics: {
            validationTime: performance.now() - startTime,
            componentCount: 0,
            propsCount: 0,
          },
          securityIssues: [],
          performanceScore: 0,
          complianceScore: 0,
        };
      }

      // Memory check
      const currentMemory = this.getMemoryUsage();
      if (currentMemory > this.MEMORY_THRESHOLD) {
        return {
          isValid: false,
          error: "Memory usage exceeds threshold",
          errors: ["Memory usage exceeds safe threshold"],
          warnings: ["Consider optimizing component structure"],
          sanitized: false,
          memoryUsage: currentMemory,
          performanceMetrics: {
            validationTime: performance.now() - startTime,
            componentCount: 0,
            propsCount: 0,
          },
          securityIssues: [],
          performanceScore: 0,
          complianceScore: 0,
        };
      }

      // Validate JSX structure
      const structureValidation = this.validateJSXStructure(jsxElement);
      if (!structureValidation.isValid) {
        return {
          isValid: false,
          error: structureValidation.error,
          errors: structureValidation.errors,
          warnings: structureValidation.warnings,
          sanitized: false,
          memoryUsage: currentMemory - initialMemory,
          performanceMetrics: {
            validationTime: performance.now() - startTime,
            componentCount: structureValidation.componentCount || 0,
            propsCount: structureValidation.propsCount || 0,
          },
          securityIssues: [],
          performanceScore: 0,
          complianceScore: 0,
        };
      }

      // Validate props
      const propsValidation = this.validateProps(jsxElement);
      if (!propsValidation.isValid) {
        return {
          isValid: false,
          error: propsValidation.error,
          errors: propsValidation.errors,
          warnings: propsValidation.warnings,
          sanitized: propsValidation.sanitized,
          memoryUsage: currentMemory - initialMemory,
          performanceMetrics: {
            validationTime: performance.now() - startTime,
            componentCount: structureValidation.componentCount || 0,
            propsCount: propsValidation.propsCount || 0,
          },
          securityIssues: [],
          performanceScore: 0,
          complianceScore: 0,
        };
      }

      // Security validation with ADHICS compliance
      const securityValidation = this.validateSecurity(jsxElement);
      if (!securityValidation.isValid) {
        return {
          isValid: false,
          error: securityValidation.error,
          errors: securityValidation.errors,
          warnings: securityValidation.warnings,
          sanitized: securityValidation.sanitized,
          memoryUsage: currentMemory - initialMemory,
          performanceMetrics: {
            validationTime: performance.now() - startTime,
            componentCount: structureValidation.componentCount || 0,
            propsCount: propsValidation.propsCount || 0,
          },
          securityIssues: securityValidation.securityIssues || [],
          performanceScore: 0,
          complianceScore: 0,
        };
      }

      // ADHICS V2 compliance validation
      const adhicsCompliance = this.validateADHICSCompliance(jsxElement);

      // Enhanced security validation
      const enhancedSecurityValidation =
        this.validateEnhancedSecurity(jsxElement);

      // Performance scoring
      const performanceScore = this.calculatePerformanceScore({
        validationTime: performance.now() - startTime,
        componentCount: structureValidation.componentCount || 0,
        propsCount: propsValidation.propsCount || 0,
        memoryUsage: this.getMemoryUsage() - initialMemory,
      });

      // Compliance scoring
      const complianceScore = this.calculateComplianceScore({
        structureValid: structureValidation.errors.length === 0,
        propsValid: propsValidation.errors.length === 0,
        securityValid:
          securityValidation.errors.length === 0 &&
          enhancedSecurityValidation.issues.length === 0,
        adhicsCompliant: adhicsCompliance.overall.score >= 85,
      });

      const endTime = performance.now();
      const finalMemory = this.getMemoryUsage();

      return {
        isValid: true,
        component: jsxElement,
        errors: [],
        warnings: [
          ...structureValidation.warnings,
          ...propsValidation.warnings,
          ...securityValidation.warnings,
          ...enhancedSecurityValidation.warnings,
        ],
        sanitized: propsValidation.sanitized || securityValidation.sanitized,
        memoryUsage: finalMemory - initialMemory,
        performanceMetrics: {
          validationTime: endTime - startTime,
          componentCount: structureValidation.componentCount || 0,
          propsCount: propsValidation.propsCount || 0,
        },
        securityIssues: enhancedSecurityValidation.issues,
        performanceScore,
        complianceScore,
        adhicsCompliance,
      };
    } catch (error) {
      const endTime = performance.now();
      const errorMessage =
        error instanceof Error ? error.message : "Unknown JSX validation error";

      return {
        isValid: false,
        error: errorMessage,
        errors: [errorMessage],
        warnings: [],
        sanitized: false,
        memoryUsage: this.getMemoryUsage() - initialMemory,
        performanceMetrics: {
          validationTime: endTime - startTime,
          componentCount: 0,
          propsCount: 0,
        },
        securityIssues: [],
        performanceScore: 0,
        complianceScore: 0,
      };
    }
  }

  /**
   * Validate JSX structure and hierarchy
   */
  private static validateJSXStructure(code: string): {
    isValid: boolean;
    correctedCode?: string;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    let correctedCode = code;

    try {
      // Check for React import
      if (!code.includes("import React") && !code.includes("from 'react'")) {
        errors.push("Missing React import");
        correctedCode = `import React from 'react';\n${correctedCode}`;
      }

      // Check for proper JSX syntax
      const jsxElementRegex = /<[A-Z][a-zA-Z0-9]*[^>]*>/g;
      const matches = code.match(jsxElementRegex);

      if (matches) {
        matches.forEach((match) => {
          if (!match.endsWith("/>") && !match.includes("</")) {
            warnings.push(`Potential unclosed JSX element: ${match}`);
          }
        });
      }

      // Check for component naming
      const componentRegex = /function\s+([a-z][a-zA-Z0-9]*)/g;
      const componentMatches = code.match(componentRegex);

      if (componentMatches) {
        componentMatches.forEach((match) => {
          const componentName = match.replace("function ", "");
          if (componentName[0] === componentName[0].toLowerCase()) {
            errors.push(
              `Component name '${componentName}' should start with uppercase`,
            );
          }
        });
      }

      return {
        isValid: errors.length === 0,
        correctedCode: errors.length > 0 ? correctedCode : undefined,
        errors,
        warnings,
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [
          `JSX validation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        ],
        warnings,
      };
    }
  }

  /**
   * Validate component export
   */
  static validateComponentExport(code: string): {
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Check for default export
      if (!code.includes("export default") && !code.includes("export {")) {
        errors.push("Component should have a default export");
      }

      // Check for proper component structure
      if (!code.includes("return") && !code.includes("=>")) {
        errors.push("Component should return JSX");
      }

      return { errors, warnings };
    } catch (error) {
      return {
        errors: [
          `Export validation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        ],
        warnings,
      };
    }
  }

  /**
   * Fix common JSX issues
   */
  static fixCommonJSXIssues(code: string): string {
    let fixedCode = code;

    try {
      // Add React import if missing
      if (!fixedCode.includes("import React")) {
        fixedCode = `import React from 'react';\n${fixedCode}`;
      }

      // Fix component naming
      fixedCode = fixedCode.replace(
        /function\s+([a-z][a-zA-Z0-9]*)/g,
        (match, name) =>
          `function ${name.charAt(0).toUpperCase() + name.slice(1)}`,
      );

      // Add default export if missing
      if (
        !fixedCode.includes("export default") &&
        !fixedCode.includes("export {")
      ) {
        const componentMatch = fixedCode.match(
          /function\s+([A-Z][a-zA-Z0-9]*)/,
        );
        if (componentMatch) {
          fixedCode += `\n\nexport default ${componentMatch[1]};`;
        }
      }

      return fixedCode;
    } catch (error) {
      console.error("Failed to fix JSX issues:", error);
      return code;
    }
  }

  /**
   * Recursively validate element structure
   */
  private static validateElementStructure(
    element: any,
    depth: number,
  ): {
    depth: number;
    componentCount: number;
    propsCount: number;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    let componentCount = 1;
    let propsCount = 0;
    let maxDepth = depth;

    try {
      if (depth > this.MAX_COMPONENT_DEPTH) {
        errors.push(`Maximum nesting depth exceeded at level ${depth}`);
        return {
          depth: maxDepth,
          componentCount,
          propsCount,
          errors,
          warnings,
        };
      }

      // Count props
      if (element.props) {
        const propKeys = Object.keys(element.props);
        propsCount = propKeys.length;

        if (propsCount > this.MAX_PROPS_COUNT) {
          warnings.push(`Component has many props: ${propsCount}`);
        }

        // Validate children recursively
        if (element.props.children) {
          const children = Array.isArray(element.props.children)
            ? element.props.children
            : [element.props.children];

          for (const child of children) {
            if (React.isValidElement(child)) {
              const childValidation = this.validateElementStructure(
                child,
                depth + 1,
              );
              componentCount += childValidation.componentCount;
              propsCount += childValidation.propsCount;
              maxDepth = Math.max(maxDepth, childValidation.depth);
              errors.push(...childValidation.errors);
              warnings.push(...childValidation.warnings);
            }
          }
        }
      }

      return { depth: maxDepth, componentCount, propsCount, errors, warnings };
    } catch (error) {
      errors.push(
        `Element structure validation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      return { depth: maxDepth, componentCount, propsCount, errors, warnings };
    }
  }

  /**
   * Validate component props
   */
  private static validateProps(element: any): {
    isValid: boolean;
    error?: string;
    errors: string[];
    warnings: string[];
    sanitized: boolean;
    propsCount: number;
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    let sanitized = false;
    let propsCount = 0;

    try {
      if (!element.props) {
        return {
          isValid: true,
          errors: [],
          warnings: [],
          sanitized: false,
          propsCount: 0,
        };
      }

      const props = element.props;
      const propKeys = Object.keys(props);
      propsCount = propKeys.length;

      // Validate individual props
      for (const key of propKeys) {
        const value = props[key];

        // Check for dangerous props (ADHICS AC 6.1 - Secure Log-On)
        if (key === "dangerouslySetInnerHTML") {
          errors.push(
            "dangerouslySetInnerHTML detected - violates ADHICS AC 6.1 security requirements",
          );
        }

        // Check for event handlers (ADHICS AC 2.3 - Security Credentials)
        if (key.startsWith("on") && typeof value === "function") {
          const handlerValidation = this.validateEventHandler(key, value);
          if (!handlerValidation.isValid) {
            errors.push(...handlerValidation.errors);
          }
          warnings.push(...handlerValidation.warnings);
        }

        // Check for refs
        if (key === "ref" && value) {
          warnings.push(
            "Ref usage detected - ensure proper cleanup per ADHICS AM 5.1",
          );
        }

        // Validate prop types
        const typeValidation = this.validatePropType(key, value);
        if (!typeValidation.isValid) {
          errors.push(...typeValidation.errors);
        }
        warnings.push(...typeValidation.warnings);

        if (typeValidation.sanitized) {
          sanitized = true;
        }
      }

      return {
        isValid: errors.length === 0,
        error: errors.length > 0 ? errors[0] : undefined,
        errors,
        warnings,
        sanitized,
        propsCount,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Props validation failed";
      return {
        isValid: false,
        error: errorMessage,
        errors: [errorMessage],
        warnings,
        sanitized,
        propsCount,
      };
    }
  }

  /**
   * Validate event handlers with ADHICS compliance
   */
  private static validateEventHandler(
    eventName: string,
    handler: Function,
  ): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Check if handler is a function
      if (typeof handler !== "function") {
        errors.push(
          `Event handler ${eventName} must be a function (ADHICS AC 2.3)`,
        );
        return { isValid: false, errors, warnings };
      }

      // Check handler function length (parameter count)
      if (handler.length > 3) {
        warnings.push(
          `Event handler ${eventName} has many parameters: ${handler.length}`,
        );
      }

      // Check for common event handler patterns
      const handlerString = handler.toString();

      // Check for potential security issues (ADHICS CO 4.1 - Malware Protection)
      if (
        handlerString.includes("eval(") ||
        handlerString.includes("Function(")
      ) {
        errors.push(
          `Event handler ${eventName} contains dangerous code - violates ADHICS CO 4.1`,
        );
      }

      // Check for async handlers without proper error handling
      if (handlerString.includes("async") && !handlerString.includes("catch")) {
        warnings.push(
          `Async event handler ${eventName} should include error handling (ADHICS IM 2.1)`,
        );
      }

      return { isValid: errors.length === 0, errors, warnings };
    } catch (error) {
      errors.push(
        `Event handler validation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      return { isValid: false, errors, warnings };
    }
  }

  /**
   * Validate prop types with ADHICS compliance
   */
  private static validatePropType(
    propName: string,
    value: any,
  ): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    sanitized: boolean;
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    let sanitized = false;

    try {
      // Check for null/undefined values
      if (value === null || value === undefined) {
        warnings.push(`Prop ${propName} is null or undefined`);
        return { isValid: true, errors, warnings, sanitized };
      }

      // Validate string props (ADHICS DP 1.4 - Technical Measures)
      if (typeof value === "string") {
        // Check for potential XSS
        if (value.includes("<script>") || value.includes("javascript:")) {
          errors.push(
            `Prop ${propName} contains malicious content - violates ADHICS DP 1.4`,
          );
          return { isValid: false, errors, warnings, sanitized };
        }

        // Check for very long strings
        if (value.length > 10000) {
          warnings.push(
            `Prop ${propName} is very long: ${value.length} characters`,
          );
        }
      }

      // Validate object props
      if (typeof value === "object" && value !== null) {
        // Check for circular references
        try {
          JSON.stringify(value);
        } catch (error) {
          if (
            error instanceof TypeError &&
            error.message.includes("circular")
          ) {
            errors.push(`Prop ${propName} contains circular references`);
            return { isValid: false, errors, warnings, sanitized };
          }
        }

        // Check object depth
        const depth = this.getObjectDepth(value);
        if (depth > 10) {
          warnings.push(`Prop ${propName} has deep nesting: ${depth} levels`);
        }
      }

      // Validate function props (ADHICS SA 2.3 - Correct Processing)
      if (typeof value === "function") {
        const funcString = value.toString();
        if (funcString.includes("eval(") || funcString.includes("Function(")) {
          errors.push(
            `Function prop ${propName} contains dangerous code - violates ADHICS SA 2.3`,
          );
          return { isValid: false, errors, warnings, sanitized };
        }
      }

      return { isValid: true, errors, warnings, sanitized };
    } catch (error) {
      errors.push(
        `Prop type validation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      return { isValid: false, errors, warnings, sanitized };
    }
  }

  /**
   * Validate security aspects with ADHICS compliance
   */
  private static validateSecurity(element: any): {
    isValid: boolean;
    error?: string;
    errors: string[];
    warnings: string[];
    sanitized: boolean;
    securityIssues?: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const securityIssues: string[] = [];
    let sanitized = false;

    try {
      // Check for dangerous patterns
      const elementString = JSON.stringify(element, (key, value) => {
        if (typeof value === "function") {
          return value.toString();
        }
        return value;
      });

      // Check for script injection (ADHICS CO 4.1 - Malware Protection)
      if (
        elementString.includes("<script>") ||
        elementString.includes("javascript:")
      ) {
        errors.push("Script injection detected - violates ADHICS CO 4.1");
        securityIssues.push("Script injection vulnerability");
      }

      // Check for eval usage (ADHICS SA 2.3 - Correct Processing)
      if (
        elementString.includes("eval(") ||
        elementString.includes("Function(")
      ) {
        errors.push(
          "Dangerous code execution detected - violates ADHICS SA 2.3",
        );
        securityIssues.push("Code injection vulnerability");
      }

      // Check for data URLs
      if (elementString.includes("data:") && elementString.includes("base64")) {
        warnings.push(
          "Base64 data URLs detected - verify content safety (ADHICS AM 4.1)",
        );
      }

      // Check for external resources (ADHICS TP 2.1 - Third Party Security)
      const urlPattern = /https?:\/\/((?!localhost|127\.0\.0\.1)[^\s]+)/gi;
      const externalUrls = elementString.match(urlPattern);
      if (externalUrls && externalUrls.length > 0) {
        warnings.push(
          `External URLs detected: ${externalUrls.length} URLs - ensure ADHICS TP 2.1 compliance`,
        );
      }

      return {
        isValid: errors.length === 0,
        error: errors.length > 0 ? errors[0] : undefined,
        errors,
        warnings,
        sanitized,
        securityIssues,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Security validation failed";
      return {
        isValid: false,
        error: errorMessage,
        errors: [errorMessage],
        warnings,
        sanitized,
        securityIssues,
      };
    }
  }

  /**
   * Validate ADHICS V2 compliance for JSX components with enhanced checklist validation
   */
  private static validateADHICSCompliance(jsxElement: any): {
    sectionA: { score: number; violations: string[] };
    sectionB: { score: number; violations: string[] };
    overall: { score: number; level: string };
  } {
    const sectionA = { score: 100, violations: [] as string[] };
    const sectionB = { score: 100, violations: [] as string[] };

    try {
      // Section A - Governance and Framework compliance (Enhanced with checklist requirements)
      if (!this.hasSecurityDocumentation(jsxElement)) {
        sectionA.violations.push(
          "Component lacks security documentation (ADHICS HR1.1 - Security Policy)",
        );
        sectionA.score -= 10;
      }

      if (!this.hasAssetClassification(jsxElement)) {
        sectionA.violations.push(
          "Component lacks asset classification (ADHICS AM 3.1 - Asset Classification)",
        );
        sectionA.score -= 15;
      }

      if (!this.hasRiskAssessment(jsxElement)) {
        sectionA.violations.push(
          "Component lacks risk assessment documentation (ADHICS Risk Management)",
        );
        sectionA.score -= 12;
      }

      if (!this.hasGovernanceCompliance(jsxElement)) {
        sectionA.violations.push(
          "Component lacks governance compliance markers (ADHICS Governance Structure)",
        );
        sectionA.score -= 8;
      }

      // Section B - Control Requirements compliance (Enhanced with detailed checklist)
      if (!this.hasAccessControls(jsxElement)) {
        sectionB.violations.push(
          "Component lacks proper access controls (ADHICS AC 1.1 - Access Control Policy)",
        );
        sectionB.score -= 20;
      }

      if (!this.hasInputValidation(jsxElement)) {
        sectionB.violations.push(
          "Component lacks input validation (ADHICS SA 2.3 - Correct Processing)",
        );
        sectionB.score -= 15;
      }

      if (!this.hasErrorHandling(jsxElement)) {
        sectionB.violations.push(
          "Component lacks proper error handling (ADHICS IM 2.1 - Incident Management)",
        );
        sectionB.score -= 10;
      }

      if (!this.hasDataProtection(jsxElement)) {
        sectionB.violations.push(
          "Component lacks data protection measures (ADHICS DP 1.4 - Technical Measures)",
        );
        sectionB.score -= 20;
      }

      if (!this.hasPhysicalSecurityConsiderations(jsxElement)) {
        sectionB.violations.push(
          "Component lacks physical security considerations (ADHICS PE 1.1 - Physical Security Policy)",
        );
        sectionB.score -= 8;
      }

      if (!this.hasMalwareProtection(jsxElement)) {
        sectionB.violations.push(
          "Component lacks malware protection indicators (ADHICS OM 4.1 - Malware Protection)",
        );
        sectionB.score -= 12;
      }

      if (!this.hasBackupConsiderations(jsxElement)) {
        sectionB.violations.push(
          "Component lacks backup and recovery considerations (ADHICS OM 5 - Backup & Archival)",
        );
        sectionB.score -= 5;
      }

      if (!this.hasCommunicationSecurity(jsxElement)) {
        sectionB.violations.push(
          "Component lacks communication security measures (ADHICS CM 1.1 - Communication Policy)",
        );
        sectionB.score -= 10;
      }

      if (!this.hasThirdPartySecurityConsiderations(jsxElement)) {
        sectionB.violations.push(
          "Component lacks third-party security considerations (ADHICS TP 1.1 - Third Party Policy)",
        );
        sectionB.score -= 7;
      }

      if (!this.hasCryptographicControls(jsxElement)) {
        sectionB.violations.push(
          "Component lacks cryptographic controls (ADHICS SA 4.1 - Cryptography Policy)",
        );
        sectionB.score -= 15;
      }

      // Healthcare-specific validations
      if (this.isHealthcareComponent(jsxElement)) {
        if (!this.hasHealthInformationProtection(jsxElement)) {
          sectionB.violations.push(
            "Healthcare component lacks health information protection (ADHICS DP 1.2)",
          );
          sectionB.score -= 25;
        }
      }

      const overallScore = Math.round((sectionA.score + sectionB.score) / 2);
      let level: string;

      if (overallScore >= 95) level = "Excellent";
      else if (overallScore >= 85) level = "Good";
      else if (overallScore >= 75) level = "Acceptable";
      else level = "Needs Improvement";

      return {
        sectionA,
        sectionB,
        overall: { score: overallScore, level },
      };
    } catch (error) {
      return {
        sectionA: { score: 0, violations: ["ADHICS validation failed"] },
        sectionB: { score: 0, violations: ["ADHICS validation failed"] },
        overall: { score: 0, level: "Needs Improvement" },
      };
    }
  }

  /**
   * Enhanced security validation for JSX elements
   */
  private static validateEnhancedSecurity(element: any): {
    issues: string[];
    warnings: string[];
  } {
    const issues: string[] = [];
    const warnings: string[] = [];

    try {
      // Check for dangerous props
      if (element.props) {
        // Check for dangerouslySetInnerHTML (ADHICS AC 6.1)
        if (element.props.dangerouslySetInnerHTML) {
          issues.push(
            "dangerouslySetInnerHTML usage detected - violates ADHICS AC 6.1",
          );
        }

        // Check for inline event handlers with string values
        Object.keys(element.props).forEach((prop) => {
          if (
            prop.startsWith("on") &&
            typeof element.props[prop] === "string"
          ) {
            issues.push(
              `Inline event handler detected: ${prop} - violates ADHICS AC 2.3`,
            );
          }
        });

        // Check for external script sources (ADHICS TP 2.1)
        if (element.type === "script" && element.props.src) {
          const src = element.props.src;
          if (
            typeof src === "string" &&
            !src.startsWith("/") &&
            !src.startsWith("./")
          ) {
            warnings.push(
              "External script source detected - verify ADHICS TP 2.1 compliance",
            );
          }
        }

        // Check for iframe sources (ADHICS PE 2.1)
        if (element.type === "iframe" && element.props.src) {
          warnings.push(
            "iframe detected - ensure ADHICS PE 2.1 secure area compliance",
          );
        }

        // Check for form security (ADHICS DP 1.4)
        if (element.type === "form") {
          if (
            !element.props.method ||
            element.props.method.toLowerCase() !== "post"
          ) {
            issues.push(
              "Form should use POST method - ADHICS DP 1.4 requirement",
            );
          }
          if (
            !element.props.action ||
            element.props.action.startsWith("http://")
          ) {
            issues.push("Form should use HTTPS - ADHICS CO 9.2 requirement");
          }
        }

        // Check for input security (ADHICS AC 2.3)
        if (element.type === "input" && element.props.type === "password") {
          if (
            !element.props.autoComplete ||
            element.props.autoComplete === "on"
          ) {
            issues.push(
              "Password input should have secure autoComplete - ADHICS AC 2.3",
            );
          }
        }
      }

      return { issues, warnings };
    } catch (error) {
      return {
        issues: ["Enhanced security validation failed"],
        warnings: [],
      };
    }
  }

  /**
   * Calculate performance score based on validation metrics
   */
  private static calculatePerformanceScore(metrics: {
    validationTime: number;
    componentCount: number;
    propsCount: number;
    memoryUsage: number;
  }): number {
    let score = 100;

    // Penalize slow validation
    if (metrics.validationTime > 50) score -= 10;
    if (metrics.validationTime > 100) score -= 20;

    // Penalize complex components
    if (metrics.componentCount > 20) score -= 10;
    if (metrics.propsCount > 50) score -= 10;

    // Penalize high memory usage
    if (metrics.memoryUsage > 5 * 1024 * 1024) score -= 15; // 5MB

    return Math.max(0, score);
  }

  /**
   * Calculate compliance score
   */
  private static calculateComplianceScore(factors: {
    structureValid: boolean;
    propsValid: boolean;
    securityValid: boolean;
    adhicsCompliant: boolean;
  }): number {
    let score = 100;

    if (!factors.structureValid) score -= 25;
    if (!factors.propsValid) score -= 20;
    if (!factors.securityValid) score -= 30;
    if (!factors.adhicsCompliant) score -= 25;

    return Math.max(0, score);
  }

  /**
   * Get object depth
   */
  private static getObjectDepth(obj: any, depth = 0): number {
    if (obj === null || typeof obj !== "object") {
      return depth;
    }

    if (depth > 20) {
      // Prevent infinite recursion
      return depth;
    }

    let maxDepth = depth;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const childDepth = this.getObjectDepth(obj[key], depth + 1);
        maxDepth = Math.max(maxDepth, childDepth);
      }
    }

    return maxDepth;
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
   * Check if component has security documentation
   */
  private static hasSecurityDocumentation(jsxElement: any): boolean {
    return (
      jsxElement.props?.["data-security-doc"] ||
      jsxElement.props?.["data-adhics-compliant"] ||
      false
    );
  }

  /**
   * Check if component has asset classification
   */
  private static hasAssetClassification(jsxElement: any): boolean {
    return (
      jsxElement.props?.["data-classification"] ||
      jsxElement.props?.["data-sensitivity"] ||
      false
    );
  }

  /**
   * Check if component has proper access controls
   */
  private static hasAccessControls(jsxElement: any): boolean {
    return (
      jsxElement.props?.["data-access-control"] ||
      jsxElement.props?.role ||
      jsxElement.props?.["aria-label"] ||
      false
    );
  }

  /**
   * Check if component has input validation
   */
  private static hasInputValidation(jsxElement: any): boolean {
    if (jsxElement.type === "input" || jsxElement.type === "textarea") {
      return (
        jsxElement.props?.pattern ||
        jsxElement.props?.required ||
        jsxElement.props?.minLength ||
        jsxElement.props?.maxLength ||
        jsxElement.props?.min ||
        jsxElement.props?.max ||
        false
      );
    }
    return true; // Non-input elements don't need validation
  }

  /**
   * Check if component has error handling
   */
  private static hasErrorHandling(jsxElement: any): boolean {
    return (
      jsxElement.props?.onError ||
      jsxElement.props?.["data-error-boundary"] ||
      false
    );
  }

  /**
   * Check if component has data protection measures
   */
  private static hasDataProtection(jsxElement: any): boolean {
    if (jsxElement.type === "input" && jsxElement.props?.type === "password") {
      return jsxElement.props?.autoComplete !== "on";
    }
    return (
      jsxElement.props?.["data-encrypted"] ||
      jsxElement.props?.["data-protected"] ||
      true
    ); // Default to true for non-sensitive components
  }

  /**
   * Check if component is healthcare-related
   */
  private static isHealthcareComponent(jsxElement: any): boolean {
    const healthcareKeywords = [
      "patient",
      "medical",
      "health",
      "clinical",
      "diagnosis",
      "treatment",
    ];
    const elementString = JSON.stringify(jsxElement).toLowerCase();
    return healthcareKeywords.some((keyword) =>
      elementString.includes(keyword),
    );
  }

  /**
   * Check if healthcare component has health information protection
   */
  private static hasHealthInformationProtection(jsxElement: any): boolean {
    return (
      jsxElement.props?.["data-phi-protected"] ||
      jsxElement.props?.["data-hipaa-compliant"] ||
      jsxElement.props?.["data-health-encrypted"] ||
      false
    );
  }

  /**
   * Check if component has risk assessment documentation
   */
  private static hasRiskAssessment(jsxElement: any): boolean {
    return (
      jsxElement.props?.["data-risk-assessed"] ||
      jsxElement.props?.["data-risk-level"] ||
      jsxElement.props?.["data-risk-mitigation"] ||
      false
    );
  }

  /**
   * Check if component has governance compliance markers
   */
  private static hasGovernanceCompliance(jsxElement: any): boolean {
    return (
      jsxElement.props?.["data-governance-approved"] ||
      jsxElement.props?.["data-policy-compliant"] ||
      jsxElement.props?.["data-governance-review"] ||
      false
    );
  }

  /**
   * Check if component has physical security considerations
   */
  private static hasPhysicalSecurityConsiderations(jsxElement: any): boolean {
    return (
      jsxElement.props?.["data-physical-security"] ||
      jsxElement.props?.["data-secure-area"] ||
      jsxElement.props?.["data-access-controlled"] ||
      false
    );
  }

  /**
   * Check if component has malware protection indicators
   */
  private static hasMalwareProtection(jsxElement: any): boolean {
    return (
      jsxElement.props?.["data-malware-scanned"] ||
      jsxElement.props?.["data-virus-protected"] ||
      jsxElement.props?.["data-security-scanned"] ||
      false
    );
  }

  /**
   * Check if component has backup considerations
   */
  private static hasBackupConsiderations(jsxElement: any): boolean {
    return (
      jsxElement.props?.["data-backup-enabled"] ||
      jsxElement.props?.["data-recovery-plan"] ||
      jsxElement.props?.["data-backup-tested"] ||
      false
    );
  }

  /**
   * Check if component has communication security measures
   */
  private static hasCommunicationSecurity(jsxElement: any): boolean {
    return (
      jsxElement.props?.["data-encrypted-communication"] ||
      jsxElement.props?.["data-secure-channel"] ||
      jsxElement.props?.["data-tls-enabled"] ||
      false
    );
  }

  /**
   * Check if component has third-party security considerations
   */
  private static hasThirdPartySecurityConsiderations(jsxElement: any): boolean {
    return (
      jsxElement.props?.["data-third-party-verified"] ||
      jsxElement.props?.["data-vendor-approved"] ||
      jsxElement.props?.["data-third-party-secure"] ||
      false
    );
  }

  /**
   * Check if component has cryptographic controls
   */
  private static hasCryptographicControls(jsxElement: any): boolean {
    return (
      jsxElement.props?.["data-encrypted"] ||
      jsxElement.props?.["data-crypto-compliant"] ||
      jsxElement.props?.["data-key-managed"] ||
      false
    );
  }

  /**
   * Sanitize JSX element for security
   */
  static sanitize(jsxElement: any): any {
    try {
      if (!React.isValidElement(jsxElement)) {
        return jsxElement;
      }

      // Clone element with sanitized props
      const sanitizedProps = this.sanitizeProps(jsxElement.props);
      return React.cloneElement(jsxElement, sanitizedProps);
    } catch (error) {
      console.warn("JSX sanitization failed:", error);
      return jsxElement;
    }
  }

  /**
   * Sanitize props
   */
  private static sanitizeProps(props: any): any {
    if (!props || typeof props !== "object") {
      return props;
    }

    const sanitized = { ...props };

    for (const key in sanitized) {
      if (sanitized.hasOwnProperty(key)) {
        const value = sanitized[key];

        // Remove dangerous props
        if (key === "dangerouslySetInnerHTML") {
          delete sanitized[key];
          continue;
        }

        // Sanitize string values
        if (typeof value === "string") {
          // Remove potentially dangerous content
          sanitized[key] = value
            .replace(/<script[^>]*>.*?<\/script>/gi, "")
            .replace(/javascript:/gi, "")
            .replace(/on\w+\s*=/gi, "");
        }

        // Recursively sanitize object values
        if (typeof value === "object" && value !== null) {
          sanitized[key] = this.sanitizeProps(value);
        }
      }
    }

    return sanitized;
  }

  /**
   * Create safe JSX element with validation
   */
  static createSafeElement(
    type: any,
    props?: any,
    ...children: any[]
  ): React.ReactElement | null {
    try {
      // Validate props
      if (props) {
        const propsValidation = this.validateProps({ props });
        if (!propsValidation.isValid) {
          console.warn("Invalid props detected:", propsValidation.errors);
          return null;
        }
      }

      // Create element
      const element = React.createElement(type, props, ...children);

      // Validate created element
      const validation = this.validate(element);
      if (!validation.isValid) {
        console.warn("Invalid JSX element created:", validation.errors);
        return null;
      }

      return element;
    } catch (error) {
      console.error("Failed to create safe JSX element:", error);
      return null;
    }
  }
}

// Zod schemas for JSX validation
export const JSXElementSchema = z.object({
  type: z.union([z.string(), z.function()]),
  props: z.record(z.any()).optional(),
  key: z.union([z.string(), z.number()]).optional(),
  ref: z.any().optional(),
});

export const JSXValidationResultSchema = z.object({
  isValid: z.boolean(),
  component: z.any().optional(),
  error: z.string().optional(),
  errors: z.array(z.string()).optional(),
  warnings: z.array(z.string()).optional(),
  sanitized: z.boolean().optional(),
  memoryUsage: z.number().optional(),
  performanceMetrics: z
    .object({
      validationTime: z.number(),
      componentCount: z.number(),
      propsCount: z.number(),
    })
    .optional(),
  securityIssues: z.array(z.string()).optional(),
  performanceScore: z.number().optional(),
  complianceScore: z.number().optional(),
  adhicsCompliance: z
    .object({
      sectionA: z.object({
        score: z.number(),
        violations: z.array(z.string()),
      }),
      sectionB: z.object({
        score: z.number(),
        violations: z.array(z.string()),
      }),
      overall: z.object({
        score: z.number(),
        level: z.string(),
      }),
    })
    .optional(),
});

export default JSXValidator;
