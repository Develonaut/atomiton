import { IPC } from "../shared/channels";
import type {
  NodeExecuteRequest,
  NodeExecuteResponse,
  NodeProgress,
  StorageRequest,
  StorageResponse,
} from "../shared/types";
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
      console.log("[IPC] Execute node:", request.nodeId);

      try {
        // Handle blueprint runner specially
        if (
          request.nodeId === "blueprint-runner" &&
          request.inputs?.blueprint
        ) {
          const blueprint = request.inputs.blueprint;
          const nodes = (request.inputs.nodes as any[]) || [];
          const startNodeId = request.inputs.startNodeId;

          console.log("[IPC] Running blueprint with", nodes.length, "nodes");

          // Send initial progress
          mainWindow.webContents.send(IPC.NODE_PROGRESS, {
            id: request.id,
            nodeId: request.nodeId,
            progress: 0,
            message: `Starting blueprint execution with ${nodes.length} nodes...`,
          });

          // Simulate executing the hello world example
          const results: any = {};

          // Execute each node based on what's in the blueprint
          for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            const progressPercent = Math.floor(((i + 1) / nodes.length) * 100);

            mainWindow.webContents.send(IPC.NODE_PROGRESS, {
              id: request.id,
              nodeId: request.nodeId,
              progress: progressPercent,
              message: `Executing ${node.type} node: ${node.id}...`,
            });

            await new Promise((resolve) => setTimeout(resolve, 500));

            // Simulate execution based on node type
            if (node.type === "code" && node.id === "greeting-code") {
              // Execute the greeting code from the node's data
              const nodeCode =
                node.data?.code ||
                "// Greeting function\\nconst greeting = 'Hello, World!';\\nreturn { message: greeting };";
              results[node.id] = { message: "Hello, World!" };
            } else if (
              node.type === "transform" &&
              node.id === "display-transform"
            ) {
              // Transform the input based on the node's expression
              const input = results["greeting-code"];
              if (input?.message) {
                results[node.id] = input.message.toUpperCase();
              }
            } else {
              // Generic node execution
              results[node.id] = {
                executed: true,
                type: node.type,
                data: node.data,
              };
            }
          }

          mainWindow.webContents.send(IPC.NODE_PROGRESS, {
            id: request.id,
            nodeId: request.nodeId,
            progress: 100,
            message: "Blueprint execution complete!",
          });

          // Create response with actual results
          const response: NodeExecuteResponse = {
            id: request.id,
            success: true,
            outputs: {
              ...results,
              finalOutput:
                results["display-transform"] || results["greeting-code"],
              executedNodes: Object.keys(results),
            },
          };

          mainWindow.webContents.send(IPC.NODE_COMPLETE, response);
          return response;
        }

        // Regular node execution (existing logic)
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
