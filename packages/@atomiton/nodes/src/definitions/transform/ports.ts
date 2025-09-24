/**
 * Transform Port Definitions
 * Input and output ports for data transformation node
 */

import { createNodePort } from "#core/factories/createNodePorts";
import type { NodePort } from "#core/types/definition";

/**
 * Input ports for transform node
 */
export const transformInputPorts: NodePort[] = [
  createNodePort("input", {
    id: "data",
    name: "Data",
    dataType: "array",
    required: true,
    multiple: false,
    description: "Array of data to transform",
  }),
  createNodePort("input", {
    id: "function",
    name: "Function",
    dataType: "string",
    required: false,
    multiple: false,
    description: "Transform function (overrides parameter)",
  }),
];

/**
 * Output ports for transform node
 */
export const transformOutputPorts: NodePort[] = [
  createNodePort("output", {
    id: "result",
    name: "Result",
    dataType: "object",
    required: true,
    multiple: false,
    description: "Transformed data result",
  }),
  createNodePort("output", {
    id: "data",
    name: "Data",
    dataType: "object",
    required: false,
    multiple: false,
    description: "Transformed data (alias for result)",
  }),
  createNodePort("output", {
    id: "inputCount",
    name: "Input Count",
    dataType: "number",
    required: false,
    multiple: false,
    description: "Number of input items",
  }),
  createNodePort("output", {
    id: "outputCount",
    name: "Output Count",
    dataType: "number",
    required: false,
    multiple: false,
    description: "Number of output items",
  }),
  createNodePort("output", {
    id: "operation",
    name: "Operation",
    dataType: "string",
    required: false,
    multiple: false,
    description: "Type of transformation performed",
  }),
  createNodePort("output", {
    id: "success",
    name: "Success",
    dataType: "boolean",
    required: false,
    multiple: false,
    description: "Whether the transformation was successful",
  }),
];
