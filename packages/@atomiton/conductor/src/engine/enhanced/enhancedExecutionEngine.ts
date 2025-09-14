/**
 * Enhanced execution engine factory using functional approach
 */

import type { CompositeDefinition } from "@atomiton/nodes";
import { generateExecutionId } from "@atomiton/utils";
import {
  createCompositeRunner,
  type CompositeRunnerInstance,
} from "../../execution";
import type {
  ExecutionResult,
  ExecutionStatus,
  ExecutionRequest,
} from "../../interfaces/IExecutionEngine";
import {
  createScalableQueue,
  type ScalableQueueInstance,
  type JobData,
  type JobOptions,
} from "../../queue";
import {
  createNodeExecutor,
  type NodeExecutorInstance,
} from "../../execution/nodeExecutor";
import { createExecutionStore, type ExecutionStore } from "../../store";
import type {
  EnhancedExecutionOptions,
  EnhancedEngineInstance,
  ExecutionContext,
  ExecutionHistoryEntry,
} from "./types";
import { createMetricsManager } from "./metricsManager";
import { createWebhookManager } from "./webhookManager";
import { createEventHandlers } from "./eventHandlers";

export function createEnhancedExecutionEngine(
  options: EnhancedExecutionOptions = {},
): EnhancedEngineInstance {
  // Private state using closures
  const queue: ScalableQueueInstance = createScalableQueue({
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

  const executionStore: ExecutionStore = createExecutionStore();
  const nodeExecutor: NodeExecutorInstance = createNodeExecutor();
  const compositeRunner: CompositeRunnerInstance = createCompositeRunner(
    executionStore,
    nodeExecutor,
  );

  const executionContexts = new Map<string, ExecutionContext>();

  // Initialize modular components
  const metricsManager = createMetricsManager(queue);
  const webhookManager = createWebhookManager();
  const eventHandlers = createEventHandlers(
    queue,
    metricsManager,
    webhookManager,
  );

  // Setup event handling
  eventHandlers.setupQueueHandlers();
  eventHandlers.setupMetricsCollection();

  const execute = async (
    request: ExecutionRequest,
  ): Promise<ExecutionResult> => {
    const compositeId = request.blueprintId;
    const input = request.inputs;
    const options = {
      priority: request.config?.parallel ? 10 : 5,
      delay: 0,
    };
    const executionId = generateExecutionId();

    const context: ExecutionContext = {
      executionId,
      compositeId,
      input,
      startTime: new Date(),
      status: "pending",
      variables: new Map(),
      outputs: {},
    };

    executionContexts.set(executionId, context);
    executionStore.initializeExecution(executionId, compositeId);

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

    const jobId = await queue.add(jobData, jobOptions);

    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(async () => {
        const result = await queue.getJobResult(jobId);
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
  };

  const executeComposite = async (
    composite: CompositeDefinition,
    input?: unknown,
  ): Promise<ExecutionResult> => {
    generateExecutionId();

    try {
      const result = await compositeRunner.execute(composite, {
        inputs: input as Record<string, unknown>,
      });

      metricsManager.incrementTotalExecutions();
      metricsManager.incrementSuccessfulExecutions();

      const executionTime = result.metrics?.totalExecutionTime ?? 0;
      metricsManager.updateAverageExecutionTime(executionTime);

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
      metricsManager.incrementTotalExecutions();
      metricsManager.incrementFailedExecutions();

      throw error;
    }
  };

  const pause = async (executionId: string): Promise<void> => {
    const context = executionContexts.get(executionId);
    if (!context) {
      throw new Error(`Execution ${executionId} not found`);
    }

    await queue.pause();
    executionStore.updateExecutionState(executionId, { status: "paused" });
    context.status = "paused";

    eventHandlers.emitExecutionPaused(executionId);
  };

  const resume = async (executionId: string): Promise<void> => {
    const context = executionContexts.get(executionId);
    if (!context) {
      throw new Error(`Execution ${executionId} not found`);
    }

    await queue.resume();
    executionStore.updateExecutionState(executionId, { status: "running" });
    context.status = "running";

    eventHandlers.emitExecutionResumed(executionId);
  };

  const cancel = async (executionId: string): Promise<void> => {
    const context = executionContexts.get(executionId);
    if (!context) {
      throw new Error(`Execution ${executionId} not found`);
    }

    await queue.clear();
    executionStore.updateExecutionState(executionId, {
      status: "cancelled",
    });
    context.status = "cancelled";

    executionContexts.delete(executionId);
    eventHandlers.emitExecutionCancelled(executionId);
  };

  const getExecutionHistory = async (
    limit: number = 100,
  ): Promise<ExecutionHistoryEntry[]> => {
    const history: ExecutionHistoryEntry[] = [];

    for (const [executionId, context] of executionContexts.entries()) {
      const state = executionStore.getExecution(executionId);
      history.push({
        executionId,
        compositeId: context.compositeId,
        status: context.status as ExecutionStatus,
        startTime: context.startTime.getTime(),
        endTime: state?.endTime ? state.endTime.getTime() : undefined,
        duration: state?.endTime
          ? state.endTime.getTime() - context.startTime.getTime()
          : undefined,
        error: undefined,
      });
    }

    return history.slice(-limit);
  };

  const getExecution = async (
    executionId: string,
  ): Promise<ExecutionResult | null> => {
    const state = executionStore.getExecution(executionId);
    if (!state) return null;

    return {
      executionId,
      blueprintId: state.blueprintId,
      status: state.status,
      startTime: state.startTime,
      endTime: state.endTime,
      outputs: undefined,
      metrics: {
        executionTimeMs: metricsManager.getMetrics().averageExecutionTime,
        memoryUsedMB: metricsManager.getMetrics().peakMemoryUsage,
        nodesExecuted: metricsManager.getMetrics().totalExecutions,
        nodesFailed: metricsManager.getMetrics().failedExecutions,
      },
      nodeResults: new Map(Object.entries(state.nodeStates)),
    };
  };

  const listExecutions = async (_filter?: {
    status?: ExecutionStatus;
    blueprintId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<ExecutionResult[]> => {
    return [];
  };

  const cleanup = async (_before?: Date): Promise<number> => {
    return 0;
  };

  const gracefulShutdown = async (): Promise<void> => {
    eventHandlers.emitEngineShuttingDown();

    for (const executionId of executionContexts.keys()) {
      await pause(executionId);
    }

    await queue.gracefulShutdown();

    executionContexts.clear();
    webhookManager.clear();

    eventHandlers.emitEngineShutdown();
  };

  // Return public API
  return {
    execute,
    executeComposite,
    pause,
    resume,
    cancel,
    getExecutionHistory,
    getExecution,
    listExecutions,
    cleanup,
    getMetrics: metricsManager.getMetrics,
    gracefulShutdown,
    registerWebhook: webhookManager.registerWebhook,
    handleWebhook: (webhookId: string, data: unknown) =>
      webhookManager.handleWebhook(webhookId, data, (blueprintId, inputs) =>
        execute({
          blueprintId,
          inputs,
          config: { debugMode: true },
        }),
      ),
  };
}
