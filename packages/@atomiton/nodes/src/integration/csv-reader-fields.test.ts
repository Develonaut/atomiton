/**
 * Integration tests for csv-reader node field generation
 * Tests the complete pipeline: schema → createFieldsFromSchema → field config
 * Validates that field constraints match actual schema validation behavior
 */

import { describe, expect, it } from "vitest";
import { csvReaderFields } from "#definitions/csv-reader/fields";
import { csvReaderSchema } from "#schemas/csv-reader";

describe("CSV Reader Node Fields Integration", () => {
  describe("Field Generation Pipeline", () => {
    it("should generate all expected fields from schema", () => {
      const fieldKeys = Object.keys(csvReaderFields);

      // Should include all fields from csvReaderSchemaShape
      expect(fieldKeys).toContain("path");
      expect(fieldKeys).toContain("hasHeaders");
      expect(fieldKeys).toContain("delimiter");

      // Should also include base schema fields
      expect(fieldKeys).toContain("enabled");
      expect(fieldKeys).toContain("timeout");
      expect(fieldKeys).toContain("retries");
      expect(fieldKeys).toContain("label");
      expect(fieldKeys).toContain("description");
    });

    it("should have exactly 8 fields total", () => {
      // 3 csv-reader-specific + 5 base fields
      expect(Object.keys(csvReaderFields)).toHaveLength(8);
    });

    it("should have field config for every schema field", () => {
      const schemaKeys = Object.keys(csvReaderSchema.shape);

      for (const key of schemaKeys) {
        expect(csvReaderFields[key]).toBeDefined();
        expect(csvReaderFields[key].controlType).toBeDefined();
        expect(csvReaderFields[key].label).toBeDefined();
      }
    });

    it("should not have extra fields not in schema", () => {
      const schemaKeys = Object.keys(csvReaderSchema.shape);
      const fieldKeys = Object.keys(csvReaderFields);

      for (const key of fieldKeys) {
        expect(schemaKeys).toContain(key);
      }
    });
  });

  describe("Auto-Derived Fields", () => {
    describe("Path Field", () => {
      it("should have text control type (auto-derived from string)", () => {
        expect(csvReaderFields.path.controlType).toBe("text");
      });

      it("should be required (auto-derived, no default or optional)", () => {
        expect(csvReaderFields.path.required).toBe(true);

        // Verify schema validates this constraint
        const resultMissing = csvReaderSchema.safeParse({
          hasHeaders: true,
          delimiter: ",",
        });
        expect(resultMissing.success).toBe(false);

        const resultValid = csvReaderSchema.safeParse({
          path: "/path/to/file.csv",
          hasHeaders: true,
          delimiter: ",",
        });
        expect(resultValid.success).toBe(true);
      });

      it("should have helpText from schema description", () => {
        expect(csvReaderFields.path.helpText).toBe(
          "Path to the CSV file to read",
        );
      });

      it("should have auto-formatted label", () => {
        expect(csvReaderFields.path.label).toBe("Path");
      });
    });

    describe("HasHeaders Field", () => {
      it("should have boolean control type (auto-derived)", () => {
        expect(csvReaderFields.hasHeaders.controlType).toBe("boolean");
      });

      it("should be required (has default but not optional)", () => {
        expect(csvReaderFields.hasHeaders.required).toBe(true);
      });

      it("should have placeholder showing default value", () => {
        expect(csvReaderFields.hasHeaders.placeholder).toBe("Default: true");
      });

      it("should have helpText from schema description", () => {
        expect(csvReaderFields.hasHeaders.helpText).toBe(
          "Whether the first row contains column headers",
        );
      });

      it("should use default value when not provided", () => {
        const result = csvReaderSchema.safeParse({
          path: "/path/to/file.csv",
          delimiter: ",",
        });

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.hasHeaders).toBe(true);
        }
      });
    });

    describe("Delimiter Field", () => {
      it("should have text control type (auto-derived from string)", () => {
        // Note: We haven't converted delimiter to enum in schema yet,
        // so it's still a string, but we override with select options in field config
        expect(csvReaderFields.delimiter.controlType).toBe("text");
      });

      it("should have custom options (overridden)", () => {
        expect(csvReaderFields.delimiter.options).toEqual([
          { value: ",", label: "Comma" },
          { value: ";", label: "Semicolon" },
          { value: "\t", label: "Tab" },
          { value: "|", label: "Pipe" },
        ]);
      });

      it("should be required (has default but not optional)", () => {
        expect(csvReaderFields.delimiter.required).toBe(true);
      });

      it("should have placeholder showing default value", () => {
        expect(csvReaderFields.delimiter.placeholder).toBe("Default: ,");
      });

      it("should have helpText from schema description", () => {
        expect(csvReaderFields.delimiter.helpText).toBe(
          "Field delimiter character",
        );
      });

      it("should use default value when not provided", () => {
        const result = csvReaderSchema.safeParse({
          path: "/path/to/file.csv",
          hasHeaders: true,
        });

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.delimiter).toBe(",");
        }
      });

      it("should accept any string value per schema", () => {
        // Schema accepts any string, not just the UI options
        const result = csvReaderSchema.safeParse({
          path: "/path/to/file.csv",
          hasHeaders: true,
          delimiter: "~", // Custom delimiter not in UI options
        });

        expect(result.success).toBe(true);
      });
    });
  });

  describe("Base Schema Fields", () => {
    it("enabled field should be auto-derived correctly", () => {
      expect(csvReaderFields.enabled).toMatchObject({
        controlType: "boolean",
        label: "Enabled",
        helpText: "Whether this node is enabled for execution",
        placeholder: "Default: true",
        required: true,
      });
    });

    it("timeout field should be auto-derived with constraints", () => {
      expect(csvReaderFields.timeout).toMatchObject({
        controlType: "number",
        label: "Timeout",
        helpText: "Maximum execution time in milliseconds",
        placeholder: "Default: 30000",
        required: true,
      });

      expect(csvReaderFields.timeout.min).toBe(1);

      // Verify schema validates this
      const resultInvalid = csvReaderSchema.safeParse({
        path: "/path/to/file.csv",
        timeout: 0,
      });
      expect(resultInvalid.success).toBe(false);
    });

    it("retries field should be auto-derived with constraints", () => {
      expect(csvReaderFields.retries).toMatchObject({
        controlType: "number",
        label: "Retries",
        helpText: "Number of retry attempts on failure",
        placeholder: "Default: 1",
        required: true,
      });

      expect(csvReaderFields.retries.min).toBe(0);
    });

    it("label field should be auto-derived as optional", () => {
      expect(csvReaderFields.label).toMatchObject({
        controlType: "text",
        label: "Label",
        helpText: "Custom label for this node instance",
        required: false,
      });
    });

    it("description field should be auto-derived as optional", () => {
      expect(csvReaderFields.description).toMatchObject({
        controlType: "text",
        label: "Description",
        helpText: "Custom description for this node instance",
        required: false,
      });
    });
  });

  describe("Type Safety", () => {
    it("all fields should have required controlType", () => {
      for (const [_key, field] of Object.entries(csvReaderFields)) {
        expect(field.controlType).toBeDefined();
        expect(typeof field.controlType).toBe("string");
      }
    });

    it("all fields should have required label", () => {
      for (const [_key, field] of Object.entries(csvReaderFields)) {
        expect(field.label).toBeDefined();
        expect(typeof field.label).toBe("string");
        expect(field.label.length).toBeGreaterThan(0);
      }
    });

    it("fields with options should have valid options array", () => {
      if (csvReaderFields.delimiter.options) {
        expect(Array.isArray(csvReaderFields.delimiter.options)).toBe(true);
        expect(csvReaderFields.delimiter.options.length).toBeGreaterThan(0);

        for (const option of csvReaderFields.delimiter.options) {
          expect(option.value).toBeDefined();
          expect(option.label).toBeDefined();
        }
      }
    });
  });

  describe("Complete Valid Examples", () => {
    it("should validate minimal valid node", () => {
      const result = csvReaderSchema.safeParse({
        path: "/data/users.csv",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.hasHeaders).toBe(true);
        expect(result.data.delimiter).toBe(",");
        expect(result.data.enabled).toBe(true);
        expect(result.data.timeout).toBe(30000);
        expect(result.data.retries).toBe(1);
      }
    });

    it("should validate fully specified node", () => {
      const result = csvReaderSchema.safeParse({
        path: "/data/users.csv",
        hasHeaders: false,
        delimiter: ";",
        enabled: true,
        timeout: 5000,
        retries: 3,
        label: "User CSV Reader",
        description: "Reads user data from CSV file",
      });

      expect(result.success).toBe(true);
    });

    it("should validate node with tab delimiter", () => {
      const result = csvReaderSchema.safeParse({
        path: "/data/report.tsv",
        hasHeaders: true,
        delimiter: "\t",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("Invalid Examples", () => {
    it("should reject missing required path field", () => {
      const result = csvReaderSchema.safeParse({
        hasHeaders: true,
        delimiter: ",",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toContain("path");
      }
    });

    it("should accept empty path (schema has no min length constraint)", () => {
      // Note: The schema currently accepts empty strings
      // If we want to enforce non-empty, add .min(1) to schema
      const result = csvReaderSchema.safeParse({
        path: "",
        hasHeaders: true,
        delimiter: ",",
      });

      expect(result.success).toBe(true);
    });

    it("should reject invalid timeout", () => {
      const result = csvReaderSchema.safeParse({
        path: "/data/users.csv",
        timeout: 0,
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid retries", () => {
      const result = csvReaderSchema.safeParse({
        path: "/data/users.csv",
        retries: -1,
      });

      expect(result.success).toBe(false);
    });
  });
});
