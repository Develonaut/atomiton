/**
 * Tests for createValidationError function
 *
 * This tests the utility function for creating standardized validation error objects.
 */

import { describe, it, expect } from "vitest";
import { createValidationError } from "./createValidationError";

describe("createValidationError", () => {
  describe("Basic Error Creation", () => {
    it("should create basic validation error with required fields", () => {
      const error = createValidationError(
        "test.path",
        "Test message",
        "TEST_CODE",
      );

      expect(error).toEqual({
        path: "test.path",
        message: "Test message",
        code: "TEST_CODE",
        data: undefined,
      });
    });

    it("should create validation error with data field", () => {
      const testData = { nodeId: "test-node", value: 123 };
      const error = createValidationError(
        "test.path",
        "Test message",
        "TEST_CODE",
        testData,
      );

      expect(error).toEqual({
        path: "test.path",
        message: "Test message",
        code: "TEST_CODE",
        data: testData,
      });
    });

    it("should handle undefined data explicitly", () => {
      const error = createValidationError(
        "test.path",
        "Test message",
        "TEST_CODE",
        undefined,
      );

      expect(error).toEqual({
        path: "test.path",
        message: "Test message",
        code: "TEST_CODE",
        data: undefined,
      });
    });

    it("should handle null data", () => {
      const error = createValidationError(
        "test.path",
        "Test message",
        "TEST_CODE",
        null,
      );

      expect(error).toEqual({
        path: "test.path",
        message: "Test message",
        code: "TEST_CODE",
        data: null,
      });
    });
  });

  describe("Path Variations", () => {
    it("should handle simple path", () => {
      const error = createValidationError("field", "Error", "CODE");

      expect(error.path).toBe("field");
    });

    it("should handle nested path", () => {
      const error = createValidationError(
        "object.nested.field",
        "Error",
        "CODE",
      );

      expect(error.path).toBe("object.nested.field");
    });

    it("should handle array index path", () => {
      const error = createValidationError("items[0].property", "Error", "CODE");

      expect(error.path).toBe("items[0].property");
    });

    it("should handle complex path", () => {
      const error = createValidationError(
        "root.children[5].metadata.tags[2]",
        "Error",
        "CODE",
      );

      expect(error.path).toBe("root.children[5].metadata.tags[2]");
    });

    it("should handle empty path", () => {
      const error = createValidationError("", "Error", "CODE");

      expect(error.path).toBe("");
    });

    it("should handle root path", () => {
      const error = createValidationError("root", "Error", "CODE");

      expect(error.path).toBe("root");
    });
  });

  describe("Message Variations", () => {
    it("should handle short message", () => {
      const error = createValidationError("path", "Error", "CODE");

      expect(error.message).toBe("Error");
    });

    it("should handle long message", () => {
      const longMessage =
        "This is a very long error message that describes in detail what went wrong during validation and provides context for debugging the issue.";
      const error = createValidationError("path", longMessage, "CODE");

      expect(error.message).toBe(longMessage);
    });

    it("should handle message with special characters", () => {
      const specialMessage =
        "Error: field 'name' contains invalid chars: @#$%^&*()";
      const error = createValidationError("path", specialMessage, "CODE");

      expect(error.message).toBe(specialMessage);
    });

    it("should handle message with Unicode", () => {
      const unicodeMessage = "错误：字段包含无效字符 🚫";
      const error = createValidationError("path", unicodeMessage, "CODE");

      expect(error.message).toBe(unicodeMessage);
    });

    it("should handle empty message", () => {
      const error = createValidationError("path", "", "CODE");

      expect(error.message).toBe("");
    });

    it("should handle message with newlines", () => {
      const multilineMessage =
        "Error on line 1\nContinued on line 2\nAnd line 3";
      const error = createValidationError("path", multilineMessage, "CODE");

      expect(error.message).toBe(multilineMessage);
    });
  });

  describe("Code Variations", () => {
    it("should handle standard error code", () => {
      const error = createValidationError(
        "path",
        "message",
        "VALIDATION_ERROR",
      );

      expect(error.code).toBe("VALIDATION_ERROR");
    });

    it("should handle code with underscores", () => {
      const error = createValidationError(
        "path",
        "message",
        "DUPLICATE_NODE_ID",
      );

      expect(error.code).toBe("DUPLICATE_NODE_ID");
    });

    it("should handle code with dots", () => {
      const error = createValidationError(
        "path",
        "message",
        "validation.error.type",
      );

      expect(error.code).toBe("validation.error.type");
    });

    it("should handle lowercase code", () => {
      const error = createValidationError("path", "message", "lowercase_code");

      expect(error.code).toBe("lowercase_code");
    });

    it("should handle mixed case code", () => {
      const error = createValidationError("path", "message", "MixedCase_Code");

      expect(error.code).toBe("MixedCase_Code");
    });

    it("should handle empty code", () => {
      const error = createValidationError("path", "message", "");

      expect(error.code).toBe("");
    });

    it("should handle numeric code", () => {
      const error = createValidationError("path", "message", "ERROR_404");

      expect(error.code).toBe("ERROR_404");
    });
  });

  describe("Data Variations", () => {
    it("should handle primitive data types", () => {
      const stringError = createValidationError(
        "path",
        "message",
        "CODE",
        "string data",
      );
      const numberError = createValidationError("path", "message", "CODE", 42);
      const booleanError = createValidationError(
        "path",
        "message",
        "CODE",
        true,
      );

      expect(stringError.data).toBe("string data");
      expect(numberError.data).toBe(42);
      expect(booleanError.data).toBe(true);
    });

    it("should handle object data", () => {
      const objectData = {
        nodeId: "test-node",
        index: 5,
        details: {
          nested: "value",
          array: [1, 2, 3],
        },
      };
      const error = createValidationError(
        "path",
        "message",
        "CODE",
        objectData,
      );

      expect(error.data).toEqual(objectData);
      expect(error.data).toBe(objectData); // Should be the same reference
    });

    it("should handle array data", () => {
      const arrayData = ["item1", "item2", { complex: "object" }];
      const error = createValidationError("path", "message", "CODE", arrayData);

      expect(error.data).toEqual(arrayData);
    });

    it("should handle function data", () => {
      const functionData = () => "test";
      const error = createValidationError(
        "path",
        "message",
        "CODE",
        functionData,
      );

      expect(error.data).toBe(functionData);
    });

    it("should handle date data", () => {
      const dateData = new Date("2024-01-01T00:00:00Z");
      const error = createValidationError("path", "message", "CODE", dateData);

      expect(error.data).toBe(dateData);
    });

    it("should handle regex data", () => {
      const regexData = /test/gi;
      const error = createValidationError("path", "message", "CODE", regexData);

      expect(error.data).toBe(regexData);
    });

    it("should handle Symbol data", () => {
      const symbolData = Symbol("test");
      const error = createValidationError(
        "path",
        "message",
        "CODE",
        symbolData,
      );

      expect(error.data).toBe(symbolData);
    });
  });

  describe("Real-world Error Scenarios", () => {
    it("should create duplicate node ID error", () => {
      const error = createValidationError(
        "nodes[3].id",
        "Duplicate node ID: user-input",
        "DUPLICATE_NODE_ID",
        { nodeId: "user-input", index: 3 },
      );

      expect(error).toEqual({
        path: "nodes[3].id",
        message: "Duplicate node ID: user-input",
        code: "DUPLICATE_NODE_ID",
        data: { nodeId: "user-input", index: 3 },
      });
    });

    it("should create invalid edge reference error", () => {
      const error = createValidationError(
        "edges[1].source",
        "Source node not found: missing-node",
        "INVALID_SOURCE_NODE",
        { edgeId: "edge-123", sourceId: "missing-node" },
      );

      expect(error).toEqual({
        path: "edges[1].source",
        message: "Source node not found: missing-node",
        code: "INVALID_SOURCE_NODE",
        data: { edgeId: "edge-123", sourceId: "missing-node" },
      });
    });

    it("should create unknown node type error", () => {
      const error = createValidationError(
        "nodes[0].type",
        "Unknown node type: custom-processor",
        "UNKNOWN_NODE_TYPE",
        {
          nodeId: "processor-1",
          nodeType: "custom-processor",
          availableTypes: ["http-request", "data-transform", "condition"],
        },
      );

      expect(error).toEqual({
        path: "nodes[0].type",
        message: "Unknown node type: custom-processor",
        code: "UNKNOWN_NODE_TYPE",
        data: {
          nodeId: "processor-1",
          nodeType: "custom-processor",
          availableTypes: ["http-request", "data-transform", "condition"],
        },
      });
    });

    it("should create schema validation error", () => {
      const zodError = {
        code: "invalid_type",
        expected: "string",
        received: "number",
        path: ["metadata", "author"],
        message: "Expected string, received number",
      };

      const error = createValidationError(
        "metadata.author",
        "Expected string, received number",
        "invalid_type",
        zodError,
      );

      expect(error).toEqual({
        path: "metadata.author",
        message: "Expected string, received number",
        code: "invalid_type",
        data: zodError,
      });
    });

    it("should create timestamp validation error", () => {
      const error = createValidationError(
        "metadata.created",
        "Invalid timestamp format",
        "INVALID_TIMESTAMP",
        {
          value: "not-a-date",
          expectedFormat: "ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)",
        },
      );

      expect(error).toEqual({
        path: "metadata.created",
        message: "Invalid timestamp format",
        code: "INVALID_TIMESTAMP",
        data: {
          value: "not-a-date",
          expectedFormat: "ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)",
        },
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long paths", () => {
      const longPath = "a".repeat(1000);
      const error = createValidationError(longPath, "message", "CODE");

      expect(error.path).toBe(longPath);
      expect(error.path.length).toBe(1000);
    });

    it("should handle very long messages", () => {
      const longMessage = "Error: " + "x".repeat(10000);
      const error = createValidationError("path", longMessage, "CODE");

      expect(error.message).toBe(longMessage);
      expect(error.message.length).toBe(10007);
    });

    it("should handle circular reference in data", () => {
      const circularData: any = { name: "test" };
      circularData.self = circularData;

      const error = createValidationError(
        "path",
        "message",
        "CODE",
        circularData,
      );

      expect(error.data).toBe(circularData);
      expect((error.data as any).self).toBe(circularData);
    });

    it("should handle special object types", () => {
      const errorObject = new Error("Test error");
      const error = createValidationError(
        "path",
        "message",
        "CODE",
        errorObject,
      );

      expect(error.data).toBe(errorObject);
      expect(error.data instanceof Error).toBe(true);
    });

    it("should maintain object reference integrity", () => {
      const originalData = { count: 1 };
      const error = createValidationError(
        "path",
        "message",
        "CODE",
        originalData,
      );

      // Modifying original should affect error data (reference preserved)
      originalData.count = 2;
      expect((error.data as any).count).toBe(2);
    });
  });

  describe("Type Safety", () => {
    it("should return object with correct structure", () => {
      const error = createValidationError("path", "message", "CODE", {
        test: true,
      });

      expect(typeof error).toBe("object");
      expect(error).not.toBeNull();
      expect(error).toHaveProperty("path");
      expect(error).toHaveProperty("message");
      expect(error).toHaveProperty("code");
      expect(error).toHaveProperty("data");
    });

    it("should preserve data type", () => {
      const stringError = createValidationError(
        "path",
        "message",
        "CODE",
        "string",
      );
      const numberError = createValidationError("path", "message", "CODE", 123);
      const objectError = createValidationError("path", "message", "CODE", {
        key: "value",
      });

      expect(typeof stringError.data).toBe("string");
      expect(typeof numberError.data).toBe("number");
      expect(typeof objectError.data).toBe("object");
    });

    it("should handle all JavaScript data types", () => {
      const testCases = [
        undefined,
        null,
        true,
        false,
        0,
        -1,
        1.5,
        Infinity,
        -Infinity,
        NaN,
        "",
        "string",
        [],
        [1, 2, 3],
        {},
        { key: "value" },
        () => {},
        new Date(),
        /regex/,
        Symbol("test"),
        BigInt(123),
      ];

      testCases.forEach((testData, _index) => {
        const error = createValidationError(
          "path",
          "message",
          "CODE",
          testData,
        );
        expect(error.data).toBe(testData);
      });
    });
  });
});
