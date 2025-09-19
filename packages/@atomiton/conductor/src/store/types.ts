import type { ExecutionStatus } from "../interfaces/IExecutionEngine";

/**
 * Execution state information
 */
export type ExecutionState = {
  executionId: string;
  compositeId: string;
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
  state: Record<string, unknown>;
};
