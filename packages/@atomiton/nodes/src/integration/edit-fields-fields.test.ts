/**
 * Integration tests for edit-fields node field generation
 * Tests the complete pipeline: schema → createFieldsFromSchema → field config
 * Validates that field constraints match actual schema validation behavior
 */

import { describe, expect, it } from "vitest";
import { editFieldsFields } from "#definitions/edit-fields/fields";
import { editFieldsSchema } from "#schemas/edit-fields";

describe("Edit Fields Node Fields Integration", () => {
  describe("Field Generation Pipeline", () => {
    it("should generate all expected fields from schema", () => {
      const fieldKeys = Object.keys(editFieldsFields);

      // Should include all fields from editFieldsSchemaShape
      expect(fieldKeys).toContain("values");
      expect(fieldKeys).toContain("keepOnlySet");

      // Should also include base schema fields
      expect(fieldKeys).toContain("enabled");
      expect(fieldKeys).toContain("timeout");
      expect(fieldKeys).toContain("retries");
      expect(fieldKeys).toContain("label");
      expect(fieldKeys).toContain("description");
    });

    it("should have exactly 7 fields total", () => {
      // 2 edit-fields-specific + 5 base fields
      expect(Object.keys(editFieldsFields)).toHaveLength(7);
    });

    it("should have field config for every schema field", () => {
      const schemaKeys = Object.keys(editFieldsSchema.shape);

      for (const key of schemaKeys) {
        expect(editFieldsFields[key]).toBeDefined();
        expect(editFieldsFields[key].controlType).toBeDefined();
        expect(editFieldsFields[key].label).toBeDefined();
      }
    });

    it("should not have extra fields not in schema", () => {
      const schemaKeys = Object.keys(editFieldsSchema.shape);
      const fieldKeys = Object.keys(editFieldsFields);

      for (const key of fieldKeys) {
        expect(schemaKeys).toContain(key);
      }
    });
  });

  describe("Auto-Derived Fields", () => {
    describe("Values Field", () => {
      it("should have code control type (overridden)", () => {
        expect(editFieldsFields.values.controlType).toBe("code");
      });

      it("should be required (has default but not optional)", () => {
        expect(editFieldsFields.values.required).toBe(true);
      });

      it("should have custom placeholder (overridden)", () => {
        expect(editFieldsFields.values.placeholder).toBe("Add field");
      });

      it("should have custom rows (overridden)", () => {
        expect(editFieldsFields.values.rows).toBe(10);
      });

      it("should have helpText from schema description", () => {
        expect(editFieldsFields.values.helpText).toBe(
          "Object containing field names and their values to set or edit",
        );
      });

      it("should use default value when not provided", () => {
        const result = editFieldsSchema.safeParse({});

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.values).toEqual({});
        }
      });

      it("should accept record objects", () => {
        const result = editFieldsSchema.safeParse({
          values: { name: "John", age: 30 },
        });

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.values).toEqual({ name: "John", age: 30 });
        }
      });

      it("should accept nested objects", () => {
        const result = editFieldsSchema.safeParse({
          values: { user: { name: "John", email: "john@example.com" } },
        });

        expect(result.success).toBe(true);
      });
    });

    describe("KeepOnlySet Field", () => {
      it("should have boolean control type (auto-derived)", () => {
        expect(editFieldsFields.keepOnlySet.controlType).toBe("boolean");
      });

      it("should be required (has default but not optional)", () => {
        expect(editFieldsFields.keepOnlySet.required).toBe(true);
      });

      it("should have placeholder showing default value", () => {
        expect(editFieldsFields.keepOnlySet.placeholder).toBe("Default: false");
      });

      it("should have helpText from schema description", () => {
        expect(editFieldsFields.keepOnlySet.helpText).toBe(
          "If true, only output the fields defined in values, discarding all other input fields",
        );
      });

      it("should use default value when not provided", () => {
        const result = editFieldsSchema.safeParse({});

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.keepOnlySet).toBe(false);
        }
      });
    });
  });

  describe("Base Schema Fields", () => {
    it("enabled field should be auto-derived correctly", () => {
      expect(editFieldsFields.enabled).toMatchObject({
        controlType: "boolean",
        label: "Enabled",
        helpText: "Whether this node is enabled for execution",
        placeholder: "Default: true",
        required: true,
      });
    });

    it("timeout field should be auto-derived with constraints", () => {
      expect(editFieldsFields.timeout).toMatchObject({
        controlType: "number",
        label: "Timeout",
        helpText: "Maximum execution time in milliseconds",
        placeholder: "Default: 30000",
        required: true,
      });

      expect(editFieldsFields.timeout.min).toBe(1);

      // Verify schema validates this
      const resultInvalid = editFieldsSchema.safeParse({
        timeout: 0,
      });
      expect(resultInvalid.success).toBe(false);
    });

    it("retries field should be auto-derived with constraints", () => {
      expect(editFieldsFields.retries).toMatchObject({
        controlType: "number",
        label: "Retries",
        helpText: "Number of retry attempts on failure",
        placeholder: "Default: 1",
        required: true,
      });

      expect(editFieldsFields.retries.min).toBe(0);
    });

    it("label field should be auto-derived as optional", () => {
      expect(editFieldsFields.label).toMatchObject({
        controlType: "text",
        label: "Label",
        helpText: "Custom label for this node instance",
        required: false,
      });
    });

    it("description field should be auto-derived as optional", () => {
      expect(editFieldsFields.description).toMatchObject({
        controlType: "text",
        label: "Description",
        helpText: "Custom description for this node instance",
        required: false,
      });
    });
  });

  describe("Type Safety", () => {
    it("all fields should have required controlType", () => {
      for (const [_key, field] of Object.entries(editFieldsFields)) {
        expect(field.controlType).toBeDefined();
        expect(typeof field.controlType).toBe("string");
      }
    });

    it("all fields should have required label", () => {
      for (const [_key, field] of Object.entries(editFieldsFields)) {
        expect(field.label).toBeDefined();
        expect(typeof field.label).toBe("string");
        expect(field.label.length).toBeGreaterThan(0);
      }
    });
  });

  describe("Complete Valid Examples", () => {
    it("should validate minimal valid node", () => {
      const result = editFieldsSchema.safeParse({});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.values).toEqual({});
        expect(result.data.keepOnlySet).toBe(false);
        expect(result.data.enabled).toBe(true);
        expect(result.data.timeout).toBe(30000);
        expect(result.data.retries).toBe(1);
      }
    });

    it("should validate fully specified node", () => {
      const result = editFieldsSchema.safeParse({
        values: { name: "John", age: 30, city: "NYC" },
        keepOnlySet: true,
        enabled: true,
        timeout: 5000,
        retries: 3,
        label: "User Data Editor",
        description: "Edits user data fields",
      });

      expect(result.success).toBe(true);
    });

    it("should validate node with complex values", () => {
      const result = editFieldsSchema.safeParse({
        values: {
          user: { name: "John", email: "john@example.com" },
          metadata: { created: "2023-01-01", updated: "2023-12-31" },
        },
        keepOnlySet: false,
      });

      expect(result.success).toBe(true);
    });
  });

  describe("Invalid Examples", () => {
    it("should reject invalid timeout", () => {
      const result = editFieldsSchema.safeParse({
        timeout: 0,
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid retries", () => {
      const result = editFieldsSchema.safeParse({
        retries: -1,
      });

      expect(result.success).toBe(false);
    });

    it("should reject non-boolean keepOnlySet", () => {
      const result = editFieldsSchema.safeParse({
        keepOnlySet: "true",
      });

      expect(result.success).toBe(false);
    });

    it("should reject non-object values", () => {
      const result = editFieldsSchema.safeParse({
        values: "invalid",
      });

      expect(result.success).toBe(false);
    });
  });
});
