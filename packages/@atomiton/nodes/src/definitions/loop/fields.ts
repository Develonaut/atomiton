/**
 * Loop Field Configuration
 * UI field configurations for loop parameters
 */

import type { NodeFieldsConfig } from "#core/types/definition";

/**
 * Field configuration for loop parameters
 */
export const loopFields: NodeFieldsConfig = {
  loopType: {
    controlType: "select",
    label: "Loop Type",
    helpText: "Select the type of loop operation to perform",
    options: [
      { value: "forEach", label: "For Each - Iterate over array items" },
      { value: "forRange", label: "For Range - Iterate over numeric range" },
      { value: "times", label: "Times - Repeat N times" },
      { value: "while", label: "While - Loop while condition is true" },
      { value: "doWhile", label: "Do While - Execute then check condition" },
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
};
