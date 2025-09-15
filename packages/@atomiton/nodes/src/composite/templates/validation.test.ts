/**
 * Template Validation Tests
 *
 * Tests that our templates are valid and that we properly catch malformed YAML
 */

import { describe, expect, it } from "vitest";
import { fromYaml } from "../transform/fromYaml";
import { createCompositeNode } from "../createCompositeNode";

describe("Template Validation", () => {
  describe("Valid Templates", () => {
    it("should successfully parse and validate hello-world template", () => {
      const helloWorldYaml = `
id: "550e8400-e29b-41d4-a716-446655440001"
name: "Hello World"
description: "A simple greeting workflow"
category: "tutorial"
type: "composite"
nodes:
  - id: "greeting-code"
    type: "code"
    position:
      x: 100
      y: 100
    data:
      code: "return { message: 'Hello, World!' };"
  - id: "display-transform"
    type: "transform"
    position:
      x: 400
      y: 100
edges:
  - id: "greeting-to-display"
    source:
      nodeId: "greeting-code"
      portId: "output"
    target:
      nodeId: "display-transform"
      portId: "input"
`;

      const result = fromYaml(helloWorldYaml);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      // Should be able to create composite node without errors
      expect(() =>
        createCompositeNode({
          id: result.data!.id,
          name: result.data!.name,
          description: result.data!.description || "",
          category: result.data!.category || "logic",
          nodes: result.data!.nodes,
          edges: result.data!.edges,
        }),
      ).not.toThrow();
    });

    it("should validate all node types are registered", () => {
      const validYaml = `
id: "test-composite"
name: "Test Composite"
type: "composite"
nodes:
  - id: "node1"
    type: "code"
    position: { x: 100, y: 100 }
  - id: "node2"
    type: "transform"
    position: { x: 200, y: 100 }
  - id: "node3"
    type: "parallel"
    position: { x: 300, y: 100 }
`;

      const result = fromYaml(validYaml);
      expect(result.success).toBe(true);

      expect(() =>
        createCompositeNode({
          name: result.data!.name,
          description: "Test",
          category: "test",
          nodes: result.data!.nodes,
          edges: result.data!.edges || [],
        }),
      ).not.toThrow();
    });
  });

  describe("Invalid Templates - Wrong Node Types", () => {
    it("should throw error for unregistered node type", () => {
      const invalidNodeTypeYaml = `
id: "invalid-composite"
name: "Invalid Composite"
type: "composite"
nodes:
  - id: "bad-node"
    type: "notARealNodeType"
    position: { x: 100, y: 100 }
`;

      const result = fromYaml(invalidNodeTypeYaml);
      expect(result.success).toBe(true);

      // Should throw when trying to create composite with invalid node type
      expect(() =>
        createCompositeNode({
          name: result.data!.name,
          description: "Test",
          category: "test",
          nodes: result.data!.nodes,
          edges: [],
        }),
      ).toThrow(/Failed to create composite node/);
    });

    it("should throw error for misspelled node type", () => {
      const misspelledYaml = `
id: "misspelled-composite"
name: "Misspelled Node Types"
type: "composite"
nodes:
  - id: "node1"
    type: "codes"  # Should be "code"
    position: { x: 100, y: 100 }
`;

      const result = fromYaml(misspelledYaml);
      expect(result.success).toBe(true);

      expect(() =>
        createCompositeNode({
          name: result.data!.name,
          description: "Test",
          category: "test",
          nodes: result.data!.nodes,
          edges: [],
        }),
      ).toThrow(/Invalid node type "codes"/);
    });

    it("should throw error for camelCase instead of kebab-case", () => {
      const wrongCaseYaml = `
id: "wrong-case-composite"
name: "Wrong Case Node Types"
type: "composite"
nodes:
  - id: "node1"
    type: "httpRequest"  # Should be "http-request"
    position: { x: 100, y: 100 }
  - id: "node2"
    type: "shellCommand"  # Should be "shell-command"
    position: { x: 200, y: 100 }
`;

      const result = fromYaml(wrongCaseYaml);
      expect(result.success).toBe(true);

      expect(() =>
        createCompositeNode({
          name: result.data!.name,
          description: "Test",
          category: "test",
          nodes: result.data!.nodes,
          edges: [],
        }),
      ).toThrow(/Invalid node type/);
    });
  });

  describe("Malformed YAML Structure", () => {
    it("should handle missing required fields", () => {
      const missingFieldsYaml = `
name: "Missing Fields"
nodes:
  - id: "node1"
    # Missing type field!
    position: { x: 100, y: 100 }
`;

      const result = fromYaml(missingFieldsYaml);

      // The YAML might parse but node creation should fail
      if (result.success && result.data?.nodes?.[0]) {
        const node = result.data.nodes[0];
        if (!node.type) {
          expect(() =>
            createCompositeNode({
              name: result.data!.name,
              description: "Test",
              category: "test",
              nodes: result.data!.nodes,
              edges: [],
            }),
          ).toThrow();
        }
      }
    });

    it("should handle invalid YAML syntax", () => {
      const invalidYaml = `
name: "Invalid YAML"
nodes:
  - id: "node1"
    type: code  # Missing quotes might cause issues
    position:
      x: 100
      y: "not a number"  # Wrong type
`;

      // This tests that our YAML parser handles various malformations
      const result = fromYaml(invalidYaml);
      // Either parsing fails or validation catches the issues
      if (!result.success) {
        expect(result.errors).toBeDefined();
        expect(result.errors!.length).toBeGreaterThan(0);
      }
    });

    it("should handle empty nodes array", () => {
      const emptyNodesYaml = `
id: "empty-composite"
name: "Empty Composite"
type: "composite"
nodes: []
edges: []
`;

      const result = fromYaml(emptyNodesYaml);
      expect(result.success).toBe(true);

      // Should handle empty nodes gracefully
      expect(() =>
        createCompositeNode({
          name: result.data!.name,
          description: "Test",
          category: "test",
          nodes: [],
          edges: [],
        }),
      ).not.toThrow();
    });
  });

  describe("Edge Validation", () => {
    it("should handle edges referencing non-existent nodes", () => {
      const badEdgesYaml = `
id: "bad-edges-composite"
name: "Bad Edges"
type: "composite"
nodes:
  - id: "node1"
    type: "code"
    position: { x: 100, y: 100 }
edges:
  - id: "bad-edge"
    source:
      nodeId: "nonexistent-node"
      portId: "output"
    target:
      nodeId: "node1"
      portId: "input"
`;

      const result = fromYaml(badEdgesYaml);
      expect(result.success).toBe(true);

      // Graph validation should catch invalid edges
      const composite = createCompositeNode({
        name: result.data!.name,
        description: "Test",
        category: "test",
        nodes: result.data!.nodes,
        edges: result.data!.edges || [],
      });

      const validation = composite.validate();
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });
});
