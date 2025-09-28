import { createConductor } from "@atomiton/conductor/desktop";
import type { NodeDefinition } from "@atomiton/nodes/definitions";
import { EventEmitter } from "events";
import type {
  IExecutionService,
  ServiceResult,
  ExecutionResult,
  ProgressEvent,
  ExecutionContext,
} from "#main/services/types";

export type ExecutionService = IExecutionService;

export const createExecutionService = (): ExecutionService => {
  const conductor = createConductor();
  const progressEmitter = new EventEmitter();

  const emitProgress = (
    executionId: string,
    progress: number,
    message: string,
  ): void => {
    progressEmitter.emit("progress", {
      executionId,
      progress,
      message,
    });
  };

  const execute = async (
    executable: NodeDefinition,
    context?: ExecutionContext,
  ): Promise<ServiceResult<ExecutionResult>> => {
    const executionId = `exec-${Date.now()}`;

    try {
      console.log(`Executing ${executable.type} v${executable.version}`);

      emitProgress(executionId, 0, "Starting execution");

      const result = await conductor.execute(executable, context);

      emitProgress(executionId, 100, "Complete");

      return {
        success: true,
        data: {
          id: executionId,
          success: result.success,
          outputs: result.data,
          error: result.error?.message,
          duration: result.duration,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      emitProgress(executionId, -1, errorMessage);

      return {
        success: false,
        error: errorMessage,
        code: "EXECUTION_ERROR",
      };
    }
  };

  const onProgress = (
    callback: (event: ProgressEvent) => void,
  ): (() => void) => {
    progressEmitter.on("progress", callback);

    return () => {
      progressEmitter.removeListener("progress", callback);
    };
  };

  return {
    execute,
    onProgress,
  };
};
