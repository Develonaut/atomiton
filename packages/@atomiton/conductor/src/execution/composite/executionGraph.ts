/**
 * Execution graph building for composite workflows
 */

import type { CompositeDefinition } from "@atomiton/nodes";
import type { ExecutionGraph } from "./types";

/**
 * Builds an execution graph for a composite definition
 */
export function buildExecutionGraph(
  composite: CompositeDefinition,
): ExecutionGraph {
  const nodeIds = composite.nodes.map((n) => n.id);
  const dependencies = new Map<string, Set<string>>();

  // Build dependency map
  nodeIds.forEach((nodeId) => dependencies.set(nodeId, new Set()));

  for (const connection of composite.edges) {
    const deps = dependencies.get(connection.target);
    if (deps) {
      deps.add(connection.source);
    }
  }

  // Find nodes that can run in parallel (no dependencies)
  const parallelizable: string[] = [];
  const sequential: string[][] = [];
  const remaining = new Set(nodeIds);

  // First level - nodes with no dependencies
  const noDeps = nodeIds.filter((id) => dependencies.get(id)!.size === 0);
  if (noDeps.length > 1) {
    parallelizable.push(...noDeps);
  } else if (noDeps.length === 1) {
    sequential.push(noDeps);
  }

  noDeps.forEach((id) => remaining.delete(id));

  // Build sequential execution levels
  while (remaining.size > 0) {
    const ready: string[] = [];

    for (const nodeId of remaining) {
      const deps = dependencies.get(nodeId)!;
      const allDepsSatisfied = Array.from(deps).every(
        (depId) => !remaining.has(depId),
      );

      if (allDepsSatisfied) {
        ready.push(nodeId);
      }
    }

    if (ready.length === 0) {
      throw new Error("Circular dependency detected in composite");
    }

    sequential.push(ready);
    ready.forEach((id) => remaining.delete(id));
  }

  return { sequential, parallelizable };
}
