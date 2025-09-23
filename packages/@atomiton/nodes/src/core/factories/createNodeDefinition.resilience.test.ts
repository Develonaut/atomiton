/**
 * createNode Resilience Test - Testing handling of malformed and messy data
 */

import { createNode, type CreateNodeInput } from ".#core/factories/createNodeDefinition";
import type { Node, NodeEdge } from "#core/types";
import { describe, expect, it } from "vitest";

describe("createNode Resilience Tests", () => {
  describe("Handling undefined values", () => {
    it("handles all undefined optional fields", () => {
      const node = createNode({
        type: "composite",
        name: "Test Node",
        id: undefined,
        children: undefined,
        edges: undefined,
        metadata: undefined,
      });

      expect(node.id).toBeDefined(); // Should generate ID
      expect(node.name).toBe("Test Node");
      expect(node.metadata.description).toBeDefined();
      expect(node.metadata.category).toBe("utility");
      expect(node.metadata.version).toBe("1.0.0");
      expect(node.children).toEqual([]);
      expect(node.edges).toEqual([]);
      expect(node.metadata).toBeDefined();
    });

    it("handles partial metadata with undefined fields", () => {
      const node = createNode({
        name: "Partial Metadata Node",
        metadata: {
          icon: undefined,
          tags: undefined,
          variant: "test-variant",
        },
      });

      expect(node.metadata?.variant).toBe("test-variant");
      expect(node.metadata?.icon).toBeUndefined();
      expect(node.metadata?.tags).toBeUndefined();
      expect(node.metadata?.author).toBeDefined();
    });
  });

  describe("Handling extra/unknown properties", () => {
    it("ignores extra properties at root level", () => {
      const input: CreateNodeInput & Record<string, unknown> = {
        name: "Node with Extras",
        type: "composite",
        // Extra React Flow properties that should be ignored
        selected: true,
        draggable: false,
        selectable: true,
        connectable: false,
        positionAbsolute: { x: 100, y: 200 },
        measured: { width: 100, height: 50 },
        __reactFlowInstance: { zoom: 1.5 },
      };

      const node = createNode(input);

      expect(node.name).toBe("Node with Extras");
      expect(node.type).toBe("composite");
      // Extra properties should not be present
      expect(node).not.toHaveProperty("selected");
      expect(node).not.toHaveProperty("draggable");
      expect(node).not.toHaveProperty("positionAbsolute");
      expect(node).not.toHaveProperty("__reactFlowInstance");
    });

    it("preserves valid metadata properties", () => {
      const node = createNode({
        name: "Custom Metadata Node",
        metadata: {
          variant: "custom",
          experimental: true,
          keywords: ["test", "custom"],
          tags: ["resilience", "test"],
        },
      });

      expect(node.metadata?.variant).toBe("custom");
      expect(node.metadata?.experimental).toBe(true);
      expect(node.metadata?.keywords).toEqual(["test", "custom"]);
      expect(node.metadata?.tags).toEqual(["resilience", "test"]);
    });

    it("handles nodes with React Flow properties", () => {
      const messyNodes: (Partial<Node> & Record<string, unknown>)[] = [
        {
          id: "node-1",
          name: "Node 1",
          type: "atomic",
          position: { x: 100, y: 200 },
          // React Flow properties
          selected: true,
          dragging: false,
          measured: { width: 150, height: 75 },
        },
        {
          id: "node-2",
          name: "Node 2",
          type: "atomic",
          // More React Flow properties
          sourcePosition: "right",
          targetPosition: "left",
          zIndex: 10,
        },
      ];

      const node = createNode({
        type: "composite",
        name: "Composite with Messy Nodes",
        children: messyNodes as unknown as Node[],
      });

      // Should pass through nodes as-is
      expect(node.children).toEqual(messyNodes);
    });

    it("handles edges with extra properties", () => {
      const node = createNode({
        type: "composite",
        name: "Composite with Messy Edges",
        edges: [],
      });

      // Should create default empty edges
      expect(node.edges).toEqual([]);
    });
  });

  describe("Handling null values", () => {
    it("treats null as undefined for optional fields", () => {
      const input = {
        name: "Null Fields Node",
        id: null as string | null,
        description: null as string | null,
        category: null as string | null,
        version: null as string | null,
        children: null as Node[] | null,
        edges: null as NodeEdge[] | null,
      };

      const node = createNode(input as unknown as CreateNodeInput);

      expect(node.id).toBeDefined(); // Should generate ID
      expect(node.metadata.description).toBe("");
      expect(node.metadata.category).toBe("user");
      expect(node.metadata.version).toBe("1.0.0");
      expect(node.children).toEqual([]);
      expect(node.edges).toEqual([]);
    });
  });

  describe("Handling wrong types", () => {
    it("handles string values for array fields", () => {
      const input = {
        name: "Wrong Types Node",
        type: "composite",
        children: "not-an-array" as unknown as Node[],
        edges: "also-not-an-array" as unknown as NodeEdge[],
      };

      const node = createNode(input as unknown as CreateNodeInput);

      // Should use defaults when wrong types are provided
      expect(Array.isArray(node.children)).toBe(false);
      expect(node.children).toBe("not-an-array"); // Passes through as-is
      expect(node.edges).toBe("also-not-an-array");
      // Variables field doesn't exist in Node type
    });

    it("handles number values for string fields", () => {
      const input = {
        name: "Number Name Node",
        description: 12345 as unknown as string,
        category: 999 as unknown as string,
      };

      const node = createNode(input as unknown as CreateNodeInput);

      expect(node.metadata.description).toBe(12345); // Passes through as-is
      expect(node.metadata.category).toBe(999); // Passes through as-is
    });
  });

  describe("Handling empty/falsy values", () => {
    it("handles empty string for name", () => {
      const node = createNode({
        name: "",
      });

      expect(node.name).toBe("");
    });

    it("handles zero and false values", () => {
      const input: CreateNodeInput = {
        name: "Falsy Values Node",
        metadata: {
          experimental: false,
          deprecated: false,
          description: "",
        },
      };

      const node = createNode(input);

      expect(node.metadata?.experimental).toBe(false);
      expect(node.metadata?.deprecated).toBe(false);
      expect(node.metadata?.description).toBe("");
    });
  });

  describe("Real-world messy editor data", () => {
    it("handles typical editor state with React Flow properties", () => {
      const editorState: CreateNodeInput & Record<string, unknown> = {
        id: "composite-123",
        name: "My Blueprint",
        type: "composite",
        version: "1.0.0",
        // React Flow viewport state
        __reactFlowInstance: {
          viewport: { x: 0, y: 0, zoom: 1 },
        },
        children: [
          {
            id: "1",
            type: "code",
            position: { x: 250, y: 100 },
            data: { label: "Code Node", code: "return x * 2" },
            // React Flow node state
            width: 180,
            height: 140,
            selected: true,
            positionAbsolute: { x: 250, y: 100 },
            dragging: false,
            draggable: true,
            selectable: true,
            connectable: true,
            focusable: true,
            style: { border: "1px solid #777" },
            className: "custom-node",
            dragHandle: ".drag-handle",
            parentNode: undefined,
            zIndex: 1000,
            extent: "parent",
            expandParent: false,
            ariaLabel: "Code transformation node",
          } as unknown as Node,
        ],
        edges: [],
        // UI state that might be present
        isLayoutReady: true,
        nodesInitialized: true,
        edgesInitialized: true,
      };

      const node = createNode(editorState as unknown as CreateNodeInput);

      // Should create a valid node structure
      expect(node.id).toBe("composite-123");
      expect(node.name).toBe("My Blueprint");
      expect(node.type).toBe("composite");
      expect(node.metadata.version).toBe("1.0.0");

      // Should preserve nodes and edges (even with extra props)
      expect(node.children).toBeDefined();
      expect(node.edges).toBeDefined();
      expect(node.children?.length).toBe(1);
      expect(node.edges?.length).toBe(1);

      // Should not have React Flow root properties
      expect(node).not.toHaveProperty("__reactFlowInstance");
      expect(node).not.toHaveProperty("isLayoutReady");
      expect(node).not.toHaveProperty("nodesInitialized");
    });
  });
});
