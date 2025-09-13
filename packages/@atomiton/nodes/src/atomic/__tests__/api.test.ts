/**
 * Tests for Atomic API
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { atomicAPI } from "../api";

describe("AtomicAPI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic API Methods", () => {
    it("should provide all required methods", () => {
      expect(typeof atomicAPI.loadNode).toBe("function");
      expect(typeof atomicAPI.loadAllNodes).toBe("function");
      expect(typeof atomicAPI.getAvailableNodeTypes).toBe("function");
      expect(typeof atomicAPI.isNodeTypeAvailable).toBe("function");
      expect(typeof atomicAPI.getNodeMetadata).toBe("function");
      expect(typeof atomicAPI.getAllNodeMetadata).toBe("function");
      expect(typeof atomicAPI.getAvailableNodeMetadata).toBe("function");
      expect(typeof atomicAPI.getMetadataByCategory).toBe("function");
      expect(typeof atomicAPI.getNodeConfig).toBe("function");
      expect(typeof atomicAPI.getNodeLogic).toBe("function");
      expect(typeof atomicAPI.registerNode).toBe("function");
      expect(typeof atomicAPI.unregisterNode).toBe("function");
      expect(typeof atomicAPI.clearCache).toBe("function");
      expect(typeof atomicAPI.getCacheStats).toBe("function");
    });

    it("should return available node types", () => {
      const types = atomicAPI.getAvailableNodeTypes();
      expect(Array.isArray(types)).toBe(true);
      expect(types.length).toBeGreaterThan(0);
    });

    it("should provide cache stats", () => {
      const stats = atomicAPI.getCacheStats();
      expect(typeof stats).toBe("object");
      expect(typeof stats.metadata).toBe("number");
      expect(typeof stats.config).toBe("number");
      expect(typeof stats.logic).toBe("number");
      expect(typeof stats.nodes).toBe("number");
    });
  });
});
