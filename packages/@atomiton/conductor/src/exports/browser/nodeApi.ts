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
 * Create error result for node execution
 */
function createErrorResult(
  nodeId: string,
  message: string,
  code: string,
): ExecutionResult {
  return {
    success: false,
    error: {
      nodeId,
      message,
      timestamp: new Date(),
      code,
    },
    duration: 0,
    executedNodes: [],
  };
}

/**
 * Validate node definition before execution
 */
function validateNodeDefinition(node: NodeDefinition): ExecutionResult | null {
  if (!node.id || !node.type) {
    return createErrorResult(
      node.id || "unknown",
      "Invalid node definition: id and type are required",
      "INVALID_NODE",
    );
  }
  return null;
}

/**
 * Execute node with retry logic
 */
async function executeWithRetry(
  transport: ConductorTransport,
  node: NodeDefinition,
  context: ConductorExecutionContext,
): Promise<ExecutionResult> {
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

  return createErrorResult(
    node.id,
    lastError instanceof Error ? lastError.message : String(lastError),
    "EXECUTION_FAILED",
  );
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

      // Validate node definition
      const validationError = validateNodeDefinition(node);
      if (validationError) {
        return validationError;
      }

      // Check transport availability
      if (!transport) {
        return createErrorResult(
          node.id,
          "No transport available for execution in browser environment",
          "NO_TRANSPORT",
        );
      }

      // Execute with retry logic
      return executeWithRetry(transport, node, context);
    },

    /**
     * Validate a node definition
     */
    async validate(
      node: NodeDefinition,
    ): Promise<{ valid: boolean; errors: string[] }> {
      const errors: string[] = [];
      if (!node.id) errors.push("Node must have an id");
      if (!node.type) errors.push("Node must have a type");

      if (errors.length > 0) {
        return { valid: false, errors };
      }

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
