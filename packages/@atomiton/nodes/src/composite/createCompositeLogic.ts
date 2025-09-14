/**
 * Factory function for creating composite node execution logic
 */

import type { INode, CompositeEdge } from "../base/INode";
import type { INodeLogic } from "../base/INodeLogic";
import type { NodeExecutionContext, NodeExecutionResult } from "../types";

export type CompositeLogicInput = {
  id: string;
  nodes: INode[];
  edges: CompositeEdge[];
  settings?: {
    parallel?: boolean;
    timeout?: number;
  };
};

export function createCompositeLogic(
  input: CompositeLogicInput,
): INodeLogic<unknown> {
  return {
    getValidatedParams(context: NodeExecutionContext): unknown {
      return context.parameters || {};
    },

    async execute(
      context: NodeExecutionContext,
      _params: unknown,
    ): Promise<NodeExecutionResult> {
      try {
        const results = new Map<string, NodeExecutionResult>();
        const executed = new Set<string>();

        // Simple execution - run nodes in dependency order
        // Real implementation would topologically sort
        for (const node of input.nodes) {
          // Prepare context for child node
          const childContext: NodeExecutionContext = {
            ...context,
            inputs: {},
          };

          // Gather inputs from connected nodes
          for (const edge of input.edges) {
            if (edge.target.nodeId === node.id) {
              const sourceResult = results.get(edge.source.nodeId);
              if (sourceResult?.outputs) {
                childContext.inputs[edge.target.portId] =
                  sourceResult.outputs[edge.source.portId];
              }
            }
          }

          // Execute child node
          const result = await node.execute(childContext);
          results.set(node.id, result);
          executed.add(node.id);

          if (!result.success) {
            return {
              success: false,
              outputs: undefined,
              error: `Child node ${node.name} failed: ${result.error}`,
              metadata: {
                executedAt: new Date().toISOString(),
                nodeId: input.id,
                nodeType: `composite-${input.id}`,
              },
            };
          }
        }

        // Collect outputs from all child nodes
        const outputs: Record<string, unknown> = {};
        for (const [nodeId, result] of results) {
          if (result.outputs) {
            for (const [key, value] of Object.entries(result.outputs)) {
              outputs[`${nodeId}_${key}`] = value;
            }
          }
        }

        return {
          success: true,
          outputs,
          error: undefined,
          metadata: {
            executedAt: new Date().toISOString(),
            nodeId: input.id,
            nodeType: `composite-${input.id}`,
            childNodesExecuted: executed.size,
          },
        };
      } catch (error) {
        return {
          success: false,
          outputs: undefined,
          error: error instanceof Error ? error.message : String(error),
          metadata: {
            executedAt: new Date().toISOString(),
            nodeId: input.id,
            nodeType: `composite-${input.id}`,
          },
        };
      }
    },
  };
}
