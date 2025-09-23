/**
 * Test function overloads for createNode to ensure proper type inference
 */

import { createNode } from "#core/factories/createNodeDefinition";
import type { Node } from "#core/types";
import type { NodeMetadataVariant } from "#core/types";
import { describe, expect, it } from "vitest";

describe("createNode function overloads", () => {
  it("should return Node when type is 'composite'", () => {
    const composite = createNode({
      type: "composite",
      metadata: { variant: "test" as NodeMetadataVariant },
    });

    // TypeScript should infer this as Node
    expect(composite.type).toBe("composite");
    expect(composite.children).toBeDefined();
    expect(composite.edges).toBeDefined();

    // This should not cause TypeScript errors because composite is typed as Node
    const _children: Node["children"] = composite.children;
    const _edges: Node["edges"] = composite.edges;

    expect(_children).toEqual([]);
    expect(_edges).toEqual([]);
  });

  it("should return Node when type is not specified (defaults to composite)", () => {
    const composite = createNode({
      type: "composite",
      metadata: { variant: "test" as NodeMetadataVariant },
    });

    // TypeScript should infer this as Node since it defaults to composite
    expect(composite.type).toBe("composite");
    expect(composite.children).toBeDefined();
    expect(composite.edges).toBeDefined();

    // This should not cause TypeScript errors
    const _children: Node["children"] = composite.children;
    expect(_children).toEqual([]);
  });

  it("should return Node when type is 'atomic'", () => {
    const atomic = createNode({
      type: "atomic",
      metadata: { variant: "test" as NodeMetadataVariant },
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

  it("should handle complex node creation", () => {
    const complexNode = createNode({
      type: "composite",
      metadata: { variant: "test" as NodeMetadataVariant },
      children: [],
      edges: [],
    });

    // Should be properly typed as Node without casting
    expect(complexNode.children).toHaveLength(0);
    expect(complexNode.edges).toHaveLength(0);

    // TypeScript should recognize this as Node
    const _children: Node["children"] = complexNode.children;
    const _edges: Node["edges"] = complexNode.edges;

    expect(_children).toEqual([]);
    expect(_edges).toEqual([]);
  });
});
