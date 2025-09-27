import { describe, it, expect } from "vitest";
import {
  createFlow,
  createNode,
  createEdge,
  createEmptyFlow,
  createSequentialFlow,
  cloneFlow,
  cloneNode,
} from "#factories";

describe("Factory Functions", () => {
  describe("createFlow", () => {
    it("should create a flow with default values", () => {
      const flow = createFlow({ label: "Test Flow" });

      expect(flow).toMatchObject({
        type: "flow",
        label: "Test Flow",
        version: "1.0.0",
        nodes: [],
        edges: [],
        variables: {},
      });
      expect(flow.id).toBeDefined();
      expect(flow.metadata).toBeDefined();
    });

    it("should create a flow with custom options", () => {
      const nodes = [
        createNode({
          type: "test",
          label: "Test Node",
          position: { x: 0, y: 0 },
        }),
      ];

      const flow = createFlow({
        id: "custom-id",
        label: "Custom Flow",
        version: "2.0.0",
        nodes,
        variables: { foo: "bar" },
      });

      expect(flow.id).toBe("custom-id");
      expect(flow.version).toBe("2.0.0");
      expect(flow.nodes).toEqual(nodes);
      expect(flow.variables).toEqual({ foo: "bar" });
    });
  });

  describe("createNode", () => {
    it("should create a node with required fields", () => {
      const node = createNode({
        type: "processor",
        label: "Process Data",
        position: { x: 100, y: 200 },
      });

      expect(node).toMatchObject({
        type: "processor",
        label: "Process Data",
        position: { x: 100, y: 200 },
        config: {},
      });
      expect(node.id).toBeDefined();
      expect(node.metadata).toBeDefined();
    });

    it("should create a node with ports", () => {
      const node = createNode({
        type: "filter",
        label: "Filter",
        position: { x: 0, y: 0 },
        inputs: [
          {
            id: "in",
            label: "Input",
            type: "any",
            required: true,
          },
        ],
        outputs: [
          {
            id: "out",
            label: "Output",
            type: "any",
          },
        ],
      });

      expect(node.inputs).toHaveLength(1);
      expect(node.outputs).toHaveLength(1);
    });
  });

  describe("createEdge", () => {
    it("should create a edge between nodes", () => {
      const edge = createEdge({
        source: "node1",
        target: "node2",
        sourceHandle: "out",
        targetHandle: "in",
      });

      expect(edge).toMatchObject({
        source: "node1",
        target: "node2",
        sourceHandle: "out",
        targetHandle: "in",
      });
      expect(edge.id).toBeDefined();
    });

    it("should create a edge with label and style", () => {
      const edge = createEdge({
        source: "node1",
        target: "node2",
        sourceHandle: "out",
        targetHandle: "in",
        label: "Data Flow",
        type: "step",
        animated: true,
      });

      expect(edge.label).toBe("Data Flow");
      expect(edge.type).toBe("step");
      expect(edge.animated).toBe(true);
    });
  });

  describe("createEmptyFlow", () => {
    it("should create an empty flow", () => {
      const flow = createEmptyFlow();

      expect(flow.label).toBe("New Flow");
      expect(flow.nodes).toHaveLength(0);
      expect(flow.edges).toHaveLength(0);
    });

    it("should create an empty flow with custom label", () => {
      const flow = createEmptyFlow("My Flow");

      expect(flow.label).toBe("My Flow");
    });
  });

  describe("createSequentialFlow", () => {
    it("should create a sequential flow from nodes", () => {
      const nodes = [
        createNode({
          type: "start",
          label: "Start",
          position: { x: 0, y: 0 },
          outputs: [{ id: "out", label: "Output", type: "any" }],
        }),
        createNode({
          type: "process",
          label: "Process",
          position: { x: 100, y: 0 },
          inputs: [{ id: "in", label: "Input", type: "any" }],
          outputs: [{ id: "out", label: "Output", type: "any" }],
        }),
        createNode({
          type: "end",
          label: "End",
          position: { x: 200, y: 0 },
          inputs: [{ id: "in", label: "Input", type: "any" }],
        }),
      ];

      const flow = createSequentialFlow("Sequential Flow", nodes);

      expect(flow.nodes).toHaveLength(3);
      expect(flow.edges).toHaveLength(2);
      expect(flow.metadata?.entryNodeId).toBe(nodes[0].id);
      expect(flow.metadata?.exitNodeIds).toEqual([nodes[2].id]);
    });
  });

  describe("cloneFlow", () => {
    it("should clone a flow with new IDs", () => {
      const originalFlow = createFlow({
        id: "original",
        label: "Original Flow",
        nodes: [
          createNode({
            type: "test",
            label: "Test",
            position: { x: 0, y: 0 },
          }),
        ],
      });

      const clonedFlow = cloneFlow(originalFlow);

      expect(clonedFlow.id).not.toBe(originalFlow.id);
      expect(clonedFlow.label).toBe(originalFlow.label);
      expect(clonedFlow.nodes).toHaveLength(1);
      expect(clonedFlow.nodes[0].id).not.toBe(originalFlow.nodes[0].id);
    });
  });

  describe("cloneNode", () => {
    it("should clone a node with new ID", () => {
      const originalNode = createNode({
        id: "original",
        type: "processor",
        label: "Original",
        position: { x: 50, y: 50 },
      });

      const clonedNode = cloneNode(originalNode);

      expect(clonedNode.id).not.toBe(originalNode.id);
      expect(clonedNode.type).toBe(originalNode.type);
      expect(clonedNode.label).toBe(originalNode.label);
      expect(clonedNode.position).toEqual(originalNode.position);
    });
  });
});
