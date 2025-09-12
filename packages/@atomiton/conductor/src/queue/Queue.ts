import { EventEmitter } from "events";
import PQueue from "p-queue";
import type {
  BlueprintDefinition,
  ExecutionError,
  ExecutionResult,
} from "../interfaces/IExecutionEngine.js";

export interface JobData {
  executionId: string;
  blueprintId: string;
  input?: unknown;
  loadStaticData?: boolean;
  retryOf?: string;
  webhookData?: WebhookData;
}

export interface JobResponse {
  success: boolean;
  result?: ExecutionResult;
  error?: ExecutionError;
}

export interface WebhookData {
  webhookId: string;
  httpMethod: string;
  path: string;
  headers: Record<string, string>;
  body: unknown;
}

export interface WebhookResponse {
  executionId: string;
  response: {
    statusCode: number;
    headers?: Record<string, string>;
    body?: unknown;
  };
}

export interface QueueOptions {
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
}

export interface JobOptions {
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
}

export class Queue extends EventEmitter {
  private jobQueue: PQueue;
  private activeJobs: Map<string, JobData>;
  private jobResults: Map<string, JobResponse>;
  private webhookResponses: Map<string, WebhookResponse>;
  private options: Required<QueueOptions>;
  private jobCounter: number = 0;
  private rateLimitWindow: number[] = [];

  constructor(options: QueueOptions = {}) {
    super();

    this.options = {
      concurrency: options.concurrency ?? 10,
      maxRetries: options.maxRetries ?? 3,
      retryDelay: options.retryDelay ?? 5000,
      storeResults: options.storeResults ?? true,
      resultTTL: options.resultTTL ?? 3600000,
      enablePriority: options.enablePriority ?? true,
      enableRateLimiting: options.enableRateLimiting ?? false,
      rateLimit: options.rateLimit ?? { limit: 100, duration: 60000 },
    };

    this.jobQueue = new PQueue({
      concurrency: this.options.concurrency,
      autoStart: true,
    });

    this.activeJobs = new Map();
    this.jobResults = new Map();
    this.webhookResponses = new Map();

    this.setupEventHandlers();
    this.startCleanupInterval();
  }

