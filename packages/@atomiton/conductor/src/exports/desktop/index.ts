/**
 * Desktop-specific conductor exports
 * Includes full local execution capabilities with Node.js support
 * and IPC setup methods for Electron integration
 */

import { createConductor as createBaseConductor } from "#conductor";
import {
  CONDUCTOR_CHANNELS,
  logIPC,
  logIPCError,
  type NodeRunPayload,
} from "#desktop/ipc";
import type { ConductorConfig, NodeExecutorFactory } from "#types";
import type { NodeDefinition } from "@atomiton/nodes/definitions";
import { getNodeExecutable } from "@atomiton/nodes/executables";
import type { IpcMainInvokeEvent } from "electron";

// Re-export types and utilities
export { registerHandlers } from "#desktop/ipc";
export * from "#types";

/**
 * Desktop conductor with IPC setup methods
 */
export type DesktopConductor = {
  createMainHandlers(): Record<
    string,
    (...args: unknown[]) => Promise<unknown>
  >;
} & ReturnType<typeof createBaseConductor>;

/**
 * Creates a desktop conductor with Node.js execution capabilities
 * and IPC setup methods for Electron integration
 */
export function createConductor(
  config: ConductorConfig = {},
): DesktopConductor {
  const nodeExecutorFactory: NodeExecutorFactory = {
    getNodeExecutable: (nodeType) => {
      return getNodeExecutable(nodeType);
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
    createMainHandlers(): Record<
      string,
      (...args: unknown[]) => Promise<unknown>
    > {
      return {
        [CONDUCTOR_CHANNELS.NODE_RUN]: async (...args: unknown[]) => {
          const [, payload] = args as [IpcMainInvokeEvent, NodeRunPayload];
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

        [CONDUCTOR_CHANNELS.SYSTEM_HEALTH]: async (..._args: unknown[]) => {
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
