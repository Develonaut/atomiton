import { v4 as uuidv4 } from "uuid";
import type {
  ExecutionRequest,
  ExecutionResult,
} from "../interfaces/IExecutionEngine";
import type { IExecutionTransport, IPCMessage, IPCResponse } from "./types";

/**
 * IPC Transport for Electron Renderer Process
 * Sends execution requests to the main process via IPC
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
    if (!window.electron?.ipcRenderer) {
      throw new Error("IPC transport requires Electron renderer context");
    }

    // Listen for responses from main process
    window.electron.ipcRenderer.on(
      "conductor:result",
      (_event, response: IPCResponse) => {
        const pending = pendingRequests.get(response.id);
        if (pending) {
          pending.resolve(response.payload);
          pendingRequests.delete(response.id);
        }
      },
    );

    window.electron.ipcRenderer.on(
      "conductor:error",
      (_event, { id, error }: { id: string; error: string }) => {
        const pending = pendingRequests.get(id);
        if (pending) {
          pending.reject(new Error(error));
          pendingRequests.delete(id);
        }
      },
    );
  };

  const execute = async (
    request: ExecutionRequest,
  ): Promise<ExecutionResult> => {
    if (!window.electron?.ipcRenderer) {
      throw new Error("IPC transport requires Electron renderer context");
    }

    const id = uuidv4();

    return new Promise((resolve, reject) => {
      pendingRequests.set(id, { resolve, reject });

      const message: IPCMessage = {
        type: "conductor:execute",
        payload: request,
        id,
      };

      // Send to main process
      window.electron!.ipcRenderer.send("conductor:execute", message);

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
    if (window.electron?.ipcRenderer) {
      window.electron.ipcRenderer.removeAllListeners("conductor:result");
      window.electron.ipcRenderer.removeAllListeners("conductor:error");
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
