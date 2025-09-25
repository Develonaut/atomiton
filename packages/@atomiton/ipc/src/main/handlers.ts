import { ipcMain, BrowserWindow } from "electron";
import { IPC } from "../shared/channels";
import type {
  NodeExecuteRequest,
  NodeExecuteResponse,
  NodeProgress,
  StorageRequest,
  StorageResponse,
} from "../shared/types";

export function setupHandlers(mainWindow: BrowserWindow) {
  console.log("[IPC] Setting up handlers...");

  // System handlers
  ipcMain.handle(IPC.PING, async () => {
    console.log("[IPC] Received ping");
    return "pong";
  });

  // Node execution handler
  ipcMain.handle(
    IPC.EXECUTE_NODE,
    async (
      _event,
      request: NodeExecuteRequest,
    ): Promise<NodeExecuteResponse> => {
      console.log("[IPC] Execute node:", request.nodeId);

      try {
        // Send initial progress
        const progress: NodeProgress = {
          id: request.id,
          nodeId: request.nodeId,
          progress: 0,
          message: "Starting execution...",
        };
        mainWindow.webContents.send(IPC.NODE_PROGRESS, progress);

        // TODO: Import and use actual node execution logic
        // const executable = getNodeExecutable(request.nodeId);
        // if (!executable) throw new Error(`Node not found: ${request.nodeId}`);

        // Simulate execution for testing
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Send progress update
        mainWindow.webContents.send(IPC.NODE_PROGRESS, {
          id: request.id,
          nodeId: request.nodeId,
          progress: 50,
          message: "Processing...",
        });

        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Create response
        const response: NodeExecuteResponse = {
          id: request.id,
          success: true,
          outputs: {
            result: "Test output from node execution",
            timestamp: Date.now(),
          },
        };

        // Send completion event
        mainWindow.webContents.send(IPC.NODE_COMPLETE, response);

        return response;
      } catch (error) {
        const errorResponse: NodeExecuteResponse = {
          id: request.id,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };

        // Send error event
        mainWindow.webContents.send(IPC.NODE_ERROR, errorResponse);

        return errorResponse;
      }
    },
  );

  // Storage handlers
  ipcMain.handle(
    IPC.STORAGE_GET,
    async (_event, request: StorageRequest): Promise<StorageResponse> => {
      console.log("[IPC] Storage get:", request.key);

      try {
        // TODO: Implement actual storage logic
        return {
          success: true,
          value: `Value for ${request.key}`,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  );

  ipcMain.handle(
    IPC.STORAGE_SET,
    async (_event, request: StorageRequest): Promise<StorageResponse> => {
      console.log("[IPC] Storage set:", request.key);

      try {
        // TODO: Implement actual storage logic
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  );

  console.log("[IPC] Handlers ready");
}
