import type {
  INode,
  NodeExecutionContext,
  NodeExecutionResult,
} from "@atomiton/nodes/executable";
import { Transform, type Writable } from "stream";

/**
 * Custom transform stream for node execution
 */
export class NodeTransformStream extends Transform {
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
        nodeId: this.node.id,
        inputs: { data: chunk },
        startTime: new Date(),
        limits: {
          maxExecutionTimeMs: 30000,
        },
        reportProgress: () => {},
        log: {
          debug: (msg: string) => console.warn(`[DEBUG][${this.node.id}]`, msg),
          info: (msg: string) => console.warn(`[INFO][${this.node.id}]`, msg),
          warn: (msg: string) => console.warn(`[${this.node.id}]`, msg),
          error: (msg: string) => console.error(`[${this.node.id}]`, msg),
        },
      };

      this.node
        .execute(context)
        .then((result: NodeExecutionResult) => {
          callback(null, result);
        })
        .catch((error: unknown) =>
          callback(error instanceof Error ? error : new Error(String(error))),
        );
    } catch (error) {
      callback(error instanceof Error ? error : new Error(String(error)));
    }
  }
}

/**
 * Output collector stream
 */
export type OutputCollector = {
  getResults(): Record<string, unknown>;
} & Writable;

/**
 * Node execution error
 */
export class NodeExecutionError extends Error {
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
export type ExecutionStrategy =
  | "direct"
  | "worker"
  | "stream"
  | "batch"
  | "parallel";
