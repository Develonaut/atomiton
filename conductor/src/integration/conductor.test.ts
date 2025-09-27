import { describe, it, expect, vi } from "vitest";
import { createConductor, isAtomic, isComposite } from "#index";
import type { NodeDefinition } from "@atomiton/nodes";
import type { ExecutionContext } from "#types";

describe("Conductor Integration Tests", () => {
  describe("Node Type Detection", () => {
    it("should identify atomic nodes", () => {
      const atomicNode: NodeDefinition = {
        id: "node-1",
        type: "processor",
        version: "1.0.0",
        name: "Test Processor",
        position: { x: 0, y: 0 },
        metadata: {},
        parameters: {},
        inputPorts: [],
        outputPorts: [],
      };

      expect(isAtomic(atomicNode)).toBe(true);
      expect(isComposite(atomicNode)).toBe(false);
    });

    it("should identify composite nodes", () => {
      const compositeNode: NodeDefinition = {
        id: "flow-1",
        type: "flow",
        version: "1.0.0",
        name: "Test Flow",
        position: { x: 0, y: 0 },
        metadata: {},
        parameters: {},
        inputPorts: [],
        outputPorts: [],
        nodes: [
          {
            id: "child-1",
            type: "processor",
            version: "1.0.0",
            parentId: "flow-1",
            name: "Child Node",
            position: { x: 100, y: 100 },
            metadata: {},
            parameters: {},
            inputPorts: [],
            outputPorts: [],
          },
        ],
        edges: [],
      };

      expect(isComposite(compositeNode)).toBe(true);
      expect(isAtomic(compositeNode)).toBe(false);
    });
  });

  describe("Conductor Execution", () => {
    it("should create a conductor instance", () => {
      const conductor = createConductor();
      expect(conductor).toBeDefined();
      expect(conductor.execute).toBeInstanceOf(Function);
    });

    it("should execute an atomic node", async () => {
      vi.mock("@atomiton/nodes/executables/registry", () => ({
        getNodeExecutable: vi.fn(() => ({
          execute: vi.fn().mockResolvedValue({ result: "success" }),
        })),
      }));

      const conductor = createConductor();
      const atomicNode: NodeDefinition = {
        id: "node-1",
        type: "processor",
        version: "1.0.0",
        name: "Test Processor",
        position: { x: 0, y: 0 },
        metadata: {},
        parameters: { value: 42 },
        inputPorts: [],
        outputPorts: [],
      };

      const result = await conductor.execute(atomicNode, {
        input: { data: "test" },
      });

      expect(result.success).toBe(true);
      expect(result.executedNodes).toContain("node-1");
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });

    it("should handle atomic node execution failure", async () => {
      vi.mock("@atomiton/nodes/executables/registry", () => ({
        getNodeExecutable: vi.fn(() => ({
          execute: vi.fn().mockRejectedValue(new Error("Execution failed")),
        })),
      }));

      const conductor = createConductor();
      const atomicNode: NodeDefinition = {
        id: "node-1",
        type: "failing-processor",
        version: "1.0.0",
        name: "Failing Processor",
        position: { x: 0, y: 0 },
        metadata: {},
        parameters: {},
        inputPorts: [],
        outputPorts: [],
      };

      const result = await conductor.execute(atomicNode);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe("Execution failed");
      expect(result.error?.nodeId).toBe("node-1");
    });

    it("should execute a composite node with multiple children", async () => {
      vi.mock("@atomiton/nodes/executables/registry", () => ({
        getNodeExecutable: vi.fn(() => ({
          execute: vi.fn().mockImplementation((context: ExecutionContext) => {
            if (context.nodeId === "child-1") {
              return Promise.resolve({ value: 10 });
            }
            if (context.nodeId === "child-2") {
              return Promise.resolve({ value: 20 });
            }
            return Promise.resolve({});
          }),
        })),
      }));

      const conductor = createConductor();
      const compositeNode: NodeDefinition = {
        id: "flow-1",
        type: "flow",
        version: "1.0.0",
        name: "Test Flow",
        position: { x: 0, y: 0 },
        metadata: {},
        parameters: {},
        inputPorts: [],
        outputPorts: [],
        nodes: [
          {
            id: "child-1",
            type: "processor",
            version: "1.0.0",
            parentId: "flow-1",
            name: "First Child",
            position: { x: 100, y: 100 },
            metadata: {},
            parameters: {},
            inputPorts: [],
            outputPorts: [],
          },
          {
            id: "child-2",
            type: "processor",
            version: "1.0.0",
            parentId: "flow-1",
            name: "Second Child",
            position: { x: 200, y: 100 },
            metadata: {},
            parameters: {},
            inputPorts: [],
            outputPorts: [],
          },
        ],
        edges: [
          {
            source: "child-1",
            target: "child-2",
            sourceHandle: "out",
            targetHandle: "in",
          },
        ],
      };

      const result = await conductor.execute(compositeNode);

      expect(result.success).toBe(true);
      expect(result.executedNodes).toContain("flow-1");
      expect(result.executedNodes).toContain("child-1");
      expect(result.executedNodes).toContain("child-2");
    });

    it("should detect cycles in composite nodes", async () => {
      const conductor = createConductor();
      const cyclicNode: NodeDefinition = {
        id: "flow-1",
        type: "flow",
        version: "1.0.0",
        name: "Cyclic Flow",
        position: { x: 0, y: 0 },
        metadata: {},
        parameters: {},
        inputPorts: [],
        outputPorts: [],
        nodes: [
          {
            id: "child-1",
            type: "processor",
            version: "1.0.0",
            parentId: "flow-1",
            name: "First Child",
            position: { x: 100, y: 100 },
            metadata: {},
            parameters: {},
            inputPorts: [],
            outputPorts: [],
          },
          {
            id: "child-2",
            type: "processor",
            version: "1.0.0",
            parentId: "flow-1",
            name: "Second Child",
            position: { x: 200, y: 100 },
            metadata: {},
            parameters: {},
            inputPorts: [],
            outputPorts: [],
          },
        ],
        edges: [
          {
            source: "child-1",
            target: "child-2",
            sourceHandle: "out",
            targetHandle: "in",
          },
          {
            source: "child-2",
            target: "child-1",
            sourceHandle: "out",
            targetHandle: "in",
          },
        ],
      };

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
