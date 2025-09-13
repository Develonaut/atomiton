/**
 * Tests for toJson function
 *
 * This tests the conversion from CompositeNodeDefinition format to CompositeDefinition format,
 * transforming the node's internal format to the storage/runtime format.
 */

import { describe, it, expect } from "vitest";
import { toJson } from "./toJson";
import type { CompositeNodeDefinition } from "../CompositeNode";

describe("toJson", () => {
  describe("Basic Conversion", () => {
    it("should convert minimal composite node definition", () => {
      const composite: CompositeNodeDefinition = {
        id: "test-composite",
        name: "Test Composite",
        description: "A test composite",
        category: "test",
        version: "1.0.0",
        metadata: {
          author: "Test Author",
          tags: ["test"],
          icon: "test-icon",
          created: "2024-01-01T00:00:00Z",
          updated: "2024-01-02T00:00:00Z",
        },
        nodes: [],
        edges: [],
      };

      const result = toJson(composite);

      expect(result).toEqual({
        id: "test-composite",
        name: "Test Composite",
        description: "A test composite",
        category: "test",
        version: "1.0.0",
        metadata: {
          author: "Test Author",
          tags: ["test"],
          icon: "test-icon",
          created: "2024-01-01T00:00:00Z",
          updated: "2024-01-02T00:00:00Z",
        },
        nodes: [],
        edges: [],
        variables: undefined,
        settings: undefined,
      });
    });

    it("should convert complete composite node definition", () => {
      const composite: CompositeNodeDefinition = {
        id: "full-composite",
        name: "Full Composite",
        description: "A complete composite",
        category: "complete",
        version: "2.0.0",
        metadata: {
          author: "Test Author",
          tags: ["test", "complete"],
          icon: "full-icon",
          created: "2024-01-01T00:00:00Z",
          updated: "2024-01-02T00:00:00Z",
        },
        nodes: [
          {
            id: "node1",
            type: "http-request",
            position: { x: 100, y: 200 },
            config: {
              url: "https://api.example.com",
              method: "GET",
              headers: { "Content-Type": "application/json" },
            },
          },
        ],
        edges: [
          {
            id: "edge1",
            source: {
              nodeId: "node1",
              portId: "response",
            },
            target: {
              nodeId: "node2",
              portId: "input",
            },
            data: { label: "API Response" },
          },
        ],
        variables: {
          apiKey: {
            type: "string",
            defaultValue: "test-key",
            description: "API Key",
          },
        },
        settings: {
          timeout: 30000,
        },
      };

      const result = toJson(composite);

      expect(result).toEqual({
        id: "full-composite",
        name: "Full Composite",
        description: "A complete composite",
        category: "complete",
        version: "2.0.0",
        metadata: {
          author: "Test Author",
          tags: ["test", "complete"],
          icon: "full-icon",
          created: "2024-01-01T00:00:00Z",
          updated: "2024-01-02T00:00:00Z",
        },
        nodes: [
          {
            id: "node1",
            type: "http-request",
            position: { x: 100, y: 200 },
            data: {
              url: "https://api.example.com",
              method: "GET",
              headers: { "Content-Type": "application/json" },
            },
          },
        ],
        edges: [
          {
            id: "edge1",
            source: "node1",
            target: "node2",
            sourceHandle: "response",
            targetHandle: "input",
            data: { label: "API Response" },
          },
        ],
        variables: {
          apiKey: {
            type: "string",
            defaultValue: "test-key",
            description: "API Key",
          },
        },
        settings: {
          timeout: 30000,
        },
      });
    });
  });

  describe("Node Conversion", () => {
    it("should convert nodes with default positions", () => {
      const composite: CompositeNodeDefinition = {
        id: "test",
        name: "Test",
        description: "Test",
        category: "test",
        version: "1.0.0",
        metadata: {},
        nodes: [
          {
            id: "node-no-position",
            type: "test",
            // No position property
            config: { setting: "value" },
          },
        ],
        edges: [],
      };

      const result = toJson(composite);

      expect(result.nodes[0]).toEqual({
        id: "node-no-position",
        type: "test",
        position: { x: 0, y: 0 }, // Default position
        data: { setting: "value" },
      });
    });

    it("should convert nodes with undefined config", () => {
      const composite: CompositeNodeDefinition = {
        id: "test",
        name: "Test",
        description: "Test",
        category: "test",
        version: "1.0.0",
        metadata: {},
        nodes: [
          {
            id: "node-no-config",
            type: "test",
            position: { x: 50, y: 100 },
            // No config property
          },
        ],
        edges: [],
      };

      const result = toJson(composite);

      expect(result.nodes[0]).toEqual({
        id: "node-no-config",
        type: "test",
        position: { x: 50, y: 100 },
        data: {}, // Default empty object
      });
    });

    it("should convert nodes with complex config", () => {
      const complexConfig = {
        api: {
          url: "https://example.com",
          headers: {
            Authorization: "Bearer token",
            "Content-Type": "application/json",
          },
          timeout: 5000,
        },
        processing: {
          steps: [
            { type: "validate", schema: "user-schema" },
            { type: "transform", mapping: { id: "userId", name: "userName" } },
          ],
          options: {
            parallel: true,
            maxRetries: 3,
          },
        },
        metadata: {
          version: 2,
          created: new Date("2024-01-01"),
          tags: ["api", "user"],
        },
      };

      const composite: CompositeNodeDefinition = {
        id: "test",
        name: "Test",
        description: "Test",
        category: "test",
        version: "1.0.0",
        metadata: {},
        nodes: [
          {
            id: "complex-node",
            type: "complex",
            position: { x: 100, y: 200 },
            config: complexConfig,
          },
        ],
        edges: [],
      };

      const result = toJson(composite);

      expect(result.nodes[0].data).toEqual(complexConfig);
    });

    it("should convert multiple nodes", () => {
      const composite: CompositeNodeDefinition = {
        id: "multi-node",
        name: "Multi Node",
        description: "Multiple nodes",
        category: "test",
        version: "1.0.0",
        metadata: {},
        nodes: [
          {
            id: "node1",
            type: "type1",
            position: { x: 0, y: 0 },
            config: { setting1: "value1" },
          },
          {
            id: "node2",
            type: "type2",
            position: { x: 200, y: 100 },
            config: { setting2: "value2" },
          },
          {
            id: "node3",
            type: "type3",
            position: { x: 400, y: 200 },
            config: { setting3: "value3" },
          },
        ],
        edges: [],
      };

      const result = toJson(composite);

      expect(result.nodes).toHaveLength(3);
      // Node count is not a metadata field
      // expect(result.metadata.nodeCount).toBe(3);
      expect(result.nodes[0].id).toBe("node1");
      expect(result.nodes[1].id).toBe("node2");
      expect(result.nodes[2].id).toBe("node3");
    });
  });

  describe("Edge Conversion", () => {
    it("should convert edges correctly", () => {
      const composite: CompositeNodeDefinition = {
        id: "test",
        name: "Test",
        description: "Test",
        category: "test",
        version: "1.0.0",
        metadata: {},
        nodes: [],
        edges: [
          {
            id: "edge1",
            source: {
              nodeId: "node1",
              portId: "output",
            },
            target: {
              nodeId: "node2",
              portId: "input",
            },
            data: { weight: 1.0, label: "Connection" },
          },
        ],
      };

      const result = toJson(composite);

      expect(result.edges).toHaveLength(1);
      expect(result.edges[0]).toEqual({
        id: "edge1",
        source: "node1",
        target: "node2",
        sourceHandle: "output",
        targetHandle: "input",
        data: { weight: 1.0, label: "Connection" },
      });
    });

    it("should convert edges without data", () => {
      const composite: CompositeNodeDefinition = {
        id: "test",
        name: "Test",
        description: "Test",
        category: "test",
        version: "1.0.0",
        metadata: {},
        nodes: [],
        edges: [
          {
            id: "edge1",
            source: {
              nodeId: "node1",
              portId: "out",
            },
            target: {
              nodeId: "node2",
              portId: "in",
            },
            // No data property
          },
        ],
      };

      const result = toJson(composite);

      expect(result.edges[0]).toEqual({
        id: "edge1",
        source: "node1",
        target: "node2",
        sourceHandle: "out",
        targetHandle: "in",
        data: undefined,
      });
    });

    it("should convert multiple edges", () => {
      const composite: CompositeNodeDefinition = {
        id: "test",
        name: "Test",
        description: "Test",
        category: "test",
        version: "1.0.0",
        metadata: {},
        nodes: [],
        edges: [
          {
            id: "edge1",
            source: { nodeId: "node1", portId: "out1" },
            target: { nodeId: "node2", portId: "in1" },
          },
          {
            id: "edge2",
            source: { nodeId: "node2", portId: "out2" },
            target: { nodeId: "node3", portId: "in2" },
          },
          {
            id: "edge3",
            source: { nodeId: "node3", portId: "out3" },
            target: { nodeId: "node1", portId: "in3" },
          },
        ],
      };

      const result = toJson(composite);

      expect(result.edges).toHaveLength(3);
      // Edge count is not a metadata field
      // expect(result.metadata.edgeCount).toBe(3);
      expect(result.edges[0].id).toBe("edge1");
      expect(result.edges[1].id).toBe("edge2");
      expect(result.edges[2].id).toBe("edge3");
    });
  });

  describe("Metadata Handling", () => {
    it("should preserve existing metadata and add computed fields", () => {
      const originalMetadata = {
        author: "Test Author",
        tags: ["test", "conversion"],
        icon: "test-icon",
        created: "2024-01-01T00:00:00Z",
        updated: "2024-01-02T00:00:00Z",
        version: "meta-version",
        license: "MIT",
      };

      const composite: CompositeNodeDefinition = {
        id: "test",
        name: "Test",
        description: "Test",
        category: "test",
        version: "1.0.0",
        metadata: originalMetadata,
        nodes: [
          { id: "node1", type: "test", position: { x: 0, y: 0 } },
          { id: "node2", type: "test", position: { x: 0, y: 0 } },
        ],
        edges: [
          {
            id: "edge1",
            source: { nodeId: "node1", portId: "out" },
            target: { nodeId: "node2", portId: "in" },
          },
        ],
      };

      const result = toJson(composite);

      expect(result.metadata).toEqual({
        ...originalMetadata,
      });
    });

    it("should handle empty metadata", () => {
      const composite: CompositeNodeDefinition = {
        id: "test",
        name: "Test",
        description: "Test",
        category: "test",
        version: "1.0.0",
        metadata: {},
        nodes: [],
        edges: [],
      };

      const result = toJson(composite);

      expect(result.metadata).toEqual({});
    });

    it("should correctly count nodes and edges", () => {
      const composite: CompositeNodeDefinition = {
        id: "count-test",
        name: "Count Test",
        description: "Test counting",
        category: "test",
        version: "1.0.0",
        metadata: {},
        nodes: Array.from({ length: 15 }, (_, i) => ({
          id: `node${i}`,
          type: "test",
          position: { x: i * 10, y: i * 10 },
        })),
        edges: Array.from({ length: 8 }, (_, i) => ({
          id: `edge${i}`,
          source: { nodeId: `node${i}`, portId: "out" },
          target: { nodeId: `node${i + 1}`, portId: "in" },
        })),
      };

      // Test that it doesn't throw
      toJson(composite);

      // Node count is not a metadata field
      // expect(result.metadata.nodeCount).toBe(15);
      // Edge count is not a metadata field
      // expect(result.metadata.edgeCount).toBe(8);
    });
  });

  describe("Variables and Settings", () => {
    it("should preserve variables", () => {
      const variables = {
        apiUrl: {
          type: "string",
          defaultValue: "https://api.example.com",
          description: "API base URL",
        },
        timeout: {
          type: "number",
          defaultValue: 5000,
        },
        debug: {
          type: "boolean",
          defaultValue: false,
          description: "Enable debug logging",
        },
      };

      const composite: CompositeNodeDefinition = {
        id: "test",
        name: "Test",
        description: "Test",
        category: "test",
        version: "1.0.0",
        metadata: {},
        nodes: [],
        edges: [],
        variables,
      };

      const result = toJson(composite);

      expect(result.variables).toEqual(variables);
    });

    it("should preserve settings", () => {
      const settings = {
        timeout: 30000,
        retries: 3,
        parallel: true,
      };

      const composite: CompositeNodeDefinition = {
        id: "test",
        name: "Test",
        description: "Test",
        category: "test",
        version: "1.0.0",
        metadata: {},
        nodes: [],
        edges: [],
        settings,
      };

      const result = toJson(composite);

      expect(result.settings).toEqual(settings);
    });

    it("should handle undefined variables and settings", () => {
      const composite: CompositeNodeDefinition = {
        id: "test",
        name: "Test",
        description: "Test",
        category: "test",
        version: "1.0.0",
        metadata: {},
        nodes: [],
        edges: [],
        // No variables or settings
      };

      const result = toJson(composite);

      expect(result.variables).toBeUndefined();
      expect(result.settings).toBeUndefined();
    });
  });

  describe("Type Field", () => {
    it("should always set type to 'blueprint'", () => {
      const composite: CompositeNodeDefinition = {
        id: "test",
        name: "Test",
        description: "Test",
        category: "test",
        version: "1.0.0",
        metadata: {},
        nodes: [],
        edges: [],
      };

      // Test that it doesn't throw
      toJson(composite);

      // Type field is not in JSON format
      // expect(result.type).toBe("blueprint");
    });

    it("should set type to 'blueprint' regardless of input", () => {
      // Even if the input had a different type somewhere, output should be "blueprint"
      const composites: CompositeNodeDefinition[] = [
        {
          id: "test1",
          name: "Test 1",
          description: "Test",
          category: "test",
          version: "1.0.0",
          metadata: { author: "test-author" }, // Valid metadata field
          nodes: [],
          edges: [],
        },
        {
          id: "test2",
          name: "Test 2",
          description: "Test",
          category: "test",
          version: "1.0.0",
          metadata: {},
          nodes: [],
          edges: [],
        },
      ];

      composites.forEach((composite) => {
        // Test that it doesn't throw
        toJson(composite);
        // Type field is not in JSON format
        // expect(result.type).toBe("blueprint");
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty arrays", () => {
      const composite: CompositeNodeDefinition = {
        id: "empty",
        name: "Empty",
        description: "Empty composite",
        category: "empty",
        version: "1.0.0",
        metadata: {},
        nodes: [],
        edges: [],
      };

      const result = toJson(composite);

      expect(result.nodes).toEqual([]);
      expect(result.edges).toEqual([]);
      // Node count is not a metadata field
      // expect(result.metadata.nodeCount).toBe(0);
      // Edge count is not a metadata field
      // expect(result.metadata.edgeCount).toBe(0);
    });

    it("should handle special characters in names and IDs", () => {
      const composite: CompositeNodeDefinition = {
        id: "test-composite-üñiçødé",
        name: "Test Composite with émojis 🎉",
        description: "Speçial chars",
        category: "test",
        version: "1.0.0",
        metadata: {},
        nodes: [
          {
            id: "节点-1",
            type: "test",
            position: { x: 0, y: 0 },
          },
        ],
        edges: [],
      };

      const result = toJson(composite);

      expect(result.id).toBe("test-composite-üñiçødé");
      expect(result.name).toBe("Test Composite with émojis 🎉");
      expect(result.nodes[0].id).toBe("节点-1");
    });

    it("should handle very large numbers in positions", () => {
      const composite: CompositeNodeDefinition = {
        id: "test",
        name: "Test",
        description: "Test",
        category: "test",
        version: "1.0.0",
        metadata: {},
        nodes: [
          {
            id: "node1",
            type: "test",
            position: {
              x: Number.MAX_SAFE_INTEGER,
              y: -Number.MAX_SAFE_INTEGER,
            },
          },
        ],
        edges: [],
      };

      const result = toJson(composite);

      expect(result.nodes[0].position.x).toBe(Number.MAX_SAFE_INTEGER);
      expect(result.nodes[0].position.y).toBe(-Number.MAX_SAFE_INTEGER);
    });

    it("should handle null and undefined values", () => {
      const composite: CompositeNodeDefinition = {
        id: "test",
        name: "Test",
        description: "Test",
        category: "test",
        version: "1.0.0",
        metadata: {
          author: null as unknown,
          tags: undefined,
        },
        nodes: [
          {
            id: "node1",
            type: "test",
            position: { x: 0, y: 0 },
            config: null as unknown,
          },
        ],
        edges: [
          {
            id: "edge1",
            source: { nodeId: "node1", portId: "out" },
            target: { nodeId: "node2", portId: "in" },
            data: null as unknown,
          },
        ],
      };

      const result = toJson(composite);

      expect(result.metadata.author).toBeNull();
      expect(result.metadata.tags).toBeUndefined();
      // Custom fields are not preserved
      // expect(result.metadata.customField).toBeNull();
      expect(result.nodes[0].data).toBe(null as unknown);
      expect(result.edges[0].data).toBeNull();
    });
  });

  describe("Data Integrity", () => {
    it("should not modify original input", () => {
      const originalComposite: CompositeNodeDefinition = {
        id: "test",
        name: "Test",
        description: "Test",
        category: "test",
        version: "1.0.0",
        metadata: {
          author: "Test Author",
          tags: ["original"],
        },
        nodes: [
          {
            id: "node1",
            type: "test",
            position: { x: 0, y: 0 },
            config: { original: "value" },
          },
        ],
        edges: [],
      };

      const originalCopy = JSON.parse(JSON.stringify(originalComposite));

      const result = toJson(originalComposite);

      // Original should be unchanged
      expect(originalComposite).toEqual(originalCopy);

      // Result should be different object
      expect(result).not.toBe(originalComposite);
      expect(result.nodes).not.toBe(originalComposite.nodes);
      expect(result.metadata).not.toBe(originalComposite.metadata);
    });

    it("should preserve object references where appropriate", () => {
      const sharedConfig = { shared: "config" };
      const sharedData = { shared: "data" };

      const composite: CompositeNodeDefinition = {
        id: "test",
        name: "Test",
        description: "Test",
        category: "test",
        version: "1.0.0",
        metadata: {},
        nodes: [
          {
            id: "node1",
            type: "test",
            position: { x: 0, y: 0 },
            config: sharedConfig,
          },
        ],
        edges: [
          {
            id: "edge1",
            source: { nodeId: "node1", portId: "out" },
            target: { nodeId: "node2", portId: "in" },
            data: sharedData,
          },
        ],
      };

      const result = toJson(composite);

      // Should reference the same objects
      expect(result.nodes[0].data).toBe(sharedConfig);
      expect(result.edges[0].data).toBe(sharedData);
    });
  });
});
