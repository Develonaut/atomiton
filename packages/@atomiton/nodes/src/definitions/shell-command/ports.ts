/**
 * Shell Command Port Definitions
 * Input and output ports for shell command node
 */

import { createNodePort } from "#core/factories/createNodePorts";
import type { NodePort } from "#core/types/definition";

/**
 * Input ports for shell command node
 */
export const shellCommandInputPorts: NodePort[] = [
  createNodePort("input", {
    id: "command",
    name: "Command",
    dataType: "string",
    required: false,
    multiple: false,
    description: "Command to execute (overrides config)",
  }),
];

/**
 * Output ports for shell command node
 */
export const shellCommandOutputPorts: NodePort[] = [
  createNodePort("output", {
    id: "result",
    name: "Result",
    dataType: "object",
    required: true,
    multiple: false,
    description: "Complete execution result",
  }),
];
