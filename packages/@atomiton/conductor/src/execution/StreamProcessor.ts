import { pipeline, type Readable, Transform, type Writable } from "stream";
import { promisify } from "util";

const pipelineAsync = promisify(pipeline);

/**
 * Stream processor for large data handling
 */
export class StreamProcessor {
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
          callback(error instanceof Error ? error : new Error(String(error)));
        }
      },
    });
  }
}
