/**
 * HTTP Request Node Ports
 *
 * Input and output port definitions for the HTTP Request node
 */

import { createNodePorts } from "../../base/createNodePorts";

export const httpRequestPorts = createNodePorts({
  input: [
    {
      id: "url",
      name: "URL",
      dataType: "string",
      required: false,
      multiple: false,
      description: "Request URL",
    },
    {
      id: "method",
      name: "Method",
      dataType: "string",
      required: false,
      multiple: false,
      description: "HTTP method",
    },
    {
      id: "headers",
      name: "Headers",
      dataType: "object",
      required: false,
      multiple: false,
      description: "Request headers",
    },
    {
      id: "body",
      name: "Body",
      dataType: "string",
      required: false,
      multiple: false,
      description: "Request body",
    },
    {
      id: "params",
      name: "Parameters",
      dataType: "object",
      required: false,
      multiple: false,
      description: "URL query parameters",
    },
  ],
  output: [
    {
      id: "data",
      name: "Data",
      dataType: "any",
      required: false,
      multiple: false,
      description: "Response data",
    },
    {
      id: "status",
      name: "Status",
      dataType: "number",
      required: true,
      multiple: false,
      description: "HTTP status code",
    },
    {
      id: "headers",
      name: "Headers",
      dataType: "object",
      required: false,
      multiple: false,
      description: "Response headers",
    },
    {
      id: "success",
      name: "Success",
      dataType: "boolean",
      required: true,
      multiple: false,
      description: "Request success status",
    },
    {
      id: "duration",
      name: "Duration",
      dataType: "number",
      required: false,
      multiple: false,
      description: "Request duration in milliseconds",
    },
  ],
});
