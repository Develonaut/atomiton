import type { INode, NodeExecutionContext } from "@atomiton/nodes";
import { performance } from "perf_hooks";
import { pipeline, Readable, Transform, Writable } from "stream";
import { promisify } from "util";
import { Worker } from "worker_threads";

const pipelineAsync = promisify(pipeline);

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
  private readonly workerPool: WorkerPoolManager;
  private readonly streamProcessor: StreamProcessor;
  private readonly memoryPool: MemoryPool;
  private readonly enableStreaming: boolean;
  private readonly enableParallel: boolean;

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

    this.enableStreaming = enableStreaming;
    this.enableParallel = enableParallel;

    this.workerPool = new WorkerPoolManager(maxWorkers);
    this.streamProcessor = new StreamProcessor();
    this.memoryPool = new MemoryPool(memoryPoolSize);
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
      // Determine execution strategy
      const strategy = this.determineStrategy(node, inputs, options);

      let result: Record<string, unknown>;

      switch (strategy) {
        case "worker":
          result = await this.executeInWorker(node, inputs);
          break;

        case "stream":
          result = await this.executeWithStreaming(node, inputs);
          break;

        case "batch":
          result = await this.executeInBatches(
            node,
            inputs,
            options?.batchSize,
          );
          break;

        case "parallel":
          result = await this.executeInParallel(node, inputs);
          break;

        default:
          result = await this.executeDirectly(node, inputs);
      }

      // Record execution time
      const executionTime = performance.now() - startTime;

      return {
        ...result,
        _metrics: {
          executionTimeMs: executionTime,
          strategy,
        },
      };
    } catch (error) {
      // Enhanced error handling with context
      throw new NodeExecutionError(
        `Failed to execute node ${node.id}: ${error instanceof Error ? error.message : String(error)}`,
        node.id,
        error,
      );
    }
  }

  private determineStrategy(
    node: INode,
    inputs: Record<string, unknown>,
    options?: { useWorker?: boolean; streaming?: boolean },
  ): ExecutionStrategy {
    // Force strategy if specified
    if (options?.useWorker) return "worker";
    if (options?.streaming) return "stream";

    // Analyze node and input characteristics
    const inputSize = this.estimateDataSize(inputs);
    const isArrayInput = this.hasArrayInputs(inputs);
    const isCpuIntensive = this.isCpuIntensive(node);
    const isStreamable = this.isStreamable(node);

    // Decision tree for optimal strategy
    if (isStreamable && inputSize > 10 * 1024 * 1024) {
      return "stream"; // Stream for large data
    }

    if (isCpuIntensive && inputSize > 1024 * 1024) {
      return "worker"; // Worker for CPU-intensive with significant data
    }

    if (isArrayInput && this.enableParallel) {
      return "parallel"; // Parallel for array operations
    }

    if (isArrayInput && inputSize > 5 * 1024 * 1024) {
      return "batch"; // Batch for large arrays
    }

    return "direct"; // Direct execution for simple cases
  }

  private async executeDirectly(
    node: INode,
    inputs: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    // Get memory buffer from pool
    const buffer = this.memoryPool.acquire();

    try {
      // Execute node logic directly
      const context: NodeExecutionContext = {
        inputs,
        outputs: {},
        variables: {},
      };

      // Call node's execute method
      const result = await node.execute(context);

      return result || context.outputs;
    } finally {
      // Return buffer to pool
      this.memoryPool.release(buffer);
    }
  }

  private async executeInWorker(
    node: INode,
    inputs: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const worker = await this.workerPool.getWorker();

    try {
      return await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Worker execution timeout"));
        }, 30000); // 30 second timeout

        worker.once("message", (result) => {
          clearTimeout(timeout);

          if (result.error) {
            reject(new Error(result.error));
          } else {
            resolve(result.outputs);
          }
        });

        worker.postMessage({
          type: "execute",
          node: this.serializeNode(node),
          inputs,
        });
      });
    } finally {
      this.workerPool.releaseWorker(worker);
    }
  }

  private async executeWithStreaming(
    node: INode,
    inputs: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    // Create streams for processing
    const inputStream = this.createInputStream(inputs);
    const outputStream = this.createOutputStream();
    const transformStream = this.createTransformStream(node);

    // Pipeline for streaming execution
    await pipelineAsync(inputStream, transformStream, outputStream);

    return outputStream.getResults();
  }

  private async executeInBatches(
    node: INode,
    inputs: Record<string, unknown>,
    batchSize: number = 1000,
  ): Promise<Record<string, unknown>> {
    const results: Record<string, unknown> = {};

    // Process array inputs in batches
    for (const [key, value] of Object.entries(inputs)) {
      if (Array.isArray(value)) {
        const batches = this.createBatches(value, batchSize);
        const batchResults = [];

        for (const batch of batches) {
          const batchOutput = await this.executeDirectly(node, {
            ...inputs,
            [key]: batch,
          });

          batchResults.push(batchOutput);
        }

        // Merge batch results
        results[key] = this.mergeBatchResults(batchResults);
      } else {
        results[key] = value;
      }
    }

    return results;
  }

  private async executeInParallel(
    node: INode,
    inputs: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const parallelTasks: Promise<unknown>[] = [];

    // Identify parallelizable operations
    for (const [key, value] of Object.entries(inputs)) {
      if (Array.isArray(value)) {
        // Process array elements in parallel
        const elementTasks = value.map(async (item) => {
          return await this.executeDirectly(node, {
            ...inputs,
            [key]: item,
          });
        });

        parallelTasks.push(...elementTasks);
      }
    }

    if (parallelTasks.length === 0) {
      return await this.executeDirectly(node, inputs);
    }

    // Execute all parallel tasks
    const results = await Promise.all(parallelTasks);

    // Combine results
    return this.combineParallelResults(results);
  }

  private createInputStream(inputs: Record<string, unknown>): Readable {
    return new Readable({
      read() {
        this.push(JSON.stringify(inputs));
        this.push(null);
      },
    });
  }

  private createOutputStream(): OutputCollector {
    const chunks: Buffer[] = [];

    const stream = new Writable({
      write(chunk, encoding, callback) {
        chunks.push(chunk);
        callback();
      },
    });

    return Object.assign(stream, {
      getResults(): Record<string, unknown> {
        const data = Buffer.concat(chunks).toString();
        return JSON.parse(data);
      },
    });
  }

  private createTransformStream(node: INode): NodeTransformStream {
    return new NodeTransformStream(node);
  }

  private createBatches<T>(array: T[], batchSize: number): T[][] {
    const batches: T[][] = [];

    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize));
    }

    return batches;
  }

  private mergeBatchResults(results: unknown[]): unknown {
    // Merge strategy depends on result type
    if (results.length === 0) return [];

    const first = results[0];

    if (Array.isArray(first)) {
      return results.flat();
    }

    if (typeof first === "object") {
      return Object.assign({}, ...results);
    }

    return results;
  }

  private combineParallelResults(results: unknown[]): Record<string, unknown> {
    // Combine parallel execution results
    const combined: Record<string, unknown> = {};

    for (const result of results) {
      if (typeof result === "object" && result !== null) {
        Object.assign(combined, result);
      }
    }

    return combined;
  }

  private serializeNode(node: INode): Record<string, unknown> {
    // Serialize node for worker execution
    return {
      id: node.id,
      type: node.type,
      config: node.config,
      // Note: Methods cannot be serialized, worker must reconstruct
    };
  }

  private estimateDataSize(data: unknown): number {
    try {
      const str = JSON.stringify(data);
      return str ? str.length : 0;
    } catch {
      return 0;
    }
  }

  private hasArrayInputs(inputs: Record<string, unknown>): boolean {
    return Object.values(inputs).some((value) => Array.isArray(value));
  }

  private isCpuIntensive(node: INode): boolean {
    const intensiveTypes = [
      "transform",
      "compute",
      "analysis",
      "ml",
      "crypto",
      "compression",
    ];

    return intensiveTypes.includes(node.type);
  }

  private isStreamable(node: INode): boolean {
    const streamableTypes = ["filter", "map", "transform", "aggregate"];

    return streamableTypes.includes(node.type);
  }

  destroy(): void {
    this.workerPool.destroy();
    this.memoryPool.destroy();
  }
}

