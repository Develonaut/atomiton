import { EventEmitter } from "events";
import PQueue from "p-queue";
import type {
  ExecutionError,
  ExecutionResult,
} from "../interfaces/IExecutionEngine";

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
  getMetrics: () => {
    activeJobs: number;
    pendingJobs: number;
    completedJobs: number;
    failedJobs: number;
    queueSize: number;
    rateLimitRemaining?: number;
  };
  on: (event: string, listener: (...args: unknown[]) => void) => void;
  off: (event: string, listener: (...args: unknown[]) => void) => void;
  emit: (event: string, ...args: unknown[]) => void;
};

export function createQueue(options: QueueOptions = {}): QueueInstance {
  // Private state using closures
  const eventEmitter = new EventEmitter();
  const resolvedOptions: Required<QueueOptions> = {
    concurrency: options.concurrency ?? 10,
    maxRetries: options.maxRetries ?? 3,
    retryDelay: options.retryDelay ?? 5000,
    storeResults: options.storeResults ?? true,
    resultTTL: options.resultTTL ?? 3600000,
    enablePriority: options.enablePriority ?? true,
    enableRateLimiting: options.enableRateLimiting ?? false,
    rateLimit: options.rateLimit ?? { limit: 100, duration: 60000 },
  };

  const jobQueue = new PQueue({
    concurrency: resolvedOptions.concurrency,
    autoStart: true,
  });

  const activeJobs = new Map<string, JobData>();
  const jobResults = new Map<string, JobResponse>();
  const webhookResponses = new Map<string, WebhookResponse>();
  let jobCounter = 0;
  let rateLimitWindow: number[] = [];
  let cleanupInterval: NodeJS.Timeout | null = null;

  // Setup event handlers
  const setupEventHandlers = (): void => {
    jobQueue.on("active", () => {
      eventEmitter.emit("queue:active", { size: jobQueue.size });
    });

    jobQueue.on("idle", () => {
      eventEmitter.emit("queue:idle");
    });
  };

  // Start cleanup interval
  const startCleanupInterval = (): void => {
    cleanupInterval = setInterval(() => {
      const now = Date.now();
      const ttl = resolvedOptions.resultTTL;

      for (const [id, result] of jobResults.entries()) {
        if (result.result?.endTime) {
          const age = now - result.result.endTime.getTime();
          if (age > ttl) {
            jobResults.delete(id);
          }
        }
      }

      rateLimitWindow = rateLimitWindow.filter(
        (time) => now - time < resolvedOptions.rateLimit.duration,
      );
    }, 60000);
  };

  setupEventHandlers();
  startCleanupInterval();

  // Private helper functions
  const checkRateLimit = (): boolean => {
    if (!resolvedOptions.enableRateLimiting) return true;

    const now = Date.now();
    rateLimitWindow = rateLimitWindow.filter(
      (time) => now - time < resolvedOptions.rateLimit.duration,
    );

    return rateLimitWindow.length < resolvedOptions.rateLimit.limit;
  };

  const delay = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  const processJob = async (
    jobData: JobData,
    _options: JobOptions,
  ): Promise<JobResponse> => {
    await delay(100);

    const mockResult: ExecutionResult = {
      executionId: jobData.executionId,
      blueprintId: jobData.blueprintId,
      status: "completed",
      startTime: new Date(Date.now() - 100),
      endTime: new Date(),
      outputs: {
        result: `Processed ${jobData.blueprintId}`,
      },
      metrics: {
        executionTimeMs: 100,
        memoryUsedMB: 1,
        nodesExecuted: 1,
      },
    };

    return {
      success: true,
      result: mockResult,
    };
  };

  const retry = async (
    jobData: JobData,
    options: JobOptions,
    attemptsLeft: number,
  ): Promise<void> => {
    const retryDelay =
      options.backoff?.type === "exponential"
        ? options.backoff.delay * Math.pow(2, options.attempts! - attemptsLeft)
        : (options.backoff?.delay ?? resolvedOptions.retryDelay);

    await delay(retryDelay);

    const retryJobData: JobData = {
      ...jobData,
      retryOf: jobData.executionId,
    };

    await add(retryJobData, {
      ...options,
      attempts: attemptsLeft,
    });
  };

  const add = async (
    jobData: JobData,
    options: JobOptions = {},
  ): Promise<string> => {
    if (!checkRateLimit()) {
      throw new Error("Rate limit exceeded");
    }

    const jobId = `job_${++jobCounter}_${Date.now()}`;

    const job = async () => {
      try {
        activeJobs.set(jobId, jobData);
        eventEmitter.emit("job:started", { jobId, jobData });

        await delay(options.delay ?? 0);

        const result = await processJob(jobData, options);

        if (resolvedOptions.storeResults) {
          jobResults.set(jobId, result);
        }

        eventEmitter.emit("job:completed", { jobId, result });

        if (options.removeOnComplete) {
          activeJobs.delete(jobId);
          jobResults.delete(jobId);
        }

        return result;
      } catch (error) {
        const jobError = error as Error;
        const response: JobResponse = {
          success: false,
          error: {
            message: jobError.message,
            stack: jobError.stack,
            code: "EXECUTION_ERROR",
          },
        };

        if (resolvedOptions.storeResults) {
          jobResults.set(jobId, response);
        }

        eventEmitter.emit("job:failed", { jobId, error: jobError });

        if (options.attempts && options.attempts > 1) {
          await retry(jobData, options, options.attempts - 1);
        }

        if (!options.removeOnFail) {
          activeJobs.delete(jobId);
        }

        throw error;
      } finally {
        activeJobs.delete(jobId);
        rateLimitWindow.push(Date.now());
      }
    };

    // Add to queue with proper priority support
    const queueTask =
      resolvedOptions.enablePriority && options.priority !== undefined
        ? () => jobQueue.add(job, { priority: options.priority })
        : () => jobQueue.add(job);

    await queueTask();
    return jobId;
  };

  // Return public API
  return {
    add,

    async pause(): Promise<void> {
      jobQueue.pause();
      eventEmitter.emit("queue:paused");
    },

    async resume(): Promise<void> {
      jobQueue.start();
      eventEmitter.emit("queue:resumed");
    },

    async clear(): Promise<void> {
      jobQueue.clear();
      activeJobs.clear();
      eventEmitter.emit("queue:cleared");
    },

    async getJob(jobId: string): Promise<JobData | undefined> {
      return activeJobs.get(jobId);
    },

    async getJobResult(jobId: string): Promise<JobResponse | undefined> {
      return jobResults.get(jobId);
    },

    async getActiveJobs(): Promise<JobData[]> {
      return Array.from(activeJobs.values());
    },

    async getQueueSize(): Promise<number> {
      return jobQueue.size;
    },

    async getPendingCount(): Promise<number> {
      return jobQueue.pending;
    },

    async addWebhookResponse(response: WebhookResponse): Promise<void> {
      webhookResponses.set(response.executionId, response);
      eventEmitter.emit("webhook:response", response);

      setTimeout(() => {
        webhookResponses.delete(response.executionId);
      }, resolvedOptions.resultTTL);
    },

    async getWebhookResponse(
      executionId: string,
    ): Promise<WebhookResponse | undefined> {
      return webhookResponses.get(executionId);
    },

    decodeWebhookResponse(response: WebhookResponse): unknown {
      if (typeof response.response.body === "string") {
        try {
          return JSON.parse(response.response.body);
        } catch {
          return response.response.body;
        }
      }
      return response.response.body;
    },

    async gracefulShutdown(): Promise<void> {
      eventEmitter.emit("queue:shutting-down");

      jobQueue.pause();

      await jobQueue.onIdle();

      activeJobs.clear();
      jobResults.clear();
      webhookResponses.clear();

      if (cleanupInterval) {
        clearInterval(cleanupInterval);
      }

      eventEmitter.emit("queue:shutdown");
      eventEmitter.removeAllListeners();
    },

    getMetrics(): {
      activeJobs: number;
      pendingJobs: number;
      completedJobs: number;
      failedJobs: number;
      queueSize: number;
      rateLimitRemaining?: number;
    } {
      const completedJobs = Array.from(jobResults.values()).filter(
        (r) => r.success,
      ).length;
      const failedJobs = Array.from(jobResults.values()).filter(
        (r) => !r.success,
      ).length;

      return {
        activeJobs: activeJobs.size,
        pendingJobs: jobQueue.pending,
        completedJobs,
        failedJobs,
        queueSize: jobQueue.size,
        rateLimitRemaining: resolvedOptions.enableRateLimiting
          ? resolvedOptions.rateLimit.limit - rateLimitWindow.length
          : undefined,
      };
    },

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

export type ScalableQueueInstance = QueueInstance & {
  distributeJob: (jobData: JobData) => Promise<string>;
  getWorkerMetrics: () => WorkerInfo[];
};

export function createScalableQueue(
  options: QueueOptions & {
    redis?: RedisConfig;
    workers?: number;
  } = {},
): ScalableQueueInstance {
  const baseQueue = createQueue(options);
  const workers = new Map<string, WorkerInfo>();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _redisConfig = options.redis;

  const initializeWorkers = (count: number): void => {
    for (let i = 0; i < count; i++) {
      const workerId = `worker_${i}`;
      workers.set(workerId, {
        id: workerId,
        status: "idle",
        currentJob: null,
        processedCount: 0,
        errorCount: 0,
        startTime: Date.now(),
      });
    }
  };

  if (options.workers) {
    initializeWorkers(options.workers);
  }

  const getAvailableWorker = (): WorkerInfo | undefined => {
    for (const worker of workers.values()) {
      if (worker.status === "idle") {
        return worker;
      }
    }
    return undefined;
  };

  const distributeJob = async (jobData: JobData): Promise<string> => {
    const availableWorker = getAvailableWorker();
    if (!availableWorker) {
      return baseQueue.add(jobData);
    }

    availableWorker.status = "busy";
    availableWorker.currentJob = jobData.executionId;

    try {
      const jobId = await baseQueue.add(jobData);
      availableWorker.processedCount++;
      return jobId;
    } catch (error) {
      availableWorker.errorCount++;
      throw error;
    } finally {
      availableWorker.status = "idle";
      availableWorker.currentJob = null;
    }
  };

  const getWorkerMetrics = (): WorkerInfo[] => {
    return Array.from(workers.values());
  };

  return {
    ...baseQueue,
    distributeJob,
    getWorkerMetrics,
  };
}

type WorkerInfo = {
  id: string;
  status: "idle" | "busy" | "error";
  currentJob: string | null;
  processedCount: number;
  errorCount: number;
  startTime: number;
};

type RedisConfig = {
  host: string;
  port: number;
  password?: string;
  db?: number;
  prefix?: string;
  enableReadyCheck?: boolean;
};
