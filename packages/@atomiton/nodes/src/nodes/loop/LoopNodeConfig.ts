/**
 * Loop Configuration
 *
 * Configuration for looping and iterating over data items
 */

import { z } from "zod";
import { NodeConfig } from "../../base/NodeConfig";

/**
 * Loop specific configuration schema
 */
const loopSchema = {
  loopType: z
    .enum(["forEach", "forRange", "while", "until"])
    .default("forEach")
    .describe("Type of loop operation"),

  batchSize: z
    .number()
    .min(1)
    .max(1000)
    .default(1)
    .describe("Number of items to process in each batch"),

  maxIterations: z
    .number()
    .min(1)
    .max(10000)
    .default(1000)
    .describe("Maximum number of iterations to prevent infinite loops"),

  delay: z
    .number()
    .min(0)
    .max(60000)
    .default(0)
    .describe("Delay between iterations in milliseconds"),

  continueOnError: z
    .boolean()
    .default(true)
    .describe("Continue processing remaining items if an error occurs"),

  condition: z
    .string()
    .optional()
    .describe("JavaScript condition for while/until loops"),

  startValue: z.number().default(0).describe("Starting value for range loops"),

  endValue: z.number().default(10).describe("Ending value for range loops"),

  stepSize: z.number().default(1).describe("Step size for range loops"),
};

/**
 * Loop Configuration Class
 */
class LoopConfigClass extends NodeConfig<typeof loopSchema> {
  constructor() {
    super(loopSchema, {
      loopType: "forEach" as const,
      batchSize: 1,
      maxIterations: 1000,
      delay: 0,
      continueOnError: true,
      startValue: 0,
      endValue: 10,
      stepSize: 1,
    });
  }
}

// Create singleton instance
export const loopConfig = new LoopConfigClass();

// Export for backward compatibility and external use
export const loopConfigSchema = loopConfig.schema;
export const defaultLoopConfig = loopConfig.defaults;
export type LoopConfig = z.infer<typeof loopConfig.schema>;

// Input/Output schemas for external use
export const LoopInputSchema = z.object({
  items: z.array(z.any()).optional(),
  data: z.any().optional(),
});

export type LoopInput = z.infer<typeof LoopInputSchema>;

export const LoopOutputSchema = z.object({
  results: z.array(z.any()),
  success: z.boolean(),
  iterations: z.number(),
  errors: z.array(z.string()).optional(),
});

export type LoopOutput = z.infer<typeof LoopOutputSchema>;
