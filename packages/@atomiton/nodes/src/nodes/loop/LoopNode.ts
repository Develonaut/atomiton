/**
 * Loop Node
 *
 * Node for looping and iterating over data items
 */

import { Node, NodeMetadata } from "../../base";
import { createNodeComponent } from "../../base/components";
import type { NodeDefinition, NodePortDefinition } from "../../types";
import {
  defaultLoopConfig,
  loopConfig,
  type LoopConfig,
} from "./LoopNodeConfig";
import { LoopLogic } from "./LoopNodeLogic";

/**
 * Loop Node Class
 */
class LoopNode extends Node<LoopConfig> {
  readonly component = createNodeComponent("repeat", "Loop");

  readonly metadata = new NodeMetadata({
    id: "loop",
    name: "Loop",
    version: "1.0.0",
    author: "Atomiton Core Team",
    description: "Loop over items and execute operations",
    category: "logic",
    type: "loop",
    keywords: ["loop", "iterate", "foreach", "batch", "repeat"],
    icon: "repeat",
    experimental: false,
    deprecated: false,
  });

  readonly config = loopConfig;

  readonly logic = new LoopLogic();

  readonly definition: NodeDefinition = {
    id: "loop",
    name: "Loop",
    description: "Loop over items and execute operations",
    category: "flow",
    type: "loop",
    version: "1.0.0",

    inputPorts: [
      {
        id: "items",
        name: "Items",
        type: "input",
        dataType: "array",
        required: false,
        multiple: false,
        description: "Items to loop over",
      },
      {
        id: "data",
        name: "Data",
        type: "input",
        dataType: "any",
        required: false,
        multiple: false,
        description: "Additional data for loop",
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
        description: "Loop execution results",
      },
      {
        id: "success",
        name: "Success",
        type: "output",
        dataType: "boolean",
        required: true,
        multiple: false,
        description: "Loop success status",
      },
    ] as NodePortDefinition[],

    configSchema: loopConfig.getShape() as unknown as Record<string, unknown>,
    defaultConfig: defaultLoopConfig,

    metadata: {
      executionSettings: {
        timeout: 300000,
        retries: 1,
        sandbox: false,
        async: true,
      },
      author: "Atomiton Core Team",
      tags: ["loop", "iterate", "foreach", "batch", "repeat"],
      icon: "repeat",
    },

    execute: async (context) => {
      return loop.execute(context);
    },
  };
}

// Export singleton instance
export const loop = new LoopNode();
export default loop;

// Export types and schemas for external use
export { defaultLoopConfig, loopConfigSchema } from "./LoopNodeConfig";
export type { LoopConfig } from "./LoopNodeConfig";
export { LoopLogic } from "./LoopNodeLogic";
