import { EventEmitter } from "events";
import PQueue from "p-queue";
import { v4 as uuidv4 } from "uuid";
import type { BlueprintDefinition, IStorageEngine } from "@atomiton/storage";
import type { NodeExecutionContext } from "@atomiton/nodes";
import type {
  IExecutionEngine,
  ExecutionRequest,
  ExecutionResult,
  ExecutionStatus,
  ExecutionError,
  ExecutionMetrics,
} from "../interfaces/IExecutionEngine.js";
import { BlueprintRunner } from "../execution/BlueprintRunner.js";
import { StateManager } from "../state/StateManager.js";
import { RuntimeRouter } from "../runtime/RuntimeRouter.js";

/**
 * Main execution engine implementation
 * Orchestrates Blueprint and node execution with proper state management
 */
export class ExecutionEngine extends EventEmitter implements IExecutionEngine {
  private readonly queue: PQueue;
  private readonly stateManager: StateManager;
  private readonly runtimeRouter: RuntimeRouter;
  private readonly blueprintRunner: BlueprintRunner;
  private readonly storage?: IStorageEngine;
  private readonly executions: Map<string, ExecutionResult>;

  constructor(config?: {
    concurrency?: number;
    storage?: IStorageEngine;
    timeout?: number;
  }) {
    super();

    // Initialize execution queue
    this.queue = new PQueue({
      concurrency: config?.concurrency ?? 4,
      interval: 100,
      intervalCap: 10,
    });

    // Initialize components
    this.stateManager = new StateManager();
    this.runtimeRouter = new RuntimeRouter();
    this.blueprintRunner = new BlueprintRunner(
      this.runtimeRouter,
      this.stateManager,
    );

    this.storage = config?.storage;
    this.executions = new Map();

    // Set up error handling
    this.setupErrorHandling();
  }

  /**
   * Execute a Blueprint with given inputs
   */
  async execute(request: ExecutionRequest): Promise<ExecutionResult> {
    const executionId = uuidv4();
    const startTime = new Date();

    // Create initial execution result
    const execution: ExecutionResult = {
      executionId,
      blueprintId: request.blueprintId,
      status: "pending",
      startTime,
      nodeResults: new Map(),
    };

    this.executions.set(executionId, execution);
    this.emit("execution:started", {
      executionId,
      blueprintId: request.blueprintId,
    });

    try {
      // Load Blueprint from storage if available
      let blueprint: BlueprintDefinition;
      if (this.storage) {
        const data = await this.storage.load(request.blueprintId);
        blueprint = data as BlueprintDefinition;
      } else {
        throw new Error(
          `No storage configured, cannot load Blueprint ${request.blueprintId}`,
        );
      }

      // Create execution context
      const context = this.createExecutionContext(
        executionId,
        blueprint,
        request,
      );

      // Update status to running
      execution.status = "running";
      this.emit("execution:running", { executionId });

      // Queue the execution
      const result = await this.queue.add(async () => {
        return this.blueprintRunner.execute(blueprint, context, request.config);
      });

      // Update execution result
      execution.status = "completed";
      execution.endTime = new Date();
      execution.outputs = result.outputs;
      execution.nodeResults = result.nodeStates;
      execution.metrics = this.calculateMetrics(execution);

      this.emit("execution:completed", {
        executionId,
        outputs: result.outputs,
      });
      return execution;
    } catch (error) {
      // Handle execution failure
      execution.status = "failed";
      execution.endTime = new Date();
      execution.error = this.createExecutionError(error);
      execution.metrics = this.calculateMetrics(execution);

      this.emit("execution:failed", { executionId, error: execution.error });
      return execution;
    }
  }

  /**
   * Execute a Blueprint directly (for nested execution)
   */
  async executeBlueprint(
    blueprint: BlueprintDefinition,
    context: NodeExecutionContext,
  ): Promise<ExecutionResult> {
    const executionId = uuidv4();
    const startTime = new Date();

    const execution: ExecutionResult = {
      executionId,
      blueprintId: blueprint.id,
      status: "running",
      startTime,
      nodeResults: new Map(),
    };

    this.executions.set(executionId, execution);

    try {
      const result = await this.blueprintRunner.execute(blueprint, context);

      execution.status = "completed";
      execution.endTime = new Date();
      execution.outputs = result.outputs;
      execution.nodeResults = result.nodeStates;
      execution.metrics = this.calculateMetrics(execution);

      return execution;
    } catch (error) {
      execution.status = "failed";
      execution.endTime = new Date();
      execution.error = this.createExecutionError(error);
      execution.metrics = this.calculateMetrics(execution);

      throw error;
    }
  }

