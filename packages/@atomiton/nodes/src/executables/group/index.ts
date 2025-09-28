/**
 * Group Node Executable
 * Node.js implementation with group workflow execution logic
 */

import { createExecutable } from "#core/utils/executable";
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
export const groupExecutable = createExecutable<GroupParameters>(
  "group",
  async ({ config, context, getDuration }) => {
    // Get group graph from context metadata
    const graph = context.metadata?.graph as GroupGraph | undefined;

    if (!graph || !graph.nodes || graph.nodes.length === 0) {
      context.log.info("Group node has no child nodes to execute");

      return {
        result: context.inputs,
        metadata: {
          executedAt: new Date().toISOString(),
          nodeId: context.nodeId || "group",
          nodeType: "group",
          childNodesExecuted: 0,
          totalExecutionTime: getDuration(),
        },
      };
    }

    context.log.info(`Executing group with ${graph.nodes.length} child nodes`, {
      parallel: config.parallel,
      timeout: config.timeout,
      retries: config.retries,
    });

    // Execute based on parallel setting
    if (config.parallel) {
      return await executeParallel(graph, context, config);
    } else {
      return await executeSequential(graph, context, config);
    }
  },
);

export default groupExecutable;
