import { describe, expect, it } from "vitest";
import {
  transformToCompositeEdge,
  transformToCompositeEdges,
  transformToCompositeNodeSpec,
  transformToCompositeNodeSpecs,
} from "../transformers";

describe("transformers", () => {
  describe("transformToCompositeNodeSpec", () => {
    it("should transform valid node-like objects", () => {
      const input = {
        id: "test-node",
        name: "Test Node",
        type: "debug",
        category: "testing",
        position: { x: 100, y: 200 },
      };

      const result = transformToCompositeNodeSpec(input);
      expect(result).toEqual({
        id: "test-node",
        name: "Test Node",
        type: "debug",
        category: "testing",
        position: { x: 100, y: 200 },
      });
    });

    it("should provide defaults for missing required fields", () => {
      const input = {
        id: "minimal-node",
        extraProp: "ignored",
      };

      const result = transformToCompositeNodeSpec(input);
      expect(result).not.toBeNull();
      expect(result!.id).toBe("minimal-node");
      expect(result!.name).toBe("Unnamed Node");
      expect(result!.type).toBe("default");
      expect(result!.category).toBe("user");
      expect(result!.position).toEqual({ x: 0, y: 0 });
      expect(result!).not.toHaveProperty("extraProp");
    });

    it("should extract position from various locations", () => {
      // Direct position
      const withDirectPosition = {
        id: "node1",
        position: { x: 50, y: 75 },
      };
      const result1 = transformToCompositeNodeSpec(withDirectPosition);
      expect(result1).not.toBeNull();
      expect(result1!.position).toEqual({ x: 50, y: 75 });

      // Position in settings.ui
      const withNestedPosition = {
        id: "node2",
        settings: {
          ui: {
            position: { x: 150, y: 250 },
          },
        },
      };
      const result2 = transformToCompositeNodeSpec(withNestedPosition);
      expect(result2).not.toBeNull();
      expect(result2!.position).toEqual({ x: 150, y: 250 });

      // No position
      const withoutPosition = { id: "node3" };
      const result3 = transformToCompositeNodeSpec(withoutPosition);
      expect(result3).not.toBeNull();
      expect(result3!.position).toEqual({ x: 0, y: 0 });
    });

    it("should preserve valid optional properties", () => {
      const input = {
        id: "full-node",
        name: "Full Node",
        type: "function",
        category: "logic",
        description: "A test node",
        version: "1.0.0",
        position: { x: 0, y: 0 },
        width: 150,
        height: 100,
        parentId: "parent-node",
        dragHandle: ".drag-handle",
        style: { backgroundColor: "blue" },
        className: "custom-node",
        data: { config: { timeout: 5000 } },
        metadata: { tags: ["test"] },
        inputPorts: [{ id: "input1", type: "string" }],
        outputPorts: [{ id: "output1", type: "string" }],
        settings: { ui: { theme: "dark" } },
      };

      const result = transformToCompositeNodeSpec(input);
      expect(result).not.toBeNull();
      expect(result!.description).toBe("A test node");
      expect(result!.version).toBe("1.0.0");
      expect(result!.width).toBe(150);
      expect(result!.height).toBe(100);
      expect(result!.parentId).toBe("parent-node");
      expect(result!.dragHandle).toBe(".drag-handle");
      expect(result!.style).toEqual({ backgroundColor: "blue" });
      expect(result!.className).toBe("custom-node");
      expect(result!.data).toEqual({ config: { timeout: 5000 } });
      expect(result!.metadata).toEqual({ tags: ["test"] });
      expect(result!.inputPorts).toEqual([{ id: "input1", type: "string" }]);
      expect(result!.outputPorts).toEqual([{ id: "output1", type: "string" }]);
      expect(result!.settings).toEqual({ ui: { theme: "dark" } });
    });

    it("should filter out React Flow specific properties", () => {
      const input = {
        id: "react-flow-node",
        name: "React Flow Node",
        type: "debug",
        position: { x: 0, y: 0 },
        // React Flow properties that should be filtered out
        selected: true,
        dragging: false,
        draggable: true,
        selectable: true,
        connectable: false,
        deletable: true,
        focusable: true,
        zIndex: 10,
        sourcePosition: "right",
        targetPosition: "left",
        hidden: false,
        ariaLabel: "Debug node",
        extent: "parent",
        expandParent: true,
        positionAbsolute: { x: 100, y: 200 },
        measured: { width: 100, height: 50 },
      };

      const result = transformToCompositeNodeSpec(input);
      expect(result).not.toBeNull();
      expect(result!.id).toBe("react-flow-node");
      expect(result!.name).toBe("React Flow Node");
      expect(result!.type).toBe("debug");
      expect(result!.position).toEqual({ x: 0, y: 0 });

      // Should not have React Flow properties
      expect(result!).not.toHaveProperty("selected");
      expect(result!).not.toHaveProperty("dragging");
      expect(result!).not.toHaveProperty("sourcePosition");
      expect(result!).not.toHaveProperty("positionAbsolute");
      expect(result!).not.toHaveProperty("measured");
    });

    it("should handle non-object inputs gracefully", () => {
      expect(transformToCompositeNodeSpec(null)).toBeNull();
      expect(transformToCompositeNodeSpec("string")).toBeNull();
      expect(transformToCompositeNodeSpec([])).toBeNull();
    });
  });

  describe("transformToCompositeEdge", () => {
    it("should transform valid edge-like objects", () => {
      const input = {
        id: "test-edge",
        source: "node1",
        target: "node2",
        sourceHandle: "output1",
        targetHandle: "input1",
      };

      const result = transformToCompositeEdge(input);
      expect(result).toEqual({
        id: "test-edge",
        source: "node1",
        target: "node2",
        sourceHandle: "output1",
        targetHandle: "input1",
      });
    });

    it("should provide defaults for missing required fields", () => {
      const input = {
        extraProp: "ignored",
      };

      const result = transformToCompositeEdge(input);
      expect(result).not.toBeNull();
      expect(result!.id).toMatch(/^edge-/); // Generated ID
      expect(result!.source).toBe("");
      expect(result!.target).toBe("");
      expect(result!).not.toHaveProperty("extraProp");
    });

    it("should preserve valid optional properties", () => {
      const input = {
        id: "full-edge",
        source: "node1",
        target: "node2",
        sourceHandle: "out",
        targetHandle: "in",
        type: "smoothstep",
        animated: true,
        style: { stroke: "red", strokeWidth: 2 },
        data: { label: "Connection" },
      };

      const result = transformToCompositeEdge(input);
      expect(result).not.toBeNull();
      expect(result!.sourceHandle).toBe("out");
      expect(result!.targetHandle).toBe("in");
      expect(result!.type).toBe("smoothstep");
      expect(result!.animated).toBe(true);
      expect(result!.style).toEqual({ stroke: "red", strokeWidth: 2 });
      expect(result!.data).toEqual({ label: "Connection" });
    });

    it("should filter out React Flow specific properties", () => {
      const input = {
        id: "react-flow-edge",
        source: "node1",
        target: "node2",
        // React Flow properties that should be filtered out
        selected: true,
        markerEnd: { type: "arrowclosed" },
        markerStart: { type: "arrow" },
        pathOptions: { curvature: 0.5 },
        interactionWidth: 20,
        focusable: true,
        updatable: true,
        deletable: false,
        label: "Edge Label",
        labelStyle: { fill: "white" },
        labelShowBg: true,
        labelBgStyle: { fill: "black" },
      };

      const result = transformToCompositeEdge(input);
      expect(result).not.toBeNull();
      expect(result!.id).toBe("react-flow-edge");
      expect(result!.source).toBe("node1");
      expect(result!.target).toBe("node2");

      // Should not have React Flow properties
      expect(result!).not.toHaveProperty("selected");
      expect(result!).not.toHaveProperty("markerEnd");
      expect(result!).not.toHaveProperty("pathOptions");
      expect(result!).not.toHaveProperty("interactionWidth");
      expect(result!).not.toHaveProperty("label");
      expect(result!).not.toHaveProperty("labelStyle");
    });

    it("should handle non-object inputs gracefully", () => {
      expect(transformToCompositeEdge(null)).toBeNull();
      expect(transformToCompositeEdge("string")).toBeNull();
      expect(transformToCompositeEdge([])).toBeNull();
    });
  });

  describe("transformToCompositeNodeSpecs", () => {
    it("should transform array of valid nodes", () => {
      const input = [
        {
          id: "node1",
          name: "Node 1",
          type: "input",
          position: { x: 0, y: 0 },
        },
        {
          id: "node2",
          name: "Node 2",
          type: "output",
          position: { x: 200, y: 0 },
        },
      ];

      const result = transformToCompositeNodeSpecs(input);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("node1");
      expect(result[0].name).toBe("Node 1");
      expect(result[1].id).toBe("node2");
      expect(result[1].name).toBe("Node 2");
    });

    it("should handle mixed array with valid and invalid elements", () => {
      const input = [
        { id: "valid1", name: "Valid 1", type: "debug" },
        null,
        "string-element",
        { id: "valid2", name: "Valid 2", type: "log" },
        undefined,
        123,
        { /* incomplete object */ id: "partial" },
      ];

      const result = transformToCompositeNodeSpecs(input);
      expect(result).toHaveLength(7); // All elements are processed

      // Valid objects
      expect(result[0].id).toBe("valid1");
      expect(result[3].id).toBe("valid2");
      expect(result[6].id).toBe("partial");

      // Invalid elements become generated nodes with predictable pattern
      expect(result[1].id).toMatch(/^generated-node-1$/); // null
      expect(result[2].id).toMatch(/^generated-node-2$/); // string
      expect(result[4].id).toMatch(/^generated-node-4$/); // undefined
      expect(result[5].id).toMatch(/^generated-node-5$/); // number
    });

    it("should handle empty array", () => {
      expect(transformToCompositeNodeSpecs([])).toEqual([]);
    });

    it("should handle non-array input", () => {
      expect(transformToCompositeNodeSpecs(null)).toEqual([]);
      expect(transformToCompositeNodeSpecs("not-array")).toEqual([]);
      expect(transformToCompositeNodeSpecs({})).toEqual([]);
    });
  });

  describe("transformToCompositeEdges", () => {
    it("should transform array of valid edges", () => {
      const input = [
        { id: "edge1", source: "node1", target: "node2" },
        { id: "edge2", source: "node2", target: "node3", animated: true },
      ];

      const result = transformToCompositeEdges(input);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("edge1");
      expect(result[0].source).toBe("node1");
      expect(result[0].target).toBe("node2");
      expect(result[1].id).toBe("edge2");
      expect(result[1].animated).toBe(true);
    });

    it("should handle mixed array with valid and invalid elements", () => {
      const input = [
        { id: "valid1", source: "node1", target: "node2" },
        null,
        "string-element",
        { id: "valid2", source: "node2", target: "node3" },
        undefined,
        { /* incomplete object */ id: "partial" },
      ];

      const result = transformToCompositeEdges(input);
      expect(result).toHaveLength(6); // All elements are processed

      // Valid objects
      expect(result[0].id).toBe("valid1");
      expect(result[3].id).toBe("valid2");
      expect(result[5].id).toBe("partial");

      // Invalid elements become generated edges with predictable pattern
      expect(result[1].id).toMatch(/^generated-edge-1$/); // null
      expect(result[2].id).toMatch(/^generated-edge-2$/); // string
      expect(result[4].id).toMatch(/^generated-edge-4$/); // undefined
    });

    it("should handle empty array", () => {
      expect(transformToCompositeEdges([])).toEqual([]);
    });

    it("should handle non-array input", () => {
      expect(transformToCompositeEdges(null)).toEqual([]);
      expect(transformToCompositeEdges("not-array")).toEqual([]);
      expect(transformToCompositeEdges({})).toEqual([]);
    });
  });
});
