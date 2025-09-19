import { events } from "@atomiton/events/desktop";
import { createLocalTransport } from "../transport/localTransport";
import type { IPCMessage, IPCResponse } from "../transport/types";

/**
 * Electron Main Process Handler
 * Receives execution requests from renderer and executes them locally
 *
 * This runs in the Electron main process and has access to:
 * - File system
 * - Network
 * - Native APIs
 * - Full Node.js runtime
 */
export function setupMainProcessHandler(config?: {
  concurrency?: number;
  storage?: unknown;
  timeout?: number;
}) {
  // Create local transport for actual execution
  const transport = createLocalTransport(config);

  // Verify we're in main process
  if (!events.ipc?.isAvailable() || events.ipc?.getEnvironment() !== "main") {
    throw new Error(
      "Main process handler requires Electron main process context",
    );
  }

  // Listen for execution requests via global event bus
  const executeHandler = async (data: unknown) => {
    const message = data as IPCMessage;
    try {
      console.log(`[Main] Executing composite: ${message.payload.compositeId}`);

      // Execute using local transport (full Node.js access)
      const result = await transport.execute(message.payload);

      const response: IPCResponse = {
        type: "conductor:result",
        payload: result,
        id: message.id,
      };

      // Emit result - will automatically forward to renderer via IPC
      events.emit("conductor:result", response);
    } catch (error) {
      console.error("[Main] Execution error:", error);

      // Emit error - will automatically forward to renderer via IPC
      events.emit("conductor:error", {
        id: message.id,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  events.on("conductor:execute", executeHandler);

  // Store handler for cleanup
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (events as any)._executeHandler = executeHandler;

  // Cleanup handler
  const cleanup = () => {
    // Remove only conductor-specific listeners
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((events as any)._executeHandler) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      events.off("conductor:execute", (events as any)._executeHandler);
    }
    if (transport.shutdown) {
      transport.shutdown();
    }
  };

  return { cleanup };
}
