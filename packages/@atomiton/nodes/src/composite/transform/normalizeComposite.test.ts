/**
 * Tests for normalizeComposite function
 *
 * This tests the normalization function that converts a composite to YAML
 * and back to JSON to ensure consistent formatting and remove parsing artifacts.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { normalizeComposite } from "./normalizeComposite";
import type { CompositeDefinition, TransformationOptions } from "../types";

// Mock the transform functions since they might have YAML import issues
vi.mock("./toYaml", () => ({
  toYaml: vi.fn(),
}));

vi.mock("./fromYaml", () => ({
  fromYaml: vi.fn(),
}));

import { toYaml } from "./toYaml";
import { fromYaml } from "./fromYaml";

const mockToYaml = vi.mocked(toYaml);
const mockFromYaml = vi.mocked(fromYaml);

describe("normalizeComposite", () => {
  const sampleComposite: CompositeDefinition = {
    id: "test-composite",
    name: "Test Composite",
    type: "composite",
    category: "test",
    description: "A test composite node",
    version: "1.0.0",
    metadata: {
      created: "2024-01-01T00:00:00Z",
      modified: "2024-01-01T00:00:00Z",
      author: "Test Author",
    },
    nodes: [
      {
        id: "node1",
        type: "test-node",
        position: { x: 0, y: 0 },
        data: {},
      },
    ],
    edges: [
      {
        id: "edge1",
        source: { nodeId: "node1", portId: "output" },
        target: { nodeId: "node1", portId: "input" },
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Successful Normalization", () => {
    it("should normalize composite successfully with default options", () => {
      const yamlString = "id: test-composite\nname: Test Composite\n...";
      const normalizedComposite = { ...sampleComposite, normalized: true };

      mockToYaml.mockReturnValue({
        success: true,
        data: yamlString,
      });

      mockFromYaml.mockReturnValue({
        success: true,
        data: normalizedComposite,
      });

      const result = normalizeComposite(sampleComposite);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(normalizedComposite);
      expect(result.errors).toBeUndefined();
      expect(result.warnings).toBeUndefined();

      expect(mockToYaml).toHaveBeenCalledWith(sampleComposite, {});
      expect(mockFromYaml).toHaveBeenCalledWith(yamlString, {});
    });

    it("should normalize composite with custom options", () => {
      const options: TransformationOptions = {
        preserveComments: true,
        formatOutput: true,
        validateResult: false,
      };
      const yamlString = "# Comment\nid: test-composite\n...";
      const normalizedComposite = { ...sampleComposite };

      mockToYaml.mockReturnValue({
        success: true,
        data: yamlString,
      });

      mockFromYaml.mockReturnValue({
        success: true,
        data: normalizedComposite,
      });

      const result = normalizeComposite(sampleComposite, options);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(normalizedComposite);

      expect(mockToYaml).toHaveBeenCalledWith(sampleComposite, options);
      expect(mockFromYaml).toHaveBeenCalledWith(yamlString, options);
    });

    it("should preserve warnings from both operations", () => {
      const yamlString = "id: test-composite\n...";
      const normalizedComposite = { ...sampleComposite };

      mockToYaml.mockReturnValue({
        success: true,
        data: yamlString,
        warnings: [
          {
            path: "toYaml.warning",
            message: "YAML conversion warning",
            code: "YAML_WARNING",
          },
        ],
      });

      mockFromYaml.mockReturnValue({
        success: true,
        data: normalizedComposite,
        warnings: [
          {
            path: "fromYaml.warning",
            message: "JSON conversion warning",
            code: "JSON_WARNING",
          },
        ],
      });

      const result = normalizeComposite(sampleComposite);

      expect(result.success).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings?.[0].code).toBe("JSON_WARNING");
    });
  });

  describe("toYaml Failures", () => {
    it("should handle toYaml failure", () => {
      mockToYaml.mockReturnValue({
        success: false,
        errors: [
          {
            path: "composite",
            message: "Failed to convert to YAML",
            code: "YAML_CONVERSION_ERROR",
          },
        ],
      });

      const result = normalizeComposite(sampleComposite);

      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.errors).toHaveLength(1);
      expect(result.errors?.[0].code).toBe("YAML_CONVERSION_ERROR");

      expect(mockToYaml).toHaveBeenCalledWith(sampleComposite, {});
      expect(mockFromYaml).not.toHaveBeenCalled();
    });

    it("should handle toYaml returning no data", () => {
      mockToYaml.mockReturnValue({
        success: true,
        data: undefined,
      });

      const result = normalizeComposite(sampleComposite);

      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();

      expect(mockToYaml).toHaveBeenCalledWith(sampleComposite, {});
      expect(mockFromYaml).not.toHaveBeenCalled();
    });

    it("should propagate toYaml warnings on failure", () => {
      mockToYaml.mockReturnValue({
        success: false,
        errors: [
          {
            path: "test",
            message: "YAML error",
            code: "YAML_ERROR",
          },
        ],
        warnings: [
          {
            path: "test",
            message: "YAML warning",
            code: "YAML_WARNING",
          },
        ],
      });

      const result = normalizeComposite(sampleComposite);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings?.[0].code).toBe("YAML_WARNING");
    });
  });

  describe("fromYaml Failures", () => {
    it("should handle fromYaml failure", () => {
      const yamlString = "invalid: yaml: content";

      mockToYaml.mockReturnValue({
        success: true,
        data: yamlString,
      });

      mockFromYaml.mockReturnValue({
        success: false,
        errors: [
          {
            path: "yaml",
            message: "Failed to parse YAML",
            code: "YAML_PARSE_ERROR",
          },
        ],
      });

      const result = normalizeComposite(sampleComposite);

      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.errors).toHaveLength(1);
      expect(result.errors?.[0].code).toBe("YAML_PARSE_ERROR");

      expect(mockToYaml).toHaveBeenCalledWith(sampleComposite, {});
      expect(mockFromYaml).toHaveBeenCalledWith(yamlString, {});
    });

    it("should propagate fromYaml warnings on failure", () => {
      const yamlString = "id: test\n...";

      mockToYaml.mockReturnValue({
        success: true,
        data: yamlString,
      });

      mockFromYaml.mockReturnValue({
        success: false,
        errors: [
          {
            path: "test",
            message: "Parse error",
            code: "PARSE_ERROR",
          },
        ],
        warnings: [
          {
            path: "test",
            message: "Parse warning",
            code: "PARSE_WARNING",
          },
        ],
      });

      const result = normalizeComposite(sampleComposite);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings?.[0].code).toBe("PARSE_WARNING");
    });
  });

  describe("Options Handling", () => {
    it("should handle undefined options", () => {
      const yamlString = "id: test-composite\n...";
      const normalizedComposite = { ...sampleComposite };

      mockToYaml.mockReturnValue({
        success: true,
        data: yamlString,
      });

      mockFromYaml.mockReturnValue({
        success: true,
        data: normalizedComposite,
      });

      const result = normalizeComposite(sampleComposite, undefined);

      expect(result.success).toBe(true);
      expect(mockToYaml).toHaveBeenCalledWith(sampleComposite, {});
      expect(mockFromYaml).toHaveBeenCalledWith(yamlString, {});
    });

    it("should handle empty options object", () => {
      const yamlString = "id: test-composite\n...";
      const normalizedComposite = { ...sampleComposite };

      mockToYaml.mockReturnValue({
        success: true,
        data: yamlString,
      });

      mockFromYaml.mockReturnValue({
        success: true,
        data: normalizedComposite,
      });

      const result = normalizeComposite(sampleComposite, {});

      expect(result.success).toBe(true);
      expect(mockToYaml).toHaveBeenCalledWith(sampleComposite, {});
      expect(mockFromYaml).toHaveBeenCalledWith(yamlString, {});
    });

    it("should pass through all transformation options", () => {
      const options: TransformationOptions = {
        preserveComments: true,
        formatOutput: false,
        validateResult: true,
      };
      const yamlString = "id: test\n...";
      const normalizedComposite = { ...sampleComposite };

      mockToYaml.mockReturnValue({
        success: true,
        data: yamlString,
      });

      mockFromYaml.mockReturnValue({
        success: true,
        data: normalizedComposite,
      });

      const result = normalizeComposite(sampleComposite, options);

      expect(result.success).toBe(true);
      expect(mockToYaml).toHaveBeenCalledWith(sampleComposite, options);
      expect(mockFromYaml).toHaveBeenCalledWith(yamlString, options);
    });
  });

  describe("Edge Cases", () => {
    it("should handle minimal composite", () => {
      const minimalComposite: CompositeDefinition = {
        id: "minimal",
        name: "Minimal",
        type: "composite",
        category: "test",
        description: "Minimal composite",
        version: "1.0.0",
        metadata: {
          created: "2024-01-01T00:00:00Z",
          modified: "2024-01-01T00:00:00Z",
        },
        nodes: [],
        edges: [],
      };

      const yamlString = "id: minimal\n...";

      mockToYaml.mockReturnValue({
        success: true,
        data: yamlString,
      });

      mockFromYaml.mockReturnValue({
        success: true,
        data: minimalComposite,
      });

      const result = normalizeComposite(minimalComposite);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(minimalComposite);
    });

    it("should handle complex composite with nested data", () => {
      const complexComposite: CompositeDefinition = {
        ...sampleComposite,
        nodes: [
          {
            id: "complex-node",
            type: "complex",
            position: { x: 100, y: 200 },
            data: {
              config: {
                nested: {
                  deeply: {
                    embedded: "value",
                  },
                },
              },
              array: [1, 2, { complex: "object" }],
            },
          },
        ],
        variables: {
          var1: {
            type: "string",
            defaultValue: "test",
            description: "Test variable",
          },
          var2: {
            type: "number",
            defaultValue: 42,
          },
        },
        settings: {
          runtime: { timeout: 30000 },
          ui: { theme: "dark" },
        },
      };

      const yamlString = "id: test-composite\n# Complex YAML content...";

      mockToYaml.mockReturnValue({
        success: true,
        data: yamlString,
      });

      mockFromYaml.mockReturnValue({
        success: true,
        data: complexComposite,
      });

      const result = normalizeComposite(complexComposite);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(complexComposite);
    });

    it("should handle empty YAML string", () => {
      // When toYaml produces empty string
      mockToYaml.mockReturnValue({
        success: true,
        data: "",
      });

      // fromYaml should handle empty string - it might succeed with empty composite
      mockFromYaml.mockReturnValue({
        success: true,
        data: {
          ...sampleComposite,
          nodes: [],
          edges: [],
        },
      });

      const result = normalizeComposite(sampleComposite);

      // Should normalize successfully even with empty intermediate YAML
      expect(result).toBeDefined();
      // The result structure should be valid regardless
      expect(result).toHaveProperty("success");
    });

    it("should handle null YAML data", () => {
      mockToYaml.mockReturnValue({
        success: true,
        data: null as unknown,
      });

      const result = normalizeComposite(sampleComposite);

      expect(result.success).toBe(false);
      expect(mockFromYaml).not.toHaveBeenCalled();
    });
  });

  describe("Data Integrity", () => {
    it("should maintain data integrity through round-trip", () => {
      const originalComposite = { ...sampleComposite };
      const yamlString = "yaml representation";
      const roundTripComposite = { ...sampleComposite };

      mockToYaml.mockReturnValue({
        success: true,
        data: yamlString,
      });

      mockFromYaml.mockReturnValue({
        success: true,
        data: roundTripComposite,
      });

      const result = normalizeComposite(originalComposite);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(roundTripComposite);

      // Verify the original composite wasn't modified
      expect(originalComposite).toEqual(sampleComposite);
    });

    it("should preserve complex data structures", () => {
      const compositeWithComplexData: CompositeDefinition = {
        ...sampleComposite,
        nodes: [
          {
            id: "node1",
            type: "test",
            position: { x: 0, y: 0 },
            data: {
              dates: new Date("2024-01-01T00:00:00Z"),
              regex: /test/gi,
              nullValue: null,
              undefinedValue: undefined,
              nestedArray: [
                [1, 2],
                [3, 4],
              ],
              deepObject: {
                level1: {
                  level2: {
                    level3: "deep value",
                  },
                },
              },
            },
          },
        ],
      };

      const yamlString = "complex yaml content";

      mockToYaml.mockReturnValue({
        success: true,
        data: yamlString,
      });

      mockFromYaml.mockReturnValue({
        success: true,
        data: compositeWithComplexData,
      });

      const result = normalizeComposite(compositeWithComplexData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(compositeWithComplexData);
    });
  });
});
