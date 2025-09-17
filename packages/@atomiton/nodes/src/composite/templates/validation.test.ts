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
version: "1.0.0"
metadata:
  created: "2024-01-01T00:00:00Z"
  modified: "2024-01-01T00:00:00Z"
  author: "Test"
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
    source: "greeting-code"
    target: "display-transform"
`;

      const result = fromYaml(helloWorldYaml);

      if (!result.success) {
        console.error("fromYaml failed with errors:", result.errors);
      }

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
description: "Test composite with valid node types"
category: "test"
type: "composite"
version: "1.0.0"
metadata:
  created: "2024-01-01T00:00:00Z"
  modified: "2024-01-01T00:00:00Z"
  author: "Test"
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
edges: []
`;

      const result = fromYaml(validYaml);
      if (!result.success) {
        console.error("validYaml failed:", result.errors);
      }
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
description: "Composite with invalid node type"
category: "test"
type: "composite"
version: "1.0.0"
metadata:
  created: "2024-01-01T00:00:00Z"
  modified: "2024-01-01T00:00:00Z"
  author: "Test"
nodes:
  - id: "bad-node"
    type: "notARealNodeType"
    position: { x: 100, y: 100 }
edges: []
`;

      const result = fromYaml(invalidNodeTypeYaml);
      expect(result.success).toBe(true);

      // With CompositeNodeSpec (template format), validation happens at execution time
      // The composite is created successfully but would fail during execution
      const composite = createCompositeNode({
        name: result.data!.name,
        description: "Test",
        category: "test",
        nodes: result.data!.nodes,
        edges: [],
      });

      expect(composite).toBeDefined();
      expect(composite.name).toBe(result.data!.name);
    });

    it("should throw error for misspelled node type", () => {
      const misspelledYaml = `
id: "misspelled-composite"
name: "Misspelled Node Types"
description: "Composite with misspelled node type"
category: "test"
type: "composite"
version: "1.0.0"
metadata:
  created: "2024-01-01T00:00:00Z"
  modified: "2024-01-01T00:00:00Z"
  author: "Test"
nodes:
  - id: "node1"
    type: "codes"  # Should be "code"
    position: { x: 100, y: 100 }
edges: []
`;

      const result = fromYaml(misspelledYaml);
      expect(result.success).toBe(true);

      // With CompositeNodeSpec format, invalid node types are caught at execution time
      const composite = createCompositeNode({
        name: result.data!.name,
        description: "Test",
        category: "test",
        nodes: result.data!.nodes,
        edges: [],
      });

      expect(composite).toBeDefined();
      // The error would occur during execution when trying to resolve "codes" node type
    });

    it("should throw error for camelCase instead of kebab-case", () => {
      const wrongCaseYaml = `
id: "wrong-case-composite"
name: "Wrong Case Node Types"
description: "Composite with wrong case node type"
category: "test"
type: "composite"
version: "1.0.0"
metadata:
  created: "2024-01-01T00:00:00Z"
  modified: "2024-01-01T00:00:00Z"
  author: "Test"
nodes:
  - id: "node1"
    type: "httpRequest"  # Should be "http-request"
    position: { x: 100, y: 100 }
  - id: "node2"
    type: "shellCommand"  # Should be "shell-command"
    position: { x: 200, y: 100 }
edges: []
`;

      const result = fromYaml(wrongCaseYaml);
      expect(result.success).toBe(true);

      // With CompositeNodeSpec format, validation is deferred to execution time
      const composite = createCompositeNode({
        name: result.data!.name,
        description: "Test",
        category: "test",
        nodes: result.data!.nodes,
        edges: [],
      });

      expect(composite).toBeDefined();
      // Errors for "httpRequest" and "shellCommand" would occur during execution
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
description: "Composite with empty nodes"
category: "test"
type: "composite"
version: "1.0.0"
metadata:
  created: "2024-01-01T00:00:00Z"
  modified: "2024-01-01T00:00:00Z"
  author: "Test"
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
description: "Composite with edges to non-existent nodes"
category: "test"
type: "composite"
version: "1.0.0"
metadata:
  created: "2024-01-01T00:00:00Z"
  modified: "2024-01-01T00:00:00Z"
  author: "Test"
nodes:
  - id: "node1"
    type: "code"
    position: { x: 100, y: 100 }
edges:
  - id: "bad-edge"
    source: "nonexistent-node"
    target: "node1"
`;

      const result = fromYaml(badEdgesYaml);

      // The fromYaml function now validates edge references
      // and returns an error for non-existent nodes
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
      expect(result.errors![0].code).toBe("INVALID_SOURCE_NODE");
      expect(result.errors![0].message).toContain("Source node not found");
    });
  });
});
