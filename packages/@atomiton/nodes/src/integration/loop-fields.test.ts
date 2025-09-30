/**
 * Integration tests for loop node field generation
 * Tests the complete pipeline: schema → createFieldsFromSchema → field config
 * Validates that field constraints match actual schema validation behavior
 */

import { describe, expect, it } from "vitest";
import { loopFields } from "#definitions/loop/fields";
import { loopSchema } from "#schemas/loop";

describe("Loop Node Fields Integration", () => {
  describe("Field Generation Pipeline", () => {
    it("should generate all expected fields from schema", () => {
      const fieldKeys = Object.keys(loopFields);

      // Should include all fields from loopSchemaShape
      expect(fieldKeys).toContain("loopType");
      expect(fieldKeys).toContain("array");
      expect(fieldKeys).toContain("count");
      expect(fieldKeys).toContain("condition");
      expect(fieldKeys).toContain("collectResults");

      // Should also include base schema fields
      expect(fieldKeys).toContain("enabled");
      expect(fieldKeys).toContain("timeout");
      expect(fieldKeys).toContain("retries");
      expect(fieldKeys).toContain("label");
      expect(fieldKeys).toContain("description");
    });

    it("should have exactly 10 fields total", () => {
      // 5 loop-specific + 5 base fields
      expect(Object.keys(loopFields)).toHaveLength(10);
    });

    it("should have field config for every schema field", () => {
      const schemaKeys = Object.keys(loopSchema.shape);

      for (const key of schemaKeys) {
        expect(loopFields[key]).toBeDefined();
        expect(loopFields[key].controlType).toBeDefined();
        expect(loopFields[key].label).toBeDefined();
      }
    });

    it("should not have extra fields not in schema", () => {
      const schemaKeys = Object.keys(loopSchema.shape);
      const fieldKeys = Object.keys(loopFields);

      for (const key of fieldKeys) {
        expect(schemaKeys).toContain(key);
      }
    });
  });

  describe("Auto-Derived Fields", () => {
    describe("LoopType Field", () => {
      it("should have select control type (auto-derived from enum)", () => {
        expect(loopFields.loopType.controlType).toBe("select");
      });

      it("should have custom options with labels (overridden)", () => {
        expect(loopFields.loopType.options).toEqual([
          { value: "forEach", label: "For Each" },
          { value: "times", label: "Times" },
          { value: "while", label: "While" },
        ]);
      });

      it("should be required (has default but not optional)", () => {
        expect(loopFields.loopType.required).toBe(true);
      });

      it("should have placeholder showing default value", () => {
        expect(loopFields.loopType.placeholder).toBe("Default: forEach");
      });

      it("should have helpText from schema description", () => {
        expect(loopFields.loopType.helpText).toBe("Type of loop operation");
      });

      it("should use default value when not provided", () => {
        const result = loopSchema.safeParse({});

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.loopType).toBe("forEach");
        }
      });

      it("should validate enum values", () => {
        const validTypes = ["forEach", "times", "while"];

        for (const type of validTypes) {
          const result = loopSchema.safeParse({ loopType: type });
          expect(result.success).toBe(true);
        }
      });

      it("should reject invalid loop type", () => {
        const result = loopSchema.safeParse({ loopType: "for" });
        expect(result.success).toBe(false);
      });
    });

    describe("Array Field", () => {
      it("should have textarea control type (overridden)", () => {
        expect(loopFields.array.controlType).toBe("textarea");
      });

      it("should be optional (no default, marked optional)", () => {
        expect(loopFields.array.required).toBe(false);
      });

      it("should have custom placeholder (overridden)", () => {
        expect(loopFields.array.placeholder).toBe("[1, 2, 3, 4, 5]");
      });

      it("should have custom rows (overridden)", () => {
        expect(loopFields.array.rows).toBe(3);
      });

      it("should have helpText from schema description", () => {
        expect(loopFields.array.helpText).toBe(
          "Array to iterate over (for forEach)",
        );
      });

      it("should accept undefined", () => {
        const result = loopSchema.safeParse({});

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.array).toBeUndefined();
        }
      });

      it("should accept array values", () => {
        const result = loopSchema.safeParse({
          array: [1, 2, 3, 4, 5],
        });

        expect(result.success).toBe(true);
      });

      it("should accept arrays with mixed types", () => {
        const result = loopSchema.safeParse({
          array: [1, "two", { three: 3 }, [4], true],
        });

        expect(result.success).toBe(true);
      });

      it("should reject non-array values", () => {
        const result = loopSchema.safeParse({
          array: "not an array",
        });

        expect(result.success).toBe(false);
      });
    });

    describe("Count Field", () => {
      it("should have number control type (auto-derived)", () => {
        expect(loopFields.count.controlType).toBe("number");
      });

      it("should be required (has default but not optional)", () => {
        expect(loopFields.count.required).toBe(true);
      });

      it("should have min/max constraints (auto-derived)", () => {
        expect(loopFields.count.min).toBe(1);
        expect(loopFields.count.max).toBe(10000);
      });

      it("should have placeholder showing default value", () => {
        expect(loopFields.count.placeholder).toBe("Default: 10");
      });

      it("should have helpText from schema description", () => {
        expect(loopFields.count.helpText).toBe(
          "Number of iterations (for times)",
        );
      });

      it("should use default value when not provided", () => {
        const result = loopSchema.safeParse({});

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.count).toBe(10);
        }
      });

      it("should validate min constraint", () => {
        const resultInvalid = loopSchema.safeParse({ count: 0 });
        expect(resultInvalid.success).toBe(false);

        const resultValid = loopSchema.safeParse({ count: 1 });
        expect(resultValid.success).toBe(true);
      });

      it("should validate max constraint", () => {
        const resultInvalid = loopSchema.safeParse({ count: 10001 });
        expect(resultInvalid.success).toBe(false);

        const resultValid = loopSchema.safeParse({ count: 10000 });
        expect(resultValid.success).toBe(true);
      });
    });

    describe("Condition Field", () => {
      it("should have code control type (overridden)", () => {
        expect(loopFields.condition.controlType).toBe("code");
      });

      it("should be optional (no default, marked optional)", () => {
        expect(loopFields.condition.required).toBe(false);
      });

      it("should have custom placeholder (overridden)", () => {
        expect(loopFields.condition.placeholder).toBe("iteration < 100");
      });

      it("should have custom rows (overridden)", () => {
        expect(loopFields.condition.rows).toBe(3);
      });

      it("should have helpText from schema description", () => {
        expect(loopFields.condition.helpText).toBe(
          "JavaScript condition expression (for while)",
        );
      });

      it("should accept undefined", () => {
        const result = loopSchema.safeParse({});

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.condition).toBeUndefined();
        }
      });

      it("should accept string value", () => {
        const result = loopSchema.safeParse({
          condition: "iteration < 100",
        });

        expect(result.success).toBe(true);
      });

      it("should reject non-string value", () => {
        const result = loopSchema.safeParse({
          condition: 123,
        });

        expect(result.success).toBe(false);
      });
    });

    describe("CollectResults Field", () => {
      it("should have boolean control type (auto-derived)", () => {
        expect(loopFields.collectResults.controlType).toBe("boolean");
      });

      it("should be required (has default but not optional)", () => {
        expect(loopFields.collectResults.required).toBe(true);
      });

      it("should have placeholder showing default value", () => {
        expect(loopFields.collectResults.placeholder).toBe("Default: true");
      });

      it("should have helpText from schema description", () => {
        expect(loopFields.collectResults.helpText).toBe(
          "Collect results from each iteration into an array",
        );
      });

      it("should use default value when not provided", () => {
        const result = loopSchema.safeParse({});

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.collectResults).toBe(true);
        }
      });
    });
  });

  describe("Base Schema Fields", () => {
    it("enabled field should be auto-derived correctly", () => {
      expect(loopFields.enabled).toMatchObject({
        controlType: "boolean",
        label: "Enabled",
        helpText: "Whether this node is enabled for execution",
        placeholder: "Default: true",
        required: true,
      });
    });

    it("timeout field should be auto-derived with constraints", () => {
      expect(loopFields.timeout).toMatchObject({
        controlType: "number",
        label: "Timeout",
        helpText: "Maximum execution time in milliseconds",
        placeholder: "Default: 30000",
        required: true,
      });

      expect(loopFields.timeout.min).toBe(1);

      // Verify schema validates this
      const resultInvalid = loopSchema.safeParse({
        timeout: 0,
      });
      expect(resultInvalid.success).toBe(false);
    });

    it("retries field should be auto-derived with constraints", () => {
      expect(loopFields.retries).toMatchObject({
        controlType: "number",
        label: "Retries",
        helpText: "Number of retry attempts on failure",
        placeholder: "Default: 1",
        required: true,
      });

      expect(loopFields.retries.min).toBe(0);
    });

    it("label field should be auto-derived as optional", () => {
      expect(loopFields.label).toMatchObject({
        controlType: "text",
        label: "Label",
        helpText: "Custom label for this node instance",
        required: false,
      });
    });

    it("description field should be auto-derived as optional", () => {
      expect(loopFields.description).toMatchObject({
        controlType: "text",
        label: "Description",
        helpText: "Custom description for this node instance",
        required: false,
      });
    });
  });

  describe("Type Safety", () => {
    it("all fields should have required controlType", () => {
      for (const [_key, field] of Object.entries(loopFields)) {
        expect(field.controlType).toBeDefined();
        expect(typeof field.controlType).toBe("string");
      }
    });

    it("all fields should have required label", () => {
      for (const [_key, field] of Object.entries(loopFields)) {
        expect(field.label).toBeDefined();
        expect(typeof field.label).toBe("string");
        expect(field.label.length).toBeGreaterThan(0);
      }
    });

    it("fields with options should have valid options array", () => {
      if (loopFields.loopType.options) {
        expect(Array.isArray(loopFields.loopType.options)).toBe(true);
        expect(loopFields.loopType.options.length).toBeGreaterThan(0);

        for (const option of loopFields.loopType.options) {
          expect(option.value).toBeDefined();
          expect(option.label).toBeDefined();
        }
      }
    });
  });

  describe("Complete Valid Examples", () => {
    it("should validate minimal valid node", () => {
      const result = loopSchema.safeParse({});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.loopType).toBe("forEach");
        expect(result.data.count).toBe(10);
        expect(result.data.collectResults).toBe(true);
        expect(result.data.enabled).toBe(true);
        expect(result.data.timeout).toBe(30000);
        expect(result.data.retries).toBe(1);
      }
    });

    it("should validate forEach loop", () => {
      const result = loopSchema.safeParse({
        loopType: "forEach",
        array: [1, 2, 3, 4, 5],
      });

      expect(result.success).toBe(true);
    });

    it("should validate times loop", () => {
      const result = loopSchema.safeParse({
        loopType: "times",
        count: 100,
        collectResults: false,
      });

      expect(result.success).toBe(true);
    });

    it("should validate while loop", () => {
      const result = loopSchema.safeParse({
        loopType: "while",
        condition: "iteration < 100",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("Invalid Examples", () => {
    it("should reject invalid loop type", () => {
      const result = loopSchema.safeParse({
        loopType: "for",
      });

      expect(result.success).toBe(false);
    });

    it("should reject count below min", () => {
      const result = loopSchema.safeParse({
        count: 0,
      });

      expect(result.success).toBe(false);
    });

    it("should reject count above max", () => {
      const result = loopSchema.safeParse({
        count: 10001,
      });

      expect(result.success).toBe(false);
    });

    it("should reject non-array array value", () => {
      const result = loopSchema.safeParse({
        array: "not an array",
      });

      expect(result.success).toBe(false);
    });

    it("should reject non-string condition", () => {
      const result = loopSchema.safeParse({
        condition: 123,
      });

      expect(result.success).toBe(false);
    });

    it("should reject non-boolean collectResults", () => {
      const result = loopSchema.safeParse({
        collectResults: "true",
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid timeout", () => {
      const result = loopSchema.safeParse({
        timeout: 0,
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid retries", () => {
      const result = loopSchema.safeParse({
        retries: -1,
      });

      expect(result.success).toBe(false);
    });
  });
});
