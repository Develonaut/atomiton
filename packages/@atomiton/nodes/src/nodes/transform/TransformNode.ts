/**
 * Transform Node
 *
 * Node for transforming data, arrays, JSON, and templates
 */

import { Node, NodeMetadata } from "../../base";
import type { NodeDefinition, NodePortDefinition } from "../../types";
import {
  defaultTransformConfig,
  transformConfig,
  type TransformConfig,
} from "./TransformNodeConfig";
import { TransformLogic } from "./TransformNodeLogic";

/**
 * Transform Node Class
 */
class TransformNode extends Node<TransformConfig> {
  readonly metadata = new NodeMetadata({
    id: "transform",
    name: "Transform",
    version: "1.0.0",
    author: "Atomiton Core Team",
    description: "Transform data with JS expressions",
    category: "data",
    type: "transform",
    keywords: ["transform", "data", "map", "filter", "template", "javascript"],
    icon: "wand-2",
    experimental: false,
    deprecated: false,
  });

  readonly config = transformConfig;

  readonly logic = new TransformLogic();

  readonly definition: NodeDefinition = {
    id: "transform",
    name: "Transform",
    description: "Transform data with JS expressions",
    category: "data",
    type: "transform",
    version: "1.0.0",

    inputPorts: [
      {
        id: "data",
        name: "Data",
        type: "input",
        dataType: "any",
        required: false,
        multiple: false,
        description: "Input data to transform",
      },
      {
        id: "template",
        name: "Template",
        type: "input",
        dataType: "string",
        required: false,
        multiple: false,
        description: "Template string for transformation",
      },
      {
        id: "context",
        name: "Context",
        type: "input",
        dataType: "object",
        required: false,
        multiple: false,
        description: "Context variables for template",
      },
    ] as NodePortDefinition[],

    outputPorts: [
      {
        id: "result",
        name: "Result",
        type: "output",
        dataType: "any",
        required: true,
        multiple: false,
        description: "Transformed data result",
      },
      {
        id: "success",
        name: "Success",
        type: "output",
        dataType: "boolean",
        required: true,
        multiple: false,
        description: "Transformation success status",
      },
    ] as NodePortDefinition[],

    configSchema: transformConfig.getShape() as unknown as Record<
      string,
      unknown
    >,
    defaultConfig: defaultTransformConfig,

    metadata: {
      executionSettings: {
        timeout: 30000,
        retries: 1,
        sandbox: true,
        async: true,
      },
      author: "Atomiton Core Team",
      tags: ["transform", "data", "map", "filter", "template", "javascript"],
      icon: "wand-2",
    },

    execute: async (context) => {
      const logic = new TransformLogic();
      return logic.execute(context, context.config as TransformConfig);
    },
  };
}

// Export singleton instance
export const transform = new TransformNode();
export default transform;

// Export types and schemas for external use
export {
  defaultTransformConfig,
  transformConfigSchema,
} from "./TransformNodeConfig";
export type { TransformConfig } from "./TransformNodeConfig";
export { TransformLogic } from "./TransformNodeLogic";
