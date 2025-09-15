/**
 * Validation Smoke Tests for @atomiton/nodes
 *
 * Tests YAML parsing and validation error handling
 */

import { describe, expect, it } from "vitest";
import { fromYaml, validateComposite, createCompositeNode } from "../../index";

describe("Validation Smoke Tests", () => {
  it("parses valid YAML", () => {
    const yaml = `
id: "test-id"
name: "Test"
description: "Test description"
category: "test"
type: "composite"
metadata:
  created: "2025-01-01T00:00:00Z"
  modified: "2025-01-01T00:00:00Z"
nodes:
  - id: "n1"
    type: "code"
    position:
      x: 0
      y: 0
    data: {}
edges: []`;

    const result = fromYaml(yaml);
    expect(result.success).toBe(true);
  });

  it("rejects invalid YAML", () => {
    const result = fromYaml("not: valid: yaml: at: all:");
    expect(result.success).toBe(false);
  });

  it("catches wrong node type casing", () => {
    const yaml = `
name: "Test"
type: "composite"
nodes:
  - id: "n1"
    type: "csvReader"
    position: { x: 0, y: 0 }`;

    const result = fromYaml(yaml);
    if (result.success) {
      expect(() =>
        createCompositeNode({
          name: result.data!.name,
          description: "",
          category: "test",
          nodes: result.data!.nodes,
          edges: [],
        }),
      ).toThrow(/csv-reader/);
    }
  });

  it("validates duplicate node IDs", () => {
    const definition = {
      id: "test",
      name: "Test",
      type: "composite",
      nodes: [
        { id: "n1", type: "code", position: { x: 0, y: 0 } },
        { id: "n1", type: "transform", position: { x: 0, y: 0 } },
      ],
      edges: [],
    };

    const result = validateComposite(definition);
    expect(result.success).toBe(false);
    // Check for duplicate node error
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("validates edge references", () => {
    const definition = {
      id: "test",
      name: "Test",
      type: "composite",
      nodes: [{ id: "n1", type: "code", position: { x: 0, y: 0 } }],
      edges: [
        {
          id: "e1",
          source: { nodeId: "missing", portId: "out" },
          target: { nodeId: "n1", portId: "in" },
        },
      ],
    };

    const result = validateComposite(definition);
    expect(result.success).toBe(false);
  });
});
