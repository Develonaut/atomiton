/**
 * Types for enhanced execution engine
 */

import type {
  ExecutionResult,
  ExecutionStatus,
  IExecutionEngine,
} from "../../interfaces/IExecutionEngine";
import type { ScalableQueueInstance } from "../../queue";

export type EnhancedExecutionOptions = {
  concurrency?: number;
  maxRetries?: number;
  retryDelay?: number;
  enableMetrics?: boolean;
  enableWebhooks?: boolean;
  workers?: number;
  redis?: {
    host: string;
    port: number;
    password?: string;
  };
  rateLimit?: {
    enabled: boolean;
    limit: number;
    duration: number;
  };
};

export type EnhancedExecutionMetrics = {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  peakMemoryUsage: number;
  activeExecutions: number;
  queueMetrics?: ReturnType<ScalableQueueInstance["getMetrics"]>;
  workerMetrics?: ReturnType<ScalableQueueInstance["getWorkerMetrics"]>;
};

export type ExecutionContext = {
  executionId: string;
  compositeId: string;
  input: unknown;
  startTime: Date;
  status: string;
  variables: Map<string, unknown>;
  outputs: Record<string, unknown>;
};

export type ExecutionHistoryEntry = {
  executionId: string;
  compositeId: string;
  status: ExecutionStatus;
  startTime: number;
  endTime?: number;
  duration?: number;
  error?: string;
};

export type WebhookHandler = (data: unknown) => Promise<unknown>;

export type EnhancedEngineInstance = IExecutionEngine & {
  getMetrics(): EnhancedExecutionMetrics;
  gracefulShutdown(): Promise<void>;
  registerWebhook(webhookId: string, handler: WebhookHandler): Promise<void>;
  handleWebhook(webhookId: string, data: unknown): Promise<ExecutionResult>;
  getExecutionHistory(limit?: number): Promise<ExecutionHistoryEntry[]>;
};
