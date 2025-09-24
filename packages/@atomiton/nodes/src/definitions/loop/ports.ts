/**
 * Loop Port Definitions
 * Input and output ports for loop node
 */

import { createNodePort } from "#core/factories/createNodePorts";
import type { NodePort } from "#core/types/definition";

/**
 * Input ports for loop node
 */
export const loopInputPorts: NodePort[] = [
  createNodePort("input", {
    id: "items",
    name: "Items",
    dataType: "array",
    required: false,
    multiple: false,
    description: "Array of items to iterate over (for forEach loops)",
  }),
];

/**
 * Output ports for loop node
 */
export const loopOutputPorts: NodePort[] = [
  createNodePort("output", {
    id: "results",
    name: "Results",
    dataType: "array",
    required: true,
    multiple: false,
    description: "Array of processed results",
  }),
];
