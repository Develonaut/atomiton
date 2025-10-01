/**
 * Integration tests for spreadsheet node field generation
 * Tests the complete pipeline: schema → createFieldsFromSchema → field config
 * Validates that field constraints match actual schema validation behavior
 */

import { describe, expect, it } from "vitest";
import { spreadsheetFields } from "#definitions/spreadsheet/fields";
import { spreadsheetSchema } from "#schemas/spreadsheet";

describe("Spreadsheet Node Fields Integration", () => {
  describe("Field Generation Pipeline", () => {
    it("should generate all expected fields from schema", () => {
      const fieldKeys = Object.keys(spreadsheetFields);

      // Should include all fields from spreadsheetSchemaShape
      expect(fieldKeys).toContain("path");
      expect(fieldKeys).toContain("format");
      expect(fieldKeys).toContain("sheetName");
      expect(fieldKeys).toContain("sheetIndex");
      expect(fieldKeys).toContain("hasHeaders");
      expect(fieldKeys).toContain("range");
      expect(fieldKeys).toContain("delimiter");
      expect(fieldKeys).toContain("skipEmptyLines");

      // Should also include base schema fields
      expect(fieldKeys).toContain("enabled");
      expect(fieldKeys).toContain("timeout");
      expect(fieldKeys).toContain("retries");
      expect(fieldKeys).toContain("label");
      expect(fieldKeys).toContain("description");
    });

    it("should have exactly 13 fields total", () => {
      // 8 spreadsheet-specific + 5 base fields
      expect(Object.keys(spreadsheetFields)).toHaveLength(13);
    });

    it("should have field config for every schema field", () => {
      const schemaKeys = Object.keys(spreadsheetSchema.shape);

      for (const key of schemaKeys) {
        expect(spreadsheetFields[key]).toBeDefined();
        expect(spreadsheetFields[key].controlType).toBeDefined();
        expect(spreadsheetFields[key].label).toBeDefined();
      }
    });

    it("should not have extra fields not in schema", () => {
      const schemaKeys = Object.keys(spreadsheetSchema.shape);
      const fieldKeys = Object.keys(spreadsheetFields);

      for (const key of fieldKeys) {
        expect(schemaKeys).toContain(key);
      }
    });
  });

  describe("Auto-Derived Fields", () => {
    describe("Path Field", () => {
      it("should have text control type (auto-derived from string)", () => {
        expect(spreadsheetFields.path.controlType).toBe("text");
      });

      it("should be required (auto-derived, no default or optional)", () => {
        expect(spreadsheetFields.path.required).toBe(true);

        // Verify schema validates this constraint
        const resultMissing = spreadsheetSchema.safeParse({
          hasHeaders: true,
          delimiter: ",",
        });
        expect(resultMissing.success).toBe(false);

        const resultValid = spreadsheetSchema.safeParse({
          path: "/path/to/file.xlsx",
          hasHeaders: true,
          delimiter: ",",
        });
        expect(resultValid.success).toBe(true);
      });

      it("should have helpText from schema description", () => {
        expect(spreadsheetFields.path.helpText).toBe(
          "Path to the spreadsheet file to read",
        );
      });

      it("should have auto-formatted label", () => {
        expect(spreadsheetFields.path.label).toBe("Path");
      });
    });

    describe("Format Field", () => {
      it("should have select control type (auto-derived from enum)", () => {
        expect(spreadsheetFields.format.controlType).toBe("select");
      });

      it("should be optional", () => {
        expect(spreadsheetFields.format.required).toBe(false);
      });

      it("should have custom options (overridden)", () => {
        expect(spreadsheetFields.format.options).toEqual([
          { value: "csv", label: "CSV - Comma Separated Values" },
          { value: "xlsx", label: "XLSX - Excel 2007+" },
          { value: "xls", label: "XLS - Excel 97-2003" },
          { value: "xlsb", label: "XLSB - Excel Binary" },
          { value: "ods", label: "ODS - OpenDocument Spreadsheet" },
          { value: "fods", label: "FODS - Flat OpenDocument Spreadsheet" },
        ]);
      });

      it("should have helpText from schema description", () => {
        expect(spreadsheetFields.format.helpText).toBe(
          "Spreadsheet format (auto-detected from file extension if not provided)",
        );
      });
    });

    describe("HasHeaders Field", () => {
      it("should have boolean control type (auto-derived)", () => {
        expect(spreadsheetFields.hasHeaders.controlType).toBe("boolean");
      });

      it("should be required (has default but not optional)", () => {
        expect(spreadsheetFields.hasHeaders.required).toBe(true);
      });

      it("should have placeholder showing default value", () => {
        expect(spreadsheetFields.hasHeaders.placeholder).toBe("Default: true");
      });

      it("should use default value when not provided", () => {
        const result = spreadsheetSchema.safeParse({
          path: "/path/to/file.xlsx",
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
        expect(spreadsheetFields.delimiter.controlType).toBe("text");
      });

      it("should have custom options (overridden)", () => {
        expect(spreadsheetFields.delimiter.options).toEqual([
          { value: ",", label: "Comma (,)" },
          { value: ";", label: "Semicolon (;)" },
          { value: "\t", label: "Tab (\\t)" },
          { value: "|", label: "Pipe (|)" },
        ]);
      });

      it("should be required (has default but not optional)", () => {
        expect(spreadsheetFields.delimiter.required).toBe(true);
      });

      it("should have placeholder showing default value", () => {
        expect(spreadsheetFields.delimiter.placeholder).toBe("Default: ,");
      });

      it("should use default value when not provided", () => {
        const result = spreadsheetSchema.safeParse({
          path: "/path/to/file.csv",
          hasHeaders: true,
        });

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.delimiter).toBe(",");
        }
      });
    });

    describe("SheetName Field", () => {
      it("should have text control type (auto-derived from string)", () => {
        expect(spreadsheetFields.sheetName.controlType).toBe("text");
      });

      it("should be optional", () => {
        expect(spreadsheetFields.sheetName.required).toBe(false);
      });

      it("should have helpText from schema description", () => {
        expect(spreadsheetFields.sheetName.helpText).toBe(
          "Name of the sheet to read (defaults to first sheet if not provided)",
        );
      });
    });

    describe("SheetIndex Field", () => {
      it("should have number control type (auto-derived)", () => {
        expect(spreadsheetFields.sheetIndex.controlType).toBe("number");
      });

      it("should be optional", () => {
        expect(spreadsheetFields.sheetIndex.required).toBe(false);
      });

      it("should have min constraint from schema", () => {
        expect(spreadsheetFields.sheetIndex.min).toBe(0);
      });

      it("should have helpText from schema description", () => {
        expect(spreadsheetFields.sheetIndex.helpText).toBe(
          "Index of the sheet to read (0-based, defaults to 0)",
        );
      });
    });

    describe("Range Field", () => {
      it("should have text control type (auto-derived from string)", () => {
        expect(spreadsheetFields.range.controlType).toBe("text");
      });

      it("should be optional", () => {
        expect(spreadsheetFields.range.required).toBe(false);
      });

      it("should have custom placeholder (overridden)", () => {
        expect(spreadsheetFields.range.placeholder).toBe("e.g., A1:D10");
      });

      it("should have helpText from schema description", () => {
        expect(spreadsheetFields.range.helpText).toBe(
          "Cell range to read (e.g., 'A1:D10', defaults to entire sheet)",
        );
      });
    });

    describe("SkipEmptyLines Field", () => {
      it("should have boolean control type (auto-derived)", () => {
        expect(spreadsheetFields.skipEmptyLines.controlType).toBe("boolean");
      });

      it("should be required (has default but not optional)", () => {
        expect(spreadsheetFields.skipEmptyLines.required).toBe(true);
      });

      it("should have placeholder showing default value", () => {
        expect(spreadsheetFields.skipEmptyLines.placeholder).toBe(
          "Default: true",
        );
      });

      it("should use default value when not provided", () => {
        const result = spreadsheetSchema.safeParse({
          path: "/path/to/file.xlsx",
        });

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.skipEmptyLines).toBe(true);
        }
      });
    });
  });

  describe("Base Schema Fields", () => {
    it("enabled field should be auto-derived correctly", () => {
      expect(spreadsheetFields.enabled).toMatchObject({
        controlType: "boolean",
        label: "Enabled",
        helpText: "Whether this node is enabled for execution",
        placeholder: "Default: true",
        required: true,
      });
    });

    it("timeout field should be auto-derived with constraints", () => {
      expect(spreadsheetFields.timeout).toMatchObject({
        controlType: "number",
        label: "Timeout",
        helpText: "Maximum execution time in milliseconds",
        placeholder: "Default: 30000",
        required: true,
      });

      expect(spreadsheetFields.timeout.min).toBe(1);
    });

    it("retries field should be auto-derived with constraints", () => {
      expect(spreadsheetFields.retries).toMatchObject({
        controlType: "number",
        label: "Retries",
        helpText: "Number of retry attempts on failure",
        placeholder: "Default: 1",
        required: true,
      });

      expect(spreadsheetFields.retries.min).toBe(0);
    });
  });

  describe("Complete Valid Examples", () => {
    it("should validate minimal valid node with CSV", () => {
      const result = spreadsheetSchema.safeParse({
        path: "/data/users.csv",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.hasHeaders).toBe(true);
        expect(result.data.delimiter).toBe(",");
        expect(result.data.skipEmptyLines).toBe(true);
      }
    });

    it("should validate Excel file with sheet name", () => {
      const result = spreadsheetSchema.safeParse({
        path: "/data/report.xlsx",
        format: "xlsx",
        sheetName: "Summary",
        hasHeaders: true,
      });

      expect(result.success).toBe(true);
    });

    it("should validate Excel file with sheet index", () => {
      const result = spreadsheetSchema.safeParse({
        path: "/data/report.xlsx",
        sheetIndex: 2,
        hasHeaders: false,
      });

      expect(result.success).toBe(true);
    });

    it("should validate CSV with custom delimiter", () => {
      const result = spreadsheetSchema.safeParse({
        path: "/data/report.tsv",
        format: "csv",
        delimiter: "\t",
        hasHeaders: true,
      });

      expect(result.success).toBe(true);
    });

    it("should validate ODS file", () => {
      const result = spreadsheetSchema.safeParse({
        path: "/data/report.ods",
        format: "ods",
        sheetName: "Data",
      });

      expect(result.success).toBe(true);
    });

    it("should validate with cell range", () => {
      const result = spreadsheetSchema.safeParse({
        path: "/data/report.xlsx",
        range: "A1:D100",
        hasHeaders: true,
      });

      expect(result.success).toBe(true);
    });

    it("should validate fully specified node", () => {
      const result = spreadsheetSchema.safeParse({
        path: "/data/users.xlsx",
        format: "xlsx",
        sheetName: "Users",
        hasHeaders: true,
        range: "A1:F1000",
        skipEmptyLines: true,
        enabled: true,
        timeout: 5000,
        retries: 3,
        label: "User Spreadsheet Reader",
        description: "Reads user data from Excel file",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("Invalid Examples", () => {
    it("should reject missing required path field", () => {
      const result = spreadsheetSchema.safeParse({
        hasHeaders: true,
        delimiter: ",",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toContain("path");
      }
    });

    it("should reject invalid format", () => {
      const result = spreadsheetSchema.safeParse({
        path: "/data/users.xlsx",
        format: "invalid",
      });

      expect(result.success).toBe(false);
    });

    it("should reject negative sheetIndex", () => {
      const result = spreadsheetSchema.safeParse({
        path: "/data/users.xlsx",
        sheetIndex: -1,
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid timeout", () => {
      const result = spreadsheetSchema.safeParse({
        path: "/data/users.xlsx",
        timeout: 0,
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid retries", () => {
      const result = spreadsheetSchema.safeParse({
        path: "/data/users.xlsx",
        retries: -1,
      });

      expect(result.success).toBe(false);
    });
  });

  describe("Type Safety", () => {
    it("all fields should have required controlType", () => {
      for (const [_key, field] of Object.entries(spreadsheetFields)) {
        expect(field.controlType).toBeDefined();
        expect(typeof field.controlType).toBe("string");
      }
    });

    it("all fields should have required label", () => {
      for (const [_key, field] of Object.entries(spreadsheetFields)) {
        expect(field.label).toBeDefined();
        expect(typeof field.label).toBe("string");
        expect(field.label.length).toBeGreaterThan(0);
      }
    });

    it("fields with options should have valid options array", () => {
      const fieldsWithOptions = ["format", "delimiter"];

      for (const fieldName of fieldsWithOptions) {
        const field = spreadsheetFields[fieldName];
        if (field.options) {
          expect(Array.isArray(field.options)).toBe(true);
          expect(field.options.length).toBeGreaterThan(0);

          for (const option of field.options) {
            expect(option.value).toBeDefined();
            expect(option.label).toBeDefined();
          }
        }
      }
    });
  });
});
