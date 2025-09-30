/**
 * Loop Field Configuration
 * UI field configurations for loop parameters
 * MVP: Core loop types only
 */

import type { NodeFieldsConfig } from "#core/types/definition";

/**
 * Field configuration for loop parameters
 */
export const loopFields: NodeFieldsConfig = {
  loopType: {
    controlType: "select",
    label: "Loop Type",
    helpText: "Select the type of loop operation",
    options: [
      { value: "forEach", label: "For Each" },
      { value: "times", label: "Times" },
      { value: "while", label: "While" },
    ],
  },
  array: {
    controlType: "textarea",
    label: "Array (for forEach)",
    placeholder: "[1, 2, 3, 4, 5]",
    helpText: "Array to iterate over",
    rows: 3,
  },
  count: {
    controlType: "number",
    label: "Count (for times)",
    helpText: "Number of iterations to perform",
    min: 1,
    max: 10000,
  },
  condition: {
    controlType: "code",
    label: "Condition (for while)",
    placeholder: "iteration < 100",
    helpText: "JavaScript condition expression",
    rows: 3,
  },
  collectResults: {
    controlType: "boolean",
    label: "Collect Results",
    helpText: "Collect results from each iteration into an array",
  },
};
