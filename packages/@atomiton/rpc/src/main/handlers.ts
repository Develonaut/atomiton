import { IPC } from "#shared/channels";
import type { RPCRequest, RPCResponse } from "#shared/types";
import type { BrowserWindow } from "electron";
import { ipcMain } from "electron";

export function setupHandlers(mainWindow: BrowserWindow) {
  console.log("[IPC] Setting up handlers...");

  // Pure transport handlers
  ipcMain.handle(IPC.PING, async () => {
    console.log("[IPC] Received ping");
    return "pong";
  });

  // Generic RPC message handler - no business logic
  ipcMain.handle(
    "rpc",
    async (_event, request: RPCRequest): Promise<RPCResponse> => {
      console.log("[IPC] RPC request:", request.method);

      // Pure transport - just pass messages, no business logic
      return {
        id: request.id,
        error: {
          code: "METHOD_NOT_FOUND",
          message: "Method not found",
          data: `Method '${request.method}' not implemented in transport layer`,
        },
      };
    },
  );

  console.log("[IPC] Handlers ready");
}
