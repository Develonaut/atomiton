/**
 * Transform Node Ports
 *
 * Input and output port definitions for the Transform node
 */

import { createAtomicPorts } from "../../createAtomicPorts";

export const transformPorts = createAtomicPorts({
  input: [
    {
      id: "data",
      name: "Data",
      dataType: "array",
      required: true,
      multiple: false,
      description: "Array of data to transform",
    },
  ],
  output: [
    {
      id: "data",
      name: "Data",
      dataType: "any",
      required: false,
      multiple: false,
      description: "Transformed data",
    },
    {
      id: "inputCount",
      name: "Input Count",
      dataType: "number",
      required: false,
      multiple: false,
      description: "Number of input items",
    },
    {
      id: "outputCount",
      name: "Output Count",
      dataType: "number",
      required: false,
      multiple: false,
      description: "Number of output items",
    },
    {
      id: "operation",
      name: "Operation",
      dataType: "string",
      required: false,
      multiple: false,
      description: "Type of transformation performed",
    },
    {
      id: "success",
      name: "Success",
      dataType: "boolean",
      required: false,
      multiple: false,
      description: "Whether the transformation was successful",
    },
  ],
});
