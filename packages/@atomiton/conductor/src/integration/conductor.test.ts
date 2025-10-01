import { createConductor } from "#index";
import { createNodeDefinition } from "@atomiton/nodes/definitions";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("Conductor Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Node Type Detection", () => {
    it("should identify atomic nodes (nodes without children)", () => {
      const atomicNode = createNodeDefinition({
        id: "node-1",
        type: "processor",
        version: "1.0.0",
        name: "Test Processor",
        position: { x: 0, y: 0 },
        metadata: {
          id: "processor",
          name: "Processor",
          author: "Test",
          description: "Test processor",
          category: "utility",
          icon: "code-2",
        },
        parameters: {},
        inputPorts: [],
        outputPorts: [],
      });

      // Direct check following architecture pattern
      expect(atomicNode.nodes).toBeUndefined();
      expect(!atomicNode.nodes || atomicNode.nodes.length === 0).toBe(true);
    });

    it("should identify composite nodes (nodes with children)", () => {
      const childNode = createNodeDefinition({
        id: "child-1",
        type: "processor",
        version: "1.0.0",
        parentId: "flow-1",
        name: "Child Node",
        position: { x: 100, y: 100 },
        metadata: {
          id: "child",
          name: "Child",
          author: "Test",
          description: "Test child",
          category: "utility",
          icon: "code-2",
        },
        parameters: {},
        inputPorts: [],
        outputPorts: [],
      });

      const compositeNode = createNodeDefinition({
        id: "flow-1",
        type: "flow",
        version: "1.0.0",
        name: "Test Flow",
        position: { x: 0, y: 0 },
        metadata: {
          id: "flow",
          name: "Flow",
          author: "Test",
          description: "Test flow",
          category: "group",
          icon: "git-branch",
        },
        parameters: {},
        inputPorts: [],
        outputPorts: [],
        nodes: [childNode],
        edges: [],
      });

      // Direct check following architecture pattern
      expect(compositeNode.nodes).toBeDefined();
      expect(compositeNode.nodes && compositeNode.nodes.length > 0).toBe(true);
      expect(compositeNode.nodes?.length).toBe(1);
    });
  });

  describe("Conductor Execution", () => {
    it("should create a conductor instance", () => {
      const conductor = createConductor();
      expect(conductor).toBeDefined();
      expect(conductor.execute).toBeInstanceOf(Function);
    });

    it("should detect cycles in composite nodes", async () => {
      const conductor = createConductor();

      const child1 = createNodeDefinition({
        id: "child-1",
        type: "processor",
        version: "1.0.0",
        parentId: "flow-1",
        name: "First Child",
        position: { x: 100, y: 100 },
        metadata: {
          id: "child1",
          name: "First Child",
          author: "Test",
          description: "First child node",
          category: "utility",
          icon: "code-2",
        },
        parameters: {},
        inputPorts: [],
        outputPorts: [],
      });

      const child2 = createNodeDefinition({
        id: "child-2",
        type: "processor",
        version: "1.0.0",
        parentId: "flow-1",
        name: "Second Child",
        position: { x: 200, y: 100 },
        metadata: {
          id: "child2",
          name: "Second Child",
          author: "Test",
          description: "Second child node",
          category: "utility",
          icon: "code-2",
        },
        parameters: {},
        inputPorts: [],
        outputPorts: [],
      });

      const cyclicNode = createNodeDefinition({
        id: "flow-1",
        type: "flow",
        version: "1.0.0",
        name: "Cyclic Flow",
        position: { x: 0, y: 0 },
        metadata: {
          id: "cyclic",
          name: "Cyclic Flow",
          author: "Test",
          description: "Test cyclic flow",
          category: "group",
          icon: "repeat",
        },
        parameters: {},
        inputPorts: [],
        outputPorts: [],
        nodes: [child1, child2],
        edges: [
          {
            id: "edge-1",
            source: "child-1",
            target: "child-2",
            sourceHandle: "out",
            targetHandle: "in",
          },
          {
            id: "edge-2",
            source: "child-2",
            target: "child-1",
            sourceHandle: "out",
            targetHandle: "in",
          },
        ],
      });

      const result = await conductor.node.run(cyclicNode);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("Cycle detected");
    });
  });

  describe("Conductor Configuration", () => {
    it("should accept configuration options", () => {
      const conductor = createConductor({
        maxRetries: 3,
        retryDelay: 1000,
        timeout: 5000,
        logLevel: "debug",
      });

      expect(conductor).toBeDefined();
      expect(conductor.execute).toBeInstanceOf(Function);
    });
  });
});
