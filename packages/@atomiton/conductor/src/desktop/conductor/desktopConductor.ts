import type {
  ExecutionProgress,
  ExecutionRequest,
  ExecutionResult,
} from "#core/types";
import { createEventBus } from "@atomiton/events/desktop";
import {
  getNodeExecutable,
  type NodeExecutable,
  type NodeExecutionContext,
} from "@atomiton/nodes/executables";

// Inline minimal executor (previously createNodeExecutor)
function createNodeExecutor() {
  return {
    async executeNode(
      executable: NodeExecutable,
      context: NodeExecutionContext,
      _executionId: string,
    ) {
      try {
        const result = await executable.execute(context, {});
        return {
          success: true,
          outputs: result,
          error: undefined,
        };
      } catch (error) {
        return {
          success: false,
          outputs: {},
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
    destroy() {
      // Cleanup if needed
    },
  };
}

// Inline minimal store (previously createExecutionStore)
function createExecutionStore() {
  const records = new Map<string, {
    id: string;
    request: ExecutionRequest;
    status: string;
    startTime: number;
    result?: ExecutionResult;
    error?: string;
    endTime?: number;
  }>();

  return {
    recordStart(id: string, request: ExecutionRequest) {
      records.set(id, {
        id,
        request,
        status: "running",
        startTime: Date.now(),
      });
    },
    recordComplete(id: string, result: ExecutionResult) {
      const record = records.get(id);
      if (record) {
        record.status = "completed";
        record.result = result;
        record.endTime = Date.now();
      }
    },
    recordError(id: string, error: string) {
      const record = records.get(id);
      if (record) {
        record.status = "error";
        record.error = error;
        record.endTime = Date.now();
      }
    },
    clear() {
      records.clear();
    },
  };
}

// Event map for conductor events (must match browser)
type ConductorEvents = {
  "conductor:execute": ExecutionRequest;
  "conductor:result": ExecutionResult;
  "conductor:progress": ExecutionProgress;
  "conductor:error": { id: string; error: string };
};

export type DesktopConductorOptions = {
  domain?: string;
  concurrency?: number;
  enableQueue?: boolean;
  storage?: unknown; // IStorageEngine from @atomiton/storage
  timeout?: number;
};

export function createDesktopConductor(options?: DesktopConductorOptions) {
  const { domain = "conductor" } = options ?? {};

  // Use events package for all communication
  const events = createEventBus<ConductorEvents>({
    domain,
    useIPC: true,
    autoForward: {
      toBrowser: ["conductor:result", "conductor:progress", "conductor:error"],
    },
  });

  // Create executor and store
  const executor = createNodeExecutor();
  const store = createExecutionStore();

  // Listen for execution requests
  events.on("conductor:execute", async (request) => {
    try {
      // Record execution start
      store.recordStart(request.id, request);

      // Get the executable from registry
      const executable = getNodeExecutable(request.nodeId);
      if (!executable) {
        throw new Error(`Node executable not found: ${request.nodeId}`);
      }

      // Report progress
      events.emit("conductor:progress", {
        id: request.id,
        nodeId: request.nodeId,
        progress: 0,
        message: "Starting execution",
      });

      // Create execution context using the proper type
      const context: NodeExecutionContext = {
        nodeId: request.nodeId,
        inputs: request.inputs,
        startTime: new Date(),
        reportProgress: (progress: number, message?: string) => {
          events.emit("conductor:progress", {
            id: request.id,
            nodeId: request.nodeId,
            progress,
            message,
          });
        },
        log: {
          info: (msg: string) => console.log(`[${request.nodeId}] ${msg}`),
          error: (msg: string) => console.error(`[${request.nodeId}] ${msg}`),
        },
        limits: {
          maxExecutionTimeMs: request.options?.timeout || 30000,
        },
      };

      // Execute the node
      const nodeResult = await executor.executeNode(
        executable,
        context,
        request.id,
      );

      // Create result
      const result: ExecutionResult = {
        id: request.id,
        nodeId: request.nodeId,
        success: nodeResult.success,
        outputs: nodeResult.outputs,
        error: nodeResult.error,
        metrics: {
          startTime: context.startTime?.getTime() || Date.now(),
          endTime: Date.now(),
          duration: Date.now() - (context.startTime?.getTime() || Date.now()),
        },
      };

      // Record completion
      store.recordComplete(request.id, result);

      // Emit result (will be forwarded to browser)
      events.emit("conductor:result", result);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // Record error
      store.recordError(request.id, errorMessage);

      // Emit error (will be forwarded to browser)
      events.emit("conductor:error", {
        id: request.id,
        error: errorMessage,
      });
    }
  });

  // Cleanup
  function shutdown() {
    executor.destroy();
    store.clear();
  }

  return {
    events,
    executor,
    store,
    shutdown,
    cleanup: shutdown, // Alias for Electron compatibility
  };
}
