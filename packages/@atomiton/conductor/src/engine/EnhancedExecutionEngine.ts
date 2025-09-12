import { EventEmitter } from "events";
import type {
  IExecutionEngine,
  ExecutionResult,
  ExecutionContext,
  ExecutionStatus,
} from "../interfaces/IExecutionEngine.js";
import { StateManager } from "../state/StateManager.js";
import { BlueprintRunner } from "../execution/BlueprintRunner.js";
import { RuntimeRouter } from "../runtime/RuntimeRouter.js";
import {
  ScalableQueue,
  type JobData,
  type JobOptions,
} from "../queue/Queue.js";
import type { BlueprintDefinition } from "@atomiton/storage";

export interface EnhancedExecutionOptions {
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
}

export class EnhancedExecutionEngine
  extends EventEmitter
  implements IExecutionEngine
{
  private queue: ScalableQueue;
  private stateManager: StateManager;
  private blueprintRunner: BlueprintRunner;
  private runtimeRouter: RuntimeRouter;
  private executionContexts: Map<string, ExecutionContext>;
  private webhookHandlers: Map<string, (data: unknown) => Promise<unknown>>;
  private metrics: ExecutionMetrics;

  constructor(options: EnhancedExecutionOptions = {}) {
    super();

    this.queue = new ScalableQueue({
      concurrency: options.concurrency ?? 10,
      maxRetries: options.maxRetries ?? 3,
      retryDelay: options.retryDelay ?? 5000,
      enablePriority: true,
      enableRateLimiting: options.rateLimit?.enabled ?? false,
      rateLimit: options.rateLimit
        ? {
            limit: options.rateLimit.limit,
            duration: options.rateLimit.duration,
          }
        : undefined,
      redis: options.redis,
      workers: options.workers,
    });

    this.stateManager = new StateManager();
    this.runtimeRouter = new RuntimeRouter();
    this.blueprintRunner = new BlueprintRunner(
      this.stateManager,
      this.runtimeRouter,
    );

    this.executionContexts = new Map();
    this.webhookHandlers = new Map();
    this.metrics = {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      averageExecutionTime: 0,
      peakMemoryUsage: 0,
      activeExecutions: 0,
    };

    this.setupQueueHandlers();
    this.setupMetricsCollection();
  }

  private setupQueueHandlers(): void {
    this.queue.on("job:started", ({ jobId, jobData }) => {
      this.metrics.activeExecutions++;
      this.emit("execution:started", {
        executionId: jobData.executionId,
        blueprintId: jobData.blueprintId,
      });
    });

    this.queue.on("job:completed", ({ jobId, result }) => {
      this.metrics.activeExecutions--;
      this.metrics.totalExecutions++;
      if (result.success) {
        this.metrics.successfulExecutions++;
      }
      this.emit("execution:completed", { jobId, result });
    });

    this.queue.on("job:failed", ({ jobId, error }) => {
      this.metrics.activeExecutions--;
      this.metrics.failedExecutions++;
      this.emit("execution:failed", { jobId, error });
    });

    this.queue.on("webhook:response", (response) => {
      this.emit("webhook:received", response);
    });
  }

  private setupMetricsCollection(): void {
    setInterval(() => {
      const queueMetrics = this.queue.getMetrics();
      const workerMetrics = this.queue.getWorkerMetrics();

      this.emit("metrics:update", {
        queue: queueMetrics,
        workers: workerMetrics,
        execution: this.metrics,
      });
    }, 5000);
  }

  async execute(
    blueprintId: string,
    input?: unknown,
    options?: {
      priority?: number;
      delay?: number;
      webhookId?: string;
    },
  ): Promise<ExecutionResult> {
    const executionId = this.generateExecutionId();

    const context: ExecutionContext = {
      executionId,
      blueprintId,
      input,
      startTime: Date.now(),
      status: "pending" as ExecutionStatus,
      variables: new Map(),
      outputs: {},
    };

    this.executionContexts.set(executionId, context);
    this.stateManager.initializeExecution(executionId, blueprintId);

    const jobData: JobData = {
      executionId,
      blueprintId,
      input,
      loadStaticData: true,
      webhookData: options?.webhookId
        ? {
            webhookId: options.webhookId,
            httpMethod: "POST",
            path: `/webhook/${options.webhookId}`,
            headers: {},
            body: input,
          }
        : undefined,
    };

    const jobOptions: JobOptions = {
      priority: options?.priority ?? 5,
      delay: options?.delay,
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
      removeOnComplete: false,
      removeOnFail: false,
    };

    const jobId = await this.queue.add(jobData, jobOptions);

    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(async () => {
        const result = await this.queue.getJobResult(jobId);
        if (result) {
          clearInterval(checkInterval);
          if (result.success && result.result) {
            resolve(result.result);
          } else {
            reject(result.error);
          }
        }
      }, 100);

      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error("Execution timeout"));
      }, 300000);
    });
  }

  async executeBlueprint(
    blueprint: BlueprintDefinition,
    input?: unknown,
  ): Promise<ExecutionResult> {
    const executionId = this.generateExecutionId();

    try {
      const result = await this.blueprintRunner.execute(
        blueprint,
        executionId,
        input,
      );

      this.metrics.totalExecutions++;
      this.metrics.successfulExecutions++;

      const executionTime =
        Date.now() - (result.metrics?.startTime ?? Date.now());
      this.updateAverageExecutionTime(executionTime);

      return result;
    } catch (error) {
      this.metrics.totalExecutions++;
      this.metrics.failedExecutions++;

      throw error;
    }
  }

  async pause(executionId: string): Promise<void> {
    const context = this.executionContexts.get(executionId);
    if (!context) {
      throw new Error(`Execution ${executionId} not found`);
    }

    await this.queue.pause();
    this.stateManager.updateExecutionState(executionId, { status: "paused" });
    context.status = "paused";

    this.emit("execution:paused", { executionId });
  }

  async resume(executionId: string): Promise<void> {
    const context = this.executionContexts.get(executionId);
    if (!context) {
      throw new Error(`Execution ${executionId} not found`);
    }

    await this.queue.resume();
    this.stateManager.updateExecutionState(executionId, { status: "running" });
    context.status = "running";

    this.emit("execution:resumed", { executionId });
  }

  async cancel(executionId: string): Promise<void> {
    const context = this.executionContexts.get(executionId);
    if (!context) {
      throw new Error(`Execution ${executionId} not found`);
    }

    await this.queue.clear();
    this.stateManager.updateExecutionState(executionId, {
      status: "cancelled",
    });
    context.status = "cancelled";

    this.executionContexts.delete(executionId);
    this.emit("execution:cancelled", { executionId });
  }

  async registerWebhook(
    webhookId: string,
    handler: (data: unknown) => Promise<unknown>,
  ): Promise<void> {
    this.webhookHandlers.set(webhookId, handler);
    this.emit("webhook:registered", { webhookId });
  }

  async handleWebhook(
    webhookId: string,
    data: unknown,
  ): Promise<ExecutionResult> {
    const handler = this.webhookHandlers.get(webhookId);
    if (!handler) {
      throw new Error(`Webhook ${webhookId} not registered`);
    }

    const input = await handler(data);
    return this.execute(`webhook_${webhookId}`, input, { webhookId });
  }

  async getExecutionStatus(executionId: string): Promise<ExecutionStatus> {
    const state = this.stateManager.getExecutionState(executionId);
    return state?.status ?? ("unknown" as ExecutionStatus);
  }

  async getExecutionHistory(
    limit: number = 100,
  ): Promise<ExecutionHistoryEntry[]> {
    const history: ExecutionHistoryEntry[] = [];

    for (const [executionId, context] of this.executionContexts.entries()) {
      const state = this.stateManager.getExecutionState(executionId);
      history.push({
        executionId,
        blueprintId: context.blueprintId,
        status: context.status,
        startTime: context.startTime,
        endTime: state?.endTime,
        duration: state?.endTime
          ? state.endTime - context.startTime
          : undefined,
        error: state?.error,
      });
    }

    return history.slice(-limit);
  }

  getMetrics(): ExecutionMetrics {
    return {
      ...this.metrics,
      queueMetrics: this.queue.getMetrics(),
      workerMetrics: this.queue.getWorkerMetrics(),
    };
  }

  async gracefulShutdown(): Promise<void> {
    this.emit("engine:shutting-down");

    for (const executionId of this.executionContexts.keys()) {
      await this.pause(executionId);
    }

    await this.queue.gracefulShutdown();

    this.executionContexts.clear();
    this.webhookHandlers.clear();

    this.emit("engine:shutdown");
  }

  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private updateAverageExecutionTime(newTime: number): void {
    const totalTime =
      this.metrics.averageExecutionTime *
      (this.metrics.successfulExecutions - 1);
    this.metrics.averageExecutionTime =
      (totalTime + newTime) / this.metrics.successfulExecutions;
  }
}

interface ExecutionMetrics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  peakMemoryUsage: number;
  activeExecutions: number;
  queueMetrics?: ReturnType<ScalableQueue["getMetrics"]>;
  workerMetrics?: ReturnType<ScalableQueue["getWorkerMetrics"]>;
}

interface ExecutionHistoryEntry {
  executionId: string;
  blueprintId: string;
  status: ExecutionStatus;
  startTime: number;
  endTime?: number;
  duration?: number;
  error?: string;
}
