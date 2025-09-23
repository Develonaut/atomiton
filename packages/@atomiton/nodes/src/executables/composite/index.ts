/**
 * Composite Node Executable
 * Node.js implementation with composite workflow execution logic
 */

import { createNodeExecutable } from "#core/factories/createNodeExecutable";
import type {
  NodeExecutable,
  NodeExecutionContext,
  NodeExecutionResult,
} from "#core/types/executable";
import type { CompositeParameters } from "#definitions/composite";
import {
  type CompositeGraph,
  executeParallel,
  executeSequential,
} from "#executables/composite/operations";

export type CompositeOutput = {
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
 * Composite node executable
 */
export const compositeExecutable: NodeExecutable<CompositeParameters> =
  createNodeExecutable({
    async execute(
      context: NodeExecutionContext,
      config: CompositeParameters,
    ): Promise<NodeExecutionResult> {
      const startTime = Date.now();

      try {
        // Get composite graph from context metadata
        const graph = context.metadata?.graph as CompositeGraph | undefined;

        if (!graph || !graph.nodes || graph.nodes.length === 0) {
          context.log?.info?.("Composite node has no child nodes to execute");

          return {
            success: true,
            outputs: {
              result: context.inputs,
              metadata: {
                executedAt: new Date().toISOString(),
                nodeId: context.nodeId || "composite",
                nodeType: "composite",
                childNodesExecuted: 0,
                totalExecutionTime: Date.now() - startTime,
              },
            },
          };
        }

        context.log?.info?.(
          `Executing composite with ${graph.nodes.length} child nodes`,
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

        context.log?.error?.("Composite execution failed", {
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
              nodeId: context.nodeId || "composite",
              nodeType: "composite",
              childNodesExecuted: 0,
              totalExecutionTime: Date.now() - startTime,
            },
          },
        };
      }
    },

    validateConfig(config: unknown): CompositeParameters {
      // In a real implementation, this would validate using the schema
      // For now, just cast it
      return config as CompositeParameters;
    },
  });

export default compositeExecutable;