  private setupEventHandlers(): void {
    this.jobQueue.on("active", () => {
      this.emit("queue:active", { size: this.jobQueue.size });
    });

    this.jobQueue.on("idle", () => {
      this.emit("queue:idle");
    });
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      const now = Date.now();
      const ttl = this.options.resultTTL;

      for (const [id, result] of this.jobResults.entries()) {
        if (result.result?.metrics?.endTime) {
          const age = now - result.result.metrics.endTime;
          if (age > ttl) {
            this.jobResults.delete(id);
          }
        }
      }

      this.rateLimitWindow = this.rateLimitWindow.filter(
        (time) => now - time < this.options.rateLimit.duration,
      );
    }, 60000);
  }

  private checkRateLimit(): boolean {
    if (!this.options.enableRateLimiting) return true;

    const now = Date.now();
    this.rateLimitWindow = this.rateLimitWindow.filter(
      (time) => now - time < this.options.rateLimit.duration,
    );

    return this.rateLimitWindow.length < this.options.rateLimit.limit;
  }

  async add(jobData: JobData, options: JobOptions = {}): Promise<string> {
    if (!this.checkRateLimit()) {
      throw new Error("Rate limit exceeded");
    }

    const jobId = `job_${++this.jobCounter}_${Date.now()}`;

    const job = async () => {
      try {
        this.activeJobs.set(jobId, jobData);
        this.emit("job:started", { jobId, jobData });

        await this.delay(options.delay ?? 0);

        const result = await this.processJob(jobData, options);

        if (this.options.storeResults) {
          this.jobResults.set(jobId, result);
        }

        this.emit("job:completed", { jobId, result });

        if (options.removeOnComplete) {
          this.activeJobs.delete(jobId);
          this.jobResults.delete(jobId);
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

        if (this.options.storeResults) {
          this.jobResults.set(jobId, response);
        }

        this.emit("job:failed", { jobId, error: jobError });

        if (options.attempts && options.attempts > 1) {
          await this.retry(jobData, options, options.attempts - 1);
        }

        if (!options.removeOnFail) {
          this.activeJobs.delete(jobId);
        }

        throw error;
      } finally {
        this.activeJobs.delete(jobId);
        this.rateLimitWindow.push(Date.now());
      }
    };

    // Add to queue with proper priority support
    const queueTask =
      this.options.enablePriority && options.priority !== undefined
        ? () => this.jobQueue.add(job, { priority: options.priority })
        : () => this.jobQueue.add(job);

    await queueTask();
    return jobId;
  }

  private async processJob(
    jobData: JobData,
    options: JobOptions,
  ): Promise<JobResponse> {
    await this.delay(100);

    const mockResult: ExecutionResult = {
      success: true,
      executionId: jobData.executionId,
      outputs: {
        result: `Processed ${jobData.blueprintId}`,
      },
      metrics: {
        startTime: Date.now() - 100,
        endTime: Date.now(),
        executionTime: 100,
        memoryUsed: 1024 * 1024,
      },
    };

    return {
      success: true,
      result: mockResult,
    };
  }

  private async retry(
    jobData: JobData,
    options: JobOptions,
    attemptsLeft: number,
  ): Promise<void> {
    const delay =
      options.backoff?.type === "exponential"
        ? options.backoff.delay * Math.pow(2, options.attempts! - attemptsLeft)
        : (options.backoff?.delay ?? this.options.retryDelay);

    await this.delay(delay);

    const retryJobData: JobData = {
      ...jobData,
      retryOf: jobData.executionId,
    };

    await this.add(retryJobData, {
      ...options,
      attempts: attemptsLeft,
    });
  }

  async pause(): Promise<void> {
    this.jobQueue.pause();
    this.emit("queue:paused");
  }

  async resume(): Promise<void> {
    this.jobQueue.start();
    this.emit("queue:resumed");
  }

  async clear(): Promise<void> {
    this.jobQueue.clear();
    this.activeJobs.clear();
    this.emit("queue:cleared");
  }

  async getJob(jobId: string): Promise<JobData | undefined> {
    return this.activeJobs.get(jobId);
  }

  async getJobResult(jobId: string): Promise<JobResponse | undefined> {
    return this.jobResults.get(jobId);
  }

  async getActiveJobs(): Promise<JobData[]> {
    return Array.from(this.activeJobs.values());
  }

  async getQueueSize(): Promise<number> {
    return this.jobQueue.size;
  }

  async getPendingCount(): Promise<number> {
    return this.jobQueue.pending;
  }

  async addWebhookResponse(response: WebhookResponse): Promise<void> {
    this.webhookResponses.set(response.executionId, response);
    this.emit("webhook:response", response);

    setTimeout(() => {
      this.webhookResponses.delete(response.executionId);
    }, this.options.resultTTL);
  }

  async getWebhookResponse(
    executionId: string,
  ): Promise<WebhookResponse | undefined> {
    return this.webhookResponses.get(executionId);
  }

  decodeWebhookResponse(response: WebhookResponse): unknown {
    if (typeof response.response.body === "string") {
      try {
        return JSON.parse(response.response.body);
      } catch {
        return response.response.body;
      }
    }
    return response.response.body;
  }

  async gracefulShutdown(): Promise<void> {
    this.emit("queue:shutting-down");

    this.jobQueue.pause();

    await this.jobQueue.onIdle();

    this.activeJobs.clear();
    this.jobResults.clear();
    this.webhookResponses.clear();

    this.emit("queue:shutdown");
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getMetrics(): {
    activeJobs: number;
    pendingJobs: number;
    completedJobs: number;
    failedJobs: number;
    queueSize: number;
    rateLimitRemaining?: number;
  } {
    const completedJobs = Array.from(this.jobResults.values()).filter(
      (r) => r.success,
    ).length;
    const failedJobs = Array.from(this.jobResults.values()).filter(
      (r) => !r.success,
    ).length;

    return {
      activeJobs: this.activeJobs.size,
      pendingJobs: this.jobQueue.pending,
      completedJobs,
      failedJobs,
      queueSize: this.jobQueue.size,
      rateLimitRemaining: this.options.enableRateLimiting
        ? this.options.rateLimit.limit - this.rateLimitWindow.length
        : undefined,
    };
  }
}

export class ScalableQueue extends Queue {
  private workers: Map<string, WorkerInfo> = new Map();
  private redisConfig?: RedisConfig;

  constructor(
    options: QueueOptions & {
      redis?: RedisConfig;
      workers?: number;
    } = {},
  ) {
    super(options);
    this.redisConfig = options.redis;

    if (options.workers) {
      this.initializeWorkers(options.workers);
    }
  }

  private initializeWorkers(count: number): void {
    for (let i = 0; i < count; i++) {
      const workerId = `worker_${i}`;
      this.workers.set(workerId, {
        id: workerId,
        status: "idle",
        currentJob: null,
        processedCount: 0,
        errorCount: 0,
        startTime: Date.now(),
      });
    }
  }

  async distributeJob(jobData: JobData): Promise<string> {
    const availableWorker = this.getAvailableWorker();
    if (!availableWorker) {
      return super.add(jobData);
    }

    availableWorker.status = "busy";
    availableWorker.currentJob = jobData.executionId;

    try {
      const jobId = await super.add(jobData);
      availableWorker.processedCount++;
      return jobId;
    } catch (error) {
      availableWorker.errorCount++;
      throw error;
    } finally {
      availableWorker.status = "idle";
      availableWorker.currentJob = null;
    }
  }

  private getAvailableWorker(): WorkerInfo | undefined {
    for (const worker of this.workers.values()) {
      if (worker.status === "idle") {
        return worker;
      }
    }
    return undefined;
  }

  getWorkerMetrics(): WorkerInfo[] {
    return Array.from(this.workers.values());
  }
}

interface WorkerInfo {
  id: string;
  status: "idle" | "busy" | "error";
  currentJob: string | null;
  processedCount: number;
  errorCount: number;
  startTime: number;
}

interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  prefix?: string;
  enableReadyCheck?: boolean;
}
