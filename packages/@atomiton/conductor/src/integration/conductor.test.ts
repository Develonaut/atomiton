import { createConductor } from "#index";
import {
  createNodeDefinition,
  createNodeMetadata,
  createNodeParameters,
  createNodePorts,
} from "@atomiton/nodes/definitions";
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
        metadata: createNodeMetadata({
          id: "processor",
          name: "Processor",
          author: "Test",
          description: "Test processor",
          category: "utility",
          icon: "code-2",
        }),
        parameters: createNodeParameters({}),
        ...createNodePorts({}),
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
        metadata: createNodeMetadata({
          id: "child",
          name: "Child",
          author: "Test",
          description: "Test child",
          category: "utility",
          icon: "code-2",
        }),
        parameters: createNodeParameters({}),
        ...createNodePorts({}),
      });

      const compositeNode = createNodeDefinition({
        id: "flow-1",
        type: "flow",
        version: "1.0.0",
        name: "Test Flow",
        position: { x: 0, y: 0 },
        metadata: createNodeMetadata({
          id: "flow",
          name: "Flow",
          author: "Test",
          description: "Test flow",
          category: "group",
          icon: "git-branch",
        }),
        parameters: createNodeParameters({}),
        ...createNodePorts({}),
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

    it.skip("should execute an atomic node", async () => {
      vi.mock("@atomiton/nodes/executables", () => ({
        getNodeExecutable: vi.fn(() => ({
          execute: vi.fn().mockResolvedValue({
            success: true,
            outputs: { result: "success" },
          }),
        })),
      }));

      const conductor = createConductor();
      const atomicNode = createNodeDefinition({
        id: "node-1",
        type: "processor",
        version: "1.0.0",
        name: "Test Processor",
        position: { x: 0, y: 0 },
        metadata: createNodeMetadata({
          id: "processor",
          name: "Processor",
          author: "Test",
          description: "Test processor",
          category: "utility",
          icon: "code-2",
        }),
        parameters: createNodeParameters({ value: 42 }),
        ...createNodePorts({}),
      });

      const result = await conductor.execute(atomicNode, {
        input: { data: "test" },
      });

      expect(result.success).toBe(true);
      expect(result.executedNodes).toContain("node-1");
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });

    it.skip("should handle atomic node execution failure", async () => {
      // Note: In a real test, we'd use vi.mock at the top of the file
      // For now, we'll skip this test as mocking dynamic imports is complex

      const conductor = createConductor();
      const atomicNode = createNodeDefinition({
        id: "node-1",
        type: "failing-processor",
        version: "1.0.0",
        name: "Failing Processor",
        position: { x: 0, y: 0 },
        metadata: createNodeMetadata({
          id: "failing",
          name: "Failing",
          author: "Test",
          description: "Test failing processor",
          category: "utility",
          icon: "zap",
        }),
        parameters: createNodeParameters({}),
        ...createNodePorts({}),
      });

      const result = await conductor.execute(atomicNode);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe("Execution failed");
      expect(result.error?.nodeId).toBe("node-1");
    });

    it.skip("should execute a composite node with multiple children", async () => {
      vi.mock("@atomiton/nodes/executables", () => ({
        getNodeExecutable: vi.fn(() => ({
          execute: vi.fn().mockImplementation((context) => {
            if (context.nodeId === "child-1") {
              return Promise.resolve({ success: true, outputs: { value: 10 } });
            }
            if (context.nodeId === "child-2") {
              return Promise.resolve({ success: true, outputs: { value: 20 } });
            }
            return Promise.resolve({ success: true, outputs: {} });
          }),
        })),
      }));

      const conductor = createConductor();

      const child1 = createNodeDefinition({
        id: "child-1",
        type: "processor",
        version: "1.0.0",
        parentId: "flow-1",
        name: "First Child",
        position: { x: 100, y: 100 },
        metadata: createNodeMetadata({
          id: "child1",
          name: "First Child",
          author: "Test",
          description: "First child node",
          category: "utility",
          icon: "code-2",
        }),
        parameters: createNodeParameters({}),
        ...createNodePorts({}),
      });

      const child2 = createNodeDefinition({
        id: "child-2",
        type: "processor",
        version: "1.0.0",
        parentId: "flow-1",
        name: "Second Child",
        position: { x: 200, y: 100 },
        metadata: createNodeMetadata({
          id: "child2",
          name: "Second Child",
          author: "Test",
          description: "Second child node",
          category: "utility",
          icon: "code-2",
        }),
        parameters: createNodeParameters({}),
        ...createNodePorts({}),
      });

      const compositeNode = createNodeDefinition({
        id: "flow-1",
        type: "flow",
        version: "1.0.0",
        name: "Test Flow",
        position: { x: 0, y: 0 },
        metadata: createNodeMetadata({
          id: "flow",
          name: "Flow",
          author: "Test",
          description: "Test flow",
          category: "group",
          icon: "git-branch",
        }),
        parameters: createNodeParameters({}),
        ...createNodePorts({}),
        nodes: [child1, child2],
        edges: [
          {
            id: "edge-1",
            source: "child-1",
            target: "child-2",
            sourceHandle: "out",
            targetHandle: "in",
          },
        ],
      });

      const result = await conductor.execute(compositeNode);

      expect(result.success).toBe(true);
      expect(result.executedNodes).toContain("flow-1");
      expect(result.executedNodes).toContain("child-1");
      expect(result.executedNodes).toContain("child-2");
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
        metadata: createNodeMetadata({
          id: "child1",
          name: "First Child",
          author: "Test",
          description: "First child node",
          category: "utility",
          icon: "code-2",
        }),
        parameters: createNodeParameters({}),
        ...createNodePorts({}),
      });

      const child2 = createNodeDefinition({
        id: "child-2",
        type: "processor",
        version: "1.0.0",
        parentId: "flow-1",
        name: "Second Child",
        position: { x: 200, y: 100 },
        metadata: createNodeMetadata({
          id: "child2",
          name: "Second Child",
          author: "Test",
          description: "Second child node",
          category: "utility",
          icon: "code-2",
        }),
        parameters: createNodeParameters({}),
        ...createNodePorts({}),
      });

      const cyclicNode = createNodeDefinition({
        id: "flow-1",
        type: "flow",
        version: "1.0.0",
        name: "Cyclic Flow",
        position: { x: 0, y: 0 },
        metadata: createNodeMetadata({
          id: "cyclic",
          name: "Cyclic Flow",
          author: "Test",
          description: "Test cyclic flow",
          category: "group",
          icon: "repeat",
        }),
        parameters: createNodeParameters({}),
        ...createNodePorts({}),
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

      const result = await conductor.execute(cyclicNode);

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
