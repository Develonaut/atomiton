/**
 * Group Node Executable
 * Node.js implementation with group workflow execution logic
 */

import { createNodeExecutable } from "#core/factories/createNodeExecutable";
import type {
  NodeExecutable,
  NodeExecutionContext,
  NodeExecutionResult,
} from "#core/types/executable";
import type { GroupParameters } from "#schemas/group";
import {
  type GroupGraph,
  executeParallel,
  executeSequential,
} from "#executables/group/operations";

export type GroupOutput = {
  result: unknown;
  metadata: {
    executedAt: string;
    nodeId: string;
    nodeType: string;
    childNodesExecuted: number;
    totalExecutionTime: number;
    failedNode?: string;
  };
};

/**
 * Group node executable
 */
export const groupExecutable: NodeExecutable<GroupParameters> =
  createNodeExecutable({
    async execute(
      context: NodeExecutionContext,
      config: GroupParameters,
    ): Promise<NodeExecutionResult> {
      const startTime = Date.now();

      try {
        // Get group graph from context metadata
        const graph = context.metadata?.graph as GroupGraph | undefined;

        if (!graph || !graph.nodes || graph.nodes.length === 0) {
          context.log?.info?.("Group node has no child nodes to execute");

          return {
            success: true,
            outputs: {
              result: context.inputs,
              metadata: {
                executedAt: new Date().toISOString(),
                nodeId: context.nodeId || "group",
                nodeType: "group",
                childNodesExecuted: 0,
                totalExecutionTime: Date.now() - startTime,
              },
            },
          };
        }

        context.log?.info?.(
          `Executing group with ${graph.nodes.length} child nodes`,
          {
            parallel: config.parallel,
            timeout: config.timeout,
            retries: config.retries,
          },
        );

        // Execute based on parallel setting
        if (config.parallel) {
          return await executeParallel(graph, context, config);
        } else {
          return await executeSequential(graph, context, config);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        context.log?.error?.("Group execution failed", {
          error: errorMessage,
          config,
        });

        return {
          success: false,
          error: errorMessage,
          outputs: {
            result: undefined,
            metadata: {
              executedAt: new Date().toISOString(),
              nodeId: context.nodeId || "group",
              nodeType: "group",
              childNodesExecuted: 0,
              totalExecutionTime: Date.now() - startTime,
            },
          },
        };
      }
    },

    validateConfig(config: unknown): GroupParameters {
      // In a real implementation, this would validate using the schema
      // For now, just cast it
      return config as GroupParameters;
    },
  });

export default groupExecutable;
