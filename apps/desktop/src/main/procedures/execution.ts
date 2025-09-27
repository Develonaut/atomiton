import { createConductor } from "@atomiton/conductor";
import { EventEmitter } from "events";

const conductor = createConductor();
const progressEmitter = new EventEmitter();

export const executionProcedures = {
  execute: async ({
    input,
  }: {
    input: {
      executable: any;
      context?: Record<string, unknown>;
    };
  }) => {
    const { executable, context } = input;

    console.log(`Executing ${executable.type} v${executable.version}`);

    const executionId = `exec-${Date.now()}`;
    progressEmitter.emit("progress", {
      executionId,
      progress: 0,
      message: "Starting execution",
    });

    try {
      const result = await conductor.execute(executable, context);

      progressEmitter.emit("progress", {
        executionId,
        progress: 100,
        message: "Complete",
      });

      return {
        id: executionId,
        success: result.success,
        outputs: result.data,
        error: result.error,
        duration: result.duration,
      };
    } catch (error) {
      progressEmitter.emit("progress", {
        executionId,
        progress: -1,
        message: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  },

  onProgress: ({ input }: { input: string }) => {
    // TODO: Implement progress subscription when observable is available
    return null;
  },
};