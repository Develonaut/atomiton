import { describe, it, expect, beforeEach } from "vitest";
import { createConductor } from "#index";
import { createNodeDefinition } from "@atomiton/nodes/definitions";
import type { ConductorConfig } from "#types";

describe("Debug Error Simulation", () => {
  let conductor: ReturnType<typeof createConductor>;
  let config: ConductorConfig;

  beforeEach(() => {
    config = {
      nodeExecutorFactory: {
        getNodeExecutable: (_nodeType: string) => ({
          execute: async () => {
            // Simple executor that just completes
            await new Promise((resolve) => setTimeout(resolve, 100));
            return { success: true };
          },
        }),
      },
    };
    conductor = createConductor(config);
  });

  describe("immediate error simulation", () => {
    it("should stop execution immediately when debug error is set on first node", async () => {
      const node1 = createNodeDefinition({
        id: "node-1",
        type: "test",
        name: "First Node",
      });
      const node2 = createNodeDefinition({
        id: "node-2",
        type: "test",
        name: "Second Node",
      });
      const node3 = createNodeDefinition({
        id: "node-3",
        type: "test",
        name: "Third Node",
      });

      const flow = createNodeDefinition({
        type: "group",
        nodes: [node1, node2, node3],
      });

      const result = await conductor.node.run(flow, {
        debug: {
          simulateError: {
            nodeId: "node-1",
            errorType: "generic",
            message: "Simulated error on first node",
          },
        },
      });

      // Verify execution failed
      expect(result.success).toBe(false);
      expect(result.error?.nodeId).toBe("node-1");
      expect(result.error?.message).toBe(
        "[GENERIC] Simulated error on first node",
      );

      // Verify node states
      const state = conductor.node.store.getState();
      const node1State = state.nodes.get("node-1");
      const node2State = state.nodes.get("node-2");
      const node3State = state.nodes.get("node-3");

      expect(node1State?.state).toBe("error");
      expect(node2State?.state).toBe("pending"); // Should not have executed
      expect(node3State?.state).toBe("pending"); // Should not have executed
    });

    it("should freeze progress at current value when error occurs", async () => {
      const node = createNodeDefinition({
        id: "error-node",
        type: "test",
        name: "Error Node",
      });

      const result = await conductor.node.run(node, {
        debug: {
          simulateError: {
            nodeId: "error-node",
            errorType: "generic",
            message: "Test error",
          },
        },
        slowMo: 50, // Enable progress tracking
      });

      expect(result.success).toBe(false);

      const state = conductor.node.store.getState();
      const nodeState = state.nodes.get("error-node");

      // Progress should be frozen at whatever value it was when error occurred
      // With immediate error, this will be 0 or a very small value
      expect(nodeState?.state).toBe("error");
      expect(nodeState?.progress).toBeLessThan(100); // Not complete
    });

    it("should include error nodes in overall progress calculation", async () => {
      const node1 = createNodeDefinition({
        id: "node-1",
        type: "test",
        name: "First Node",
      });
      const node2 = createNodeDefinition({
        id: "node-2",
        type: "test",
        name: "Second Node",
      });

      const flow = createNodeDefinition({
        type: "group",
        nodes: [node1, node2],
      });

      await conductor.node.run(flow, {
        debug: {
          simulateError: {
            nodeId: "node-1",
            errorType: "generic",
          },
        },
      });

      const state = conductor.node.store.getState();

      // Overall progress should account for the error node's frozen progress
      // With 2 nodes of equal weight, if first errors at 0%, overall should be 0%
      expect(state.cachedProgress).toBeLessThan(50); // Less than halfway since first node errored
    });
  });

  describe("edge visualization with errors", () => {
    it("should not fill edges when source node errors", async () => {
      const node1 = createNodeDefinition({
        id: "node-1",
        type: "test",
        name: "Error Node",
      });
      const node2 = createNodeDefinition({
        id: "node-2",
        type: "test",
        name: "Next Node",
      });

      const flow = createNodeDefinition({
        type: "group",
        nodes: [node1, node2],
      });

      await conductor.node.run(flow, {
        debug: {
          simulateError: {
            nodeId: "node-1",
            errorType: "generic",
          },
        },
      });

      const state = conductor.node.store.getState();
      const node1State = state.nodes.get("node-1");
      const node2State = state.nodes.get("node-2");

      // Node 1 should be in error state
      expect(node1State?.state).toBe("error");
      expect(node1State?.progress).toBeLessThan(100);

      // Node 2 should not have started (edge should not fill)
      expect(node2State?.state).toBe("pending");
      expect(node2State?.progress).toBe(0);
    });
  });

  describe("delayed error simulation", () => {
    it("should throw error after specified delay (simulates mid-execution failure)", async () => {
      const node = createNodeDefinition({
        id: "delayed-error-node",
        type: "test",
        name: "Delayed Error Node",
      });

      const startTime = Date.now();

      const result = await conductor.node.run(node, {
        debug: {
          simulateError: {
            nodeId: "delayed-error-node",
            errorType: "network",
            message: "Network failed halfway through",
            delayMs: 150, // Wait 150ms before throwing error
          },
        },
        slowMo: 50, // Progress tracking enabled
      });

      const duration = Date.now() - startTime;

      // Verify execution failed after delay
      expect(result.success).toBe(false);
      expect(result.error?.message).toBe(
        "[NETWORK] Network failed halfway through",
      );

      // Verify the delay was applied (should be at least 150ms)
      expect(duration).toBeGreaterThanOrEqual(150);

      const state = conductor.node.store.getState();
      const nodeState = state.nodes.get("delayed-error-node");

      // Node should be in error state
      expect(nodeState?.state).toBe("error");

      // Progress should be somewhere between 0-100 (frozen at error point)
      // Since we delayed 150ms and slowMo is 50ms, progress should have advanced
      expect(nodeState?.progress).toBeGreaterThan(0);
      expect(nodeState?.progress).toBeLessThan(100);
    });

    it("should allow progress to advance before error with combined slowMo and delayMs", async () => {
      const node = createNodeDefinition({
        id: "progress-then-error",
        type: "test",
        name: "Progress Then Error",
      });

      await conductor.node.run(node, {
        debug: {
          simulateError: {
            nodeId: "progress-then-error",
            errorType: "timeout",
            message: "Operation timed out",
            delayMs: 200, // Wait 200ms
          },
        },
        slowMo: 50, // 50ms per progress step
      });

      const state = conductor.node.store.getState();
      const nodeState = state.nodes.get("progress-then-error");

      // Progress should have advanced during the delay
      // With slowMo=50, we get updates every 50ms
      // With delayMs=200, that's ~4 progress updates before error
      expect(nodeState?.state).toBe("error");
      expect(nodeState?.progress).toBeGreaterThan(0);
    });
  });

  describe("context propagation", () => {
    it("should propagate debug options through nested execution contexts", async () => {
      const childNode = createNodeDefinition({
        id: "child",
        type: "test",
        name: "Child",
      });
      const parentNode = createNodeDefinition({
        id: "parent",
        type: "group",
        name: "Parent",
        nodes: [childNode],
      });

      const result = await conductor.node.run(parentNode, {
        debug: {
          simulateError: {
            nodeId: "child",
            errorType: "generic",
            message: "Child error",
          },
        },
      });

      // Debug options should propagate to child context
      expect(result.success).toBe(false);
      expect(result.error?.nodeId).toBe("child");

      const state = conductor.node.store.getState();
      const childState = state.nodes.get("child");
      expect(childState?.state).toBe("error");
    });
  });
});
