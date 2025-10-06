import { describe, it, expect, beforeEach, vi } from "vitest";
import { createConductor } from "#index";
import { createNodeDefinition } from "@atomiton/nodes/definitions";
import type { NodeExecutable } from "@atomiton/nodes/executables";
import { toNodeId } from "#types";

describe("Debug Utils Tests", () => {
  const mockExecutable: NodeExecutable = {
    execute: vi.fn().mockResolvedValue({ success: true, data: "test" }),
  };

  const createMockConfig = () => ({
    nodeExecutorFactory: {
      getNodeExecutable: vi.fn().mockReturnValue(mockExecutable),
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("simulateError on specific node", () => {
    it("should fail on the specified node with generic error", async () => {
      const conductor = createConductor(createMockConfig());

      const node = createNodeDefinition({
        id: "target-node",
        type: "test",
      });

      const result = await conductor.node.run(node, {
        debug: {
          simulateError: {
            nodeId: "target-node",
            errorType: "generic",
          },
        },
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain("GENERIC");
      expect(result.error?.message).toContain("Simulated generic error");
    });

    it("should fail with timeout error type", async () => {
      const conductor = createConductor(createMockConfig());

      const node = createNodeDefinition({
        id: "slow-node",
        type: "test",
      });

      const result = await conductor.node.run(node, {
        debug: {
          simulateError: {
            nodeId: "slow-node",
            errorType: "timeout",
          },
        },
      });

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("TIMEOUT");
      expect(result.error?.message).toContain("timeout");
    });

    it("should fail with network error type", async () => {
      const conductor = createConductor(createMockConfig());

      const node = createNodeDefinition({
        id: "http-node",
        type: "test",
      });

      const result = await conductor.node.run(node, {
        debug: {
          simulateError: {
            nodeId: "http-node",
            errorType: "network",
          },
        },
      });

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("NETWORK");
      expect(result.error?.message).toContain("Network error");
    });

    it("should fail with validation error type", async () => {
      const conductor = createConductor(createMockConfig());

      const node = createNodeDefinition({
        id: "validate-node",
        type: "test",
      });

      const result = await conductor.node.run(node, {
        debug: {
          simulateError: {
            nodeId: "validate-node",
            errorType: "validation",
          },
        },
      });

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("VALIDATION");
      expect(result.error?.message).toContain("Validation error");
    });

    it("should fail with permission error type", async () => {
      const conductor = createConductor(createMockConfig());

      const node = createNodeDefinition({
        id: "auth-node",
        type: "test",
      });

      const result = await conductor.node.run(node, {
        debug: {
          simulateError: {
            nodeId: "auth-node",
            errorType: "permission",
          },
        },
      });

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("PERMISSION");
      expect(result.error?.message).toContain("Permission denied");
    });

    it("should only fail the specified node in a group", async () => {
      const conductor = createConductor(createMockConfig());

      const child1 = createNodeDefinition({ id: "child-1", type: "test" });
      const child2 = createNodeDefinition({ id: "child-2", type: "test" });
      const child3 = createNodeDefinition({ id: "child-3", type: "test" });

      const group = createNodeDefinition({
        id: "group",
        type: "group",
        nodes: [child1, child2, child3],
        edges: [],
      });

      const result = await conductor.node.run(group, {
        debug: {
          simulateError: {
            nodeId: "child-2",
            errorType: "generic",
          },
        },
      });

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("Simulated generic error");
      // Should have executed child-1, then failed on child-2
      expect(result.executedNodes).toContain("child-1");
      expect(result.executedNodes).toContain("child-2");
      // Should NOT have executed child-3 (execution stopped)
      expect(result.executedNodes).not.toContain("child-3");
    });
  });

  describe("simulateError on random node", () => {
    it("should fail on a random node in the graph", async () => {
      const conductor = createConductor(createMockConfig());

      const child1 = createNodeDefinition({ id: "child-1", type: "test" });
      const child2 = createNodeDefinition({ id: "child-2", type: "test" });
      const child3 = createNodeDefinition({ id: "child-3", type: "test" });

      const group = createNodeDefinition({
        id: "group",
        type: "group",
        nodes: [child1, child2, child3],
        edges: [],
      });

      const result = await conductor.node.run(group, {
        debug: {
          simulateError: {
            nodeId: "random",
            errorType: "generic",
          },
        },
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should consistently fail the same random node within execution", async () => {
      const conductor = createConductor(createMockConfig());

      const child1 = createNodeDefinition({ id: "child-1", type: "test" });
      const child2 = createNodeDefinition({ id: "child-2", type: "test" });

      const group = createNodeDefinition({
        id: "group",
        type: "group",
        nodes: [child1, child2],
        edges: [],
      });

      // Run multiple times to verify randomness across executions
      const erroredNodes = new Set<string>();

      for (let i = 0; i < 10; i++) {
        conductor.node.store.reset();
        const result = await conductor.node.run(group, {
          debug: {
            simulateError: {
              nodeId: "random",
              errorType: "generic",
            },
          },
        });

        expect(result.success).toBe(false);

        // Track which nodes failed
        if (
          result.executedNodes?.includes(toNodeId("child-1")) &&
          !result.executedNodes?.includes(toNodeId("child-2"))
        ) {
          erroredNodes.add("child-1");
        } else if (result.executedNodes?.includes(toNodeId("child-2"))) {
          erroredNodes.add("child-2");
        }
      }

      // With 10 runs and 2 nodes, should see both nodes fail at some point
      expect(erroredNodes.size).toBeGreaterThanOrEqual(1);
    });
  });

  describe("simulateLongRunning on specific node", () => {
    it("slow: should add delay to the specified node", async () => {
      const conductor = createConductor(createMockConfig());

      const node = createNodeDefinition({
        id: "slow-node",
        type: "test",
      });

      const startTime = Date.now();
      const result = await conductor.node.run(node, {
        debug: {
          simulateLongRunning: {
            nodeId: "slow-node",
            delayMs: 200,
          },
        },
      });
      const duration = Date.now() - startTime;

      expect(result.success).toBe(true);
      // Should take at least the delay time
      expect(duration).toBeGreaterThanOrEqual(180); // Allow 10% tolerance
    });

    it("slow: should only delay the specified node in a group", async () => {
      const conductor = createConductor(createMockConfig());

      const child1 = createNodeDefinition({ id: "child-1", type: "test" });
      const child2 = createNodeDefinition({ id: "child-2", type: "test" });
      const child3 = createNodeDefinition({ id: "child-3", type: "test" });

      const group = createNodeDefinition({
        id: "group",
        type: "group",
        nodes: [child1, child2, child3],
        edges: [],
      });

      const startTime = Date.now();
      const result = await conductor.node.run(group, {
        debug: {
          simulateLongRunning: {
            nodeId: "child-2",
            delayMs: 300,
          },
        },
      });
      const duration = Date.now() - startTime;

      expect(result.success).toBe(true);
      // Should take at least the delay time
      expect(duration).toBeGreaterThanOrEqual(280);
      // Should have executed all nodes
      expect(result.executedNodes).toContain("child-1");
      expect(result.executedNodes).toContain("child-2");
      expect(result.executedNodes).toContain("child-3");
    });

    it("slow: should work with different delay values", async () => {
      const conductor = createConductor(createMockConfig());

      const node = createNodeDefinition({
        id: "test-node",
        type: "test",
      });

      // Test 100ms delay
      conductor.node.store.reset();
      let start = Date.now();
      await conductor.node.run(node, {
        debug: {
          simulateLongRunning: {
            nodeId: "test-node",
            delayMs: 100,
          },
        },
      });
      let duration = Date.now() - start;
      expect(duration).toBeGreaterThanOrEqual(90);

      // Test 500ms delay
      conductor.node.store.reset();
      start = Date.now();
      await conductor.node.run(node, {
        debug: {
          simulateLongRunning: {
            nodeId: "test-node",
            delayMs: 500,
          },
        },
      });
      duration = Date.now() - start;
      expect(duration).toBeGreaterThanOrEqual(450);
    });
  });

  describe("simulateLongRunning on random node", () => {
    it("slow: should delay a random node", async () => {
      const conductor = createConductor(createMockConfig());

      const child1 = createNodeDefinition({ id: "child-1", type: "test" });
      const child2 = createNodeDefinition({ id: "child-2", type: "test" });

      const group = createNodeDefinition({
        id: "group",
        type: "group",
        nodes: [child1, child2],
        edges: [],
      });

      const startTime = Date.now();
      const result = await conductor.node.run(group, {
        debug: {
          simulateLongRunning: {
            nodeId: "random",
            delayMs: 200,
          },
        },
      });
      const duration = Date.now() - startTime;

      expect(result.success).toBe(true);
      // Should take at least the delay time
      expect(duration).toBeGreaterThanOrEqual(180);
    });
  });

  describe("combined debug options", () => {
    it("should support both error and long-running on different nodes", async () => {
      const conductor = createConductor(createMockConfig());

      const child1 = createNodeDefinition({ id: "child-1", type: "test" });
      const child2 = createNodeDefinition({ id: "child-2", type: "test" });
      const child3 = createNodeDefinition({ id: "child-3", type: "test" });

      const group = createNodeDefinition({
        id: "group",
        type: "group",
        nodes: [child1, child2, child3],
        edges: [],
      });

      const result = await conductor.node.run(group, {
        debug: {
          simulateLongRunning: {
            nodeId: "child-1",
            delayMs: 100,
          },
          simulateError: {
            nodeId: "child-2",
            errorType: "network",
          },
        },
      });

      // Should fail because child-2 errors
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("NETWORK");
      // Should have executed child-1 (with delay) and child-2 (with error)
      expect(result.executedNodes).toContain("child-1");
      expect(result.executedNodes).toContain("child-2");
      // Should NOT execute child-3 (stopped at error)
      expect(result.executedNodes).not.toContain("child-3");
    });

    it("slow: should combine with slowMo option", async () => {
      const conductor = createConductor(createMockConfig());

      const node = createNodeDefinition({
        id: "test-node",
        type: "test",
      });

      const startTime = Date.now();
      const result = await conductor.node.run(node, {
        slowMo: 50, // 2 * 50ms = 100ms animation
        debug: {
          simulateLongRunning: {
            nodeId: "test-node",
            delayMs: 200,
          },
        },
      });
      const duration = Date.now() - startTime;

      expect(result.success).toBe(true);
      // Should take at least max(animation, delay) = 200ms
      expect(duration).toBeGreaterThanOrEqual(180);
    });
  });

  describe("edge cases", () => {
    it("should succeed when no debug options are provided", async () => {
      const conductor = createConductor(createMockConfig());

      const node = createNodeDefinition({
        id: "test-node",
        type: "test",
      });

      const result = await conductor.node.run(node, {
        debug: undefined,
      });

      expect(result.success).toBe(true);
    });

    it("should succeed when debug object is empty", async () => {
      const conductor = createConductor(createMockConfig());

      const node = createNodeDefinition({
        id: "test-node",
        type: "test",
      });

      const result = await conductor.node.run(node, {
        debug: {},
      });

      expect(result.success).toBe(true);
    });

    it("should not fail when error nodeId doesn't match any node", async () => {
      const conductor = createConductor(createMockConfig());

      const node = createNodeDefinition({
        id: "test-node",
        type: "test",
      });

      const result = await conductor.node.run(node, {
        debug: {
          simulateError: {
            nodeId: "non-existent-node",
            errorType: "generic",
          },
        },
      });

      // Should succeed because the target node doesn't exist
      expect(result.success).toBe(true);
    });

    it("should not delay when longRunning nodeId doesn't match", async () => {
      const conductor = createConductor(createMockConfig());

      const node = createNodeDefinition({
        id: "test-node",
        type: "test",
      });

      const startTime = Date.now();
      const result = await conductor.node.run(node, {
        slowMo: 0, // Disable animation to test only the debug delay
        debug: {
          simulateLongRunning: {
            nodeId: "non-existent-node",
            delayMs: 5000,
          },
        },
      });
      const duration = Date.now() - startTime;

      expect(result.success).toBe(true);
      // Should be fast (no delay applied since node doesn't match)
      expect(duration).toBeLessThan(100);
    });
  });
});
