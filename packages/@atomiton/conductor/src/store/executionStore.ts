/**
 * Execution state store using @atomiton/store (zustand)
 */

import { createStore } from "@atomiton/store";
import { events } from "@atomiton/events";
import type { ExecutionStatus } from "../interfaces/IExecutionEngine";
import type { ExecutionState, NodeState, Checkpoint } from "./types";

/**
 * Record types for storage (using plain objects instead of Maps)
 */
export type ExecutionRecord = Omit<
  ExecutionState,
  "nodeStates" | "variables"
> & {
  nodeStates: Record<string, NodeState>;
  variables: Record<string, unknown>;
};

export type NodeRecord = NodeState;

/**
 * Store state shape
 */
export type ExecutionStoreState = {
  executions: Record<string, ExecutionRecord>;
};

/**
 * Store events
 */
type StoreEvents = {
  "state:persisted": { count: number };
  "execution:initialized": { executionId: string; blueprintId: string };
  "execution:updated": { executionId: string };
  "node:updated": { executionId: string; nodeId: string };
  "variable:set": { executionId: string; key: string; value: unknown };
  "checkpoint:created": { executionId: string; nodeId: string };
};

/**
 * Create an execution store instance
 */
export function createExecutionStore(storeId = "default") {
  // Create the zustand store
  const executionStore = createStore<ExecutionStoreState>(
    () => ({
      executions: {},
    }),
    {
      name: `ExecutionStore:${storeId}`,
    },
  );

  // Use the simplified events API - no need for domain or types
  const stateEventBus = events;

  // Actions
  const initializeExecution = (executionId: string, blueprintId: string) => {
    executionStore.setState((state: ExecutionStoreState) => {
      const execution: ExecutionRecord = {
        executionId,
        blueprintId,
        status: "pending" as ExecutionStatus,
        startTime: new Date(),
        nodeStates: {},
        variables: {},
        checkpoints: [],
      };

      state.executions[executionId] = execution;
      stateEventBus.emit("execution:initialized", { executionId, blueprintId });
    });
  };

  const updateExecutionState = (
    executionId: string,
    updates: Partial<Pick<ExecutionRecord, "status" | "endTime">>,
  ) => {
    executionStore.setState((state: ExecutionStoreState) => {
      const execution = state.executions[executionId];
      if (!execution) return;

      Object.assign(execution, updates);
      stateEventBus.emit("execution:updated", { executionId });
    });
  };

  const updateNodeState = (
    executionId: string,
    nodeId: string,
    nodeStatus: ExecutionStatus,
  ) => {
    executionStore.setState((state: ExecutionStoreState) => {
      const execution = state.executions[executionId];
      if (!execution) return;

      if (!execution.nodeStates[nodeId]) {
        execution.nodeStates[nodeId] = {
          nodeId,
          status: nodeStatus,
          startTime: new Date(),
          retryCount: 0,
        };
      } else {
        execution.nodeStates[nodeId].status = nodeStatus;
        if (nodeStatus === "running") {
          execution.nodeStates[nodeId].startTime = new Date();
        } else if (nodeStatus === "completed" || nodeStatus === "failed") {
          execution.nodeStates[nodeId].endTime = new Date();
        }
      }

      stateEventBus.emit("node:updated", { executionId, nodeId });
    });
  };

  const recordNodeError = (
    executionId: string,
    nodeId: string,
    error: string,
  ) => {
    executionStore.setState((state: ExecutionStoreState) => {
      const execution = state.executions[executionId];
      if (!execution || !execution.nodeStates[nodeId]) return;

      execution.nodeStates[nodeId].lastError = error;
      execution.nodeStates[nodeId].retryCount += 1;
      stateEventBus.emit("node:updated", { executionId, nodeId });
    });
  };

  const setVariable = (executionId: string, key: string, value: unknown) => {
    executionStore.setState((state: ExecutionStoreState) => {
      const execution = state.executions[executionId];
      if (!execution) return;

      execution.variables[key] = value;
      stateEventBus.emit("variable:set", { executionId, key, value });
    });
  };

  const createCheckpoint = (executionId: string, nodeId: string) => {
    executionStore.setState((state: ExecutionStoreState) => {
      const execution = state.executions[executionId];
      if (!execution) return;

      const checkpoint: Checkpoint = {
        timestamp: new Date(),
        nodeId,
        state: { ...execution.variables },
      };

      execution.checkpoints.push(checkpoint);
      stateEventBus.emit("checkpoint:created", { executionId, nodeId });
    });
  };

  const restoreCheckpoint = (executionId: string, checkpointIndex: number) => {
    executionStore.setState((state: ExecutionStoreState) => {
      const execution = state.executions[executionId];
      if (!execution || !execution.checkpoints[checkpointIndex]) return;

      const checkpoint = execution.checkpoints[checkpointIndex];
      execution.variables = { ...checkpoint.state };
    });
  };

  const clearExecutionState = (executionId: string) => {
    executionStore.setState((state: ExecutionStoreState) => {
      delete state.executions[executionId];
    });
  };

  const clearCompletedExecutions = () => {
    let clearedCount = 0;

    executionStore.setState((state: ExecutionStoreState) => {
      const completedIds: string[] = [];

      for (const [executionId, execution] of Object.entries(state.executions)) {
        if (
          execution &&
          (execution.status === "completed" || execution.status === "failed")
        ) {
          completedIds.push(executionId);
        }
      }

      for (const id of completedIds) {
        delete state.executions[id];
      }

      clearedCount = completedIds.length;
    });

    return clearedCount;
  };

  // Selectors
  const getExecution = (executionId: string): ExecutionRecord | undefined =>
    executionStore.getState().executions[executionId];

  const getActiveExecutions = (): ExecutionRecord[] => {
    const executions = Object.values(
      executionStore.getState().executions,
    ) as ExecutionRecord[];
    return executions.filter(
      (execution) =>
        execution.status === "running" || execution.status === "pending",
    );
  };

  const getExecutionVariable = (executionId: string, key: string): unknown =>
    executionStore.getState().executions[executionId]?.variables[key];

  const getAllExecutions = (): ExecutionRecord[] =>
    Object.values(executionStore.getState().executions);

  const getNodeState = (
    executionId: string,
    nodeId: string,
  ): NodeState | undefined =>
    executionStore.getState().executions[executionId]?.nodeStates[nodeId];

  return {
    // Store instance
    store: executionStore,
    eventBus: stateEventBus,

    // Actions
    initializeExecution,
    updateExecutionState,
    updateNodeState,
    recordNodeError,
    setVariable,
    createCheckpoint,
    restoreCheckpoint,
    clearExecutionState,
    clearCompletedExecutions,

    // Selectors
    getExecution,
    getActiveExecutions,
    getExecutionVariable,
    getAllExecutions,
    getNodeState,

    // Subscribe to store changes
    subscribe: executionStore.subscribe,
    getState: executionStore.getState,

    // Shutdown method
    shutdown: () => {
      // Event bus cleanup would go here if needed
      // Currently @atomiton/events doesn't expose removeAllListeners
    },
  };
}

export type ExecutionStore = ReturnType<typeof createExecutionStore>;
