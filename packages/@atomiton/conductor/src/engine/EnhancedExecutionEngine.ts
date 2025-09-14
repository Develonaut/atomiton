import type { CompositeDefinition } from "@atomiton/nodes";
import { EventEmitter } from "events";
import { CompositeRunner } from "../execution/CompositeRunner";
import type {
  ExecutionResult,
  ExecutionStatus,
  IExecutionEngine,
  ExecutionRequest,
} from "../interfaces/IExecutionEngine";
import { ScalableQueue, type JobData, type JobOptions } from "../queue/Queue";
import { NodeExecutor } from "../execution/NodeExecutor";
import { StateManager } from "../state/StateManager";

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

export class EnhancedExecutionEngine
  extends EventEmitter
  implements IExecutionEngine
{
  private queue: ScalableQueue;
  private stateManager: StateManager;
  private compositeRunner: CompositeRunner;
  private nodeExecutor: NodeExecutor;
  private executionContexts: Map<string, any>;
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
    this.nodeExecutor = new NodeExecutor();
    this.compositeRunner = new CompositeRunner(
      this.stateManager,
      this.nodeExecutor,
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
    this.queue.on("job:started", ({ jobId: _jobId, jobData }) => {
      this.metrics.activeExecutions++;
      this.emit("execution:started", {
        executionId: jobData.executionId,
        compositeId: jobData.compositeId,
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

  async execute(request: ExecutionRequest): Promise<ExecutionResult> {
    const compositeId = request.blueprintId;
    const input = request.inputs;
    const options = {
      priority: request.config?.parallel ? 10 : 5,
      delay: 0,
    };
    const executionId = this.generateExecutionId();

    const context = {
      executionId,
      compositeId,
      input,
      startTime: Date.now(),
      status: "pending" as ExecutionStatus,
      variables: new Map(),
      outputs: {},
    };

    this.executionContexts.set(executionId, context);
    this.stateManager.initializeExecution(executionId, compositeId);

    const jobData: JobData = {
      executionId,
      blueprintId: compositeId,
      input,
      loadStaticData: true,
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

  async executeComposite(
    composite: CompositeDefinition,
    input?: unknown,
  ): Promise<ExecutionResult> {
    const executionId = this.generateExecutionId();

    try {
      const result = await this.compositeRunner.execute(composite, {
        inputs: input as Record<string, unknown>,
      });

      this.metrics.totalExecutions++;
      this.metrics.successfulExecutions++;

      const executionTime = result.metrics?.totalExecutionTime ?? 0;
      this.updateAverageExecutionTime(executionTime);

      return {
        executionId: result.executionId,
        blueprintId: composite.id,
        status: result.success
          ? ("completed" as ExecutionStatus)
          : ("failed" as ExecutionStatus),
        startTime: new Date(),
        outputs: result.outputs,
        metrics: result.metrics
          ? {
              executionTimeMs: result.metrics.totalExecutionTime,
              nodesExecuted: result.metrics.nodesExecuted,
              memoryUsedMB: result.metrics.peakMemoryUsage,
            }
          : undefined,
      };
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
    return this.execute({
      blueprintId: `webhook_${webhookId}`,
      inputs: input as Record<string, unknown>,
      config: { debugMode: true },
    });
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
        compositeId: context.compositeId,
        status: context.status,
        startTime: context.startTime,
        endTime: state?.endTime ? state.endTime.getTime() : undefined,
        duration: state?.endTime
          ? state.endTime.getTime() - context.startTime.getTime()
          : undefined,
        error: undefined, // Error is tracked in ExecutionState differently
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

  // Missing interface methods
  async getExecution(executionId: string): Promise<ExecutionResult | null> {
    const state = this.stateManager.getContext(executionId);
    if (!state) return null;

    return {
      executionId,
      blueprintId: state.blueprintId,
      status: state.status,
      startTime: state.startTime,
      endTime: state.endTime,
      outputs: undefined, // TODO: Add outputs to ExecutionState
      metrics: {
        // Metrics structure differs between interfaces
        successfulExecutions: this.metrics.successfulExecutions,
        failedExecutions: this.metrics.failedExecutions,
        averageExecutionTime: this.metrics.averageExecutionTime,
        peakMemoryUsage: this.metrics.peakMemoryUsage,
        activeExecutions: this.metrics.activeExecutions,
      },
      nodeResults: state.nodeStates,
    };
  }

  async listExecutions(filter?: {
    status?: ExecutionStatus;
    blueprintId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<ExecutionResult[]> {
    // For now, return empty array - full implementation would query state manager
    return [];
  }

  async cleanup(before?: Date): Promise<number> {
    // For now, return 0 - full implementation would clean up old executions
    return 0;
  }
}

type ExecutionMetrics = {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  peakMemoryUsage: number;
  activeExecutions: number;
  queueMetrics?: ReturnType<ScalableQueue["getMetrics"]>;
  workerMetrics?: ReturnType<ScalableQueue["getWorkerMetrics"]>;
};

type ExecutionHistoryEntry = {
  executionId: string;
  compositeId: string;
  status: ExecutionStatus;
  startTime: number;
  endTime?: number;
  duration?: number;
  error?: string;
};
