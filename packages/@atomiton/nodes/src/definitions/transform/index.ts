/**
 * Transform Node Definition
 * Browser-safe configuration for data transformation node
 */

import { createNodeDefinition } from "#core/factories/createNodeDefinition";
import createNodeMetadata from "#core/factories/createNodeMetadata";
import createNodeParameters from "#core/factories/createNodeParameters";
import type { NodeDefinition } from "#core/types/definition";
import type { VInfer } from "@atomiton/validation";
import v from "@atomiton/validation";
import { transformFields } from "./fields";
import { transformInputPorts, transformOutputPorts } from "./ports";
import { transformDefaults, transformSchema } from "./schema";

/**
 * Transform node definition (browser-safe)
 */
export const transformDefinition: NodeDefinition = createNodeDefinition({
  type    : "atomic",
  metadata: createNodeMetadata({
    id         : "transform",
    name       : "Transform",
    variant    : "transform",
    version    : "1.0.0",
    author     : "Atomiton Core Team",
    description: "Transform and manipulate data arrays",
    category   : "data",
    icon       : "wand-2",
    keywords   : [
      "transform",
      "map",
      "filter",
      "reduce",
      "sort",
      "group",
      "data",
      "array",
      "manipulation",
      "flatten",
      "unique",
    ],
    tags        : ["transform", "data", "array", "manipulation", "processing"],
    experimental: false,
    deprecated  : false,
  }),
  parameters: createNodeParameters(
    transformSchema,
    transformDefaults,
    transformFields
  ),
  inputPorts : transformInputPorts,
  outputPorts: transformOutputPorts,
});

export default transformDefinition;

// Create the full schema with base parameters
const fullTransformSchema = v.object({
  ...transformSchema,
  enabled    : v.boolean().default(true),
  timeout    : v.number().positive().default(30000),
  retries    : v.number().int().min(0).default(1),
  label      : v.string().optional(),
  description: v.string().optional(),
});

// Export the parameter type for use in the executable
export type TransformParameters = VInfer<typeof fullTransformSchema>;
