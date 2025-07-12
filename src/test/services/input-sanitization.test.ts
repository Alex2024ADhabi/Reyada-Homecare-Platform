import { describe, it, expect, beforeEach } from "vitest";
import { inputSanitizer } from "@/services/input-sanitization.service";
import type { ValidationRule } from "@/services/input-sanitization.service";

describe("InputSanitizationService", () => {
  describe("HTML Sanitization", () => {
    it("should sanitize malicious script tags", () => {
      const maliciousInput = '<script>alert("XSS")</script><p>Safe content</p>';
      const result = inputSanitizer.sanitizeHtml(maliciousInput);

      expect(result.sanitized).not.toContain("<script>");
      expect(result.sanitized).not.toContain("alert");
      expect(result.sanitized).toContain("Safe content");
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it("should remove dangerous event handlers", () => {
      const maliciousInput = '<div onclick="alert(1)">Click me</div>';
      const result = inputSanitizer.sanitizeHtml(maliciousInput);

      expect(result.sanitized).not.toContain("onclick");
      expect(result.sanitized).not.toContain("alert");
      expect(result.sanitized).toContain("Click me");
    });

    it("should preserve safe HTML tags", () => {
      const safeInput =
        "<p><strong>Bold text</strong> and <em>italic text</em></p>";
      const result = inputSanitizer.sanitizeHtml(safeInput, {
        allowedTags: ["p", "strong", "em"],
      });

      expect(result.sanitized).toContain("<p>");
      expect(result.sanitized).toContain("<strong>");
      expect(result.sanitized).toContain("<em>");
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it("should handle iframe and object tags", () => {
      const maliciousInput =
        '<iframe src="javascript:alert(1)"></iframe><object data="malicious.swf"></object>';
      const result = inputSanitizer.sanitizeHtml(maliciousInput);

      expect(result.sanitized).not.toContain("<iframe>");
      expect(result.sanitized).not.toContain("<object>");
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it("should enforce maximum length", () => {
      const longInput = "a".repeat(1000);
      const result = inputSanitizer.sanitizeHtml(longInput, { maxLength: 500 });

      expect(result.sanitized.length).toBeLessThanOrEqual(500);
      expect(result.warnings).toContain(
        "Input was truncated to maximum allowed length",
      );
    });

    it("should detect data URLs", () => {
      const maliciousInput =
        '<img src="data:text/html,<script>alert(1)</script>">';
      const result = inputSanitizer.sanitizeHtml(maliciousInput);

      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe("Text Sanitization", () => {
    it("should remove control characters", () => {
      const input = "Hello\x00\x01World\x7F";
      const result = inputSanitizer.sanitizeText(input);

      expect(result.sanitized).toBe("HelloWorld");
      expect(result.isValid).toBe(true);
    });

    it("should normalize whitespace", () => {
      const input = "  Hello    World  \n\n  Test  ";
      const result = inputSanitizer.sanitizeText(input);

      expect(result.sanitized).toBe("Hello World Test");
    });

    it("should detect HTML tags in text", () => {
      const input = "Hello <script>alert(1)</script> World";
      const result = inputSanitizer.sanitizeText(input);

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain("Suspicious content detected");
    });

    it("should detect HTML entities", () => {
      const input = "Hello &lt;script&gt; World";
      const result = inputSanitizer.sanitizeText(input);

      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it("should enforce text length limits", () => {
      const longText = "a".repeat(1000);
      const result = inputSanitizer.sanitizeText(longText, 500);

      expect(result.sanitized.length).toBe(500);
      expect(result.warnings).toContain("Text truncated to 500 characters");
    });
  });

  describe("Form Validation", () => {
    it("should validate required fields", () => {
      const formData = {
        name: "",
        email: "test@example.com",
      };

      const rules: Record<string, ValidationRule[]> = {
        name: [{ type: "required", message: "Name is required" }],
        email: [{ type: "required", message: "Email is required" }],
      };

      const result = inputSanitizer.validateFormData(formData, rules);

      expect(result.isValid).toBe(false);
      expect(result.errors.name).toContain("Name is required");
      expect(result.errors.email).toBeUndefined();
    });

    it("should validate email format", () => {
      const formData = {
        email: "invalid-email",
      };

      const rules: Record<string, ValidationRule[]> = {
        email: [{ type: "email", message: "Invalid email format" }],
      };

      const result = inputSanitizer.validateFormData(formData, rules);

      expect(result.isValid).toBe(false);
      expect(result.errors.email).toContain("Invalid email format");
    });

    it("should validate UAE phone numbers", () => {
      const validPhones = ["+971501234567", "971501234567", "0501234567"];
      const invalidPhones = ["123456", "+1234567890", "not-a-phone"];

      const rules: Record<string, ValidationRule[]> = {
        phone: [{ type: "phone", message: "Invalid phone format" }],
      };

      validPhones.forEach((phone) => {
        const result = inputSanitizer.validateFormData({ phone }, rules);
        expect(result.isValid).toBe(true);
      });

      invalidPhones.forEach((phone) => {
        const result = inputSanitizer.validateFormData({ phone }, rules);
        expect(result.isValid).toBe(false);
      });
    });

    it("should validate URLs", () => {
      const validUrls = ["https://example.com", "http://test.org"];
      const invalidUrls = [
        "not-a-url",
        "ftp://example.com",
        "javascript:alert(1)",
      ];

      const rules: Record<string, ValidationRule[]> = {
        url: [{ type: "url", message: "Invalid URL format" }],
      };

      validUrls.forEach((url) => {
        const result = inputSanitizer.validateFormData({ url }, rules);
        expect(result.isValid).toBe(true);
      });

      invalidUrls.forEach((url) => {
        const result = inputSanitizer.validateFormData({ url }, rules);
        expect(result.isValid).toBe(false);
      });
    });

    it("should validate string length", () => {
      const formData = {
        shortText: "Hi",
        longText: "a".repeat(1000),
      };

      const rules: Record<string, ValidationRule[]> = {
        shortText: [
          { type: "length", value: { min: 5 }, message: "Too short" },
        ],
        longText: [
          { type: "length", value: { max: 500 }, message: "Too long" },
        ],
      };

      const result = inputSanitizer.validateFormData(formData, rules);

      expect(result.isValid).toBe(false);
      expect(result.errors.shortText).toContain("Too short");
      expect(result.errors.longText).toContain("Too long");
    });

    it("should validate with custom validators", () => {
      const formData = {
        customField: "invalid-value",
      };

      const rules: Record<string, ValidationRule[]> = {
        customField: [
          {
            type: "custom",
            message: "Custom validation failed",
            validator: (value) => value === "valid-value",
          },
        ],
      };

      const result = inputSanitizer.validateFormData(formData, rules);

      expect(result.isValid).toBe(false);
      expect(result.errors.customField).toContain("Custom validation failed");
    });

    it("should sanitize form data during validation", () => {
      const formData = {
        name: "  John Doe  ",
        description: "<script>alert(1)</script>Safe content",
      };

      const rules: Record<string, ValidationRule[]> = {
        name: [{ type: "required", message: "Name required" }],
      };

      const result = inputSanitizer.validateFormData(formData, rules);

      expect(result.sanitizedData.name).toBe("John Doe");
      expect(result.sanitizedData.description).not.toContain("<script>");
      expect(result.sanitizedData.description).toContain("Safe content");
    });
  });

  describe("CSP Header Generation", () => {
    it("should generate valid CSP header", () => {
      const cspHeader = inputSanitizer.generateCSPHeader();

      expect(cspHeader).toContain("default-src 'self'");
      expect(cspHeader).toContain("script-src 'self'");
      expect(cspHeader).toContain("object-src 'none'");
      expect(cspHeader).toContain("frame-src 'none'");
      expect(typeof cspHeader).toBe("string");
    });
  });

  describe("Edge Cases", () => {
    it("should handle null and undefined inputs", () => {
      const result1 = inputSanitizer.sanitizeText("");
      expect(result1.sanitized).toBe("");
      expect(result1.isValid).toBe(true);
    });

    it("should handle very large inputs gracefully", () => {
      const hugeInput = "a".repeat(100000);
      const result = inputSanitizer.sanitizeHtml(hugeInput, {
        maxLength: 1000,
      });

      expect(result.sanitized.length).toBeLessThanOrEqual(1000);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it("should handle special Unicode characters", () => {
      const unicodeInput = "🚀 Hello 世界 🌍";
      const result = inputSanitizer.sanitizeText(unicodeInput);

      expect(result.sanitized).toContain("🚀");
      expect(result.sanitized).toContain("世界");
      expect(result.sanitized).toContain("🌍");
      expect(result.isValid).toBe(true);
    });
  });
});
