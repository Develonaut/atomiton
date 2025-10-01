/**
 * Integration tests for group node field generation
 * Tests the complete pipeline: schema → createFieldsFromSchema → field config
 * Validates that field constraints match actual schema validation behavior
 */

import { describe, expect, it } from "vitest";
import { groupFields } from "#definitions/group";
import { groupSchema } from "#schemas/group";

describe("Group Node Fields Integration", () => {
  describe("Field Generation Pipeline", () => {
    it("should generate all expected fields from groupSchemaShape", () => {
      const fieldKeys = Object.keys(groupFields);

      // Should include all custom fields
      expect(fieldKeys).toContain("timeout");
      expect(fieldKeys).toContain("retries");
      expect(fieldKeys).toContain("parallel");
    });

    it("should have exactly 3 custom fields", () => {
      // Group node has 3 custom fields (timeout, retries, parallel)
      // Note: groupFields only contains custom overrides, not base schema fields
      expect(Object.keys(groupFields)).toHaveLength(3);
    });

    it("should have field config for custom fields", () => {
      const customFields = ["timeout", "retries", "parallel"];

      for (const key of customFields) {
        expect(groupFields[key]).toBeDefined();
        expect(groupFields[key].controlType).toBeDefined();
        expect(groupFields[key].label).toBeDefined();
      }
    });
  });

  describe("Auto-Derived Fields", () => {
    describe("Timeout Field", () => {
      it("should have number control type", () => {
        expect(groupFields.timeout.controlType).toBe("number");
      });

      it("should have correct label", () => {
        expect(groupFields.timeout.label).toBe("Timeout (ms)");
      });

      it("should have correct min and max constraints", () => {
        expect(groupFields.timeout.min).toBe(1000);
        expect(groupFields.timeout.max).toBe(300000);
      });

      it("should have helpText", () => {
        expect(groupFields.timeout.helpText).toBe(
          "Maximum execution time in milliseconds",
        );
      });

      it("should use default value when not provided", () => {
        const result = groupSchema.safeParse({});

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.timeout).toBe(30000);
        }
      });

      it("should reject values below minimum", () => {
        const result = groupSchema.safeParse({
          timeout: 500,
        });

        expect(result.success).toBe(false);
      });

      it("should reject values above maximum", () => {
        const result = groupSchema.safeParse({
          timeout: 400000,
        });

        expect(result.success).toBe(false);
      });

      it("should accept values within range", () => {
        const result = groupSchema.safeParse({
          timeout: 5000,
        });

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.timeout).toBe(5000);
        }
      });
    });

    describe("Retries Field", () => {
      it("should have number control type", () => {
        expect(groupFields.retries.controlType).toBe("number");
      });

      it("should have correct label", () => {
        expect(groupFields.retries.label).toBe("Retries");
      });

      it("should have correct min and max constraints", () => {
        expect(groupFields.retries.min).toBe(0);
        expect(groupFields.retries.max).toBe(10);
      });

      it("should have helpText", () => {
        expect(groupFields.retries.helpText).toBe(
          "Number of retry attempts on failure",
        );
      });

      it("should use default value when not provided", () => {
        const result = groupSchema.safeParse({});

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.retries).toBe(1);
        }
      });

      it("should reject negative values", () => {
        const result = groupSchema.safeParse({
          retries: -1,
        });

        expect(result.success).toBe(false);
      });

      it("should reject values above maximum", () => {
        const result = groupSchema.safeParse({
          retries: 11,
        });

        expect(result.success).toBe(false);
      });

      it("should accept zero retries", () => {
        const result = groupSchema.safeParse({
          retries: 0,
        });

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.retries).toBe(0);
        }
      });
    });

    describe("Parallel Field", () => {
      it("should have boolean control type", () => {
        expect(groupFields.parallel.controlType).toBe("boolean");
      });

      it("should have correct label", () => {
        expect(groupFields.parallel.label).toBe("Parallel Execution");
      });

      it("should have helpText", () => {
        expect(groupFields.parallel.helpText).toBe(
          "Execute child nodes in parallel when possible",
        );
      });

      it("should use default value when not provided", () => {
        const result = groupSchema.safeParse({});

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.parallel).toBe(false);
        }
      });

      it("should accept true value", () => {
        const result = groupSchema.safeParse({
          parallel: true,
        });

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.parallel).toBe(true);
        }
      });

      it("should reject non-boolean values", () => {
        const result = groupSchema.safeParse({
          parallel: "true",
        });

        expect(result.success).toBe(false);
      });
    });
  });

  describe("Base Schema Fields", () => {
    it("enabled field should have correct default", () => {
      const result = groupSchema.safeParse({});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.enabled).toBe(true);
      }
    });

    it("label field should be optional", () => {
      const result = groupSchema.safeParse({});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.label).toBeUndefined();
      }
    });

    it("description field should be optional", () => {
      const result = groupSchema.safeParse({});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBeUndefined();
      }
    });

    it("should accept custom label and description", () => {
      const result = groupSchema.safeParse({
        label: "My Group",
        description: "A group of related operations",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.label).toBe("My Group");
        expect(result.data.description).toBe("A group of related operations");
      }
    });
  });

  describe("Type Safety", () => {
    it("all fields should have required controlType", () => {
      for (const field of Object.values(groupFields)) {
        expect(field.controlType).toBeDefined();
        expect(typeof field.controlType).toBe("string");
      }
    });

    it("all fields should have required label", () => {
      for (const field of Object.values(groupFields)) {
        expect(field.label).toBeDefined();
        expect(typeof field.label).toBe("string");
        expect(field.label.length).toBeGreaterThan(0);
      }
    });
  });

  describe("Complete Valid Examples", () => {
    it("should validate minimal valid node with all defaults", () => {
      const result = groupSchema.safeParse({});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.timeout).toBe(30000);
        expect(result.data.retries).toBe(1);
        expect(result.data.parallel).toBe(false);
        expect(result.data.enabled).toBe(true);
      }
    });

    it("should validate fully specified node", () => {
      const result = groupSchema.safeParse({
        timeout: 60000,
        retries: 3,
        parallel: true,
        enabled: true,
        label: "Data Processing Group",
        description: "Groups data validation and transformation operations",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.timeout).toBe(60000);
        expect(result.data.retries).toBe(3);
        expect(result.data.parallel).toBe(true);
        expect(result.data.label).toBe("Data Processing Group");
        expect(result.data.description).toBe(
          "Groups data validation and transformation operations",
        );
      }
    });

    it("should validate node with sequential execution", () => {
      const result = groupSchema.safeParse({
        parallel: false,
        timeout: 120000,
        retries: 5,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.parallel).toBe(false);
        expect(result.data.timeout).toBe(120000);
        expect(result.data.retries).toBe(5);
      }
    });

    it("should validate node with zero retries", () => {
      const result = groupSchema.safeParse({
        retries: 0,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.retries).toBe(0);
      }
    });
  });

  describe("Invalid Examples", () => {
    it("should reject invalid timeout (too low)", () => {
      const result = groupSchema.safeParse({
        timeout: 500,
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid timeout (too high)", () => {
      const result = groupSchema.safeParse({
        timeout: 500000,
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid retries (negative)", () => {
      const result = groupSchema.safeParse({
        retries: -1,
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid retries (too high)", () => {
      const result = groupSchema.safeParse({
        retries: 15,
      });

      expect(result.success).toBe(false);
    });

    it("should reject non-boolean parallel", () => {
      const result = groupSchema.safeParse({
        parallel: "false",
      });

      expect(result.success).toBe(false);
    });

    it("should reject non-number timeout", () => {
      const result = groupSchema.safeParse({
        timeout: "30000",
      });

      expect(result.success).toBe(false);
    });

    it("should reject non-number retries", () => {
      const result = groupSchema.safeParse({
        retries: "1",
      });

      expect(result.success).toBe(false);
    });

    it("should reject non-boolean enabled", () => {
      const result = groupSchema.safeParse({
        enabled: 1,
      });

      expect(result.success).toBe(false);
    });

    it("should reject non-string label", () => {
      const result = groupSchema.safeParse({
        label: 123,
      });

      expect(result.success).toBe(false);
    });

    it("should reject non-string description", () => {
      const result = groupSchema.safeParse({
        description: true,
      });

      expect(result.success).toBe(false);
    });
  });
});
