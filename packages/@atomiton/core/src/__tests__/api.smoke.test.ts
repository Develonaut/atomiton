import { describe, it, expect, beforeAll } from "vitest";
import core from "../api";

describe("Core API Smoke Tests", () => {
  it("should initialize without errors", async () => {
    await expect(core.initialize()).resolves.not.toThrow();
  });

  it("should expose core methods", () => {
    expect(core.nodes).toBeDefined();
    expect(core.version).toBeDefined();
    expect(core.initialize).toBeDefined();
  });

  it("should return version information", () => {
    const version = core.version;
    expect(version).toBeDefined();
    expect(version.core).toBeDefined();
    expect(version.nodes).toBeDefined();
    expect(typeof version.core).toBe("string");
    expect(typeof version.nodes).toBe("string");
  });

  it("should provide access to nodes subsystem", () => {
    expect(core.nodes).toBeDefined();
    expect(typeof core.nodes).toBe("object");
    expect(core.nodes.getAllNodes).toBeDefined();
    expect(core.nodes.getNodeMetadata).toBeDefined();
    expect(core.nodes.initialize).toBeDefined();
  });

  it("should handle basic node operations", async () => {
    await core.initialize();

    const allNodes = core.nodes.getAllNodes();
    expect(Array.isArray(allNodes)).toBe(true);

    if (allNodes.length > 0) {
      const firstNode = allNodes[0];
      const metadata = core.nodes.getNodeMetadata(firstNode?.type as any);
      expect(metadata).toBeDefined();
    }
  });

  it("should maintain singleton pattern", () => {
    const core1 = core;
    const core2 = core;
    expect(core1).toBe(core2);
  });
});
