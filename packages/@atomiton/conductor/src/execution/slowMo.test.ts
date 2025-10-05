import { describe, it, expect, beforeEach, vi } from "vitest";
import { createConductor } from "#index";
import { createNodeDefinition } from "@atomiton/nodes/definitions";
import type { NodeExecutable } from "@atomiton/nodes/executables";
import type {
  ExecutionGraphState,
  ExecutionGraphNode,
} from "#execution/executionGraphStore";

describe("SlowMo Execution Tests", () => {
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

  describe("slowMo context propagation", () => {
    it("should pass slowMo value through execution context", async () => {
      const conductor = createConductor(createMockConfig());

      const node = createNodeDefinition({
        id: "test-node",
        type: "test",
      });

      const result = await conductor.node.run(node, {
        slowMo: 1000,
      });

      expect(result.success).toBe(true);
      expect(result.context?.slowMo).toBe(1000);
    });

    it("should use default slowMo value when not provided", async () => {
      const conductor = createConductor(createMockConfig());

      const node = createNodeDefinition({
        id: "test-node",
        type: "test",
      });

      const result = await conductor.node.run(node);

      expect(result.success).toBe(true);
      expect(result.context?.slowMo).toBeUndefined();
    });

    it("should propagate slowMo to child nodes in a group", async () => {
      const conductor = createConductor(createMockConfig());

      const child1 = createNodeDefinition({
        id: "child-1",
        type: "test",
      });

      const child2 = createNodeDefinition({
        id: "child-2",
        type: "test",
      });

      const group = createNodeDefinition({
        id: "group",
        type: "group",
        nodes: [child1, child2],
        edges: [],
      });

      const result = await conductor.node.run(group, {
        slowMo: 500,
      });

      expect(result.success).toBe(true);
      expect(result.context?.slowMo).toBe(500);
    });

    it("should handle slowMo = 0 (instant execution)", async () => {
      const conductor = createConductor(createMockConfig());

      const node = createNodeDefinition({
        id: "test-node",
        type: "test",
      });

      const startTime = Date.now();
      const result = await conductor.node.run(node, {
        slowMo: 0,
      });
      const duration = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(result.context?.slowMo).toBe(0);
      // With slowMo=0, execution should be very fast (< 50ms)
      expect(duration).toBeLessThan(50);
    });
  });

  describe("execution timing", () => {
    it("slow: should take longer with higher slowMo values", async () => {
      const conductor = createConductor(createMockConfig());

      const node = createNodeDefinition({
        id: "test-node",
        type: "test",
      });

      // Fast execution (slowMo = 10ms = 20ms total for 2 steps)
      const startFast = Date.now();
      await conductor.node.run(node, { slowMo: 10 });
      const fastDuration = Date.now() - startFast;

      // Reset the store
      conductor.node.store.reset();

      // Slow execution (slowMo = 50ms = 100ms total for 2 steps)
      const startSlow = Date.now();
      await conductor.node.run(node, { slowMo: 50 });
      const slowDuration = Date.now() - startSlow;

      // Slow execution should take approximately 5x longer
      // Allow some variance for test execution overhead
      expect(slowDuration).toBeGreaterThan(fastDuration * 3);
    });

    it("slow: should respect slowMo timing for multiple nodes", async () => {
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

      // Each node has 2 delays of 25ms = 50ms per node
      // 3 nodes = 150ms minimum total
      const slowMo = 25;
      const expectedMinDuration = slowMo * 2 * 3; // 2 steps per node * 3 nodes

      const startTime = Date.now();
      await conductor.node.run(group, { slowMo });
      const duration = Date.now() - startTime;

      // Should take at least the expected duration
      // Allow some overhead, but should be reasonably close
      expect(duration).toBeGreaterThanOrEqual(expectedMinDuration * 0.8);
    });
  });

  describe("progress reporting with slowMo", () => {
    it("should report progress updates during slowMo delays", async () => {
      const conductor = createConductor(createMockConfig());

      const node = createNodeDefinition({
        id: "test-node",
        type: "test",
      });

      const progressUpdates: number[] = [];

      // Subscribe to progress changes
      const unsubscribe = conductor.node.store.subscribe(
        (state: ExecutionGraphState) => {
          const nodeState = Array.from(
            state.nodes.values(),
          )[0] as ExecutionGraphNode;
          if (nodeState?.progress !== undefined) {
            progressUpdates.push(nodeState.progress);
          }
        },
      );

      await conductor.node.run(node, { slowMo: 50 });

      unsubscribe();

      // Should have seen: 0, 20, 40, 60, 80, 90, 100 (sequential progress steps)
      expect(progressUpdates).toContain(0);
      expect(progressUpdates).toContain(20);
      expect(progressUpdates).toContain(100);
    });

    it("should track progress correctly for group with slowMo", async () => {
      const conductor = createConductor(createMockConfig());

      const child1 = createNodeDefinition({ id: "child-1", type: "test" });
      const child2 = createNodeDefinition({ id: "child-2", type: "test" });

      const group = createNodeDefinition({
        id: "group",
        type: "group",
        nodes: [child1, child2],
        edges: [],
      });

      const progressSnapshots: number[] = [];

      const unsubscribe = conductor.node.store.subscribe(
        (state: ExecutionGraphState) => {
          // Track overall execution progress
          progressSnapshots.push(state.cachedProgress);
        },
      );

      await conductor.node.run(group, { slowMo: 20 });

      unsubscribe();

      // Should progress from 0 to 100
      expect(progressSnapshots[0]).toBe(0);
      expect(progressSnapshots[progressSnapshots.length - 1]).toBe(100);
      // Should have intermediate values
      expect(progressSnapshots.length).toBeGreaterThan(4);
    });
  });

  describe("slowMo edge cases", () => {
    it("slow: should handle very large slowMo values", async () => {
      const conductor = createConductor(createMockConfig());

      const node = createNodeDefinition({
        id: "test-node",
        type: "test",
      });

      // Use a large value but still reasonable for testing (100ms per step)
      const result = await conductor.node.run(node, { slowMo: 100 });

      expect(result.success).toBe(true);
      expect(result.duration).toBeGreaterThanOrEqual(200); // 2 * 100ms
    });

    it("should handle negative slowMo values gracefully", async () => {
      const conductor = createConductor(createMockConfig());

      const node = createNodeDefinition({
        id: "test-node",
        type: "test",
      });

      // Negative values should be treated as 0 or minimal delay
      const result = await conductor.node.run(node, { slowMo: -100 });

      expect(result.success).toBe(true);
      // Should still execute successfully
    });

    it("should handle fractional slowMo values", async () => {
      const conductor = createConductor(createMockConfig());

      const node = createNodeDefinition({
        id: "test-node",
        type: "test",
      });

      const result = await conductor.node.run(node, { slowMo: 10.5 });

      expect(result.success).toBe(true);
      expect(result.context?.slowMo).toBe(10.5);
    });
  });

  describe("slowMo with long-running nodes", () => {
    it("critical: should run animation in parallel with execution and wait for both", async () => {
      // This tests the scenario where a node (e.g., HTTP request) takes much longer
      // than the slowMo animation. Animation and execution run IN PARALLEL.
      // Progress should stay at 90% while execution continues, then jump to 100%.

      const longRunningExecutable: NodeExecutable = {
        execute: vi.fn().mockImplementation(async () => {
          // Simulate a long-running operation (e.g., HTTP request) - 500ms
          await new Promise((resolve) => setTimeout(resolve, 500));
          return { success: true, data: "completed" };
        }),
      };

      const conductor = createConductor({
        nodeExecutorFactory: {
          getNodeExecutable: vi.fn().mockReturnValue(longRunningExecutable),
        },
      });

      const node = createNodeDefinition({
        id: "long-node",
        type: "http-request",
      });

      const progressSnapshots: Array<{ progress: number; timestamp: number }> =
        [];
      const startTime = Date.now();

      const unsubscribe = conductor.node.store.subscribe(
        (state: ExecutionGraphState) => {
          const nodeState = Array.from(
            state.nodes.values(),
          )[0] as ExecutionGraphNode;
          if (nodeState?.progress !== undefined) {
            progressSnapshots.push({
              progress: nodeState.progress,
              timestamp: Date.now() - startTime,
            });
          }
        },
      );

      // Use small slowMo (20ms per step = ~100ms animation total)
      // But node execution takes 500ms
      // Total time should be ~500ms (max of animation and execution)
      const result = await conductor.node.run(node, { slowMo: 20 });

      unsubscribe();

      // Verify result
      expect(result.success).toBe(true);
      expect(result.duration).toBeGreaterThanOrEqual(500); // Execution time dominates

      // Verify the sequence:
      // 1. Progress goes 0 → 20 → 40 → 60 → 80 → 90 (animation runs in parallel)
      expect(progressSnapshots.some((s) => s.progress === 0)).toBe(true);
      expect(progressSnapshots.some((s) => s.progress === 20)).toBe(true);
      expect(progressSnapshots.some((s) => s.progress === 40)).toBe(true);
      expect(progressSnapshots.some((s) => s.progress === 60)).toBe(true);
      expect(progressSnapshots.some((s) => s.progress === 80)).toBe(true);
      expect(progressSnapshots.some((s) => s.progress === 90)).toBe(true);

      // 2. Find when progress hit 90% and when it hit 100%
      const reached90 = progressSnapshots.find((s) => s.progress === 90);
      const reached100 = progressSnapshots.find((s) => s.progress === 100);

      expect(reached90).toBeDefined();
      expect(reached100).toBeDefined();

      // 3. Animation finishes at ~100ms (90%), execution at ~500ms (100%)
      // Gap between 90% and 100% should be ~400ms
      const gapBetween90And100 = reached100!.timestamp - reached90!.timestamp;

      // Should be at least 350ms (allowing tolerance for test timing)
      expect(gapBetween90And100).toBeGreaterThanOrEqual(350);

      // 4. Progress at 90% should happen early (~100ms)
      expect(reached90!.timestamp).toBeLessThan(150);

      // 5. Progress at 100% should happen late (~500ms)
      expect(reached100!.timestamp).toBeGreaterThanOrEqual(450);

      // 6. Final progress should be 100%
      expect(progressSnapshots[progressSnapshots.length - 1].progress).toBe(
        100,
      );
    });

    it("critical: should complete animation even when execution finishes first", async () => {
      // Opposite scenario: node executes instantly but slowMo animation is slow
      // Execution finishes first, but we wait for animation to complete before marking 100%
      const fastExecutable: NodeExecutable = {
        execute: vi.fn().mockResolvedValue("fast"), // Just return data, not result object
      };

      const conductor = createConductor({
        nodeExecutorFactory: {
          getNodeExecutable: vi.fn().mockReturnValue(fastExecutable),
        },
      });

      const node = createNodeDefinition({
        id: "fast-node",
        type: "instant",
      });

      const progressSnapshots: Array<{ progress: number; timestamp: number }> =
        [];
      const startTime = Date.now();

      const unsubscribe = conductor.node.store.subscribe(
        (state: ExecutionGraphState) => {
          const nodeState = Array.from(
            state.nodes.values(),
          )[0] as ExecutionGraphNode;
          if (nodeState?.progress !== undefined) {
            progressSnapshots.push({
              progress: nodeState.progress,
              timestamp: Date.now() - startTime,
            });
          }
        },
      );

      // 50ms per step = ~250ms animation, but execution is instant
      const result = await conductor.node.run(node, { slowMo: 50 });
      const duration = Date.now() - startTime;

      unsubscribe();

      // Should show all progress steps even though execution is instant
      expect(progressSnapshots.some((s) => s.progress === 0)).toBe(true);
      expect(progressSnapshots.some((s) => s.progress === 20)).toBe(true);
      expect(progressSnapshots.some((s) => s.progress === 40)).toBe(true);
      expect(progressSnapshots.some((s) => s.progress === 60)).toBe(true);
      expect(progressSnapshots.some((s) => s.progress === 80)).toBe(true);
      expect(progressSnapshots.some((s) => s.progress === 90)).toBe(true);
      expect(progressSnapshots.some((s) => s.progress === 100)).toBe(true);

      // Total duration should be dominated by slowMo animation, not execution
      expect(duration).toBeGreaterThanOrEqual(200); // At least ~4 steps of 50ms

      // 100% should happen at the END of animation (~250ms), not instantly
      const reached100 = progressSnapshots.find((s) => s.progress === 100);
      expect(reached100).toBeDefined();
      expect(reached100!.timestamp).toBeGreaterThanOrEqual(200);

      // Result should be successful
      expect(result.success).toBe(true);
      expect(result.data).toBe("fast");
    });
  });

  describe("slowMo with execution errors", () => {
    it("should error immediately without waiting for slowMo animation", async () => {
      const failingExecutable: NodeExecutable = {
        execute: vi.fn().mockRejectedValue(new Error("Execution failed")),
      };

      const conductor = createConductor({
        nodeExecutorFactory: {
          getNodeExecutable: vi.fn().mockReturnValue(failingExecutable),
        },
      });

      const node = createNodeDefinition({
        id: "test-node",
        type: "test",
      });

      const startTime = Date.now();
      const result = await conductor.node.run(node, { slowMo: 50 });
      const duration = Date.now() - startTime;

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      // Should error immediately, not wait for slowMo delays
      expect(duration).toBeLessThan(100); // Fast error response
    });

    it("should freeze progress at current state when node errors", async () => {
      const failingExecutable: NodeExecutable = {
        execute: vi.fn().mockRejectedValue(new Error("Test error")),
      };

      const conductor = createConductor({
        nodeExecutorFactory: {
          getNodeExecutable: vi.fn().mockReturnValue(failingExecutable),
        },
      });

      const node = createNodeDefinition({
        id: "test-node",
        type: "test",
      });

      let finalProgress = 0;
      const unsubscribe = conductor.node.store.subscribe(
        (state: ExecutionGraphState) => {
          const nodeState = Array.from(
            state.nodes.values(),
          )[0] as ExecutionGraphNode;
          if (nodeState?.progress !== undefined) {
            finalProgress = nodeState.progress;
          }
        },
      );

      await conductor.node.run(node, { slowMo: 20 });

      unsubscribe();

      // Progress should be frozen at its current state (likely 0 since error was immediate)
      expect(finalProgress).toBeLessThanOrEqual(20); // Frozen at early state
    });
  });
});
