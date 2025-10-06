/**
 * Execute Graph Node Tests
 * Tests for single node execution within the execution graph
 */

import { executeGraphNode } from "#execution/executeGraphNode";
import {
  createExecutionGraphStore,
  type ExecutionGraphStore,
} from "#execution/executionGraphStore";
import type { ConductorConfig, ConductorExecutionContext } from "#types";
import { toNodeId, toExecutionId } from "#types";
import { createNodeDefinition } from "@atomiton/nodes/definitions";
import type { NodeExecutable } from "@atomiton/nodes/executables";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("executeGraphNode", () => {
  let mockExecutable: NodeExecutable;
  let mockFactory: ConductorConfig["nodeExecutorFactory"];
  let config: ConductorConfig;
  let context: ConductorExecutionContext;
  let executionGraphStore: ExecutionGraphStore;

  beforeEach(() => {
    vi.clearAllMocks();

    mockExecutable = {
      execute: vi.fn().mockResolvedValue("test-result"),
    };

    mockFactory = {
      getNodeExecutable: vi.fn().mockReturnValue(mockExecutable),
    };

    config = {
      nodeExecutorFactory: mockFactory,
    };

    context = {
      nodeId: toNodeId("test-node"),
      executionId: toExecutionId("exec-123"),
      input: { default: "test-input" },
      variables: {},
      slowMo: 0,
    };

    executionGraphStore = createExecutionGraphStore();
  });

  describe("critical: successful execution", () => {
    it("should execute node and return success result", async () => {
      const node = createNodeDefinition({
        id: "test-node",
        type: "test-type",
      });

      const startTime = Date.now();
      const result = await executeGraphNode(
        node,
        context,
        startTime,
        config,
        executionGraphStore,
      );

      expect(result.success).toBe(true);
      expect(result.data).toBe("test-result");
      expect(result.executedNodes).toEqual(["test-node"]);
      expect(result.context).toBe(context);
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });

    it("should merge node parameters with context", async () => {
      const node = createNodeDefinition({
        id: "test-node",
        type: "test-type",
        parameters: {
          customParam: "value",
          anotherParam: 123,
        },
      });

      const startTime = Date.now();
      await executeGraphNode(node, context, startTime, config);

      expect(mockExecutable.execute).toHaveBeenCalledWith({
        ...context,
        customParam: "value",
        anotherParam: 123,
      });
    });

    it("should update execution graph store states correctly", async () => {
      const node = createNodeDefinition({
        id: "test-node",
        type: "test-type",
      });

      const setNodeStateSpy = vi.spyOn(executionGraphStore, "setNodeState");
      const setNodeProgressSpy = vi.spyOn(
        executionGraphStore,
        "setNodeProgress",
      );

      const startTime = Date.now();
      await executeGraphNode(
        node,
        context,
        startTime,
        config,
        executionGraphStore,
      );

      // Should set state to executing at start
      expect(setNodeStateSpy).toHaveBeenCalledWith("test-node", "executing");

      // Should set progress to 100 and state to completed at end
      expect(setNodeProgressSpy).toHaveBeenCalledWith(
        "test-node",
        100,
        "Complete",
      );
      expect(setNodeStateSpy).toHaveBeenCalledWith("test-node", "completed");
    });
  });

  describe("critical: slowMo progress animation", () => {
    it("should show progress animation with slowMo delays", async () => {
      const node = createNodeDefinition({
        id: "test-node",
        type: "test-type",
      });

      const slowMoContext = { ...context, slowMo: 50 };
      const setNodeProgressSpy = vi.spyOn(
        executionGraphStore,
        "setNodeProgress",
      );

      const startTime = Date.now();
      await executeGraphNode(
        node,
        slowMoContext,
        startTime,
        config,
        executionGraphStore,
      );

      // Should show progress steps: 0, 20, 40, 60, 80, 90, then 100
      const progressCalls = setNodeProgressSpy.mock.calls;
      expect(progressCalls.length).toBeGreaterThanOrEqual(7);

      // Verify progress values
      expect(progressCalls[0]).toEqual(["test-node", 0, "Starting..."]);
      expect(progressCalls[1]).toEqual(["test-node", 20, "Initializing..."]);
      expect(progressCalls[2]).toEqual(["test-node", 40, "Processing..."]);
      expect(progressCalls[3]).toEqual(["test-node", 60, "Computing..."]);
      expect(progressCalls[4]).toEqual(["test-node", 80, "Finalizing..."]);
      expect(progressCalls[5]).toEqual(["test-node", 90, "Almost done..."]);
      expect(progressCalls[6]).toEqual(["test-node", 100, "Complete"]);
    });

    it("should respect slowMo: 0 and execute without delays", async () => {
      const node = createNodeDefinition({
        id: "test-node",
        type: "test-type",
      });

      const startTime = Date.now();
      const result = await executeGraphNode(
        node,
        context,
        startTime,
        config,
        executionGraphStore,
      );

      // With slowMo: 0, execution should be very fast
      expect(result.duration).toBeLessThan(100);
    });
  });

  describe("critical: error handling", () => {
    it("should return error when no executor factory provided", async () => {
      const node = createNodeDefinition({
        id: "test-node",
        type: "test-type",
      });

      const configWithoutFactory: ConductorConfig = {};

      const startTime = Date.now();
      const result = await executeGraphNode(
        node,
        context,
        startTime,
        configWithoutFactory,
        executionGraphStore,
      );

      expect(result.success).toBe(false);
      expect(result.error).toMatchObject({
        nodeId: "test-node",
        message: "No executor factory provided for local execution",
        code: "NO_EXECUTOR_FACTORY",
      });
      expect(result.executedNodes).toEqual(["test-node"]);
    });

    it("should return error when node type not found", async () => {
      const node = createNodeDefinition({
        id: "test-node",
        type: "unknown-type",
      });

      const factoryReturningNull = {
        getNodeExecutable: vi.fn().mockReturnValue(undefined),
      };

      const configWithNullFactory: ConductorConfig = {
        nodeExecutorFactory: factoryReturningNull,
      };

      const startTime = Date.now();
      const result = await executeGraphNode(
        node,
        context,
        startTime,
        configWithNullFactory,
        executionGraphStore,
      );

      expect(result.success).toBe(false);
      expect(result.error).toMatchObject({
        nodeId: "test-node",
        message: "No implementation found for node type: unknown-type",
        code: "NODE_TYPE_NOT_FOUND",
      });
    });

    it("should handle execution errors and update store", async () => {
      const node = createNodeDefinition({
        id: "test-node",
        type: "test-type",
      });

      const errorExecutable: NodeExecutable = {
        execute: vi.fn().mockRejectedValue(new Error("Execution failed")),
      };

      const errorFactory = {
        getNodeExecutable: vi.fn().mockReturnValue(errorExecutable),
      };

      const configWithError: ConductorConfig = {
        nodeExecutorFactory: errorFactory,
      };

      const setNodeStateSpy = vi.spyOn(executionGraphStore, "setNodeState");

      const startTime = Date.now();
      const result = await executeGraphNode(
        node,
        context,
        startTime,
        configWithError,
        executionGraphStore,
      );

      expect(result.success).toBe(false);
      expect(result.error).toMatchObject({
        nodeId: "test-node",
        message: "Execution failed",
      });
      expect(result.error?.stack).toBeDefined();

      // Should update store with error state
      expect(setNodeStateSpy).toHaveBeenCalledWith(
        "test-node",
        "error",
        "Execution failed",
      );
    });

    it("should handle non-Error exceptions", async () => {
      const node = createNodeDefinition({
        id: "test-node",
        type: "test-type",
      });

      const errorExecutable: NodeExecutable = {
        execute: vi.fn().mockRejectedValue("String error"),
      };

      const errorFactory = {
        getNodeExecutable: vi.fn().mockReturnValue(errorExecutable),
      };

      const startTime = Date.now();
      const result = await executeGraphNode(node, context, startTime, {
        nodeExecutorFactory: errorFactory,
      });

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe("String error");
      expect(result.error?.stack).toBeUndefined();
    });
  });

  describe("without execution graph store", () => {
    it("should execute successfully without store", async () => {
      const node = createNodeDefinition({
        id: "test-node",
        type: "test-type",
      });

      const startTime = Date.now();
      const result = await executeGraphNode(
        node,
        context,
        startTime,
        config,
        undefined,
      );

      expect(result.success).toBe(true);
      expect(result.data).toBe("test-result");
      expect(mockExecutable.execute).toHaveBeenCalled();
    });

    it("should handle errors without store", async () => {
      const node = createNodeDefinition({
        id: "test-node",
        type: "test-type",
      });

      const errorExecutable: NodeExecutable = {
        execute: vi.fn().mockRejectedValue(new Error("Failed")),
      };

      const startTime = Date.now();
      const result = await executeGraphNode(
        node,
        context,
        startTime,
        {
          nodeExecutorFactory: {
            getNodeExecutable: vi.fn().mockReturnValue(errorExecutable),
          },
        },
        undefined,
      );

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe("Failed");
    });
  });
});
