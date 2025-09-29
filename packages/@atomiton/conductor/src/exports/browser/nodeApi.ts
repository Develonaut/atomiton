/**
 * Node execution API for browser conductor
 */

import type {
  ConductorExecutionContext,
  ConductorTransport,
  ExecutionResult,
} from "#types";
import type { NodeDefinition } from "@atomiton/nodes/definitions";
import { generateExecutionId } from "@atomiton/utils";
import { getBridge } from "#exports/browser/transport.js";
import type { ValidationResult } from "#exports/browser/types.js";

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
 * Create node API with execution, validation and cancellation
 */
export function createNodeAPI(transport: ConductorTransport | undefined) {
  return {
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
          const bridge = getBridge();
          if (bridge) {
            const response = await bridge.call<ValidationResult>(
              "node",
              "validate",
              { node },
            );
            return response.result || { valid: true, errors: [] };
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
          const bridge = getBridge();
          if (bridge) {
            await bridge.call("node", "cancel", executionId);
          }
        } catch (error) {
          console.warn("[CONDUCTOR] Cancel execution failed:", error);
        }
      }
    },
  };
}
