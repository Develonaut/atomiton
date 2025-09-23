/**
 * Composite Node Definition
 * Browser-safe configuration for composite node
 */

import v from '@atomiton/validation';
import type { VInfer } from '@atomiton/validation';
import type { NodeDefinition } from '../../core/types/definition';
import { createNodeDefinition } from '../../core/factories/createNodeDefinition';
import createNodeMetadata from '../../core/factories/createNodeMetadata';
import createNodeParameters from '../../core/factories/createNodeParameters';
import createNodePorts from '../../core/factories/createNodePorts';

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
  type: "composite",
  metadata: createNodeMetadata({
    id: "composite",
    name: "Composite",
    variant: "composite",
    version: "1.0.0",
    author: "Atomiton Core Team",
    description: "A node that encapsulates a workflow of other nodes",
    category: "logic",
    icon: "git-branch",
    keywords: ["composite", "workflow", "group", "container", "orchestration"],
    tags: ["composite", "workflow", "group", "container"],
    experimental: false,
    deprecated: false,
  }),
  parameters: createNodeParameters(
    compositeSchema,
    {
      timeout: 30000,
      retries: 1,
      parallel: false,
    },
    {
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
    }
  ),
  ports: createNodePorts({
    input: [
      {
        id: "trigger",
        name: "Trigger",
        dataType: "any",
        required: false,
        multiple: false,
        description: "Input to trigger composite execution",
      },
    ],
    output: [
      {
        id: "result",
        name: "Result",
        dataType: "any",
        required: false,
        multiple: false,
        description: "Result from the composite workflow",
      },
      {
        id: "metadata",
        name: "Metadata",
        dataType: "object",
        required: false,
        multiple: false,
        description: "Execution metadata and statistics",
      },
    ],
  }),
});

export default compositeDefinition;

// Export the parameter type for use in the executable
export type CompositeParameters = VInfer<typeof compositeDefinition.parameters.schema>;