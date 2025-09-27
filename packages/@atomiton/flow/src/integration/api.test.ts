import { describe, it, expect } from "vitest";
import {
  createFlow,
  createNode,
  isFlow,
  isNode,
  addNode,
  removeNode,
  pipe,
  compose,
} from "#index";

describe("Flow Package API Integration", () => {
  it("should create and validate a flow", () => {
    const flow = createFlow({ label: "Smoke Test Flow" });

    expect(isFlow(flow)).toBe(true);
    expect(flow.type).toBe("flow");
    expect(flow.label).toBe("Smoke Test Flow");
  });

  it("should create and validate a node", () => {
    const node = createNode({
      type: "processor",
      label: "Test Processor",
      position: { x: 0, y: 0 },
    });

    expect(isNode(node)).toBe(true);
    expect(node.type).toBe("processor");
    expect(node.label).toBe("Test Processor");
  });

  it("should perform basic flow operations", () => {
    const flow = createFlow({ label: "Operations Test" });

    const node1 = createNode({
      type: "input",
      label: "Input",
      position: { x: 0, y: 0 },
    });

    const node2 = createNode({
      type: "output",
      label: "Output",
      position: { x: 100, y: 0 },
    });

    // Add nodes using pipe
    const flowWithNodes = pipe(addNode(node1), addNode(node2))(flow);

    expect(flowWithNodes.nodes).toHaveLength(2);
    expect(flowWithNodes.nodes[0].id).toBe(node1.id);
    expect(flowWithNodes.nodes[1].id).toBe(node2.id);

    // Remove a node
    const flowWithOneNode = removeNode(node1.id)(flowWithNodes);
    expect(flowWithOneNode.nodes).toHaveLength(1);
    expect(flowWithOneNode.nodes[0].id).toBe(node2.id);
  });

  it("should compose functions correctly", () => {
    const flow = createFlow({ label: "Compose Test" });

    const node = createNode({
      type: "test",
      label: "Test Node",
      position: { x: 50, y: 50 },
    });

    // Compose applies functions right-to-left
    const transform = compose(
      removeNode("non-existent"), // This should be no-op
      addNode(node),
    );

    const result = transform(flow);
    expect(result.nodes).toHaveLength(1);
    expect(result.nodes[0].id).toBe(node.id);
  });
});
