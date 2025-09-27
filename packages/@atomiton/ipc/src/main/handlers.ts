import { IPC } from "#shared/channels";
import type {
  NodeExecuteRequest,
  NodeExecuteResponse,
  NodeProgress,
  StorageRequest,
  StorageResponse,
} from "#shared/types";
import { getNodeExecutable } from "@atomiton/nodes/executables";
import type { BrowserWindow } from "electron";
import { ipcMain } from "electron";

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
      console.log(
        "[IPC] Execute node request:",
        JSON.stringify(request, null, 2),
      );

      try {
        const nodeData = request.payload?.nodeData;
        if (!nodeData) {
          throw new Error("Missing nodeData in request payload");
        }

        const nodeType = nodeData.type;
        const nodeId = nodeData.id;

        console.log(`[IPC] Executing ${nodeType} node: ${nodeId}`);

        // Get the executable for this node type
        const executable = getNodeExecutable(nodeType);
        if (!executable) {
          throw new Error(`Node type not found: ${nodeType}`);
        }

        // Send initial progress
        const initialProgress: NodeProgress = {
          id: request.id,
          nodeId: nodeId,
          progress: 0,
          message: `Starting ${nodeType} execution...`,
        };
        mainWindow.webContents.send(IPC.NODE_PROGRESS, initialProgress);

        // Create execution context - use paths as provided (absolute from client or .tmp relative to desktop working dir)
        const context = {
          nodeId: nodeId,
          inputs: {}, // No inputs for file-system nodes
          parameters: nodeData.config,
          log: {
            info: (message: string, meta?: any) =>
              console.log(`[NODE] ${message}`, meta),
            error: (message: string, meta?: any) =>
              console.error(`[NODE] ${message}`, meta),
          },
        };

        // Send progress update
        mainWindow.webContents.send(IPC.NODE_PROGRESS, {
          id: request.id,
          nodeId: nodeId,
          progress: 25,
          message: "Validating configuration...",
        });

        // Get validated parameters from the execution context
        const config = executable.getValidatedParams(context);

        // Send progress update
        mainWindow.webContents.send(IPC.NODE_PROGRESS, {
          id: request.id,
          nodeId: nodeId,
          progress: 50,
          message: "Executing node...",
        });

        // Execute the node
        const result = await executable.execute(context, config);

        // Send final progress
        mainWindow.webContents.send(IPC.NODE_PROGRESS, {
          id: request.id,
          nodeId: nodeId,
          progress: 100,
          message: "Execution complete!",
        });

        // Create response
        const response: NodeExecuteResponse = {
          id: request.id,
          success: result.success,
          outputs: result.outputs,
          error: result.error,
        };

        // Send completion event
        mainWindow.webContents.send(IPC.NODE_COMPLETE, response);

        return response;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.error("[IPC] Node execution failed:", errorMessage);

        const errorResponse: NodeExecuteResponse = {
          id: request.id,
          success: false,
          error: errorMessage,
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
