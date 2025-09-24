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
];
