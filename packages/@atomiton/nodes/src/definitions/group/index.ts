/**
 * Group Node Definition
 * Browser-safe configuration for group node
 */

import { createNodeDefinition } from "#core/factories/createNodeDefinition";
import createNodeMetadata from "#core/factories/createNodeMetadata";
import createNodeParameters from "#core/factories/createNodeParameters";
import { createNodePort } from "#core/factories/createNodePorts";
import type { NodeDefinition } from "#core/types/definition";
import type { NodeFieldsConfig } from "#core/types/parameters.js";

/**
 * Default values for group parameters
 */
export const groupDefaults = {
  timeout: 30000,
  retries: 1,
  parallel: false,
};

/**
 * Field configurations for group parameters
 */
export const groupFields: NodeFieldsConfig = {
  timeout: {
    controlType: "number",
    label: "Timeout (ms)",
    helpText: "Maximum execution time in milliseconds",
    min: 1000,
    max: 300000,
  },
  retries: {
    controlType: "number",
    label: "Retries",
    helpText: "Number of retry attempts on failure",
    min: 0,
    max: 10,
  },
  parallel: {
    controlType: "boolean",
    label: "Parallel Execution",
    helpText: "Execute child nodes in parallel when possible",
  },
};

/**
 * group node definition (browser-safe)
 */
export const groupDefinition: NodeDefinition = createNodeDefinition({
  id: "group",
  name: "Group",
  type: "group",
  version: "1.0.0",

  metadata: createNodeMetadata({
    id: "group",
    name: "Group",
    author: "Atomiton Core Team",
    description: "A node that groups other nodes together",
    category: "group",
    icon: "git-branch",
    keywords: ["group", "container", "nodes", "nested", "collection"],
    tags: ["group", "container", "nodes"],
    experimental: false,
    deprecated: false,
  }),

  parameters: createNodeParameters(groupDefaults),
  fields: groupFields,

  inputPorts: [
    createNodePort("trigger", {
      id: "trigger",
      name: "Trigger",
      dataType: "any",
      required: false,
      multiple: false,
      description: "Input to trigger group execution",
    }),
  ],

  outputPorts: [
    createNodePort("output", {
      id: "result",
      name: "Result",
      dataType: "any",
      required: false,
      multiple: false,
      description: "Result from the group workflow",
    }),
  ],
});

export default groupDefinition;
