/**
 * Loop Node Definition
 * Browser-safe configuration for loop iteration node
 */

import { createNodeDefinition } from "#core/factories/createNodeDefinition";
import createNodeMetadata from "#core/factories/createNodeMetadata";
import createNodeParameters from "#core/factories/createNodeParameters";
import type { NodeDefinition } from "#core/types/definition";
import { loopFields } from "#definitions/loop/fields";
import { loopInputPorts, loopOutputPorts } from "#definitions/loop/ports";

/**
 * Default values for loop parameters
 */
export const loopDefaults = {
  loopType: "forEach" as const,
  batchSize: 1,
  maxIterations: 1000,
  delay: 0,
  continueOnError: true,
  startValue: 0,
  endValue: 10,
  stepSize: 1,
  times: 10,
  parallel: false,
  concurrency: 5,
};

/**
 * Loop node definition (browser-safe)
 */
export const loopDefinition: NodeDefinition = createNodeDefinition({
  type: "loop",
  version: "1.0.0",
  metadata: createNodeMetadata({
    id: "loop",
    name: "Loop",
    author: "Atomiton Core Team",
    description: "Loop and iterate over data items with various strategies",
    category: "logic",
    icon: "repeat",
    keywords: [
      "loop",
      "iterate",
      "foreach",
      "while",
      "repeat",
      "batch",
      "process",
      "control",
      "iteration",
    ],
    tags: ["loop", "iterate", "control", "repeat", "iteration"],
    experimental: false,
    deprecated: false,
  }),
  parameters: createNodeParameters(loopDefaults),
  fields: loopFields,
  inputPorts: loopInputPorts,
  outputPorts: loopOutputPorts,
});

export default loopDefinition;
