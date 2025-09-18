/**
 * Test function overloads for createNode to ensure proper type inference
 */

import { describe, expect, it } from "vitest";
import type { CompositeDefinition } from "../composite/types";
import { createNode } from "../createNode";
import type { Node } from "../types";

describe("createNode function overloads", () => {
  it("should return CompositeDefinition when type is 'composite'", () => {
    const composite = createNode({
      type: "composite",
      name: "Test Composite",
    });

    // TypeScript should infer this as CompositeDefinition
    expect(composite.type).toBe("composite");
    expect(composite.nodes).toBeDefined();
    expect(composite.edges).toBeDefined();
    expect(composite.variables).toBeDefined();
    expect(composite.settings).toBeDefined();

    // This should not cause TypeScript errors because composite is typed as CompositeDefinition
    const _nodes: CompositeDefinition["nodes"] = composite.nodes;
    const _edges: CompositeDefinition["edges"] = composite.edges;

    expect(_nodes).toEqual([]);
    expect(_edges).toEqual([]);
  });

  it("should return CompositeDefinition when type is not specified (defaults to composite)", () => {
    const composite = createNode({
      name: "Default Composite",
    });

    // TypeScript should infer this as CompositeDefinition since it defaults to composite
    expect(composite.type).toBe("composite");
    expect(composite.nodes).toBeDefined();
    expect(composite.edges).toBeDefined();

    // This should not cause TypeScript errors
    const _nodes: CompositeDefinition["nodes"] = composite.nodes;
    expect(_nodes).toEqual([]);
  });

  it("should return Node when type is 'atomic'", () => {
    const atomic = createNode({
      type: "atomic",
      name: "Test Atomic",
    });

    // TypeScript should infer this as Node
    expect(atomic.type).toBe("atomic");
    expect(atomic.inputPorts).toBeDefined();
    expect(atomic.outputPorts).toBeDefined();

    // This should not cause TypeScript errors because atomic is typed as Node
    const _inputPorts: Node["inputPorts"] = atomic.inputPorts;
    const _outputPorts: Node["outputPorts"] = atomic.outputPorts;

    expect(_inputPorts).toEqual([]);
    expect(_outputPorts).toEqual([]);
  });

  it("should handle complex composite creation without type casting", () => {
    const complexComposite = createNode({
      type: "composite",
      name: "Complex Test",
      description: "A complex composite",
      category: "test",
      nodes: [
        {
          id: "node1",
          name: "Test Node",
          category: "test",
          type: "atomic",
          position: { x: 0, y: 0 },
          data: {
            customData: "test",
          },
        },
      ],
      edges: [
        {
          id: "edge1",
          source: "node1",
          target: "node2",
        },
      ],
      variables: {
        testVar: {
          type: "string",
          defaultValue: "test",
          description: "Test variable",
        },
      },
    });

    // Should be properly typed as CompositeDefinition without casting
    expect(complexComposite.nodes).toHaveLength(1);
    expect(complexComposite.edges).toHaveLength(1);
    expect(complexComposite.variables?.testVar).toBeDefined();

    // TypeScript should recognize this as CompositeDefinition
    const _nodes: CompositeDefinition["nodes"] = complexComposite.nodes;
    const _edges: CompositeDefinition["edges"] = complexComposite.edges;
    const _variables: CompositeDefinition["variables"] =
      complexComposite.variables;

    expect(_nodes[0].name).toBe("Test Node");
    expect(_edges[0].source).toBe("node1");
    expect(_variables?.testVar.type).toBe("string");
  });
});
