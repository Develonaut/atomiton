/**
 * Image Composite Port Definitions
 * Input and output ports for image composite node
 */

import { createNodePort } from "#core/factories/createNodePorts";
import type { NodePort } from "#core/types/definition";

/**
 * Input ports for image composite node
 */
export const imageCompositeInputPorts: NodePort[] = [
  createNodePort("input", {
    id: "baseImage",
    name: "Base Image",
    dataType: "any",
    required: false,
    multiple: false,
    description: "Base image for overlay/composite operations",
  }),
];

/**
 * Output ports for image composite node
 */
export const imageCompositeOutputPorts: NodePort[] = [
  createNodePort("output", {
    id: "result",
    name: "Result",
    dataType: "string",
    required: true,
    multiple: false,
    description: "Path to output image file",
  }),
];
