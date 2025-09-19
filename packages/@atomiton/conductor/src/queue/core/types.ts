/**
 * Types for queue system
 */

import type {
  ExecutionError,
  ExecutionResult,
} from "../../interfaces/IExecutionEngine";

export type JobData = {
  executionId: string;
  blueprintId: string;
  input?: unknown;
  loadStaticData?: boolean;
  retryOf?: string;
  webhookData?: WebhookData;
};

export type JobResponse = {
  success: boolean;
  result?: ExecutionResult;
  error?: ExecutionError;
};

export type WebhookData = {
  webhookId: string;
  httpMethod: string;
  path: string;
  headers: Record<string, string>;
  body: unknown;
};

export type WebhookResponse = {
  executionId: string;
  response: {
    statusCode: number;
    headers?: Record<string, string>;
    body?: unknown;
  };
};

export type QueueOptions = {
  concurrency?: number;
  maxRetries?: number;
  retryDelay?: number;
  storeResults?: boolean;
  resultTTL?: number;
  enablePriority?: boolean;
  enableRateLimiting?: boolean;
  rateLimit?: {
    limit: number;
    duration: number;
  };
};

export type JobOptions = {
  priority?: number;
  delay?: number;
  attempts?: number;
  backoff?: {
    type: "fixed" | "exponential";
    delay: number;
  };
  removeOnComplete?: boolean;
  removeOnFail?: boolean;
  stackTraceLimit?: number;
};

export type QueueMetrics = {
  activeJobs: number;
  pendingJobs: number;
  completedJobs: number;
  failedJobs: number;
  queueSize: number;
  rateLimitRemaining?: number;
};

export type QueueInstance = {
  add: (jobData: JobData, options?: JobOptions) => Promise<string>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  clear: () => Promise<void>;
  getJob: (jobId: string) => Promise<JobData | undefined>;
  getJobResult: (jobId: string) => Promise<JobResponse | undefined>;
  getActiveJobs: () => Promise<JobData[]>;
  getQueueSize: () => Promise<number>;
  getPendingCount: () => Promise<number>;
  addWebhookResponse: (response: WebhookResponse) => Promise<void>;
  getWebhookResponse: (
    executionId: string,
  ) => Promise<WebhookResponse | undefined>;
  decodeWebhookResponse: (response: WebhookResponse) => unknown;
  gracefulShutdown: () => Promise<void>;
  getMetrics: () => QueueMetrics;
  eventBus: unknown; // Type-safe event bus for queue events
};

export type WorkerInfo = {
  id: string;
  status: "idle" | "busy" | "error";
  currentJob: string | null;
  processedCount: number;
  errorCount: number;
  startTime: number;
};

export type RedisConfig = {
  host: string;
  port: number;
  password?: string;
  db?: number;
  prefix?: string;
  enableReadyCheck?: boolean;
};

export type ScalableQueueInstance = QueueInstance & {
  distributeJob: (jobData: JobData) => Promise<string>;
  getWorkerMetrics: () => WorkerInfo[];
};
