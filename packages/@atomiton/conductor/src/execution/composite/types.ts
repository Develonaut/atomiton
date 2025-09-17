/**
 * Types for composite execution system
 */

import type { INode, CompositeDefinition } from "@atomiton/nodes/executable";

export type CompositeExecutionOptions = {
  maxConcurrency?: number;
  enableParallelExecution?: boolean;
  timeoutMs?: number;
  workspaceRoot?: string;
  inputs?: Record<string, unknown>;
};

export type CompositeExecutionResult = {
  success: boolean;
  outputs: Record<string, unknown>;
  error?: string;
  executionId: string;
  metrics: {
    totalExecutionTime: number;
    nodeExecutionTimes: Record<string, number>;
    nodesExecuted: number;
    nodesSucceeded: number;
    nodesFailed: number;
    peakMemoryUsage?: number;
  };
};

export type CompositeRunnerInstance = {
  registerNode: (nodeType: string, node: INode) => void;
  execute: (
    composite: CompositeDefinition,
    options?: CompositeExecutionOptions,
  ) => Promise<CompositeExecutionResult>;
  executeComposite: (
    composite: CompositeDefinition,
    options?: CompositeExecutionOptions,
  ) => Promise<CompositeExecutionResult>;
};

export type CompositeValidationResult = {
  valid: boolean;
  errors: string[];
};

export type ExecutionGraph = {
  sequential: string[][];
  parallelizable: string[];
};
