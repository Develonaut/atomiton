import type { NodeDefinition } from "@atomiton/nodes/definitions";
import type { Transport } from "@atomiton/rpc/renderer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createTestGroupNode,
  createTestNodeDefinition,
} from "#test-utils/factories.js";
import type { ConductorTransport } from "#types";
import { createFlowAPI } from "#exports/browser/flow.js";

// Create realistic mock transport factory
const createMockRPCTransport = (): Transport => {
  return {
    channel: vi.fn((channelName: string) => ({
      call: vi.fn((method: string, params: unknown) => {
        // Simulate realistic behavior based on method
        if (channelName === "flow") {
          if (method === "listTemplates") {
            return Promise.resolve({
              templates: [
                { id: "hello-world", name: "Hello World" },
                { id: "data-pipeline", name: "Data Pipeline" },
              ],
            });
          }
          if (method === "getTemplate") {
            const { id } = params as { id: string };
            return Promise.resolve({
              definition: createTestGroupNode(3),
              id,
            });
          }
        }
        return Promise.resolve({});
      }),
      listen: vi.fn(),
    })),
  } as unknown as Transport;
};

// Mock RPC transport module
vi.mock("@atomiton/rpc/renderer", () => ({
  createTransport: vi.fn(() => createMockRPCTransport()),
}));

