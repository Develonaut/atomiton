/**
 * Tests for extractCompositeMetadata function
 */

import { describe, it, expect } from "vitest";
import { extractCompositeMetadata } from "./extractCompositeMetadata";

describe("extractCompositeMetadata", () => {
  describe("Basic Functionality", () => {
    it("should extract metadata from valid YAML", () => {
      const yamlString = `
id: test-composite
name: Test Composite
version: 1.0.0
metadata:
  created: "2024-01-01T00:00:00Z"
  modified: "2024-01-01T00:00:00Z"
      `;

      const result = extractCompositeMetadata(yamlString);

      expect(result).toEqual({
        id: "test-composite",
        name: "Test Composite",
        version: "1.0.0",
        created: "2024-01-01T00:00:00Z",
        modified: "2024-01-01T00:00:00Z",
      });
    });

    it("should handle minimal YAML", () => {
      const yamlString = `
id: minimal
name: Minimal Composite
      `;

      const result = extractCompositeMetadata(yamlString);

      expect(result).toEqual({
        id: "minimal",
        name: "Minimal Composite",
        version: undefined,
        created: undefined,
        modified: undefined,
      });
    });

    it("should handle YAML with partial metadata", () => {
      const yamlString = `
id: partial
name: Partial Composite
version: 1.0.0
metadata:
  created: "2024-01-01T00:00:00Z"
      `;

      const result = extractCompositeMetadata(yamlString);

      expect(result).toEqual({
        id: "partial",
        name: "Partial Composite",
        version: "1.0.0",
        created: "2024-01-01T00:00:00Z",
        modified: undefined,
      });
    });
  });

  describe("Error Handling", () => {
    it("should return null for empty YAML", () => {
      expect(extractCompositeMetadata("")).toBeNull();
    });

    it("should return null for invalid YAML", () => {
      const invalidYaml = `
      [[[invalid yaml
      `;
      expect(extractCompositeMetadata(invalidYaml)).toBeNull();
    });

    it("should handle YAML with wrong data types", () => {
      const yamlString = `
id: 123
name: true
version: []
metadata: "not an object"
      `;

      const result = extractCompositeMetadata(yamlString);

      // Should handle type mismatches gracefully
      expect(result).toEqual({
        id: undefined, // 123 is not a string
        name: undefined, // true is not a string
        version: undefined, // [] is not a string
        created: undefined,
        modified: undefined,
      });
    });
  });

  describe("Complex Scenarios", () => {
    it("should handle YAML with nested metadata", () => {
      const yamlString = `
id: nested-test
name: Nested Test
version: 2.0.0
metadata:
  created: "2024-01-01T00:00:00Z"
  modified: "2024-01-02T00:00:00Z"
  author: Test Author
  tags:
    - test
    - composite
  custom:
    nested:
      value: deep
      `;

      const result = extractCompositeMetadata(yamlString);

      expect(result).toEqual({
        id: "nested-test",
        name: "Nested Test",
        version: "2.0.0",
        created: "2024-01-01T00:00:00Z",
        modified: "2024-01-02T00:00:00Z",
      });
    });

    it("should handle YAML with comments", () => {
      const yamlString = `
# This is a comment
id: comment-test # Inline comment
name: Comment Test
# Another comment
version: 1.0.0
metadata:
  created: "2024-01-01T00:00:00Z" # Creation date
  modified: "2024-01-01T00:00:00Z"
      `;

      const result = extractCompositeMetadata(yamlString);

      expect(result).toEqual({
        id: "comment-test",
        name: "Comment Test",
        version: "1.0.0",
        created: "2024-01-01T00:00:00Z",
        modified: "2024-01-01T00:00:00Z",
      });
    });

    it("should handle Unicode characters", () => {
      const yamlString = `
id: unicode-test
name: "Unicode Test 你好 世界 🌍"
version: 1.0.0
metadata:
  created: "2024-01-01T00:00:00Z"
  modified: "2024-01-01T00:00:00Z"
      `;

      const result = extractCompositeMetadata(yamlString);

      expect(result).toEqual({
        id: "unicode-test",
        name: "Unicode Test 你好 世界 🌍",
        version: "1.0.0",
        created: "2024-01-01T00:00:00Z",
        modified: "2024-01-01T00:00:00Z",
      });
    });

    it("should handle very large YAML", () => {
      const largeContent = Array(1000)
        .fill(null)
        .map((_, i) => `  node${i}: value${i}`)
        .join("\n");

      const yamlString = `
id: large-test
name: Large Test
version: 1.0.0
metadata:
  created: "2024-01-01T00:00:00Z"
  modified: "2024-01-01T00:00:00Z"
extraData:
${largeContent}
      `;

      const result = extractCompositeMetadata(yamlString);

      expect(result).toEqual({
        id: "large-test",
        name: "Large Test",
        version: "1.0.0",
        created: "2024-01-01T00:00:00Z",
        modified: "2024-01-01T00:00:00Z",
      });
    });
  });

  describe("Implementation Status", () => {
    it("should be fully functional with YAML parsing", () => {
      // This test verifies the function is working
      const yamlString = `
id: status-test
name: Status Test
      `;

      const result = extractCompositeMetadata(yamlString);

      // Should return extracted data, not null
      expect(result).not.toBeNull();
      expect(result?.id).toBe("status-test");
    });

    it("should handle all documented use cases", () => {
      // Test that all promised functionality works
      const testCases = [
        { yaml: "id: test", expectedId: "test" },
        { yaml: "name: Test Node", expectedName: "Test Node" },
        { yaml: "version: 1.2.3", expectedVersion: "1.2.3" },
      ];

      testCases.forEach(
        ({ yaml, expectedId, expectedName, expectedVersion }) => {
          const result = extractCompositeMetadata(yaml);
          if (expectedId) expect(result?.id).toBe(expectedId);
          if (expectedName) expect(result?.name).toBe(expectedName);
          if (expectedVersion) expect(result?.version).toBe(expectedVersion);
        },
      );
    });
  });
});
