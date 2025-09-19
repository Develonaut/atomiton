import { events } from "@atomiton/events/desktop";
import { generateId } from "@atomiton/utils";
import type {
  ExecutionRequest,
  ExecutionResult,
} from "../interfaces/IExecutionEngine";
import type { IExecutionTransport, IPCMessage, IPCResponse } from "./types";

/**
 * IPC Transport for Electron Renderer Process
 * Sends execution requests to the main process via IPC using @atomiton/events
 */
export function createIPCTransport(): IExecutionTransport {
  const pendingRequests = new Map<
    string,
    {
      resolve: (result: ExecutionResult) => void;
      reject: (error: Error) => void;
    }
  >();

  const initialize = async (): Promise<void> => {
    if (
      !events.ipc.isAvailable() ||
      events.ipc.getEnvironment() !== "renderer"
    ) {
      throw new Error("IPC transport requires Electron renderer context");
    }

    // Listen for responses from main process via global event bus
    const resultHandler = (response: unknown) => {
      const res = response as IPCResponse;
      const pending = pendingRequests.get(res.id);
      if (pending) {
        pending.resolve(res.payload);
        pendingRequests.delete(res.id);
      }
    };

    const errorHandler = (data: unknown) => {
      const { id, error } = data as { id: string; error: string };
      const pending = pendingRequests.get(id);
      if (pending) {
        pending.reject(new Error(error));
        pendingRequests.delete(id);
      }
    };

    events.on("conductor:result", resultHandler);
    events.on("conductor:error", errorHandler);

    // Store handlers for cleanup
    (events as any)._resultHandler = resultHandler;
    (events as any)._errorHandler = errorHandler;
  };

  const execute = async (
    request: ExecutionRequest,
  ): Promise<ExecutionResult> => {
    if (!events.ipc.isAvailable()) {
      throw new Error("IPC transport requires Electron renderer context");
    }

    const id = generateId();

    return new Promise((resolve, reject) => {
      pendingRequests.set(id, { resolve, reject });

      const message: IPCMessage = {
        type: "conductor:execute",
        payload: request,
        id,
      };

      // Emit event - will automatically forward to main process via IPC
      events.emit("conductor:execute", message);

      // Timeout after 5 minutes
      setTimeout(
        () => {
          if (pendingRequests.has(id)) {
            pendingRequests.delete(id);
            reject(new Error("Execution timeout"));
          }
        },
        5 * 60 * 1000,
      );
    });
  };

  const shutdown = async (): Promise<void> => {
    // Remove only conductor-specific listeners
    if ((events as any)._resultHandler) {
      events.off("conductor:result", (events as any)._resultHandler);
    }
    if ((events as any)._errorHandler) {
      events.off("conductor:error", (events as any)._errorHandler);
    }
    pendingRequests.clear();
  };

  return {
    type: "ipc",
    execute,
    initialize,
    shutdown,
  };
}
