/**
 * HTTP Request Port Definitions
 * Input and output ports for HTTP request node
 */

import { createNodePort } from "#core/factories/createNodePorts";
import type { NodePort } from "#core/types/definition";

/**
 * Input ports for HTTP request node
 */
export const httpRequestInputPorts: NodePort[] = [
  createNodePort("input", {
    id: "url",
    name: "URL",
    dataType: "string",
    required: false,
    multiple: false,
    description: "Request URL (overrides config)",
  }),
];

/**
 * Output ports for HTTP request node
 */
export const httpRequestOutputPorts: NodePort[] = [
  createNodePort("output", {
    id: "result",
    name: "Result",
    dataType: "any",
    required: true,
    multiple: false,
    description: "Complete response object",
  }),
];
