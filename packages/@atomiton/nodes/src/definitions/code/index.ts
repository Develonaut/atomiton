/**
 * Code Node Definition
 * Browser-safe configuration for code execution node
 */

import { createNodeDefinition } from "#core/factories/createNodeDefinition";
import createNodeMetadata from "#core/factories/createNodeMetadata";
import createNodeParameters from "#core/factories/createNodeParameters";
import type { NodeDefinition } from "#core/types/definition";
import { codeFields } from "#definitions/code/fields";
import { codeInputPorts, codeOutputPorts } from "#definitions/code/ports";

/**
 * Default values for code execution parameters
 */
export const codeDefaults = {
  code: "input.value",
  timeout: 5000,
  returnType: "auto" as const,
  memoryLimit: 32,
};

/**
 * Code execution node definition (browser-safe)
 */
export const codeDefinition: NodeDefinition = createNodeDefinition({
  type: "code",
  version: "1.0.0",
  metadata: createNodeMetadata({
    id: "code",
    name: "Code",
    author: "Atomiton Core Team",
    description: "Execute safe JavaScript expressions with input data",
    category: "logic",
    icon: "code-2",
    keywords: [
      "code",
      "javascript",
      "js",
      "expression",
      "evaluate",
      "script",
      "logic",
      "function",
      "calculate",
      "transform",
    ],
    tags: ["code", "logic", "javascript", "expression"],
    experimental: false,
    deprecated: false,
  }),
  parameters: createNodeParameters(codeDefaults, codeFields),
  inputPorts: codeInputPorts,
  outputPorts: codeOutputPorts,
});

export default codeDefinition;
