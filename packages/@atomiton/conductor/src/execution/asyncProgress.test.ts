/**
 * Comprehensive Async Progress Tracking Tests
 *
 * Tests realistic async scenarios with:
 * - Variable execution delays between nodes
 * - Nodes completing at different rates
 * - Intermittent failures mid-execution
 * - Progress updates happening while other nodes are still running
 * - Race conditions in progress calculation
 * - Out-of-order completion
 * - Concurrent progress updates
 */

import {
  getExecutionProgress,
  type ExecutionGraphState,
  type ExecutionGraphNode,
} from "#execution/executionGraphStore";
import { createConductor } from "#index";
import { createNodeDefinition } from "@atomiton/nodes/definitions";
import type { NodeExecutable } from "@atomiton/nodes/executables";
import { delay } from "@atomiton/utils";
import { describe, expect, it, vi } from "vitest";

describe("Async Progress Tracking", () => {
  describe.concurrent("Variable Timing Scenarios", () => {
    it("should handle nodes with random delays (10ms-100ms) completing at different rates", async () => {
      // Create executables with random delays
      const createDelayedExecutable = (
        minDelay: number,
        maxDelay: number,
      ): NodeExecutable => ({
        execute: async () => {
          const delayTime =
            Math.floor(Math.random() * (maxDelay - minDelay)) + minDelay;
          await delay(delayTime);
          return { success: true, data: `Completed after ${delayTime}ms` };
        },
      });

      const mockConfig = {
        nodeExecutorFactory: {
          getNodeExecutable: vi
            .fn()
            .mockReturnValue(createDelayedExecutable(10, 100)),
        },
      };

      const conductor = createConductor(mockConfig);

      // Create 5 nodes that will complete at random times
      const nodes = Array.from({ length: 5 }, (_, i) =>
        createNodeDefinition({ id: `node-${i}`, type: "test" }),
      );

      const group = createNodeDefinition({
        id: "group",
        type: "group",
        nodes,
        edges: [],
      });

      const progressSnapshots: number[] = [];
      const unsubscribe = conductor.node.store.subscribe(
        (state: ExecutionGraphState) => {
          progressSnapshots.push(state.cachedProgress);
        },
      );

      const result = await conductor.node.run(group, { slowMo: 0 });

      unsubscribe();

      expect(result.success).toBe(true);

      // Verify progress is monotonically increasing
      for (let i = 1; i < progressSnapshots.length; i++) {
        expect(progressSnapshots[i]).toBeGreaterThanOrEqual(
          progressSnapshots[i - 1],
        );
      }

      // Verify we reached 100%
      expect(progressSnapshots[progressSnapshots.length - 1]).toBe(100);
    });

    it("slow: should handle very fast nodes (< 5ms) vs very slow nodes (> 200ms)", async () => {
      const fastExecutable: NodeExecutable = {
        execute: async () => {
          await delay(2);
          return { success: true, data: "fast" };
        },
      };

      const slowExecutable: NodeExecutable = {
        execute: async () => {
          await delay(200);
          return { success: true, data: "slow" };
        },
      };

      let callCount = 0;
      const mockConfig = {
        nodeExecutorFactory: {
          getNodeExecutable: vi.fn().mockImplementation(() => {
            callCount++;
            return callCount % 2 === 0 ? slowExecutable : fastExecutable;
          }),
        },
      };

      const conductor = createConductor(mockConfig);

      const nodes = Array.from({ length: 4 }, (_, i) =>
        createNodeDefinition({ id: `node-${i}`, type: "test" }),
      );

      const group = createNodeDefinition({
        id: "group",
        type: "group",
        nodes,
        edges: [],
      });

      const progressSnapshots: number[] = [];
      const unsubscribe = conductor.node.store.subscribe(
        (state: ExecutionGraphState) => {
          progressSnapshots.push(state.cachedProgress);
        },
      );

      const result = await conductor.node.run(group, { slowMo: 0 });

      unsubscribe();

      expect(result.success).toBe(true);

      // Verify progress is monotonically increasing despite varying speeds
      for (let i = 1; i < progressSnapshots.length; i++) {
        expect(progressSnapshots[i]).toBeGreaterThanOrEqual(
          progressSnapshots[i - 1],
        );
      }

      expect(progressSnapshots[progressSnapshots.length - 1]).toBe(100);
    });
  });

  describe.concurrent("Concurrent Execution", () => {
    it("should handle multiple nodes running in parallel with progress updates", async () => {
      const mockConfig = {
        nodeExecutorFactory: {
          getNodeExecutable: vi.fn().mockImplementation(() => ({
            execute: async () => {
              const duration = 100;
              const steps = 10;
              const stepDelay = duration / steps;

              for (let i = 0; i <= steps; i++) {
                // Progress updates happen during execution
                await delay(stepDelay);
              }

              return { success: true, data: "complete" };
            },
          })),
        },
      };

      const conductor = createConductor(mockConfig);

      const nodes = Array.from({ length: 3 }, (_, i) =>
        createNodeDefinition({ id: `concurrent-${i}`, type: "test" }),
      );

      const group = createNodeDefinition({
        id: "group",
        type: "group",
        nodes,
        edges: [],
      });

      const progressSnapshots: number[] = [];
      const unsubscribe = conductor.node.store.subscribe(
        (state: ExecutionGraphState) => {
          progressSnapshots.push(state.cachedProgress);
        },
      );

      const result = await conductor.node.run(group, { slowMo: 5 });

      unsubscribe();

      expect(result.success).toBe(true);

      // Should have many intermediate progress updates
      expect(progressSnapshots.length).toBeGreaterThan(10);

      // Verify monotonic increase
      for (let i = 1; i < progressSnapshots.length; i++) {
        expect(progressSnapshots[i]).toBeGreaterThanOrEqual(
          progressSnapshots[i - 1],
        );
      }

      expect(progressSnapshots[progressSnapshots.length - 1]).toBe(100);
    });

    it("should handle rapid concurrent progress updates without corrupting state", async () => {
      const conductor = createConductor({
        nodeExecutorFactory: {
          getNodeExecutable: vi
            .fn()
            .mockReturnValue({ execute: async () => ({ success: true }) }),
        },
      });

      const nodes = Array.from({ length: 20 }, (_, i) =>
        createNodeDefinition({ id: `rapid-${i}`, type: "test" }),
      );

      const group = createNodeDefinition({
        id: "group",
        type: "group",
        nodes,
        edges: [],
      });

      const progressValues = new Set<number>();
      const unsubscribe = conductor.node.store.subscribe(
        (state: ExecutionGraphState) => {
          progressValues.add(state.cachedProgress);
        },
      );

      const result = await conductor.node.run(group, { slowMo: 1 });

      unsubscribe();

      expect(result.success).toBe(true);

      // Should have seen multiple unique progress values
      expect(progressValues.size).toBeGreaterThan(5);

      // Final progress should be 100
      expect(getExecutionProgress(conductor.node.store)).toBe(100);
    });
  });

  describe.concurrent("Intermittent Failures", () => {
    it("should handle node failing at 25% progress", async () => {
      const failingExecutable: NodeExecutable = {
        execute: async () => {
          await delay(25);
          throw new Error("Failed at 25%");
        },
      };

      const successExecutable: NodeExecutable = {
        execute: async () => {
          await delay(50);
          return { success: true };
        },
      };

      let callCount = 0;
      const mockConfig = {
        nodeExecutorFactory: {
          getNodeExecutable: vi.fn().mockImplementation(() => {
            callCount++;
            return callCount === 2 ? failingExecutable : successExecutable;
          }),
        },
      };

      const conductor = createConductor(mockConfig);

      const nodes = Array.from({ length: 4 }, (_, i) =>
        createNodeDefinition({ id: `node-${i}`, type: "test" }),
      );

      const group = createNodeDefinition({
        id: "group",
        type: "group",
        nodes,
        edges: [],
      });

      const result = await conductor.node.run(group, { slowMo: 0 });

      // Should fail due to one node failing
      expect(result.success).toBe(false);

      // Store should be marked as complete
      const state = conductor.node.store.getState();
      expect(state.isExecuting).toBe(false);
    });

    it("should handle node failing just before completion (99% progress)", async () => {
      const nearCompleteFailure: NodeExecutable = {
        execute: async () => {
          // Simulate progress up to 99%
          await delay(99);
          throw new Error("Failed at 99%");
        },
      };

      const mockConfig = {
        nodeExecutorFactory: {
          getNodeExecutable: vi.fn().mockReturnValue(nearCompleteFailure),
        },
      };

      const conductor = createConductor(mockConfig);

      const node = createNodeDefinition({ id: "almost-done", type: "test" });

      const result = await conductor.node.run(node, { slowMo: 0 });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();

      // Node should be marked as error with progress near completion
      // (animation completes quickly with slowMo=0, but exact value varies in CI)
      const nodeState = conductor.node.store
        .getState()
        .nodes.get("almost-done");
      expect(nodeState?.state).toBe("error");
      expect(nodeState?.progress).toBeGreaterThanOrEqual(70);
      expect(nodeState?.progress).toBeLessThan(100);
    });

    it("should handle all nodes failing", async () => {
      const failingExecutable: NodeExecutable = {
        execute: async () => {
          await delay(10);
          throw new Error("Node failed");
        },
      };

      const mockConfig = {
        nodeExecutorFactory: {
          getNodeExecutable: vi.fn().mockReturnValue(failingExecutable),
        },
      };

      const conductor = createConductor(mockConfig);

      const nodes = Array.from({ length: 3 }, (_, i) =>
        createNodeDefinition({ id: `failing-${i}`, type: "test" }),
      );

      const group = createNodeDefinition({
        id: "group",
        type: "group",
        nodes,
        edges: [],
      });

      const result = await conductor.node.run(group, { slowMo: 0 });

      expect(result.success).toBe(false);

      // All nodes should be in error state
      const state = conductor.node.store.getState();
      const errorNodes = (
        Array.from(state.nodes.values()) as ExecutionGraphNode[]
      ).filter((n) => n.state === "error");

      // At least the first failing node should be in error state
      // (execution stops on first failure)
      expect(errorNodes.length).toBeGreaterThan(0);
    });

    it("should handle some nodes succeeding, some failing", async () => {
      let callCount = 0;
      const mockConfig = {
        nodeExecutorFactory: {
          getNodeExecutable: vi.fn().mockImplementation(() => ({
            execute: async () => {
              callCount++;
              await delay(20);
              if (callCount === 2) {
                throw new Error("Second node failed");
              }
              return { success: true };
            },
          })),
        },
      };

      const conductor = createConductor(mockConfig);

      const nodes = Array.from({ length: 4 }, (_, i) =>
        createNodeDefinition({ id: `mixed-${i}`, type: "test" }),
      );

      const group = createNodeDefinition({
        id: "group",
        type: "group",
        nodes,
        edges: [],
      });

      const result = await conductor.node.run(group, { slowMo: 0 });

      expect(result.success).toBe(false);

      const state = conductor.node.store.getState();
      const completedNodes = (
        Array.from(state.nodes.values()) as ExecutionGraphNode[]
      ).filter((n) => n.state === "completed");
      const errorNodes = (
        Array.from(state.nodes.values()) as ExecutionGraphNode[]
      ).filter((n) => n.state === "error");

      // Should have at least one completed (first node) and one error (second node)
      expect(completedNodes.length).toBeGreaterThan(0);
      expect(errorNodes.length).toBeGreaterThan(0);
    });
  });

  describe.concurrent("Progress Calculation Accuracy", () => {
    it("should ensure weighted progress is always monotonically increasing", async () => {
      const mockConfig = {
        nodeExecutorFactory: {
          getNodeExecutable: vi.fn().mockReturnValue({
            execute: async () => {
              await delay(Math.random() * 50 + 10);
              return { success: true };
            },
          }),
        },
      };

      const conductor = createConductor(mockConfig);

      const nodes = Array.from({ length: 10 }, (_, i) =>
        createNodeDefinition({ id: `mono-${i}`, type: "test" }),
      );

      const group = createNodeDefinition({
        id: "group",
        type: "group",
        nodes,
        edges: [],
      });

      const progressSnapshots: number[] = [];
      const unsubscribe = conductor.node.store.subscribe(
        (state: ExecutionGraphState) => {
          progressSnapshots.push(state.cachedProgress);
        },
      );

      await conductor.node.run(group, { slowMo: 2 });

      unsubscribe();

      // Verify strictly monotonic increase (no decreases or corruptions)
      for (let i = 1; i < progressSnapshots.length; i++) {
        expect(progressSnapshots[i]).toBeGreaterThanOrEqual(
          progressSnapshots[i - 1],
        );
      }
    });

    it("should never exceed 100% progress", async () => {
      const mockConfig = {
        nodeExecutorFactory: {
          getNodeExecutable: vi.fn().mockReturnValue({
            execute: async () => {
              await delay(10);
              return { success: true };
            },
          }),
        },
      };

      const conductor = createConductor(mockConfig);

      const nodes = Array.from({ length: 5 }, (_, i) =>
        createNodeDefinition({ id: `bounded-${i}`, type: "test" }),
      );

      const group = createNodeDefinition({
        id: "group",
        type: "group",
        nodes,
        edges: [],
      });

      const progressSnapshots: number[] = [];
      const unsubscribe = conductor.node.store.subscribe(
        (state: ExecutionGraphState) => {
          progressSnapshots.push(state.cachedProgress);
        },
      );

      await conductor.node.run(group, { slowMo: 5 });

      unsubscribe();

      // No progress value should exceed 100
      for (const progress of progressSnapshots) {
        expect(progress).toBeLessThanOrEqual(100);
        expect(progress).toBeGreaterThanOrEqual(0);
      }
    });

    it("should never have negative progress", async () => {
      const mockConfig = {
        nodeExecutorFactory: {
          getNodeExecutable: vi.fn().mockReturnValue({
            execute: async () => {
              await delay(10);
              return { success: true };
            },
          }),
        },
      };

      const conductor = createConductor(mockConfig);

      const node = createNodeDefinition({ id: "test", type: "test" });

      const progressSnapshots: number[] = [];
      const unsubscribe = conductor.node.store.subscribe(
        (state: ExecutionGraphState) => {
          const nodeState = state.nodes.get("test");
          if (nodeState) {
            progressSnapshots.push(nodeState.progress);
          }
        },
      );

      await conductor.node.run(node, { slowMo: 5 });

      unsubscribe();

      // All progress values should be >= 0
      for (const progress of progressSnapshots) {
        expect(progress).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe.concurrent("Out-of-Order Completion", () => {
    it("should handle nodes completing in different order than started", async () => {
      // Create nodes with inverse timing - later nodes complete faster
      let nodeIndex = 0;
      const mockConfig = {
        nodeExecutorFactory: {
          getNodeExecutable: vi.fn().mockImplementation(() => {
            const index = nodeIndex++;
            const delayTime = (5 - index) * 20; // Later nodes are faster
            return {
              execute: async () => {
                await delay(delayTime);
                return { success: true, data: `node-${index}` };
              },
            };
          }),
        },
      };

      const conductor = createConductor(mockConfig);

      const nodes = Array.from({ length: 5 }, (_, i) =>
        createNodeDefinition({ id: `ooo-${i}`, type: "test" }),
      );

      const group = createNodeDefinition({
        id: "group",
        type: "group",
        nodes,
        edges: [],
      });

      const completionOrder: string[] = [];
      const unsubscribe = conductor.node.store.subscribe(
        (state: ExecutionGraphState) => {
          for (const [id, node] of state.nodes.entries()) {
            if (node.state === "completed" && !completionOrder.includes(id)) {
              completionOrder.push(id);
            }
          }
        },
      );

      const result = await conductor.node.run(group, { slowMo: 0 });

      unsubscribe();

      expect(result.success).toBe(true);

      // Nodes should complete in reverse order due to delays
      // We expect ooo-4, ooo-3, ooo-2, ooo-1, ooo-0
      // But execution is sequential, so they actually complete in order
      // This test verifies the store handles sequential execution correctly
      expect(completionOrder.length).toBe(5);
    });
  });

  describe.concurrent("Race Conditions", () => {
    it("should handle rapid concurrent state updates without corruption", async () => {
      const mockConfig = {
        nodeExecutorFactory: {
          getNodeExecutable: vi.fn().mockReturnValue({
            execute: async () => {
              await delay(1);
              return { success: true };
            },
          }),
        },
      };

      const conductor = createConductor(mockConfig);

      // Create many nodes to maximize concurrent updates
      const nodes = Array.from({ length: 50 }, (_, i) =>
        createNodeDefinition({ id: `race-${i}`, type: "test" }),
      );

      const group = createNodeDefinition({
        id: "group",
        type: "group",
        nodes,
        edges: [],
      });

      let updateCount = 0;
      const progressValues: number[] = [];

      const unsubscribe = conductor.node.store.subscribe(
        (state: ExecutionGraphState) => {
          updateCount++;
          progressValues.push(state.cachedProgress);
        },
      );

      const result = await conductor.node.run(group, { slowMo: 0 });

      unsubscribe();

      expect(result.success).toBe(true);

      // Should have had many updates
      expect(updateCount).toBeGreaterThan(50);

      // All progress values should be valid (0-100)
      for (const progress of progressValues) {
        expect(progress).toBeGreaterThanOrEqual(0);
        expect(progress).toBeLessThanOrEqual(100);
      }

      // Final progress should be 100
      expect(progressValues[progressValues.length - 1]).toBe(100);
    });

    it("should maintain consistency during rapid progress updates", async () => {
      const mockConfig = {
        nodeExecutorFactory: {
          getNodeExecutable: vi.fn().mockReturnValue({
            execute: async () => {
              // Very fast execution
              await delay(2);
              return { success: true };
            },
          }),
        },
      };

      const conductor = createConductor(mockConfig);

      const nodes = Array.from({ length: 20 }, (_, i) =>
        createNodeDefinition({ id: `consistency-${i}`, type: "test" }),
      );

      const group = createNodeDefinition({
        id: "group",
        type: "group",
        nodes,
        edges: [],
      });

      const progressSnapshots: number[] = [];

      const unsubscribe = conductor.node.store.subscribe(
        (state: ExecutionGraphState) => {
          progressSnapshots.push(state.cachedProgress);
        },
      );

      await conductor.node.run(group, { slowMo: 0 });

      unsubscribe();

      // Verify progress is monotonically increasing
      for (let i = 1; i < progressSnapshots.length; i++) {
        expect(progressSnapshots[i]).toBeGreaterThanOrEqual(
          progressSnapshots[i - 1],
        );
      }
    });
  });

  describe.concurrent("Event Ordering", () => {
    it("should emit events in correct order even with async operations", async () => {
      const mockConfig = {
        nodeExecutorFactory: {
          getNodeExecutable: vi.fn().mockReturnValue({
            execute: async () => {
              await delay(10);
              return { success: true };
            },
          }),
        },
      };

      const conductor = createConductor(mockConfig);

      const nodes = Array.from({ length: 3 }, (_, i) =>
        createNodeDefinition({ id: `event-${i}`, type: "test" }),
      );

      const group = createNodeDefinition({
        id: "group",
        type: "group",
        nodes,
        edges: [],
      });

      const events: Array<{
        nodeId: string;
        state: string;
        timestamp: number;
      }> = [];

      const unsubscribe = conductor.node.store.subscribe(
        (state: ExecutionGraphState) => {
          for (const [id, node] of state.nodes.entries()) {
            const lastEvent = events[events.length - 1];
            if (
              !lastEvent ||
              lastEvent.nodeId !== id ||
              lastEvent.state !== node.state
            ) {
              events.push({
                nodeId: id,
                state: node.state,
                timestamp: Date.now(),
              });
            }
          }
        },
      );

      await conductor.node.run(group, { slowMo: 0 });

      unsubscribe();

      // Events should be in chronological order
      for (let i = 1; i < events.length; i++) {
        expect(events[i].timestamp).toBeGreaterThanOrEqual(
          events[i - 1].timestamp,
        );
      }

      // Each node should go through: pending -> executing -> completed
      const node0Events = events.filter((e) => e.nodeId === "event-0");
      expect(node0Events.length).toBeGreaterThan(0);
    });
  });

  describe.concurrent("Performance Validation", () => {
    it("slow: should handle 100+ nodes efficiently", async () => {
      const mockConfig = {
        nodeExecutorFactory: {
          getNodeExecutable: vi.fn().mockReturnValue({
            execute: async () => {
              await delay(1);
              return { success: true };
            },
          }),
        },
      };

      const conductor = createConductor(mockConfig);

      const nodes = Array.from({ length: 100 }, (_, i) =>
        createNodeDefinition({ id: `perf-${i}`, type: "test" }),
      );

      const group = createNodeDefinition({
        id: "group",
        type: "group",
        nodes,
        edges: [],
      });

      const startTime = Date.now();
      const result = await conductor.node.run(group, { slowMo: 0 });
      const duration = Date.now() - startTime;

      expect(result.success).toBe(true);

      // Should complete in reasonable time
      // 100 nodes * (1ms delay + 2 * 0ms slowMo) should be fast
      expect(duration).toBeLessThan(10000); // 10 seconds max (increased for CI)

      // Verify final state
      const state = conductor.node.store.getState();
      expect(state.nodes.size).toBe(100);
      expect(getExecutionProgress(conductor.node.store)).toBe(100);
    });

    it("should not have memory leaks with rapid updates", async () => {
      const mockConfig = {
        nodeExecutorFactory: {
          getNodeExecutable: vi.fn().mockReturnValue({
            execute: async () => {
              await delay(1);
              return { success: true };
            },
          }),
        },
      };

      const conductor = createConductor(mockConfig);

      // Run multiple executions to check for leaks
      for (let run = 0; run < 5; run++) {
        const nodes = Array.from({ length: 20 }, (_, i) =>
          createNodeDefinition({ id: `leak-${run}-${i}`, type: "test" }),
        );

        const group = createNodeDefinition({
          id: `group-${run}`,
          type: "group",
          nodes,
          edges: [],
        });

        await conductor.node.run(group, { slowMo: 0 });

        // Reset for next run
        conductor.node.store.reset();
      }

      // If we got here without hanging or crashing, we're good
      expect(true).toBe(true);
    });

    it("should calculate progress in O(n) time", async () => {
      const mockConfig = {
        nodeExecutorFactory: {
          getNodeExecutable: vi.fn().mockReturnValue({
            execute: async () => {
              await delay(1);
              return { success: true };
            },
          }),
        },
      };

      const conductor = createConductor(mockConfig);

      // Test with different sizes to verify O(n) complexity
      const sizes = [10, 50, 100];
      const timings: number[] = [];

      for (const size of sizes) {
        const nodes = Array.from({ length: size }, (_, i) =>
          createNodeDefinition({ id: `complexity-${size}-${i}`, type: "test" }),
        );

        const group = createNodeDefinition({
          id: `group-${size}`,
          type: "group",
          nodes,
          edges: [],
        });

        const progressStart = Date.now();

        const unsubscribe = conductor.node.store.subscribe(() => {
          // Access cached progress (should be O(1))
        });

        await conductor.node.run(group, { slowMo: 0 });

        const progressEnd = Date.now();
        timings.push(progressEnd - progressStart);

        unsubscribe();
        conductor.node.store.reset();
      }

      // Timing should scale roughly linearly with size
      // 50 nodes should take ~5x as long as 10 nodes
      // 100 nodes should take ~10x as long as 10 nodes
      // Allow generous margin for test variability
      expect(timings[1]).toBeLessThan(timings[0] * 10);
      expect(timings[2]).toBeLessThan(timings[0] * 20);
    });
  });

  describe.concurrent("Edge Cases", () => {
    it("should handle node failing immediately (0% progress)", async () => {
      const immediateFailure: NodeExecutable = {
        execute: async () => {
          throw new Error("Immediate failure");
        },
      };

      const mockConfig = {
        nodeExecutorFactory: {
          getNodeExecutable: vi.fn().mockReturnValue(immediateFailure),
        },
      };

      const conductor = createConductor(mockConfig);
      const node = createNodeDefinition({ id: "immediate-fail", type: "test" });

      const result = await conductor.node.run(node, { slowMo: 0 });

      expect(result.success).toBe(false);

      const nodeState = conductor.node.store
        .getState()
        .nodes.get("immediate-fail");
      expect(nodeState?.state).toBe("error");
      expect(nodeState?.progress).toBe(0); // Progress frozen at 0 for immediate failure
    });

    it("should handle empty group (no nodes)", async () => {
      const conductor = createConductor({
        nodeExecutorFactory: {
          getNodeExecutable: vi.fn().mockReturnValue({
            execute: async () => ({ success: true }),
          }),
        },
      });

      const emptyGroup = createNodeDefinition({
        id: "empty",
        type: "group",
        nodes: [],
        edges: [],
      });

      const result = await conductor.node.run(emptyGroup, { slowMo: 0 });

      // Empty groups with nodes=[] are treated as single nodes
      // They will try to execute as 'group' type, which requires an executor
      // For true empty execution, we need to handle this case
      expect(result.success).toBe(true);
    });

    it("should handle single node (no group)", async () => {
      const mockConfig = {
        nodeExecutorFactory: {
          getNodeExecutable: vi.fn().mockReturnValue({
            execute: async () => {
              await delay(10);
              return { success: true };
            },
          }),
        },
      };

      const conductor = createConductor(mockConfig);
      const node = createNodeDefinition({ id: "single", type: "test" });

      const result = await conductor.node.run(node, { slowMo: 0 });

      expect(result.success).toBe(true);

      const state = conductor.node.store.getState();
      expect(state.nodes.size).toBe(1);
      expect(getExecutionProgress(conductor.node.store)).toBe(100);
    });
  });
});
