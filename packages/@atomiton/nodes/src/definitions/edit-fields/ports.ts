/**
 * Edit Fields Port Definitions
 * Input and output ports for edit fields node
 */

import { createNodePort } from "#core/factories/createNodePorts";
import type { NodePort } from "#core/types/definition";

/**
 * Input ports for edit fields node
 */
export const editFieldsInputPorts: NodePort[] = [
  createNodePort("input", {
    id: "data",
    name: "Data",
    dataType: "object",
    required: false,
    multiple: false,
    description: "Optional input data to edit or extend",
  }),
];

/**
 * Output ports for edit fields node
 */
export const editFieldsOutputPorts: NodePort[] = [
  createNodePort("output", {
    id: "data",
    name: "Data",
    dataType: "object",
    required: true,
    multiple: false,
    description: "Output data with edited fields",
  }),
];
