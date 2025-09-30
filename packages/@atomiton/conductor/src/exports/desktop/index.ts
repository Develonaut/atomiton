/**
 * Desktop-specific conductor exports
 * Includes full local execution capabilities with Node.js support
 */

import { createConductor as createBaseConductor } from "#conductor";
import type { ConductorConfig, NodeExecutorFactory } from "#types";
import { getNodeExecutable } from "@atomiton/nodes/executables";

export type {
  ConductorExecutionContext,
  ExecutionError,
  ExecutionResult,
  ExecutionStatus,
  NodeExecutorFactory,
} from "#types/execution";

export type {
  ConductorTransport,
  HealthResult,
  TransportConfig,
} from "#types/transport";

export type { ConductorConfig } from "#types";

/**
 * Desktop conductor - just the base conductor
 * IPC setup is handled by RPC channel servers, not conductor
 */
export type DesktopConductor = ReturnType<typeof createBaseConductor>;

/**
 * Creates a desktop conductor with Node.js execution capabilities
 * No IPC methods - that's RPC's responsibility
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

  // Desktop conductor is just the base conductor
  // IPC is handled by RPC channel servers
  return createBaseConductor(fullConfig);
}
