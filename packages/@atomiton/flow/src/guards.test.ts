import { describe, expect, it } from "vitest";
import { createEdge, createFlow, createNode } from "#factories";
import {
  hasCycles,
  hasInputs,
  hasOutputs,
  isEdge,
  isEmptyFlow,
  isEntryNode,
  isExecutable,
  isExitNode,
  isFlow,
  isNode,
  isValidFlow,
} from "#guards";

describe("Type Guards", () => {
  describe("isExecutable", () => {
    it("should return true for valid executable", () => {
      const node = createNode({
        type: "test",
        label: "Test",
        position: { x: 0, y: 0 },
      });

      expect(isExecutable(node)).toBe(true);
    });

    it("should return false for invalid objects", () => {
      expect(isExecutable(null)).toBe(false);
      expect(isExecutable(undefined)).toBe(false);
      expect(isExecutable({})).toBe(false);
      expect(isExecutable({ id: "123" })).toBe(false);
      expect(isExecutable({ id: "123", type: "test" })).toBe(false);
    });
  });

  describe("isFlow", () => {
    it("should return true for valid flow", () => {
      const flow = createFlow({ label: "Test Flow" });
      expect(isFlow(flow)).toBe(true);
    });

    it("should return false for nodes", () => {
      const node = createNode({
        type: "test",
        label: "Test",
        position: { x: 0, y: 0 },
      });
      expect(isFlow(node)).toBe(false);
    });

    it("should return false for invalid objects", () => {
      expect(isFlow(null)).toBe(false);
      expect(isFlow({})).toBe(false);
    });
  });

  describe("isNode", () => {
    it("should return true for valid node", () => {
      const node = createNode({
        type: "processor",
        label: "Process",
        position: { x: 10, y: 20 },
      });
      expect(isNode(node)).toBe(true);
    });

    it("should return false for flows", () => {
      const flow = createFlow({ label: "Test Flow" });
      expect(isNode(flow)).toBe(false);
    });

    it("should return false for invalid objects", () => {
      expect(isNode(null)).toBe(false);
      expect(isNode({})).toBe(false);
      expect(
        isNode({
          id: "123",
          type: "test",
          version: "1.0.0",
          label: "Test",
          // Missing position and config
        }),
      ).toBe(false);
    });
  });

  describe("isEdge", () => {
    it("should return true for valid edge", () => {
      const edge = createEdge({
        source: "node1",
        sourceHandle: "out",
        target: "node2",
        targetHandle: "in",
      });
      expect(isEdge(edge)).toBe(true);
    });

    it("should return false for invalid objects", () => {
      expect(isEdge(null)).toBe(false);
      expect(isEdge({})).toBe(false);
      expect(
        isEdge({
          id: "123",
          source: { nodeId: "node1" },
          // Missing portId
        }),
      ).toBe(false);
    });
  });

  describe("isValidFlow", () => {
    it("should return true for valid flow", () => {
      const node1 = createNode({
        id: "node1",
        type: "start",
        label: "Start",
        position: { x: 0, y: 0 },
      });

      const node2 = createNode({
        id: "node2",
        type: "end",
        label: "End",
        position: { x: 100, y: 0 },
      });

      const edge = createEdge({
        source: "node1",
        sourceHandle: "out",
        target: "node2",
        targetHandle: "in",
      });

      const flow = createFlow({
        label: "Valid Flow",
        nodes: [node1, node2],
        edges: [edge],
      });

      expect(isValidFlow(flow)).toBe(true);
    });

    it("should return false for flow with invalid edge", () => {
      const node = createNode({
        id: "node1",
        type: "test",
        label: "Test",
        position: { x: 0, y: 0 },
      });

      const edge = createEdge({
        source: "node1",
        sourceHandle: "out",
        target: "nonexistent",
        targetHandle: "in",
      });

      const flow = createFlow({
        label: "Invalid Flow",
        nodes: [node],
        edges: [edge],
      });

      expect(isValidFlow(flow)).toBe(false);
    });
  });

  describe("hasInputs / hasOutputs", () => {
    it("should check for node ports", () => {
      const nodeWithPorts = createNode({
        type: "processor",
        label: "Process",
        position: { x: 0, y: 0 },
        inputs: [{ id: "in", label: "Input", type: "any" }],
        outputs: [{ id: "out", label: "Output", type: "any" }],
      });

      const nodeWithoutPorts = createNode({
        type: "display",
        label: "Display",
        position: { x: 0, y: 0 },
      });

      expect(hasInputs(nodeWithPorts)).toBe(true);
      expect(hasOutputs(nodeWithPorts)).toBe(true);
      expect(hasInputs(nodeWithoutPorts)).toBe(false);
      expect(hasOutputs(nodeWithoutPorts)).toBe(false);
    });
  });

  describe("isEmptyFlow", () => {
    it("should return true for empty flow", () => {
      const flow = createFlow({ label: "Empty" });
      expect(isEmptyFlow(flow)).toBe(true);
    });

    it("should return false for flow with nodes", () => {
      const flow = createFlow({
        label: "Not Empty",
        nodes: [
          createNode({
            type: "test",
            label: "Test",
            position: { x: 0, y: 0 },
          }),
        ],
      });
      expect(isEmptyFlow(flow)).toBe(false);
    });
  });

  describe("hasCycles", () => {
    it("should detect cycles in flow", () => {
      const nodes = [
        createNode({
          id: "a",
          type: "test",
          label: "A",
          position: { x: 0, y: 0 },
        }),
        createNode({
          id: "b",
          type: "test",
          label: "B",
          position: { x: 0, y: 0 },
        }),
        createNode({
          id: "c",
          type: "test",
          label: "C",
          position: { x: 0, y: 0 },
        }),
      ];

      const edges = [
        createEdge({
          source: "a",
          sourceHandle: "out",
          target: "b",
          targetHandle: "in",
        }),
        createEdge({
          source: "b",
          sourceHandle: "out",
          target: "c",
          targetHandle: "in",
        }),
        createEdge({
          source: "c",
          sourceHandle: "out",
          target: "a",
          targetHandle: "in",
        }),
      ];

      const flow = createFlow({
        label: "Cyclic Flow",
        nodes,
        edges,
      });

      expect(hasCycles(flow)).toBe(true);
    });

    it("should not detect cycles in DAG", () => {
      const nodes = [
        createNode({
          id: "a",
          type: "test",
          label: "A",
          position: { x: 0, y: 0 },
        }),
        createNode({
          id: "b",
          type: "test",
          label: "B",
          position: { x: 0, y: 0 },
        }),
        createNode({
          id: "c",
          type: "test",
          label: "C",
          position: { x: 0, y: 0 },
        }),
      ];

      const edges = [
        createEdge({
          source: "a",
          sourceHandle: "out",
          target: "b",
          targetHandle: "in",
        }),
        createEdge({
          source: "b",
          sourceHandle: "out",
          target: "c",
          targetHandle: "in",
        }),
      ];

      const flow = createFlow({
        label: "DAG Flow",
        nodes,
        edges,
      });

      expect(hasCycles(flow)).toBe(false);
    });
  });

  describe("isEntryNode / isExitNode", () => {
    it("should identify entry and exit nodes", () => {
      const nodes = [
        createNode({
          id: "entry",
          type: "start",
          label: "Start",
          position: { x: 0, y: 0 },
        }),
        createNode({
          id: "middle",
          type: "process",
          label: "Process",
          position: { x: 100, y: 0 },
        }),
        createNode({
          id: "exit",
          type: "end",
          label: "End",
          position: { x: 200, y: 0 },
        }),
      ];

      const edges = [
        createEdge({
          source: "entry",
          sourceHandle: "out",
          target: "middle",
          targetHandle: "in",
        }),
        createEdge({
          source: "middle",
          sourceHandle: "out",
          target: "exit",
          targetHandle: "in",
        }),
      ];

      const flow = createFlow({
        label: "Linear Flow",
        nodes,
        edges,
      });

      expect(isEntryNode("entry", flow)).toBe(true);
      expect(isEntryNode("middle", flow)).toBe(false);
      expect(isEntryNode("exit", flow)).toBe(false);

      expect(isExitNode("entry", flow)).toBe(false);
      expect(isExitNode("middle", flow)).toBe(false);
      expect(isExitNode("exit", flow)).toBe(true);
    });
  });
});
