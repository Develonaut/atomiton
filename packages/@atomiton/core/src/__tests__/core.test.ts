/**
 * Core API Contract Tests
 *
 * Tests that the Core singleton properly exposes all internal packages
 * through a unified API. Actual functionality is tested in the respective packages.
 */

import { describe, expect, it } from "vitest";
import { core } from "../api";

describe("core API Contract", () => {
  it("should be a singleton", () => {
    const core1 = core;
    const core2 = core;
    expect(core1).toBe(core2);
  });

  it("should expose store API", () => {
    expect(core.store).toBeDefined();
    expect(typeof core.store).toBe("object");
  });

  it("should expose events API", () => {
    expect(core.events).toBeDefined();
    expect(typeof core.events).toBe("object");
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

  it("should have initialize method", () => {
    expect(core.initialize).toBeDefined();
    expect(typeof core.initialize).toBe("function");
  });

  describe("store API surface", () => {
    it("should expose store methods", () => {
      // Just verify the shape, actual functionality tested in @atomiton/store
      expect(core.store.initialize).toBeDefined();
      expect(core.store.getStores).toBeDefined();
      expect(core.store.subscribe).toBeDefined();
    });
  });

  describe("events API surface", () => {
    it("should expose event methods", () => {
      // Just verify the shape, actual functionality tested in @atomiton/events
      expect(core.events.emit).toBeDefined();
      expect(core.events.subscribe).toBeDefined();
    });
  });

  describe("nodes API surface", () => {
    it("should expose node system methods", () => {
      // Just verify the shape, actual functionality tested in @atomiton/nodes
      expect(core.nodes.NodePackageRegistry).toBeDefined();
      expect(core.nodes.BaseNodeLogic).toBeDefined();
    });
  });
});
