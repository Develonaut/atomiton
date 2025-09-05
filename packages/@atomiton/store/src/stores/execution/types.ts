/**
 * Execution Store Types
 */

export type JobStatus =
  | "queued"
  | "running"
  | "paused"
  | "completed"
  | "failed"
  | "cancelled";

export interface JobProgress {
  current: number;
  total: number;
  percentage: number;
  message?: string;
}

export interface JobResult {
  success: boolean;
  data?: unknown;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
  duration: number;
  completedAt: Date;
}

export interface Job {
  id: string;
  blueprintId: string;
  blueprintName: string;
  status: JobStatus;
  priority: number;
  progress: JobProgress;
  result?: JobResult;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  logs: Array<{
    timestamp: Date;
    level: "debug" | "info" | "warn" | "error";
    message: string;
    data?: unknown;
  }>;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  tags: string[];
  nodeStates: Map<
    string,
    {
      status: "pending" | "running" | "completed" | "failed";
      progress?: number;
      error?: string;
    }
  >;
}

export interface ExecutionState {
  jobs: Map<string, Job>;
  activeJobIds: Set<string>;
  completedJobIds: string[];
  queuedJobIds: string[];
  globalPause: boolean;
  maxConcurrentJobs: number;
  retryConfig: {
    maxAttempts: number;
    delayMs: number;
    backoffMultiplier: number;
  };
  stats: {
    totalExecuted: number;
    totalSucceeded: number;
    totalFailed: number;
    averageDuration: number;
  };
}
