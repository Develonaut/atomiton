/**
 * Browser-specific conductor exports with RPC transport integration
 * Provides singleton conductor instance and factory for testing
 */

import { createAuthAPI } from "#exports/browser/authApi.js";
import { getEnvironmentInfo } from "#exports/browser/environment.js";
import { createEventsAPI } from "#exports/browser/eventsApi.js";
import { createNodeAPI } from "#exports/browser/nodeApi.js";
import { createStorageAPI } from "#exports/browser/storageApi.js";
import { createSystemAPI } from "#exports/browser/systemApi.js";
import { createRPCTransport } from "#exports/browser/transport.js";
import type {
  ConductorConfig,
  ConductorExecutionContext,
  ExecutionResult,
  HealthResult,
} from "#types";
import type { NodeDefinition } from "@atomiton/nodes/definitions";

// Re-export types and utilities
export * from "#types";

/**
 * Internal factory function for creating conductor instances
 */
export function createConductorInstance(config: ConductorConfig = {}) {
  // Auto-detect transport if not provided
  const transport = config.transport || createRPCTransport();

  if (!transport) {
    console.warn(
      "Browser conductor: No transport available. Running in browser without Electron. " +
        "All conductor.node.run() calls will return errors unless a custom transport is provided.",
    );
  }

  // Create all API modules
  const nodeAPI = createNodeAPI(transport);
  const storageAPI = createStorageAPI(transport);
  const authAPI = createAuthAPI(transport);
  const systemAPI = createSystemAPI(transport);
  const eventsAPI = createEventsAPI(transport);

  // Calculate environment once for reuse
  const envInfo = getEnvironmentInfo(transport);

  return {
    node: nodeAPI,
    storage: storageAPI,
    auth: authAPI,
    system: systemAPI,
    events: eventsAPI,

    // Convenience boolean flags for environment checks
    inDesktop: envInfo.type === "desktop",
    inBrowser: envInfo.type === "browser",

    /**
     * Get the current execution environment information
     */
    getEnvironment() {
      return envInfo;
    },

    // Backward compatibility - legacy execute method
    async execute(
      node: NodeDefinition,
      contextOverrides?: Partial<ConductorExecutionContext>,
    ): Promise<ExecutionResult> {
      console.warn(
        "[Conductor] execute() is deprecated, use conductor.node.run() instead",
      );
      return nodeAPI.run(node, contextOverrides);
    },

    // Backward compatibility - legacy health method
    async health(): Promise<HealthResult> {
      console.warn(
        "[Conductor] health() is deprecated, use conductor.system.health() instead",
      );
      return systemAPI.health();
    },
  };
}

// Create and export singleton conductor for browser
export const conductor = createConductorInstance();

// Also export factory for testing
export const createConductor = createConductorInstance;
