/**
 * Execution context building utilities
 */

import type { ConductorExecutionContext } from "#types";
import { toNodeId, createExecutionId } from "#types";
import type { NodeDefinition } from "@atomiton/nodes/definitions";

/**
 * Build a child execution context from parent context
 */
export function buildChildExecutionContext(
  childNode: NodeDefinition,
  parentContext: ConductorExecutionContext,
  input: Record<string, unknown>,
): ConductorExecutionContext {
  return {
    nodeId: toNodeId(childNode.id),
    executionId: createExecutionId(),
    variables: parentContext.variables,
    input,
    parentContext,
    slowMo: parentContext.slowMo,
    debug: parentContext.debug,
  };
}
