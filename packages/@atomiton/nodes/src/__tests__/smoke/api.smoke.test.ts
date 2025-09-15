/**
 * API Smoke Tests for @atomiton/nodes
 *
 * Minimal tests ensuring the public API is working
 */

import { describe, expect, it } from "vitest";
import * as NodesAPI from "../../index";

describe("@atomiton/nodes API Smoke Tests", () => {
  it("exports all node implementations", () => {
    expect(NodesAPI.nodes).toBeDefined();
    expect(NodesAPI.code).toBeDefined();
    expect(NodesAPI.transform).toBeDefined();
    expect(NodesAPI.parallel).toBeDefined();
  });

  it("exports composite functionality", () => {
    expect(NodesAPI.createCompositeNode).toBeDefined();
    expect(NodesAPI.fromYaml).toBeDefined();
    expect(NodesAPI.toYaml).toBeDefined();
    expect(NodesAPI.compositeTemplates).toBeDefined();
  });

  it("can create a composite node", () => {
    const composite = NodesAPI.createCompositeNode({
      name: "Test",
      description: "Test",
      category: "test",
      nodes: [],
      edges: [],
    });
    expect(composite.type).toBe("composite");
  });

  it("rejects invalid node types with helpful errors", () => {
    expect(() =>
      NodesAPI.createCompositeNode({
        name: "Test",
        description: "Test",
        category: "test",
        nodes: [
          {
            id: "n1",
            type: "csvReader", // Wrong case
          } as { id: string; type: string },
        ],
        edges: [],
      }),
    ).toThrow(/csv-reader/);
  });

  it("templates are valid", () => {
    expect(NodesAPI.compositeTemplates.length).toBeGreaterThan(0);
    NodesAPI.compositeTemplates.forEach((t) => {
      expect(t.definition.name).toBeDefined();
    });
  });
});
