/**
 * Parallel Schema
 * Runtime validation schema for parallel execution node
 */

import v from "@atomiton/validation";
import type { VInfer } from "@atomiton/validation";
import { baseSchema } from "#schemas/node";

/**
 * Parallel specific schema (without base fields)
 */
export const parallelSchemaShape = {
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
 * Full Parallel schema including base fields
 */
export const parallelSchema = baseSchema.extend(parallelSchemaShape);

/**
 * Type for Parallel parameters
 */
export type ParallelParameters = VInfer<typeof parallelSchema>;

/**
 * Default export for registry
 */
export default parallelSchemaShape;
