/**
 * Conductor Transport Abstraction
 *
 * Defines how the conductor can delegate execution to different transports
 * (e.g., local, RPC, cloud, etc.)
 */

import type {
  ConductorExecutionContext,
  ExecutionResult,
} from "#types/execution";
import type { NodeDefinition } from "@atomiton/nodes/definitions";

/**
 * Health check result
 */
export type HealthResult = {
  status: "ok" | "error";
  timestamp: number;
  message?: string;
};

/**
 * Transport interface for executing nodes
 * Implementations can be local, RPC, cloud, etc.
 */
export type ConductorTransport = {
  execute(
    node: NodeDefinition,
    context: ConductorExecutionContext,
  ): Promise<ExecutionResult>;
  health?(): Promise<HealthResult>;
};

/**
 * Transport configuration options
 */
export type TransportConfig = {
  type: "local" | "rpc" | "custom";
  endpoint?: string;
  timeout?: number;
  retries?: number;
};
