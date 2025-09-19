/**
 * Smoke tests for execution store (zustand integration)
 */

import { describe, it, expect, beforeEach } from "vitest";
import { createExecutionStore } from "./executionStore";
import type { ExecutionStore } from "./executionStore";

describe("Execution Store Smoke Tests", () => {
  let store: ExecutionStore;

  beforeEach(() => {
    // Create a fresh store for each test
    store = createExecutionStore("test-store");
  });

  describe("Store Actions", () => {
    it("should initialize an execution", () => {
      const executionId = "test-exec-1";
      const blueprintId = "test-blueprint-1";

      store.initializeExecution(executionId, blueprintId);

      const execution = store.getExecution(executionId);
      expect(execution).toBeDefined();
      expect(execution?.executionId).toBe(executionId);
      expect(execution?.blueprintId).toBe(blueprintId);
      expect(execution?.status).toBe("pending");
    });

    it("should update execution state", () => {
      const executionId = "test-exec-2";
      store.initializeExecution(executionId, "blueprint-2");

      store.updateExecutionState(executionId, {
        status: "running",
      });

      const execution = store.getExecution(executionId);
      expect(execution?.status).toBe("running");
    });

    it("should manage node states", () => {
      const executionId = "test-exec-3";
      const nodeId = "node-1";

      store.initializeExecution(executionId, "blueprint-3");
      store.updateNodeState(executionId, nodeId, "running");

      const execution = store.getExecution(executionId);
      expect(execution?.nodeStates[nodeId]).toBeDefined();
      expect(execution?.nodeStates[nodeId].status).toBe("running");
    });

    it("should set and get variables", () => {
      const executionId = "test-exec-4";

      store.initializeExecution(executionId, "blueprint-4");
      store.setVariable(executionId, "testKey", "testValue");

      const value = store.getExecutionVariable(executionId, "testKey");
      expect(value).toBe("testValue");
    });

    it("should create and restore checkpoints", () => {
      const executionId = "test-exec-5";

      store.initializeExecution(executionId, "blueprint-5");
      store.setVariable(executionId, "var1", "value1");
      store.createCheckpoint(executionId, "node-1");

      // Change the variable
      store.setVariable(executionId, "var1", "value2");
      expect(store.getExecutionVariable(executionId, "var1")).toBe("value2");

      // Restore checkpoint
      store.restoreCheckpoint(executionId, 0);
      expect(store.getExecutionVariable(executionId, "var1")).toBe("value1");
    });

    it("should clear completed executions", () => {
      // Create some executions
      store.initializeExecution("exec-1", "bp-1");
      store.initializeExecution("exec-2", "bp-2");
      store.initializeExecution("exec-3", "bp-3");

      // Mark some as completed
      store.updateExecutionState("exec-1", { status: "completed" });
      store.updateExecutionState("exec-2", { status: "failed" });

      const clearedCount = store.clearCompletedExecutions();
      expect(clearedCount).toBe(2);

      // Only exec-3 should remain
      expect(store.getExecution("exec-1")).toBeUndefined();
      expect(store.getExecution("exec-2")).toBeUndefined();
      expect(store.getExecution("exec-3")).toBeDefined();
    });
  });

  describe("Store Selectors", () => {
    it("should get active executions", () => {
      store.initializeExecution("exec-1", "bp-1");
      store.initializeExecution("exec-2", "bp-2");
      store.initializeExecution("exec-3", "bp-3");

      store.updateExecutionState("exec-1", { status: "running" });
      store.updateExecutionState("exec-2", { status: "completed" });
      store.updateExecutionState("exec-3", { status: "pending" });

      const activeExecutions = store.getActiveExecutions();
      expect(activeExecutions).toHaveLength(2);
      expect(activeExecutions.map((e) => e.executionId)).toContain("exec-1");
      expect(activeExecutions.map((e) => e.executionId)).toContain("exec-3");
    });

    it("should get all executions", () => {
      store.initializeExecution("exec-1", "bp-1");
      store.initializeExecution("exec-2", "bp-2");

      const allExecutions = store.getAllExecutions();
      expect(allExecutions).toHaveLength(2);
    });
  });

  describe("Event Bus Integration", () => {
    it("should emit events on state changes", async () => {
      let eventFired = false;
      const executionId = "test-exec-events";
      const blueprintId = "test-blueprint-events";

      const subscription = store.events.on("execution:initialized", (data) => {
        if (
          data.executionId === executionId &&
          data.blueprintId === blueprintId
        ) {
          eventFired = true;
        }
      });

      store.initializeExecution(executionId, blueprintId);

      // Give event time to propagate
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(eventFired).toBe(true);
      subscription();
    });
  });
});
