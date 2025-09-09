/**
 * Code Node
 *
 * Node for executing custom JavaScript code
 */

import { Node, NodeMetadata } from "../../base";
import type { NodeDefinition, NodePortDefinition } from "../../types";
import {
  codeConfig,
  type CodeConfig,
  defaultCodeConfig,
} from "./CodeNodeConfig";
import { CodeLogic } from "./CodeNodeLogic";

/**
 * Code Node Class
 */
class CodeNode extends Node<CodeConfig> {
  readonly metadata = new NodeMetadata({
    id: "code",
    name: "JavaScript Code",
    version: "1.0.0",
    author: "Atomiton Core Team",
    description: "Execute custom JavaScript code",
    category: "data",
    type: "code",
    keywords: ["code", "javascript", "custom", "logic", "function"],
    icon: "code-2",
    experimental: false,
    deprecated: false,
  });

  readonly config = codeConfig;

  readonly logic = new CodeLogic();

  readonly definition: NodeDefinition = {
    id: "code",
    name: "JavaScript Code",
    description: "Execute custom JavaScript code",
    category: "logic",
    type: "code",
    version: "1.0.0",

    inputPorts: [
      {
        id: "data",
        name: "Data",
        type: "input",
        dataType: "any",
        required: false,
        multiple: false,
        description: "Input data for code execution",
      },
      {
        id: "params",
        name: "Parameters",
        type: "input",
        dataType: "object",
        required: false,
        multiple: false,
        description: "Additional parameters",
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
        description: "Code execution result",
      },
      {
        id: "success",
        name: "Success",
        type: "output",
        dataType: "boolean",
        required: true,
        multiple: false,
        description: "Execution success status",
      },
    ] as NodePortDefinition[],

    configSchema: codeConfig.getShape() as unknown as Record<string, unknown>,
    defaultConfig: defaultCodeConfig,

    metadata: {
      executionSettings: {
        timeout: 30000,
        retries: 1,
        sandbox: true,
        async: true,
      },
      author: "Atomiton Core Team",
      tags: ["code", "javascript", "custom", "logic", "function"],
      icon: "code-2",
    },

    execute: async (context) => {
      return code.execute(context);
    },
  };
}

// Export singleton instance
export const code = new CodeNode();
export default code;

// Export types and schemas for external use
export { codeConfigSchema, defaultCodeConfig } from "./CodeNodeConfig";
export type { CodeConfig } from "./CodeNodeConfig";
export { CodeLogic } from "./CodeNodeLogic";
