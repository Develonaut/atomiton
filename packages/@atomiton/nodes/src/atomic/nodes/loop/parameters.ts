/**
 * Loop Node Parameters
 *
 * Parameter schema for looping and iterating over data items
 */

import { z } from "zod";
import { createAtomicParameters } from "../../createAtomicParameters";

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

export const loopParameters = createAtomicParameters(
  loopSchema,
  {
    loopType: "forEach" as const,
    batchSize: 1,
    maxIterations: 1000,
    delay: 0,
    continueOnError: true,
    startValue: 0,
    endValue: 10,
    stepSize: 1,
  },
  {
    loopType: {
      controlType: "select",
      label: "Loop Type",
      helpText: "Select the type of loop operation to perform",
      options: [
        { value: "forEach", label: "For Each Item" },
        { value: "forRange", label: "For Range" },
        { value: "while", label: "While Condition" },
        { value: "until", label: "Until Condition" },
      ],
    },
    batchSize: {
      controlType: "number",
      label: "Batch Size",
      placeholder: "1",
      helpText: "Number of items to process in each batch (1-1000)",
      min: 1,
      max: 1000,
    },
    maxIterations: {
      controlType: "number",
      label: "Max Iterations",
      placeholder: "1000",
      helpText:
        "Maximum number of iterations to prevent infinite loops (1-10000)",
      min: 1,
      max: 10000,
    },
    delay: {
      controlType: "number",
      label: "Delay (ms)",
      placeholder: "0",
      helpText: "Delay between iterations in milliseconds (0-60000)",
      min: 0,
      max: 60000,
    },
    continueOnError: {
      controlType: "boolean",
      label: "Continue On Error",
      helpText: "Continue processing remaining items if an error occurs",
    },
    condition: {
      controlType: "textarea",
      label: "Loop Condition",
      placeholder: "item.value > 0",
      helpText: "JavaScript condition for while/until loops",
      rows: 3,
    },
    startValue: {
      controlType: "number",
      label: "Start Value",
      placeholder: "0",
      helpText: "Starting value for range loops",
    },
    endValue: {
      controlType: "number",
      label: "End Value",
      placeholder: "10",
      helpText: "Ending value for range loops",
    },
    stepSize: {
      controlType: "number",
      label: "Step Size",
      placeholder: "1",
      helpText: "Step increment for range loops",
    },
  },
);

export type LoopParameters = z.infer<typeof loopParameters.schema>;
