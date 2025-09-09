/**
 * Node Package Registry - Single Source of Truth
 *
 * This file exports all available node packages.
 * The registry consumes this to tell consumers what nodes are available.
 */

// Import all implemented node packages
import codeNode from "./code";
import csvReaderNode from "./csv-reader";
import fileSystemNode from "./file-system";
import httpRequestNode from "./http-request";
import imageCompositeNode from "./image-composite";
import loopNode from "./loop";
import parallelNode from "./parallel";
import shellCommandNode from "./shell-command";
import transformNode from "./transform";

/**
 * All available node packages
 * Add new nodes here as they're implemented
 */
export const NODES = [
  csvReaderNode,
  fileSystemNode,
  httpRequestNode,
  shellCommandNode,
  imageCompositeNode,
  transformNode,
  codeNode,
  loopNode,
  parallelNode,
];

/**
 * Export individual packages for direct import
 */
export { default as codeNode } from "./code";
export { default as csvReaderNode } from "./csv-reader";
export { default as fileSystemNode } from "./file-system";
export { default as httpRequestNode } from "./http-request";
export { default as imageCompositeNode } from "./image-composite";
export { default as loopNode } from "./loop";
export { default as parallelNode } from "./parallel";
export { default as shellCommandNode } from "./shell-command";
export { default as transformNode } from "./transform";
