/**
 * Tests for hasCriticalErrors function
 *
 * This tests the utility function that determines if a validation result
 * contains critical errors that should prevent further processing.
 */

import { describe, it, expect } from "vitest";
import { hasCriticalErrors } from "./hasCriticalErrors";
import type { ValidationResult, ValidationError } from "../types";

describe("hasCriticalErrors", () => {
  describe("No Errors", () => {
    it("should return false for successful validation result", () => {
      const result: ValidationResult = {
        success: true,
        errors: [],
      };

      expect(hasCriticalErrors(result)).toBe(false);
    });

    it("should return false for empty errors array", () => {
      const result: ValidationResult = {
        success: false,
        errors: [],
      };

      expect(hasCriticalErrors(result)).toBe(false);
    });
  });

  describe("Critical Errors", () => {
    it("should detect DUPLICATE_NODE_ID as critical", () => {
      const result: ValidationResult = {
        success: false,
        errors: [
          {
            path: "nodes[1].id",
            message: "Duplicate node ID: test",
            code: "DUPLICATE_NODE_ID",
            data: { nodeId: "test", index: 1 },
          },
        ],
      };

      expect(hasCriticalErrors(result)).toBe(true);
    });

    it("should detect DUPLICATE_EDGE_ID as critical", () => {
      const result: ValidationResult = {
        success: false,
        errors: [
          {
            path: "edges[2].id",
            message: "Duplicate edge ID: connection",
            code: "DUPLICATE_EDGE_ID",
            data: { edgeId: "connection", index: 2 },
          },
        ],
      };

      expect(hasCriticalErrors(result)).toBe(true);
    });

    it("should detect INVALID_SOURCE_NODE as critical", () => {
      const result: ValidationResult = {
        success: false,
        errors: [
          {
            path: "edges[0].source",
            message: "Source node not found: missing",
            code: "INVALID_SOURCE_NODE",
            data: { edgeId: "edge1", sourceId: "missing" },
          },
        ],
      };

      expect(hasCriticalErrors(result)).toBe(true);
    });

    it("should detect INVALID_TARGET_NODE as critical", () => {
      const result: ValidationResult = {
        success: false,
        errors: [
          {
            path: "edges[0].target",
            message: "Target node not found: missing",
            code: "INVALID_TARGET_NODE",
            data: { edgeId: "edge1", targetId: "missing" },
          },
        ],
      };

      expect(hasCriticalErrors(result)).toBe(true);
    });

    it("should detect INVALID_TIMESTAMP as critical", () => {
      const result: ValidationResult = {
        success: false,
        errors: [
          {
            path: "metadata.created",
            message: "Invalid timestamp format",
            code: "INVALID_TIMESTAMP",
            data: { value: "not-a-date" },
          },
        ],
      };

      expect(hasCriticalErrors(result)).toBe(true);
    });
  });

  describe("Non-Critical Errors", () => {
    it("should not detect UNKNOWN_NODE_TYPE as critical", () => {
      const result: ValidationResult = {
        success: false,
        errors: [
          {
            path: "nodes[0].type",
            message: "Unknown node type: custom",
            code: "UNKNOWN_NODE_TYPE",
            data: { nodeType: "custom" },
          },
        ],
      };

      expect(hasCriticalErrors(result)).toBe(false);
    });

    it("should not detect schema validation errors as critical", () => {
      const result: ValidationResult = {
        success: false,
        errors: [
          {
            path: "name",
            message: "Expected string, received number",
            code: "invalid_type",
            data: { zodError: true },
          },
        ],
      };

      expect(hasCriticalErrors(result)).toBe(false);
    });

    it("should not detect custom error codes as critical", () => {
      const result: ValidationResult = {
        success: false,
        errors: [
          {
            path: "custom.field",
            message: "Custom validation failed",
            code: "CUSTOM_ERROR",
            data: { custom: true },
          },
        ],
      };

      expect(hasCriticalErrors(result)).toBe(false);
    });

    it("should not detect empty error code as critical", () => {
      const result: ValidationResult = {
        success: false,
        errors: [
          {
            path: "field",
            message: "Error message",
            code: "",
            data: null,
          },
        ],
      };

      expect(hasCriticalErrors(result)).toBe(false);
    });
  });

  describe("Mixed Errors", () => {
    it("should detect critical errors among non-critical ones", () => {
      const result: ValidationResult = {
        success: false,
        errors: [
          {
            path: "nodes[0].type",
            message: "Unknown node type: custom",
            code: "UNKNOWN_NODE_TYPE",
            data: { nodeType: "custom" },
          },
          {
            path: "nodes[1].id",
            message: "Duplicate node ID: test",
            code: "DUPLICATE_NODE_ID", // Critical
            data: { nodeId: "test", index: 1 },
          },
          {
            path: "metadata.author",
            message: "Expected string, received number",
            code: "invalid_type",
            data: { zodError: true },
          },
        ],
      };

      expect(hasCriticalErrors(result)).toBe(true);
    });

    it("should return true if any error is critical", () => {
      const result: ValidationResult = {
        success: false,
        errors: [
          {
            path: "field1",
            message: "Non-critical error 1",
            code: "NON_CRITICAL_1",
          },
          {
            path: "field2",
            message: "Non-critical error 2",
            code: "NON_CRITICAL_2",
          },
          {
            path: "edges[0].source",
            message: "Source node not found",
            code: "INVALID_SOURCE_NODE", // Critical
          },
          {
            path: "field3",
            message: "Non-critical error 3",
            code: "NON_CRITICAL_3",
          },
        ],
      };

      expect(hasCriticalErrors(result)).toBe(true);
    });

    it("should return false if no errors are critical", () => {
      const result: ValidationResult = {
        success: false,
        errors: [
          {
            path: "field1",
            message: "Non-critical error 1",
            code: "NON_CRITICAL_1",
          },
          {
            path: "field2",
            message: "Non-critical error 2",
            code: "NON_CRITICAL_2",
          },
          {
            path: "field3",
            message: "Non-critical error 3",
            code: "NON_CRITICAL_3",
          },
        ],
      };

      expect(hasCriticalErrors(result)).toBe(false);
    });
  });

  describe("Multiple Critical Errors", () => {
    it("should detect multiple critical errors", () => {
      const result: ValidationResult = {
        success: false,
        errors: [
          {
            path: "nodes[1].id",
            message: "Duplicate node ID: test",
            code: "DUPLICATE_NODE_ID",
          },
          {
            path: "edges[0].source",
            message: "Source node not found: missing",
            code: "INVALID_SOURCE_NODE",
          },
          {
            path: "metadata.created",
            message: "Invalid timestamp",
            code: "INVALID_TIMESTAMP",
          },
        ],
      };

      expect(hasCriticalErrors(result)).toBe(true);
    });

    it("should detect all types of critical errors together", () => {
      const result: ValidationResult = {
        success: false,
        errors: [
          {
            path: "nodes[1].id",
            message: "Duplicate node ID",
            code: "DUPLICATE_NODE_ID",
          },
          {
            path: "edges[1].id",
            message: "Duplicate edge ID",
            code: "DUPLICATE_EDGE_ID",
          },
          {
            path: "edges[0].source",
            message: "Invalid source node",
            code: "INVALID_SOURCE_NODE",
          },
          {
            path: "edges[0].target",
            message: "Invalid target node",
            code: "INVALID_TARGET_NODE",
          },
          {
            path: "metadata.created",
            message: "Invalid timestamp",
            code: "INVALID_TIMESTAMP",
          },
        ],
      };

      expect(hasCriticalErrors(result)).toBe(true);
    });
  });

  describe("Case Sensitivity", () => {
    it("should be case sensitive for error codes", () => {
      const result: ValidationResult = {
        success: false,
        errors: [
          {
            path: "field",
            message: "Error message",
            code: "duplicate_node_id", // Lowercase, should not match
          },
        ],
      };

      expect(hasCriticalErrors(result)).toBe(false);
    });

    it("should not match partial error codes", () => {
      const result: ValidationResult = {
        success: false,
        errors: [
          {
            path: "field",
            message: "Error message",
            code: "DUPLICATE_NODE", // Partial match, should not be critical
          },
        ],
      };

      expect(hasCriticalErrors(result)).toBe(false);
    });

    it("should not match error codes with extra characters", () => {
      const result: ValidationResult = {
        success: false,
        errors: [
          {
            path: "field",
            message: "Error message",
            code: "DUPLICATE_NODE_ID_EXTRA", // Extra characters, should not match
          },
        ],
      };

      expect(hasCriticalErrors(result)).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    it("should handle result with warnings but no errors", () => {
      const result: ValidationResult = {
        success: true,
        errors: [],
        warnings: [
          {
            path: "field",
            message: "Warning message",
            code: "WARNING_CODE",
          },
        ],
      };

      expect(hasCriticalErrors(result)).toBe(false);
    });

    it("should only check errors, not warnings", () => {
      const result: ValidationResult = {
        success: false,
        errors: [
          {
            path: "field",
            message: "Non-critical error",
            code: "NON_CRITICAL",
          },
        ],
        warnings: [
          {
            path: "warning.field",
            message: "Critical-looking warning",
            code: "DUPLICATE_NODE_ID", // Critical code in warning, should be ignored
          },
        ],
      };

      expect(hasCriticalErrors(result)).toBe(false);
    });

    it("should handle errors without data field", () => {
      const result: ValidationResult = {
        success: false,
        errors: [
          {
            path: "nodes[1].id",
            message: "Duplicate node ID",
            code: "DUPLICATE_NODE_ID",
            // No data field
          },
        ],
      };

      expect(hasCriticalErrors(result)).toBe(true);
    });

    it("should handle errors with null/undefined data", () => {
      const result: ValidationResult = {
        success: false,
        errors: [
          {
            path: "nodes[1].id",
            message: "Duplicate node ID",
            code: "DUPLICATE_NODE_ID",
            data: null,
          },
          {
            path: "edges[0].source",
            message: "Invalid source",
            code: "INVALID_SOURCE_NODE",
            data: undefined,
          },
        ],
      };

      expect(hasCriticalErrors(result)).toBe(true);
    });
  });

  describe("Performance", () => {
    it("should handle large numbers of non-critical errors efficiently", () => {
      const manyErrors: ValidationError[] = Array.from(
        { length: 10000 },
        (_, i) => ({
          path: `field${i}`,
          message: `Non-critical error ${i}`,
          code: `NON_CRITICAL_${i}`,
        }),
      );

      const result: ValidationResult = {
        success: false,
        errors: manyErrors,
      };

      const startTime = performance.now();
      const isCritical = hasCriticalErrors(result);
      const endTime = performance.now();

      expect(isCritical).toBe(false);
      expect(endTime - startTime).toBeLessThan(50); // Should be fast
    });

    it("should detect critical error early in large array", () => {
      const manyErrors: ValidationError[] = [
        {
          path: "critical.field",
          message: "Critical error",
          code: "DUPLICATE_NODE_ID", // Critical error at start
        },
        ...Array.from({ length: 9999 }, (_, i) => ({
          path: `field${i}`,
          message: `Non-critical error ${i}`,
          code: `NON_CRITICAL_${i}`,
        })),
      ];

      const result: ValidationResult = {
        success: false,
        errors: manyErrors,
      };

      const startTime = performance.now();
      const isCritical = hasCriticalErrors(result);
      const endTime = performance.now();

      expect(isCritical).toBe(true);
      expect(endTime - startTime).toBeLessThan(10); // Should short-circuit and be very fast
    });

    it("should find critical error at end of large array", () => {
      const manyErrors: ValidationError[] = [
        ...Array.from({ length: 9999 }, (_, i) => ({
          path: `field${i}`,
          message: `Non-critical error ${i}`,
          code: `NON_CRITICAL_${i}`,
        })),
        {
          path: "critical.field",
          message: "Critical error",
          code: "INVALID_TIMESTAMP", // Critical error at end
        },
      ];

      const result: ValidationResult = {
        success: false,
        errors: manyErrors,
      };

      const startTime = performance.now();
      const isCritical = hasCriticalErrors(result);
      const endTime = performance.now();

      expect(isCritical).toBe(true);
      expect(endTime - startTime).toBeLessThan(100); // Should still be reasonably fast
    });
  });

  describe("Real-world Scenarios", () => {
    it("should handle typical composite validation result", () => {
      const result: ValidationResult = {
        success: false,
        errors: [
          {
            path: "nodes[2].id",
            message: "Duplicate node ID: http-request",
            code: "DUPLICATE_NODE_ID",
            data: { nodeId: "http-request", index: 2 },
          },
          {
            path: "nodes[0].type",
            message: "Unknown node type: custom-processor",
            code: "UNKNOWN_NODE_TYPE",
            data: { nodeType: "custom-processor" },
          },
        ],
      };

      expect(hasCriticalErrors(result)).toBe(true);
    });

    it("should handle validation result with only warnings", () => {
      const result: ValidationResult = {
        success: true,
        errors: [],
        warnings: [
          {
            path: "nodes[0].type",
            message: "Node type not recommended: deprecated-type",
            code: "DEPRECATED_NODE_TYPE",
            data: { nodeType: "deprecated-type" },
          },
        ],
      };

      expect(hasCriticalErrors(result)).toBe(false);
    });

    it("should handle schema validation with mixed severity", () => {
      const result: ValidationResult = {
        success: false,
        errors: [
          {
            path: "metadata.created",
            message: "Invalid timestamp format",
            code: "INVALID_TIMESTAMP", // Critical
            data: { value: "not-a-date" },
          },
          {
            path: "metadata.tags",
            message: "Expected array, received string",
            code: "invalid_type", // Non-critical schema error
            data: { zodError: true },
          },
        ],
      };

      expect(hasCriticalErrors(result)).toBe(true);
    });
  });
});
