/**
 * Browser-specific conductor exports with RPC transport integration
 * Provides singleton conductor instance and factory for testing
 */

import { createAuthAPI } from "#exports/browser/authApi.js";
import { getEnvironmentInfo } from "#exports/browser/environment.js";
import { createEventsAPI } from "#exports/browser/eventsApi.js";
import { createFlowAPI } from "#exports/browser/flow.js";
import { createNodeAPI } from "#exports/browser/nodeApi.js";
import { createStorageAPI } from "#exports/browser/storageApi.js";
import { createSystemAPI } from "#exports/browser/systemApi.js";
import { createRPCTransport } from "#exports/browser/transport.js";
import type { ConductorConfig } from "#types";

// Re-export types and utilities
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

export type {
  FlowSavedEvent,
  NodeCompleteEvent,
  NodeErrorEvent,
  NodeProgressEvent,
} from "#exports/browser/types.js";

export type { NodeExecutionState } from "#execution/executionGraphStore";

export { DEFAULT_SLOWMO_MS } from "#execution/constants";

export type {
  ProgressEvent,
  ProgressNodeSnapshot,
  ProgressGraphMetadata,
} from "#types/events";
export { isValidProgressEvent } from "#types/events";

export { createExecutionId, toExecutionId } from "#types/branded";
export type { ExecutionId } from "#types/branded";

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
  const flowAPI = createFlowAPI(transport);
  const authAPI = createAuthAPI(transport);
  const systemAPI = createSystemAPI(transport);
  const eventsAPI = createEventsAPI(transport);

  // Calculate environment once for reuse
  const envInfo = getEnvironmentInfo(transport);

  return {
    node: {
      ...nodeAPI,
      // Node-specific events
      onProgress: eventsAPI.onNodeProgress,
      onComplete: eventsAPI.onNodeComplete,
      onError: eventsAPI.onNodeError,
    },
    storage: {
      ...storageAPI,
      // Storage-specific events
      onFlowSaved: eventsAPI.onFlowSaved,
    },
    flow: {
      ...flowAPI,
      // Flow event aliases (point to node events for DX)
      onProgress: eventsAPI.onNodeProgress,
      onComplete: eventsAPI.onNodeComplete,
      onError: eventsAPI.onNodeError,
    },
    auth: {
      ...authAPI,
      // Auth-specific events
      onAuthExpired: eventsAPI.onAuthExpired,
    },
    system: systemAPI,

    // Convenience boolean flags for environment checks
    inDesktop: envInfo.type === "desktop",
    inBrowser: envInfo.type === "browser",

    /**
     * Get the current execution environment information
     */
    getEnvironment() {
      return envInfo;
    },
  };
}

// Create and export singleton conductor for browser
export const conductor = createConductorInstance();

// Also export factory for testing
export const createConductor = createConductorInstance;
