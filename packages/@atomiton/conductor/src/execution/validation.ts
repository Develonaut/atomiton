/**
 * Node execution validation utilities
 */

import { ErrorCode } from "#types/errors";
import type { ConductorConfig, ExecutionError } from "#types";
import type { NodeDefinition } from "@atomiton/nodes/definitions";
import type { NodeExecutable } from "@atomiton/nodes/executables";

export type ValidationResult =
  | { valid: true; executable: NodeExecutable }
  | { valid: false; error: ExecutionError };

/**
 * Validate that a node can be executed with the provided configuration
 */
export function validateNodeExecution(
  node: NodeDefinition,
  config: ConductorConfig,
): ValidationResult {
  if (!config.nodeExecutorFactory) {
    return {
      valid: false,
      error: {
        nodeId: node.id,
        message: "No executor factory provided for local execution",
        timestamp: new Date(),
        code: ErrorCode.NO_EXECUTOR_FACTORY,
      },
    };
  }

  const nodeExecutable = config.nodeExecutorFactory.getNodeExecutable(
    node.type,
  );

  if (!nodeExecutable) {
    return {
      valid: false,
      error: {
        nodeId: node.id,
        message: `No implementation found for node type: ${node.type}`,
        timestamp: new Date(),
        code: ErrorCode.NODE_TYPE_NOT_FOUND,
      },
    };
  }

  return { valid: true, executable: nodeExecutable };
}
