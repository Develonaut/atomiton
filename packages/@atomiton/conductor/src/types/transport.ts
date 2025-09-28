/**
 * Conductor Transport Abstraction
 *
 * Defines how the conductor can delegate execution to different transports
 * (e.g., local, RPC, cloud, etc.)
 */

import type { ExecutionContext, ExecutionResult } from '#types/execution';
import type { NodeDefinition } from '@atomiton/nodes/definitions';

/**
 * Transport interface for executing nodes
 * Implementations can be local, RPC, cloud, etc.
 */
export type ConductorTransport = {
  execute(node: NodeDefinition, context: ExecutionContext): Promise<ExecutionResult>;
}

/**
 * Transport configuration options
 */
export type TransportConfig = {
  type: 'local' | 'rpc' | 'custom';
  endpoint?: string;
  timeout?: number;
  retries?: number;
}
