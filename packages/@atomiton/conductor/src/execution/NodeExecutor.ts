import type {
  INode,
  NodeExecutionContext,
  NodeExecutionResult,
} from "@atomiton/nodes";
import { performance } from "perf_hooks";
import { ExecutionStrategies } from "./ExecutionStrategies";
import { MemoryPool } from "./MemoryPool";
import { StrategyAnalyzer } from "./StrategyAnalyzer";
import { StreamProcessor } from "./StreamProcessor";
import { NodeExecutionError } from "./StreamTypes";
import { WorkerPoolManager } from "./WorkerPoolManager";

/**
 * High-performance node executor with worker pool support
 *
 * Optimizations:
 * - Worker thread pool for CPU-intensive operations
 * - Streaming support for large data processing
 * - Memory pooling for reduced allocation overhead
 * - Lazy evaluation for conditional branches
 * - Batching for array operations
 */
export class NodeExecutor {
  private readonly strategyAnalyzer: StrategyAnalyzer;
  private readonly executionStrategies: ExecutionStrategies;
  private readonly workerPool: WorkerPoolManager;
  private readonly memoryPool: MemoryPool;

  constructor(config?: {
    maxWorkers?: number;
    enableStreaming?: boolean;
    enableParallel?: boolean;
    memoryPoolSize?: number;
  }) {
    const {
      maxWorkers = 4,
      enableStreaming = true,
      enableParallel = true,
      memoryPoolSize = 100,
    } = config || {};

    this.workerPool = new WorkerPoolManager(maxWorkers);
    const streamProcessor = new StreamProcessor();
    this.memoryPool = new MemoryPool(memoryPoolSize);

    this.strategyAnalyzer = new StrategyAnalyzer(
      enableStreaming,
      enableParallel,
    );
    this.executionStrategies = new ExecutionStrategies(
      this.workerPool,
      streamProcessor,
      this.memoryPool,
    );
  }

  async executeNode(
    node: INode,
    context: NodeExecutionContext,
    _executionId: string,
  ): Promise<NodeExecutionResult> {
    return node.execute(context);
  }

  async execute(
    node: INode,
    inputs: Record<string, unknown>,
    options?: {
      useWorker?: boolean;
      streaming?: boolean;
      batchSize?: number;
    },
  ): Promise<Record<string, unknown>> {
    const startTime = performance.now();

    try {
      const strategy = this.strategyAnalyzer.determineStrategy(
        node,
        inputs,
        options,
      );

      let result: Record<string, unknown>;

      switch (strategy) {
        case "worker":
          result = await this.executionStrategies.executeInWorker(node, inputs);
          break;

        case "stream":
          result = await this.executionStrategies.executeWithStreaming(
            node,
            inputs,
          );
          break;

        case "batch":
          result = await this.executionStrategies.executeInBatches(
            node,
            inputs,
            options?.batchSize,
          );
          break;

        case "parallel":
          result = await this.executionStrategies.executeInParallel(
            node,
            inputs,
          );
          break;

        default:
          result = await this.executionStrategies.executeDirectly(node, inputs);
      }

      const executionTime = performance.now() - startTime;

      return {
        ...result,
        _metrics: {
          executionTimeMs: executionTime,
          strategy,
        },
      };
    } catch (error) {
      throw new NodeExecutionError(
        `Failed to execute node ${node.id}: ${error instanceof Error ? error.message : String(error)}`,
        node.id,
        error,
      );
    }
  }

  destroy(): void {
    this.workerPool.destroy();
    this.memoryPool.destroy();
  }
}
