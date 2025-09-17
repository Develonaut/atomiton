/**
 * Node Utility Functions
 *
 * Common utility functions for node implementations
 */

import type { NodeExecutionContext, NodeExecutionResult } from "./types";

/**
 * Create a successful execution result
 */
export function createSuccessResult(
  outputs: Record<string, unknown> | unknown,
  metadata?: Record<string, unknown>,
): NodeExecutionResult {
  const formattedOutputs =
    outputs && typeof outputs === "object" && !Array.isArray(outputs)
      ? (outputs as Record<string, unknown>)
      : { result: outputs };

  return {
    success: true,
    outputs: formattedOutputs,
    error: undefined,
    metadata: {
      executedAt: new Date().toISOString(),
      ...metadata,
    },
  };
}

/**
 * Create a failed execution result
 */
export function createErrorResult(
  error: Error | string,
  metadata?: Record<string, unknown>,
): NodeExecutionResult {
  const errorMessage = error instanceof Error ? error.message : error;
  return {
    success: false,
    outputs: undefined,
    error: errorMessage,
    metadata: {
      executedAt: new Date().toISOString(),
      ...metadata,
    },
  };
}

/**
 * Log node execution events
 */
export function logNodeExecution(
  context: NodeExecutionContext,
  level: "info" | "warn" | "error" | "debug",
  message: string,
  data?: Record<string, unknown>,
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    nodeId: context.nodeId,
    message,
    data,
  };

  if (context.log && context.log[level]) {
    context.log[level]!(message, data);
  } else if (level === "error") {
    console.error(`[ERROR]`, logEntry);
  } else if (level === "warn") {
    console.warn(`[WARN]`, logEntry);
  } else if (level === "debug") {
    console.error(`[DEBUG]`, logEntry);
  } else {
    console.error(`[INFO]`, logEntry);
  }
}

/**
 * Get input value from context
 */
export function getInputValue<T = unknown>(
  context: NodeExecutionContext,
  key: string,
): T | undefined {
  return context.inputs?.[key] as T | undefined;
}

/**
 * Get all input values from context
 */
export function getAllInputValues(
  context: NodeExecutionContext,
): Record<string, unknown> {
  return context.inputs || {};
}

/**
 * Validate required inputs
 */
export function validateRequiredInputs(
  context: NodeExecutionContext,
  required: string[],
): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  for (const key of required) {
    if (context.inputs?.[key] === undefined) {
      missing.push(key);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}
