/**
 * Composite Node Definition
 * Browser-safe configuration for composite node
 */

import { createNodeDefinition } from "#core/factories/createNodeDefinition";
import createNodeMetadata from "#core/factories/createNodeMetadata";
import createNodeParameters from "#core/factories/createNodeParameters";
import { createNodePort } from "#core/factories/createNodePorts";
import type { NodeDefinition } from "#core/types/definition";
import type { VInfer } from "@atomiton/validation";
import v from "@atomiton/validation";

// Parameter schema using validation library
const compositeSchema = {
  timeout: v
    .number()
    .min(1000)
    .max(300000)
    .default(30000)
    .describe("Maximum execution time in milliseconds"),

  retries: v
    .number()
    .min(0)
    .max(10)
    .default(1)
    .describe("Number of retry attempts on failure"),

  parallel: v
    .boolean()
    .default(false)
    .describe("Execute child nodes in parallel when possible"),
};

/**
 * Composite node definition (browser-safe)
 */
export const compositeDefinition: NodeDefinition = createNodeDefinition({
  id  : "composite",
  name: "Composite",
  type: "composite",

  metadata: createNodeMetadata({
    id          : "composite",
    name        : "Composite",
    variant     : "workflow",
    version     : "1.0.0",
    author      : "Atomiton Core Team",
    description : "A node that encapsulates a workflow of other nodes",
    category    : "logic",
    icon        : "git-branch",
    keywords    : ["composite", "workflow", "group", "container", "orchestration"],
    tags        : ["composite", "workflow", "group", "container"],
    experimental: false,
    deprecated  : false,
  }),

  parameters: createNodeParameters(
    compositeSchema,
    {
      timeout : 30000,
      retries : 1,
      parallel: false,
    },
    {
      timeout: {
        controlType: "number",
        label      : "Timeout (ms)",
        helpText   : "Maximum execution time in milliseconds",
        min        : 1000,
        max        : 300000,
      },
      retries: {
        controlType: "number",
        label      : "Retries",
        helpText   : "Number of retry attempts on failure",
        min        : 0,
        max        : 10,
      },
      parallel: {
        controlType: "boolean",
        label      : "Parallel Execution",
        helpText   : "Execute child nodes in parallel when possible",
      },
    }
  ),

  inputPorts: [
    createNodePort("trigger", {
      id         : "trigger",
      name       : "Trigger",
      dataType   : "any",
      required   : false,
      multiple   : false,
      description: "Input to trigger composite execution",
    }),
  ],

  outputPorts: [
    createNodePort("output", {
      id         : "result",
      name       : "Result",
      dataType   : "any",
      required   : false,
      multiple   : false,
      description: "Result from the composite workflow",
    }),
    createNodePort("output", {
      id         : "metadata",
      name       : "Metadata",
      dataType   : "object",
      required   : false,
      multiple   : false,
      description: "Execution metadata and statistics",
    }),
  ],
});

export default compositeDefinition;

// Create the full schema with base parameters
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const fullCompositeSchema = v.object({
  ...compositeSchema,
  enabled    : v.boolean().default(true),
  timeout    : v.number().positive().default(30000),
  retries    : v.number().int().min(0).default(1),
  label      : v.string().optional(),
  description: v.string().optional(),
});

// Export the parameter type for use in the executable
export type CompositeParameters = VInfer<typeof fullCompositeSchema>;
