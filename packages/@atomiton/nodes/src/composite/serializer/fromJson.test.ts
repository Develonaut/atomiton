/**
 * Tests for fromJson function
 *
 * This tests the conversion from JSON format to CompositeNodeDefinition format,
 * transforming the storage/runtime format to the node's internal format.
 */

import { describe, it, expect } from "vitest";
import { fromJson } from "./fromJson";
import type { JsonCompositeDefinition } from "./types";

describe("fromJson", () => {
  describe("Basic Conversion", () => {
    it("should convert minimal composite definition", () => {
      const jsonData: JsonCompositeDefinition = {
        id: "test-composite",
        name: "Test Composite",
        category: "test",
        description: "A test composite",
        version: "1.0.0",
        metadata: {
          created: "2024-01-01T00:00:00Z",
          updated: "2024-01-01T00:00:00Z",
        },
        nodes: [],
        edges: [],
      };

      const result = fromJson(jsonData);

      expect(result).toEqual({
        id: "test-composite",
        name: "Test Composite",
        description: "A test composite",
        category: "test",
        version: "1.0.0",
        metadata: {
          author: undefined,
          tags: undefined,
          icon: undefined,
          created: "2024-01-01T00:00:00Z",
          updated: undefined,
        },
        nodes: [],
        edges: [],
        variables: undefined,
        settings: undefined,
      });
    });

    it("should convert complete composite definition", () => {
      const jsonData: JsonCompositeDefinition = {
        id: "full-composite",
        name: "Full Composite",
        category: "complete",
        description: "A complete composite",
        version: "2.0.0",
        metadata: {
          created: "2024-01-01T00:00:00Z",
          updated: "2024-01-02T00:00:00Z",
          author: "Test Author",
          tags: ["test", "complete"],
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
          runtime: { timeout: 30000 },
          ui: { theme: "dark" },
        },
      };

      const result = fromJson(jsonData);

      expect(result).toEqual({
        id: "full-composite",
        name: "Full Composite",
        description: "A complete composite",
        category: "complete",
        version: "2.0.0",
        metadata: {
          author: "Test Author",
          tags: ["test", "complete"],
          icon: undefined,
          created: "2024-01-01T00:00:00Z",
          updated: undefined,
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
          runtime: { timeout: 30000 },
          ui: { theme: "dark" },
        },
      });
    });
  });

  describe("Node Conversion", () => {
    it("should convert nodes with minimal data", () => {
      const jsonData: JsonCompositeDefinition = {
        id: "test",
        name: "Test",
        category: "test",
        description: "Test",
        version: "1.0.0",
        metadata: {
          created: "2024-01-01T00:00:00Z",
          updated: "2024-01-01T00:00:00Z",
        },
        nodes: [
          {
            id: "simple-node",
            type: "simple",
            position: { x: 0, y: 0 },
            data: {},
          },
        ],
        edges: [],
      };

      const result = fromJson(jsonData);

      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0]).toEqual({
        id: "simple-node",
        type: "simple",
        position: { x: 0, y: 0 },
        config: {},
      });
    });

    it("should convert nodes with complex data", () => {
      const complexData = {
        config: {
          nested: {
            value: "deep",
            array: [1, 2, 3],
          },
        },
        settings: {
          enabled: true,
          timeout: 5000,
        },
        metadata: {
          custom: "value",
        },
      };

      const jsonData: JsonCompositeDefinition = {
        id: "test",
        name: "Test",
        category: "test",
        description: "Test",
        version: "1.0.0",
        metadata: {
          created: "2024-01-01T00:00:00Z",
          updated: "2024-01-01T00:00:00Z",
        },
        nodes: [
          {
            id: "complex-node",
            type: "complex",
            position: { x: 50, y: 100 },
            data: complexData,
          },
        ],
        edges: [],
      };

      const result = fromJson(jsonData);

      expect(result.nodes[0].config).toEqual(complexData);
    });

    it("should convert multiple nodes", () => {
      const jsonData: JsonCompositeDefinition = {
        id: "multi-node",
        name: "Multi Node",
        category: "test",
        description: "Multiple nodes",
        version: "1.0.0",
        metadata: {
          created: "2024-01-01T00:00:00Z",
          updated: "2024-01-01T00:00:00Z",
        },
        nodes: [
          {
            id: "node1",
            type: "type1",
            position: { x: 0, y: 0 },
            data: { config1: "value1" },
          },
          {
            id: "node2",
            type: "type2",
            position: { x: 200, y: 100 },
            data: { config2: "value2" },
          },
          {
            id: "node3",
            type: "type3",
            position: { x: 400, y: 200 },
            data: { config3: "value3" },
          },
        ],
        edges: [],
      };

      const result = fromJson(jsonData);

      expect(result.nodes).toHaveLength(3);
      expect(result.nodes[0].id).toBe("node1");
      expect(result.nodes[1].id).toBe("node2");
      expect(result.nodes[2].id).toBe("node3");
    });
  });

  describe("Edge Conversion", () => {
    it("should convert edges with default handles", () => {
      const jsonData: JsonCompositeDefinition = {
        id: "test",
        name: "Test",
        category: "test",
        description: "Test",
        version: "1.0.0",
        metadata: {
          created: "2024-01-01T00:00:00Z",
          updated: "2024-01-01T00:00:00Z",
        },
        nodes: [],
        edges: [
          {
            id: "edge1",
            source: "node1",
            target: "node2",
            // No sourceHandle or targetHandle
          },
        ],
      };

      const result = fromJson(jsonData);

      expect(result.edges).toHaveLength(1);
      expect(result.edges[0]).toEqual({
        id: "edge1",
        source: {
          nodeId: "node1",
          portId: "output", // Default
        },
        target: {
          nodeId: "node2",
          portId: "input", // Default
        },
        data: undefined,
      });
    });

    it("should convert edges with custom handles", () => {
      const jsonData: JsonCompositeDefinition = {
        id: "test",
        name: "Test",
        category: "test",
        description: "Test",
        version: "1.0.0",
        metadata: {
          created: "2024-01-01T00:00:00Z",
          updated: "2024-01-01T00:00:00Z",
        },
        nodes: [],
        edges: [
          {
            id: "edge1",
            source: "node1",
            target: "node2",
            sourceHandle: "customOutput",
            targetHandle: "customInput",
            data: { weight: 1.5, label: "Connection" },
          },
        ],
      };

      const result = fromJson(jsonData);

      expect(result.edges[0]).toEqual({
        id: "edge1",
        source: {
          nodeId: "node1",
          portId: "customOutput",
        },
        target: {
          nodeId: "node2",
          portId: "customInput",
        },
        data: { weight: 1.5, label: "Connection" },
      });
    });

    it("should convert multiple edges", () => {
      const jsonData: JsonCompositeDefinition = {
        id: "test",
        name: "Test",
        category: "test",
        description: "Test",
        version: "1.0.0",
        metadata: {
          created: "2024-01-01T00:00:00Z",
          updated: "2024-01-01T00:00:00Z",
        },
        nodes: [],
        edges: [
          {
            id: "edge1",
            source: "node1",
            target: "node2",
            sourceHandle: "out1",
            targetHandle: "in1",
          },
          {
            id: "edge2",
            source: "node2",
            target: "node3",
            sourceHandle: "out2",
            targetHandle: "in2",
          },
        ],
      };

      const result = fromJson(jsonData);

      expect(result.edges).toHaveLength(2);
      expect(result.edges[0].id).toBe("edge1");
      expect(result.edges[1].id).toBe("edge2");
      expect(result.edges[0].source.nodeId).toBe("node1");
      expect(result.edges[1].source.nodeId).toBe("node2");
    });
  });

  describe("Metadata Conversion", () => {
    it("should handle metadata with all fields", () => {
      const jsonData: JsonCompositeDefinition = {
        id: "test",
        name: "Test",
        category: "test",
        description: "Test",
        version: "1.0.0",
        metadata: {
          created: "2024-01-01T00:00:00Z",
          updated: "2024-01-02T00:00:00Z",
          author: "Test Author",
          tags: ["tag1", "tag2", "tag3"],
          icon: "test-icon",
        },
        nodes: [],
        edges: [],
      };

      const result = fromJson(jsonData);

      expect(result.metadata).toEqual({
        author: "Test Author",
        tags: ["tag1", "tag2", "tag3"],
        icon: "test-icon",
        created: "2024-01-01T00:00:00Z",
        updated: "2024-01-02T00:00:00Z",
      });
    });

    it("should handle metadata with partial fields", () => {
      const jsonData: JsonCompositeDefinition = {
        id: "test",
        name: "Test",
        category: "test",
        description: "Test",
        version: "1.0.0",
        metadata: {
          created: "2024-01-01T00:00:00Z",
          updated: "2024-01-02T00:00:00Z",
          author: "Test Author",
          // Missing tags, icon
        },
        nodes: [],
        edges: [],
      };

      const result = fromJson(jsonData);

      expect(result.metadata).toEqual({
        author: "Test Author",
        tags: undefined,
        icon: undefined,
        created: "2024-01-01T00:00:00Z",
        updated: undefined,
      });
    });

    it("should handle missing metadata fields gracefully", () => {
      const jsonData: JsonCompositeDefinition = {
        id: "test",
        name: "Test",
        category: "test",
        description: "Test",
        version: "1.0.0",
        metadata: {
          created: "2024-01-01T00:00:00Z",
          updated: "2024-01-02T00:00:00Z",
          // No author, tags, icon
        },
        nodes: [],
        edges: [],
      };

      const result = fromJson(jsonData);

      expect(result.metadata).toEqual({
        author: undefined,
        tags: undefined,
        icon: undefined,
        created: "2024-01-01T00:00:00Z",
        updated: undefined,
      });
    });
  });

  describe("Variables and Settings", () => {
    it("should convert variables correctly", () => {
      const jsonData: JsonCompositeDefinition = {
        id: "test",
        name: "Test",
        category: "test",
        description: "Test",
        version: "1.0.0",
        metadata: {
          created: "2024-01-01T00:00:00Z",
          updated: "2024-01-01T00:00:00Z",
        },
        nodes: [],
        edges: [],
        variables: {
          stringVar: {
            type: "string",
            defaultValue: "default",
            description: "A string variable",
          },
          numberVar: {
            type: "number",
            defaultValue: 42,
          },
          boolVar: {
            type: "boolean",
            defaultValue: true,
            description: "A boolean variable",
          },
        },
      };

      const result = fromJson(jsonData);

      expect(result.variables).toEqual({
        stringVar: {
          type: "string",
          defaultValue: "default",
          description: "A string variable",
        },
        numberVar: {
          type: "number",
          defaultValue: 42,
        },
        boolVar: {
          type: "boolean",
          defaultValue: true,
          description: "A boolean variable",
        },
      });
    });

    it("should convert settings correctly", () => {
      const jsonData: JsonCompositeDefinition = {
        id: "test",
        name: "Test",
        category: "test",
        description: "Test",
        version: "1.0.0",
        metadata: {
          created: "2024-01-01T00:00:00Z",
          updated: "2024-01-01T00:00:00Z",
        },
        nodes: [],
        edges: [],
        settings: {
          runtime: {
            timeout: 30000,
            retries: 3,
            parallel: false,
          },
          ui: {
            theme: "dark",
            showGrid: true,
            snapToGrid: false,
          },
        },
      };

      const result = fromJson(jsonData);

      expect(result.settings).toEqual({
        runtime: {
          timeout: 30000,
          retries: 3,
          parallel: false,
        },
        ui: {
          theme: "dark",
          showGrid: true,
          snapToGrid: false,
        },
      });
    });

    it("should handle undefined variables and settings", () => {
      const jsonData: JsonCompositeDefinition = {
        id: "test",
        name: "Test",
        category: "test",
        description: "Test",
        version: "1.0.0",
        metadata: {
          created: "2024-01-01T00:00:00Z",
          updated: "2024-01-01T00:00:00Z",
        },
        nodes: [],
        edges: [],
        // No variables or settings
      };

      const result = fromJson(jsonData);

      expect(result.variables).toBeUndefined();
      expect(result.settings).toBeUndefined();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty arrays", () => {
      const jsonData: JsonCompositeDefinition = {
        id: "empty",
        name: "Empty",
        category: "empty",
        description: "Empty composite",
        version: "1.0.0",
        metadata: {
          created: "2024-01-01T00:00:00Z",
          updated: "2024-01-01T00:00:00Z",
        },
        nodes: [],
        edges: [],
      };

      const result = fromJson(jsonData);

      expect(result.nodes).toEqual([]);
      expect(result.edges).toEqual([]);
    });

    it("should handle nodes with null/undefined data", () => {
      const jsonData: JsonCompositeDefinition = {
        id: "test",
        name: "Test",
        category: "test",
        description: "Test",
        version: "1.0.0",
        metadata: {
          created: "2024-01-01T00:00:00Z",
          updated: "2024-01-01T00:00:00Z",
        },
        nodes: [
          {
            id: "node1",
            type: "test",
            position: { x: 0, y: 0 },
            data: null as unknown,
          },
        ],
        edges: [],
      };

      const result = fromJson(jsonData);

      expect(result.nodes[0].config).toBeNull();
    });

    it("should handle edges with undefined data", () => {
      const jsonData: JsonCompositeDefinition = {
        id: "test",
        name: "Test",
        category: "test",
        description: "Test",
        version: "1.0.0",
        metadata: {
          created: "2024-01-01T00:00:00Z",
          updated: "2024-01-01T00:00:00Z",
        },
        nodes: [],
        edges: [
          {
            id: "edge1",
            source: "node1",
            target: "node2",
            // No data field
          },
        ],
      };

      const result = fromJson(jsonData);

      expect(result.edges[0].data).toBeUndefined();
    });

    it("should handle special characters in IDs and names", () => {
      const jsonData: JsonCompositeDefinition = {
        id: "test-composite-üñiçødé",
        name: "Test Composite with émojis 🎉",
        category: "test",
        description: "Speçial chars",
        version: "1.0.0",
        metadata: {
          created: "2024-01-01T00:00:00Z",
          updated: "2024-01-01T00:00:00Z",
        },
        nodes: [
          {
            id: "节点-1",
            type: "test",
            position: { x: 0, y: 0 },
            data: {},
          },
        ],
        edges: [],
      };

      const result = fromJson(jsonData);

      expect(result.id).toBe("test-composite-üñiçødé");
      expect(result.name).toBe("Test Composite with émojis 🎉");
      expect(result.nodes[0].id).toBe("节点-1");
    });

    it("should handle very large numbers in positions", () => {
      const jsonData: JsonCompositeDefinition = {
        id: "test",
        name: "Test",
        category: "test",
        description: "Test",
        version: "1.0.0",
        metadata: {
          created: "2024-01-01T00:00:00Z",
          updated: "2024-01-01T00:00:00Z",
        },
        nodes: [
          {
            id: "node1",
            type: "test",
            position: {
              x: Number.MAX_SAFE_INTEGER,
              y: -Number.MAX_SAFE_INTEGER,
            },
            data: {},
          },
        ],
        edges: [],
      };

      const result = fromJson(jsonData);

      expect(result.nodes[0].position.x).toBe(Number.MAX_SAFE_INTEGER);
      expect(result.nodes[0].position.y).toBe(-Number.MAX_SAFE_INTEGER);
    });
  });

  describe("Data Integrity", () => {
    it("should not modify original input", () => {
      const originalData: JsonCompositeDefinition = {
        id: "test",
        name: "Test",
        category: "test",
        description: "Test",
        version: "1.0.0",
        metadata: {
          created: "2024-01-01T00:00:00Z",
          updated: "2024-01-01T00:00:00Z",
          tags: ["original", "tag"],
        },
        nodes: [
          {
            id: "node1",
            type: "test",
            position: { x: 0, y: 0 },
            data: { original: "value" },
          },
        ],
        edges: [],
      };

      const originalCopy = JSON.parse(JSON.stringify(originalData));

      const result = fromJson(originalData);

      // Original should be unchanged
      expect(originalData).toEqual(originalCopy);

      // Result should be different object
      expect(result).not.toBe(originalData);
      expect(result.nodes).not.toBe(originalData.nodes);
      expect(result.metadata).not.toBe(originalData.metadata);
    });

    it("should handle deep cloning of complex data", () => {
      const complexData = {
        nested: {
          array: [1, 2, { inner: "value" }],
          object: {
            deep: {
              property: "test",
            },
          },
        },
      };

      const jsonData: JsonCompositeDefinition = {
        id: "test",
        name: "Test",
        category: "test",
        description: "Test",
        version: "1.0.0",
        metadata: {
          created: "2024-01-01T00:00:00Z",
          updated: "2024-01-01T00:00:00Z",
        },
        nodes: [
          {
            id: "node1",
            type: "test",
            position: { x: 0, y: 0 },
            data: complexData,
          },
        ],
        edges: [],
      };

      const result = fromJson(jsonData);

      expect(result.nodes[0].config).toEqual(complexData);
      expect(result.nodes[0].config).toBe(complexData); // Should reference same object
    });
  });
});
