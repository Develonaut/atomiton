/**
 * Main queue factory using modular components
 */

import { events } from "@atomiton/events";
import { delay, generateJobId } from "@atomiton/utils";
import PQueue from "p-queue";
import type {
  QueueOptions,
  JobOptions,
  JobData,
  JobResponse,
  QueueInstance,
} from "./types";
import { createRateLimiter } from "./rateLimiting";
import { processJob, calculateRetryDelay } from "./jobProcessing";
import { createWebhookManager } from "./webhookHandling";
import { createMetricsCalculator } from "./queueMetrics";

type QueueEvents = {
  "queue:active": { size: number };
  "queue:idle": void;
  "queue:paused": void;
  "queue:resumed": void;
  "queue:cleared": void;
  "queue:shutting-down": void;
  "queue:shutdown": void;
  "job:started": { jobId: string; jobData: JobData };
  "job:completed": { jobId: string; result: JobResponse };
  "job:failed": { jobId: string; error: Error };
};

export function createQueue(options: QueueOptions = {}): QueueInstance {
  // Private state using closures
  const queueId = `queue_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  const queueEventBus = events.createEventBus<QueueEvents>(
    `conductor:queue:${queueId}`,
  );

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
  let cleanupInterval: NodeJS.Timeout | null = null;

  // Initialize modular components
  const rateLimiter = createRateLimiter({
    enableRateLimiting: resolvedOptions.enableRateLimiting,
    rateLimit: resolvedOptions.rateLimit,
  });

  const webhookManager = createWebhookManager(resolvedOptions.resultTTL);

  const metricsCalculator = createMetricsCalculator(
    activeJobs,
    jobResults,
    jobQueue,
    rateLimiter.getRemainingLimit,
  );

  // Setup event handlers
  const setupEventHandlers = (): void => {
    jobQueue.on("active", () => {
      queueEventBus.emit("queue:active", { size: jobQueue.size });
    });

    jobQueue.on("idle", () => {
      queueEventBus.emit("queue:idle", undefined);
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

      rateLimiter.cleanup(now);
    }, 60000);
  };

  setupEventHandlers();
  startCleanupInterval();

  // Retry logic
  const retry = async (
    jobData: JobData,
    options: JobOptions,
    attemptsLeft: number,
  ): Promise<void> => {
    const retryDelay = calculateRetryDelay(
      options,
      attemptsLeft,
      resolvedOptions.retryDelay,
    );

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
    if (!rateLimiter.checkRateLimit()) {
      throw new Error("Rate limit exceeded");
    }

    const jobId = generateJobId();

    const job = async () => {
      try {
        activeJobs.set(jobId, jobData);
        queueEventBus.emit("job:started", { jobId, jobData });

        await delay(options.delay ?? 0);

        const result = await processJob(jobData, options);

        if (resolvedOptions.storeResults) {
          jobResults.set(jobId, result);
        }

        queueEventBus.emit("job:completed", { jobId, result });

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

        queueEventBus.emit("job:failed", { jobId, error: jobError });

        if (options.attempts && options.attempts > 1) {
          await retry(jobData, options, options.attempts - 1);
        }

        if (!options.removeOnFail) {
          activeJobs.delete(jobId);
        }

        throw error;
      } finally {
        activeJobs.delete(jobId);
        rateLimiter.recordRequest();
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
      queueEventBus.emit("queue:paused", undefined);
    },

    async resume(): Promise<void> {
      jobQueue.start();
      queueEventBus.emit("queue:resumed", undefined);
    },

    async clear(): Promise<void> {
      jobQueue.clear();
      activeJobs.clear();
      queueEventBus.emit("queue:cleared", undefined);
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

    addWebhookResponse: webhookManager.addWebhookResponse,
    getWebhookResponse: webhookManager.getWebhookResponse,
    decodeWebhookResponse: webhookManager.decodeWebhookResponse,

    async gracefulShutdown(): Promise<void> {
      queueEventBus.emit("queue:shutting-down", undefined);

      jobQueue.pause();
      await jobQueue.onIdle();

      activeJobs.clear();
      jobResults.clear();
      webhookManager.clear();

      if (cleanupInterval) {
        clearInterval(cleanupInterval);
      }

      queueEventBus.emit("queue:shutdown", undefined);
    },

    getMetrics: metricsCalculator.getMetrics,

    // Event methods using @atomiton/events
    on: (event: string, listener: (...args: unknown[]) => void) => {
      return queueEventBus.on(event as keyof QueueEvents, listener as any);
    },
    off: (event: string, listener: (...args: unknown[]) => void) => {
      // For backward compatibility, convert to proper unsubscribe
      // Note: This is a simplified implementation
      return queueEventBus
        .on(event as keyof QueueEvents, listener as never)
        .unsubscribe();
    },
    emit: (event: string, ...args: unknown[]): void => {
      queueEventBus.emit(event as keyof QueueEvents, args[0] as any);
    },
  };
}
