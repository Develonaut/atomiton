/**
 * YAML Smoke Tests - Essential functionality only
 *
 * Tests the core YAML parsing works for basic node creation.
 */

import { describe, expect, it } from "vitest";
import { fromYaml, toYaml } from "../../transform";

describe("YAML Smoke Tests", () => {
  it("parses simple YAML to node definition", () => {
    const yaml = `
id: "test"
name: "Test Node"
type: "composite"
category: "test"
nodes:
  - id: "n1"
    type: "code"
    position: { x: 0, y: 0 }
edges: []`;

    const result = fromYaml(yaml);
    expect(result.success).toBe(true);
    expect(result.data?.name).toBe("Test Node");
  });

  it("toYaml function exists", () => {
    // Just verify the function exists and can be called
    expect(typeof toYaml).toBe("function");
  });

  it("handles invalid YAML gracefully", () => {
    const result = fromYaml("invalid: yaml: structure:");
    expect(result.success).toBe(false);
  });
});
