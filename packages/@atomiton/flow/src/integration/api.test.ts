import {
  addNode,
  compose,
  createFlow,
  isFlow,
  isNode,
  pipe,
  removeNode,
} from "#index";
import { createNodeDefinition } from "@atomiton/nodes/definitions";
import { describe, expect, it } from "vitest";

describe("Flow Package API Integration", () => {
  it("should create and validate a flow", () => {
    const flow = createFlow({
      name: "Smoke Test Flow",
      nodes: [createNodeDefinition({ name: "Child" })],
    });

    expect(isFlow(flow)).toBe(true);
    expect(flow.metadata.type).toBe("group");
    expect(flow.name).toBe("Smoke Test Flow");
  });

  it("should create and validate a node", () => {
    const node = createNodeDefinition({
      name: "Test Processor",
      position: { x: 0, y: 0 },
    });

    expect(isNode(node)).toBe(true);
    expect(node.name).toBe("Test Processor");
  });

  it("should perform basic flow operations", () => {
    const flow = createFlow({ name: "Operations Test" });

    const node1 = createNodeDefinition({
      name: "Input",
      position: { x: 0, y: 0 },
    });

    const node2 = createNodeDefinition({
      name: "Output",
      position: { x: 100, y: 0 },
    });

    // Add nodes using pipe
    const flowWithNodes = pipe(addNode(node1), addNode(node2))(flow);

    expect(flowWithNodes.nodes).toHaveLength(2);
    expect(flowWithNodes.nodes![0].id).toBe(node1.id);
    expect(flowWithNodes.nodes![1].id).toBe(node2.id);

    // Remove a node
    const flowWithOneNode = removeNode(node1.id)(flowWithNodes);
    expect(flowWithOneNode.nodes).toHaveLength(1);
    expect(flowWithOneNode.nodes![0].id).toBe(node2.id);
  });

  it("should compose functions correctly", () => {
    const flow = createFlow({ name: "Compose Test" });

    const node = createNodeDefinition({
      name: "Test Node",
      position: { x: 50, y: 50 },
    });

    // Compose applies functions right-to-left
    const transform = compose(
      removeNode("non-existent"), // This should be no-op
      addNode(node),
    );

    const result = transform(flow);
    expect(result.nodes).toHaveLength(1);
    expect(result.nodes![0].id).toBe(node.id);
  });
});
