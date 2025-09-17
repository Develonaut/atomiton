/**
 * Code Node Ports
 *
 * Port definitions for the Code node
 */

import { createAtomicPorts } from "../../createAtomicPorts";

export const codePorts = createAtomicPorts({
  input: [
    {
      id: "data",
      name: "Data",
      dataType: "any",
      required: false,
      multiple: false,
      description: "Input data for code execution",
    },
    {
      id: "params",
      name: "Parameters",
      dataType: "object",
      required: false,
      multiple: false,
      description: "Additional parameters",
    },
  ],
  output: [
    {
      id: "result",
      name: "Result",
      dataType: "any",
      required: true,
      multiple: false,
      description: "Code execution result",
    },
    {
      id: "success",
      name: "Success",
      dataType: "boolean",
      required: true,
      multiple: false,
      description: "Execution success status",
    },
  ],
});
