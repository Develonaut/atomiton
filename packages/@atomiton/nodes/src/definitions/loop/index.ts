/**
 * Loop Node Definition
 * Browser-safe configuration for loop iteration node
 */

import { createNodeDefinition } from "#core/factories/createNodeDefinition";
import createNodeMetadata from "#core/factories/createNodeMetadata";
import createNodeParameters from "#core/factories/createNodeParameters";
import type { NodeDefinition } from "#core/types/definition";
import type { VInfer } from "@atomiton/validation";
import v from "@atomiton/validation";
import { loopFields } from "#definitions/loop/fields";
import { loopInputPorts, loopOutputPorts } from "#definitions/loop/ports";
import { loopDefaults, loopSchema } from "#definitions/loop/schema";

/**
 * Loop node definition (browser-safe)
 */
export const loopDefinition: NodeDefinition = createNodeDefinition({
  type    : "atomic",
  metadata: createNodeMetadata({
    id         : "loop",
    name       : "Loop",
    variant    : "loop",
    version    : "1.0.0",
    author     : "Atomiton Core Team",
    description: "Loop and iterate over data items with various strategies",
    category   : "logic",
    icon       : "repeat",
    keywords   : [
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
    tags        : ["loop", "iterate", "control", "repeat", "iteration"],
    experimental: false,
    deprecated  : false,
  }),
  parameters : createNodeParameters(loopSchema, loopDefaults, loopFields),
  inputPorts : loopInputPorts,
  outputPorts: loopOutputPorts,
});

export default loopDefinition;

// Create the full schema with base parameters
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const fullLoopSchema = v.object({
  ...loopSchema,
  enabled    : v.boolean().default(true),
  timeout    : v.number().positive().default(30000),
  retries    : v.number().int().min(0).default(1),
  label      : v.string().optional(),
  description: v.string().optional(),
});

// Export the parameter type for use in the executable
export type LoopParameters = VInfer<typeof fullLoopSchema>;