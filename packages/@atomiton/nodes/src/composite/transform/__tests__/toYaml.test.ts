import { describe, expect, it } from "vitest";
import { fromYaml } from "../fromYaml";
import { toYaml } from "../toYaml";

describe("toYaml resilience", () => {
  describe("handling messy editor objects", () => {
    it("should ignore React Flow properties on nodes", () => {
      const messyComposite = {
        id: "test-composite",
        name: "Test Composite",
        type: "composite",
        nodes: [
          {
            id: "node-1",
            type: "debug",
            position: { x: 100, y: 200 },
            // React Flow properties that should be ignored
            selected: true,
            draggable: false,
            selectable: true,
            connectable: false,
            deletable: true,
            focusable: true,
            hidden: false,
            dragging: false,
            resizing: true,
            zIndex: 10,
            ariaLabel: "Debug Node",
            sourcePosition: "right",
            targetPosition: "left",
            parentNode: "parent-1",
            expandParent: true,
            extent: "parent",
            positionAbsolute: { x: 150, y: 250 },
            measured: { width: 100, height: 50 },
            // Valid properties that should be kept
            data: { message: "Hello" },
            width: 100,
            height: 50,
          },
        ],
        edges: [
          {
            id: "edge-1",
            source: "node-1",
            target: "node-2",
            // React Flow properties that should be ignored
            selected: true,
            markerEnd: { type: "arrowclosed" },
            markerStart: { type: "arrow" },
            interactionWidth: 20,
            focusable: true,
            updatable: true,
            // Valid properties that should be kept
            animated: true,
            style: { stroke: "red" },
          },
        ],
      };

      const result = toYaml(messyComposite);
      if (!result.success) {
        console.error("toYaml failed:", result.errors);
      }
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      // Parse the YAML back to verify it's clean
      const parsed = fromYaml(result.data!);
      expect(parsed.success).toBe(true);

      const cleanNode = parsed.data!.nodes[0];
      // Should keep valid properties
      expect(cleanNode.id).toBe("node-1");
      expect(cleanNode.type).toBe("debug");
      expect(cleanNode.position).toEqual({ x: 100, y: 200 });
      expect(cleanNode.data).toEqual({ message: "Hello" });
      expect(cleanNode.width).toBe(100);
      expect(cleanNode.height).toBe(50);

      // Should not have React Flow properties
      expect(cleanNode).not.toHaveProperty("selected");
      expect(cleanNode).not.toHaveProperty("draggable");
      expect(cleanNode).not.toHaveProperty("dragging");
      expect(cleanNode).not.toHaveProperty("sourcePosition");
      expect(cleanNode).not.toHaveProperty("positionAbsolute");

      const cleanEdge = parsed.data!.edges[0];
      // Should keep valid properties
      expect(cleanEdge.id).toBe("edge-1");
      expect(cleanEdge.source).toBe("node-1");
      expect(cleanEdge.target).toBe("node-2");
      expect(cleanEdge.animated).toBe(true);
      expect(cleanEdge.style).toEqual({ stroke: "red" });

      // Should not have React Flow properties
      expect(cleanEdge).not.toHaveProperty("selected");
      expect(cleanEdge).not.toHaveProperty("markerEnd");
      expect(cleanEdge).not.toHaveProperty("interactionWidth");
    });

    it("should handle deeply nested extra properties", () => {
      const messyComposite = {
        id: "nested-test",
        name: "Nested Test",
        type: "composite",
        // Extra top-level properties that should be ignored
        __reactFlowInstance: { zoom: 1.5 },
        viewport: { x: 0, y: 0, zoom: 1 },
        isLayoutReady: true,
        nodes: [
          {
            id: "node-1",
            type: "function",
            position: { x: 0, y: 0 },
            data: {
              label: "Function Node",
              // Nested data should be preserved as-is
              config: {
                timeout: 5000,
                retries: 3,
              },
              // Extra nested properties are kept in data
              __internal: {
                renderCount: 10,
                lastUpdate: "2024-01-01",
              },
            },
          },
        ],
        edges: [],
      };

      const result = toYaml(messyComposite);
      expect(result.success).toBe(true);

      const parsed = fromYaml(result.data!);
      expect(parsed.success).toBe(true);

      // Should not have extra top-level properties
      expect(parsed.data).not.toHaveProperty("__reactFlowInstance");
      expect(parsed.data).not.toHaveProperty("viewport");
      expect(parsed.data).not.toHaveProperty("isLayoutReady");

      // Should preserve nested data structure
      const nodeData = parsed.data!.nodes[0].data;
      expect(nodeData).toBeDefined();
      expect(nodeData!.label).toBe("Function Node");
      expect(nodeData!.config).toEqual({ timeout: 5000, retries: 3 });
      expect(nodeData!.__internal).toEqual({
        renderCount: 10,
        lastUpdate: "2024-01-01",
      });
    });

    it("should provide defaults for missing required fields", () => {
      const minimalComposite = {
        // Missing type (should default to "composite")
        id: "minimal",
        name: "Minimal",
      };

      const result = toYaml(minimalComposite);
      expect(result.success).toBe(true);

      const parsed = fromYaml(result.data!);
      expect(parsed.success).toBe(true);
      expect(parsed.data!.type).toBe("composite");
      expect(parsed.data!.nodes).toEqual([]);
      expect(parsed.data!.edges).toEqual([]);
    });

    it("should handle nodes without positions gracefully", () => {
      const compositeWithoutPositions = {
        id: "no-positions",
        name: "No Positions",
        type: "composite",
        nodes: [
          {
            id: "node-1",
            type: "input",
            // No position property
          },
          {
            id: "node-2",
            type: "output",
            position: null, // Null position
          },
          {
            id: "node-3",
            type: "process",
            position: { x: 300 }, // Partial position
          },
        ],
        edges: [],
      };

      const result = toYaml(compositeWithoutPositions);
      expect(result.success).toBe(true);

      const parsed = fromYaml(result.data!);
      expect(parsed.success).toBe(true);

      // Should provide default positions for missing ones
      expect(parsed.data!.nodes[0].position).toEqual({ x: 0, y: 0 });
      expect(parsed.data!.nodes[1].position).toEqual({ x: 0, y: 0 });
      expect(parsed.data!.nodes[2].position).toEqual({ x: 0, y: 0 });
    });

    it("should handle malformed edges gracefully", () => {
      const compositeWithMalformedEdges = {
        id: "malformed-edges",
        name: "Malformed Edges",
        type: "composite",
        nodes: [
          { id: "node-1", type: "input", position: { x: 0, y: 0 } },
          { id: "node-2", type: "output", position: { x: 200, y: 0 } },
        ],
        edges: [
          {
            id: "edge-1",
            source: "node-1",
            target: "node-2",
          },
          {
            // Edge with extra React Flow properties
            id: "edge-2",
            source: "node-1",
            target: "node-2",
            type: "smoothstep",
            pathOptions: { curvature: 0.5 },
            labelStyle: { fill: "white" },
            labelShowBg: true,
            labelBgStyle: { fill: "black" },
          },
          {
            // Edge with missing required fields (should be filtered out in validation)
            id: "edge-3",
            // Missing source and target
          },
        ],
      };

      const result = toYaml(compositeWithMalformedEdges);
      expect(result.success).toBe(true);

      const parsed = fromYaml(result.data!);
      expect(parsed.success).toBe(true);

      // Should keep valid edges
      expect(parsed.data!.edges[0]).toEqual({
        id: "edge-1",
        source: "node-1",
        target: "node-2",
      });

      // Should clean extra properties but keep valid ones
      expect(parsed.data!.edges[1].id).toBe("edge-2");
      expect(parsed.data!.edges[1].type).toBe("smoothstep");
      expect(parsed.data!.edges[1]).not.toHaveProperty("pathOptions");
      expect(parsed.data!.edges[1]).not.toHaveProperty("labelStyle");

      // Edge with missing fields still gets included (validation happens separately)
      expect(parsed.data!.edges[2]).toEqual({
        id: "edge-3",
        source: undefined,
        target: undefined,
      });
    });

    it("should handle arrays with non-object elements", () => {
      const compositeWithBadArrays = {
        id: "bad-arrays",
        name: "Bad Arrays",
        type: "composite",
        nodes: [
          { id: "node-1", type: "debug", position: { x: 0, y: 0 } },
          null, // Null element
          undefined, // Undefined element
          "string-node", // String element
          123, // Number element
          { id: "node-2", type: "log", position: { x: 100, y: 0 } },
        ],
        edges: [
          { id: "edge-1", source: "node-1", target: "node-2" },
          false, // Boolean element
          [], // Array element
        ],
      };

      const result = toYaml(compositeWithBadArrays);
      expect(result.success).toBe(true);

      const parsed = fromYaml(result.data!);
      expect(parsed.success).toBe(true);

      // Should only include valid object nodes
      expect(parsed.data!.nodes).toHaveLength(6); // Non-objects become empty objects
      expect(parsed.data!.nodes[0].id).toBe("node-1");
      expect(parsed.data!.nodes[5].id).toBe("node-2");

      // Should only include valid object edges
      expect(parsed.data!.edges).toHaveLength(3); // Non-objects become empty objects
      expect(parsed.data!.edges[0].id).toBe("edge-1");
    });
  });

  describe("validation with messy objects", () => {
    it("should validate after cleaning", () => {
      const messyButValid = {
        id: "valid-composite",
        name: "Valid Composite",
        type: "composite",
        __internal: "should be ignored",
        nodes: [
          {
            id: "start",
            type: "trigger",
            position: { x: 0, y: 0 },
            selected: true, // Should be ignored
          },
        ],
        edges: [],
      };

      const result = toYaml(messyButValid, { validateResult: true });
      expect(result.success).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it("should catch validation errors in cleaned data", () => {
      const messyAndInvalid = {
        // Missing required fields
        nodes: [
          {
            // Node without id
            type: "debug",
            position: { x: 0, y: 0 },
          },
        ],
      };

      const result = toYaml(messyAndInvalid, { validateResult: true });
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });
  });
});
