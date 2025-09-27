import { createFlow } from "#factories";
import {
  hasCycles,
  hasInputs,
  hasOutputs,
  isEdge,
  isEmptyFlow,
  isEntryNode,
  isExitNode,
  isFlow,
  isNode,
  isValidFlow,
} from "#guards";
import { createNodeDefinition } from "@atomiton/nodes/definitions";
import { describe, expect, it } from "vitest";

describe("Type Guards", () => {
  describe("isNode", () => {
    it("should return true for valid node", () => {
      const node = createNodeDefinition({
        name: "Test",
        position: { x: 0, y: 0 },
      });

      expect(isNode(node)).toBe(true);
    });

    it("should return false for invalid objects", () => {
      expect(isNode(null)).toBe(false);
      expect(isNode(undefined)).toBe(false);
      expect(isNode({})).toBe(false);
      expect(isNode({ id: "123" })).toBe(false);
      expect(isNode({ id: "123", name: "test" })).toBe(false);
    });
  });

  describe("isFlow", () => {
    it("should return true for flow with nodes", () => {
      const flow = createFlow({
        name: "Test Flow",
        nodes: [createNodeDefinition({ name: "Node1" })],
      });
      expect(isFlow(flow)).toBe(true);
    });

    it("should return false for empty flow", () => {
      const flow = createFlow({ name: "Empty Flow" });
      expect(isFlow(flow)).toBe(false);
    });

    it("should return false for leaf nodes", () => {
      const node = createNodeDefinition({
        name: "Test",
        position: { x: 0, y: 0 },
      });
      expect(isFlow(node)).toBe(false);
    });

    it("should return false for invalid objects", () => {
      expect(isFlow(null)).toBe(false);
      expect(isFlow({})).toBe(false);
    });
  });

  describe("isNode - additional tests", () => {
    it("should return true for flows (flows are nodes)", () => {
      const flow = createFlow({
        name: "Test Flow",
        nodes: [createNodeDefinition({ name: "Child" })],
      });
      expect(isNode(flow)).toBe(true);
    });

    it("should validate node structure", () => {
      expect(
        isNode({
          id: "123",
          position: { x: 0, y: 0 },
          // Missing other required fields like metadata, parameters, ports
        }),
      ).toBe(false);
    });
  });

  describe("isEdge", () => {
    it("should return true for valid edge", () => {
      const edge = {
        id: "edge-1",
        source: "node1",
        sourceHandle: "out",
        target: "node2",
        targetHandle: "in",
      };
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
      const node1 = createNodeDefinition({
        id: "node1",
        name: "Start",
        position: { x: 0, y: 0 },
      });

      const node2 = createNodeDefinition({
        id: "node2",
        name: "End",
        position: { x: 100, y: 0 },
      });

      const edge = {
        id: "edge-1",
        source: "node1",
        sourceHandle: "out",
        target: "node2",
        targetHandle: "in",
      };

      const flow = createFlow({
        name: "Valid Flow",
        nodes: [node1, node2],
        edges: [edge],
      });

      expect(isValidFlow(flow)).toBe(true);
    });

    it("should return false for flow with invalid edge", () => {
      const node = createNodeDefinition({
        id: "node1",
        name: "Test",
        position: { x: 0, y: 0 },
      });

      const edge = {
        id: "edge-1",
        source: "node1",
        sourceHandle: "out",
        target: "nonexistent",
        targetHandle: "in",
      };

      const flow = createFlow({
        name: "Invalid Flow",
        nodes: [node],
        edges: [edge],
      });

      expect(isValidFlow(flow)).toBe(false);
    });
  });

  describe("hasInputs / hasOutputs", () => {
    it("should check for node ports", () => {
      const nodeWithPorts = createNodeDefinition({
        name: "Process",
        position: { x: 0, y: 0 },
        inputPorts: [
          {
            id: "in",
            name: "Input",
            type: "input",
            dataType: "any",
            required: true,
            multiple: false,
          },
        ],
        outputPorts: [
          {
            id: "out",
            name: "Output",
            type: "output",
            dataType: "any",
            required: false,
            multiple: false,
          },
        ],
      });

      const nodeWithoutPorts = createNodeDefinition({
        name: "Display",
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
      const flow = createFlow({ name: "Empty" });
      expect(isEmptyFlow(flow)).toBe(true);
    });

    it("should return false for flow with nodes", () => {
      const flow = createFlow({
        name: "Not Empty",
        nodes: [
          createNodeDefinition({
            name: "Test",
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
        createNodeDefinition({
          id: "a",
          name: "A",
          position: { x: 0, y: 0 },
        }),
        createNodeDefinition({
          id: "b",
          name: "B",
          position: { x: 0, y: 0 },
        }),
        createNodeDefinition({
          id: "c",
          name: "C",
          position: { x: 0, y: 0 },
        }),
      ];

      const edges = [
        {
          id: "e1",
          source: "a",
          sourceHandle: "out",
          target: "b",
          targetHandle: "in",
        },
        {
          id: "e2",
          source: "b",
          sourceHandle: "out",
          target: "c",
          targetHandle: "in",
        },
        {
          id: "e3",
          source: "c",
          sourceHandle: "out",
          target: "a",
          targetHandle: "in",
        },
      ];

      const flow = createFlow({
        name: "Cyclic Flow",
        nodes,
        edges,
      });

      expect(hasCycles(flow)).toBe(true);
    });

    it("should not detect cycles in DAG", () => {
      const nodes = [
        createNodeDefinition({
          id: "a",
          name: "A",
          position: { x: 0, y: 0 },
        }),
        createNodeDefinition({
          id: "b",
          name: "B",
          position: { x: 0, y: 0 },
        }),
        createNodeDefinition({
          id: "c",
          name: "C",
          position: { x: 0, y: 0 },
        }),
      ];

      const edges = [
        {
          id: "e1",
          source: "a",
          sourceHandle: "out",
          target: "b",
          targetHandle: "in",
        },
        {
          id: "e2",
          source: "b",
          sourceHandle: "out",
          target: "c",
          targetHandle: "in",
        },
      ];

      const flow = createFlow({
        name: "DAG Flow",
        nodes,
        edges,
      });

      expect(hasCycles(flow)).toBe(false);
    });
  });

  describe("isEntryNode / isExitNode", () => {
    it("should identify entry and exit nodes", () => {
      const nodes = [
        createNodeDefinition({
          id: "entry",
          name: "Start",
          position: { x: 0, y: 0 },
        }),
        createNodeDefinition({
          id: "middle",
          name: "Process",
          position: { x: 100, y: 0 },
        }),
        createNodeDefinition({
          id: "exit",
          name: "End",
          position: { x: 200, y: 0 },
        }),
      ];

      const edges = [
        {
          id: "e1",
          source: "entry",
          sourceHandle: "out",
          target: "middle",
          targetHandle: "in",
        },
        {
          id: "e2",
          source: "middle",
          sourceHandle: "out",
          target: "exit",
          targetHandle: "in",
        },
      ];

      const flow = createFlow({
        name: "Linear Flow",
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
