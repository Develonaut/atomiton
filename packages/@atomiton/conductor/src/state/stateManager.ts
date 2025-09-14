import { EventEmitter } from "events";
import type { ExecutionStatus } from "../interfaces/IExecutionEngine";

/**
 * Execution state information
 */
export type ExecutionState = {
  executionId: string;
  blueprintId: string;
  status: ExecutionStatus;
  startTime: Date;
  endTime?: Date;
  nodeStates: Map<string, NodeState>;
  variables: Map<string, unknown>;
  checkpoints: Checkpoint[];
};

/**
 * Node state information
 */
export type NodeState = {
  nodeId: string;
  status: ExecutionStatus;
  startTime?: Date;
  endTime?: Date;
  retryCount: number;
  lastError?: string;
};

/**
 * Execution checkpoint for pause/resume
 */
export type Checkpoint = {
  timestamp: Date;
  nodeId: string;
  state: Map<string, unknown>;
};

export type StateManagerInstance = {
  initializeExecution: (executionId: string, blueprintId: string) => void;
  updateExecutionState: (
    executionId: string,
    updates: Partial<Pick<ExecutionState, "status" | "endTime">>,
  ) => void;
  updateNodeState: (
    executionId: string,
    nodeId: string,
    status: ExecutionStatus,
  ) => void;
  recordNodeError: (executionId: string, nodeId: string, error: string) => void;
  setVariable: (executionId: string, key: string, value: unknown) => void;
  getVariable: (executionId: string, key: string) => unknown;
  createCheckpoint: (executionId: string, nodeId: string) => void;
  restoreCheckpoint: (executionId: string, checkpointIndex: number) => void;
  getExecutionState: (executionId: string) => ExecutionState | undefined;
  getActiveExecutions: () => ExecutionState[];
  createContext: (executionId: string, blueprintId: string) => ExecutionState;
  getContext: (executionId: string) => ExecutionState | undefined;
  updateContext: (
    executionId: string,
    updates: Partial<ExecutionState>,
  ) => void;
  setData: (executionId: string, key: string, value: unknown) => void;
  clearExecutionState: (executionId: string) => void;
  clearCompletedExecutions: () => number;
  loadExecutionStates: () => Promise<void>;
  shutdown: () => void;
  on: (event: string, listener: (...args: unknown[]) => void) => void;
  off: (event: string, listener: (...args: unknown[]) => void) => void;
  emit: (event: string, ...args: unknown[]) => void;
};

/**
 * Creates a StateManager that manages execution state across the system
 * Tracks node states, variables, and checkpoints for pause/resume
 */
