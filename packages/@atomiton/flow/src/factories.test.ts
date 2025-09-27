import {
  cloneEdge,
  cloneFlow,
  cloneNode,
  createEmptyFlow,
  createFlow,
  createSequentialFlow,
} from "#factories";
import { createNodeDefinition } from "@atomiton/nodes/definitions";
import { describe, expect, it } from "vitest";

describe("Factory Functions", () => {
  describe("createFlow", () => {
    it("should create a flow with default values", () => {
      const flow = createFlow({ name: "Test Flow" });

      expect(flow).toMatchObject({
        name: "Test Flow",
        type: "group",
        metadata: {
          category: "group",
        },
      });
      expect(flow.id).toBeDefined();
      expect(flow.nodes).toBeUndefined();
      expect(flow.edges).toBeUndefined();
    });

    it("should create a flow with custom options", () => {
      const nodes = [
        createNodeDefinition({
          name: "Test Node",
          position: { x: 0, y: 0 },
        }),
      ];

      const edges = [
        {
          id: "edge-1",
          source: nodes[0].id,
          target: nodes[0].id,
        },
      ];

      const flow = createFlow({
        id: "custom-id",
        name: "Custom Flow",
        nodes,
        edges,
      });

      expect(flow.id).toBe("custom-id");
      expect(flow.name).toBe("Custom Flow");
      expect(flow.nodes).toEqual(nodes);
      expect(flow.edges).toEqual(edges);
    });
  });

  describe("createNodeDefinition", () => {
    it("should create a node with required fields", () => {
      const node = createNodeDefinition({
        name: "Process Data",
        position: { x: 100, y: 200 },
      });

      expect(node).toMatchObject({
        name: "Process Data",
        position: { x: 100, y: 200 },
      });
      expect(node.id).toBeDefined();
      expect(node.metadata).toBeDefined();
      expect(node.parameters).toBeDefined();
    });

    it("should create a node with ports", () => {
      const node = createNodeDefinition({
        name: "Filter",
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

      expect(node.inputPorts).toHaveLength(1);
      expect(node.outputPorts).toHaveLength(1);
    });
  });

  describe("cloneEdge", () => {
    it("should clone an edge with a new ID", () => {
      const originalEdge = {
        id: "edge-1",
        source: "node1",
        target: "node2",
        sourceHandle: "out",
        targetHandle: "in",
      };

      const clonedEdge = cloneEdge(originalEdge);

      expect(clonedEdge).toMatchObject({
        source: "node1",
        target: "node2",
        sourceHandle: "out",
        targetHandle: "in",
      });
      expect(clonedEdge.id).not.toBe(originalEdge.id);
    });

    it("should clone an edge with custom ID", () => {
      const originalEdge = {
        id: "edge-1",
        source: "node1",
        target: "node2",
        type: "step" as const,
        animated: true,
      };

      const clonedEdge = cloneEdge(originalEdge, "custom-edge-id");

      expect(clonedEdge.id).toBe("custom-edge-id");
      expect(clonedEdge.type).toBe("step");
      expect(clonedEdge.animated).toBe(true);
    });
  });

  describe("createEmptyFlow", () => {
    it("should create an empty flow", () => {
      const flow = createEmptyFlow();

      expect(flow.name).toBe("New Flow");
      expect(flow.nodes).toBeUndefined();
      expect(flow.edges).toBeUndefined();
    });

    it("should create an empty flow with custom name", () => {
      const flow = createEmptyFlow("My Flow");

      expect(flow.name).toBe("My Flow");
    });
  });

  describe("createSequentialFlow", () => {
    it("should create a sequential flow from nodes", () => {
      const nodes = [
        createNodeDefinition({
          name: "Start",
          position: { x: 0, y: 0 },
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
        }),
        createNodeDefinition({
          name: "Process",
          position: { x: 100, y: 0 },
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
        }),
        createNodeDefinition({
          name: "End",
          position: { x: 200, y: 0 },
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
        }),
      ];

      const flow = createSequentialFlow("Sequential Flow", nodes);

      expect(flow.nodes).toHaveLength(3);
      expect(flow.edges).toHaveLength(2);
      // Entry/exit nodes are no longer stored in metadata
      expect(flow.name).toBe("Sequential Flow");
    });
  });

  describe("cloneFlow", () => {
    it("should clone a flow with new IDs", () => {
      const originalFlow = createFlow({
        id: "original",
        name: "Original Flow",
        nodes: [
          createNodeDefinition({
            name: "Test",
            position: { x: 0, y: 0 },
          }),
        ],
      });

      const clonedFlow = cloneFlow(originalFlow);

      expect(clonedFlow.id).not.toBe(originalFlow.id);
      expect(clonedFlow.name).toBe("Original Flow (Copy)");
      expect(clonedFlow.nodes).toHaveLength(1);
      expect(clonedFlow.nodes![0].id).not.toBe(originalFlow.nodes![0].id);
    });
  });

  describe("cloneNode", () => {
    it("should clone a node with new ID", () => {
      const originalNode = createNodeDefinition({
        id: "original",
        name: "Original",
        position: { x: 50, y: 50 },
      });

      const clonedNode = cloneNode(originalNode);

      expect(clonedNode.id).not.toBe(originalNode.id);
      expect(clonedNode.name).toBe(originalNode.name);
      expect(clonedNode.position).toEqual(originalNode.position);
    });
  });
});
