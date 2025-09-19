import { ipcMain } from "electron";
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

  // Handle execution requests from renderer
  ipcMain.on("conductor:execute", async (event, message: IPCMessage) => {
    try {
      console.log(`[Main] Executing blueprint: ${message.payload.blueprintId}`);

      // Execute using local transport (full Node.js access)
      const result = await transport.execute(message.payload);

      const response: IPCResponse = {
        type: "conductor:result",
        payload: result,
        id: message.id,
      };

      // Send result back to renderer
      event.reply("conductor:result", response);
    } catch (error) {
      console.error("[Main] Execution error:", error);

      event.reply("conductor:error", {
        id: message.id,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // Cleanup handler
  const cleanup = () => {
    ipcMain.removeAllListeners("conductor:execute");
    if (transport.shutdown) {
      transport.shutdown();
    }
  };

  return { cleanup };
}
