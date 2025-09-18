/**
 * createNode Resilience Test - Testing handling of malformed and messy data
 */

import { describe, expect, it } from "vitest";
import { createNode } from "../createNode";

describe("createNode Resilience Tests", () => {
  describe("Handling undefined values", () => {
    it("handles all undefined optional fields", () => {
      const node = createNode({
        type: "composite",
        name: "Test Node",
        id: undefined,
        description: undefined,
        category: undefined,
        version: undefined,
        nodes: undefined,
        edges: undefined,
        variables: undefined,
        settings: undefined,
        metadata: undefined,
      });

      expect(node.id).toBeDefined(); // Should generate ID
      expect(node.name).toBe("Test Node");
      expect(node.description).toBe("");
      expect(node.category).toBe("user");
      expect(node.version).toBe("1.0.0");
      expect(node.nodes).toEqual([]);
      expect(node.edges).toEqual([]);
      expect(node.variables).toEqual({});
      expect(node.settings).toBeDefined();
      expect(node.metadata).toBeDefined();
    });

    it("handles partial metadata with undefined fields", () => {
      const node = createNode({
        name: "Partial Metadata Node",
        metadata: {
          icon: undefined,
          color: undefined,
          tags: undefined,
          variant: "test-variant",
        },
      });

      expect(node.metadata?.variant).toBe("test-variant");
      expect(node.metadata?.icon).toBeUndefined();
      expect(node.metadata?.color).toBeUndefined();
      expect(node.metadata?.tags).toBeUndefined();
      expect(node.metadata?.created).toBeDefined();
      expect(node.metadata?.modified).toBeDefined();
    });
  });

  describe("Handling extra/unknown properties", () => {
    it("ignores extra properties at root level", () => {
      const input: any = {
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

    it("preserves extra properties in metadata", () => {
      const node = createNode({
        name: "Custom Metadata Node",
        metadata: {
          variant: "custom",
          customField: "value",
          nestedCustom: {
            foo: "bar",
            baz: 42,
          },
        },
      });

      expect(node.metadata?.variant).toBe("custom");
      expect(node.metadata?.customField).toBe("value");
      expect(node.metadata?.nestedCustom).toEqual({
        foo: "bar",
        baz: 42,
      });
    });

    it("handles nodes with React Flow properties", () => {
      const messyNodes: any[] = [
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
        nodes: messyNodes,
      });

      // Should pass through nodes as-is
      expect(node.nodes).toEqual(messyNodes);
    });

    it("handles edges with extra properties", () => {
      const messyEdges: any[] = [
        {
          id: "edge-1",
          source: "node-1",
          target: "node-2",
          // React Flow edge properties
          selected: true,
          animated: true,
          markerEnd: { type: "arrowclosed" },
          interactionWidth: 20,
        },
      ];

      const node = createNode({
        type: "composite",
        name: "Composite with Messy Edges",
        edges: messyEdges,
      });

      // Should pass through edges as-is
      expect(node.edges).toEqual(messyEdges);
    });
  });

  describe("Handling null values", () => {
    it("treats null as undefined for optional fields", () => {
      const input: any = {
        name: "Null Fields Node",
        id: null,
        description: null,
        category: null,
        version: null,
        nodes: null,
        edges: null,
        variables: null,
      };

      const node = createNode(input);

      expect(node.id).toBeDefined(); // Should generate ID
      expect(node.description).toBe("");
      expect(node.category).toBe("user");
      expect(node.version).toBe("1.0.0");
      expect(node.nodes).toEqual([]);
      expect(node.edges).toEqual([]);
      expect(node.variables).toEqual({});
    });
  });

  describe("Handling wrong types", () => {
    it("handles string values for array fields", () => {
      const input: any = {
        name: "Wrong Types Node",
        type: "composite",
        nodes: "not-an-array",
        edges: "also-not-an-array",
        variables: "should-be-object",
      };

      const node = createNode(input);

      // Should use defaults when wrong types are provided
      expect(Array.isArray(node.nodes)).toBe(false);
      expect(node.nodes).toBe("not-an-array"); // Passes through as-is
      expect(node.edges).toBe("also-not-an-array");
      expect(node.variables).toBe("should-be-object");
    });

    it("handles number values for string fields", () => {
      const input: any = {
        name: "Number Name Node",
        description: 12345,
        category: 999,
      };

      const node = createNode(input);

      expect(node.description).toBe(12345); // Passes through as-is
      expect(node.category).toBe(999); // Passes through as-is
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
      const input: any = {
        name: "Falsy Values Node",
        metadata: {
          count: 0,
          enabled: false,
          value: "",
        },
      };

      const node = createNode(input);

      expect(node.metadata?.count).toBe(0);
      expect(node.metadata?.enabled).toBe(false);
      expect(node.metadata?.value).toBe("");
    });
  });

  describe("Real-world messy editor data", () => {
    it("handles typical editor state with React Flow properties", () => {
      const editorState: any = {
        id: "composite-123",
        name: "My Blueprint",
        type: "composite",
        version: "1.0.0",
        // React Flow viewport state
        __reactFlowInstance: {
          viewport: { x: 0, y: 0, zoom: 1 },
        },
        nodes: [
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
          },
        ],
        edges: [
          {
            id: "e1-2",
            source: "1",
            target: "2",
            // React Flow edge state
            animated: true,
            selected: false,
            style: { stroke: "#f6ab6c", strokeWidth: 2 },
            type: "smoothstep",
            markerEnd: { type: "arrowclosed", color: "#f6ab6c" },
            sourceX: 430,
            sourceY: 170,
            targetX: 250,
            targetY: 240,
            interactionWidth: 20,
            focusable: true,
            updatable: true,
            deletable: true,
            data: { onDelete: "function" },
          },
        ],
        // UI state that might be present
        isLayoutReady: true,
        nodesInitialized: true,
        edgesInitialized: true,
      };

      const node = createNode(editorState);

      // Should create a valid node structure
      expect(node.id).toBe("composite-123");
      expect(node.name).toBe("My Blueprint");
      expect(node.type).toBe("composite");
      expect(node.version).toBe("1.0.0");

      // Should preserve nodes and edges (even with extra props)
      expect(node.nodes).toBeDefined();
      expect(node.edges).toBeDefined();
      expect(node.nodes?.length).toBe(1);
      expect(node.edges?.length).toBe(1);

      // Should not have React Flow root properties
      expect(node).not.toHaveProperty("__reactFlowInstance");
      expect(node).not.toHaveProperty("isLayoutReady");
      expect(node).not.toHaveProperty("nodesInitialized");
    });
  });
});
