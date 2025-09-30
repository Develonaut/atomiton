/**
 * Integration tests for file-system node field generation
 * Tests the complete pipeline: schema → createFieldsFromSchema → field config
 * Validates that field constraints match actual schema validation behavior
 */

import { describe, expect, it } from "vitest";
import { fileSystemFields } from "#definitions/file-system/fields";
import { fileSystemSchema } from "#schemas/file-system";

describe("File System Node Fields Integration", () => {
  describe("Field Generation Pipeline", () => {
    it("should generate all expected fields from schema", () => {
      const fieldKeys = Object.keys(fileSystemFields);

      // Should include all fields from fileSystemSchemaShape
      expect(fieldKeys).toContain("operation");
      expect(fieldKeys).toContain("path");
      expect(fieldKeys).toContain("content");
      expect(fieldKeys).toContain("recursive");

      // Should also include base schema fields
      expect(fieldKeys).toContain("enabled");
      expect(fieldKeys).toContain("timeout");
      expect(fieldKeys).toContain("retries");
      expect(fieldKeys).toContain("label");
      expect(fieldKeys).toContain("description");
    });

    it("should have exactly 9 fields total", () => {
      // 4 file-system-specific + 5 base fields
      expect(Object.keys(fileSystemFields)).toHaveLength(9);
    });

    it("should have field config for every schema field", () => {
      const schemaKeys = Object.keys(fileSystemSchema.shape);

      for (const key of schemaKeys) {
        expect(fileSystemFields[key]).toBeDefined();
        expect(fileSystemFields[key].controlType).toBeDefined();
        expect(fileSystemFields[key].label).toBeDefined();
      }
    });

    it("should not have extra fields not in schema", () => {
      const schemaKeys = Object.keys(fileSystemSchema.shape);
      const fieldKeys = Object.keys(fileSystemFields);

      for (const key of fieldKeys) {
        expect(schemaKeys).toContain(key);
      }
    });
  });

  describe("Auto-Derived Fields", () => {
    describe("Operation Field", () => {
      it("should have select control type (auto-derived from enum)", () => {
        expect(fileSystemFields.operation.controlType).toBe("select");
      });

      it("should have custom options with labels (overridden)", () => {
        expect(fileSystemFields.operation.options).toEqual([
          { value: "read", label: "Read" },
          { value: "write", label: "Write" },
          { value: "list", label: "List" },
          { value: "exists", label: "Exists" },
          { value: "create", label: "Create" },
          { value: "delete", label: "Delete" },
          { value: "copy", label: "Copy" },
          { value: "move", label: "Move" },
        ]);
      });

      it("should be required (has default but not optional)", () => {
        expect(fileSystemFields.operation.required).toBe(true);
      });

      it("should have placeholder showing default value", () => {
        expect(fileSystemFields.operation.placeholder).toBe("Default: read");
      });

      it("should have helpText from schema description", () => {
        expect(fileSystemFields.operation.helpText).toBe(
          "File system operation to perform",
        );
      });

      it("should use default value when not provided", () => {
        const result = fileSystemSchema.safeParse({
          path: "/path/to/file.txt",
        });

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.operation).toBe("read");
        }
      });

      it("should validate enum values", () => {
        const validOps = [
          "read",
          "write",
          "list",
          "exists",
          "create",
          "delete",
          "copy",
          "move",
        ];

        for (const op of validOps) {
          const result = fileSystemSchema.safeParse({
            operation: op,
            path: "/path/to/file.txt",
          });
          expect(result.success).toBe(true);
        }
      });

      it("should reject invalid operation", () => {
        const result = fileSystemSchema.safeParse({
          operation: "rename",
          path: "/path/to/file.txt",
        });
        expect(result.success).toBe(false);
      });
    });

    describe("Path Field", () => {
      it("should have text control type (auto-derived from string)", () => {
        expect(fileSystemFields.path.controlType).toBe("text");
      });

      it("should be required (no default, not optional)", () => {
        expect(fileSystemFields.path.required).toBe(true);
      });

      it("should have helpText from schema description", () => {
        expect(fileSystemFields.path.helpText).toBe("File or directory path");
      });

      it("should have auto-formatted label", () => {
        expect(fileSystemFields.path.label).toBe("Path");
      });

      it("should reject missing path", () => {
        const result = fileSystemSchema.safeParse({
          operation: "read",
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors[0].path).toContain("path");
        }
      });

      it("should reject empty path", () => {
        const result = fileSystemSchema.safeParse({
          path: "",
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors[0].message).toContain("Path is required");
        }
      });

      it("should accept non-empty paths", () => {
        const validPaths = [
          "/path/to/file.txt",
          "./relative/path.txt",
          "file.txt",
          "/",
        ];

        for (const path of validPaths) {
          const result = fileSystemSchema.safeParse({ path });
          expect(result.success).toBe(true);
        }
      });
    });

    describe("Content Field", () => {
      it("should have textarea control type (overridden)", () => {
        expect(fileSystemFields.content.controlType).toBe("textarea");
      });

      it("should be optional (no default, marked optional)", () => {
        expect(fileSystemFields.content.required).toBe(false);
      });

      it("should have custom placeholder (overridden)", () => {
        expect(fileSystemFields.content.placeholder).toBe("Content to write");
      });

      it("should have custom rows (overridden)", () => {
        expect(fileSystemFields.content.rows).toBe(5);
      });

      it("should have helpText from schema description", () => {
        expect(fileSystemFields.content.helpText).toBe(
          "Content to write to file",
        );
      });

      it("should accept undefined", () => {
        const result = fileSystemSchema.safeParse({
          path: "/path/to/file.txt",
        });

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.content).toBeUndefined();
        }
      });

      it("should accept string value", () => {
        const result = fileSystemSchema.safeParse({
          path: "/path/to/file.txt",
          content: "Hello, world!",
        });

        expect(result.success).toBe(true);
      });

      it("should accept empty string", () => {
        const result = fileSystemSchema.safeParse({
          path: "/path/to/file.txt",
          content: "",
        });

        expect(result.success).toBe(true);
      });

      it("should reject non-string value", () => {
        const result = fileSystemSchema.safeParse({
          path: "/path/to/file.txt",
          content: 123,
        });

        expect(result.success).toBe(false);
      });
    });

    describe("Recursive Field", () => {
      it("should have boolean control type (auto-derived)", () => {
        expect(fileSystemFields.recursive.controlType).toBe("boolean");
      });

      it("should be required (has default but not optional)", () => {
        expect(fileSystemFields.recursive.required).toBe(true);
      });

      it("should have placeholder showing default value", () => {
        expect(fileSystemFields.recursive.placeholder).toBe("Default: false");
      });

      it("should have helpText from schema description", () => {
        expect(fileSystemFields.recursive.helpText).toBe(
          "Perform recursive list operations",
        );
      });

      it("should use default value when not provided", () => {
        const result = fileSystemSchema.safeParse({
          path: "/path/to/directory",
        });

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.recursive).toBe(false);
        }
      });
    });
  });

  describe("Base Schema Fields", () => {
    it("enabled field should be auto-derived correctly", () => {
      expect(fileSystemFields.enabled).toMatchObject({
        controlType: "boolean",
        label: "Enabled",
        helpText: "Whether this node is enabled for execution",
        placeholder: "Default: true",
        required: true,
      });
    });

    it("timeout field should be auto-derived with constraints", () => {
      expect(fileSystemFields.timeout).toMatchObject({
        controlType: "number",
        label: "Timeout",
        helpText: "Maximum execution time in milliseconds",
        placeholder: "Default: 30000",
        required: true,
      });

      expect(fileSystemFields.timeout.min).toBe(1);

      // Verify schema validates this
      const resultInvalid = fileSystemSchema.safeParse({
        path: "/path/to/file.txt",
        timeout: 0,
      });
      expect(resultInvalid.success).toBe(false);
    });

    it("retries field should be auto-derived with constraints", () => {
      expect(fileSystemFields.retries).toMatchObject({
        controlType: "number",
        label: "Retries",
        helpText: "Number of retry attempts on failure",
        placeholder: "Default: 1",
        required: true,
      });

      expect(fileSystemFields.retries.min).toBe(0);
    });

    it("label field should be auto-derived as optional", () => {
      expect(fileSystemFields.label).toMatchObject({
        controlType: "text",
        label: "Label",
        helpText: "Custom label for this node instance",
        required: false,
      });
    });

    it("description field should be auto-derived as optional", () => {
      expect(fileSystemFields.description).toMatchObject({
        controlType: "text",
        label: "Description",
        helpText: "Custom description for this node instance",
        required: false,
      });
    });
  });

  describe("Type Safety", () => {
    it("all fields should have required controlType", () => {
      for (const [_key, field] of Object.entries(fileSystemFields)) {
        expect(field.controlType).toBeDefined();
        expect(typeof field.controlType).toBe("string");
      }
    });

    it("all fields should have required label", () => {
      for (const [_key, field] of Object.entries(fileSystemFields)) {
        expect(field.label).toBeDefined();
        expect(typeof field.label).toBe("string");
        expect(field.label.length).toBeGreaterThan(0);
      }
    });

    it("fields with options should have valid options array", () => {
      if (fileSystemFields.operation.options) {
        expect(Array.isArray(fileSystemFields.operation.options)).toBe(true);
        expect(fileSystemFields.operation.options.length).toBeGreaterThan(0);

        for (const option of fileSystemFields.operation.options) {
          expect(option.value).toBeDefined();
          expect(option.label).toBeDefined();
        }
      }
    });
  });

  describe("Complete Valid Examples", () => {
    it("should validate minimal valid node", () => {
      const result = fileSystemSchema.safeParse({
        path: "/path/to/file.txt",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.operation).toBe("read");
        expect(result.data.recursive).toBe(false);
        expect(result.data.enabled).toBe(true);
        expect(result.data.timeout).toBe(30000);
        expect(result.data.retries).toBe(1);
      }
    });

    it("should validate read operation", () => {
      const result = fileSystemSchema.safeParse({
        operation: "read",
        path: "/path/to/file.txt",
      });

      expect(result.success).toBe(true);
    });

    it("should validate write operation", () => {
      const result = fileSystemSchema.safeParse({
        operation: "write",
        path: "/path/to/file.txt",
        content: "Hello, world!",
      });

      expect(result.success).toBe(true);
    });

    it("should validate list operation", () => {
      const result = fileSystemSchema.safeParse({
        operation: "list",
        path: "/path/to/directory",
        recursive: true,
      });

      expect(result.success).toBe(true);
    });

    it("should validate exists operation", () => {
      const result = fileSystemSchema.safeParse({
        operation: "exists",
        path: "/path/to/file.txt",
      });

      expect(result.success).toBe(true);
    });

    it("should validate create operation", () => {
      const result = fileSystemSchema.safeParse({
        operation: "create",
        path: "/path/to/directory",
      });

      expect(result.success).toBe(true);
    });

    it("should validate delete operation", () => {
      const result = fileSystemSchema.safeParse({
        operation: "delete",
        path: "/path/to/file.txt",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("Invalid Examples", () => {
    it("should reject missing path", () => {
      const result = fileSystemSchema.safeParse({
        operation: "read",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toContain("path");
      }
    });

    it("should reject empty path", () => {
      const result = fileSystemSchema.safeParse({
        path: "",
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid operation", () => {
      const result = fileSystemSchema.safeParse({
        operation: "rename",
        path: "/path/to/file.txt",
      });

      expect(result.success).toBe(false);
    });

    it("should reject non-string content", () => {
      const result = fileSystemSchema.safeParse({
        path: "/path/to/file.txt",
        content: 123,
      });

      expect(result.success).toBe(false);
    });

    it("should reject non-boolean recursive", () => {
      const result = fileSystemSchema.safeParse({
        path: "/path/to/directory",
        recursive: "true",
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid timeout", () => {
      const result = fileSystemSchema.safeParse({
        path: "/path/to/file.txt",
        timeout: 0,
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid retries", () => {
      const result = fileSystemSchema.safeParse({
        path: "/path/to/file.txt",
        retries: -1,
      });

      expect(result.success).toBe(false);
    });
  });
});
