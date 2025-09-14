import { createExecutionEngine } from "../engine/executionEngine";
import type {
  ExecutionRequest,
  ExecutionResult,
} from "../interfaces/IExecutionEngine";
import type { IExecutionTransport } from "./types";

/**
 * Local Transport for Direct Execution
 * Used in Electron Main Process and Node.js environments
 */
export function createLocalTransport(config?: {
  concurrency?: number;
  storage?: unknown;
  timeout?: number;
}): IExecutionTransport {
  const engine = createExecutionEngine(config);

  const execute = async (
    request: ExecutionRequest,
  ): Promise<ExecutionResult> => {
    return engine.execute(request);
  };

  const shutdown = async (): Promise<void> => {
    await engine.shutdown();
  };

  return {
    type: "local",
    execute,
    shutdown,
  };
}
