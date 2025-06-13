/**
 * JSX Syntax Fixer - Automatically fixes common JSX syntax issues
 */

export interface JSXFixResult {
  fixed: boolean;
  originalContent: string;
  fixedContent: string;
  appliedFixes: string[];
  remainingIssues: string[];
}

export class JSXSyntaxFixer {
  /**
   * Fix common JSX syntax issues in storyboard files with enhanced error handling
   */
  static fixJSXSyntax(content: string, filename?: string): JSXFixResult {
    const result: JSXFixResult = {
      fixed: false,
      originalContent: content,
      fixedContent: content,
      appliedFixes: [],
      remainingIssues: [],
    };

    if (!content || typeof content !== "string") {
      result.remainingIssues.push("Invalid or empty content provided");
      return result;
    }

    let fixedContent = content;
    const appliedFixes: string[] = [];

    try {
      // Fix 1: Add React import if missing
      if (
        !fixedContent.includes("import React") &&
        !fixedContent.includes("import { ")
      ) {
        fixedContent = `import React from 'react';\n${fixedContent}`;
        appliedFixes.push("Added React import");
      }

      // Fix 2: Fix className instead of class
      if (fixedContent.includes("class=")) {
        fixedContent = fixedContent.replace(/\bclass=/g, "className=");
        appliedFixes.push("Fixed class to className");
      }

      // Fix 3: Fix htmlFor instead of for
      if (fixedContent.includes("for=")) {
        fixedContent = fixedContent.replace(/\bfor=/g, "htmlFor=");
        appliedFixes.push("Fixed for to htmlFor");
      }

      // Fix 4: Fix self-closing tags
      fixedContent = fixedContent.replace(
        /<(img|br|hr|input|meta|link)([^>]*)(?<!\/)>/g,
        "<$1$2 />",
      );
      if (fixedContent !== result.fixedContent) {
        appliedFixes.push("Fixed self-closing tags");
      }

      // Fix 5: Fix unterminated strings (basic detection)
      const lines = fixedContent.split("\n");
      const fixedLines = lines.map((line, index) => {
        // Check for unterminated strings in JSX attributes
        if (line.includes("=") && line.includes("<")) {
          // Simple fix for common unterminated string patterns
          let fixedLine = line;

          // Fix unterminated double quotes in attributes
          const doubleQuoteMatches = line.match(/="[^"]*$/g);
          if (doubleQuoteMatches) {
            fixedLine = line + '"';
            appliedFixes.push(`Fixed unterminated string on line ${index + 1}`);
          }

          // Fix unterminated single quotes in attributes
          const singleQuoteMatches = line.match(/='[^']*$/g);
          if (singleQuoteMatches) {
            fixedLine = line + "'";
            appliedFixes.push(`Fixed unterminated string on line ${index + 1}`);
          }

          return fixedLine;
        }
        return line;
      });
      fixedContent = fixedLines.join("\n");

      // Fix 6: Fix missing closing tags (basic detection)
      const openTags =
        fixedContent.match(/<([a-zA-Z][a-zA-Z0-9]*)[^>]*(?<!\/)>/g) || [];
      const closeTags = fixedContent.match(/<\/([a-zA-Z][a-zA-Z0-9]*)>/g) || [];
      const selfClosingTags =
        fixedContent.match(/<[a-zA-Z][a-zA-Z0-9]*[^>]*\/>/g) || [];

      // Extract tag names
      const openTagNames = openTags
        .map((tag) => {
          const match = tag.match(/<([a-zA-Z][a-zA-Z0-9]*)/);
          return match ? match[1] : null;
        })
        .filter(Boolean);

      const closeTagNames = closeTags
        .map((tag) => {
          const match = tag.match(/<\/([a-zA-Z][a-zA-Z0-9]*)/);
          return match ? match[1] : null;
        })
        .filter(Boolean);

      // Check for missing closing tags
      const tagCounts: Record<string, number> = {};
      openTagNames.forEach((tag) => {
        if (tag) tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
      closeTagNames.forEach((tag) => {
        if (tag) tagCounts[tag] = (tagCounts[tag] || 0) - 1;
      });

      // Add missing closing tags (simple approach)
      Object.entries(tagCounts).forEach(([tag, count]) => {
        if (
          count > 0 &&
          !["img", "br", "hr", "input", "meta", "link"].includes(tag)
        ) {
          // Add missing closing tags at the end
          for (let i = 0; i < count; i++) {
            fixedContent += `\n</${tag}>`;
            appliedFixes.push(`Added missing closing tag for ${tag}`);
          }
        }
      });

      // Fix 7: Ensure proper export
      if (!fixedContent.includes("export default")) {
        const componentName = filename
          ? filename
              .replace(/.*\//, "")
              .replace(/\.[^.]*$/, "")
              .replace(/[^a-zA-Z0-9]/g, "")
          : "StoryboardComponent";

        // Try to find function or const declarations
        const functionMatch = fixedContent.match(
          /function\s+([a-zA-Z][a-zA-Z0-9]*)/,
        );
        const constMatch = fixedContent.match(
          /const\s+([a-zA-Z][a-zA-Z0-9]*)\s*=/,
        );

        const exportName =
          functionMatch?.[1] || constMatch?.[1] || componentName;
        fixedContent += `\n\nexport default ${exportName};`;
        appliedFixes.push("Added default export");
      }

      // Fix 8: Fix JSX expressions with enhanced validation
      const originalExpressionCount = (fixedContent.match(/\{[^}]*\}/g) || [])
        .length;
      fixedContent = fixedContent.replace(
        /\{\s*([^}]+)\s*\}/g,
        (match, expression) => {
          try {
            // Basic validation of JSX expressions
            const trimmedExpression = expression.trim();

            // Allow valid expressions but fix common issues
            if (trimmedExpression) {
              // Fix undefined references
              if (trimmedExpression.includes("undefined")) {
                return "{null}";
              }

              // Fix null references that aren't comparisons
              if (
                trimmedExpression === "null" ||
                (trimmedExpression.includes("null") &&
                  !trimmedExpression.includes("!== null") &&
                  !trimmedExpression.includes("=== null"))
              ) {
                return "{null}";
              }

              // Remove comments
              if (
                trimmedExpression.startsWith("//") ||
                trimmedExpression.startsWith("/*")
              ) {
                return "{/* Comment removed */}";
              }

              // Keep valid expressions
              return match;
            }

            // Replace empty expressions
            return "{null}";
          } catch (expressionError) {
            console.warn("Error processing JSX expression:", expressionError);
            return "{null}";
          }
        },
      );

      const newExpressionCount = (fixedContent.match(/\{[^}]*\}/g) || [])
        .length;
      if (newExpressionCount !== originalExpressionCount) {
        appliedFixes.push(
          `Fixed ${Math.abs(originalExpressionCount - newExpressionCount)} JSX expressions`,
        );
      }

