/**
 * Browser-specific conductor exports
 * Only includes transport-based execution (no local Node.js execution)
 */

// Declare window global for Node.js build environments
declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    atomitonRPC?: unknown;
  }
  const window: Window | undefined;
}

import type {
  ConductorConfig,
  ConductorTransport,
  ExecutionContext,
  ExecutionResult,
  HealthResult,
} from "#types";
import type { NodeDefinition } from "@atomiton/nodes/definitions";
import { generateExecutionId, isElectronEnvironment } from "@atomiton/utils";
// Events are now internal to IPC implementation

// Re-export types and utilities
export * from "#types";

/**
 * Create execution context with defaults
 */
function createContext(
  node: NodeDefinition,
  context?: Partial<ExecutionContext>,
): ExecutionContext {
  return {
    nodeId: node.id,
    executionId: context?.executionId || generateExecutionId(),
    variables: context?.variables || {},
    input: context?.input,
    parentContext: context?.parentContext,
  };
}

/**
 * Auto-create transport if atomitonRPC is available with comprehensive logging
 */
function createAutoTransport(): ConductorTransport | undefined {
  if (!isElectronEnvironment()) {
    console.log(
      "[CONDUCTOR:BROWSER] No atomitonRPC available, running in browser-only mode",
    );
    return undefined;
  }

  const windowWithRPC = (
    typeof window !== "undefined" ? window : {}
  ) as Window & {
    atomitonRPC?: {
      node?: { run?: (...args: unknown[]) => unknown };
      system?: { health?: (...args: unknown[]) => unknown };
    };
  };

  // Check for atomitonRPC API (the only supported way to communicate with desktop)
  if (windowWithRPC.atomitonRPC) {
    console.log(
      "[CONDUCTOR:BROWSER] atomitonRPC transport detected, using Electron IPC",
    );
    return {
      async execute(node, context) {
        console.log("[CONDUCTOR:TRANSPORT] Executing node via atomitonRPC:", {
          nodeId: node.id,
          nodeType: node.type,
          executionId: context.executionId,
          hasParameters: !!node.parameters,
          parameters: node.parameters,
          timestamp: new Date().toISOString(),
        });

        try {
          const startTime = Date.now();
          const result = await windowWithRPC.atomitonRPC!.node!.run({
            node,
            context,
          });
          const duration = Date.now() - startTime;

          console.log("[CONDUCTOR:TRANSPORT] Node execution completed:", {
            nodeId: node.id,
            success: result.success,
            duration: `${duration}ms`,
            executionId: context.executionId,
            timestamp: new Date().toISOString(),
          });
          return result;
        } catch (error) {
          console.error("[CONDUCTOR:TRANSPORT] Node execution failed:", {
            nodeId: node.id,
            error: error instanceof Error ? error.message : String(error),
            executionId: context.executionId,
            timestamp: new Date().toISOString(),
          });
          throw error;
        }
      },
      async health() {
        console.log("[CONDUCTOR:TRANSPORT] Health check via atomitonRPC");
        try {
          const result = await windowWithRPC.atomitonRPC!.system!.health();
          console.log("[CONDUCTOR:TRANSPORT] Health check completed:", {
            status: result.status,
            timestamp: new Date().toISOString(),
          });
          return result;
        } catch (error) {
          console.error("[CONDUCTOR:TRANSPORT] Health check failed:", {
            error: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString(),
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

  console.warn(
    "[CONDUCTOR:TRANSPORT] No atomitonRPC API found - running without desktop transport",
  );
  return undefined;
}

/**
 * Browser conductor with structured API: conductor.node.* and conductor.system.*
 */
export function createConductor(config: ConductorConfig = {}) {
  // Auto-detect transport if not provided
  const transport = config.transport || createAutoTransport();

  if (!transport) {
    console.warn(
      "Browser conductor: No transport available. Running in browser without Electron. " +
        "All conductor.node.run() calls will return errors unless a custom transport is provided.",
    );
  }

  const nodeAPI = {
    /**
     * Execute a node definition
     */
    async run(
      node: NodeDefinition,
      contextOverrides?: Partial<ExecutionContext>,
    ): Promise<ExecutionResult> {
      const context = createContext(node, contextOverrides);

      if (!transport) {
        return {
          success: false,
          error: {
            nodeId: node.id,
            message:
              "No transport available for execution in browser environment",
            timestamp: new Date(),
            code: "NO_TRANSPORT",
          },
          duration: 0,
          executedNodes: [],
        };
      }

      return transport.execute(node, context);
    },
  };

  const systemAPI = {
    /**
     * Check system health via transport or return browser status
     */
    async health(): Promise<HealthResult> {
      if (transport?.health) {
        return transport.health();
      }

      // Fallback for browser without transport
      return {
        status: "ok",
        timestamp: Date.now(),
        message: "Browser conductor operational (no transport)",
      };
    },
  };

  return {
    node: nodeAPI,
    system: systemAPI,

    // Backward compatibility - legacy execute method
    async execute(
      node: NodeDefinition,
      contextOverrides?: Partial<ExecutionContext>,
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
