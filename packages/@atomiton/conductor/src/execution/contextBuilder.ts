/**
 * Execution context building utilities
 */

import type { ConductorExecutionContext } from "#types";
import type { NodeDefinition } from "@atomiton/nodes/definitions";
import { generateExecutionId } from "@atomiton/utils";

/**
 * Build a child execution context from parent context
 */
export function buildChildExecutionContext(
  childNode: NodeDefinition,
  parentContext: ConductorExecutionContext,
  input: Record<string, unknown>,
): ConductorExecutionContext {
  return {
    nodeId: childNode.id,
    executionId: generateExecutionId(`child_${childNode.id}`),
    variables: parentContext.variables,
    input,
    parentContext,
    slowMo: parentContext.slowMo,
    debug: parentContext.debug,
  };
}
