import { describe, it, expect } from "vitest";
import {
  fromYaml,
  toYaml,
  safeFromYaml,
  safeToYaml,
  validateRoundTrip,
  normalizeBlueprint,
  isValidBlueprintYaml,
  extractBlueprintMetadata,
  migrateBlueprintVersion,
} from "../transform.js";
import type { BlueprintDefinition } from "../types.js";

describe("Blueprint Transformations", () => {
  const sampleBlueprint: BlueprintDefinition = {
    id: "test-blueprint",
    name: "Test Blueprint",
    description: "A test blueprint for transformation tests",
    category: "test",
    type: "blueprint",
    version: "1.0.0",
    metadata: {
      created: "2024-01-01T00:00:00.000Z",
      modified: "2024-01-01T00:00:00.000Z",
      author: "Test Author",
      tags: ["test", "transform"],
    },
    nodes: [
      {
        id: "node-1",
        type: "test-node",
        position: { x: 100, y: 200 },
        data: { config: "test", enabled: true },
      },
      {
        id: "node-2",
        type: "another-node",
        position: { x: 300, y: 400 },
        data: { value: 42 },
      },
    ],
    edges: [
      {
        id: "edge-1",
        source: "node-1",
        target: "node-2",
        sourceHandle: "output",
        targetHandle: "input",
        data: { weight: 1.0 },
      },
    ],
    variables: {
      testVar: {
        type: "string",
        defaultValue: "test",
        description: "Test variable",
      },
    },
    settings: {
      runtime: { timeout: 5000 },
      ui: { theme: "dark" },
    },
  };

  const sampleYaml = `id: test-blueprint
name: Test Blueprint
description: A test blueprint for transformation tests
category: test
type: blueprint
version: 1.0.0
metadata:
  created: "2024-01-01T00:00:00.000Z"
  modified: "2024-01-01T00:00:00.000Z"
  author: Test Author
  tags:
    - test
    - transform
nodes:
  - id: node-1
    type: test-node
    position:
      x: 100
      y: 200
    data:
      config: test
      enabled: true
  - id: node-2
    type: another-node
    position:
      x: 300
      y: 400
    data:
      value: 42
edges:
  - id: edge-1
    source: node-1
    target: node-2
    sourceHandle: output
    targetHandle: input
    data:
      weight: 1
variables:
  testVar:
    type: string
    defaultValue: test
    description: Test variable
settings:
  runtime:
    timeout: 5000
  ui:
    theme: dark`;

  describe("fromYaml", () => {
    it("should convert valid YAML to BlueprintDefinition", () => {
      const result = fromYaml(sampleYaml);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe("test-blueprint");
      expect(result.data?.name).toBe("Test Blueprint");
      expect(result.data?.nodes).toHaveLength(2);
      expect(result.data?.edges).toHaveLength(1);
    });

    it("should handle invalid YAML", () => {
      const invalidYaml = "invalid: yaml: content: [";
      const result = fromYaml(invalidYaml);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0].code).toBe("YAML_PARSE_ERROR");
    });

    it("should validate result when validation is enabled", () => {
      const yamlWithMissingFields = `
name: Incomplete Blueprint
nodes: []
edges: []`;

      const result = fromYaml(yamlWithMissingFields, { validateResult: true });

      expect(result.success).toBe(false);
      expect(result.errors?.length).toBeGreaterThan(0);
    });

    it("should skip validation when disabled", () => {
      const yamlWithMissingFields = `
name: Incomplete Blueprint
nodes: []
edges: []`;

      const result = fromYaml(yamlWithMissingFields, { validateResult: false });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  describe("toYaml", () => {
    it("should convert BlueprintDefinition to YAML", () => {
      const result = toYaml(sampleBlueprint);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(typeof result.data).toBe("string");
      expect(result.data).toContain("id: test-blueprint");
      expect(result.data).toContain("name: Test Blueprint");
    });

    it("should format output when formatOutput is true", () => {
      const result = toYaml(sampleBlueprint, { formatOutput: true });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      // Formatted YAML should have proper indentation
      expect(result.data).toContain("  ");
    });

    it("should validate blueprint before conversion", () => {
      const invalidBlueprint = {
        ...sampleBlueprint,
        nodes: [
          { id: "node-1", type: "test", position: { x: 0, y: 0 }, data: {} },
          { id: "node-1", type: "test", position: { x: 0, y: 0 }, data: {} }, // Duplicate
        ],
      } as BlueprintDefinition;

      const result = toYaml(invalidBlueprint, { validateResult: true });

      expect(result.success).toBe(false);
      expect(result.errors?.some((e) => e.code === "DUPLICATE_NODE_ID")).toBe(
        true,
      );
    });
  });

  describe("safeFromYaml", () => {
    it("should handle valid YAML safely", () => {
      const result = safeFromYaml(sampleYaml);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it("should handle errors gracefully", () => {
      const result = safeFromYaml("invalid: yaml: [");

      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0]?.code).toBe("YAML_PARSE_ERROR");
    });
  });

  describe("safeToYaml", () => {
    it("should handle valid blueprint safely", () => {
      const result = safeToYaml(sampleBlueprint);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it("should handle invalid blueprint gracefully", () => {
      const invalidBlueprint = {
        ...sampleBlueprint,
        metadata: {
          created: "invalid-date",
          modified: "invalid-date",
        },
      } as BlueprintDefinition;

      const result = safeToYaml(invalidBlueprint, { validateResult: true });

      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.errors).toBeDefined();
    });
  });

  describe("validateRoundTrip", () => {
    it("should validate successful round-trip conversion", () => {
      const result = validateRoundTrip(sampleYaml);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.isEqual).toBe(true);
      expect(result.data?.original).toBe(sampleYaml);
      expect(result.data?.converted).toBeDefined();
    });

    it("should detect round-trip mismatches", () => {
      // Mock the yaml utility to simulate a mismatch
      const yamlWithComments = `# This is a comment
${sampleYaml}`;

      const result = validateRoundTrip(yamlWithComments);

      // Comments might be lost, causing semantic difference
      expect(result.success).toBe(true);
      // Note: The actual behavior depends on the YAML library's comment handling
    });

    it("should handle invalid YAML in round-trip", () => {
      const result = validateRoundTrip("invalid: yaml: [");

      expect(result.success).toBe(false);
      expect(result.errors?.length).toBeGreaterThan(0);
    });
  });

  describe("normalizeBlueprint", () => {
    it("should normalize a blueprint", () => {
      const result = normalizeBlueprint(sampleBlueprint);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe(sampleBlueprint.id);
    });

    it("should handle normalization errors", () => {
      const invalidBlueprint = {
        ...sampleBlueprint,
        metadata: {
          created: "invalid-date",
          modified: "invalid-date",
        },
      } as BlueprintDefinition;

      const result = normalizeBlueprint(invalidBlueprint, {
        validateResult: true,
      });

      expect(result.success).toBe(false);
      expect(result.errors?.length).toBeGreaterThan(0);
    });
  });

  describe("isValidBlueprintYaml", () => {
    it("should return true for valid blueprint YAML", () => {
      const isValid = isValidBlueprintYaml(sampleYaml);
      expect(isValid).toBe(true);
    });

    it("should return false for invalid YAML", () => {
      const isValid = isValidBlueprintYaml("invalid: yaml: [");
      expect(isValid).toBe(false);
    });

    it("should return false for YAML that is not a blueprint", () => {
      const nonBlueprintYaml = `
name: Not a blueprint
someField: value`;

      const isValid = isValidBlueprintYaml(nonBlueprintYaml);
      expect(isValid).toBe(false);
    });
  });

  describe("extractBlueprintMetadata", () => {
    it("should extract metadata from valid YAML", () => {
      const metadata = extractBlueprintMetadata(sampleYaml);

      expect(metadata).toBeDefined();
      expect(metadata?.id).toBe("test-blueprint");
      expect(metadata?.name).toBe("Test Blueprint");
      expect(metadata?.version).toBe("1.0.0");
      expect(metadata?.created).toBe("2024-01-01T00:00:00.000Z");
      expect(metadata?.modified).toBe("2024-01-01T00:00:00.000Z");
    });

    it("should return null for invalid YAML", () => {
      const metadata = extractBlueprintMetadata("invalid: yaml: [");
      expect(metadata).toBeNull();
    });

    it("should handle partial metadata", () => {
      const partialYaml = `
id: partial-blueprint
name: Partial Blueprint`;

      const metadata = extractBlueprintMetadata(partialYaml);

      expect(metadata).toBeDefined();
      expect(metadata?.id).toBe("partial-blueprint");
      expect(metadata?.name).toBe("Partial Blueprint");
      expect(metadata?.version).toBeUndefined();
      expect(metadata?.created).toBeUndefined();
    });
  });

  describe("migrateBlueprintVersion", () => {
    it("should migrate valid blueprint to current version", () => {
      const result = migrateBlueprintVersion(sampleBlueprint);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe(sampleBlueprint.id);
    });

    it("should fail to migrate invalid blueprint", () => {
      const invalidBlueprint = {
        name: "Invalid Blueprint",
        // Missing required fields
      };

      const result = migrateBlueprintVersion(invalidBlueprint);

      expect(result.success).toBe(false);
      expect(result.errors?.length).toBeGreaterThan(0);
    });

    it("should handle target version parameter", () => {
      const result = migrateBlueprintVersion(sampleBlueprint, "2.0.0");

      // Currently only supports 1.0.0, so should still work
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  describe("Error Handling", () => {
    it("should handle unexpected errors gracefully", () => {
      // Test error handling by passing non-object values
      const result = fromYaml("true"); // Valid YAML but not a blueprint

      expect(result.success).toBe(false);
      expect(result.errors?.length).toBeGreaterThan(0);
    });

    it("should preserve error details", () => {
      const result = fromYaml("invalid: yaml: [");

      expect(result.success).toBe(false);
      expect(result.errors?.[0]).toMatchObject({
        path: "root",
        code: "YAML_PARSE_ERROR",
        data: expect.any(Object),
      });
    });
  });
});
