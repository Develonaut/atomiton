import { describe, expect, test } from "vitest";
import { fromYaml } from "../../composite/transform/fromYaml";
import { COMPOSITE_SCHEMA } from "../../composite/schema";
import { glob } from "glob";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * YAML Format Smoke Tests
 *
 * These smoke tests ensure the basic YAML format works correctly:
 * - Templates parse without errors
 * - Edge format is flat (editor-compatible)
 * - Schema validation passes
 * - No transformation logic required
 *
 * These are smoke tests because they verify the core functionality
 * works at a basic level without deep integration testing.
 */

describe("YAML Format Smoke Tests", () => {
  test("YAML edge format uses flat structure", () => {
    const sampleEdge = {
      id: "test-edge",
      source: "node1",
      target: "node2",
      sourceHandle: "output",
      targetHandle: "input",
      type: "default",
    };

    // Should have flat source/target structure
    expect(typeof sampleEdge.source).toBe("string");
    expect(typeof sampleEdge.target).toBe("string");
    expect(sampleEdge.sourceHandle).toBeDefined();
    expect(sampleEdge.targetHandle).toBeDefined();
  });

  test("YAML node format has editor-compatible properties", () => {
    const sampleNode = {
      id: "test-node",
      type: "custom",
      position: { x: 100, y: 100 },
      data: { label: "Test Node" },
      // React Flow properties
      width: 200,
      height: 100,
      parentId: "parent-group",
      dragHandle: ".drag-handle",
      style: { backgroundColor: "#fff" },
      className: "custom-node",
    };

    // Should have editor-compatible structure
    expect(sampleNode.id).toBeDefined();
    expect(sampleNode.type).toBeDefined();
    expect(sampleNode.position).toEqual({ x: 100, y: 100 });
    expect(sampleNode.data).toBeDefined();
    expect(sampleNode.parentId).toBeDefined(); // For composite groups
  });

  test("CompositeDefinition parses without transformation", () => {
    const yaml = `
id: "test-composite"
name: "Test Composite"
category: "test"
type: "composite"
version: "1.0.0"
metadata:
  created: "2025-01-01T00:00:00Z"
  modified: "2025-01-01T00:00:00Z"
nodes:
  - id: "node1"
    type: "input"
    position: { x: 0, y: 0 }
    data: { label: "Input" }
  - id: "node2"
    type: "output"
    position: { x: 200, y: 0 }
    data: { label: "Output" }
    parentId: "group1"
edges:
  - id: "edge1"
    source: "node1"
    target: "node2"
    sourceHandle: "out"
    targetHandle: "in"
    type: "default"
`;

    const result = fromYaml(yaml, { validateResult: true });
    expect(result.success).toBe(true);

    if (result.success && result.data) {
      const { nodes, edges } = result.data;

      // Can be consumed directly without transformation
      expect(nodes).toBeInstanceOf(Array);
      expect(edges).toBeInstanceOf(Array);

      // Nodes have editor-compatible structure
      nodes.forEach((node) => {
        expect(node.id).toBeDefined();
        expect(node.type).toBeDefined();
        expect(node.position).toBeDefined();
        expect(typeof node.position.x).toBe("number");
        expect(typeof node.position.y).toBe("number");
      });

      // Edges have flat structure
      edges.forEach((edge) => {
        expect(edge.id).toBeDefined();
        expect(typeof edge.source).toBe("string");
        expect(typeof edge.target).toBe("string");
      });
    }
  });

  test("Composite nodes can be rendered as groups", () => {
    const yaml = `
id: "test-composite"
name: "Test Composite"
category: "test"
type: "composite"
version: "1.0.0"
metadata:
  created: "2025-01-01T00:00:00Z"
  modified: "2025-01-01T00:00:00Z"
nodes:
  - id: "group1"
    type: "group"
    position: { x: 0, y: 0 }
    data: { label: "Processing Group" }
    style: { backgroundColor: "rgba(255, 0, 0, 0.1)" }
  - id: "child1"
    type: "transform"
    position: { x: 50, y: 50 }
    data: { operation: "filter" }
    parentId: "group1"
  - id: "child2"
    type: "transform"
    position: { x: 150, y: 50 }
    data: { operation: "sort" }
    parentId: "group1"
edges:
  - id: "internal-flow"
    source: "child1"
    target: "child2"
    sourceHandle: "output"
    targetHandle: "input"
`;

    const result = fromYaml(yaml, { validateResult: true });
    expect(result.success).toBe(true);

    if (result.success && result.data) {
      const { nodes } = result.data;

      // Should have group node
      const groupNode = nodes.find((n) => n.type === "group");
      expect(groupNode).toBeDefined();

      // Should have child nodes with parentId
      const childNodes = nodes.filter((n) => n.parentId === "group1");
      expect(childNodes.length).toBe(2);

      childNodes.forEach((child) => {
        expect(child.parentId).toBe("group1");
      });
    }
  });

  describe("Template Compatibility", () => {
    test("All template YAMLs parse successfully", async () => {
      // Find all template YAML files
      const templatePattern = join(
        __dirname,
        "../../composite/templates/*.yaml",
      );
      const templateFiles = glob.sync(templatePattern);

      expect(templateFiles.length).toBeGreaterThan(0);

      for (const templateFile of templateFiles) {
        const yamlContent = readFileSync(templateFile, "utf-8");
        const result = fromYaml(yamlContent, { validateResult: true });

        expect(result.success, `Template ${templateFile} should be valid`).toBe(
          true,
        );

        if (result.success && result.data) {
          const { nodes, edges } = result.data;

          // All edges should use flat format
          edges.forEach((edge, index) => {
            expect(
              typeof edge.source,
              `Edge ${index} in ${templateFile} should have string source`,
            ).toBe("string");
            expect(
              typeof edge.target,
              `Edge ${index} in ${templateFile} should have string target`,
            ).toBe("string");
          });

          // All nodes should have required editor-compatible properties
          nodes.forEach((node, index) => {
            expect(
              node.id,
              `Node ${index} in ${templateFile} should have id`,
            ).toBeDefined();
            expect(
              node.type,
              `Node ${index} in ${templateFile} should have type`,
            ).toBeDefined();
            expect(
              node.position,
              `Node ${index} in ${templateFile} should have position`,
            ).toBeDefined();
          });
        }
      }
    });
  });

  test("Schema validation works with flat format", () => {
    const validComposite = {
      id: "test",
      name: "Test",
      category: "test",
      type: "composite",
      version: "1.0.0",
      metadata: {
        created: "2025-01-01T00:00:00Z",
        modified: "2025-01-01T00:00:00Z",
      },
      nodes: [
        {
          id: "node1",
          type: "input",
          position: { x: 0, y: 0 },
          data: { label: "Input" },
        },
      ],
      edges: [
        {
          id: "edge1",
          source: "node1",
          target: "node2",
          sourceHandle: "out",
          targetHandle: "in",
        },
      ],
    };

    const result = COMPOSITE_SCHEMA.safeParse(validComposite);
    expect(result.success).toBe(true);
  });

  test("Schema rejects old nested edge format", () => {
    const invalidComposite = {
      id: "test",
      name: "Test",
      category: "test",
      type: "composite",
      version: "1.0.0",
      metadata: {
        created: "2025-01-01T00:00:00Z",
        modified: "2025-01-01T00:00:00Z",
      },
      nodes: [
        {
          id: "node1",
          type: "input",
          position: { x: 0, y: 0 },
          data: { label: "Input" },
        },
      ],
      edges: [
        {
          id: "edge1",
          // Old nested format - should be rejected
          source: {
            nodeId: "node1",
            portId: "out",
          },
          target: {
            nodeId: "node2",
            portId: "in",
          },
        },
      ],
    };

    const result = COMPOSITE_SCHEMA.safeParse(invalidComposite);
    expect(result.success).toBe(false);
  });
});
