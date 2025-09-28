/**
 * Executable utility functions
 * Common patterns for implementing NodeExecutable
 */

import type { NodeExecutable } from "#core/types/executable";
import { getNodeSchema } from "#schemas/registry";

/**
 * Extracted parameters from the raw params object
 */
export type ExtractedParams<T = Record<string, unknown>> = {
  nodeId: string;
  executionId: string;
  input: Record<string, unknown>;
  config: T;
  context: NodeExecutionContext;
  startTime: number;
  getDuration: () => number;
  getInput: <V>(key: string) => V | undefined;
};

/**
 * Minimal context for logging during node execution
 */
export type NodeExecutionContext = {
  nodeId: string;
  executionId: string;
  metadata: Record<string, unknown> & { executionId: string };
  inputs: Record<string, unknown>;
  parameters: Record<string, unknown>;
  log: {
    info: (message: string, data?: unknown) => void;
    error: (message: string, data?: unknown) => void;
    warn: (message: string, data?: unknown) => void;
    debug: (message: string, data?: unknown) => void;
  };
};

/**
 * Extract and validate parameters from raw params object
 * Handles the common pattern of parameter extraction, validation, and context creation
 */
export function extractParams<
  T extends Record<string, unknown> = Record<string, unknown>,
>(params: unknown, nodeType: string): ExtractedParams<T> {
  const startTime = Date.now();

  // Extract base parameters
  const typedParams = params as Record<string, unknown>;
  const { nodeId, executionId, input, metadata, ...nodeParameters } =
    typedParams;

  const finalNodeId = (nodeId as string) || "";
  const finalExecutionId = (executionId as string) || "";
  const inputs = (input as Record<string, unknown>) || {};

  // Validate config using schema
  const schema = getNodeSchema(nodeType);
  if (!schema) {
    throw new Error(`Schema not found for node type: ${nodeType}`);
  }

  const configResult = schema.safeParse(nodeParameters);
  if (!configResult.success) {
    throw new Error(
      `Invalid ${nodeType} parameters: ${configResult.error?.message || "Unknown validation error"}`,
    );
  }
  const config = configResult.data as T;

  // Create minimal context for logging
  const finalMetadata = (metadata as Record<string, unknown>) || {};
  const context: NodeExecutionContext = {
    nodeId: finalNodeId,
    executionId: finalExecutionId,
    metadata: { executionId: finalExecutionId, ...finalMetadata },
    inputs,
    parameters: nodeParameters,
    log: {
      info: (message: string, data?: unknown) => {
        console.log(`[${finalNodeId}] ${message}`, data);
      },
      error: (message: string, data?: unknown) => {
        console.error(`[${finalNodeId}] ${message}`, data);
      },
      warn: (message: string, data?: unknown) => {
        console.warn(`[${finalNodeId}] ${message}`, data);
      },
      debug: (message: string, data?: unknown) => {
        // eslint-disable-next-line no-console
        console.debug(`[${finalNodeId}] ${message}`, data);
      },
    },
  };

  return {
    nodeId: finalNodeId,
    executionId: finalExecutionId,
    input: inputs,
    config,
    context,
    startTime,
    getDuration: () => Date.now() - startTime,
    getInput<V>(key: string): V | undefined {
      const inputValue = inputs[key] as V;
      if (inputValue !== undefined) return inputValue;

      // Auto-fallback to config if key exists
      if (key in config) {
        return (config as Record<string, unknown>)[key] as V;
      }
      return undefined;
    },
  };
}

/**
 * Create a NodeExecutable with automatic parameter extraction and validation
 * This factory reduces boilerplate for common executable patterns
 */
export function createExecutable<
  T extends Record<string, unknown> = Record<string, unknown>,
>(
  nodeType: string,
  executor: (params: ExtractedParams<T>) => Promise<unknown>,
): NodeExecutable {
  return {
    async execute(params: unknown): Promise<unknown> {
      const extracted = extractParams<T>(params, nodeType);

      try {
        // Simple start log
        extracted.context.log.info(`Starting ${nodeType}`, {
          nodeId: extracted.nodeId,
        });

        const result = await executor(extracted);

        // Simple completion log with duration
        extracted.context.log.info(`${nodeType} completed`, {
          nodeId: extracted.nodeId,
          duration: extracted.getDuration(),
        });

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        extracted.context.log.error(`${nodeType} failed`, {
          error: errorMessage,
          nodeId: extracted.nodeId,
          duration: extracted.getDuration(),
        });

        // Re-throw with simple context
        throw new Error(`[${nodeType}] ${errorMessage}`);
      }
    },
  };
}

/**
 * Get input value safely from the inputs object
 */
export function getInputValue<T>(
  inputs: Record<string, unknown>,
  key: string,
): T | undefined {
  return inputs[key] as T | undefined;
}