      // Fix 9: Enhanced null safety checks
      const nullUnsafePatterns = [
        /\.([a-zA-Z_$][a-zA-Z0-9_$]*)(\s*\?\s*)?(?!\?)/g, // Add optional chaining
        /\[([^\]]+)\](?!\?)/g, // Add optional chaining for array access
      ];

      let nullSafetyFixes = 0;
      for (const pattern of nullUnsafePatterns) {
        const matches = fixedContent.match(pattern);
        if (matches) {
          nullSafetyFixes += matches.length;
          // Apply null safety fixes (simplified for demonstration)
          fixedContent = fixedContent.replace(pattern, (match) => {
            if (!match.includes("?")) {
              return match.replace(/\.([a-zA-Z_$])/, "?.\$1");
            }
            return match;
          });
        }
      }

      if (nullSafetyFixes > 0) {
        appliedFixes.push(`Added ${nullSafetyFixes} null safety checks`);
      }

      result.fixedContent = fixedContent;
      result.appliedFixes = appliedFixes;
      result.fixed = appliedFixes.length > 0;

      // Enhanced remaining issues detection
      const remainingIssues: string[] = [];

      // Check for potential remaining syntax issues (more lenient)
      const undefinedMatches = fixedContent.match(/\bundefined\b/g) || [];
      const typeofMatches = fixedContent.match(/typeof\s+\w+/g) || [];
      if (undefinedMatches.length > typeofMatches.length) {
        remainingIssues.push(
          "May contain undefined references - review recommended",
        );
      }

      // More lenient null check
      const nullMatches = fixedContent.match(/\bnull\b/g) || [];
      const nullComparisonMatches =
        fixedContent.match(/(===|!==)\s*null/g) || [];
      if (nullMatches.length > nullComparisonMatches.length * 2) {
        remainingIssues.push(
          "May contain null references - review recommended",
        );
      }

      // Check for unmatched brackets
      const openBrackets = (fixedContent.match(/\{/g) || []).length;
      const closeBrackets = (fixedContent.match(/\}/g) || []).length;
      if (openBrackets !== closeBrackets) {
        remainingIssues.push(
          `Unmatched curly brackets (${openBrackets} open, ${closeBrackets} close)`,
        );
      }

      // Check for unmatched parentheses
      const openParens = (fixedContent.match(/\(/g) || []).length;
      const closeParens = (fixedContent.match(/\)/g) || []).length;
      if (openParens !== closeParens) {
        remainingIssues.push(
          `Unmatched parentheses (${openParens} open, ${closeParens} close)`,
        );
      }

      // Check for potential import issues
      if (fixedContent.includes("import") && !fixedContent.includes("from")) {
        remainingIssues.push("Incomplete import statements detected");
      }

      result.remainingIssues = remainingIssues;
    } catch (error) {
      result.remainingIssues.push(`Fix process failed: ${error}`);
    }

    return result;
  }

  /**
   * Validate JSX syntax
   */
  static validateJSXSyntax(content: string): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Check for React import
      if (!content.includes("import React")) {
        warnings.push("Missing React import");
      }

      // Check for export
      if (!content.includes("export")) {
        errors.push("Missing export statement");
      }

      // Check for unterminated strings
      const singleQuotes = (content.match(/'/g) || []).length;
      const doubleQuotes = (content.match(/"/g) || []).length;
      const backticks = (content.match(/`/g) || []).length;

      if (singleQuotes % 2 !== 0) {
        errors.push("Unterminated single quote string");
      }

      if (doubleQuotes % 2 !== 0) {
        errors.push("Unterminated double quote string");
      }

      if (backticks % 2 !== 0) {
        errors.push("Unterminated template literal");
      }

      // Check for unmatched brackets
      const openBrackets = (content.match(/\{/g) || []).length;
      const closeBrackets = (content.match(/\}/g) || []).length;
      if (openBrackets !== closeBrackets) {
        errors.push("Unmatched curly brackets");
      }

      // Check for common JSX issues
      if (content.includes("class=")) {
        warnings.push("Use className instead of class");
      }

      if (content.includes("for=")) {
        warnings.push("Use htmlFor instead of for");
      }
    } catch (error) {
      errors.push(`Validation failed: ${error}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

export default JSXSyntaxFixer;
