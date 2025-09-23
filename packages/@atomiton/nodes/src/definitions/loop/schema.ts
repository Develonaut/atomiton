/**
 * Loop Schema
 * Parameter validation schema for loop node
 */

import v from "@atomiton/validation";

/**
 * Loop parameter schema
 */
export const loopSchema = {
  loopType: v
    .enum(["forEach", "forRange", "while", "doWhile", "until", "times"])
    .default("forEach")
    .describe("Type of loop operation"),

  batchSize: v
    .number()
    .min(1)
    .max(1000)
    .default(1)
    .describe("Number of items to process in each batch"),

  maxIterations: v
    .number()
    .min(1)
    .max(10000)
    .default(1000)
    .describe("Maximum number of iterations to prevent infinite loops"),

  delay: v
    .number()
    .min(0)
    .max(60000)
    .default(0)
    .describe("Delay between iterations in milliseconds"),

  continueOnError: v
    .boolean()
    .default(true)
    .describe("Continue processing remaining items if an error occurs"),

  condition: v
    .string()
    .optional()
    .describe("JavaScript condition for while/until loops"),

  startValue: v.number().default(0).describe("Starting value for range loops"),

  endValue: v.number().default(10).describe("Ending value for range loops"),

  stepSize: v.number().default(1).describe("Step size for range loops"),

  times: v
    .number()
    .min(1)
    .max(10000)
    .default(10)
    .describe("Number of times to repeat for 'times' loop type"),

  parallel: v
    .boolean()
    .default(false)
    .describe("Execute iterations in parallel"),

  concurrency: v
    .number()
    .min(1)
    .max(100)
    .default(5)
    .describe("Maximum concurrent operations for parallel execution"),
};

/**
 * Default values for loop parameters
 */
export const loopDefaults = {
  loopType       : "forEach" as const,
  batchSize      : 1,
  maxIterations  : 1000,
  delay          : 0,
  continueOnError: true,
  startValue     : 0,
  endValue       : 10,
  stepSize       : 1,
  times          : 10,
  parallel       : false,
  concurrency    : 5,
};