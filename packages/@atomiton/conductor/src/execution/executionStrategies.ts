import type { INode, NodeExecutionContext } from "@atomiton/nodes/executables";
import { pipeline, Readable, Writable } from "stream";
import { promisify } from "util";
import type { MemoryPool } from "./memoryPool";
import type { StreamProcessor } from "./streamProcessor";
import { NodeTransformStream, type OutputCollector } from "./streamTypes";
import type { WorkerPoolManager } from "./workerPoolManager";

const pipelineAsync = promisify(pipeline);

export class ExecutionStrategies {
  constructor(
    private workerPool: WorkerPoolManager,
    private streamProcessor: StreamProcessor,
    private memoryPool: MemoryPool,
  ) {}

  async executeDirectly(
    node: INode,
    inputs: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const buffer = this.memoryPool.acquire();

    try {
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

      return (
        result || { success: false, error: "No result returned from node" }
      );
    } finally {
      this.memoryPool.release(buffer);
    }
  }

  async executeInWorker(
    node: INode,
    inputs: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const worker = await this.workerPool.getWorker();

    try {
      return await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Worker execution timeout"));
        }, 30000);

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

  async executeWithStreaming(
    node: INode,
    inputs: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const inputStream = this.createInputStream(inputs);
    const outputStream = this.createOutputStream();
    const transformStream = this.createTransformStream(node);

    await pipelineAsync(inputStream, transformStream, outputStream);

    return outputStream.getResults();
  }

  async executeInBatches(
    node: INode,
    inputs: Record<string, unknown>,
    batchSize: number = 1000,
  ): Promise<Record<string, unknown>> {
    const results: Record<string, unknown> = {};

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

        results[key] = this.mergeBatchResults(batchResults);
      } else {
        results[key] = value;
      }
    }

    return results;
  }

  async executeInParallel(
    node: INode,
    inputs: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const parallelTasks: Promise<unknown>[] = [];

    for (const [key, value] of Object.entries(inputs)) {
      if (Array.isArray(value)) {
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

    const results = await Promise.all(parallelTasks);

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
    const combined: Record<string, unknown> = {};

    for (const result of results) {
      if (typeof result === "object" && result !== null) {
        Object.assign(combined, result);
      }
    }

    return combined;
  }

  private serializeNode(node: INode): Record<string, unknown> {
    return {
      id: node.id,
      type: node.type,
      parameters: node.parameters,
    };
  }
}