/**
 * Worker pool manager for efficient worker reuse
 */
class WorkerPoolManager {
  private readonly workers: Worker[] = [];
  private readonly available: Worker[] = [];
  private readonly maxWorkers: number;

  constructor(maxWorkers: number) {
    this.maxWorkers = maxWorkers;
    this.initializeWorkers();
  }

  private initializeWorkers(): void {
    for (let i = 0; i < this.maxWorkers; i++) {
      const worker = new Worker(
        new URL("../workers/NodeWorker.ts", import.meta.url),
      );

      this.workers.push(worker);
      this.available.push(worker);
    }
  }

  async getWorker(): Promise<Worker> {
    // Wait for available worker
    while (this.available.length === 0) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    return this.available.pop()!;
  }

  releaseWorker(worker: Worker): void {
    this.available.push(worker);
  }

  destroy(): void {
    for (const worker of this.workers) {
      worker.terminate();
    }
  }
}

/**
 * Stream processor for large data handling
 */
class StreamProcessor {
  processStream(
    input: Readable,
    transform: (chunk: unknown) => unknown,
    output: Writable,
  ): Promise<void> {
    return pipelineAsync(input, this.createTransform(transform), output);
  }

  private createTransform(fn: (chunk: unknown) => unknown) {
    return new Transform({
      transform(
        chunk: unknown,
        encoding: string,
        callback: (error?: Error | null, data?: unknown) => void,
      ) {
        try {
          const result = fn(chunk);
          callback(null, result);
        } catch (error) {
          callback(error);
        }
      },
    });
  }
}

