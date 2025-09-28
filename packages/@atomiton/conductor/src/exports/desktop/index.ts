/**
 * Desktop-specific conductor exports
 * Includes full local execution capabilities with Node.js support
 * and IPC setup methods for Electron integration
 */

import { createConductor as createBaseConductor } from "#conductor";
import type { ConductorConfig, NodeExecutorFactory } from "#types";
import type { IpcMainInvokeEvent } from "electron";
import type { NodeDefinition } from "@atomiton/nodes/definitions";
import { getNodeExecutable } from "@atomiton/nodes/executables";
import {
  CONDUCTOR_CHANNELS,
  logIPC,
  logIPCError,
  type NodeRunPayload,
} from "#desktop/ipc";

// Re-export types and utilities
export * from "#types";
export { registerHandlers } from "#desktop/ipc";

/**
 * Desktop conductor with IPC setup methods
 */
export interface DesktopConductor
  extends ReturnType<typeof createBaseConductor> {
  createMainHandlers(): Record<string, Function>;
}

/**
 * Creates a desktop conductor with Node.js execution capabilities
 * and IPC setup methods for Electron integration
 */
export function createConductor(
  config: ConductorConfig = {},
): DesktopConductor {
  // Create node executor factory that imports from @atomiton/nodes/executables
  // and adapts legacy executables to SimpleNodeExecutable
  const nodeExecutorFactory: NodeExecutorFactory = {
    getNodeExecutable: (nodeType) => {
      const legacyExecutable = getNodeExecutable(nodeType);
      if (!legacyExecutable) return undefined;

      // Create a SimpleNodeExecutable adapter for the legacy executable
      return {
        async execute(params: unknown) {
          // Legacy executables expect context and config separately
          // The params object has context fields (nodeId, executionId, input, etc)
          // plus the node's parameters spread directly into it
          const typedParams = params as Record<string, unknown>;
          const {
            nodeId,
            executionId,
            input,
            variables,
            parentContext,
            ...nodeParameters
          } = typedParams;

          // Only log in development
          if (process.env.NODE_ENV === "development") {
            console.log("[CONDUCTOR:ADAPTER] Execute params:", {
              nodeId,
              executionId,
              hasInput: !!input,
              nodeParameters,
              paramKeys: Object.keys(typedParams),
            });
          }

          const context = {
            nodeId: (nodeId as string) || "",
            inputs: (input as Record<string, unknown>) || {},
            parameters: nodeParameters || {},
            metadata: { executionId: (executionId as string) || "" },
          };

          // Only log in development
          if (process.env.NODE_ENV === "development") {
            console.log("[CONDUCTOR:ADAPTER] Created context:", {
              nodeId: context.nodeId,
              hasInputs: Object.keys(context.inputs).length > 0,
              parameters: context.parameters,
              metadata: context.metadata,
            });
          }

          // Get validated config
          const config = legacyExecutable.getValidatedParams(context);

          // Only log in development
          if (process.env.NODE_ENV === "development") {
            console.log("[CONDUCTOR:ADAPTER] Validated config:", config);
          }

          // Execute and return the result
          const result = await legacyExecutable.execute(context, config);

          if (result.success) {
            return result.outputs || {};
          }
          throw new Error(result.error || "Execution failed");
        },
      };
    },
  };

  // Merge the provided config with the node executor factory
  const fullConfig: ConductorConfig = {
    ...config,
    nodeExecutorFactory: config.nodeExecutorFactory || nodeExecutorFactory,
  };

  const baseConductor = createBaseConductor(fullConfig);

  // Extend with IPC methods
  const desktopConductor: DesktopConductor = {
    ...baseConductor,

    /**
     * Creates IPC handlers for the main process
     */
    createMainHandlers() {
      return {
        [CONDUCTOR_CHANNELS.NODE_RUN]: async (
          event: IpcMainInvokeEvent,
          payload: NodeRunPayload,
        ) => {
          const startTime = Date.now();
          const { node, context } = payload;

          logIPC("HANDLER:NODE", "Starting node execution", {
            nodeId: node?.id,
            nodeType: node?.type,
            executionId: context?.executionId,
          });

          try {
            // The node from IPC might be a partial object, ensure it has required fields
            const nodeDefinition: NodeDefinition = {
              ...node,
              id: node?.id || "unknown",
              type: node?.type || "unknown",
              version: node?.version || "1.0.0",
              name: node?.name || node?.type || "Untitled",
              position: node?.position || { x: 0, y: 0 },
              metadata: node?.metadata || {},
              inputs: node?.inputs || [],
              outputs: node?.outputs || [],
              parameters: node?.parameters, // Preserve node parameters
            } as unknown as NodeDefinition;

            const result = await baseConductor.node.run(
              nodeDefinition,
              context,
            );
            const duration = Date.now() - startTime;

            logIPC("HANDLER:NODE", "Node execution completed", {
              nodeId: node.id,
              success: result.success,
              duration: `${duration}ms`,
              executionId: context?.executionId,
            });

            return result;
          } catch (error) {
            const duration = Date.now() - startTime;
            logIPCError("HANDLER:NODE", "Node execution failed", error, {
              nodeId: node.id,
              duration: `${duration}ms`,
              executionId: context?.executionId,
            });
            throw error;
          }
        },

        [CONDUCTOR_CHANNELS.SYSTEM_HEALTH]: async () => {
          logIPC("HANDLER:SYSTEM", "Health check requested");

          try {
            const health = await baseConductor.system.health();
            logIPC("HANDLER:SYSTEM", "Health check completed", {
              status: health.status,
            });
            return health;
          } catch (error) {
            logIPCError("HANDLER:SYSTEM", "Health check failed", error);
            throw error;
          }
        },
      };
    },
  };

  return desktopConductor;
}