describe.concurrent("Flow API", () => {
  let mockTransport: ConductorTransport;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Suppress console warnings in tests
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    // Create realistic mock with validation logic
    mockTransport = {
      execute: vi.fn().mockImplementation(async (node, _context) => {
        // Validate inputs like real transport would
        if (!node.nodes || node.nodes.length === 0) {
          return {
            success: false,
            error: {
              nodeId: node.id,
              message: "Invalid node structure",
              timestamp: new Date(),
              code: "INVALID_NODE",
            },
            duration: 0,
            executedNodes: [],
          };
        }
        return {
          success: true,
          duration: 100,
          executedNodes: node.nodes.map((n: NodeDefinition) => n.id),
        };
      }),
      health: vi.fn().mockResolvedValue({ healthy: true }),
    };
  });

  afterEach(() => {
    // Restore console.warn
    consoleWarnSpy.mockRestore();
  });

  describe("RPC Transport Usage", () => {
    it.concurrent("should use RPC transport for listTemplates", async () => {
      const flowAPI = createFlowAPI(mockTransport);
      const result = await flowAPI.listTemplates();

      expect(result).toHaveProperty("templates");
      expect(Array.isArray(result.templates)).toBe(true);
      expect(result.templates.length).toBeGreaterThan(0);
    });

    it.concurrent("should use RPC transport for getTemplate", async () => {
      const flowAPI = createFlowAPI(mockTransport);
      const result = await flowAPI.getTemplate("test-id");

      expect(result.definition).toBeDefined();
      expect(result.definition.type).toBe("group");
      expect(result.definition.nodes).toBeDefined();
      expect(result.definition.nodes!.length).toBeGreaterThan(0);
    });

    it.concurrent(
      "should handle missing RPC transport gracefully",
      async () => {
        // Mock createTransport to throw
        const { createTransport } = await import("@atomiton/rpc/renderer");
        const mockCreateTransport = createTransport as ReturnType<typeof vi.fn>;

        // Temporarily make transport creation fail
        mockCreateTransport.mockImplementationOnce(() => {
          throw new Error("Network unavailable");
        });

        // This will create a FlowAPI with no RPC transport
        const flowAPI = createFlowAPI(undefined);

        // Should throw when RPC transport is unavailable
        await expect(flowAPI.listTemplates()).rejects.toThrow(
          "No transport available",
        );
      },
    );
  });

  describe("flow.run() validation", () => {
    it.concurrent("should validate that flow is a group node", async () => {
      const flowAPI = createFlowAPI(mockTransport);

      // Atomic node (no child nodes)
      const atomicNode = createTestNodeDefinition({
        id: "atomic",
        type: "test",
      });

      await expect(flowAPI.run(atomicNode)).rejects.toThrow(
        "Flow must be a group node with child nodes",
      );
    });

    it.concurrent("should accept group nodes with child nodes", async () => {
      const flowAPI = createFlowAPI(mockTransport);
      const groupNode = createTestGroupNode(2);

      const result = await flowAPI.run(groupNode);

      expect(result.success).toBe(true);
      expect(result.executedNodes).toHaveLength(2);
      expect(mockTransport.execute).toHaveBeenCalledWith(
        groupNode,
        expect.any(Object),
      );
    });

    it.concurrent("should delegate to transport.execute", async () => {
      // Create fresh mock for this test to avoid call count issues
      const freshMockTransport: ConductorTransport = {
        execute: vi.fn().mockImplementation(async (node, _context) => {
          if (!node.nodes || node.nodes.length === 0) {
            return {
              success: false,
              error: {
                nodeId: node.id,
                message: "Invalid node structure",
                timestamp: new Date(),
                code: "INVALID_NODE",
              },
              duration: 0,
              executedNodes: [],
            };
          }
          return {
            success: true,
            duration: 100,
            executedNodes: node.nodes.map((n: NodeDefinition) => n.id),
          };
        }),
        health: vi.fn().mockResolvedValue({ healthy: true }),
      };

      const flowAPI = createFlowAPI(freshMockTransport);
      const groupNode = createTestGroupNode(3);

      await flowAPI.run(groupNode);

      expect(freshMockTransport.execute).toHaveBeenCalledTimes(1);
      expect(freshMockTransport.execute).toHaveBeenCalledWith(
        groupNode,
        expect.objectContaining({
          executionId: expect.any(String),
          nodeId: groupNode.id,
        }),
      );
    });

    it.concurrent("should pass context overrides to transport", async () => {
      // Create fresh mock for this test to avoid call count issues
      const freshMockTransport: ConductorTransport = {
        execute: vi.fn().mockImplementation(async (node, _context) => {
          if (!node.nodes || node.nodes.length === 0) {
            return {
              success: false,
              error: {
                nodeId: node.id,
                message: "Invalid node structure",
                timestamp: new Date(),
                code: "INVALID_NODE",
              },
              duration: 0,
              executedNodes: [],
            };
          }
          return {
            success: true,
            duration: 100,
            executedNodes: node.nodes.map((n: NodeDefinition) => n.id),
          };
        }),
        health: vi.fn().mockResolvedValue({ healthy: true }),
      };

      const flowAPI = createFlowAPI(freshMockTransport);
      const groupNode = createTestGroupNode(2);

      const contextOverrides = {
        variables: { key: "value" },
      };

      await flowAPI.run(groupNode, contextOverrides);

      expect(freshMockTransport.execute).toHaveBeenCalledWith(
        groupNode,
        expect.objectContaining(contextOverrides),
      );
    });

    it.concurrent(
      "should return error when transport unavailable",
      async () => {
        const flowAPI = createFlowAPI(undefined);
        const groupNode = createTestGroupNode(2);

        const result = await flowAPI.run(groupNode);

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe("NO_TRANSPORT");
        expect(result.error?.message).toContain("No transport available");
      },
    );

    it.concurrent("should return error for empty group node", async () => {
      const flowAPI = createFlowAPI(mockTransport);

      // Group node with no children (invalid)
      const emptyGroupNode = createTestNodeDefinition({
        id: "empty-group",
        type: "group",
        nodes: [],
      });

      await expect(flowAPI.run(emptyGroupNode)).rejects.toThrow(
        "Flow must be a group node with child nodes",
      );
    });
  });

  describe("loadFlow helper", () => {
    it("should load flow definition from getTemplate", async () => {
      const flowAPI = createFlowAPI(mockTransport);

      const definition = await flowAPI.loadFlow("test-id");

      expect(definition).toBeDefined();
      expect(definition.type).toBe("group");
    });
  });
});
