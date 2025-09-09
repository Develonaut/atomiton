/**
 * Parallel Node
 *
 * Node for running multiple operations simultaneously
 */

import { Node, NodeMetadata } from "../../base";
import type { NodeDefinition, NodePortDefinition } from "../../types";
import {
  defaultParallelConfig,
  parallelConfig,
  type ParallelConfig,
} from "./ParallelNodeConfig";
import { ParallelLogic } from "./ParallelNodeLogic";

/**
 * Parallel Node Class
 */
class ParallelNode extends Node<ParallelConfig> {
  readonly metadata = new NodeMetadata({
    id: "parallel",
    name: "Parallel Execution",
    version: "1.0.0",
    author: "Atomiton Core Team",
    description: "Run multiple operations simultaneously",
    category: "logic",
    type: "parallel",
    keywords: ["parallel", "concurrent", "async", "batch", "simultaneous"],
    icon: "zap",
    experimental: false,
    deprecated: false,
  });

  readonly config = parallelConfig;

  readonly logic = new ParallelLogic();

  readonly definition: NodeDefinition = {
    id: "parallel",
    name: "Parallel Execution",
    description: "Run multiple operations simultaneously",
    category: "flow",
    type: "parallel",
    version: "1.0.0",

    inputPorts: [
      {
        id: "operations",
        name: "Operations",
        type: "input",
        dataType: "array",
        required: false,
        multiple: false,
        description: "Operations to run in parallel",
      },
      {
        id: "data",
        name: "Data",
        type: "input",
        dataType: "any",
        required: false,
        multiple: false,
        description: "Additional data for operations",
      },
    ] as NodePortDefinition[],

    outputPorts: [
      {
        id: "results",
        name: "Results",
        type: "output",
        dataType: "array",
        required: true,
        multiple: false,
        description: "Parallel execution results",
      },
      {
        id: "success",
        name: "Success",
        type: "output",
        dataType: "boolean",
        required: true,
        multiple: false,
        description: "Parallel execution success status",
      },
    ] as NodePortDefinition[],

    configSchema: parallelConfig.getShape() as unknown as Record<
      string,
      unknown
    >,
    defaultConfig: defaultParallelConfig,

    metadata: {
      executionSettings: {
        timeout: 600000,
        retries: 1,
        sandbox: false,
        async: true,
      },
      author: "Atomiton Core Team",
      tags: ["parallel", "concurrent", "async", "batch", "simultaneous"],
      icon: "zap",
    },

    execute: async (context) => {
      return parallel.execute(context);
    },
  };
}

// Export singleton instance
export const parallel = new ParallelNode();
export default parallel;

// Export types and schemas for external use
export {
  defaultParallelConfig,
  parallelConfigSchema,
} from "./ParallelNodeConfig";
export type { ParallelConfig } from "./ParallelNodeConfig";
export { ParallelLogic } from "./ParallelNodeLogic";
