import { EventEmitter } from "events";
import type { ExecutionStatus } from "../interfaces/IExecutionEngine.js";

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

/**
 * StateManager manages execution state across the system
 * Tracks node states, variables, and checkpoints for pause/resume
 */
export class StateManager extends EventEmitter {
  private readonly executions: Map<string, ExecutionState>;
  private readonly persistInterval: NodeJS.Timeout | null = null;

  constructor(private readonly persistState = false) {
    super();
    this.executions = new Map();

    // Set up periodic state persistence if enabled
    if (persistState) {
      this.persistInterval = setInterval(() => {
        this.persistExecutionStates();
      }, 5000); // Persist every 5 seconds
    }
  }

  /**
   * Initialize a new execution
   */
  initializeExecution(executionId: string, blueprintId: string): void {
    const state: ExecutionState = {
      executionId,
      blueprintId,
      status: "pending",
      startTime: new Date(),
      nodeStates: new Map(),
      variables: new Map(),
      checkpoints: [],
    };

    this.executions.set(executionId, state);
    this.emit("execution:initialized", { executionId, blueprintId });
  }

  /**
   * Update execution status
   */
  updateExecutionState(
    executionId: string,
    updates: Partial<Pick<ExecutionState, "status" | "endTime">>,
  ): void {
    const state = this.executions.get(executionId);
    if (!state) {
      throw new Error(`Execution ${executionId} not found`);
    }

    if (updates.status) {
      state.status = updates.status;
    }
    if (updates.endTime) {
      state.endTime = updates.endTime;
    }

    this.emit("execution:updated", { executionId, updates });
  }

  /**
   * Update node state
   */
  updateNodeState(
    executionId: string,
    nodeId: string,
    status: ExecutionStatus,
  ): void {
    const execution = this.executions.get(executionId);
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

    this.emit("node:updated", { executionId, nodeId, status });
  }

  /**
   * Record node error
   */
  recordNodeError(executionId: string, nodeId: string, error: string): void {
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    const nodeState = execution.nodeStates.get(nodeId);
    if (nodeState) {
      nodeState.lastError = error;
      nodeState.retryCount++;
    }

    this.emit("node:error", { executionId, nodeId, error });
  }

  /**
   * Set execution variable
   */
  setVariable(executionId: string, key: string, value: unknown): void {
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    execution.variables.set(key, value);
    this.emit("variable:set", { executionId, key, value });
  }

  /**
   * Get execution variable
   */
  getVariable(executionId: string, key: string): unknown {
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    return execution.variables.get(key);
  }

  /**
   * Create execution checkpoint
   */
  createCheckpoint(executionId: string, nodeId: string): void {
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    const checkpoint: Checkpoint = {
      timestamp: new Date(),
      nodeId,
      state: new Map(execution.variables),
    };

    execution.checkpoints.push(checkpoint);
    this.emit("checkpoint:created", { executionId, nodeId });
  }

  /**
   * Restore from checkpoint
   */
  restoreCheckpoint(executionId: string, checkpointIndex: number): void {
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    const checkpoint = execution.checkpoints[checkpointIndex];
    if (!checkpoint) {
      throw new Error(`Checkpoint ${checkpointIndex} not found`);
    }

    execution.variables = new Map(checkpoint.state);
    this.emit("checkpoint:restored", { executionId, checkpointIndex });
  }

  /**
   * Get execution state
   */
  getExecutionState(executionId: string): ExecutionState | undefined {
    return this.executions.get(executionId);
  }

  /**
   * Get all active executions
   */
  getActiveExecutions(): ExecutionState[] {
    return Array.from(this.executions.values()).filter(
      (state) => state.status === "running" || state.status === "paused",
    );
  }

  /**
   * Create execution context
   */
  createContext(executionId: string, blueprintId: string): ExecutionState {
    this.initializeExecution(executionId, blueprintId);
    return this.executions.get(executionId)!;
  }

  /**
   * Get execution context
   */
  getContext(executionId: string): ExecutionState | undefined {
    return this.executions.get(executionId);
  }

  /**
   * Update execution context
   */
  updateContext(executionId: string, updates: Partial<ExecutionState>): void {
    const state = this.executions.get(executionId);
    if (!state) {
      throw new Error(`Execution ${executionId} not found`);
    }
    Object.assign(state, updates);
    this.emit("context:updated", { executionId, updates });
  }

  /**
   * Set data in execution context
   */
  setData(executionId: string, key: string, value: unknown): void {
    const state = this.executions.get(executionId);
    if (!state) {
      throw new Error(`Execution ${executionId} not found`);
    }
    state.variables.set(key, value);
    this.emit("data:set", { executionId, key, value });
  }

  /**
   * Clear execution state
   */
  clearExecutionState(executionId: string): void {
    this.executions.delete(executionId);
    this.emit("execution:cleared", { executionId });
  }

  /**
   * Clear all completed executions
   */
  clearCompletedExecutions(): number {
    let cleared = 0;
    for (const [id, state] of this.executions) {
      if (state.status === "completed" || state.status === "failed") {
        this.executions.delete(id);
        cleared++;
      }
    }
    return cleared;
  }

  /**
   * Persist execution states (for recovery)
   */
  private async persistExecutionStates(): Promise<void> {
    if (!this.persistState) return;

    // TODO: Implement persistence to disk or database
    // For now, this is a placeholder for future implementation
    const activeStates = this.getActiveExecutions();
    if (activeStates.length > 0) {
      this.emit("state:persisted", { count: activeStates.length });
    }
  }

  /**
   * Load execution states (for recovery)
   */
  async loadExecutionStates(): Promise<void> {
    if (!this.persistState) return;

    // TODO: Implement loading from disk or database
    // For now, this is a placeholder for future implementation
    this.emit("state:loaded", { count: 0 });
  }

  /**
   * Cleanup and shutdown
   */
  shutdown(): void {
    if (this.persistInterval) {
      clearInterval(this.persistInterval);
    }
    this.removeAllListeners();
  }
}
