/**
 * Parallel Node Parameters
 *
 * Parameter schema for running multiple operations simultaneously
 */

import { z } from "zod";
import { createNodeParameters } from "../../base/createNodeParameters";

const parallelSchema = {
  concurrency: z
    .number()
    .min(1)
    .max(50)
    .default(5)
    .describe("Maximum number of concurrent operations"),

  strategy: z
    .enum(["all", "race", "allSettled"])
    .default("allSettled")
    .describe("Parallel execution strategy"),

  operationTimeout: z
    .number()
    .min(1000)
    .max(300000)
    .default(30000)
    .describe("Timeout for each individual operation in milliseconds"),

  globalTimeout: z
    .number()
    .min(5000)
    .max(600000)
    .default(120000)
    .describe("Global timeout for all parallel operations in milliseconds"),

  failFast: z
    .boolean()
    .default(false)
    .describe("Stop all operations on first error"),

  maintainOrder: z
    .boolean()
    .default(true)
    .describe("Maintain input order in results"),
};

export const parallelParameters = createNodeParameters(
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
  },
);

export type ParallelParameters = z.infer<typeof parallelParameters.schema>;
