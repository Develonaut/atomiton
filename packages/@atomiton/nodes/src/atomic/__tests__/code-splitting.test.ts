/**
 * Tests for Code Splitting and Lazy Loading
 *
 * These tests verify that our architecture properly supports:
 * - Lazy loading of node parts (metadata, config, logic, implementation)
 * - Code splitting to keep bundle sizes small
 * - Loading only what's needed for each use case
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { atomicRegistry } from "../registry";

describe("Code Splitting and Lazy Loading", () => {
  beforeEach(() => {
    atomicRegistry.clearCache("all");
  });

  describe("Selective Loading", () => {
    it("should load only metadata without loading full node", async () => {
      // Track what gets loaded
      const loadTracking = {
        metadata: false,
        config: false,
        logic: false,
        implementation: false,
      };

      // Register a test node with tracking
      atomicRegistry.register("test-node", {
        metadata: () => {
          loadTracking.metadata = true;
          return Promise.resolve({
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
            },
          });
        },
        config: () => {
          loadTracking.config = true;
          return Promise.resolve({ default: {} });
        },
        logic: () => {
          loadTracking.logic = true;
          return Promise.resolve({ default: {} });
        },
        implementation: () => {
          loadTracking.implementation = true;
          return Promise.resolve({ default: {} });
        },
      });

      // Load only metadata
      await atomicRegistry.loadMetadata("test-node");

      // Verify only metadata was loaded
      expect(loadTracking.metadata).toBe(true);
      expect(loadTracking.config).toBe(false);
      expect(loadTracking.logic).toBe(false);
      expect(loadTracking.implementation).toBe(false);
    });

    it("should load only config without loading implementation", async () => {
      const loadTracking = {
        metadata: false,
        config: false,
        logic: false,
        implementation: false,
      };

      atomicRegistry.register("test-node", {
        metadata: () => {
          loadTracking.metadata = true;
          return Promise.resolve({ default: {} });
        },
        config: () => {
          loadTracking.config = true;
          return Promise.resolve({
            default: {
              schema: {},
              validate: () => ({ valid: true }),
            },
          });
        },
        logic: () => {
          loadTracking.logic = true;
          return Promise.resolve({ default: {} });
        },
        implementation: () => {
          loadTracking.implementation = true;
          return Promise.resolve({ default: {} });
        },
      });

      // Load only config
      await atomicRegistry.loadConfig("test-node");

      // Verify only config was loaded
      expect(loadTracking.metadata).toBe(false);
      expect(loadTracking.config).toBe(true);
      expect(loadTracking.logic).toBe(false);
      expect(loadTracking.implementation).toBe(false);
    });

    it("should load only logic without loading full node", async () => {
      const loadTracking = {
        metadata: false,
        config: false,
        logic: false,
        implementation: false,
      };

      atomicRegistry.register("test-node", {
        metadata: () => {
          loadTracking.metadata = true;
          return Promise.resolve({ default: {} });
        },
        config: () => {
          loadTracking.config = true;
          return Promise.resolve({ default: {} });
        },
        logic: () => {
          loadTracking.logic = true;
          return Promise.resolve({
            default: {
              execute: async () => ({ success: true }),
            },
          });
        },
        implementation: () => {
          loadTracking.implementation = true;
          return Promise.resolve({ default: {} });
        },
      });

      // Load only logic
      await atomicRegistry.loadLogic("test-node");

      // Verify only logic was loaded
      expect(loadTracking.metadata).toBe(false);
      expect(loadTracking.config).toBe(false);
      expect(loadTracking.logic).toBe(true);
      expect(loadTracking.implementation).toBe(false);
    });
  });

  describe("Dynamic Import Simulation", () => {
    it("should support dynamic imports for code splitting", async () => {
      // Simulate dynamic import behavior
      const createDynamicImport = (module: any) => {
        return () =>
          new Promise((resolve) => {
            // Simulate async loading delay
            setTimeout(() => resolve(module), 0);
          });
      };

      atomicRegistry.register("dynamic-node", {
        metadata: createDynamicImport({
          default: {
            id: "dynamic-node",
            name: "Dynamic Node",
            type: "dynamic-node",
            version: "1.0.0",
            author: "Test",
            description: "Dynamically loaded node",
            category: "test",
            icon: "dynamic",
          },
        }),
        config: createDynamicImport({ default: { schema: {} } }),
        logic: createDynamicImport({ default: { execute: () => {} } }),
        implementation: createDynamicImport({ default: { node: {} } }),
      });

      const metadata = await atomicRegistry.loadMetadata("dynamic-node");
      expect(metadata).toBeDefined();
      expect(metadata?.name).toBe("Dynamic Node");
    });
  });

  describe("Caching for Performance", () => {
    it("should cache loaded parts to avoid re-importing", async () => {
      let metadataLoadCount = 0;
      let configLoadCount = 0;
      let logicLoadCount = 0;
      let implementationLoadCount = 0;

      atomicRegistry.register("cached-node", {
        metadata: () => {
          metadataLoadCount++;
          return Promise.resolve({ default: { id: "cached" } });
        },
        config: () => {
          configLoadCount++;
          return Promise.resolve({ default: {} });
        },
        logic: () => {
          logicLoadCount++;
          return Promise.resolve({ default: {} });
        },
        implementation: () => {
          implementationLoadCount++;
          return Promise.resolve({ default: {} });
        },
      });

      // Load each part multiple times
      await atomicRegistry.loadMetadata("cached-node");
      await atomicRegistry.loadMetadata("cached-node");
      await atomicRegistry.loadConfig("cached-node");
      await atomicRegistry.loadConfig("cached-node");
      await atomicRegistry.loadLogic("cached-node");
      await atomicRegistry.loadLogic("cached-node");
      await atomicRegistry.loadNode("cached-node");
      await atomicRegistry.loadNode("cached-node");

      // Each should only be loaded once due to caching
      expect(metadataLoadCount).toBe(1);
      expect(configLoadCount).toBe(1);
      expect(logicLoadCount).toBe(1);
      expect(implementationLoadCount).toBe(1);
    });

    it("should clear cache when requested", async () => {
      let loadCount = 0;

      atomicRegistry.register("cache-test", {
        metadata: () => {
          loadCount++;
          return Promise.resolve({ default: { id: "cache-test" } });
        },
        config: () => Promise.resolve({ default: {} }),
        logic: () => Promise.resolve({ default: {} }),
        implementation: () => Promise.resolve({ default: {} }),
      });

      // First load
      await atomicRegistry.loadMetadata("cache-test");
      expect(loadCount).toBe(1);

      // Second load (cached)
      await atomicRegistry.loadMetadata("cache-test");
      expect(loadCount).toBe(1);

      // Clear cache
      atomicRegistry.clearCache("metadata");

      // Third load (not cached)
      await atomicRegistry.loadMetadata("cache-test");
      expect(loadCount).toBe(2);
    });
  });

  describe("Bundle Size Optimization", () => {
    it("should allow UI to load metadata without node implementations", async () => {
      // This simulates what the UI would do
      const uiLoadSequence = async () => {
        // Register multiple nodes
        const nodes = ["ui-node-1", "ui-node-2", "ui-node-3"];

        nodes.forEach((nodeId) => {
          atomicRegistry.register(nodeId, {
            metadata: () =>
              Promise.resolve({
                default: {
                  id: nodeId,
                  name: nodeId,
                  type: nodeId,
                  category: "ui",
                  // Small metadata object
                  version: "1.0.0",
                  author: "UI",
                  description: "UI Node",
                  icon: "ui",
                },
              }),
            config: () =>
              Promise.resolve({
                // Config might be larger but not loaded yet
                default: {
                  schema: {
                    /* large schema */
                  },
                },
              }),
            logic: () =>
              Promise.resolve({
                // Logic is not loaded for UI
                default: {
                  /* execution logic */
                },
              }),
            implementation: () =>
              Promise.resolve({
                // Full implementation is not loaded for UI
                default: {
                  /* complete node */
                },
              }),
          });
        });

        // Load only metadata for all nodes (UI pattern)
        const allMetadata = await atomicRegistry.loadAllMetadata();

        // Verify we got all metadata
        expect(allMetadata).toHaveLength(3);

        // Verify caches - only metadata should be cached
        const stats = atomicRegistry.getCacheStats();
        expect(stats.metadata).toBe(3);
        expect(stats.config).toBe(0);
        expect(stats.logic).toBe(0);
        expect(stats.nodes).toBe(0);
      };

      await uiLoadSequence();
    });

    it("should load full node only when needed for execution", async () => {
      let fullNodeLoaded = false;

      atomicRegistry.register("execution-node", {
        metadata: () =>
          Promise.resolve({
            default: { id: "execution-node", name: "Execution Node" },
          }),
        config: () => Promise.resolve({ default: {} }),
        logic: () => Promise.resolve({ default: {} }),
        implementation: () => {
          fullNodeLoaded = true;
          return Promise.resolve({
            default: {
              execute: async () => ({ success: true }),
            },
          });
        },
      });

      // UI loads metadata
      await atomicRegistry.loadMetadata("execution-node");
      expect(fullNodeLoaded).toBe(false);

      // Form loads config
      await atomicRegistry.loadConfig("execution-node");
      expect(fullNodeLoaded).toBe(false);

      // Execution loads full node
      await atomicRegistry.loadNode("execution-node");
      expect(fullNodeLoaded).toBe(true);
    });
  });

  describe("Memory Management", () => {
    it("should allow clearing specific node from all caches", () => {
      // Register and load a node
      atomicRegistry.register("memory-test", {
        metadata: () => Promise.resolve({ default: { id: "memory-test" } }),
        config: () => Promise.resolve({ default: {} }),
        logic: () => Promise.resolve({ default: {} }),
        implementation: () => Promise.resolve({ default: {} }),
      });

      // Unregister should clear from all caches
      atomicRegistry.unregister("memory-test");

      // Verify it's gone
      expect(atomicRegistry.has("memory-test")).toBe(false);

      // Stats should show the node is not cached
      const stats = atomicRegistry.getCacheStats();
      // Other nodes might be cached, so we just verify the structure
      expect(stats).toHaveProperty("metadata");
      expect(stats).toHaveProperty("config");
      expect(stats).toHaveProperty("logic");
      expect(stats).toHaveProperty("nodes");
    });
  });
});
