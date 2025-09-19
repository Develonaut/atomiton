import type { EventBus } from "@atomiton/events/desktop";
import { events } from "@atomiton/events/desktop";
import {
  createStore,
  type Store,
  type StoreApi,
  type UseBoundStore,
} from "@atomiton/store";
import type { ExecutionStatus } from "../interfaces/IExecutionEngine";
import type { Checkpoint, ExecutionState, NodeState } from "./types";

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
 * Execution store return type
 */
export type ExecutionStore = {
  store: Store<ExecutionStoreState> & {
    useStore: UseBoundStore<StoreApi<ExecutionStoreState>>;
  };
  eventBus: EventBus<Record<string, unknown>>;

  initializeExecution: (executionId: string, compositeId: string) => void;
  updateExecutionState: (
    executionId: string,
    updates: Partial<Pick<ExecutionRecord, "status" | "endTime">>,
  ) => void;
  updateNodeState: (
    executionId: string,
    nodeId: string,
    nodeStatus: ExecutionStatus,
  ) => void;
  recordNodeError: (executionId: string, nodeId: string, error: string) => void;
  setVariable: (executionId: string, key: string, value: unknown) => void;
  createCheckpoint: (executionId: string, nodeId: string) => void;
  restoreCheckpoint: (executionId: string, checkpointIndex: number) => void;
  clearExecutionState: (executionId: string) => void;
  clearCompletedExecutions: () => number;

  getExecution: (executionId: string) => ExecutionRecord | undefined;
  getActiveExecutions: () => ExecutionRecord[];
  getExecutionVariable: (executionId: string, key: string) => unknown;
  getAllExecutions: () => ExecutionRecord[];
  getNodeState: (executionId: string, nodeId: string) => NodeState | undefined;

  subscribe: (
    listener: (
      state: ExecutionStoreState,
      prevState: ExecutionStoreState,
    ) => void,
  ) => () => void;
  getState: () => ExecutionStoreState;

  shutdown: () => void;
};

/**
 * Create an execution store instance
 * @returns Store instance with execution management methods
 */
export function createExecutionStore(storeId = "default"): ExecutionStore {
  const executionStore = createStore<ExecutionStoreState>(
    () => ({
      executions: {},
    }),
    {
      name: `ExecutionStore:${storeId}`,
    },
  );

  const initializeExecution = (executionId: string, compositeId: string) => {
    executionStore.setState((state: ExecutionStoreState) => {
      const execution: ExecutionRecord = {
        executionId,
        compositeId,
        status: "pending" as ExecutionStatus,
        startTime: new Date(),
        nodeStates: {},
        variables: {},
        checkpoints: [],
      };

      state.executions[executionId] = execution;
      events.emit("execution:initialized", { executionId, compositeId });
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
      events.emit("execution:updated", { executionId });
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

      events.emit("node:updated", { executionId, nodeId });
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
      events.emit("node:updated", { executionId, nodeId });
    });
  };

  const setVariable = (executionId: string, key: string, value: unknown) => {
    executionStore.setState((state: ExecutionStoreState) => {
      const execution = state.executions[executionId];
      if (!execution) return;

      execution.variables[key] = value;
      events.emit("variable:set", { executionId, key, value });
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
      events.emit("checkpoint:created", { executionId, nodeId });
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
    store: executionStore,
    eventBus: events,

    initializeExecution,
    updateExecutionState,
    updateNodeState,
    recordNodeError,
    setVariable,
    createCheckpoint,
    restoreCheckpoint,
    clearExecutionState,
    clearCompletedExecutions,

    getExecution,
    getActiveExecutions,
    getExecutionVariable,
    getAllExecutions,
    getNodeState,

    subscribe: executionStore.subscribe,
    getState: executionStore.getState,

    shutdown: () => {},
  };
}
