/**
 * File System Port Definitions
 * Input and output ports for file system operations node
 */

import { createNodePort } from "#core/factories/createNodePorts";
import type { NodePort } from "#core/types/definition";

/**
 * Input ports for file system node
 */
export const fileSystemInputPorts: NodePort[] = [
  createNodePort("input", {
    id: "path",
    name: "Path",
    dataType: "string",
    required: false,
    multiple: false,
    description: "File or directory path (overrides parameter)",
  }),
];

/**
 * Output ports for file system node
 */
export const fileSystemOutputPorts: NodePort[] = [
  createNodePort("output", {
    id: "result",
    name: "Result",
    dataType: "any",
    required: true,
    multiple: false,
    description: "Operation result data",
  }),
];