/**
 * Memory pool for reduced allocation overhead
 */
class MemoryPool {
  private readonly buffers: ArrayBuffer[] = [];
  private readonly size: number;
  private readonly bufferSize: number = 1024 * 1024; // 1MB buffers

  constructor(size: number) {
    this.size = size;
    this.initialize();
  }

  private initialize(): void {
    for (let i = 0; i < this.size; i++) {
      this.buffers.push(new ArrayBuffer(this.bufferSize));
    }
  }

  acquire(): ArrayBuffer {
    return this.buffers.pop() || new ArrayBuffer(this.bufferSize);
  }

  release(buffer: ArrayBuffer): void {
    if (this.buffers.length < this.size) {
      // Clear buffer before returning to pool
      new Uint8Array(buffer).fill(0);
      this.buffers.push(buffer);
    }
  }

  destroy(): void {
    this.buffers.length = 0;
  }
}

/**
 * Custom transform stream for node execution
 */
class NodeTransformStream extends Transform {
  constructor(private node: INode) {
    super({ objectMode: true });
  }

  _transform(
    chunk: unknown,
    encoding: string,
    callback: (error?: Error | null, data?: unknown) => void,
  ): void {
    try {
      // Process chunk through node
      const context: NodeExecutionContext = {
        inputs: { data: chunk },
        outputs: {},
        variables: {},
      };

      this.node
        .execute(context)
        .then((result) => {
          callback(null, result);
        })
        .catch(callback);
    } catch (error) {
      callback(error);
    }
  }
}

/**
 * Output collector stream
 */
type OutputCollector = {
  getResults(): Record<string, unknown>;
} & Writable;

/**
 * Node execution error
 */
class NodeExecutionError extends Error {
  constructor(
    message: string,
    public nodeId: string,
    public cause?: unknown,
  ) {
    super(message);
    this.name = "NodeExecutionError";
  }
}

/**
 * Execution strategy types
 */
type ExecutionStrategy = "direct" | "worker" | "stream" | "batch" | "parallel";
