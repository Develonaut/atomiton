/**
 * Integration tests for code node field generation
 * Tests the complete pipeline: schema → createFieldsFromSchema → field config
 * Validates that field constraints match actual schema validation behavior
 */

import { describe, expect, it } from "vitest";
import { codeFields } from "#definitions/code/fields";
import { codeSchema } from "#schemas/code";

describe("Code Node Fields Integration", () => {
  describe("Field Generation Pipeline", () => {
    it("should generate all expected fields from schema", () => {
      const fieldKeys = Object.keys(codeFields);

      // Should include all fields from codeSchemaShape
      expect(fieldKeys).toContain("code");
      expect(fieldKeys).toContain("returnType");
      expect(fieldKeys).toContain("context");

      // Should also include base schema fields
      expect(fieldKeys).toContain("enabled");
      expect(fieldKeys).toContain("timeout");
      expect(fieldKeys).toContain("retries");
      expect(fieldKeys).toContain("label");
      expect(fieldKeys).toContain("description");
    });

    it("should have exactly 8 fields total", () => {
      // 3 code-specific + 5 base fields
      expect(Object.keys(codeFields)).toHaveLength(8);
    });

    it("should have field config for every schema field", () => {
      const schemaKeys = Object.keys(codeSchema.shape);

      for (const key of schemaKeys) {
        expect(codeFields[key]).toBeDefined();
        expect(codeFields[key].controlType).toBeDefined();
        expect(codeFields[key].label).toBeDefined();
      }
    });

    it("should not have extra fields not in schema", () => {
      const schemaKeys = Object.keys(codeSchema.shape);
      const fieldKeys = Object.keys(codeFields);

      for (const key of fieldKeys) {
        expect(schemaKeys).toContain(key);
      }
    });
  });

  describe("Auto-Derived Fields", () => {
    describe("Code Field", () => {
      it("should have textarea control type (overridden)", () => {
        expect(codeFields.code.controlType).toBe("textarea");
      });

      it("should be required (auto-derived from schema min(1))", () => {
        expect(codeFields.code.required).toBe(true);

        // Verify schema validates this constraint
        const resultEmpty = codeSchema.safeParse({
          code: "",
          returnType: "auto",
          context: {},
        });
        expect(resultEmpty.success).toBe(false);

        const resultValid = codeSchema.safeParse({
          code: "return 42",
          returnType: "auto",
          context: {},
        });
        expect(resultValid.success).toBe(true);
      });

      it("should have helpText from schema description", () => {
        expect(codeFields.code.helpText).toBe(
          "JavaScript expression to execute",
        );
      });
    });

    describe("Return Type Field", () => {
      it("should have select control type (auto-derived from enum)", () => {
        expect(codeFields.returnType.controlType).toBe("select");
      });

      it("should have custom options with labels (overridden)", () => {
        expect(codeFields.returnType.options).toEqual([
          { value: "auto", label: "Auto" },
          { value: "string", label: "String" },
          { value: "number", label: "Number" },
          { value: "boolean", label: "Boolean" },
          { value: "object", label: "Object" },
          { value: "array", label: "Array" },
        ]);
      });

      it("field options should match schema enum values", () => {
        const fieldValues = codeFields.returnType.options?.map((o) => o.value);
        const enumValues = [
          "auto",
          "string",
          "number",
          "boolean",
          "object",
          "array",
        ];

        for (const value of enumValues) {
          const result = codeSchema.safeParse({
            code: "test",
            returnType: value,
            context: {},
          });
          expect(result.success).toBe(true);
          expect(fieldValues).toContain(value);
        }
      });

      it("should reject invalid enum values", () => {
        const result = codeSchema.safeParse({
          code: "test",
          returnType: "invalid",
          context: {},
        });

        expect(result.success).toBe(false);
      });

      it("should be required (auto-derived)", () => {
        expect(codeFields.returnType.required).toBe(true);
      });

      it("should have placeholder showing default value", () => {
        expect(codeFields.returnType.placeholder).toBe("Default: auto");
      });
    });

    describe("Context Field", () => {
      it("should have textarea control type (overridden from json)", () => {
        expect(codeFields.context.controlType).toBe("textarea");
      });

      it("should be required (auto-derived)", () => {
        expect(codeFields.context.required).toBe(true);
      });

      it("should have helpText from schema description", () => {
        expect(codeFields.context.helpText).toBe(
          "Variables to make available in code execution context",
        );
      });

      it("should accept record type per schema", () => {
        const result = codeSchema.safeParse({
          code: "test",
          returnType: "auto",
          context: { foo: "bar", count: 42 },
        });

        expect(result.success).toBe(true);
      });
    });
  });

  describe("Base Schema Fields", () => {
    it("enabled field should be auto-derived correctly", () => {
      expect(codeFields.enabled).toMatchObject({
        controlType: "boolean",
        label: "Enabled",
        helpText: "Whether this node is enabled for execution",
        placeholder: "Default: true",
        required: true,
      });

      // Verify schema validation
      const result = codeSchema.safeParse({
        code: "test",
        returnType: "auto",
        context: {},
        enabled: false,
      });
      expect(result.success).toBe(true);
    });

    it("timeout field should be auto-derived with constraints", () => {
      expect(codeFields.timeout).toMatchObject({
        controlType: "number",
        label: "Timeout",
        helpText: "Maximum execution time in milliseconds",
        placeholder: "Default: 30000",
        required: true,
      });

      // Should have positive constraint (min = 1 from positive())
      expect(codeFields.timeout.min).toBe(1);

      // Verify schema validates this
      const resultZero = codeSchema.safeParse({
        code: "test",
        returnType: "auto",
        context: {},
        timeout: 0,
      });
      expect(resultZero.success).toBe(false);

      const resultValid = codeSchema.safeParse({
        code: "test",
        returnType: "auto",
        context: {},
        timeout: 5000,
      });
      expect(resultValid.success).toBe(true);
    });

    it("retries field should be auto-derived with constraints", () => {
      expect(codeFields.retries).toMatchObject({
        controlType: "number",
        label: "Retries",
        helpText: "Number of retry attempts on failure",
        placeholder: "Default: 1",
        required: true,
      });

      // Should have min constraint (>= 0)
      expect(codeFields.retries.min).toBe(0);

      // Verify schema validates this
      const resultNegative = codeSchema.safeParse({
        code: "test",
        returnType: "auto",
        context: {},
        retries: -1,
      });
      expect(resultNegative.success).toBe(false);

      const resultZero = codeSchema.safeParse({
        code: "test",
        returnType: "auto",
        context: {},
        retries: 0,
      });
      expect(resultZero.success).toBe(true);
    });

    it("label field should be auto-derived as optional", () => {
      expect(codeFields.label).toMatchObject({
        controlType: "text",
        label: "Label",
        helpText: "Custom label for this node instance",
        required: false,
      });

      // Verify schema allows omission
      const result = codeSchema.safeParse({
        code: "test",
        returnType: "auto",
        context: {},
      });
      expect(result.success).toBe(true);
    });

    it("description field should be auto-derived as optional", () => {
      expect(codeFields.description).toMatchObject({
        controlType: "text",
        label: "Description",
        helpText: "Custom description for this node instance",
        required: false,
      });
    });
  });

  describe("Constraint Validation", () => {
    it("required fields should be marked correctly", () => {
      // Code is required
      expect(codeFields.code.required).toBe(true);
      // Label and description are optional
      expect(codeFields.label.required).toBe(false);
      expect(codeFields.description.required).toBe(false);
    });

    it("numeric fields should have appropriate constraints", () => {
      expect(codeFields.timeout.min).toBe(1);
      expect(codeFields.retries.min).toBe(0);
    });

    it("should preserve all schema descriptions as helpText", () => {
      expect(codeFields.code.helpText).toBeTruthy();
      expect(codeFields.returnType.helpText).toBeTruthy();
      expect(codeFields.context.helpText).toBeTruthy();
      expect(codeFields.enabled.helpText).toBeTruthy();
      expect(codeFields.timeout.helpText).toBeTruthy();
    });
  });

  describe("Type Safety", () => {
    it("all fields should have required controlType", () => {
      for (const [_key, field] of Object.entries(codeFields)) {
        expect(field.controlType).toBeDefined();
        expect(typeof field.controlType).toBe("string");
      }
    });

    it("all fields should have required label", () => {
      for (const [_key, field] of Object.entries(codeFields)) {
        expect(field.label).toBeDefined();
        expect(typeof field.label).toBe("string");
        expect(field.label.length).toBeGreaterThan(0);
      }
    });

    it("select fields should have options", () => {
      if (codeFields.returnType.controlType === "select") {
        expect(codeFields.returnType.options).toBeDefined();
        expect(Array.isArray(codeFields.returnType.options)).toBe(true);
        expect(codeFields.returnType.options!.length).toBeGreaterThan(0);
      }
    });

    it("textarea fields should have rows", () => {
      expect(codeFields.code.rows).toBeDefined();
      expect(typeof codeFields.code.rows).toBe("number");
      expect(codeFields.code.rows).toBeGreaterThan(0);
    });
  });

  describe("Complete Valid Examples", () => {
    it("should validate minimal valid node", () => {
      const result = codeSchema.safeParse({
        code: "return input.value * 2",
        returnType: "number",
        context: {},
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.enabled).toBe(true);
        expect(result.data.timeout).toBe(30000);
        expect(result.data.retries).toBe(1);
      }
    });

    it("should validate fully specified node", () => {
      const result = codeSchema.safeParse({
        code: "return input.name || 'Unknown'",
        returnType: "string",
        context: { fallback: "Unknown" },
        enabled: true,
        timeout: 5000,
        retries: 3,
        label: "Name Formatter",
        description: "Formats the input name with fallback",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("Invalid Examples", () => {
    it("should reject missing required code field", () => {
      const result = codeSchema.safeParse({
        returnType: "auto",
        context: {},
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid return type", () => {
      const result = codeSchema.safeParse({
        code: "test",
        returnType: "unknown_type",
        context: {},
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid timeout", () => {
      const result = codeSchema.safeParse({
        code: "test",
        returnType: "auto",
        context: {},
        timeout: 0,
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid retries", () => {
      const result = codeSchema.safeParse({
        code: "test",
        returnType: "auto",
        context: {},
        retries: -1,
      });

      expect(result.success).toBe(false);
    });
  });
});
