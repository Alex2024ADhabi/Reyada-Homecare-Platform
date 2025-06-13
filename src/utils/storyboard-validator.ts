/**
 * Storyboard Validator - Validates storyboard files for common JSX issues
 */

import React from "react";

export interface StoryboardValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export class StoryboardValidator {
  /**
   * Validate a storyboard component for common issues
   */
  static validateStoryboard(
    component: any,
    storyboardName: string,
  ): StoryboardValidationResult {
    const result: StoryboardValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
    };

    try {
      // Check if component exists
      if (!component) {
        result.errors.push("Component is null or undefined");
        result.isValid = false;
        return result;
      }

      // Check if it's a valid React component
      if (typeof component !== "function" && typeof component !== "object") {
        result.errors.push(`Invalid component type: ${typeof component}`);
        result.isValid = false;
      }

      // Try to create a React element
      if (typeof component === "function") {
        try {
          const testElement = React.createElement(component, {});
          if (!testElement) {
            result.warnings.push(
              "Component does not return a valid React element",
            );
          }
        } catch (renderError) {
          result.warnings.push(`Component render test failed: ${renderError}`);
        }
      }

      // Check for common naming issues
      if (storyboardName && !storyboardName.match(/^[A-Z][a-zA-Z0-9]*$/)) {
        result.warnings.push(
          "Component name should start with uppercase letter and contain only alphanumeric characters",
        );
      }

      // Add suggestions for improvement
      if (result.warnings.length === 0 && result.errors.length === 0) {
        result.suggestions.push("Component appears to be valid");
      }

      if (result.errors.length > 0) {
        result.isValid = false;
      }
    } catch (error) {
      result.errors.push(`Validation failed: ${error}`);
      result.isValid = false;
    }

    return result;
  }

  /**
   * Validate storyboard file content for JSX syntax issues
   */
  static validateStoryboardContent(
    content: string,
  ): StoryboardValidationResult {
    const result: StoryboardValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
    };

    try {
      // Check for React import
      if (!content.includes("import React") && !content.includes("import { ")) {
        result.warnings.push(
          "Missing React import - add \"import React from 'react';\"",
        );
      }

      // Check for proper export
      if (!content.includes("export default")) {
        result.errors.push("Missing default export");
        result.isValid = false;
      }

      // Check for unclosed JSX tags
      const openTags = content.match(/<[^/>][^>]*>/g) || [];
      const closeTags = content.match(/<\/[^>]+>/g) || [];
      const selfClosingTags = content.match(/<[^>]*\/>/g) || [];

      if (openTags.length !== closeTags.length + selfClosingTags.length) {
        result.warnings.push("Potential unclosed JSX tags detected");
      }

      // Check for common JSX issues
      if (content.includes("class=")) {
        result.warnings.push('Use "className" instead of "class" in JSX');
      }

      if (content.includes("for=")) {
        result.warnings.push('Use "htmlFor" instead of "for" in JSX');
      }

      // Check for unterminated strings
      const singleQuotes = (content.match(/'/g) || []).length;
      const doubleQuotes = (content.match(/"/g) || []).length;
      const backticks = (content.match(/`/g) || []).length;

      if (singleQuotes % 2 !== 0) {
        result.errors.push("Unterminated single quote string detected");
        result.isValid = false;
      }

      if (doubleQuotes % 2 !== 0) {
        result.errors.push("Unterminated double quote string detected");
        result.isValid = false;
      }

      if (backticks % 2 !== 0) {
        result.errors.push("Unterminated template literal detected");
        result.isValid = false;
      }
    } catch (error) {
      result.errors.push(`Content validation failed: ${error}`);
      result.isValid = false;
    }

    return result;
  }

  /**
   * Generate a fixed version of storyboard content
   */
  static fixStoryboardContent(content: string, storyboardName: string): string {
    let fixedContent = content;

    // Add React import if missing
    if (!fixedContent.includes("import React")) {
      fixedContent = `import React from 'react';\n${fixedContent}`;
    }

    // Fix className
    fixedContent = fixedContent.replace(/class=/g, "className=");

    // Fix htmlFor
    fixedContent = fixedContent.replace(/for=/g, "htmlFor=");

    // Ensure proper export if missing
    if (!fixedContent.includes("export default")) {
      const componentName = storyboardName || "StoryboardComponent";
      fixedContent += `\n\nexport default ${componentName};`;
    }

    return fixedContent;
  }
}

export default StoryboardValidator;
