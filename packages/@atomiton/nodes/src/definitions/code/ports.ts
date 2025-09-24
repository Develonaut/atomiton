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
  createNodePort("input", {
    id: "context",
    name: "Context",
    dataType: "object",
    required: false,
    multiple: false,
    description: "Additional context variables for the expression",
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
  createNodePort("output", {
    id: "success",
    name: "Success",
    dataType: "boolean",
    required: false,
    multiple: false,
    description: "Whether execution succeeded",
  }),
  createNodePort("output", {
    id: "duration",
    name: "Duration",
    dataType: "number",
    required: false,
    multiple: false,
    description: "Execution duration in milliseconds",
  }),
  createNodePort("output", {
    id: "type",
    name: "Result Type",
    dataType: "string",
    required: false,
    multiple: false,
    description: "Actual type of the result",
  }),
];
