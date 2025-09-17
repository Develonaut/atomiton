import type {
  INode,
  NodeExecutionContext,
  NodeExecutionResult,
} from "@atomiton/nodes/executable";
import type {
  IRuntime,
  RuntimeLanguage,
  RuntimeCapabilities,
  RuntimeExecutionOptions,
  RuntimeMetrics,
} from "../interfaces/IRuntime";

export type TypeScriptRuntimeInstance = IRuntime;

/**
 * Creates a TypeScript runtime implementation
 * Executes TypeScript/JavaScript nodes directly in Node.js environment
 */
export function createTypeScriptRuntime(): TypeScriptRuntimeInstance {
  // Private state using closures
  let ready = false;
  let metrics: RuntimeMetrics = {
    executionsCount: 0,
    totalExecutionTimeMs: 0,
    averageExecutionTimeMs: 0,
    memoryUsageMB: 0,
    errors: 0,
  };

  const language: RuntimeLanguage = "typescript";

  const capabilities: RuntimeCapabilities = {
    supportsStreaming: true,
    supportsParallel: true,
    supportsGPU: false,
    maxMemoryMB: 2048,
    maxExecutionTimeMs: 300000, // 5 minutes
  };

  // Private helper functions
  const executeWithTimeout = async <T>(
    fn: () => Promise<T>,
    timeoutMs: number,
  ): Promise<T> => {
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
  };

  const applyOptions = (
    context: NodeExecutionContext,
    options?: RuntimeExecutionOptions,
  ): NodeExecutionContext => {
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
  };

  const updateMetrics = (
    executionTimeMs: number,
    memoryUsedMB: number,
    success: boolean,
  ): void => {
    metrics.executionsCount++;
    metrics.totalExecutionTimeMs += executionTimeMs;
    metrics.averageExecutionTimeMs =
      metrics.totalExecutionTimeMs / metrics.executionsCount;

    // Track peak memory usage
    if (memoryUsedMB > metrics.memoryUsageMB) {
      metrics.memoryUsageMB = memoryUsedMB;
    }

    if (!success) {
      metrics.errors++;
    }
  };

  /**
   * Initialize the TypeScript runtime
   */
  const initialize = async (): Promise<void> => {
    // TypeScript runtime doesn't need special initialization
    // It runs directly in the Node.js process
    ready = true;
  };

  /**
   * Check if runtime is ready
   */
  const isReady = (): boolean => {
    return ready;
  };

  /**
   * Execute a node in TypeScript runtime
   */
  const execute = async (
    node: INode,
    context: NodeExecutionContext,
    options?: RuntimeExecutionOptions,
  ): Promise<NodeExecutionResult> => {
    if (!ready) {
      throw new Error("TypeScript runtime not initialized");
    }

    const startTime = Date.now();
    const startMemory = process.memoryUsage().heapUsed;

    try {
      // Apply execution options
      const executionContext = applyOptions(context, options);

      // Execute the node directly
      const result = await executeWithTimeout(
        () => node.execute(executionContext),
        options?.timeout ?? context.limits.maxExecutionTimeMs,
      );

      // Update metrics
      const executionTime = Date.now() - startTime;
      const memoryUsed =
        (process.memoryUsage().heapUsed - startMemory) / 1024 / 1024;

      updateMetrics(executionTime, memoryUsed, true);

      // Add runtime metadata to result
      return {
        success: result.success,
        outputs: result.outputs,
        error: result.error,
        metadata: {
          ...result.metadata,
          runtime: language,
          executionTimeMs: executionTime,
          memoryUsedMB: memoryUsed,
        },
      };
    } catch (error) {
      // Update error metrics
      metrics.errors++;

      // Handle execution errors
      const executionTime = Date.now() - startTime;
      updateMetrics(executionTime, 0, false);

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        metadata: {
          runtime: language,
          executionTimeMs: executionTime,
          errorStack: error instanceof Error ? error.stack : undefined,
        },
      };
    }
  };

  /**
   * Load a native module (not applicable for TypeScript)
   */
  const loadModule = async (_modulePath: string): Promise<void> => {
    // TypeScript modules are loaded via standard import
    // This method is mainly for native runtimes
    throw new Error("TypeScript runtime doesn't support native module loading");
  };

  /**
   * Cleanup runtime resources
   */
  const cleanup = async (): Promise<void> => {
    // Reset metrics
    metrics = {
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

    ready = false;
  };

  /**
   * Get runtime metrics
   */
  const getMetrics = (): RuntimeMetrics => {
    return { ...metrics };
  };

  // Return public API implementing IRuntime
  return {
    language,
    capabilities,
    initialize,
    isReady,
    execute,
    loadModule,
    cleanup,
    getMetrics,
  };
}