  /**
   * Pause a running execution
   */
  async pause(executionId: string): Promise<void> {
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    if (execution.status !== "running") {
      throw new Error(`Cannot pause execution in ${execution.status} state`);
    }

    // Pause the queue
    this.queue.pause();
    execution.status = "paused";
    this.stateManager.updateExecutionState(executionId, { status: "paused" });
    this.emit("execution:paused", { executionId });
  }

  /**
   * Resume a paused execution
   */
  async resume(executionId: string): Promise<void> {
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    if (execution.status !== "paused") {
      throw new Error(`Cannot resume execution in ${execution.status} state`);
    }

    // Resume the queue
    this.queue.start();
    execution.status = "running";
    this.stateManager.updateExecutionState(executionId, { status: "running" });
    this.emit("execution:resumed", { executionId });
  }

  /**
   * Cancel a running or paused execution
   */
  async cancel(executionId: string): Promise<void> {
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    if (execution.status === "completed" || execution.status === "failed") {
      throw new Error(`Cannot cancel execution in ${execution.status} state`);
    }

    // Clear the queue
    this.queue.clear();
    execution.status = "cancelled";
    execution.endTime = new Date();
    this.stateManager.updateExecutionState(executionId, {
      status: "cancelled",
    });
    this.emit("execution:cancelled", { executionId });
  }

  /**
   * Get execution status and results
   */
  async getExecution(executionId: string): Promise<ExecutionResult | null> {
    return this.executions.get(executionId) ?? null;
  }

  /**
   * List all executions with optional filtering
   */
  async listExecutions(filter?: {
    status?: ExecutionStatus;
    blueprintId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<ExecutionResult[]> {
    let executions = Array.from(this.executions.values());

    if (filter) {
      if (filter.status) {
        executions = executions.filter((e) => e.status === filter.status);
      }
      if (filter.blueprintId) {
        executions = executions.filter(
          (e) => e.blueprintId === filter.blueprintId,
        );
      }
      if (filter.startDate) {
        executions = executions.filter((e) => e.startTime >= filter.startDate);
      }
      if (filter.endDate) {
        executions = executions.filter((e) => e.startTime <= filter.endDate);
      }
    }

    return executions;
  }

  /**
   * Clean up completed executions
   */
  async cleanup(before?: Date): Promise<number> {
    const cutoff = before ?? new Date(Date.now() - 24 * 60 * 60 * 1000); // Default: 24 hours ago
    let cleaned = 0;

    for (const [id, execution] of this.executions) {
      if (
        (execution.status === "completed" || execution.status === "failed") &&
        execution.endTime &&
        execution.endTime < cutoff
      ) {
        this.executions.delete(id);
        this.stateManager.clearExecutionState(id);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Create execution context from request
   */
  private createExecutionContext(
    executionId: string,
    blueprint: BlueprintDefinition,
    request: ExecutionRequest,
  ): NodeExecutionContext {
    return {
      nodeId: executionId,
      blueprintId: blueprint.id,
      inputs: request.inputs ?? {},
      config: request.config,
      startTime: new Date(),
      limits: {
        maxExecutionTimeMs: request.config?.timeout ?? 60000,
        maxMemoryMB: request.config?.maxMemory ?? 512,
      },
      reportProgress: (progress, message) => {
        this.emit("execution:progress", { executionId, progress, message });
      },
      log: {
        debug: (message, data) =>
          this.emit("log:debug", { executionId, message, data }),
        info: (message, data) =>
          this.emit("log:info", { executionId, message, data }),
        warn: (message, data) =>
          this.emit("log:warn", { executionId, message, data }),
        error: (message, data) =>
          this.emit("log:error", { executionId, message, data }),
      },
      ...request.context,
    };
  }

  /**
   * Calculate execution metrics
   */
  private calculateMetrics(execution: ExecutionResult): ExecutionMetrics {
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
  }

  /**
   * Create execution error from unknown error
   */
  private createExecutionError(error: unknown): ExecutionError {
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
  }

  /**
   * Set up error handling
   */
  private setupErrorHandling(): void {
    this.queue.on("error", (error) => {
      this.emit("error", error);
    });

    this.blueprintRunner.on("error", (error) => {
      this.emit("error", error);
    });
  }

  /**
   * Shutdown the engine
   */
  async shutdown(): Promise<void> {
    await this.queue.onIdle();
    this.queue.clear();
    await this.runtimeRouter.cleanup();
    this.removeAllListeners();
  }
}
