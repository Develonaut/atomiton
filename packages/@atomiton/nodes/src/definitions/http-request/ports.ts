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
    id         : "url",
    name       : "URL",
    dataType   : "string",
    required   : false,
    multiple   : false,
    description: "Request URL (overrides config)",
  }),
  createNodePort("input", {
    id         : "method",
    name       : "Method",
    dataType   : "string",
    required   : false,
    multiple   : false,
    description: "HTTP method (overrides config)",
  }),
  createNodePort("input", {
    id         : "headers",
    name       : "Headers",
    dataType   : "object",
    required   : false,
    multiple   : false,
    description: "Request headers (merged with config)",
  }),
  createNodePort("input", {
    id         : "body",
    name       : "Body",
    dataType   : "any",
    required   : false,
    multiple   : false,
    description: "Request body",
  }),
  createNodePort("input", {
    id         : "params",
    name       : "Query Params",
    dataType   : "object",
    required   : false,
    multiple   : false,
    description: "Query parameters to append to URL",
  }),
  createNodePort("input", {
    id         : "auth",
    name       : "Authentication",
    dataType   : "object",
    required   : false,
    multiple   : false,
    description: "Authentication credentials",
  }),
];

/**
 * Output ports for HTTP request node
 */
export const httpRequestOutputPorts: NodePort[] = [
  createNodePort("output", {
    id         : "result",
    name       : "Result",
    dataType   : "any",
    required   : true,
    multiple   : false,
    description: "Complete response object",
  }),
  createNodePort("output", {
    id         : "data",
    name       : "Data",
    dataType   : "any",
    required   : false,
    multiple   : false,
    description: "Response body data",
  }),
  createNodePort("output", {
    id         : "status",
    name       : "Status",
    dataType   : "number",
    required   : false,
    multiple   : false,
    description: "HTTP status code",
  }),
  createNodePort("output", {
    id         : "statusText",
    name       : "Status Text",
    dataType   : "string",
    required   : false,
    multiple   : false,
    description: "HTTP status text",
  }),
  createNodePort("output", {
    id         : "headers",
    name       : "Headers",
    dataType   : "object",
    required   : false,
    multiple   : false,
    description: "Response headers",
  }),
  createNodePort("output", {
    id         : "success",
    name       : "Success",
    dataType   : "boolean",
    required   : false,
    multiple   : false,
    description: "Whether the request was successful",
  }),
  createNodePort("output", {
    id         : "duration",
    name       : "Duration",
    dataType   : "number",
    required   : false,
    multiple   : false,
    description: "Request duration in milliseconds",
  }),
  createNodePort("output", {
    id         : "url",
    name       : "URL",
    dataType   : "string",
    required   : false,
    multiple   : false,
    description: "Final request URL (with params)",
  }),
  createNodePort("output", {
    id         : "ok",
    name       : "OK",
    dataType   : "boolean",
    required   : false,
    multiple   : false,
    description: "Whether response status is 2xx",
  }),
];