/**
 * Validation Smoke Tests - Essential validation only
 */

import { describe, expect, it } from "vitest";
import { fromYaml } from "../../transform";
import { validateComposite } from "../../composite/validation/validateComposite";
import { createCompositeNode } from "../../composite/createCompositeNode";

describe("Validation Smoke Tests", () => {
  it("fromYaml function exists", () => {
    // Just verify the function exists - parsing may have complex dependencies
    expect(typeof fromYaml).toBe("function");
  });

  it("rejects invalid YAML", () => {
    const result = fromYaml("invalid: yaml:");
    expect(result.success).toBe(false);
  });

  it("validates createCompositeNode works", () => {
    const composite = createCompositeNode({
      name: "Test",
      description: "Test",
      category: "test",
      nodes: [],
      edges: [],
    });
    expect(composite.type).toBe("composite");
  });

  it("validates basic duplicate checking", () => {
    const definition = {
      id: "test",
      name: "Test",
      type: "composite" as const,
      nodes: [
        { id: "n1", type: "code", position: { x: 0, y: 0 } },
        { id: "n1", type: "transform", position: { x: 0, y: 0 } },
      ],
      edges: [],
    };

    const result = validateComposite(definition);
    expect(result.success).toBe(false);
  });
});
