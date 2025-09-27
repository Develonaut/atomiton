export type ExecutionContext = {
  nodeId: string;
  executionId: string;
  variables: Record<string, unknown>;
  input: unknown;
  output?: unknown;
  status: ExecutionStatus;
  startTime: Date;
  endTime?: Date;
};

export type ExecutionStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export type ExecutionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: ExecutionError;
  duration?: number;
  executedNodes?: string[];
};

export type ExecutionError = {
  nodeId?: string;
  message: string;
  timestamp: Date;
  stack?: string;
};

export type ConductorConfig = {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
  logLevel?: "debug" | "info" | "warn" | "error";
};
