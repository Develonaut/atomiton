/**
 * RPC transport for browser conductor
 * Delegates ALL transport concerns to @atomiton/rpc package
 *
 * Architectural principle: Conductor never directly accesses window.atomiton.__bridge__
 * All transport logic lives in RPC package
 */

import { createRPCTransport as createRPCTransportFromRPC } from "@atomiton/rpc/renderer";
import type { ConductorTransport, HealthResult } from "#types/transport";
import type { NodeDefinition } from "@atomiton/nodes/definitions";
import type {
  ConductorExecutionContext,
  ExecutionResult,
} from "#types/execution";

/**
 * Create RPC transport by delegating to RPC package
 * Conductor adds logging but ALL transport logic is in RPC
 * Adapts generic ExecutionTransport to conductor's specific ConductorTransport
 */
export function createRPCTransport(): ConductorTransport | undefined {
  try {
    console.log("[CONDUCTOR:BROWSER] Creating RPC transport via @atomiton/rpc");

    // RPC package handles:
    // - Environment detection (Electron/Browser/Node/Test)
    // - Bridge access via window.atomiton.__bridge__
    // - Fallback transports (WebSocket/HTTP/Memory)
    // - Error handling and retries
    const transport = createRPCTransportFromRPC();

    // Adapt generic ExecutionTransport (unknown types) to conductor's specific ConductorTransport
    return {
      execute: async (
        node: NodeDefinition,
        context: ConductorExecutionContext,
      ): Promise<ExecutionResult> => {
        console.log("[CONDUCTOR:BROWSER] Executing node via RPC:", {
          nodeId: node.id,
          nodeType: node.type,
        });
        // RPC returns unknown, we trust it matches ExecutionResult structure
        return transport.execute(node, context) as Promise<ExecutionResult>;
      },

      health: async (): Promise<HealthResult> => {
        console.log("[CONDUCTOR:BROWSER] Health check via RPC");
        // RPC returns unknown, we trust it matches HealthResult structure
        return transport.health() as Promise<HealthResult>;
      },
    };
  } catch (error) {
    console.warn(
      "[CONDUCTOR:BROWSER] RPC transport unavailable:",
      error instanceof Error ? error.message : error,
    );
    return undefined;
  }
}

// getBridge() has been removed - use window.atomiton.__bridge__ directly if needed
// For transport operations, use createRPCTransport() instead
