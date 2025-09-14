/**
 * Parallel Node Ports
 *
 * Input and output port definitions for the Parallel node
 */

import { createNodePorts } from "../../base/createNodePorts";

export const parallelPorts = createNodePorts({
  input: [
    {
      id: "operations",
      name: "Operations",
      dataType: "array",
      required: true,
      multiple: false,
      description: "Array of operations to run in parallel",
    },
  ],
  output: [
    {
      id: "results",
      name: "Results",
      dataType: "array",
      required: false,
      multiple: false,
      description: "Array of operation results",
    },
    {
      id: "completed",
      name: "Completed",
      dataType: "number",
      required: false,
      multiple: false,
      description: "Number of operations completed",
    },
    {
      id: "failed",
      name: "Failed",
      dataType: "number",
      required: false,
      multiple: false,
      description: "Number of operations failed",
    },
    {
      id: "duration",
      name: "Duration",
      dataType: "number",
      required: false,
      multiple: false,
      description: "Total execution duration in milliseconds",
    },
    {
      id: "success",
      name: "Success",
      dataType: "boolean",
      required: false,
      multiple: false,
      description: "Whether all operations completed successfully",
    },
  ],
});
