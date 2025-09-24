/**
 * Transform Node Definition
 * Browser-safe configuration for data transformation node
 */

import { createNodeDefinition } from "#core/factories/createNodeDefinition";
import createNodeMetadata from "#core/factories/createNodeMetadata";
import createNodeParameters from "#core/factories/createNodeParameters";
import type { NodeDefinition } from "#core/types/definition";
import { transformFields } from "#definitions/transform/fields";
import {
  transformInputPorts,
  transformOutputPorts,
} from "#definitions/transform/ports";

/**
 * Default values for transform parameters
 */
export const transformDefaults = {
  operation: "map" as const,
  transformFunction: "item => item",
  sortDirection: "asc" as const,
  reduceFunction: "(acc, item) => acc + item",
  reduceInitial: "0",
  flattenDepth: 1,
};

/**
 * Transform node definition (browser-safe)
 */
export const transformDefinition: NodeDefinition = createNodeDefinition({
  metadata: createNodeMetadata({
    id: "transform",
    name: "Transform",
    type: "transform",
    version: "1.0.0",
    author: "Atomiton Core Team",
    description: "Transform and manipulate data arrays",
    category: "data",
    icon: "wand-2",
    keywords: [
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
    tags: ["transform", "data", "array", "manipulation", "processing"],
    experimental: false,
    deprecated: false,
  }),
  parameters: createNodeParameters(transformDefaults, transformFields),
  inputPorts: transformInputPorts,
  outputPorts: transformOutputPorts,
});

export default transformDefinition;
