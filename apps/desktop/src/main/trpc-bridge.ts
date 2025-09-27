import { ipcMain, type BrowserWindow } from "electron";
import { getNodeExecutable } from "@atomiton/nodes/executables";

export function createRPCBridge(window: BrowserWindow) {
  ipcMain.handle("rpc", async (event, { method, input }) => {
    const startTime = Date.now();
    console.log(`[RPC-MAIN] 🚀 Request received - Method: ${method}`, input);

    try {
      switch (method) {
        case "node.execute": {
          const { executable, context } = input;
          console.log(
            `[RPC-MAIN] 🔧 Executing ${executable.type} node: ${executable.id}`,
          );
          console.log(`[RPC-MAIN] 📝 Context variables:`, context.variables);

          // Get the executable for this node type
          const nodeExecutable = getNodeExecutable(executable.type);
          if (!nodeExecutable) {
            const error = `Node type not found: ${executable.type}`;
            console.error(`[RPC-MAIN] ❌ ${error}`);
            throw new Error(error);
          }

          console.log(
            `[RPC-MAIN] ✅ Found executable for type: ${executable.type}`,
          );

          // Create execution context using the same pattern as the IPC handlers
          const executionContext = {
            nodeId: executable.id,
            inputs: {}, // No inputs for file-system nodes
            parameters: context.variables,
            log: {
              info: (message: string, meta?: any) =>
                console.log(`[RPC-NODE] ℹ️  ${message}`, meta),
              error: (message: string, meta?: any) =>
                console.error(`[RPC-NODE] ❌ ${message}`, meta),
            },
          };

          console.log(`[RPC-MAIN] 🎯 Getting validated parameters...`);
          // Get validated parameters from the execution context
          const config = nodeExecutable.getValidatedParams(executionContext);
          console.log(`[RPC-MAIN] 📋 Validated config:`, config);

          console.log(`[RPC-MAIN] ⚡ Starting node execution...`);
          // Execute the node
          const result = await nodeExecutable.execute(executionContext, config);
          console.log(`[RPC-MAIN] 🎉 Node execution completed:`, result);

          // Return result in expected format
          const response = {
            success: result.success,
            outputs: result.outputs,
            error: result.error,
            data: result.outputs,
          };

          const duration = Date.now() - startTime;
          console.log(
            `[RPC-MAIN] ✅ node.execute completed in ${duration}ms:`,
            response,
          );
          return response;
        }

        case "flow.execute":
          console.log(
            `[RPC-MAIN] 🔄 Flow execution (delegating to node.execute)`,
          );
          // For now, treat flow execution the same as node execution
          return await ipcMain.handleOnce("rpc", {
            method: "node.execute",
            input,
          });

        case "system.health": {
          console.log(`[RPC-MAIN] 💚 Health check requested`);
          const response = {
            status: "healthy",
            platform: "desktop",
            environment: process.env.NODE_ENV || "development",
            timestamp: Date.now(),
          };
          console.log(`[RPC-MAIN] ✅ Health check response:`, response);
          return response;
        }

        case "system.info": {
          console.log(`[RPC-MAIN] ℹ️  System info requested`);
          const response = {
            platform: "desktop",
            environment: process.env.NODE_ENV || "development",
            version: "1.0.0",
          };
          console.log(`[RPC-MAIN] ✅ System info response:`, response);
          return response;
        }

        default: {
          const error = `Unknown RPC method: ${method}`;
          console.error(`[RPC-MAIN] ❌ ${error}`);
          throw new Error(error);
        }
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(
        `[RPC-MAIN] 💥 Error for method ${method} after ${duration}ms:`,
        error,
      );
      throw error;
    }
  });

  console.log("[RPC Bridge] Native RPC bridge initialized");

  return () => {
    ipcMain.removeHandler("rpc");
  };
}
