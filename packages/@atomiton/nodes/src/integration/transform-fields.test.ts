/**
 * Integration tests for transform node field generation
 * Tests the complete pipeline: schema → createFieldsFromSchema → field config
 * Validates that field constraints match actual schema validation behavior
 */

import { describe, expect, it } from "vitest";
import { transformFields } from "#definitions/transform/fields";
import { transformSchema } from "#schemas/transform";

describe("Transform Node Fields Integration", () => {
  describe("Field Generation Pipeline", () => {
    it("should generate all expected fields from schema", () => {
      const fieldKeys = Object.keys(transformFields);

      // Should include all fields from transformSchemaShape
      expect(fieldKeys).toContain("operation");
      expect(fieldKeys).toContain("transformFunction");
      expect(fieldKeys).toContain("sortKey");
      expect(fieldKeys).toContain("flattenDepth");

      // Should also include base schema fields
      expect(fieldKeys).toContain("enabled");
      expect(fieldKeys).toContain("timeout");
      expect(fieldKeys).toContain("retries");
      expect(fieldKeys).toContain("label");
      expect(fieldKeys).toContain("description");
    });

    it("should have exactly 9 fields total", () => {
      // 4 transform-specific + 5 base fields
      expect(Object.keys(transformFields)).toHaveLength(9);
    });

    it("should have field config for every schema field", () => {
      const schemaKeys = Object.keys(transformSchema.shape);

      for (const key of schemaKeys) {
        expect(transformFields[key]).toBeDefined();
        expect(transformFields[key].controlType).toBeDefined();
        expect(transformFields[key].label).toBeDefined();
      }
    });

    it("should not have extra fields not in schema", () => {
      const schemaKeys = Object.keys(transformSchema.shape);
      const fieldKeys = Object.keys(transformFields);

      for (const key of fieldKeys) {
        expect(schemaKeys).toContain(key);
      }
    });
  });

  describe("Auto-Derived Fields", () => {
    describe("Operation Field", () => {
      it("should have select control type (auto-derived from enum)", () => {
        expect(transformFields.operation.controlType).toBe("select");
      });

      it("should have custom options with labels (overridden)", () => {
        expect(transformFields.operation.options).toEqual([
          { value: "map", label: "Map" },
          { value: "filter", label: "Filter" },
          { value: "sort", label: "Sort" },
          { value: "flatten", label: "Flatten" },
        ]);
      });

      it("should be required (has default but not optional)", () => {
        expect(transformFields.operation.required).toBe(true);
      });

      it("should have placeholder showing default value", () => {
        expect(transformFields.operation.placeholder).toBe("Default: map");
      });

      it("should have helpText from schema description", () => {
        expect(transformFields.operation.helpText).toBe(
          "Type of transformation operation",
        );
      });

      it("should use default value when not provided", () => {
        const result = transformSchema.safeParse({});

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.operation).toBe("map");
        }
      });

      it("should validate enum values", () => {
        const validOps = ["map", "filter", "sort", "flatten"];

        for (const op of validOps) {
          const result = transformSchema.safeParse({ operation: op });
          expect(result.success).toBe(true);
        }
      });

      it("should reject invalid operation", () => {
        const result = transformSchema.safeParse({ operation: "invalid" });
        expect(result.success).toBe(false);
      });
    });

    describe("TransformFunction Field", () => {
      it("should have code control type (overridden)", () => {
        expect(transformFields.transformFunction.controlType).toBe("code");
      });

      it("should be required (has default but not optional)", () => {
        expect(transformFields.transformFunction.required).toBe(true);
      });

      it("should have custom placeholder (overridden)", () => {
        expect(transformFields.transformFunction.placeholder).toBe(
          "item => ({ ...item, processed: true })",
        );
      });

      it("should have custom rows (overridden)", () => {
        expect(transformFields.transformFunction.rows).toBe(5);
      });

      it("should have helpText from schema description", () => {
        expect(transformFields.transformFunction.helpText).toBe(
          "JavaScript function for map/filter operations",
        );
      });

      it("should use default value when not provided", () => {
        const result = transformSchema.safeParse({});

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.transformFunction).toBe("item => item");
        }
      });

      it("should accept any string value", () => {
        const result = transformSchema.safeParse({
          transformFunction: "item => ({ ...item, processed: true })",
        });

        expect(result.success).toBe(true);
      });
    });

    describe("SortKey Field", () => {
      it("should have text control type (auto-derived from string)", () => {
        expect(transformFields.sortKey.controlType).toBe("text");
      });

      it("should be optional (no default, marked optional)", () => {
        expect(transformFields.sortKey.required).toBe(false);
      });

      it("should have helpText from schema description", () => {
        expect(transformFields.sortKey.helpText).toBe(
          "Property key to sort by",
        );
      });

      it("should accept undefined", () => {
        const result = transformSchema.safeParse({});

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.sortKey).toBeUndefined();
        }
      });

      it("should accept string value", () => {
        const result = transformSchema.safeParse({
          sortKey: "name",
        });

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.sortKey).toBe("name");
        }
      });
    });

    describe("FlattenDepth Field", () => {
      it("should have number control type (auto-derived)", () => {
        expect(transformFields.flattenDepth.controlType).toBe("number");
      });

      it("should be required (has default but not optional)", () => {
        expect(transformFields.flattenDepth.required).toBe(true);
      });

      it("should have min/max constraints (auto-derived)", () => {
        expect(transformFields.flattenDepth.min).toBe(1);
        expect(transformFields.flattenDepth.max).toBe(10);
      });

      it("should have placeholder showing default value", () => {
        expect(transformFields.flattenDepth.placeholder).toBe("Default: 1");
      });

      it("should have helpText from schema description", () => {
        expect(transformFields.flattenDepth.helpText).toBe(
          "Depth level for flatten operation",
        );
      });

      it("should use default value when not provided", () => {
        const result = transformSchema.safeParse({});

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.flattenDepth).toBe(1);
        }
      });

      it("should validate min constraint", () => {
        const resultInvalid = transformSchema.safeParse({ flattenDepth: 0 });
        expect(resultInvalid.success).toBe(false);

        const resultValid = transformSchema.safeParse({ flattenDepth: 1 });
        expect(resultValid.success).toBe(true);
      });

      it("should validate max constraint", () => {
        const resultInvalid = transformSchema.safeParse({ flattenDepth: 11 });
        expect(resultInvalid.success).toBe(false);

        const resultValid = transformSchema.safeParse({ flattenDepth: 10 });
        expect(resultValid.success).toBe(true);
      });
    });
  });

  describe("Base Schema Fields", () => {
    it("enabled field should be auto-derived correctly", () => {
      expect(transformFields.enabled).toMatchObject({
        controlType: "boolean",
        label: "Enabled",
        helpText: "Whether this node is enabled for execution",
        placeholder: "Default: true",
        required: true,
      });
    });

    it("timeout field should be auto-derived with constraints", () => {
      expect(transformFields.timeout).toMatchObject({
        controlType: "number",
        label: "Timeout",
        helpText: "Maximum execution time in milliseconds",
        placeholder: "Default: 30000",
        required: true,
      });

      expect(transformFields.timeout.min).toBe(1);

      // Verify schema validates this
      const resultInvalid = transformSchema.safeParse({
        timeout: 0,
      });
      expect(resultInvalid.success).toBe(false);
    });

    it("retries field should be auto-derived with constraints", () => {
      expect(transformFields.retries).toMatchObject({
        controlType: "number",
        label: "Retries",
        helpText: "Number of retry attempts on failure",
        placeholder: "Default: 1",
        required: true,
      });

      expect(transformFields.retries.min).toBe(0);
    });

    it("label field should be auto-derived as optional", () => {
      expect(transformFields.label).toMatchObject({
        controlType: "text",
        label: "Label",
        helpText: "Custom label for this node instance",
        required: false,
      });
    });

    it("description field should be auto-derived as optional", () => {
      expect(transformFields.description).toMatchObject({
        controlType: "text",
        label: "Description",
        helpText: "Custom description for this node instance",
        required: false,
      });
    });
  });

  describe("Type Safety", () => {
    it("all fields should have required controlType", () => {
      for (const field of Object.values(transformFields)) {
        expect(field.controlType).toBeDefined();
        expect(typeof field.controlType).toBe("string");
      }
    });

    it("all fields should have required label", () => {
      for (const field of Object.values(transformFields)) {
        expect(field.label).toBeDefined();
        expect(typeof field.label).toBe("string");
        expect(field.label.length).toBeGreaterThan(0);
      }
    });

    it("fields with options should have valid options array", () => {
      if (transformFields.operation.options) {
        expect(Array.isArray(transformFields.operation.options)).toBe(true);
        expect(transformFields.operation.options.length).toBeGreaterThan(0);

        for (const option of transformFields.operation.options) {
          expect(option.value).toBeDefined();
          expect(option.label).toBeDefined();
        }
      }
    });
  });

  describe("Complete Valid Examples", () => {
    it("should validate minimal valid node", () => {
      const result = transformSchema.safeParse({});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.operation).toBe("map");
        expect(result.data.transformFunction).toBe("item => item");
        expect(result.data.flattenDepth).toBe(1);
        expect(result.data.enabled).toBe(true);
        expect(result.data.timeout).toBe(30000);
        expect(result.data.retries).toBe(1);
      }
    });

    it("should validate map operation", () => {
      const result = transformSchema.safeParse({
        operation: "map",
        transformFunction: "item => ({ ...item, processed: true })",
        label: "Map Transform",
      });

      expect(result.success).toBe(true);
    });

    it("should validate filter operation", () => {
      const result = transformSchema.safeParse({
        operation: "filter",
        transformFunction: "item => item.age > 18",
      });

      expect(result.success).toBe(true);
    });

    it("should validate sort operation", () => {
      const result = transformSchema.safeParse({
        operation: "sort",
        sortKey: "name",
      });

      expect(result.success).toBe(true);
    });

    it("should validate flatten operation", () => {
      const result = transformSchema.safeParse({
        operation: "flatten",
        flattenDepth: 2,
      });

      expect(result.success).toBe(true);
    });
  });

  describe("Invalid Examples", () => {
    it("should reject invalid operation", () => {
      const result = transformSchema.safeParse({
        operation: "reduce",
      });

      expect(result.success).toBe(false);
    });

    it("should reject flattenDepth below min", () => {
      const result = transformSchema.safeParse({
        flattenDepth: 0,
      });

      expect(result.success).toBe(false);
    });

    it("should reject flattenDepth above max", () => {
      const result = transformSchema.safeParse({
        flattenDepth: 11,
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid timeout", () => {
      const result = transformSchema.safeParse({
        timeout: 0,
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid retries", () => {
      const result = transformSchema.safeParse({
        retries: -1,
      });

      expect(result.success).toBe(false);
    });

    it("should reject non-string transformFunction", () => {
      const result = transformSchema.safeParse({
        transformFunction: 123,
      });

      expect(result.success).toBe(false);
    });
  });
});
