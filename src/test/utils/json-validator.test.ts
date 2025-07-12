import { describe, it, expect } from "vitest";
import { JsonValidator } from "@/utils/json-validator";

describe("JsonValidator", () => {
  describe("validate", () => {
    it("should validate correct JSON", () => {
      const validJson = '{"name": "test", "value": 123}';
      const result = JsonValidator.validate(validJson);

      expect(result.isValid).toBe(true);
      expect(result.data).toEqual({ name: "test", value: 123 });
      expect(result.errors).toEqual([]);
    });

    it("should detect invalid JSON", () => {
      const invalidJson = '{"name": "test", "value": 123,}';
      const result = JsonValidator.validate(invalidJson);

      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.errors).toHaveLength(1);
    });

    it("should provide auto-fix suggestions", () => {
      const invalidJson = '{"name": "test", "value": 123,}';
      const result = JsonValidator.validate(invalidJson);

      expect(result.correctedJson).toBeDefined();
      expect(result.correctedJson).toBe('{"name": "test", "value": 123}');
    });

    it("should handle empty input", () => {
      const result = JsonValidator.validate("");

      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("attemptAutoFix", () => {
    it("should fix trailing commas", () => {
      const input = '{"key": "value",}';
      const fixed = JsonValidator.attemptAutoFix(input);

      expect(fixed).toBe('{"key": "value"}');
    });

    it("should fix single quotes", () => {
      const input = "{'key': 'value'}";
      const fixed = JsonValidator.attemptAutoFix(input);

      expect(fixed).toBe('{"key": "value"}');
    });

    it("should fix unquoted keys", () => {
      const input = '{key: "value"}';
      const fixed = JsonValidator.attemptAutoFix(input);

      expect(fixed).toBe('{"key": "value"}');
    });

    it("should return null for unfixable JSON", () => {
      const input = "{key: value: invalid}";
      const fixed = JsonValidator.attemptAutoFix(input);

      expect(fixed).toBeNull();
    });
  });

  describe("format", () => {
    it("should format JSON with proper indentation", () => {
      const input = '{"name":"test","value":123}';
      const formatted = JsonValidator.format(input, 2);

      expect(formatted).toBe('{\n  "name": "test",\n  "value": 123\n}');
    });

    it("should handle arrays", () => {
      const input = "[1,2,3]";
      const formatted = JsonValidator.format(input, 2);

      expect(formatted).toBe("[\n  1,\n  2,\n  3\n]");
    });
  });

  describe("validateAiChanges", () => {
    it("should validate correct AI changes structure", () => {
      const changes = {
        changes: [
          {
            command: "create",
            path: "test.ts",
            file_text: 'console.log("test");',
          },
        ],
      };

      const result = JsonValidator.validateAiChanges(changes);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("should detect missing changes array", () => {
      const changes = { invalid: true };
      const result = JsonValidator.validateAiChanges(changes);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Changes must contain a "changes" array');
    });

    it("should validate terminal commands", () => {
      const changes = {
        changes: [
          {
            termCommand: "npm install",
            requiresRestart: true,
          },
        ],
      };

      const result = JsonValidator.validateAiChanges(changes);
      expect(result.isValid).toBe(true);
    });

    it("should validate storyboard changes", () => {
      const changes = {
        changes: [
          {
            storyboardName: "TestStoryboard",
            size: { width: 800, height: 600 },
            topLeftCorner: { x: 100, y: 100 },
          },
        ],
      };

      const result = JsonValidator.validateAiChanges(changes);
      expect(result.isValid).toBe(true);
    });
  });

  describe("safeStringify", () => {
    it("should safely stringify objects", () => {
      const obj = { name: "test", value: 123 };
      const result = JsonValidator.safeStringify(obj);

      expect(result).toBe('{"name":"test","value":123}');
    });

    it("should handle special characters", () => {
      const obj = { message: 'Hello\nWorld\t"Test"' };
      const result = JsonValidator.safeStringify(obj);

      expect(result).toContain("\\n");
      expect(result).toContain("\\t");
    });

    it("should handle circular references gracefully", () => {
      const obj: any = { name: "test" };
      obj.self = obj;

      const result = JsonValidator.safeStringify(obj);
      expect(result).toContain("error");
    });
  });

  describe("getFormattingRules", () => {
    it("should return formatting rules", () => {
      const rules = JsonValidator.getFormattingRules();

      expect(Array.isArray(rules)).toBe(true);
      expect(rules.length).toBeGreaterThan(0);
      expect(rules[0]).toContain("double quotes");
    });
  });
});
