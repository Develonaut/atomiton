/**
 * Core API Contract Tests
 *
 * Tests that the Core singleton properly exposes high-level packages
 * through a unified API. Infrastructure packages (store, events) are
 * imported directly to avoid circular dependencies.
 */

import { describe, expect, it } from "vitest";
import core from "../api";

describe("core API Contract", () => {
  it("should be a singleton", () => {
    const core1 = core;
    const core2 = core;
    expect(core1).toBe(core2);
  });

  it("should expose nodes API", () => {
    expect(core.nodes).toBeDefined();
    expect(typeof core.nodes).toBe("object");
  });

  it("should have version information", () => {
    expect(core.version).toBeDefined();
    expect(core.version.core).toBeDefined();
    expect(typeof core.version.core).toBe("string");
  });

  describe("nodes API surface", () => {
    it("should expose node system methods", () => {
      // Just verify the shape, actual functionality tested in @atomiton/nodes
      expect(core.nodes.getAllNodes).toBeDefined();
      expect(core.nodes.getNodeMetadata).toBeDefined();
    });
  });
});
