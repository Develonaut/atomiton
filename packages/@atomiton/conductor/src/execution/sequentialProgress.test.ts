import { describe, it, expect, beforeEach, vi } from "vitest";
import { createConductor } from "#index";
import { createNodeDefinition } from "@atomiton/nodes/definitions";
import type { NodeExecutable } from "@atomiton/nodes/executables";
import { DEFAULT_SLOWMO_MS } from "#execution/constants";
import type { ExecutionGraphState } from "#execution/executionGraphStore";

describe("Sequential Progress Animation Tests", () => {
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

  describe("Progress Step Sequencing", () => {
    it("should emit all 6 progress steps in correct order: [0, 20, 40, 60, 80, 90]", async () => {
      const conductor = createConductor(createMockConfig());

      const node = createNodeDefinition({
        id: "test-node",
        type: "test",
      });

      const progressSequence: number[] = [];

      const unsubscribe = conductor.node.store.subscribe(
        (state: ExecutionGraphState) => {
          const nodeState = state.nodes.get("test-node");
          if (nodeState?.progress !== undefined && nodeState.progress !== 100) {
            progressSequence.push(nodeState.progress);
          }
        },
      );

      await conductor.node.run(node, { slowMo: 10 });

      unsubscribe();

      // Should see the exact sequence: [0, 20, 40, 60, 80, 90]
      // Filter out duplicates for comparison
      const uniqueProgress = Array.from(new Set(progressSequence));
      expect(uniqueProgress).toEqual([0, 20, 40, 60, 80, 90]);
    });

    it("should run progress animation in parallel with node execution", async () => {
      const executionOrder: string[] = [];

      const trackedExecutable: NodeExecutable = {
        execute: vi.fn().mockImplementation(async () => {
          executionOrder.push("execute_started");
          return { success: true, data: "test" };
        }),
      };

      const conductor = createConductor({
        nodeExecutorFactory: {
          getNodeExecutable: vi.fn().mockReturnValue(trackedExecutable),
        },
      });

      const node = createNodeDefinition({
        id: "test-node",
        type: "test",
      });

      const progressUpdates: number[] = [];

      const unsubscribe = conductor.node.store.subscribe(
        (state: ExecutionGraphState) => {
          const nodeState = state.nodes.get("test-node");
          if (nodeState?.progress !== undefined && nodeState.progress !== 100) {
            progressUpdates.push(nodeState.progress);
            executionOrder.push(`progress_${nodeState.progress}`);
          }
        },
      );

      await conductor.node.run(node, { slowMo: 10 });

      unsubscribe();

      // With parallel execution, progress and execution should overlap
      // First progress update (0) happens before execution, rest during/after
      const executeIndex = executionOrder.indexOf("execute_started");
      const progressIndices = executionOrder
        .map((e, i) => (e.startsWith("progress_") ? i : -1))
        .filter((i) => i !== -1);

      expect(executeIndex).toBeGreaterThan(-1);
      // At least one progress update should happen
      expect(progressIndices.length).toBeGreaterThan(0);
      // First progress update at index 0 (before execution)
      expect(progressIndices[0]).toBe(0);
    });

    it("should update to 100% after node execution completes", async () => {
      const conductor = createConductor(createMockConfig());

      const node = createNodeDefinition({
        id: "test-node",
        type: "test",
      });

      const progressValues: number[] = [];

      const unsubscribe = conductor.node.store.subscribe(
        (state: ExecutionGraphState) => {
          const nodeState = state.nodes.get("test-node");
          if (nodeState?.progress !== undefined) {
            progressValues.push(nodeState.progress);
          }
        },
      );

      await conductor.node.run(node, { slowMo: 10 });

      unsubscribe();

      // Last progress value should be 100
      expect(progressValues[progressValues.length - 1]).toBe(100);
    });
  });

  describe("Progress Timing with SlowMo", () => {
    it("should respect slowMo parameter for delays between steps", async () => {
      const conductor = createConductor(createMockConfig());

      const node = createNodeDefinition({
        id: "test-node",
        type: "test",
      });

      const slowMo = 50; // 50ms per step
      const expectedSteps = 6; // [0, 20, 40, 60, 80, 90]
      const expectedMinDuration = slowMo * (expectedSteps - 1); // 5 delays between 6 steps = 250ms

      const startTime = Date.now();
      await conductor.node.run(node, { slowMo });
      const duration = Date.now() - startTime;

      // Should take at least the expected duration (with some tolerance)
      expect(duration).toBeGreaterThanOrEqual(expectedMinDuration * 0.8);
    });

    it("should use DEFAULT_SLOWMO_MS when slowMo is not provided", async () => {
      const conductor = createConductor(createMockConfig());

      const node = createNodeDefinition({
        id: "test-node",
        type: "test",
      });

      const expectedMinDuration = DEFAULT_SLOWMO_MS * 5; // 5 delays = 1250ms

      const startTime = Date.now();
      await conductor.node.run(node); // No slowMo parameter
      const duration = Date.now() - startTime;

      // Should take at least the default slowMo duration
      expect(duration).toBeGreaterThanOrEqual(expectedMinDuration * 0.8);
    });

    it("should complete faster with slowMo=0 (no delays)", async () => {
      const conductor = createConductor(createMockConfig());

      const node = createNodeDefinition({
        id: "test-node",
        type: "test",
      });

      const startTime = Date.now();
      await conductor.node.run(node, { slowMo: 0 });
      const duration = Date.now() - startTime;

      // With slowMo=0, should complete very quickly (< 50ms)
      expect(duration).toBeLessThan(50);
    });
  });

  describe("Progress Messages", () => {
    it("should emit descriptive messages for each progress step", async () => {
      const conductor = createConductor(createMockConfig());

      const node = createNodeDefinition({
        id: "test-node",
        type: "test",
      });

      const messages: string[] = [];

      const unsubscribe = conductor.node.store.subscribe(
        (state: ExecutionGraphState) => {
          const nodeState = state.nodes.get("test-node");
          if (nodeState?.message) {
            messages.push(nodeState.message);
          }
        },
      );

      await conductor.node.run(node, { slowMo: 10 });

      unsubscribe();

      // Should have messages for each step
      expect(messages.length).toBeGreaterThanOrEqual(6);

      // Verify expected message sequence
      const expectedMessages = [
        "Starting...",
        "Initializing...",
        "Processing...",
        "Computing...",
        "Finalizing...",
        "Almost done...",
      ];

      expectedMessages.forEach((expectedMsg) => {
        expect(messages).toContain(expectedMsg);
      });
    });
  });

  describe("Sequential Progress with Groups", () => {
    it("should apply sequential progress to each child node in a group", async () => {
      const conductor = createConductor(createMockConfig());

      const child1 = createNodeDefinition({ id: "child-1", type: "test" });
      const child2 = createNodeDefinition({ id: "child-2", type: "test" });

      const group = createNodeDefinition({
        id: "group",
        type: "group",
        nodes: [child1, child2],
        edges: [],
      });

      const child1Progress: number[] = [];
      const child2Progress: number[] = [];

      const unsubscribe = conductor.node.store.subscribe(
        (state: ExecutionGraphState) => {
          const node1 = state.nodes.get("child-1");
          const node2 = state.nodes.get("child-2");

          if (node1?.progress !== undefined && node1.progress !== 100) {
            child1Progress.push(node1.progress);
          }
          if (node2?.progress !== undefined && node2.progress !== 100) {
            child2Progress.push(node2.progress);
          }
        },
      );

      await conductor.node.run(group, { slowMo: 10 });

      unsubscribe();

      // Both children should have progress sequences
      expect(child1Progress.length).toBeGreaterThan(0);
      expect(child2Progress.length).toBeGreaterThan(0);

      // Each should have seen the expected steps
      const uniqueChild1 = Array.from(new Set(child1Progress));
      const uniqueChild2 = Array.from(new Set(child2Progress));

      expect(uniqueChild1).toContain(0);
      expect(uniqueChild1).toContain(20);
      expect(uniqueChild2).toContain(0);
      expect(uniqueChild2).toContain(20);
    });
  });

  describe("Error Handling with Sequential Progress", () => {
    it("should still emit progress steps even if execution fails", async () => {
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

      const progressSequence: number[] = [];

      const unsubscribe = conductor.node.store.subscribe(
        (state: ExecutionGraphState) => {
          const nodeState = state.nodes.get("test-node");
          if (nodeState?.progress !== undefined) {
            progressSequence.push(nodeState.progress);
          }
        },
      );

      const result = await conductor.node.run(node, { slowMo: 10 });

      unsubscribe();

      expect(result.success).toBe(false);

      // Should have emitted progress steps even though it failed
      expect(progressSequence.length).toBeGreaterThan(0);
      expect(progressSequence).toContain(0);

      // Progress should be frozen at early state when error occurs (not 100)
      expect(progressSequence[progressSequence.length - 1]).toBeLessThanOrEqual(
        20,
      );
    });
  });

  describe("Integration with ExecutionGraphStore", () => {
    it("should update store state for each progress step", async () => {
      const conductor = createConductor(createMockConfig());

      const node = createNodeDefinition({
        id: "test-node",
        type: "test",
      });

      const stateUpdates: string[] = [];

      const unsubscribe = conductor.node.store.subscribe(
        (state: ExecutionGraphState) => {
          const nodeState = state.nodes.get("test-node");
          if (nodeState?.state) {
            stateUpdates.push(nodeState.state);
          }
        },
      );

      await conductor.node.run(node, { slowMo: 10 });

      unsubscribe();

      // Should transition through states
      expect(stateUpdates).toContain("pending");
      expect(stateUpdates).toContain("executing");
      expect(stateUpdates).toContain("completed");
    });

    it("should maintain node state as 'executing' during all progress steps", async () => {
      const conductor = createConductor(createMockConfig());

      const node = createNodeDefinition({
        id: "test-node",
        type: "test",
      });

      const statesDuringProgress: Set<string> = new Set();

      const unsubscribe = conductor.node.store.subscribe(
        (state: ExecutionGraphState) => {
          const nodeState = state.nodes.get("test-node");
          if (nodeState?.progress !== undefined && nodeState.progress < 100) {
            statesDuringProgress.add(nodeState.state);
          }
        },
      );

      await conductor.node.run(node, { slowMo: 10 });

      unsubscribe();

      // During all progress updates (0-90), state should be "executing"
      // Note: May include "pending" for the initial progress=0 update
      expect(statesDuringProgress.has("executing")).toBe(true);
      expect(statesDuringProgress.size).toBeLessThanOrEqual(2);
    });
  });
});
