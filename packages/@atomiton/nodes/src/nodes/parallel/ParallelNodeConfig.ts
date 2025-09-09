/**
 * Parallel Configuration
 *
 * Configuration for running multiple operations simultaneously
 */

import { z } from "zod";
import { NodeConfig } from "../../base/NodeConfig";

/**
 * Parallel specific configuration schema
 */
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

  retryCount: z
    .number()
    .min(0)
    .max(5)
    .default(0)
    .describe("Number of retry attempts for failed operations"),

  retryDelay: z
    .number()
    .min(100)
    .max(10000)
    .default(1000)
    .describe("Delay between retry attempts in milliseconds"),
};

/**
 * Parallel Configuration Class
 */
class ParallelConfigClass extends NodeConfig<typeof parallelSchema> {
  constructor() {
    super(parallelSchema, {
      concurrency: 5,
      strategy: "allSettled" as const,
      operationTimeout: 30000,
      globalTimeout: 120000,
      failFast: false,
      maintainOrder: true,
      retryCount: 0,
      retryDelay: 1000,
    });
  }
}

// Create singleton instance
export const parallelConfig = new ParallelConfigClass();

// Export for backward compatibility and external use
export const parallelConfigSchema = parallelConfig.schema;
export const defaultParallelConfig = parallelConfig.defaults;
export type ParallelConfig = z.infer<typeof parallelConfig.schema>;

// Input/Output schemas for external use
export const ParallelInputSchema = z.object({
  operations: z.array(z.any()).optional(),
  data: z.any().optional(),
});

export type ParallelInput = z.infer<typeof ParallelInputSchema>;

export const ParallelOutputSchema = z.object({
  results: z.array(z.any()),
  success: z.boolean(),
  completed: z.number(),
  failed: z.number(),
  errors: z.array(z.string()).optional(),
  duration: z.number().optional(),
});

export type ParallelOutput = z.infer<typeof ParallelOutputSchema>;
