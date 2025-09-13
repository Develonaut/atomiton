/**
 * Tests for Atomic Node Registry
 */

import { describe, it, expect, beforeEach } from "vitest";
import { atomicRegistry } from "../registry";
import type { INodeMetadata } from "../../base/INodeMetadata";

describe("AtomicRegistry", () => {
  beforeEach(() => {
    atomicRegistry.clearCache("all");
  });

  describe("Node Registration", () => {
    it("should register a node successfully", () => {
      const mockNodeEntry = {
        metadata: () =>
          Promise.resolve({
            default: {
              id: "test-node",
              name: "Test Node",
              type: "test-node",
              version: "1.0.0",
              author: "Test",
              description: "Test node",
              category: "test",
              icon: "test",
              keywords: [],
              tags: [],
              validate: () => ({ valid: true, errors: [] }),
              getSearchTerms: () => ["test-node", "test"],
              matchesSearch: (query: string) => query.includes("test"),
            } as INodeMetadata,
          }),
        config: () => Promise.resolve({ default: {} }),
        logic: () => Promise.resolve({ default: {} }),
        implementation: () => Promise.resolve({ default: {} }),
      };

      atomicRegistry.register("test-node", mockNodeEntry);
      expect(atomicRegistry.has("test-node")).toBe(true);
    });

    it("should unregister a node successfully", () => {
      const mockNodeEntry = {
        metadata: () => Promise.resolve({ default: {} }),
        config: () => Promise.resolve({ default: {} }),
        logic: () => Promise.resolve({ default: {} }),
        implementation: () => Promise.resolve({ default: {} }),
      };

      atomicRegistry.register("test-node", mockNodeEntry);
      expect(atomicRegistry.has("test-node")).toBe(true);

      const result = atomicRegistry.unregister("test-node");
      expect(result).toBe(true);
      expect(atomicRegistry.has("test-node")).toBe(false);
    });

    it("should return false when unregistering non-existent node", () => {
      const result = atomicRegistry.unregister("non-existent");
      expect(result).toBe(false);
    });
  });

  describe("Metadata Loading", () => {
    it("should load metadata for registered node", async () => {
      const mockMetadata: INodeMetadata = {
        id: "test-node",
        name: "Test Node",
        type: "test-node",
        version: "1.0.0",
        author: "Test",
        description: "Test node",
        category: "test",
        icon: "test",
        keywords: ["test"],
        tags: ["test"],
        runtime: { language: "typescript" },
        experimental: false,
        deprecated: false,
        validate: () => ({ valid: true, errors: [] }),
        getSearchTerms: () => ["test"],
        matchesSearch: () => true,
      };

      const mockNodeEntry = {
        metadata: () => Promise.resolve({ default: mockMetadata }),
        config: () => Promise.resolve({ default: {} }),
        logic: () => Promise.resolve({ default: {} }),
        implementation: () => Promise.resolve({ default: {} }),
      };

      atomicRegistry.register("test-node", mockNodeEntry);

      const metadata = await atomicRegistry.loadMetadata("test-node");
      expect(metadata).toEqual(mockMetadata);
    });

    it("should cache metadata after first load", async () => {
      let loadCount = 0;
      const mockMetadata: INodeMetadata = {
        id: "test-node",
        name: "Test Node",
        type: "test-node",
        version: "1.0.0",
        author: "Test",
        description: "Test node",
        category: "test",
        icon: "test",
        keywords: [],
        tags: [],
        runtime: { language: "typescript" },
        experimental: false,
        deprecated: false,
        validate: () => ({ valid: true, errors: [] }),
        getSearchTerms: () => [],
        matchesSearch: () => true,
      };

      const mockNodeEntry = {
        metadata: () => {
          loadCount++;
          return Promise.resolve({ default: mockMetadata });
        },
        config: () => Promise.resolve({ default: {} }),
        logic: () => Promise.resolve({ default: {} }),
        implementation: () => Promise.resolve({ default: {} }),
      };

      atomicRegistry.register("test-node", mockNodeEntry);

      await atomicRegistry.loadMetadata("test-node");
      await atomicRegistry.loadMetadata("test-node");

      expect(loadCount).toBe(1);
    });

    it("should return null for non-existent node", async () => {
      const metadata = await atomicRegistry.loadMetadata("non-existent");
      expect(metadata).toBeNull();
    });

    it("should handle module formats correctly", async () => {
      // Test different export formats
      const formats = [
        { metadata: { id: "test1" } }, // Named export
        { default: { id: "test2" } }, // Default export
        { id: "test3" }, // Direct export
      ];

      for (let i = 0; i < formats.length; i++) {
        const format = formats[i];
        const nodeId = `test-node-${i}`;

        atomicRegistry.register(nodeId, {
          metadata: () => Promise.resolve(format),
          config: () => Promise.resolve({}),
          logic: () => Promise.resolve({}),
          implementation: () => Promise.resolve({}),
        });

        const metadata = await atomicRegistry.loadMetadata(nodeId);
        expect(metadata).toHaveProperty("id");
      }
    });
  });

  describe("Cache Management", () => {
    it("should clear specific cache", () => {
      atomicRegistry.clearCache("metadata");
      const stats = atomicRegistry.getCacheStats();
      expect(stats.metadata).toBe(0);
    });

    it("should clear all caches", () => {
      atomicRegistry.clearAllCaches();
      const stats = atomicRegistry.getCacheStats();
      expect(stats.metadata).toBe(0);
      expect(stats.config).toBe(0);
      expect(stats.logic).toBe(0);
      expect(stats.nodes).toBe(0);
    });

    it("should report correct cache statistics", async () => {
      const mockNodeEntry = {
        metadata: () => Promise.resolve({ default: { id: "test" } }),
        config: () => Promise.resolve({ default: {} }),
        logic: () => Promise.resolve({ default: {} }),
        implementation: () => Promise.resolve({ default: {} }),
      };

      atomicRegistry.register("test-node", mockNodeEntry);

      await atomicRegistry.loadMetadata("test-node");
      await atomicRegistry.loadConfig("test-node");

      const stats = atomicRegistry.getCacheStats();
      expect(stats.metadata).toBe(1);
      expect(stats.config).toBe(1);
      expect(stats.logic).toBe(0);
      expect(stats.nodes).toBe(0);
    });
  });

  describe("Batch Operations", () => {
    it("should load all metadata", async () => {
      const mockNodes = ["node1", "node2", "node3"];

      mockNodes.forEach((nodeId) => {
        atomicRegistry.register(nodeId, {
          metadata: () =>
            Promise.resolve({
              default: {
                id: nodeId,
                name: nodeId,
                type: nodeId,
                version: "1.0.0",
                author: "Test",
                description: "Test",
                category: "test",
                icon: "test",
                keywords: [],
                tags: [],
                validate: () => ({ valid: true, errors: [] }),
                getSearchTerms: () => [nodeId],
                matchesSearch: (query: string) => nodeId.includes(query),
              } as INodeMetadata,
            }),
          config: () => Promise.resolve({ default: {} }),
          logic: () => Promise.resolve({ default: {} }),
          implementation: () => Promise.resolve({ default: {} }),
        });
      });

      const allMetadata = await atomicRegistry.loadAllMetadata();
      expect(allMetadata).toHaveLength(3);
      expect(allMetadata.map((m: any) => m.id)).toEqual(mockNodes);
    });

    it("should filter out failed metadata loads", async () => {
      atomicRegistry.register("good-node", {
        metadata: () =>
          Promise.resolve({ default: { id: "good" } as INodeMetadata }),
        config: () => Promise.resolve({ default: {} }),
        logic: () => Promise.resolve({ default: {} }),
        implementation: () => Promise.resolve({ default: {} }),
      });

      atomicRegistry.register("bad-node", {
        metadata: () => Promise.reject(new Error("Failed to load")),
        config: () => Promise.resolve({ default: {} }),
        logic: () => Promise.resolve({ default: {} }),
        implementation: () => Promise.resolve({ default: {} }),
      });

      const allMetadata = await atomicRegistry.loadAllMetadata();
      expect(allMetadata).toHaveLength(1);
      expect(allMetadata[0].id).toBe("good");
    });
  });

  describe("Node Types", () => {
    it("should return all registered node types", () => {
      atomicRegistry.register("node1", {
        metadata: () => Promise.resolve({}),
        config: () => Promise.resolve({}),
        logic: () => Promise.resolve({}),
        implementation: () => Promise.resolve({}),
      });

      atomicRegistry.register("node2", {
        metadata: () => Promise.resolve({}),
        config: () => Promise.resolve({}),
        logic: () => Promise.resolve({}),
        implementation: () => Promise.resolve({}),
      });

      const types = atomicRegistry.getNodeTypes();
      expect(types).toEqual(["node1", "node2"]);
    });
  });
});
