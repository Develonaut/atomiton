/**
 * Shell Command Node Ports
 *
 * Input and output port definitions for the Shell Command node
 */

import { createAtomicPorts } from "../../createAtomicPorts";

export const shellCommandPorts = createAtomicPorts({
  input: [
    {
      id: "command",
      name: "Command",
      dataType: "string",
      required: false,
      multiple: false,
      description: "Shell command to execute",
    },
    {
      id: "args",
      name: "Arguments",
      dataType: "array",
      required: false,
      multiple: false,
      description: "Command arguments",
    },
  ],
  output: [
    {
      id: "stdout",
      name: "stdout",
      dataType: "string",
      required: false,
      multiple: false,
      description: "Standard output",
    },
    {
      id: "stderr",
      name: "stderr",
      dataType: "string",
      required: false,
      multiple: false,
      description: "Standard error",
    },
    {
      id: "exitCode",
      name: "Exit Code",
      dataType: "number",
      required: false,
      multiple: false,
      description: "Command exit code",
    },
    {
      id: "duration",
      name: "Duration",
      dataType: "number",
      required: false,
      multiple: false,
      description: "Command execution duration in milliseconds",
    },
    {
      id: "success",
      name: "Success",
      dataType: "boolean",
      required: false,
      multiple: false,
      description: "Whether the command executed successfully",
    },
  ],
});
