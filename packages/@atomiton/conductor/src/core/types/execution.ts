import type { NodeDefinition } from "@atomiton/nodes/definitions";

export type ExecutionRequest = {
  id: string;
  nodeId: string;
  definition: NodeDefinition;
  inputs: Record<string, unknown>;
  options?: ExecutionOptions;
};

export type ExecutionOptions = {
  timeout?: number;
  priority?: number;
  retries?: number;
  useWorker?: boolean;
};

export type ExecutionResult = {
  id: string;
  nodeId: string;
  success: boolean;
  outputs?: Record<string, unknown>;
  error?: string;
  metrics?: ExecutionMetrics;
};

export type ExecutionMetrics = {
  startTime: number;
  endTime: number;
  duration: number;
  memoryUsed?: number;
};

export type ExecutionProgress = {
  id: string;
  nodeId: string;
  progress: number;
  message?: string;
};
