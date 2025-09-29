/**
 * RPC transport creation and management for browser conductor
 */

import type {
  ConductorExecutionContext,
  ConductorTransport,
  ExecutionResult,
  HealthResult,
} from "#types";
import type { NodeDefinition } from "@atomiton/nodes/definitions";
import type { AtomitonBridge } from "#exports/browser/types.js";

/**
 * Create RPC transport using the new channel-based architecture
 */
export function createRPCTransport(): ConductorTransport | undefined {
  try {
    if (typeof window !== "undefined" && window.atomitonBridge) {
      console.log(
        "[CONDUCTOR:BROWSER] Using new RPC transport with channel bridge",
      );

      const bridge = window.atomitonBridge!;

      return {
        async execute(
          node: NodeDefinition,
          context: ConductorExecutionContext,
        ): Promise<ExecutionResult> {
          console.log("[CONDUCTOR:TRANSPORT] Executing node via RPC:", {
            nodeId: node.id,
            nodeType: node.type,
            executionId: context.executionId,
          });

          try {
            const result = await bridge.call("conductor", "node:run", {
              node,
              context,
            });
            console.log("[CONDUCTOR:TRANSPORT] Node execution completed:", {
              nodeId: node.id,
              success: (result.result as ExecutionResult | undefined)?.success,
              executionId: context.executionId,
            });
            return (
              (result.result as ExecutionResult) || {
                success: false,
                error: {
                  nodeId: node.id,
                  message: "No result returned from transport",
                  timestamp: new Date(),
                  code: "NO_RESULT",
                },
                duration: 0,
                executedNodes: [],
              }
            );
          } catch (error) {
            console.error("[CONDUCTOR:TRANSPORT] Node execution failed:", {
              nodeId: node.id,
              error: error instanceof Error ? error.message : String(error),
              executionId: context.executionId,
            });
            throw error;
          }
        },

        async health(): Promise<HealthResult> {
          console.log("[CONDUCTOR:TRANSPORT] Health check via RPC");
          try {
            const result = await bridge.call("conductor", "system:health");
            console.log("[CONDUCTOR:TRANSPORT] Health check completed:", {
              status: result.status,
            });
            return (
              (result.result as HealthResult) || {
                status: "ok" as const,
                timestamp: Date.now(),
                message: "Health check successful",
              }
            );
          } catch (error) {
            console.error("[CONDUCTOR:TRANSPORT] Health check failed:", {
              error: error instanceof Error ? error.message : String(error),
            });
            return {
              status: "error" as const,
              timestamp: Date.now(),
              message:
                error instanceof Error ? error.message : "Health check failed",
            };
          }
        },
      };
    }
  } catch (error) {
    console.warn(
      "[CONDUCTOR:TRANSPORT] Failed to create RPC transport:",
      error,
    );
  }

  console.warn(
    "[CONDUCTOR:TRANSPORT] No transport available - running in browser-only mode",
  );
  return undefined;
}

/**
 * Get the bridge instance if available
 */
export function getBridge(): AtomitonBridge | undefined {
  return typeof window !== "undefined" ? window?.atomitonBridge : undefined;
}
