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
  createNodePort("input", {
    id: "processor",
    name: "Processor",
    dataType: "function",
    required: false,
    multiple: false,
    description: "Function to process each item",
  }),
];

/**
 * Output ports for loop node
 */
export const loopOutputPorts: NodePort[] = [
  createNodePort("output", {
    id: "result",
    name: "Result",
    dataType: "object",
    required: true,
    multiple: false,
    description: "Loop execution result",
  }),
  createNodePort("output", {
    id: "results",
    name: "Results",
    dataType: "array",
    required: false,
    multiple: false,
    description: "Array of processed results",
  }),
  createNodePort("output", {
    id: "iterationCount",
    name: "Iteration Count",
    dataType: "number",
    required: false,
    multiple: false,
    description: "Number of iterations completed",
  }),
  createNodePort("output", {
    id: "errors",
    name: "Errors",
    dataType: "array",
    required: false,
    multiple: false,
    description: "Array of errors encountered",
  }),
  createNodePort("output", {
    id: "success",
    name: "Success",
    dataType: "boolean",
    required: false,
    multiple: false,
    description: "Whether the loop completed successfully",
  }),
  createNodePort("output", {
    id: "duration",
    name: "Duration",
    dataType: "number",
    required: false,
    multiple: false,
    description: "Total execution duration in milliseconds",
  }),
];
