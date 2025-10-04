import { describe, it, expect, beforeEach, vi } from "vitest";
import { createConductor } from "#index";
import { createNodeDefinition } from "@atomiton/nodes/definitions";
import type { NodeExecutable } from "@atomiton/nodes/executables";

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
    it("should take longer with higher slowMo values", async () => {
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

    it("should respect slowMo timing for multiple nodes", async () => {
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
      const unsubscribe = conductor.node.store.subscribe((state: any) => {
        const nodeState = Array.from(state.nodes.values())[0] as any;
        if (nodeState?.progress !== undefined) {
          progressUpdates.push(nodeState.progress);
        }
      });

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

      const unsubscribe = conductor.node.store.subscribe((state: any) => {
        // Track overall execution progress
        progressSnapshots.push(state.cachedProgress);
      });

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
    it("should handle very large slowMo values", async () => {
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

  describe("slowMo with execution errors", () => {
    it("should respect slowMo even when execution fails", async () => {
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
      // Should still have taken time for the slowMo delays before failing
      expect(duration).toBeGreaterThanOrEqual(80); // At least some delay occurred
    });

    it("should update progress to 100 when node errors", async () => {
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
      const unsubscribe = conductor.node.store.subscribe((state: any) => {
        const nodeState = Array.from(state.nodes.values())[0] as any;
        if (nodeState?.progress !== undefined) {
          finalProgress = nodeState.progress;
        }
      });

      await conductor.node.run(node, { slowMo: 20 });

      unsubscribe();

      // Even though it failed, progress should be marked as 100 (complete/error)
      expect(finalProgress).toBe(100);
    });
  });
});
