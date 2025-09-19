import { EventEmitter } from "events";
import PQueue from "p-queue";
import { v4 as uuidv4 } from "uuid";
// import type { IStorageEngine } from "@atomiton/storage";
import type {
  NodeExecutionContext,
  CompositeDefinition,
} from "@atomiton/nodes/executable";
import type {
  IExecutionEngine,
  ExecutionRequest,
  ExecutionResult,
  ExecutionStatus,
  ExecutionError,
  ExecutionMetrics,
} from "../interfaces/IExecutionEngine";
import { createCompositeRunner } from "../execution";
import { createNodeExecutor } from "../execution/nodeExecutor";
import { createExecutionStore } from "../store";

export type ExecutionEngineInstance = IExecutionEngine & {
  shutdown: () => Promise<void>;
  on: (event: string, listener: (...args: unknown[]) => void) => void;
  off: (event: string, listener: (...args: unknown[]) => void) => void;
  emit: (event: string, ...args: unknown[]) => void;
};

/**
 * Creates a main execution engine
 * Orchestrates Composite and node execution with proper state management
 */
export function createExecutionEngine(config?: {
  concurrency?: number;
  storage?: unknown; // IStorageEngine from @atomiton/storage
  timeout?: number;
}): ExecutionEngineInstance {
  // Private state using closures
  const eventEmitter = new EventEmitter();
  const queue = new PQueue({
    concurrency: config?.concurrency ?? 4,
    interval: 100,
    intervalCap: 10,
  });

  const executionStore = createExecutionStore();
  const nodeExecutor = createNodeExecutor();
  const compositeRunner = createCompositeRunner(executionStore, nodeExecutor);
  const storage = config?.storage;
  const executions = new Map<string, ExecutionResult>();

  // Private helper functions
  const createExecutionContext = (
    executionId: string,
    composite: CompositeDefinition,
    request: ExecutionRequest,
  ): NodeExecutionContext => {
    return {
      nodeId: executionId,
      compositeId: composite.id,
      inputs: request.inputs ?? {},
      parameters: request.config,
      startTime: new Date(),
      limits: {
        maxExecutionTimeMs: request.config?.timeout ?? 60000,
        maxMemoryMB: request.config?.maxMemory ?? 512,
      },
      reportProgress: (progress: number, message?: string) => {
        eventEmitter.emit("execution:progress", {
          executionId,
          progress,
          message,
        });
      },
      log: {
        debug: (message: string, data?: unknown) =>
          eventEmitter.emit("log:debug", { executionId, message, data }),
        info: (message: string, data?: unknown) =>
          eventEmitter.emit("log:info", { executionId, message, data }),
        warn: (message: string, data?: unknown) =>
          eventEmitter.emit("log:warn", { executionId, message, data }),
        error: (message: string, data?: unknown) =>
          eventEmitter.emit("log:error", { executionId, message, data }),
      },
      ...request.context,
    };
  };

  const calculateMetrics = (execution: ExecutionResult): ExecutionMetrics => {
    const executionTimeMs = execution.endTime
      ? execution.endTime.getTime() - execution.startTime.getTime()
      : 0;

    let nodesExecuted = 0;
    let nodesSkipped = 0;
    let nodesFailed = 0;

    for (const nodeState of execution.nodeResults?.values() ?? []) {
      if (nodeState.status === "completed") nodesExecuted++;
      else if (nodeState.status === "failed") nodesFailed++;
      else if (nodeState.status === "cancelled") nodesSkipped++;
    }

    return {
      executionTimeMs,
      nodesExecuted,
      nodesSkipped,
      nodesFailed,
    };
  };

  const createExecutionError = (error: unknown): ExecutionError => {
    if (error instanceof Error) {
      return {
        message: error.message,
        stack: error.stack,
        cause: error,
      };
    }
    return {
      message: String(error),
    };
  };

  const setupErrorHandling = (): void => {
    queue.on("error", (error) => {
      eventEmitter.emit("error", error);
    });
  };

  // Set up error handling
  setupErrorHandling();

  /**
   * Execute a Composite with given inputs
   */
  const execute = async (
    request: ExecutionRequest,
  ): Promise<ExecutionResult> => {
    const executionId = uuidv4();
    const startTime = new Date();

    // Create initial execution result
    const execution: ExecutionResult = {
      executionId,
      compositeId: request.compositeId,
      status: "pending",
      startTime,
      nodeResults: new Map(),
    };

    executions.set(executionId, execution);
    eventEmitter.emit("execution:started", {
      executionId,
      compositeId: request.compositeId,
    });

    try {
      // Load Composite from storage if available
      let composite: CompositeDefinition;
      if (storage) {
        const data = await (
          storage as { load: (id: string) => Promise<unknown> }
        ).load(request.compositeId);
        composite = data as CompositeDefinition;
      } else {
        throw new Error(
          `No storage configured, cannot load Composite ${request.compositeId}`,
        );
      }

      // Create execution context
      const context = createExecutionContext(executionId, composite, request);

      // Update status to running
      execution.status = "running";
      eventEmitter.emit("execution:running", { executionId });

      // Queue the execution
      const result = await queue.add(async () => {
        return compositeRunner.execute(composite, {
          inputs: request.inputs,
          workspaceRoot: context.workspaceRoot,
        });
      });

      // Update execution result
      execution.status = "completed";
      execution.endTime = new Date();
      execution.outputs = result?.outputs;
      // nodeResults are tracked differently
      execution.metrics = calculateMetrics(execution);

      eventEmitter.emit("execution:completed", {
        executionId,
        outputs: result?.outputs || {},
      });
      return execution;
    } catch (error) {
      // Handle execution failure
      execution.status = "failed";
      execution.endTime = new Date();
      execution.error = createExecutionError(error);
      execution.metrics = calculateMetrics(execution);

      eventEmitter.emit("execution:failed", {
        executionId,
        error: execution.error,
      });
      return execution;
    }
  };

  /**
   * Execute a Composite directly (for nested execution)
   */
  const executeComposite = async (
    composite: CompositeDefinition,
    context: NodeExecutionContext,
  ): Promise<ExecutionResult> => {
    const executionId = uuidv4();
    const startTime = new Date();

    const execution: ExecutionResult = {
      executionId,
      compositeId: composite.id,
      status: "running",
      startTime,
      nodeResults: new Map(),
    };

    executions.set(executionId, execution);

    try {
      const result = await compositeRunner.execute(composite, context);

      execution.status = "completed";
      execution.endTime = new Date();
      execution.outputs = result?.outputs;
      // nodeResults are tracked differently
      execution.metrics = calculateMetrics(execution);

      return execution;
    } catch (error) {
      execution.status = "failed";
      execution.endTime = new Date();
      execution.error = createExecutionError(error);
      execution.metrics = calculateMetrics(execution);

      throw error;
    }
  };

  /**
   * Pause a running execution
   */
  const pause = async (executionId: string): Promise<void> => {
    const execution = executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    if (execution.status !== "running") {
      throw new Error(`Cannot pause execution in ${execution.status} state`);
    }

    // Pause the queue
    queue.pause();
    execution.status = "paused";
    executionStore.updateExecutionState(executionId, { status: "paused" });
    eventEmitter.emit("execution:paused", { executionId });
  };

  /**
   * Resume a paused execution
   */
  const resume = async (executionId: string): Promise<void> => {
    const execution = executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    if (execution.status !== "paused") {
      throw new Error(`Cannot resume execution in ${execution.status} state`);
    }

    // Resume the queue
    queue.start();
    execution.status = "running";
    executionStore.updateExecutionState(executionId, { status: "running" });
    eventEmitter.emit("execution:resumed", { executionId });
  };

  /**
   * Cancel a running or paused execution
   */
  const cancel = async (executionId: string): Promise<void> => {
    const execution = executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    if (execution.status === "completed" || execution.status === "failed") {
      throw new Error(`Cannot cancel execution in ${execution.status} state`);
    }

    // Clear the queue
    queue.clear();
    execution.status = "cancelled";
    execution.endTime = new Date();
    executionStore.updateExecutionState(executionId, {
      status: "cancelled",
    });
    eventEmitter.emit("execution:cancelled", { executionId });
  };

  /**
   * Get execution status and results
   */
  const getExecution = async (
    executionId: string,
  ): Promise<ExecutionResult | null> => {
    return executions.get(executionId) ?? null;
  };

  /**
   * List all executions with optional filtering
   */
  const listExecutions = async (filter?: {
    status?: ExecutionStatus;
    compositeId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<ExecutionResult[]> => {
    let executionList = Array.from(executions.values());

    if (filter) {
      if (filter.status) {
        executionList = executionList.filter((e) => e.status === filter.status);
      }
      if (filter.compositeId) {
        executionList = executionList.filter(
          (e) => e.compositeId === filter.compositeId,
        );
      }
      if (filter.startDate) {
        executionList = executionList.filter(
          (e) => e.startTime >= filter.startDate!,
        );
      }
      if (filter.endDate) {
        executionList = executionList.filter(
          (e) => e.startTime <= filter.endDate!,
        );
      }
    }

    return executionList;
  };

  /**
   * Clean up completed executions
   */
  const cleanup = async (before?: Date): Promise<number> => {
    const cutoff = before ?? new Date(Date.now() - 24 * 60 * 60 * 1000); // Default: 24 hours ago
    let cleaned = 0;

    for (const [id, execution] of executions) {
      if (
        (execution.status === "completed" || execution.status === "failed") &&
        execution.endTime &&
        execution.endTime < cutoff
      ) {
        executions.delete(id);
        executionStore.clearExecutionState(id);
        cleaned++;
      }
    }

    return cleaned;
  };

  /**
   * Shutdown the engine
   */
  const shutdown = async (): Promise<void> => {
    await queue.onIdle();
    queue.clear();
    executionStore.shutdown();
    nodeExecutor.destroy();
    eventEmitter.removeAllListeners();
  };

  // Return public API
  return {
    execute,
    executeComposite,
    pause,
    resume,
    cancel,
    getExecution,
    listExecutions,
    cleanup,
    shutdown,
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
