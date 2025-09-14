import type {
  INode,
  NodeExecutionContext,
  NodeExecutionResult,
} from "@atomiton/nodes";

export type NodeExecutorInstance = {
  executeNode: (
    node: INode,
    context: NodeExecutionContext,
    executionId: string,
  ) => Promise<NodeExecutionResult>;
  execute: (
    node: INode,
    inputs: Record<string, unknown>,
    options?: {
      useWorker?: boolean;
      streaming?: boolean;
      batchSize?: number;
    },
  ) => Promise<Record<string, unknown>>;
  destroy: () => void;
};

/**
 * Creates a high-performance node executor
 * Simplified version without complex worker pool and streaming dependencies
 */
export function createNodeExecutor(config?: {
  maxWorkers?: number;
  enableStreaming?: boolean;
  enableParallel?: boolean;
  memoryPoolSize?: number;
}): NodeExecutorInstance {
  // Private state using closures (unused but kept for future expansion)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _config = {
    maxWorkers: config?.maxWorkers ?? 4,
    enableStreaming: config?.enableStreaming ?? false,
    enableParallel: config?.enableParallel ?? false,
    memoryPoolSize: config?.memoryPoolSize ?? 100,
  };

  // Simple direct execution strategy
  const executeDirectly = async (
    node: INode,
    inputs: Record<string, unknown>,
  ): Promise<Record<string, unknown>> => {
    const context: NodeExecutionContext = {
      nodeId: node.id,
      inputs,
      startTime: new Date(),
      limits: {
        maxExecutionTimeMs: 30000,
      },
      reportProgress: () => {},
      log: {
        debug: (msg: string) => console.warn(`[DEBUG][${node.id}]`, msg),
        info: (msg: string) => console.warn(`[INFO][${node.id}]`, msg),
        warn: (msg: string) => console.warn(`[${node.id}]`, msg),
        error: (msg: string) => console.error(`[${node.id}]`, msg),
      },
    };

    const result = await node.execute(context);
    return result || { success: false, error: "No result returned from node" };
  };

  const executeNode = async (
    node: INode,
    context: NodeExecutionContext,
    _executionId: string,
  ): Promise<NodeExecutionResult> => {
    return node.execute(context);
  };

  const execute = async (
    node: INode,
    inputs: Record<string, unknown>,
    _options?: {
      useWorker?: boolean;
      streaming?: boolean;
      batchSize?: number;
    },
  ): Promise<Record<string, unknown>> => {
    const startTime = performance.now();

    try {
      // For now, always use direct execution
      const result = await executeDirectly(node, inputs);
      const executionTime = performance.now() - startTime;

      return {
        ...result,
        _metrics: {
          executionTimeMs: executionTime,
          strategy: "direct",
        },
      };
    } catch (error) {
      throw new Error(
        `Failed to execute node ${node.id}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  const destroy = (): void => {
    // Simple cleanup - no complex resources to destroy
  };

  // Return public API
  return {
    executeNode,
    execute,
    destroy,
  };
}
