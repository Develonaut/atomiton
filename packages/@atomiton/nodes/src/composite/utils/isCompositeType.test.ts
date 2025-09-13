/**
 * Tests for isCompositeType function
 *
 * This tests the utility function that determines if a given type string
 * represents a composite/blueprint node type.
 */

import { describe, it, expect } from "vitest";
import { isCompositeType } from "./isCompositeType";

describe("isCompositeType", () => {
  describe("Valid Composite Types", () => {
    it("should return true for 'composite'", () => {
      expect(isCompositeType("composite")).toBe(true);
    });

    it("should return true for 'blueprint'", () => {
      expect(isCompositeType("blueprint")).toBe(true);
    });
  });

  describe("Invalid Types", () => {
    it("should return false for atomic types", () => {
      expect(isCompositeType("atomic")).toBe(false);
      expect(isCompositeType("http-request")).toBe(false);
      expect(isCompositeType("data-transform")).toBe(false);
      expect(isCompositeType("condition")).toBe(false);
    });

    it("should return false for empty string", () => {
      expect(isCompositeType("")).toBe(false);
    });

    it("should return false for case variations", () => {
      expect(isCompositeType("Composite")).toBe(false);
      expect(isCompositeType("COMPOSITE")).toBe(false);
      expect(isCompositeType("Blueprint")).toBe(false);
      expect(isCompositeType("BLUEPRINT")).toBe(false);
    });

    it("should return false for partial matches", () => {
      expect(isCompositeType("comp")).toBe(false);
      expect(isCompositeType("composites")).toBe(false);
      expect(isCompositeType("blueprint-extended")).toBe(false);
      expect(isCompositeType("my-composite")).toBe(false);
    });

    it("should return false for whitespace", () => {
      expect(isCompositeType(" composite")).toBe(false);
      expect(isCompositeType("composite ")).toBe(false);
      expect(isCompositeType(" composite ")).toBe(false);
      expect(isCompositeType("  ")).toBe(false);
      expect(isCompositeType("\t")).toBe(false);
      expect(isCompositeType("\n")).toBe(false);
    });

    it("should return false for special characters", () => {
      expect(isCompositeType("composite-")).toBe(false);
      expect(isCompositeType("-composite")).toBe(false);
      expect(isCompositeType("composite_")).toBe(false);
      expect(isCompositeType("composite.")).toBe(false);
      expect(isCompositeType("composite:")).toBe(false);
    });

    it("should return false for numbers", () => {
      expect(isCompositeType("1")).toBe(false);
      expect(isCompositeType("123")).toBe(false);
      expect(isCompositeType("composite1")).toBe(false);
      expect(isCompositeType("1composite")).toBe(false);
    });

    it("should return false for null-like strings", () => {
      expect(isCompositeType("null")).toBe(false);
      expect(isCompositeType("undefined")).toBe(false);
      expect(isCompositeType("false")).toBe(false);
      expect(isCompositeType("true")).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    it("should handle Unicode characters", () => {
      expect(isCompositeType("composite-üñiçødé")).toBe(false);
      expect(isCompositeType("composité")).toBe(false);
      expect(isCompositeType("复合")).toBe(false);
    });

    it("should handle very long strings", () => {
      const longString = "composite" + "x".repeat(1000);
      expect(isCompositeType(longString)).toBe(false);
    });

    it("should handle strings with newlines", () => {
      expect(isCompositeType("composite\nblueprint")).toBe(false);
      expect(isCompositeType("comp\nosite")).toBe(false);
    });

    it("should handle JSON-like strings", () => {
      expect(isCompositeType('{"type": "composite"}')).toBe(false);
      expect(isCompositeType("[composite]")).toBe(false);
    });
  });

  describe("Performance", () => {
    it("should handle many calls efficiently", () => {
      const startTime = performance.now();

      for (let i = 0; i < 10000; i++) {
        isCompositeType("composite");
        isCompositeType("blueprint");
        isCompositeType("atomic");
        isCompositeType("invalid");
      }

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100); // Should be very fast
    });

    it("should handle large strings efficiently", () => {
      const largeString = "x".repeat(100000);

      const startTime = performance.now();
      const result = isCompositeType(largeString);
      const endTime = performance.now();

      expect(result).toBe(false);
      expect(endTime - startTime).toBeLessThan(50);
    });
  });

  describe("Type Safety", () => {
    it("should always return boolean", () => {
      const testCases = [
        "composite",
        "blueprint",
        "atomic",
        "",
        "random",
        "123",
        "null",
        "undefined",
        " ",
        "\t\n",
        "🎉",
        "a".repeat(1000),
      ];

      testCases.forEach((testCase) => {
        const result = isCompositeType(testCase);
        expect(typeof result).toBe("boolean");
      });
    });

    it("should be consistent across multiple calls", () => {
      const testCases = ["composite", "blueprint", "atomic", "invalid"];

      testCases.forEach((testCase) => {
        const result1 = isCompositeType(testCase);
        const result2 = isCompositeType(testCase);
        const result3 = isCompositeType(testCase);

        expect(result1).toBe(result2);
        expect(result2).toBe(result3);
      });
    });
  });

  describe("Real-world Usage", () => {
    it("should work with node type checking", () => {
      const nodeTypes = [
        "composite",
        "blueprint",
        "http-request",
        "data-transform",
        "file-reader",
        "condition",
        "timer",
      ];

      const compositeTypes = nodeTypes.filter(isCompositeType);

      expect(compositeTypes).toEqual(["composite", "blueprint"]);
      expect(compositeTypes).toHaveLength(2);
    });

    it("should work in conditional logic", () => {
      const processNode = (type: string) => {
        if (isCompositeType(type)) {
          return "Processing composite node";
        } else {
          return "Processing atomic node";
        }
      };

      expect(processNode("composite")).toBe("Processing composite node");
      expect(processNode("blueprint")).toBe("Processing composite node");
      expect(processNode("http-request")).toBe("Processing atomic node");
      expect(processNode("condition")).toBe("Processing atomic node");
    });

    it("should work with type guards", () => {
      const validateNodeType = (type: string): string => {
        if (isCompositeType(type)) {
          return `Valid composite type: ${type}`;
        }
        return `Not a composite type: ${type}`;
      };

      expect(validateNodeType("composite")).toBe(
        "Valid composite type: composite",
      );
      expect(validateNodeType("blueprint")).toBe(
        "Valid composite type: blueprint",
      );
      expect(validateNodeType("atomic")).toBe("Not a composite type: atomic");
    });
  });
});
