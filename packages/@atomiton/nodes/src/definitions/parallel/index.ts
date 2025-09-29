/**
 * Parallel Node Definition
 * Browser-safe configuration for parallel execution node
 */

import { createNodeDefinition } from "#core/factories/createNodeDefinition";
import createNodeMetadata from "#core/factories/createNodeMetadata";
import createNodeParameters from "#core/factories/createNodeParameters";
import { createNodePort } from "#core/factories/createNodePorts";
import type { NodeDefinition } from "#core/types/definition";
import type { NodeFieldsConfig } from "#core/types/parameters.js";

/**
 * Default values for parallel parameters
 */
export const parallelDefaults = {
  concurrency: 5,
  strategy: "allSettled" as const,
  operationTimeout: 30000,
  globalTimeout: 120000,
  failFast: false,
  maintainOrder: true,
};

/**
 * Parallel node definition (browser-safe)
 */
export const parallelFields: NodeFieldsConfig = {
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
};

export const parallelDefinition: NodeDefinition = createNodeDefinition({
  type: "parallel",
  version: "1.0.0",
  metadata: createNodeMetadata({
    id: "parallel",
    name: "Parallel",
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
  parameters: createNodeParameters(parallelDefaults),
  fields: parallelFields,
  inputPorts: [
    createNodePort("input", {
      id: "operations",
      name: "Operations",
      dataType: "array",
      required: true,
      multiple: false,
      description: "Array of operations to run in parallel",
    }),
  ],
  outputPorts: [
    createNodePort("output", {
      id: "results",
      name: "Results",
      dataType: "array",
      required: false,
      multiple: false,
      description: "Array of operation results",
    }),
  ],
});

export default parallelDefinition;
