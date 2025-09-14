import type {
  INode,
  NodeExecutionContext,
  NodeExecutionResult,
} from "@atomiton/nodes";
import type {
  IRuntime,
  RuntimeLanguage,
  RuntimeCapabilities,
  RuntimeExecutionOptions,
  RuntimeMetrics,
} from "../interfaces/IRuntime";

/**
 * TypeScript runtime implementation
 * Executes TypeScript/JavaScript nodes directly in Node.js environment
 */
export class TypeScriptRuntime implements IRuntime {
  readonly language: RuntimeLanguage = "typescript";

  readonly capabilities: RuntimeCapabilities = {
    supportsStreaming: true,
    supportsParallel: true,
    supportsGPU: false,
    maxMemoryMB: 2048,
    maxExecutionTimeMs: 300000, // 5 minutes
  };

  private ready = false;
  private metrics: RuntimeMetrics = {
    executionsCount: 0,
    totalExecutionTimeMs: 0,
    averageExecutionTimeMs: 0,
    memoryUsageMB: 0,
    errors: 0,
  };

  /**
   * Initialize the TypeScript runtime
   */
  async initialize(): Promise<void> {
    // TypeScript runtime doesn't need special initialization
    // It runs directly in the Node.js process
    this.ready = true;
  }

  /**
   * Check if runtime is ready
   */
  isReady(): boolean {
    return this.ready;
  }

  /**
   * Execute a node in TypeScript runtime
   */
  async execute(
    node: INode,
    context: NodeExecutionContext,
    options?: RuntimeExecutionOptions,
  ): Promise<NodeExecutionResult> {
    if (!this.ready) {
      throw new Error("TypeScript runtime not initialized");
    }

    const startTime = Date.now();
    const startMemory = process.memoryUsage().heapUsed;

    try {
      // Apply execution options
      const executionContext = this.applyOptions(context, options);

      // Execute the node directly
      const result = await this.executeWithTimeout(
        () => node.execute(executionContext),
        options?.timeout ?? context.limits.maxExecutionTimeMs,
      );

      // Update metrics
      const executionTime = Date.now() - startTime;
      const memoryUsed =
        (process.memoryUsage().heapUsed - startMemory) / 1024 / 1024;

      this.updateMetrics(executionTime, memoryUsed, true);

      // Add runtime metadata to result
      return {
        success: result.success,
        outputs: result.outputs,
        error: result.error,
        metadata: {
          ...result.metadata,
          runtime: this.language,
          executionTimeMs: executionTime,
          memoryUsedMB: memoryUsed,
        },
      };
    } catch (error) {
      // Update error metrics
      this.metrics.errors++;

      // Handle execution errors
      const executionTime = Date.now() - startTime;
      this.updateMetrics(executionTime, 0, false);

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        metadata: {
          runtime: this.language,
          executionTimeMs: executionTime,
          errorStack: error instanceof Error ? error.stack : undefined,
        },
      };
    }
  }

  /**
   * Execute with timeout
   */
  private async executeWithTimeout<T>(
    fn: () => Promise<T>,
    timeoutMs: number,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Execution timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      fn()
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  /**
   * Apply runtime options to context
   */
  private applyOptions(
    context: NodeExecutionContext,
    options?: RuntimeExecutionOptions,
  ): NodeExecutionContext {
    if (!options) {
      return context;
    }

    const updatedContext = { ...context };

    if (options.timeout) {
      updatedContext.limits = {
        ...updatedContext.limits,
        maxExecutionTimeMs: options.timeout,
      };
    }

    if (options.memory) {
      updatedContext.limits = {
        ...updatedContext.limits,
        maxMemoryMB: options.memory,
      };
    }

    if (options.workDir) {
      updatedContext.workspaceRoot = options.workDir;
    }

    return updatedContext;
  }

  /**
   * Update runtime metrics
   */
  private updateMetrics(
    executionTimeMs: number,
    memoryUsedMB: number,
    success: boolean,
  ): void {
    this.metrics.executionsCount++;
    this.metrics.totalExecutionTimeMs += executionTimeMs;
    this.metrics.averageExecutionTimeMs =
      this.metrics.totalExecutionTimeMs / this.metrics.executionsCount;

    // Track peak memory usage
    if (memoryUsedMB > this.metrics.memoryUsageMB) {
      this.metrics.memoryUsageMB = memoryUsedMB;
    }

    if (!success) {
      this.metrics.errors++;
    }
  }

  /**
   * Load a native module (not applicable for TypeScript)
   */
  async loadModule(_modulePath: string): Promise<void> {
    // TypeScript modules are loaded via standard import
    // This method is mainly for native runtimes
    throw new Error("TypeScript runtime doesn't support native module loading");
  }

  /**
   * Cleanup runtime resources
   */
  async cleanup(): Promise<void> {
    // Reset metrics
    this.metrics = {
      executionsCount: 0,
      totalExecutionTimeMs: 0,
      averageExecutionTimeMs: 0,
      memoryUsageMB: 0,
      errors: 0,
    };

    // Run garbage collection if available
    if (global.gc) {
      global.gc();
    }

    this.ready = false;
  }

  /**
   * Get runtime metrics
   */
  getMetrics(): RuntimeMetrics {
    return { ...this.metrics };
  }
}
