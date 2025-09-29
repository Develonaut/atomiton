/**
 * Browser-specific conductor exports with RPC transport integration
 * Provides singleton conductor instance and factory for testing
 */

// Declare window global for Node.js build environments
declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    atomitonBridge?: unknown;
  }
  const window: Window | undefined;
}

import type {
  ConductorConfig,
  ConductorExecutionContext,
  ConductorTransport,
  ExecutionResult,
  HealthResult,
} from "#types";
import type { NodeDefinition } from "@atomiton/nodes/definitions";
import { generateExecutionId } from "@atomiton/utils";

// Re-export types and utilities
export * from "#types";

/**
 * Create execution context with defaults
 */
function createContext(
  node: NodeDefinition,
  context?: Partial<ConductorExecutionContext>,
): ConductorExecutionContext {
  return {
    nodeId: node.id,
    executionId: context?.executionId || generateExecutionId(),
    variables: context?.variables || {},
    input: context?.input,
    parentContext: context?.parentContext,
  };
}

/**
 * Create RPC transport using the new channel-based architecture
 */
function createRPCTransport(): ConductorTransport | undefined {
  // Dynamic import to avoid circular dependency
  try {
    // We'll use a dynamic approach to load the transport
    if (typeof window !== "undefined" && (window as any).atomitonBridge) {
      console.log(
        "[CONDUCTOR:BROWSER] Using new RPC transport with channel bridge",
      );

      // Create basic transport that uses the bridge
      const bridge = (window as any).atomitonBridge;

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
              success: result.result?.success,
              executionId: context.executionId,
            });
            return result.result || result;
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
            return result;
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
 * Browser conductor with structured API: conductor.node.* and conductor.system.*
 */
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

  const nodeAPI = {
    /**
     * Execute a node definition with business logic validation and retry
     */
    async run(
      node: NodeDefinition,
      contextOverrides?: Partial<ConductorExecutionContext>,
    ): Promise<ExecutionResult> {
      const context = createContext(node, contextOverrides);

      // Business logic: validate node before execution
      if (!node.id || !node.type) {
        return {
          success: false,
          error: {
            nodeId: node.id || "unknown",
            message: "Invalid node definition: id and type are required",
            timestamp: new Date(),
            code: "INVALID_NODE",
          },
          duration: 0,
          executedNodes: [],
        };
      }

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

      // Business logic: retry with exponential backoff
      let lastError: unknown;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          return await transport.execute(node, context);
        } catch (error) {
          lastError = error;
          if (attempt < 2) {
            const delay = 1000 * Math.pow(2, attempt);
            console.warn(
              `[CONDUCTOR] Execution attempt ${attempt + 1} failed, retrying in ${delay}ms`,
            );
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      }

      // All retries failed
      return {
        success: false,
        error: {
          nodeId: node.id,
          message:
            lastError instanceof Error ? lastError.message : String(lastError),
          timestamp: new Date(),
          code: "EXECUTION_FAILED",
        },
        duration: 0,
        executedNodes: [],
      };
    },

    /**
     * Validate a node definition
     */
    async validate(
      node: NodeDefinition,
    ): Promise<{ valid: boolean; errors: string[] }> {
      // Local validation first
      const errors: string[] = [];
      if (!node.id) errors.push("Node must have an id");
      if (!node.type) errors.push("Node must have a type");

      if (errors.length > 0) {
        return { valid: false, errors };
      }

      // Remote validation via transport
      if (transport) {
        try {
          const bridge = (window as any).atomitonBridge;
          if (bridge) {
            return await bridge.call("node", "validate", { node });
          }
        } catch (error) {
          console.warn("[CONDUCTOR] Remote validation failed:", error);
        }
      }

      return { valid: true, errors: [] };
    },

    /**
     * Cancel a running execution
     */
    async cancel(executionId: string): Promise<void> {
      if (transport) {
        try {
          const bridge = (window as any).atomitonBridge;
          if (bridge) {
            await bridge.call("node", "cancel", executionId);
          }
        } catch (error) {
          console.warn("[CONDUCTOR] Cancel execution failed:", error);
        }
      }
    },
  };

  // Storage operations
  const storageAPI = {
    async saveFlow(flow: any): Promise<any> {
      // Business logic: validate flow structure
      if (!flow.nodes || flow.nodes.length === 0) {
        throw new Error("Flow must contain at least one node");
      }

      // Business logic: add metadata
      const flowWithMetadata = {
        ...flow,
        savedAt: new Date().toISOString(),
        version: "1.0.0",
      };

      if (transport) {
        const bridge = (window as any).atomitonBridge;
        if (bridge) {
          return await bridge.call("storage", "saveFlow", {
            flow: flowWithMetadata,
          });
        }
      }

      throw new Error("No transport available for storage operations");
    },

    async loadFlow(id: string): Promise<any> {
      if (transport) {
        const bridge = (window as any).atomitonBridge;
        if (bridge) {
          const flow = await bridge.call("storage", "loadFlow", { id });

          // Business logic: migration if needed
          if (flow.version === "0.9.0") {
            return { ...flow, version: "1.0.0" }; // Simple migration
          }

          return flow;
        }
      }

      throw new Error("No transport available for storage operations");
    },

    async listFlows(options: any = {}): Promise<any> {
      if (transport) {
        const bridge = (window as any).atomitonBridge;
        if (bridge) {
          const flows = await bridge.call("storage", "listFlows", options);

          // Business logic: sorting and filtering
          return {
            ...flows,
            flows: flows.flows.filter((f: any) => !f.deleted),
          };
        }
      }

      throw new Error("No transport available for storage operations");
    },

    async deleteFlow(id: string): Promise<void> {
      if (transport) {
        const bridge = (window as any).atomitonBridge;
        if (bridge) {
          return await bridge.call("storage", "deleteFlow", { id });
        }
      }

      throw new Error("No transport available for storage operations");
    },
  };

  // Authentication operations
  const authAPI = {
    async login(credentials: {
      username: string;
      password: string;
    }): Promise<any> {
      // Business logic: validate credentials format
      if (!credentials.username || !credentials.password) {
        throw new Error("Invalid credentials");
      }

      if (transport) {
        const bridge = (window as any).atomitonBridge;
        if (bridge) {
          const result = await bridge.call("auth", "login", credentials);

          // Business logic: store token in browser
          if (
            result.token &&
            typeof window !== "undefined" &&
            (window as any).localStorage
          ) {
            (window as any).localStorage.setItem("auth_token", result.token);
          }

          return result;
        }
      }

      throw new Error("No transport available for authentication");
    },

    async logout(): Promise<void> {
      if (transport) {
        const bridge = (window as any).atomitonBridge;
        if (bridge) {
          const token =
            typeof window !== "undefined" && (window as any).localStorage
              ? (window as any).localStorage.getItem("auth_token")
              : null;
          await bridge.call("auth", "logout", { token });
        }
      }

      // Business logic: clear local state
      if (typeof window !== "undefined" && (window as any).localStorage) {
        (window as any).localStorage.removeItem("auth_token");
      }
      if (typeof window !== "undefined" && (window as any).sessionStorage) {
        (window as any).sessionStorage.clear();
      }
    },

    async getCurrentUser(): Promise<any> {
      const token =
        typeof window !== "undefined" && (window as any).localStorage
          ? (window as any).localStorage.getItem("auth_token")
          : null;
      if (!token) return null;

      if (transport) {
        const bridge = (window as any).atomitonBridge;
        if (bridge) {
          return await bridge.call("auth", "getCurrentUser");
        }
      }

      return null;
    },

    async refreshToken(): Promise<any> {
      const token =
        typeof window !== "undefined" && (window as any).localStorage
          ? (window as any).localStorage.getItem("auth_token")
          : null;
      if (!token) {
        throw new Error("No token to refresh");
      }

      if (transport) {
        const bridge = (window as any).atomitonBridge;
        if (bridge) {
          const result = await bridge.call("auth", "refreshToken", { token });

          // Update stored token
          if (
            result.token &&
            typeof window !== "undefined" &&
            (window as any).localStorage
          ) {
            (window as any).localStorage.setItem("auth_token", result.token);
          }

          return result;
        }
      }

      throw new Error("No transport available for authentication");
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

    async restart(): Promise<void> {
      // Business logic: confirm before restart
      const confirmed =
        typeof window !== "undefined" && (window as any).confirm
          ? (window as any).confirm("System will restart. Continue?")
          : false;
      if (!confirmed) return;

      if (transport) {
        const bridge = (window as any).atomitonBridge;
        if (bridge) {
          return await bridge.call("system", "restart");
        }
      }

      throw new Error("Restart not available in browser environment");
    },
  };

  // Event subscriptions
  const eventsAPI = {
    onNodeProgress: (callback: (data: any) => void) => {
      if (transport) {
        const bridge = (window as any).atomitonBridge;
        if (bridge) {
          return bridge.listen("node", "progress", callback);
        }
      }
      return () => {}; // no-op unsubscribe
    },

    onNodeComplete: (callback: (data: any) => void) => {
      if (transport) {
        const bridge = (window as any).atomitonBridge;
        if (bridge) {
          return bridge.listen("node", "completed", callback);
        }
      }
      return () => {}; // no-op unsubscribe
    },

    onNodeError: (callback: (data: any) => void) => {
      if (transport) {
        const bridge = (window as any).atomitonBridge;
        if (bridge) {
          return bridge.listen("node", "error", callback);
        }
      }
      return () => {}; // no-op unsubscribe
    },

    onAuthExpired: (callback: () => void) => {
      if (transport) {
        const bridge = (window as any).atomitonBridge;
        if (bridge) {
          return bridge.listen("auth", "sessionExpired", callback);
        }
      }
      return () => {}; // no-op unsubscribe
    },

    onFlowSaved: (callback: (data: any) => void) => {
      if (transport) {
        const bridge = (window as any).atomitonBridge;
        if (bridge) {
          return bridge.listen("storage", "flowSaved", callback);
        }
      }
      return () => {}; // no-op unsubscribe
    },
  };

  // Calculate environment once for reuse
  const envInfo = (() => {
    const hasTransport = !!transport;
    const hasBridge =
      typeof window !== "undefined" && !!(window as any).atomitonBridge;
    const type = hasBridge ? ("desktop" as const) : ("browser" as const);

    return {
      type,
      isDesktop: hasBridge,
      hasTransport,
      capabilities: {
        nodeExecution: hasTransport,
        localStorage:
          typeof window !== "undefined" && !!(window as any).localStorage,
        sessionStorage:
          typeof window !== "undefined" && !!(window as any).sessionStorage,
        fileSystem: hasBridge, // Only Electron has file system access
        cloudExecution: false, // Future: will be true for cloud environments
      },
      details: {
        userAgent:
          typeof window !== "undefined" && (window as any).navigator
            ? (window as any).navigator.userAgent
            : "unknown",
        platform:
          typeof window !== "undefined" && (window as any).navigator
            ? (window as any).navigator.platform
            : "unknown",
      },
    };
  })();

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
