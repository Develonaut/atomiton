/**
 * Tests for formatValidationErrors function
 *
 * This tests the utility function for formatting validation errors into
 * human-readable strings for display and logging.
 */

import { describe, it, expect } from "vitest";
import { formatValidationErrors } from "./formatValidationErrors.js";
import type { ValidationError } from "../types.js";

describe("formatValidationErrors", () => {
  describe("Basic Formatting", () => {
    it("should format empty errors array", () => {
      const result = formatValidationErrors([]);

      expect(result).toBe("");
    });

    it("should format single error", () => {
      const errors: ValidationError[] = [
        {
          path: "test.field",
          message: "Field is required",
          code: "REQUIRED_FIELD",
        },
      ];

      const result = formatValidationErrors(errors);

      expect(result).toBe("test.field: Field is required (REQUIRED_FIELD)");
    });

    it("should format multiple errors with newlines", () => {
      const errors: ValidationError[] = [
        {
          path: "field1",
          message: "First error",
          code: "ERROR_1",
        },
        {
          path: "field2",
          message: "Second error",
          code: "ERROR_2",
        },
      ];

      const result = formatValidationErrors(errors);

      expect(result).toBe(
        "field1: First error (ERROR_1)\nfield2: Second error (ERROR_2)",
      );
    });

    it("should format error with data field ignored", () => {
      const errors: ValidationError[] = [
        {
          path: "test.field",
          message: "Error message",
          code: "TEST_ERROR",
          data: { ignored: "data" },
        },
      ];

      const result = formatValidationErrors(errors);

      expect(result).toBe("test.field: Error message (TEST_ERROR)");
    });
  });

  describe("Path Formatting", () => {
    it("should handle simple path", () => {
      const errors: ValidationError[] = [
        {
          path: "name",
          message: "Invalid name",
          code: "INVALID_NAME",
        },
      ];

      const result = formatValidationErrors(errors);

      expect(result).toBe("name: Invalid name (INVALID_NAME)");
    });

    it("should handle nested path", () => {
      const errors: ValidationError[] = [
        {
          path: "user.profile.email",
          message: "Invalid email format",
          code: "INVALID_EMAIL",
        },
      ];

      const result = formatValidationErrors(errors);

      expect(result).toBe(
        "user.profile.email: Invalid email format (INVALID_EMAIL)",
      );
    });

    it("should handle array index path", () => {
      const errors: ValidationError[] = [
        {
          path: "items[0].name",
          message: "Name is required",
          code: "REQUIRED_FIELD",
        },
      ];

      const result = formatValidationErrors(errors);

      expect(result).toBe("items[0].name: Name is required (REQUIRED_FIELD)");
    });

    it("should handle complex nested array path", () => {
      const errors: ValidationError[] = [
        {
          path: "users[3].addresses[1].street",
          message: "Street address is required",
          code: "REQUIRED_STREET",
        },
      ];

      const result = formatValidationErrors(errors);

      expect(result).toBe(
        "users[3].addresses[1].street: Street address is required (REQUIRED_STREET)",
      );
    });

    it("should handle empty path", () => {
      const errors: ValidationError[] = [
        {
          path: "",
          message: "Root level error",
          code: "ROOT_ERROR",
        },
      ];

      const result = formatValidationErrors(errors);

      expect(result).toBe(": Root level error (ROOT_ERROR)");
    });

    it("should handle root path", () => {
      const errors: ValidationError[] = [
        {
          path: "root",
          message: "Root validation failed",
          code: "ROOT_VALIDATION",
        },
      ];

      const result = formatValidationErrors(errors);

      expect(result).toBe("root: Root validation failed (ROOT_VALIDATION)");
    });
  });

  describe("Message Formatting", () => {
    it("should handle short message", () => {
      const errors: ValidationError[] = [
        {
          path: "field",
          message: "Error",
          code: "ERR",
        },
      ];

      const result = formatValidationErrors(errors);

      expect(result).toBe("field: Error (ERR)");
    });

    it("should handle long message", () => {
      const longMessage =
        "This is a very long error message that describes in detail what went wrong and provides extensive context for debugging";
      const errors: ValidationError[] = [
        {
          path: "field",
          message: longMessage,
          code: "LONG_ERROR",
        },
      ];

      const result = formatValidationErrors(errors);

      expect(result).toBe(`field: ${longMessage} (LONG_ERROR)`);
    });

    it("should handle message with special characters", () => {
      const specialMessage = "Error: value '@#$%^&*()' is invalid";
      const errors: ValidationError[] = [
        {
          path: "field",
          message: specialMessage,
          code: "SPECIAL_CHARS",
        },
      ];

      const result = formatValidationErrors(errors);

      expect(result).toBe(`field: ${specialMessage} (SPECIAL_CHARS)`);
    });

    it("should handle message with Unicode", () => {
      const unicodeMessage = "错误：字段值无效 🚫";
      const errors: ValidationError[] = [
        {
          path: "field",
          message: unicodeMessage,
          code: "UNICODE_ERROR",
        },
      ];

      const result = formatValidationErrors(errors);

      expect(result).toBe(`field: ${unicodeMessage} (UNICODE_ERROR)`);
    });

    it("should handle empty message", () => {
      const errors: ValidationError[] = [
        {
          path: "field",
          message: "",
          code: "EMPTY_MESSAGE",
        },
      ];

      const result = formatValidationErrors(errors);

      expect(result).toBe("field:  (EMPTY_MESSAGE)");
    });

    it("should handle message with newlines", () => {
      const multilineMessage = "Line 1\nLine 2\nLine 3";
      const errors: ValidationError[] = [
        {
          path: "field",
          message: multilineMessage,
          code: "MULTILINE",
        },
      ];

      const result = formatValidationErrors(errors);

      expect(result).toBe(`field: ${multilineMessage} (MULTILINE)`);
    });
  });

  describe("Code Formatting", () => {
    it("should handle standard error code", () => {
      const errors: ValidationError[] = [
        {
          path: "field",
          message: "Error message",
          code: "VALIDATION_ERROR",
        },
      ];

      const result = formatValidationErrors(errors);

      expect(result).toBe("field: Error message (VALIDATION_ERROR)");
    });

    it("should handle code with underscores", () => {
      const errors: ValidationError[] = [
        {
          path: "field",
          message: "Error message",
          code: "DUPLICATE_NODE_ID",
        },
      ];

      const result = formatValidationErrors(errors);

      expect(result).toBe("field: Error message (DUPLICATE_NODE_ID)");
    });

    it("should handle code with dots", () => {
      const errors: ValidationError[] = [
        {
          path: "field",
          message: "Error message",
          code: "validation.error.type",
        },
      ];

      const result = formatValidationErrors(errors);

      expect(result).toBe("field: Error message (validation.error.type)");
    });

    it("should handle lowercase code", () => {
      const errors: ValidationError[] = [
        {
          path: "field",
          message: "Error message",
          code: "lowercase_error",
        },
      ];

      const result = formatValidationErrors(errors);

      expect(result).toBe("field: Error message (lowercase_error)");
    });

    it("should handle empty code", () => {
      const errors: ValidationError[] = [
        {
          path: "field",
          message: "Error message",
          code: "",
        },
      ];

      const result = formatValidationErrors(errors);

      expect(result).toBe("field: Error message ()");
    });

    it("should handle numeric code", () => {
      const errors: ValidationError[] = [
        {
          path: "field",
          message: "Error message",
          code: "ERROR_404",
        },
      ];

      const result = formatValidationErrors(errors);

      expect(result).toBe("field: Error message (ERROR_404)");
    });
  });

  describe("Real-world Error Scenarios", () => {
    it("should format composite validation errors", () => {
      const errors: ValidationError[] = [
        {
          path: "nodes[0].id",
          message: "Node ID is required",
          code: "REQUIRED_FIELD",
          data: { nodeIndex: 0 },
        },
        {
          path: "nodes[1].type",
          message: "Unknown node type: custom-processor",
          code: "UNKNOWN_NODE_TYPE",
          data: { nodeId: "node-1", nodeType: "custom-processor" },
        },
        {
          path: "edges[0].source",
          message: "Source node not found: missing-node",
          code: "INVALID_SOURCE_NODE",
          data: { edgeId: "edge-1", sourceId: "missing-node" },
        },
      ];

      const result = formatValidationErrors(errors);

      const expected = [
        "nodes[0].id: Node ID is required (REQUIRED_FIELD)",
        "nodes[1].type: Unknown node type: custom-processor (UNKNOWN_NODE_TYPE)",
        "edges[0].source: Source node not found: missing-node (INVALID_SOURCE_NODE)",
      ].join("\n");

      expect(result).toBe(expected);
    });

    it("should format schema validation errors", () => {
      const errors: ValidationError[] = [
        {
          path: "metadata.created",
          message: "Expected string, received number",
          code: "invalid_type",
          data: { zodError: true },
        },
        {
          path: "metadata.tags",
          message: "Expected array, received string",
          code: "invalid_type",
          data: { zodError: true },
        },
      ];

      const result = formatValidationErrors(errors);

      const expected = [
        "metadata.created: Expected string, received number (invalid_type)",
        "metadata.tags: Expected array, received string (invalid_type)",
      ].join("\n");

      expect(result).toBe(expected);
    });

    it("should format duplicate errors", () => {
      const errors: ValidationError[] = [
        {
          path: "nodes[2].id",
          message: "Duplicate node ID: processor",
          code: "DUPLICATE_NODE_ID",
          data: { nodeId: "processor", index: 2 },
        },
        {
          path: "edges[1].id",
          message: "Duplicate edge ID: connection",
          code: "DUPLICATE_EDGE_ID",
          data: { edgeId: "connection", index: 1 },
        },
      ];

      const result = formatValidationErrors(errors);

      const expected = [
        "nodes[2].id: Duplicate node ID: processor (DUPLICATE_NODE_ID)",
        "edges[1].id: Duplicate edge ID: connection (DUPLICATE_EDGE_ID)",
      ].join("\n");

      expect(result).toBe(expected);
    });
  });

  describe("Edge Cases", () => {
    it("should handle single error in array", () => {
      const errors: ValidationError[] = [
        {
          path: "single",
          message: "Single error",
          code: "SINGLE",
        },
      ];

      const result = formatValidationErrors(errors);

      expect(result).toBe("single: Single error (SINGLE)");
    });

    it("should handle many errors", () => {
      const errors: ValidationError[] = Array.from({ length: 100 }, (_, i) => ({
        path: `field${i}`,
        message: `Error ${i}`,
        code: `CODE_${i}`,
      }));

      const result = formatValidationErrors(errors);

      const lines = result.split("\n");
      expect(lines).toHaveLength(100);
      expect(lines[0]).toBe("field0: Error 0 (CODE_0)");
      expect(lines[99]).toBe("field99: Error 99 (CODE_99)");
    });

    it("should handle errors with very long paths", () => {
      const longPath =
        "very.long.nested.path.that.goes.deep.into.the.object.structure";
      const errors: ValidationError[] = [
        {
          path: longPath,
          message: "Deep error",
          code: "DEEP_ERROR",
        },
      ];

      const result = formatValidationErrors(errors);

      expect(result).toBe(`${longPath}: Deep error (DEEP_ERROR)`);
    });

    it("should handle errors with identical content", () => {
      const errors: ValidationError[] = [
        {
          path: "field1",
          message: "Same error",
          code: "SAME_CODE",
        },
        {
          path: "field2",
          message: "Same error",
          code: "SAME_CODE",
        },
      ];

      const result = formatValidationErrors(errors);

      expect(result).toBe(
        "field1: Same error (SAME_CODE)\nfield2: Same error (SAME_CODE)",
      );
    });

    it("should handle mixed error types", () => {
      const errors: ValidationError[] = [
        {
          path: "",
          message: "",
          code: "",
        },
        {
          path: "normal.path",
          message: "Normal message",
          code: "NORMAL_CODE",
        },
        {
          path: "unicode.路径",
          message: "Unicode message 🎉",
          code: "UNICODE_CODE",
        },
      ];

      const result = formatValidationErrors(errors);

      const expected = [
        ":  ()",
        "normal.path: Normal message (NORMAL_CODE)",
        "unicode.路径: Unicode message 🎉 (UNICODE_CODE)",
      ].join("\n");

      expect(result).toBe(expected);
    });

    it("should preserve order of errors", () => {
      const errors: ValidationError[] = [
        { path: "z", message: "Last alphabetically", code: "Z" },
        { path: "a", message: "First alphabetically", code: "A" },
        { path: "m", message: "Middle alphabetically", code: "M" },
      ];

      const result = formatValidationErrors(errors);

      expect(result).toBe(
        "z: Last alphabetically (Z)\na: First alphabetically (A)\nm: Middle alphabetically (M)",
      );
    });

    it("should handle errors with undefined optional fields", () => {
      const errors: ValidationError[] = [
        {
          path: "field",
          message: "Error",
          code: "CODE",
          data: undefined,
        },
      ];

      const result = formatValidationErrors(errors);

      expect(result).toBe("field: Error (CODE)");
    });
  });

  describe("Performance", () => {
    it("should handle large numbers of errors efficiently", () => {
      const manyErrors: ValidationError[] = Array.from(
        { length: 10000 },
        (_, i) => ({
          path: `field${i}`,
          message: `Error message ${i}`,
          code: `CODE_${i}`,
        }),
      );

      const startTime = performance.now();
      const result = formatValidationErrors(manyErrors);
      const endTime = performance.now();

      expect(result).toBeDefined();
      expect(result.split("\n")).toHaveLength(10000);
      expect(endTime - startTime).toBeLessThan(100); // Should be fast
    });

    it("should handle very long messages efficiently", () => {
      const longMessage = "x".repeat(10000);
      const errors: ValidationError[] = Array.from({ length: 100 }, (_, i) => ({
        path: `field${i}`,
        message: longMessage,
        code: `CODE_${i}`,
      }));

      const startTime = performance.now();
      const result = formatValidationErrors(errors);
      const endTime = performance.now();

      expect(result).toBeDefined();
      expect(result.includes(longMessage)).toBe(true);
      expect(endTime - startTime).toBeLessThan(200); // Should still be reasonably fast
    });
  });

  describe("Integration with Error Creation", () => {
    it("should work with createValidationError output", () => {
      // Simulate what createValidationError would produce
      const error: ValidationError = {
        path: "nodes[0].id",
        message: "Duplicate node ID: test",
        code: "DUPLICATE_NODE_ID",
        data: { nodeId: "test", index: 0 },
      };

      const result = formatValidationErrors([error]);

      expect(result).toBe(
        "nodes[0].id: Duplicate node ID: test (DUPLICATE_NODE_ID)",
      );
    });

    it("should work with validation result errors", () => {
      // Simulate validation result structure
      const validationErrors: ValidationError[] = [
        {
          path: "metadata.created",
          message: "Invalid timestamp format",
          code: "INVALID_TIMESTAMP",
          data: { value: "not-a-date" },
        },
        {
          path: "nodes[1].type",
          message: "Unknown node type: custom",
          code: "UNKNOWN_NODE_TYPE",
          data: { nodeType: "custom", availableTypes: ["http", "transform"] },
        },
      ];

      const result = formatValidationErrors(validationErrors);

      const expected = [
        "metadata.created: Invalid timestamp format (INVALID_TIMESTAMP)",
        "nodes[1].type: Unknown node type: custom (UNKNOWN_NODE_TYPE)",
      ].join("\n");

      expect(result).toBe(expected);
    });
  });
});
