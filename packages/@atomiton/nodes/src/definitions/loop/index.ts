/**
 * Loop Node Definition
 * Browser-safe configuration for loop iteration node
 */

import { createNodeDefinition } from "#core/factories/createNodeDefinition";
import createNodeMetadata from "#core/factories/createNodeMetadata";
import createNodeParameters from "#core/factories/createNodeParameters";
import { createNodePort } from "#core/factories/createNodePorts";
import type { NodeDefinition } from "#core/types/definition";
import type { VInfer } from "@atomiton/validation";
import v from "@atomiton/validation";

// Parameter schema using validation library
const loopSchema = {
  loopType: v
    .enum(["forEach", "forRange", "while", "until", "times"])
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
 * Loop node definition (browser-safe)
 */
export const loopDefinition: NodeDefinition = createNodeDefinition({
  type: "atomic",
  metadata: createNodeMetadata({
    id: "loop",
    name: "Loop",
    variant: "loop",
    version: "1.0.0",
    author: "Atomiton Core Team",
    description: "Loop and iterate over data items with various strategies",
    category: "logic",
    icon: "repeat",
    keywords: [
      "loop",
      "iterate",
      "foreach",
      "while",
      "repeat",
      "batch",
      "process",
      "control",
      "iteration",
    ],
    tags: ["loop", "iterate", "control", "repeat", "iteration"],
    experimental: false,
    deprecated: false,
  }),
  parameters: createNodeParameters(
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
      times: 10,
      parallel: false,
      concurrency: 5,
    },
    {
      loopType: {
        controlType: "select",
        label: "Loop Type",
        helpText: "Select the type of loop operation to perform",
        options: [
          { value: "forEach", label: "For Each - Iterate over array items" },
          {
            value: "forRange",
            label: "For Range - Iterate over numeric range",
          },
          { value: "times", label: "Times - Repeat N times" },
          { value: "while", label: "While - Loop while condition is true" },
          { value: "until", label: "Until - Loop until condition is true" },
        ],
      },
      batchSize: {
        controlType: "number",
        label: "Batch Size",
        helpText: "Number of items to process in each batch",
        min: 1,
        max: 1000,
      },
      maxIterations: {
        controlType: "number",
        label: "Max Iterations",
        helpText: "Maximum number of iterations to prevent infinite loops",
        min: 1,
        max: 10000,
      },
      delay: {
        controlType: "number",
        label: "Delay (ms)",
        helpText: "Delay between iterations in milliseconds",
        min: 0,
        max: 60000,
      },
      continueOnError: {
        controlType: "boolean",
        label: "Continue On Error",
        helpText: "Continue processing remaining items if an error occurs",
      },
      condition: {
        controlType: "code",
        label: "Loop Condition",
        placeholder: "iteration < 100",
        helpText: "JavaScript condition for while/until loops",
        rows: 3,
      },
      startValue: {
        controlType: "number",
        label: "Start Value",
        helpText: "Starting value for range loops",
      },
      endValue: {
        controlType: "number",
        label: "End Value",
        helpText: "Ending value for range loops",
      },
      stepSize: {
        controlType: "number",
        label: "Step Size",
        helpText: "Step increment for range loops",
      },
      times: {
        controlType: "number",
        label: "Times",
        helpText: "Number of times to repeat for 'times' loop type",
        min: 1,
        max: 10000,
      },
      parallel: {
        controlType: "boolean",
        label: "Parallel Execution",
        helpText: "Execute iterations in parallel",
      },
      concurrency: {
        controlType: "number",
        label: "Concurrency",
        helpText: "Maximum concurrent operations for parallel execution",
        min: 1,
        max: 100,
      },
    }
  ),
  inputPorts: [
    createNodePort("input", {
      id: "items",
      name: "Items",
      dataType: "array",
      required: false,
      multiple: false,
      description: "Array of items to iterate over (for forEach loops)",
    }),
    createNodePort("input", {
      id: "processor",
      name: "Processor",
      dataType: "function",
      required: false,
      multiple: false,
      description: "Function to process each item",
    }),
  ],
  outputPorts: [
    createNodePort("output", {
      id: "result",
      name: "Result",
      dataType: "object",
      required: true,
      multiple: false,
      description: "Loop execution result",
    }),
    createNodePort("output", {
      id: "results",
      name: "Results",
      dataType: "array",
      required: false,
      multiple: false,
      description: "Array of processed results",
    }),
    createNodePort("output", {
      id: "iterationCount",
      name: "Iteration Count",
      dataType: "number",
      required: false,
      multiple: false,
      description: "Number of iterations completed",
    }),
    createNodePort("output", {
      id: "errors",
      name: "Errors",
      dataType: "array",
      required: false,
      multiple: false,
      description: "Array of errors encountered",
    }),
    createNodePort("output", {
      id: "success",
      name: "Success",
      dataType: "boolean",
      required: false,
      multiple: false,
      description: "Whether the loop completed successfully",
    }),
    createNodePort("output", {
      id: "duration",
      name: "Duration",
      dataType: "number",
      required: false,
      multiple: false,
      description: "Total execution duration in milliseconds",
    }),
  ],
});

export default loopDefinition;

// Create the full schema with base parameters
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const fullLoopSchema = v.object({
  ...loopSchema,
  enabled: v.boolean().default(true),
  timeout: v.number().positive().default(30000),
  retries: v.number().int().min(0).default(1),
  label: v.string().optional(),
  description: v.string().optional(),
});

// Export the parameter type for use in the executable
export type LoopParameters = VInfer<typeof fullLoopSchema>;
