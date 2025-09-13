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
    super(
      parallelSchema,
      {
        concurrency: 5,
        strategy: "allSettled" as const,
        operationTimeout: 30000,
        globalTimeout: 120000,
        failFast: false,
        maintainOrder: true,
        retryCount: 0,
        retryDelay: 1000,
      },
      {
        fields: {
          concurrency: {
            controlType: "number",
            label: "Concurrency Limit",
            placeholder: "5",
            helpText: "Maximum number of concurrent operations (1-50)",
            min: 1,
            max: 50,
          },
          strategy: {
            controlType: "select",
            label: "Execution Strategy",
            helpText: "Strategy for handling parallel operations",
            options: [
              { value: "all", label: "All - Wait for all to succeed" },
              { value: "race", label: "Race - Return first completed" },
              {
                value: "allSettled",
                label: "All Settled - Wait for all to finish",
              },
            ],
          },
          operationTimeout: {
            controlType: "number",
            label: "Operation Timeout (ms)",
            placeholder: "30000",
            helpText:
              "Timeout for each individual operation in milliseconds (1000-300000)",
            min: 1000,
            max: 300000,
          },
          globalTimeout: {
            controlType: "number",
            label: "Global Timeout (ms)",
            placeholder: "120000",
            helpText:
              "Global timeout for all parallel operations in milliseconds (5000-600000)",
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
          retryCount: {
            controlType: "number",
            label: "Retry Count",
            placeholder: "0",
            helpText: "Number of retry attempts for failed operations (0-5)",
            min: 0,
            max: 5,
          },
          retryDelay: {
            controlType: "number",
            label: "Retry Delay (ms)",
            placeholder: "1000",
            helpText:
              "Delay between retry attempts in milliseconds (100-10000)",
            min: 100,
            max: 10000,
          },
        },
      },
    );
  }
}

// Config instance is only used internally for type inference
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const parallelConfig = new ParallelConfigClass();

export type ParallelConfig = z.infer<typeof parallelConfig.schema>;
