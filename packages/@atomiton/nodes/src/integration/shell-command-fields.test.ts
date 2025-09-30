/**
 * Integration tests for shell-command node field generation
 * Tests the complete pipeline: schema → createFieldsFromSchema → field config
 * Validates that field constraints match actual schema validation behavior
 */

import { describe, expect, it } from "vitest";
import { shellCommandFields } from "#definitions/shell-command/fields";
import { shellCommandSchema } from "#schemas/shell-command";

describe("Shell Command Node Fields Integration", () => {
  describe("Field Generation Pipeline", () => {
    it("should generate all expected fields from schema", () => {
      const fieldKeys = Object.keys(shellCommandFields);

      // Should include all fields from shellCommandSchemaShape
      expect(fieldKeys).toContain("command");
      expect(fieldKeys).toContain("args");
      expect(fieldKeys).toContain("shell");
      expect(fieldKeys).toContain("stdin");
      expect(fieldKeys).toContain("captureOutput");

      // Should also include base schema fields
      expect(fieldKeys).toContain("enabled");
      expect(fieldKeys).toContain("timeout");
      expect(fieldKeys).toContain("retries");
      expect(fieldKeys).toContain("label");
      expect(fieldKeys).toContain("description");
    });

    it("should have exactly 10 fields total", () => {
      // 5 shell-command-specific + 5 base fields
      expect(Object.keys(shellCommandFields)).toHaveLength(10);
    });

    it("should have field config for every schema field", () => {
      const schemaKeys = Object.keys(shellCommandSchema.shape);

      for (const key of schemaKeys) {
        expect(shellCommandFields[key]).toBeDefined();
        expect(shellCommandFields[key].controlType).toBeDefined();
        expect(shellCommandFields[key].label).toBeDefined();
      }
    });

    it("should not have extra fields not in schema", () => {
      const schemaKeys = Object.keys(shellCommandSchema.shape);
      const fieldKeys = Object.keys(shellCommandFields);

      for (const key of fieldKeys) {
        expect(schemaKeys).toContain(key);
      }
    });
  });

  describe("Auto-Derived Fields", () => {
    describe("Command Field", () => {
      it("should have textarea control type (overridden)", () => {
        expect(shellCommandFields.command.controlType).toBe("textarea");
      });

      it("should be required (no default, not optional)", () => {
        expect(shellCommandFields.command.required).toBe(true);
      });

      it("should have custom placeholder (overridden)", () => {
        expect(shellCommandFields.command.placeholder).toBe("ls -la");
      });

      it("should have custom rows (overridden)", () => {
        expect(shellCommandFields.command.rows).toBe(3);
      });

      it("should have helpText from schema description", () => {
        expect(shellCommandFields.command.helpText).toBe(
          "Shell command to execute",
        );
      });

      it("should reject missing command", () => {
        const result = shellCommandSchema.safeParse({});

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors[0].path).toContain("command");
        }
      });

      it("should reject empty command", () => {
        const result = shellCommandSchema.safeParse({
          command: "",
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors[0].message).toContain(
            "Command is required",
          );
        }
      });

      it("should accept non-empty commands", () => {
        const validCommands = [
          "ls -la",
          "echo 'hello'",
          "npm test",
          "cat file.txt",
        ];

        for (const command of validCommands) {
          const result = shellCommandSchema.safeParse({ command });
          expect(result.success).toBe(true);
        }
      });
    });

    describe("Args Field", () => {
      it("should have textarea control type (overridden)", () => {
        expect(shellCommandFields.args.controlType).toBe("textarea");
      });

      it("should be required (has default but not optional)", () => {
        expect(shellCommandFields.args.required).toBe(true);
      });

      it("should have custom placeholder (overridden)", () => {
        expect(shellCommandFields.args.placeholder).toBe(
          '["--verbose", "--output", "result.txt"]',
        );
      });

      it("should have custom rows (overridden)", () => {
        expect(shellCommandFields.args.rows).toBe(2);
      });

      it("should have helpText from schema description", () => {
        expect(shellCommandFields.args.helpText).toBe(
          "Command arguments as array",
        );
      });

      it("should use default value when not provided", () => {
        const result = shellCommandSchema.safeParse({
          command: "ls",
        });

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.args).toEqual([]);
        }
      });

      it("should accept array of strings", () => {
        const result = shellCommandSchema.safeParse({
          command: "ls",
          args: ["--verbose", "--output", "result.txt"],
        });

        expect(result.success).toBe(true);
      });

      it("should reject non-array values", () => {
        const result = shellCommandSchema.safeParse({
          command: "ls",
          args: "not an array",
        });

        expect(result.success).toBe(false);
      });

      it("should reject array with non-string values", () => {
        const result = shellCommandSchema.safeParse({
          command: "ls",
          args: [1, 2, 3],
        });

        expect(result.success).toBe(false);
      });
    });

    describe("Shell Field", () => {
      it("should have select control type (auto-derived from enum)", () => {
        expect(shellCommandFields.shell.controlType).toBe("select");
      });

      it("should have custom options with labels (overridden)", () => {
        expect(shellCommandFields.shell.options).toEqual([
          { value: "bash", label: "Bash" },
          { value: "sh", label: "sh" },
          { value: "zsh", label: "Zsh" },
        ]);
      });

      it("should be required (has default but not optional)", () => {
        expect(shellCommandFields.shell.required).toBe(true);
      });

      it("should have placeholder showing default value", () => {
        expect(shellCommandFields.shell.placeholder).toBe("Default: bash");
      });

      it("should have helpText from schema description", () => {
        expect(shellCommandFields.shell.helpText).toBe(
          "Shell to use for execution",
        );
      });

      it("should use default value when not provided", () => {
        const result = shellCommandSchema.safeParse({
          command: "ls",
        });

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.shell).toBe("bash");
        }
      });

      it("should validate enum values", () => {
        const validShells = ["bash", "sh", "zsh"];

        for (const shell of validShells) {
          const result = shellCommandSchema.safeParse({
            command: "ls",
            shell,
          });
          expect(result.success).toBe(true);
        }
      });

      it("should reject invalid shell", () => {
        const result = shellCommandSchema.safeParse({
          command: "ls",
          shell: "fish",
        });
        expect(result.success).toBe(false);
      });
    });

    describe("Stdin Field", () => {
      it("should have textarea control type (overridden)", () => {
        expect(shellCommandFields.stdin.controlType).toBe("textarea");
      });

      it("should be optional (no default, marked optional)", () => {
        expect(shellCommandFields.stdin.required).toBe(false);
      });

      it("should have custom placeholder (overridden)", () => {
        expect(shellCommandFields.stdin.placeholder).toBe(
          "Data to pipe to command",
        );
      });

      it("should have custom rows (overridden)", () => {
        expect(shellCommandFields.stdin.rows).toBe(3);
      });

      it("should have helpText from schema description", () => {
        expect(shellCommandFields.stdin.helpText).toBe("Data to pipe to stdin");
      });

      it("should accept undefined", () => {
        const result = shellCommandSchema.safeParse({
          command: "ls",
        });

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.stdin).toBeUndefined();
        }
      });

      it("should accept string value", () => {
        const result = shellCommandSchema.safeParse({
          command: "grep",
          stdin: "line1\nline2\nline3",
        });

        expect(result.success).toBe(true);
      });

      it("should reject non-string value", () => {
        const result = shellCommandSchema.safeParse({
          command: "grep",
          stdin: 123,
        });

        expect(result.success).toBe(false);
      });
    });

    describe("CaptureOutput Field", () => {
      it("should have boolean control type (auto-derived)", () => {
        expect(shellCommandFields.captureOutput.controlType).toBe("boolean");
      });

      it("should be required (has default but not optional)", () => {
        expect(shellCommandFields.captureOutput.required).toBe(true);
      });

      it("should have placeholder showing default value", () => {
        expect(shellCommandFields.captureOutput.placeholder).toBe(
          "Default: true",
        );
      });

      it("should have helpText from schema description", () => {
        expect(shellCommandFields.captureOutput.helpText).toBe(
          "Whether to capture command output",
        );
      });

      it("should use default value when not provided", () => {
        const result = shellCommandSchema.safeParse({
          command: "ls",
        });

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.captureOutput).toBe(true);
        }
      });
    });
  });

  describe("Base Schema Fields", () => {
    it("enabled field should be auto-derived correctly", () => {
      expect(shellCommandFields.enabled).toMatchObject({
        controlType: "boolean",
        label: "Enabled",
        helpText: "Whether this node is enabled for execution",
        placeholder: "Default: true",
        required: true,
      });
    });

    it("timeout field should be auto-derived with constraints", () => {
      expect(shellCommandFields.timeout).toMatchObject({
        controlType: "number",
        label: "Timeout",
        helpText: "Maximum execution time in milliseconds",
        placeholder: "Default: 30000",
        required: true,
      });

      expect(shellCommandFields.timeout.min).toBe(1);

      // Verify schema validates this
      const resultInvalid = shellCommandSchema.safeParse({
        command: "ls",
        timeout: 0,
      });
      expect(resultInvalid.success).toBe(false);
    });

    it("retries field should be auto-derived with constraints", () => {
      expect(shellCommandFields.retries).toMatchObject({
        controlType: "number",
        label: "Retries",
        helpText: "Number of retry attempts on failure",
        placeholder: "Default: 1",
        required: true,
      });

      expect(shellCommandFields.retries.min).toBe(0);
    });

    it("label field should be auto-derived as optional", () => {
      expect(shellCommandFields.label).toMatchObject({
        controlType: "text",
        label: "Label",
        helpText: "Custom label for this node instance",
        required: false,
      });
    });

    it("description field should be auto-derived as optional", () => {
      expect(shellCommandFields.description).toMatchObject({
        controlType: "text",
        label: "Description",
        helpText: "Custom description for this node instance",
        required: false,
      });
    });
  });

  describe("Type Safety", () => {
    it("all fields should have required controlType", () => {
      for (const [_key, field] of Object.entries(shellCommandFields)) {
        expect(field.controlType).toBeDefined();
        expect(typeof field.controlType).toBe("string");
      }
    });

    it("all fields should have required label", () => {
      for (const [_key, field] of Object.entries(shellCommandFields)) {
        expect(field.label).toBeDefined();
        expect(typeof field.label).toBe("string");
        expect(field.label.length).toBeGreaterThan(0);
      }
    });

    it("fields with options should have valid options array", () => {
      if (shellCommandFields.shell.options) {
        expect(Array.isArray(shellCommandFields.shell.options)).toBe(true);
        expect(shellCommandFields.shell.options.length).toBeGreaterThan(0);

        for (const option of shellCommandFields.shell.options) {
          expect(option.value).toBeDefined();
          expect(option.label).toBeDefined();
        }
      }
    });
  });

  describe("Complete Valid Examples", () => {
    it("should validate minimal valid node", () => {
      const result = shellCommandSchema.safeParse({
        command: "ls",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.args).toEqual([]);
        expect(result.data.shell).toBe("bash");
        expect(result.data.captureOutput).toBe(true);
        expect(result.data.enabled).toBe(true);
        expect(result.data.timeout).toBe(30000);
        expect(result.data.retries).toBe(1);
      }
    });

    it("should validate command with args", () => {
      const result = shellCommandSchema.safeParse({
        command: "ls",
        args: ["-la", "/home"],
      });

      expect(result.success).toBe(true);
    });

    it("should validate command with stdin", () => {
      const result = shellCommandSchema.safeParse({
        command: "grep",
        args: ["error"],
        stdin: "line1\nline2\nerror on line3\nline4",
      });

      expect(result.success).toBe(true);
    });

    it("should validate command with different shell", () => {
      const result = shellCommandSchema.safeParse({
        command: "echo $SHELL",
        shell: "zsh",
      });

      expect(result.success).toBe(true);
    });

    it("should validate command without capturing output", () => {
      const result = shellCommandSchema.safeParse({
        command: "rm temp.txt",
        captureOutput: false,
      });

      expect(result.success).toBe(true);
    });
  });

  describe("Invalid Examples", () => {
    it("should reject missing command", () => {
      const result = shellCommandSchema.safeParse({});

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toContain("command");
      }
    });

    it("should reject empty command", () => {
      const result = shellCommandSchema.safeParse({
        command: "",
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid shell", () => {
      const result = shellCommandSchema.safeParse({
        command: "ls",
        shell: "fish",
      });

      expect(result.success).toBe(false);
    });

    it("should reject non-array args", () => {
      const result = shellCommandSchema.safeParse({
        command: "ls",
        args: "not an array",
      });

      expect(result.success).toBe(false);
    });

    it("should reject args with non-string values", () => {
      const result = shellCommandSchema.safeParse({
        command: "ls",
        args: [1, 2, 3],
      });

      expect(result.success).toBe(false);
    });

    it("should reject non-string stdin", () => {
      const result = shellCommandSchema.safeParse({
        command: "grep",
        stdin: 123,
      });

      expect(result.success).toBe(false);
    });

    it("should reject non-boolean captureOutput", () => {
      const result = shellCommandSchema.safeParse({
        command: "ls",
        captureOutput: "true",
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid timeout", () => {
      const result = shellCommandSchema.safeParse({
        command: "ls",
        timeout: 0,
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid retries", () => {
      const result = shellCommandSchema.safeParse({
        command: "ls",
        retries: -1,
      });

      expect(result.success).toBe(false);
    });
  });
});
