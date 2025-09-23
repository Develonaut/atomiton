/**
 * Parallel Node Definition
 * Browser-safe configuration for parallel execution node
 */

import v from '@atomiton/validation';
import type { VInfer } from '@atomiton/validation';
import type { NodeDefinition } from '../../core/types/definition';
import { createNodeDefinition } from '../../core/factories/createNodeDefinition';
import createNodeMetadata from '../../core/factories/createNodeMetadata';
import createNodeParameters from '../../core/factories/createNodeParameters';
import createNodePorts from '../../core/factories/createNodePorts';

// Parameter schema using validation library
const parallelSchema = {
  concurrency: v
    .number()
    .min(1)
    .max(50)
    .default(5)
    .describe("Maximum number of concurrent operations"),

  strategy: v
    .enum(["all", "race", "allSettled"])
    .default("allSettled")
    .describe("Parallel execution strategy"),

  operationTimeout: v
    .number()
    .min(1000)
    .max(300000)
    .default(30000)
    .describe("Timeout for each individual operation in milliseconds"),

  globalTimeout: v
    .number()
    .min(5000)
    .max(600000)
    .default(120000)
    .describe("Global timeout for all parallel operations in milliseconds"),

  failFast: v
    .boolean()
    .default(false)
    .describe("Stop all operations on first error"),

  maintainOrder: v
    .boolean()
    .default(true)
    .describe("Maintain input order in results"),
};

/**
 * Parallel node definition (browser-safe)
 */
export const parallelDefinition: NodeDefinition = createNodeDefinition({
  type: "atomic",
  metadata: createNodeMetadata({
    id: "parallel",
    name: "Parallel",
    variant: "parallel",
    version: "1.0.0",
    author: "Atomiton Core Team",
    description: "Run multiple operations simultaneously",
    category: "logic",
    icon: "zap",
    keywords: [
      "parallel",
      "concurrent",
      "async",
      "batch",
      "simultaneous",
      "performance",
    ],
    tags: ["parallel", "concurrent", "control", "async"],
    experimental: false,
    deprecated: false,
  }),
  parameters: createNodeParameters(
    parallelSchema,
    {
      concurrency: 5,
      strategy: "allSettled" as const,
      operationTimeout: 30000,
      globalTimeout: 120000,
      failFast: false,
      maintainOrder: true,
    },
    {
      concurrency: {
        controlType: "range",
        label: "Concurrency",
        helpText: "Maximum number of concurrent operations (1-50)",
        min: 1,
        max: 50,
      },
      strategy: {
        controlType: "select",
        label: "Strategy",
        helpText: "Parallel execution strategy",
        options: [
          { value: "all", label: "All - Fail if any fails" },
          { value: "race", label: "Race - First to complete" },
          { value: "allSettled", label: "All Settled - Complete all" },
        ],
      },
      operationTimeout: {
        controlType: "number",
        label: "Operation Timeout (ms)",
        helpText: "Timeout for each individual operation",
        min: 1000,
        max: 300000,
      },
      globalTimeout: {
        controlType: "number",
        label: "Global Timeout (ms)",
        helpText: "Global timeout for all parallel operations",
        min: 5000,
        max: 600000,
      },
      failFast: {
        controlType: "boolean",
        label: "Fail Fast",
        helpText: "Stop all operations on first error",
      },
      maintainOrder: {
        controlType: "boolean",
        label: "Maintain Order",
        helpText: "Maintain input order in results",
      },
    }
  ),
  ports: createNodePorts({
    input: [
      {
        id: "operations",
        name: "Operations",
        dataType: "array",
        required: true,
        multiple: false,
        description: "Array of operations to run in parallel",
      },
    ],
    output: [
      {
        id: "results",
        name: "Results",
        dataType: "array",
        required: false,
        multiple: false,
        description: "Array of operation results",
      },
      {
        id: "completed",
        name: "Completed",
        dataType: "number",
        required: false,
        multiple: false,
        description: "Number of operations completed",
      },
      {
        id: "failed",
        name: "Failed",
        dataType: "number",
        required: false,
        multiple: false,
        description: "Number of operations failed",
      },
      {
        id: "duration",
        name: "Duration",
        dataType: "number",
        required: false,
        multiple: false,
        description: "Total execution duration in milliseconds",
      },
      {
        id: "success",
        name: "Success",
        dataType: "boolean",
        required: false,
        multiple: false,
        description: "Whether all operations completed successfully",
      },
    ],
  }),
});

export default parallelDefinition;

// Export the parameter type for use in the executable
export type ParallelParameters = VInfer<typeof parallelDefinition.parameters.schema>;