export function createStateManager(persistState = false): StateManagerInstance {
  // Private state using closures
  const eventEmitter = new EventEmitter();
  const executions = new Map<string, ExecutionState>();
  let persistInterval: NodeJS.Timeout | null = null;

  // Private helper functions
  const persistExecutionStates = async (): Promise<void> => {
    if (!persistState) return;

    // TODO: Implement persistence to disk or database
    // For now, this is a placeholder for future implementation
    const activeStates = getActiveExecutions();
    if (activeStates.length > 0) {
      eventEmitter.emit("state:persisted", { count: activeStates.length });
    }
  };

  // Set up periodic state persistence if enabled
  if (persistState) {
    persistInterval = setInterval(() => {
      persistExecutionStates();
    }, 5000); // Persist every 5 seconds
  }

  /**
   * Initialize a new execution
   */
  const initializeExecution = (
    executionId: string,
    blueprintId: string,
  ): void => {
    const state: ExecutionState = {
      executionId,
      blueprintId,
      status: "pending",
      startTime: new Date(),
      nodeStates: new Map(),
      variables: new Map(),
      checkpoints: [],
    };

    executions.set(executionId, state);
    eventEmitter.emit("execution:initialized", { executionId, blueprintId });
  };

  /**
   * Update execution status
   */
  const updateExecutionState = (
    executionId: string,
    updates: Partial<Pick<ExecutionState, "status" | "endTime">>,
  ): void => {
    const state = executions.get(executionId);
    if (!state) {
      throw new Error(`Execution ${executionId} not found`);
    }

    if (updates.status) {
      state.status = updates.status;
    }
    if (updates.endTime) {
      state.endTime = updates.endTime;
    }

    eventEmitter.emit("execution:updated", { executionId, updates });
  };

  /**
   * Update node state
   */
  const updateNodeState = (
    executionId: string,
    nodeId: string,
    status: ExecutionStatus,
  ): void => {
    const execution = executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    let nodeState = execution.nodeStates.get(nodeId);
    if (!nodeState) {
      nodeState = {
        nodeId,
        status,
        retryCount: 0,
      };
      execution.nodeStates.set(nodeId, nodeState);
    } else {
      nodeState.status = status;
    }

    if (status === "running" && !nodeState.startTime) {
      nodeState.startTime = new Date();
    } else if (
      (status === "completed" || status === "failed") &&
      !nodeState.endTime
    ) {
      nodeState.endTime = new Date();
    }

    eventEmitter.emit("node:updated", { executionId, nodeId, status });
  };

  /**
   * Record node error
   */
  const recordNodeError = (
    executionId: string,
    nodeId: string,
    error: string,
  ): void => {
    const execution = executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    const nodeState = execution.nodeStates.get(nodeId);
    if (nodeState) {
      nodeState.lastError = error;
      nodeState.retryCount++;
    }

    eventEmitter.emit("node:error", { executionId, nodeId, error });
  };

  /**
   * Set execution variable
   */
  const setVariable = (
    executionId: string,
    key: string,
    value: unknown,
  ): void => {
    const execution = executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    execution.variables.set(key, value);
    eventEmitter.emit("variable:set", { executionId, key, value });
  };

  /**
   * Get execution variable
   */
  const getVariable = (executionId: string, key: string): unknown => {
    const execution = executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    return execution.variables.get(key);
  };

  /**
   * Create execution checkpoint
   */
  const createCheckpoint = (executionId: string, nodeId: string): void => {
    const execution = executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    const checkpoint: Checkpoint = {
      timestamp: new Date(),
      nodeId,
      state: new Map(execution.variables),
    };

    execution.checkpoints.push(checkpoint);
    eventEmitter.emit("checkpoint:created", { executionId, nodeId });
  };

  /**
   * Restore from checkpoint
   */
  const restoreCheckpoint = (
    executionId: string,
    checkpointIndex: number,
  ): void => {
    const execution = executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    const checkpoint = execution.checkpoints[checkpointIndex];
    if (!checkpoint) {
      throw new Error(`Checkpoint ${checkpointIndex} not found`);
    }

    execution.variables = new Map(checkpoint.state);
    eventEmitter.emit("checkpoint:restored", { executionId, checkpointIndex });
  };

  /**
   * Get execution state
   */
  const getExecutionState = (
    executionId: string,
  ): ExecutionState | undefined => {
    return executions.get(executionId);
  };

  /**
   * Get all active executions
   */
  const getActiveExecutions = (): ExecutionState[] => {
    return Array.from(executions.values()).filter(
      (state) => state.status === "running" || state.status === "paused",
    );
  };

  /**
   * Create execution context
   */
  const createContext = (
    executionId: string,
    blueprintId: string,
  ): ExecutionState => {
    initializeExecution(executionId, blueprintId);
    return executions.get(executionId)!;
  };

  /**
   * Get execution context
   */
  const getContext = (executionId: string): ExecutionState | undefined => {
    return executions.get(executionId);
  };

  /**
   * Update execution context
   */
  const updateContext = (
    executionId: string,
    updates: Partial<ExecutionState>,
  ): void => {
    const state = executions.get(executionId);
    if (!state) {
      throw new Error(`Execution ${executionId} not found`);
    }
    Object.assign(state, updates);
    eventEmitter.emit("context:updated", { executionId, updates });
  };

  /**
   * Set data in execution context
   */
  const setData = (executionId: string, key: string, value: unknown): void => {
    const state = executions.get(executionId);
    if (!state) {
      throw new Error(`Execution ${executionId} not found`);
    }
    state.variables.set(key, value);
    eventEmitter.emit("data:set", { executionId, key, value });
  };

  /**
   * Clear execution state
   */
  const clearExecutionState = (executionId: string): void => {
    executions.delete(executionId);
    eventEmitter.emit("execution:cleared", { executionId });
  };

  /**
   * Clear all completed executions
   */
  const clearCompletedExecutions = (): number => {
    let cleared = 0;
    for (const [id, state] of executions) {
      if (state.status === "completed" || state.status === "failed") {
        executions.delete(id);
        cleared++;
      }
    }
    return cleared;
  };

  /**
   * Load execution states (for recovery)
   */
  const loadExecutionStates = async (): Promise<void> => {
    if (!persistState) return;

    // TODO: Implement loading from disk or database
    // For now, this is a placeholder for future implementation
    eventEmitter.emit("state:loaded", { count: 0 });
  };

  /**
   * Cleanup and shutdown
   */
  const shutdown = (): void => {
    if (persistInterval) {
      clearInterval(persistInterval);
    }
    eventEmitter.removeAllListeners();
  };

  // Return public API
  return {
    initializeExecution,
    updateExecutionState,
    updateNodeState,
    recordNodeError,
    setVariable,
    getVariable,
    createCheckpoint,
    restoreCheckpoint,
    getExecutionState,
    getActiveExecutions,
    createContext,
    getContext,
    updateContext,
    setData,
    clearExecutionState,
    clearCompletedExecutions,
    loadExecutionStates,
    shutdown,
    // Event emitter methods
    on: (event: string, listener: (...args: unknown[]) => void) => {
      eventEmitter.on(event, listener);
    },
    off: (event: string, listener: (...args: unknown[]) => void) => {
      eventEmitter.off(event, listener);
    },
    emit: (event: string, ...args: unknown[]) => {
      eventEmitter.emit(event, ...args);
    },
  };
}
