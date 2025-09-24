import { createNodePort } from "#core/factories/createNodePorts";
import type { NodePort } from "#core/types/definition";

/**
 * Input ports for code execution node
 */
export const codeInputPorts: NodePort[] = [
  createNodePort("input", {
    id: "input",
    name: "Input Data",
    dataType: "any",
    required: false,
    multiple: false,
    description: "Data to pass to the code expression as 'input'",
  }),
];

/**
 * Output ports for code execution node
 */
export const codeOutputPorts: NodePort[] = [
  createNodePort("output", {
    id: "result",
    name: "Result",
    dataType: "any",
    required: true,
    multiple: false,
    description: "Result of the code execution",
  }),
];
