/**
 * Loop Node Ports
 *
 * Input and output port definitions for the Loop node
 */

import { createAtomicPorts } from "../../createAtomicPorts";

export const loopPorts = createAtomicPorts({
  input: [
    {
      id: "items",
      name: "Items",
      dataType: "array",
      required: false,
      multiple: false,
      description: "Array of items to iterate over",
    },
  ],
  output: [
    {
      id: "results",
      name: "Results",
      dataType: "array",
      required: false,
      multiple: false,
      description: "Array of processed results",
    },
    {
      id: "iterationCount",
      name: "Iteration Count",
      dataType: "number",
      required: false,
      multiple: false,
      description: "Number of iterations completed",
    },
    {
      id: "errors",
      name: "Errors",
      dataType: "array",
      required: false,
      multiple: false,
      description: "Array of errors encountered",
    },
    {
      id: "success",
      name: "Success",
      dataType: "boolean",
      required: false,
      multiple: false,
      description: "Whether the loop completed successfully",
    },
  ],
});
